import com.fasterxml.jackson.databind.ObjectMapper;
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Generative;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.WeaviateMetadata;
import io.weaviate.client6.v1.api.collections.WeaviateObject;
import org.junit.jupiter.api.Test;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class CombinedWorkflowTest {

  private final ObjectMapper objectMapper = new ObjectMapper();

  private List<String> downloadAndChunk(String srcUrl, int chunkSize,
      int overlapSize) throws Exception {
    // Retrieve source text
    URL url = URI.create(srcUrl).toURL();
    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
    conn.setRequestMethod("GET");
    String sourceText;
    try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
      sourceText = reader.lines().reduce("", String::concat);
    }

    // Remove multiple whitespaces
    sourceText = sourceText.replaceAll("\\s+", " ");
    // Split text by single whitespace
    String[] textWords = sourceText.split("\\s");

    List<String> chunks = new ArrayList<>();
    for (int i = 0; i < textWords.length; i += chunkSize) { // Iterate through & chunk data
      // Join a set of words into a string
      String[] chunkWords =
          Arrays.copyOfRange(textWords, Math.max(i - overlapSize, 0),
              Math.min(i + chunkSize, textWords.length));
      String chunk = String.join(" ", chunkWords);
      chunks.add(chunk);
    }
    return chunks;
  }
  // END ChunkText

  @Test
  void testFullWorkflow() throws Exception {
    WeaviateClient client = null;
    String gitBookCollectionName = "GitBookChunk";
    String wineCollectionName = "WineReview";

    try {
      // =================================================================
      // === Connect to Local and Setup GitBookChunk Collection ========
      // =================================================================

      // Re-instantiate for writing data (Connect to Local)
      client = WeaviateClient.connectToLocal(config -> config.setHeaders(
          Map.of("X-OpenAI-Api-Key", System.getenv("OPENAI_APIKEY"))));
      assertThat(client.isReady()).isTrue();

      // ChunkText
      String proGitChapterUrl =
          "https://raw.githubusercontent.com/progit/progit2/main/book/01-introduction/sections/what-is-git.asc";
      List<String> chunkedText = downloadAndChunk(proGitChapterUrl, 150, 25);
      assertThat(chunkedText).isNotEmpty();

      // START CreateClass
      if (client.collections.exists(gitBookCollectionName)) {
        client.collections.delete(gitBookCollectionName);
      }

      client.collections.create(gitBookCollectionName,
          col -> col.properties(Property.text("chunk"),
              Property.text("chapter_title"), Property.integer("chunk_index"))
              // highlight-start
              .vectorConfig(VectorConfig.text2vecOpenAi()) // Use `text2vec-openai` as the vectorizer
              .generativeModule(Generative.openai()) // Use `generative-openai` with default parameters
      // highlight-end
      );
      // END CreateClass
      CollectionHandle<Map<String, Object>> chunks =
          client.collections.use(gitBookCollectionName);
      assertThat(client.collections.exists(gitBookCollectionName)).isTrue();

      // START ImportData
      List<WeaviateObject<Map<String, Object>, Object, WeaviateMetadata>> chunksList =
          new ArrayList<>();
      for (int i = 0; i < chunkedText.size(); i++) {
        Map<String, Object> dataProperties = new HashMap<>();
        dataProperties.put("chapter_title", "What is Git");
        dataProperties.put("chunk", chunkedText.get(i));
        dataProperties.put("chunk_index", (long) i); // Use long for integer

        chunksList.add(WeaviateObject.of(b -> b.properties(dataProperties)));
      }
      chunks.data.insertMany(chunksList.toArray(new WeaviateObject[0]));
      // END ImportData

      // START CountObjects
      var countResponse =
          chunks.aggregate.overAll(a -> a.includeTotalCount(true));
      System.out
          .println("GitBookChunk total count: " + countResponse.totalCount());
      // END CountObjects
      assertThat(countResponse.totalCount()).isEqualTo(chunkedText.size());

      // Allow for indexing
      Thread.sleep(2000);

      // =================================================================
      // === Run Queries on GitBookChunk Collection ======================
      // =================================================================

      // START DataRetrieval
      var dataRetrievalResponse =
          chunks.query.nearText("history of git", q -> q.limit(3));
      // END DataRetrieval
      System.out.println("\n--- DataRetrieval Results ---");
      for (var obj : dataRetrievalResponse.objects()) {
        System.out.println(objectMapper.writerWithDefaultPrettyPrinter()
            .writeValueAsString(obj.properties()));
      }
      assertThat(dataRetrievalResponse.objects()).isNotEmpty();

      // START TransformResultSets
      var transformResponse =
          chunks.generate.nearText("history of git", q -> q.limit(3),
              // highlight-start
              g -> g.groupedTask(
                  "Summarize the key information here in bullet points")
          // highlight-end
          );

      System.out.println("\n--- TransformResultSets Result ---");
      System.out.println(transformResponse.generated().text());
      // END TransformResultSets
      assertThat(transformResponse.generated().text()).isNotEmpty();

      // START SinglePrompt
      var singlePromptResponse =
          chunks.generate.fetchObjects(q -> q.limit(2), g -> g
              .singlePrompt("Write the following as a haiku: ===== {chunk} "));

      System.out.println("\n--- SinglePrompt Results ---");
      for (var o : singlePromptResponse.objects()) {
        System.out.printf("\n===== Object index: [%s] =====\n",
            o.properties().get("chunk_index"));
        System.out.println(o.generated().text());
      }
      // END SinglePrompt
      assertThat(singlePromptResponse.objects()).hasSize(2);
      assertThat(singlePromptResponse.objects().get(0).generated().text())
          .isNotEmpty();

      // START GroupedTask
      var groupedTaskResponse =
          chunks.generate.fetchObjects(q -> q.limit(2), g -> g.groupedTask(
              "Write a trivia tweet based on this text. Use emojis and make it succinct and cute."));

      System.out.println("\n--- GroupedTask Result ---");
      System.out.println(groupedTaskResponse.generated().text());
      // END GroupedTask
      assertThat(groupedTaskResponse.generated().text()).isNotEmpty();

      // START NearTextGroupedTask
      var nearTextResponse1 = chunks.generate.nearText("states of git",
          q -> q.limit(2), g -> g.groupedTask(
              "Write a trivia tweet based on this text. Use emojis and make it succinct and cute."));

      System.out
          .println("\n--- NearTextGroupedTask (states of git) Result ---");
      System.out.println(nearTextResponse1.generated().text());
      // END NearTextGroupedTask
      assertThat(nearTextResponse1.generated().text()).isNotEmpty();

      // START SecondNearTextGroupedTask
      var nearTextResponse2 = chunks.generate.nearText("how git saves data",
          q -> q.limit(2), g -> g.groupedTask(
              "Write a trivia tweet based on this text. Use emojis and make it succinct and cute."));

      System.out.println(
          "\n--- SecondNearTextGroupedTask (how git saves data) Result ---");
      System.out.println(nearTextResponse2.generated().text());
      // END SecondNearTextGroupedTask
      assertThat(nearTextResponse2.generated().text()).isNotEmpty();

      // =================================================================
      // === Setup and Query WineReview Collection =====================
      // =================================================================

      // Setup: Create and populate "WineReview"
      if (client.collections.exists(wineCollectionName)) {
        client.collections.delete(wineCollectionName);
      }
      client.collections.create(wineCollectionName,
          col -> col
              .properties(Property.text("country"), Property.text("title"),
                  Property.text("review_body"))
              .vectorConfig(VectorConfig.text2vecOpenAi())
              .generativeModule(Generative.openai()));
      var wineReview = client.collections.use(wineCollectionName);
      wineReview.data.insert(
          Map.of("country", "USA", "title", "Fruity White", "review_body",
              "A delightful white wine with notes of pear and apple."));

      Thread.sleep(1200); // Allow for indexing

      // START TransformIndividualObjects
      var wineResponse = wineReview.generate.nearText("fruity white wine",
          q -> q.limit(3),
          // highlight-start
          g -> g
              .singlePrompt("Translate this review into French, using emojis: "
                  + "===== Country of origin: {country}, Title: {title}, Review body: {review_body}")
      // highlight-end
      );
      // END TransformIndividualObjects

      System.out.println("\n--- TransformIndividualObjects Result ---");
      for (var o : wineResponse.objects()) {
        System.out.println(o.generated().text());
      }
      assertThat(wineResponse.objects()).hasSize(1);
      assertThat(wineResponse.objects().get(0).generated().text()).isNotEmpty();


      // =================================================================
      // === List Modules ================================================
      // =================================================================

      // START ListModules
      var metaResponse = client.meta();
      System.out.println("\n--- ListModules Result ---");
      System.out.println(metaResponse);
      // END ListModules
      assertThat(metaResponse).isNotNull();
      assertThat(metaResponse.modules()).containsKey("generative-openai");

    } finally {
      if (client != null) {
        // Clean up both collections
        if (client.collections.exists(gitBookCollectionName)) {
          client.collections.delete(gitBookCollectionName);
        }
        if (client.collections.exists(wineCollectionName)) {
          client.collections.delete(wineCollectionName);
        }
        client.close();
      }
    }
  }
}
