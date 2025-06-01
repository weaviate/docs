// THIS FILE HASN'T BEEN TESTED TO RUN END-TO-END

/////////////////////
/// Local no auth ///
/////////////////////

// START LocalNoAuth
package your.application;

import io.weaviate.client6.Config;
import io.weaviate.client6.WeaviateClient;

public class App {
    public static void main(String[] args) throws Exception {
        String scheme = "http";
        String httpHost = "localhost:8080";
        String grpcHost = "localhost:50051";

        Config config = new Config(scheme, httpHost, grpcHost);
        WeaviateClient client = new WeaviateClient(config);
    }
}
// END LocalNoAuth
