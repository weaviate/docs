// THIS FILE HASN'T BEEN TESTED TO RUN END-TO-END

/////////////////////
/// Local no auth ///
/////////////////////

// START LocalNoAuth
package your.application;

import io.weaviate.client6.v1.api.WeaviateClient;

public class Connect {
    public static void main(String[] args) throws Exception {
        String httpHost = "localhost";
        int httpPort = 8080;
        
        return WeaviateClient.local(conn -> conn.host(httpHost).httpPort(httpPort));
    }
}
// END LocalNoAuth
