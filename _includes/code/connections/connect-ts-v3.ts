// START-ANY
import weaviate, { WeaviateClient } from 'weaviate-client';

// END-ANY

////////////////////////
/// Connect to cloud ///
////////////////////////
{
// START APIKeyWCD
// Set these environment variables
// WEAVIATE_URL      your WCD instance URL
// WEAVIATE_API_KEY  your WCD instance API key

const weaviateURL = process.env.WEAVIATE_URL as string
const weaviateKey = process.env.WEAVIATE_API_KEY as string

const client: WeaviateClient = await weaviate.connectToWeaviateCloud(weaviateURL, {
    authCredentials: new weaviate.ApiKey(weaviateKey),
  }
)
// END APIKeyWCD
client.close();
}
//////////////////////////
/// WCD with a timeout ///
//////////////////////////
{
// START TimeoutWCD
// Set these environment variables
// WEAVIATE_URL       your Weaviate instance URL
// WEAVIATE_API_KEY   your Weaviate instance API key

const weaviateURL = process.env.WEAVIATE_URL as string
const weaviateKey = process.env.WEAVIATE_API_KEY as string

const client: WeaviateClient = await weaviate.connectToWeaviateCloud(weaviateURL, {
  authCredentials: new weaviate.ApiKey(weaviateKey),
    timeout: { init: 30, query: 60, insert: 120 } // Values in seconds
  }
)

console.log(client)
// END TimeoutWCD
client.close();
}
/////////////////////
/// Local no auth ///
/////////////////////
{
// START LocalNoAuth

const client = await weaviate.connectToLocal()

console.log(client)
// END LocalNoAuth
client.close();
}
//////////////////
/// Local auth ///
//////////////////
{
// START LocalAuth
// Set this environment variable
// WEAVIATE_LOCAL_API_KEY   your Weaviate instance API key

const weaviateKey = process.env.WEAVIATE_LOCAL_API_KEY as string

const client = await weaviate.connectToLocal(
   { 
    port:8099,
    grpcPort:50052, 
    authCredentials: new weaviate.ApiKey(weaviateKey)
  }
)

console.log(client)
// END LocalAuth
client.close();
}
//////////////////////
/// Local 3d party ///
//////////////////////
{
// START LocalThirdPartyAPIKeys
// Set this environment variable
// COHERE_API_KEY    your Cohere API key

const cohereKey = process.env.COHERE_API_KEY as string

const client = await weaviate.connectToLocal(
  {
    headers: {
     'X-Cohere-Api-Key':  cohereKey,
    }
  }
)

console.log(client)
// END LocalThirdPartyAPIKeys
client.close();
}

//////////////////////////
/// Local with a timeout ///
//////////////////////////
{
// START TimeoutLocal

const client = await weaviate.connectToLocal(
   {  timeout: { init: 30, query: 60, insert: 120 }, } // Values in seconds
)

console.log(client)
// END TimeoutLocal
client.close();
}

//////////////////////
/// Cloud 3d party ///
//////////////////////
{
// START ThirdPartyAPIKeys
// Set these environment variables
// WEAVIATE_URL      your Weaviate instance URL
// WEAVIATE_API_KEY  your Weaviate instance API key
// COHERE_API_KEY    your Cohere API key

const weaviateURL = process.env.WEAVIATE_URL as string
const weaviateKey = process.env.WEAVIATE_API_KEY as string
const cohereKey = process.env.COHERE_API_KEY as string

const client: WeaviateClient = await weaviate.connectToWeaviateCloud(weaviateURL, {
  authCredentials: new weaviate.ApiKey(weaviateKey),
    headers: {
     'X-Cohere-Api-Key': cohereKey,
   }
  }
)
// END ThirdPartyAPIKeys
client.close();
}
//////////////////////
/// Custom connect ///
//////////////////////
{
// START CustomConnect  // START ConnectWithApiKeyExample
// Set these environment variables
// WEAVIATE_HTTP_HOST       your Weaviate instance URL
// WEAVIATE_GRPC_HOST   your Weaviate instance GPC URL
// WEAVIATE_API_KEY   your Weaviate instance API key

const client = await weaviate.connectToCustom(
 {
    httpHost: process.env.WEAVIATE_HTTP_HOST,  // URL only, no http prefix
    httpPort: 443,
    grpcHost: process.env.WEAVIATE_GRPC_HOST,
    grpcPort: 443,        // Default is 50051, WCD uses 443
    grpcSecure: true,
    httpSecure: true,
    authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY),
    // END CustomConnect  // START ConnectWithApiKeyExample
    headers: {
      'X-Cohere-Api-Key': process.env.COHERE_API_KEY || ''
    }
    // START CustomConnect  // START ConnectWithApiKeyExample
  })

console.log(client)
// END CustomConnect  // END ConnectWithApiKeyExample
client.close();
}

//////////////////////
/// Custom URL///
//////////////////////
{
// START CustomURL

const client = await weaviate.connectToLocal(
 {
    host: "127.0.0.1",   // URL only, no http prefix
    port: 8080,
    grpcPort: 50051,     // Default is 50051, WCD uses 443
 })

async function main() {
  console.log(await client.isReady())
  client.close();
}

main()
// END CustomURL
}

/////////////////////////////
/// Custom with a timeout ///
/////////////////////////////
{
// START TimeoutCustom
// Set these environment variables
// WEAVIATE_HTTP_HOST       your Weaviate instance URL
// WEAVIATE_GRPC_HOST   your Weaviate instance GPC URL
// WEAVIATE_API_KEY   your Weaviate instance API key

const client: WeaviateClient = await weaviate.connectToCustom(
  {
   httpHost: process.env.WEAVIATE_HTTP_HOST,  // URL only, no http prefix
   httpPort: 443,
   grpcHost: process.env.WEAVIATE_GRPC_HOST,
   grpcPort: 443,        // Default is 50051, WCD uses 443
   grpcSecure: true,
   httpSecure: true,
   authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY),
   timeout: { init: 30, query: 60, insert: 120 } // Values in seconds
  }
)

console.log(client)
// END TimeoutCustom
client.close();
}
////////////
/// OIDC ///
////////////
{
// START OIDCConnect
// Set these environment variables
// WCD_USERNAME    your Weaviate OIDC username
// WCD_PASSWORD     your Weaviate OIDC password
// WEAVIATE_HTTP_HOST     your Weaviate instance
// WEAVIATE_GRPC_HOST   your Weaviate instance GPC URL

const client = await weaviate.connectToCustom(
 {
    httpHost: process.env.WEAVIATE_HTTP_HOST,  // URL only, no http prefix
    httpPort: 443,
    grpcHost: process.env.WEAVIATE_GRPC_HOST,
    grpcPort: 443,
    grpcSecure: true,
    httpSecure: true,
    authCredentials: new weaviate.AuthUserPasswordCredentials({
     username: process.env.WCD_USERNAME,
     password: process.env.WCD_PASSWORD,
    }),
    headers: {
      'X-Cohere-Api-Key': process.env.COHERE_API_KEY || ''
    }
  })
// END OIDCConnect
/*
// START OIDCConnect
console.log(client)
// END OIDCConnect
*/
client.close();
}
