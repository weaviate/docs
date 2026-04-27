// THIS FILE HASN'T BEEN TESTED TO RUN END-TO-END

/////////////////////
/// Cloud connect ///
/////////////////////

// START APIKeyWCD
// Set these environment variables
// WEAVIATE_HOSTNAME        Your Weaviate instance hostname
// WEAVIATE_API_KEY         Your Weaviate instance API key

package your.application;

import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.WeaviateAuthClient;

public class App
{
    public static void main( String[] args ) throws Exception
    {

    String scheme = "https";
    String host = System.getenv("WEAVIATE_HOSTNAME");
    String apiKey = System.getenv("WEAVIATE_API_KEY");

    Config config = new Config(scheme, host);
    WeaviateClient client = WeaviateAuthClient.apiKey(config, apiKey);
    }
}
// END APIKeyWCD

// START ThirdPartyAPIKeys
// Set these environment variables
// WEAVIATE_HOSTNAME        Your Weaviate instance hostname
// WEAVIATE_API_KEY         Your Weaviate instance API key
// COHERE_API_KEY           Your Cohere API key

package your.application;

import java.util.HashMap;
import java.util.Map;
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.WeaviateAuthClient;

public class App
{
    public static void main( String[] args ) throws Exception
    {

    String scheme = "https";
    String host = System.getenv("WEAVIATE_HOSTNAME");
    String apiKey = System.getenv("WEAVIATE_API_KEY");
    String cohereKey = System.getenv("COHERE_API_KEY");

    Map<String, String> headers = new HashMap<String, String>() { {
        put("X-Cohere-Api-Key", cohereKey);
    } };

    Config config = new Config(scheme, host, headers);
    WeaviateClient client = WeaviateAuthClient.apiKey(config, apiKey);
    }
}
// END ThirdPartyAPIKeys

//////////////////
/// Local auth ///
//////////////////

// START LocalAuth
// Set this environment variable
// WEAVIATE_API_KEY  your Weaviate instance API key

package your.application;

import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.WeaviateAuthClient;

public class App
{
    public static void main( String[] args ) throws Exception
    {

    String scheme = "http";
    String host = "localhost:8080";
    String apiKey = System.getenv("WEAVIATE_API_KEY");

    Config config = new Config(scheme, host);
    WeaviateClient client = WeaviateAuthClient.apiKey(config, apiKey);
    }
}
// END LocalAuth

/////////////////////
/// Local no auth ///
/////////////////////

// START LocalNoAuth
package your.application;

import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;

public class App
{
    public static void main( String[] args ) throws Exception
    {

    String scheme = "http";
    String host = "localhost:8080";

    Config config = new Config(scheme, host);
    WeaviateClient client = new WeaviateClient(config);
    }
}
// END LocalNoAuth

//////////////////////////
/// Custom URL or port ///
//////////////////////////

// START CustomURL
package your.application;

import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;

public class App
{
    public static void main( String[] args ) throws Exception
    {

    String scheme = "http";
    String host = "localhost:8080";
    // The Java client doesn't use the gRPC port

    Config config = new Config(scheme, host);
    WeaviateClient client = new WeaviateClient(config);
    }
}
// END CustomURL

//////////////////////
/// Local 3d party ///
//////////////////////

// START LocalThirdPartyAPIKeys
// Set this environment variable
// COHERE_API_KEY    your Cohere API key

package your.application;

import java.util.HashMap;
import java.util.Map;
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;

public class App
{
    public static void main( String[] args ) throws Exception
    {

    String scheme = "http";
    String host = "localhost:8080";
    String cohereKey = System.getenv("COHERE_API_KEY");

    Map<String, String> headers = new HashMap<String, String>() { {
        put("X-Cohere-Api-Key", cohereKey);
    } };

    Config config = new Config(scheme, host, headers);
    WeaviateClient client = new WeaviateClient(config);
    }
}
// END LocalThirdPartyAPIKeys


// OIDC examples for Java are now in the Java v6 client.
// See _includes/code/java-v6/src/test/java/ConnectionTest.java (OIDCConnect marker).
