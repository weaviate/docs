// THIS FILE HASN'T BEEN TESTED TO RUN END-TO-END

/////////////////////
/// Cloud connect ///
/////////////////////

// START APIKeyWCD
// Set these environment variables
// WEAVIATE_HOSTNAME    Your Weaviate instance hostname
// WEAVIATE_API_KEY  	Your Weaviate instance API key

package main

import (
	"context"
	"fmt"
	"os"

	"github.com/weaviate/weaviate-go-client/v5/weaviate"
	"github.com/weaviate/weaviate-go-client/v5/weaviate/auth"
)

// Create the client
func CreateClient() {
	cfg := weaviate.Config{
		Host:       os.Getenv("WEAVIATE_HOSTNAME"),
		Scheme:     "https",
		AuthConfig: auth.ApiKey{Value: os.Getenv("WEAVIATE_API_KEY")},
		Headers:    nil,
	}

	client, err := weaviate.NewClient(cfg)
	if err != nil {
		fmt.Println(err)
	}

	// Check the connection
	live, err := client.Misc().LiveChecker().Do(context.Background())
	if err != nil {
		panic(err)
	}
	fmt.Printf("%v", live)

}

func main() {
	CreateClient()
}
// END APIKeyWCD

/////////////////////
/// Local no auth ///
/////////////////////

// START LocalNoAuth
package main

import (
	"context"
	"fmt"

	"github.com/weaviate/weaviate-go-client/v5/weaviate"
)

// Create the client
func CreateClient() {
	cfg := weaviate.Config{
		Host:       "localhost:8080",
		Scheme:     "http",
        Headers:    nil,
	}

	client, err := weaviate.NewClient(cfg)
	if err != nil {
		fmt.Println(err)
	}

	// Check the connection
	live, err := client.Misc().LiveChecker().Do(context.Background())
	if err != nil {
		panic(err)
	}
	fmt.Printf("%v", live)

}

func main() {
	CreateClient()
}
// END LocalNoAuth

//////////////////////////
/// Custom URL or port ///
//////////////////////////

// START CustomURL
package main

import (
	"context"
	"fmt"

	"github.com/weaviate/weaviate-go-client/v5/weaviate"
)

// Create the client
func CreateClient() {
	cfg := weaviate.Config{
		Host:       "localhost:8080",
		Scheme:     "http",
        Headers:    nil,
        // The Go client doesn't use the gRPC port
	}

	client, err := weaviate.NewClient(cfg)
	if err != nil {
		fmt.Println(err)
	}

	// Check the connection
	live, err := client.Misc().LiveChecker().Do(context.Background())
	if err != nil {
		panic(err)
	}
	fmt.Printf("%v", live)

}

func main() {
	CreateClient()
}
// END CustomURL


//////////////////
/// Local auth ///
//////////////////

// START LocalAuth
// Set this environment variable
// WEAVIATE_API_KEY  your Weaviate instance API key

package main

import (
	"context"
	"fmt"
	"os"

	"github.com/weaviate/weaviate-go-client/v5/weaviate"
    "github.com/weaviate/weaviate-go-client/v5/weaviate/auth"
)

// Create the client
func CreateClient() {
	cfg := weaviate.Config{
		Host:       "localhost:8080",
		Scheme:     "http",
        AuthConfig: auth.ApiKey{Value: os.Getenv("WEAVIATE_API_KEY")},
        Headers:    nil,
	}

	client, err := weaviate.NewClient(cfg)
	if err != nil {
		fmt.Println(err)
	}

	// Check the connection
	live, err := client.Misc().LiveChecker().Do(context.Background())
	if err != nil {
		panic(err)
	}
	fmt.Printf("%v", live)

}

func main() {
	CreateClient()
}
// END LocalAuth

//////////////////////
/// Local 3d party ///
//////////////////////

// START LocalThirdPartyAPIKeys
// Set this environment variable
// COHERE_API_KEY    your Cohere API key

package main

import (
	"context"
	"fmt"
	"os"

	"github.com/weaviate/weaviate-go-client/v5/weaviate"
)

// Create the client
func CreateClient() {
	cfg := weaviate.Config{
		Host:       "localhost:8080",
		Scheme:     "http",
        Headers:     map[string]string{
            "X-Cohere-Api-Key": os.Getenv("WEAVIATE_COHERE_KEY"),
        },
	}

	client, err := weaviate.NewClient(cfg)
	if err != nil {
		fmt.Println(err)
	}

	// Check the connection
	live, err := client.Misc().LiveChecker().Do(context.Background())
	if err != nil {
		panic(err)
	}
	fmt.Printf("%v", live)

}

func main() {
	CreateClient()
}
// END LocalThirdPartyAPIKeys

//////////////////////
/// Cloud 3d party ///
//////////////////////

// START ThirdPartyAPIKeys
// Set these environment variables
// WEAVIATE_URL      your Weaviate instance URL
// WEAVIATE_API_KEY  your Weaviate instance API key
// COHERE_API_KEY    your Cohere API key

package main

import (
  "context"
  "fmt"
  "os"
  "github.com/weaviate/weaviate-go-client/v5/weaviate"
  "github.com/weaviate/weaviate-go-client/v5/weaviate/auth"
)

// Create the client
func CreateClient() {
cfg := weaviate.Config{
    Host: os.Getenv("WEAVIATE_HOSTNAME"),   // URL only, no scheme prefix
    Scheme: "https",
    AuthConfig: auth.ApiKey{Value: os.Getenv("WEAVIATE_API_KEY")},
    Headers: map[string]string{
        "X-Cohere-Api-Key": os.Getenv("WEAVIATE_COHERE_KEY"),
    },
}

client, err := weaviate.NewClient(cfg)
if err != nil{
    fmt.Println(err)
}

// Check the connection
live, err := client.Misc().LiveChecker().Do(context.Background())
if err != nil {
	panic(err)
}
fmt.Printf("%v", live)
}

func main() {
	CreateClient()
}

// END ThirdPartyAPIKeys

////////////
/// OIDC ///
////////////

// START OIDCConnect
// Connect to a self-hosted Weaviate instance configured with OIDC.
// Obtain the access token from your identity provider before connecting.
cfg := weaviate.Config{
    Host:   os.Getenv("WEAVIATE_HTTP_HOST"),
    Scheme: "http",
    AuthConfig: auth.BearerToken{
        AccessToken:  os.Getenv("WEAVIATE_OIDC_ACCESS_TOKEN"),
        RefreshToken: os.Getenv("WEAVIATE_OIDC_REFRESH_TOKEN"),
        ExpiresIn:    60,
    },
}
client, err := weaviate.NewClient(cfg)
if err != nil{
    fmt.Println(err)
}
// END OIDCConnect
