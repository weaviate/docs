import io.weaviate.client6.v1.api.Authentication;
import io.weaviate.client6.v1.api.WeaviateClient;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class ConnectionTest {

  @Test
  void testConnectLocalWithCustomUrl() {
    // START CustomURL
    assertDoesNotThrow(() -> {
      try (WeaviateClient client = WeaviateClient.connectToLocal(config -> config
          .host("127.0.0.1")
          .port(8080))) {
        System.out.println("Successfully configured client for custom local URL.");
        // The client is now configured and ready to use.
      }
    });
    // END CustomURL
  }

  @Test
  void testConnectWCDWithApiKey() {
    // START APIKeyWCD
    assertDoesNotThrow(() -> {
      // Best practice: store your credentials in environment variables
      String weaviateUrl = System.getenv("WEAVIATE_URL");
      String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");

      try (WeaviateClient client = WeaviateClient.connectToWeaviateCloud(weaviateUrl, weaviateApiKey)) {
        System.out.println("Successfully configured client for WCD with API Key.");
        // The client is now configured and ready to use.
      }
    });
    // END APIKeyWCD
  }

  @Test
  void testCustomConnection() {
    // START CustomConnect // START ConnectWithApiKeyExample
    assertDoesNotThrow(() -> {
      // Best practice: store your credentials in environment variables
      String httpHost = System.getenv("WEAVIATE_HTTP_HOST");
      String grpcHost = System.getenv("WEAVIATE_GRPC_HOST");
      String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");
      String cohereApiKey = System.getenv("COHERE_API_KEY");

      try (WeaviateClient client = WeaviateClient.connectToCustom(config -> config
          .scheme("https") // Corresponds to http_secure=True and grpc_secure=True
          .httpHost(httpHost)
          .httpPort(443)
          .grpcHost(grpcHost)
          .grpcPort(443)
          .authentication(Authentication.apiKey(weaviateApiKey))
          .setHeaders(Map.of("X-Cohere-Api-Key", cohereApiKey)))) {
        System.out.println("Successfully configured client with custom settings.");
        // The client is now configured and ready to use.
      }
    });
    // END CustomConnect // END ConnectWithApiKeyExample
  }

  @Test
  void testConnectLocalNoAuth() {
    // START LocalNoAuth
    assertDoesNotThrow(() -> {
      try (WeaviateClient client = WeaviateClient.connectToLocal()) {
        System.out.println("Successfully configured client for local connection without auth.");
        // The client is now configured and ready to use.
      }
    });
    // END LocalNoAuth
  }

  @Test
  void testConnectLocalWithAuth() {
    // START LocalAuth
    assertDoesNotThrow(() -> {
      // Best practice: store your credentials in environment variables
      // Using a specific variable for a local key to avoid conflicts.
      final String weaviateApiKey = System.getenv("WEAVIATE_LOCAL_API_KEY");

      // The local() factory doesn't support auth, so we must use custom().
      try (WeaviateClient client = WeaviateClient.connectToCustom(config -> config
          .scheme("http")
          .httpHost("localhost")
          .grpcHost("localhost")
          .httpPort(8099)
          .grpcPort(50052)
          .authentication(Authentication.apiKey(weaviateApiKey)))) {
        System.out.println("Successfully configured client for local connection with auth.");
        // The client is now configured and ready to use.
      }
    });
    // END LocalAuth
  }

  @Test
  void testConnectLocalWithThirdPartyKeys() {
    // START LocalThirdPartyAPIKeys
    assertDoesNotThrow(() -> {
      // Best practice: store your credentials in environment variables
      final String cohereApiKey = System.getenv("COHERE_API_KEY");

      try (WeaviateClient client = WeaviateClient.connectToLocal(config -> config
          .setHeaders(Map.of("X-Cohere-Api-Key", cohereApiKey)))) {
        System.out.println("Successfully configured client for local connection with third-party API keys.");
        // The client is now configured and ready to use.
      }
    });
    // END LocalThirdPartyAPIKeys
  }

  @Test
  void testConnectWCDWithThirdPartyKeys() {
    // START ThirdPartyAPIKeys
    assertDoesNotThrow(() -> {
      // Best practice: store your credentials in environment variables
      String weaviateUrl = System.getenv("WEAVIATE_URL");
      String weaviateApiKey = System.getenv("WEAVIATE_API_KEY");
      String cohereApiKey = System.getenv("COHERE_API_KEY");

      try (WeaviateClient client = WeaviateClient.connectToWeaviateCloud(weaviateUrl, weaviateApiKey, config -> config
          .setHeaders(Map.of("X-Cohere-Api-Key", cohereApiKey)))) {
        System.out.println("Successfully configured client for WCD with third-party API keys.");
        // The client is now configured and ready to use.
      }
    });
    // END ThirdPartyAPIKeys
  }
}
