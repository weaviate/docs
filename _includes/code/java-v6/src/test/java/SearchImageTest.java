import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.Property;
import io.weaviate.client6.v1.api.collections.VectorConfig;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class SearchImageTest {

  private static WeaviateClient client;
  private static final String QUERY_IMAGE_PATH = "images/search-image.jpg";

  // START helper base64 functions
  private static String urlToBase64(String url) throws IOException, InterruptedException {
    HttpClient httpClient = HttpClient.newHttpClient();
    HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).build();
    HttpResponse<byte[]> response =
        httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
    byte[] content = response.body();
    return Base64.getEncoder().encodeToString(content);
  }

  private static String fileToBase64(String path) throws IOException {
    byte[] content = Files.readAllBytes(Paths.get(path));
    return Base64.getEncoder().encodeToString(content);
  }
  // END helper base64 functions

  @BeforeAll
  public static void beforeAll() throws IOException, InterruptedException {
    client = WeaviateClient.connectToLocal(c -> c.port(8280).grpcPort(50251));

    // Delete the collection if it already exists
    if (client.collections.exists("Dog")) {
      client.collections.delete("Dog");
    }

    client.collections.create("Dog",
        c -> c
            .properties(Property.blob("image"), Property.text("breed"),
                Property.text("description"))
            .vectorConfig(VectorConfig
                .multi2vecClip(i -> i.imageFields("image").textFields("breed", "description"))));

    // Prepare and ingest sample dog images
    CollectionHandle<Map<String, Object>> dogs = client.collections.use("Dog");
    List<Map<String, String>> sampleImages = List.of(Map.of("url",
        "https://images.unsplash.com/photo-1489924034176-2e678c29d4c6?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "breed", "Husky", "description",
        "Siberian Husky with distinctive blue eyes, pointed ears, and thick white and grey fur coat, typical of arctic sled dogs"),
        Map.of("url",
            "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8R29sZGVuJTIwUmV0cmlldmVyfGVufDB8fDB8fHwy",
            "breed", "Golden Retriever", "description",
            "Golden Retriever with beautiful long golden fur, friendly expression, sitting and posing for the camera, known for being excellent family pets"),
        Map.of("url",
            "https://images.unsplash.com/photo-1612979148245-d8c79c50935d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZG9nJTIwZ2VybWFuJTIwc2hlcGFyZHxlbnwwfHwwfHx8Mg%3D%3D",
            "breed", "German Shepherd", "description",
            "The German Shepherd, also known in Britain as an Alsatian, is a German breed of working dog of medium to large size. It was originally bred as a herding dog, for herding sheep. "));

    System.out.println("Inserting sample data...");
    for (var image : sampleImages) {
      String base64Image = urlToBase64(image.get("url"));
      dogs.data.insert(Map.of("image", base64Image, "breed", image.get("breed"), "description",
          image.get("description")));
      System.out.println("Inserted: " + image.get("breed"));
    }
    System.out.println("Data insertion complete!");

    // Download the specific image to be used for file-based searches (optional, for future use)
    String queryImageUrl =
        "https://images.unsplash.com/photo-1590419690008-905895e8fe0d?q=80&w=1336&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    HttpClient httpClient = HttpClient.newHttpClient();
    HttpRequest request = HttpRequest.newBuilder().uri(URI.create(queryImageUrl)).build();
    HttpResponse<InputStream> response =
        httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());

    Path imageDir = Paths.get("images");
    if (!Files.exists(imageDir)) {
      Files.createDirectories(imageDir);
    }
    Files.copy(response.body(), Paths.get(QUERY_IMAGE_PATH), StandardCopyOption.REPLACE_EXISTING);
  }

  @AfterAll
  public static void afterAll() throws Exception {
    if (client != null) {
      // Clean up the collection
      if (client.collections.exists("Dog")) {
        client.collections.delete("Dog");
      }
      client.close();
    }

    // Clean up the downloaded image file and directory
    Path imagePath = Paths.get(QUERY_IMAGE_PATH);
    Path imageDir = Paths.get("images");
    if (Files.exists(imagePath)) {
      Files.delete(imagePath);
    }
    if (Files.exists(imageDir)) {
      Files.delete(imageDir);
    }
  }

  @Test
  void testSearchWithBase64() throws IOException {
    // START search with base64
    // highlight-start
    String base64String = fileToBase64(QUERY_IMAGE_PATH); // This would be a real base64 string
    // highlight-end

    // Get the collection containing images
    CollectionHandle<Map<String, Object>> dogs = client.collections.use("Dog");

    // Perform query
    // highlight-start
    var response = dogs.query.nearImage(base64String,
        // highlight-end
        q -> q.returnProperties("breed").limit(1)
    // targetVector: "vector_name" // required when using multiple named vectors
    );

    if (!response.objects().isEmpty()) {
      System.out.println(response.objects().get(0));
    }
    // END search with base64
  }

  // TODO[g-despot] Image search with file path needed
  // @Test
  // void testImageFileSearch() {
  //   CollectionHandle<Map<String, Object>> dogs = client.collections.use("Dog");
  //   var response = dogs.query.nearImage(
  //       // highlight-start
  //       QUERY_IMAGE_PATH,
  //       // highlight-end
  //       q -> q.returnProperties("breed").limit(1)
  //   // targetVector: "vector_name" // required when using multiple named vectors
  //   );

  //   if (!response.objects().isEmpty()) {
  //     System.out.println(response.objects().get(0));
  //   }
  // }
  // START ImageFileSearch
  // Coming soon
  // END ImageFileSearch

  void testDistance() {
    // START Distance
    CollectionHandle<Map<String, Object>> dogs = client.collections.use("Dog");
    var response = dogs.query.nearImage("./images/search-image.jpg", q -> q
        // highlight-start
        .distance(0.8f) // Maximum accepted distance
        .returnMetadata(Metadata.DISTANCE) // return distance from the source image
        // highlight-end
        .returnProperties("breed").limit(5));

    for (var item : response.objects()) {
      System.out.println(item);
    }
  }
}
