# Build a Weaviate Web App with Spring Boot

Build a web application using Spring Boot and Weaviate with 4 sequential sections:

## Sections

1. **Create Collection** - Display collection config and create Movie collection
2. **Import Data** - Show and import 5 sample movie objects
3. **Hybrid Search** - Search with toggle for vector/hybrid/keyword modes
4. **RAG** - Generative search with single prompt and grouped task options

## Prerequisites

1. Create a free Weaviate Cloud Sandbox at https://console.weaviate.cloud
2. Get your **WEAVIATE_URL** and **WEAVIATE_API_KEY**
3. Get an **ANTHROPIC_API_KEY** from https://console.anthropic.com

## Setup

Use Spring Initializr (https://start.spring.io) with:
- Spring Web
- Java 17+
- Maven

Add Weaviate dependency to `pom.xml`:

```xml
<dependency>
  <groupId>io.weaviate</groupId>
  <artifactId>client</artifactId>
  <version>6.0.0</version>
</dependency>
```

Add to `application.properties`: weaviate.url, weaviate.api-key, anthropic.api-key

## Implementation Details

### Collection Configuration
- Name: "Movie"
- Vectorizer: "text2vec-weaviate"
- Generative: "generative-anthropic"
- Properties: title (text), description (text), genre (text)

### Sample Data (5 movies)
1. The Matrix - "A computer hacker learns about the true nature of reality and his role in the war against its controllers." (Science Fiction)
2. Inception - "A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea." (Science Fiction)
3. The Godfather - "The aging patriarch of an organized crime dynasty transfers control to his reluctant son." (Crime)
4. Spirited Away - "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents." (Animation)
5. The Dark Knight - "Batman faces the Joker, a criminal mastermind who wants to plunge Gotham into anarchy." (Action)

### Search Modes
- **Vector**: Use GraphQL `get()` with `withNearText()` and concepts
- **Hybrid**: Use GraphQL `get()` with `withHybrid()` query
- **Keyword**: Use GraphQL `get()` with `withBm25()` query

### RAG Options
- **Single Prompt**: Use `withGenerate()` with `singleResult("Explain this movie: {title} - {description}")`
- **Grouped Task**: Use `withGenerate()` with `groupedResult("Write a short summary comparing these movies")`

## Connection Setup

```java
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;

Map<String, String> headers = new HashMap<>();
headers.put("Authorization", "Bearer " + weaviateApiKey);
headers.put("X-Anthropic-Api-Key", anthropicApiKey);

Config config = new Config("https", weaviateUrl, headers);
WeaviateClient client = new WeaviateClient(config);
```

## UI Requirements

Create an HTML interface with 4 sections. Each section has a button that:
- Is disabled until the previous section completes
- Shows the data/config being used
- Displays results after execution
- Has toggles for search modes (section 3) and RAG modes (section 4)

Create REST endpoints with Spring @RestController for each operation.

Full documentation: https://weaviate.io/developers/weaviate/quickstart
