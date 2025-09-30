import io.weaviate.client6.v1.api.Authentication;
import io.weaviate.client6.v1.api.WeaviateClient;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class ConnectionTest {

  @Test
  void testConnectLocalWithCustomUrl() throws Exception {
    // START CustomURL
    WeaviateClient client = WeaviateClient.connectToLocal(config -> config
        .host("127.0.0.1")
        .port(8080));

    System.out.println(client.isReady()); // Should print: `True`

    client.close(); // Free up resources
    // END CustomURL
  }

  // TODO[g-despot] Missing timeout options
  // @Test
  // void testTimeoutLocal() throws Exception {
  // WeaviateClient client = WeaviateClient.connectToLocal(config -> config
  // .port(8080)
  // .grpcPort(50051));

  // System.out.println(client.isReady()); // Should print: `True`

  // client.close(); // Free up resources
  // }
  // START TimeoutLocal
  // Coming soon
  // END TimeoutLocal
  // START TimeoutCustom
  // Coming soon
  // END TimeoutCustom

  void testConnectWCDWithApiKey() throws Exception {
    // START APIKeyWCD
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");

    WeaviateClient client = WeaviateClient.connectToWeaviateCloud(
        weaviateUrl, // Replace with your Weaviate Cloud URL
        weaviateApiKey // Replace with your Weaviate Cloud key
    );

    System.out.println(client.isReady()); // Should print: `True`

    client.close(); // Free up resources
    // END APIKeyWCD
  }

  @Test
  void testCustomConnection() throws Exception {
    // START CustomConnect
    // Best practice: store your credentials in environment variables
    String httpHost = System.getenv("WEAVIATE_HTTP_HOST");
    String grpcHost = System.getenv("WEAVIATE_GRPC_HOST");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");
    String cohereApiKey = System.getenv("COHERE_API_KEY");

    WeaviateClient client = WeaviateClient.connectToCustom(config -> config
        .scheme("https") // Corresponds to http_secure=True and grpc_secure=True
        .httpHost(httpHost)
        .httpPort(443)
        .grpcHost(grpcHost)
        .grpcPort(443)
        .authentication(Authentication.apiKey(weaviateApiKey))
        .setHeaders(Map.of("X-Cohere-Api-Key", cohereApiKey)));

    System.out.println(client.isReady()); // Should print: `True`

    client.close(); // Free up resources
    // END CustomConnect
  }

  @Test
  void testCustomApiKeyConnection() throws Exception {
    // START ConnectWithApiKeyExample
    // Best practice: store your credentials in environment variables
    String httpHost = System.getenv("WEAVIATE_HTTP_HOST");
    String grpcHost = System.getenv("WEAVIATE_GRPC_HOST");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");
    String cohereApiKey = System.getenv("COHERE_API_KEY");

    WeaviateClient client = WeaviateClient.connectToCustom(config -> config
        .scheme("https") // Corresponds to http_secure=True and grpc_secure=True
        .httpHost(httpHost)
        .httpPort(443)
        .grpcHost(grpcHost)
        .grpcPort(443)
        .authentication(Authentication.apiKey(weaviateApiKey))
        .setHeaders(Map.of("X-Cohere-Api-Key", cohereApiKey)));

    System.out.println(client.isReady()); // Should print: `True`

    client.close(); // Free up resources
    // // END ConnectWithApiKeyExample
  }

  @Test
  void testConnectLocalNoAuth() throws Exception {
    // START LocalNoAuth
    WeaviateClient client = WeaviateClient.connectToLocal();

    System.out.println(client.isReady()); // Should print: `True`

    client.close(); // Free up resources
    // END LocalNoAuth
  }

  @Test
  void testConnectLocalWithAuth() throws Exception {
    // START LocalAuth
    // Best practice: store your credentials in environment variables
    final String weaviateApiKey = System.getenv("WEAVIATE_LOCAL_API_KEY");

    // The local() factory doesn't support auth, so we must use custom().
    WeaviateClient client = WeaviateClient.connectToCustom(config -> config
        .authentication(Authentication.apiKey(weaviateApiKey)));

    System.out.println(client.isReady()); // Should print: `True`

    client.close(); // Free up resources
    // END LocalAuth
  }

  @Test
  void testConnectLocalWithThirdPartyKeys() throws Exception {
    // START LocalThirdPartyAPIKeys
    // Best practice: store your credentials in environment variables
    final String cohereApiKey = System.getenv("COHERE_API_KEY");

    WeaviateClient client = WeaviateClient.connectToLocal(config -> config
        .setHeaders(Map.of("X-Cohere-Api-Key", cohereApiKey)));

    System.out.println(client.isReady()); // Should print: `True`

    client.close(); // Free up resources
    // END LocalThirdPartyAPIKeys
  }

  @Test
  void testConnectWCDWithThirdPartyKeys() throws Exception {
    // START ThirdPartyAPIKeys
    // Best practice: store your credentials in environment variables
    String weaviateUrl = System.getenv("WEAVIATE_URL");
    String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");
    String cohereApiKey = System.getenv("COHERE_API_KEY");

    WeaviateClient client = WeaviateClient.connectToWeaviateCloud(
        weaviateUrl, // Replace with your Weaviate Cloud URL
        weaviateApiKey, // Replace with your Weaviate Cloud key
        config -> config
            .setHeaders(Map.of("X-Cohere-Api-Key", cohereApiKey)));

    System.out.println(client.isReady()); // Should print: `True`

    client.close(); // Free up resources
    // END ThirdPartyAPIKeys
  }
}
