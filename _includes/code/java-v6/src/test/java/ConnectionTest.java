import io.weaviate.client6.v1.api.Authorization;
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.internal.TokenProvider;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class ConnectionTest {

    // Helper class to make the OIDC example compilable.
    // The real implementation would handle token acquisition.
    static class OidcTokenProvider implements TokenProvider {
        private final String username;
        private final String password;

        public OidcTokenProvider(String username, String password) {
            this.username = Objects.requireNonNull(username);
            this.password = Objects.requireNonNull(password);
        }

        @Override
        public TokenProvider.Token getToken() {
            // In a real application, you would implement the OIDC flow here
            // to exchange username/password for an access token.
            // For this example, we return a placeholder token.
            System.out.println("Acquiring OIDC token for user: " + username);
            String placeholderTokenValue = "placeholder-oidc-token";
            // The Token record constructor only takes the token string.
            return new TokenProvider.Token(placeholderTokenValue);
        }
    }


    @Test
    void testConnectLocalWithCustomUrl() {
        // START CustomURL
        assertDoesNotThrow(() -> {
            try (WeaviateClient client = WeaviateClient.local(config -> config
                .host("127.0.0.1")
                .httpPort(8080)
                .grpcPort(50051)
            )) {
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

            try (WeaviateClient client = WeaviateClient.wcd(weaviateUrl, weaviateApiKey)) {
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

            try (WeaviateClient client = WeaviateClient.custom(config -> config
                .scheme("https") // Corresponds to http_secure=True and grpc_secure=True
                .httpHost(httpHost)
                .httpPort(443)
                .grpcHost(grpcHost)
                .grpcPort(443)
                .authorization(Authorization.apiKey(weaviateApiKey))
                .setHeaders(Map.of("X-Cohere-Api-Key", cohereApiKey))
            )) {
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
            try (WeaviateClient client = WeaviateClient.local()) {
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
            try (WeaviateClient client = WeaviateClient.custom(config -> config
                .scheme("http")
                .httpHost("localhost")
                .grpcHost("localhost")
                .httpPort(8099)
                .grpcPort(50052)
                .authorization(Authorization.apiKey(weaviateApiKey))
            )) {
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

            try (WeaviateClient client = WeaviateClient.local(config -> config
                .setHeaders(Map.of("X-Cohere-Api-Key", cohereApiKey))
            )) {
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

            try (WeaviateClient client = WeaviateClient.wcd(weaviateUrl, weaviateApiKey, config -> config
                .setHeaders(Map.of("X-Cohere-Api-Key", cohereApiKey))
            )) {
                System.out.println("Successfully configured client for WCD with third-party API keys.");
                // The client is now configured and ready to use.
            }
        });
        // END ThirdPartyAPIKeys
    }

    @Test
    void testConnectWCDWithOIDC() {
        // START OIDCConnect
        assertDoesNotThrow(() -> {
            // Best practice: store your credentials in environment variables
            String weaviateUrl = System.getenv("WEAVIATE_URL");
            String weaviateUsername = System.getenv("WCD_USERNAME");
            String weaviatePassword = System.getenv("WCD_PASSWORD");

            if (weaviateUrl == null || weaviateUrl.isBlank()) {
                throw new IllegalArgumentException("WEAVIATE_URL environment variable not set");
            }

            // The wcd() factory does not support OIDC, so we use custom()
            // and replicate the WCD configuration.
            try (WeaviateClient client = WeaviateClient.custom(config -> config
                .scheme("https")
                .httpHost(weaviateUrl)
                .grpcHost("grpc." + weaviateUrl) // WCD gRPC host convention
                .authorization(new OidcTokenProvider(weaviateUsername, weaviatePassword))
            )) {
                System.out.println("Successfully configured client for WCD with OIDC.");
                // The client is now configured and ready to use.
            }
        });
        // END OIDCConnect
    }
}
