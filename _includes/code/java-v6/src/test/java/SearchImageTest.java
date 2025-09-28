import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.collections.CollectionHandle;
import io.weaviate.client6.v1.api.collections.query.Metadata;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Base64;
import java.util.Map;

class SearchImageTest {

  private static WeaviateClient client;

  // START helper base64 functions
  private static String urlToBase64(String url) throws IOException, InterruptedException {
    HttpClient httpClient = HttpClient.newHttpClient();
    HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).build();
    HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
    byte[] content = response.body();
    return Base64.getEncoder().encodeToString(content);
  }
  // END helper base64 functions

  @BeforeAll
  public static void beforeAll() throws IOException, InterruptedException {
    client = WeaviateClient.connectToLocal();

    // Download an image for file-based tests
    String imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Deutsches_Museum_Portrait_4.jpg/500px-Deutsches_Museum_Portrait_4.jpg";
    HttpClient httpClient = HttpClient.newHttpClient();
    HttpRequest request = HttpRequest.newBuilder().uri(URI.create(imageUrl)).build();
    HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());

    File imageDir = new File("images");
    if (!imageDir.exists()) {
      imageDir.mkdir();
    }
    File imageFile = new File("images/search-image.jpg");
    Files.copy(response.body(), imageFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
  }

  @AfterAll
  public static void afterAll() throws Exception {
    client.close();
  }

  @Test
  void testSearchWithBase64() {
    // START search with base64
    // highlight-start
    String base64String = "SOME_BASE_64_REPRESENTATION"; // This would be a real base64 string
    // highlight-end

    // Get the collection containing images
    CollectionHandle<Map<String, Object>> dogs = client.collections.use("Dog");

    // Perform query
    // highlight-start
    var response = dogs.query.nearImage(
        base64String,
        // highlight-end
        q -> q
            .returnProperties("breed")
            .limit(1)
    // targetVector: "vector_name" // required when using multiple named vectors
    );

    if (!response.objects().isEmpty()) {
      System.out.println(response.objects().get(0));
    }
    // END search with base64

    // START Expected base64 results
    // {
    // "data": {
    // "Get": {
    // "Dog": [
    // {
    // "breed": "Corgi"
    // }
    // ]
    // }
    // }
    // }
    // END Expected base64 results
  }

  @Test
  void testImageFileSearch() {
    // START ImageFileSearch
    CollectionHandle<Map<String, Object>> dogs = client.collections.use("Dog");
    var response = dogs.query.nearImage(
        // highlight-start
        "./images/search-image.jpg", // Provide a `File` object
        // highlight-end
        q -> q
            .returnProperties("breed")
            .limit(1)
    // targetVector: "vector_name" // required when using multiple named vectors
    );

    if (!response.objects().isEmpty()) {
      System.out.println(response.objects().get(0));
    }
    // END ImageFileSearch
  }

  @Test
  void testDistance() {
    // START Distance
    CollectionHandle<Map<String, Object>> dogs = client.collections.use("Dog");
    var response = dogs.query.nearImage(
        "./images/search-image.jpg",
        q -> q
            // highlight-start
            .distance(0.8f) // Maximum accepted distance
            .returnMetadata(Metadata.DISTANCE) // return distance from the source image
            // highlight-end
            .returnProperties("breed")
            .limit(5));

    for (var item : response.objects()) {
      System.out.println(item);
    }
    // END Distance

    // START Expected Distance results
    // {
    // "data": {
    // "Get": {
    // "Dog": [
    // {
    // "_additional": {
    // "distance": 0.1056757
    // },
    // "breed": "Corgi"
    // }
    // ]
    // }
    // }
    // }
    // END Expected Distance results
  }

  @Test
  void miscellaneousMarkers() {
    // START HelperFunction
    // weaviate.util.image_encoder_b64 has questionable utility, since
    // .with_near_image has `encode=True` by default
    // String encoded_image = ...; // encode file to base64
    // response = client.query()
    // .get("Dog", "breed")
    // .withNearImage(Map.of("image", encodedImage), false)
    // .withLimit(1)
    // .run();
    // END HelperFunction

    // START-ANY
    // client.close() is handled in @AfterAll
    // END-ANY
  }
}