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
  <version>6.0.1</version>
</dependency>
```

Required packages:
- `io.weaviate:client:6.0.1` - Weaviate Java client for database operations (minimum version 6.0.1)
- Spring Web - Web framework (installed via Spring Initializr)

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
Implement a single slider control (0 to 1) to demonstrate the search continuum:
- **Slider at 0**: Pure Keyword search using GraphQL `get()` with `withBm25(query)`
- **Slider 0.01-0.99**: Hybrid search using GraphQL `get()` with `withHybrid(query).withAlpha(sliderValue)`
- **Slider at 1**: Pure Vector search using GraphQL `get()` with `withNearText(concepts)`

Display the current mode and alpha value based on slider position (e.g., "Hybrid (α=0.5)" or "Pure Vector")

Search input placeholder: "Enter your search query (e.g., action movies)"

### RAG Options
- Provide two input boxes: one for the search query, another for the generative prompt/task
- **Single Prompt**: Use `withGenerate()` with `singleResult()` (user-provided prompt, can use {title}, {description}, {genre})
- **Grouped Task**: Use `withGenerate()` with `groupedResult()` (user-provided task)

Input placeholders:
- Search query: "Enter your search query (e.g., superhero movies)"
- Single prompt: "Explain the plot of {title} in one sentence"
- Grouped task: "Summarize these movies and find common themes"

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
- Section 3 has a slider (0-1) for search modes with labels "Keyword" (left) and "Vector" (right), showing current mode/alpha
- Section 4 has toggles for RAG modes (single prompt vs grouped task) and two input boxes: one for search query, one for the generative prompt/task

Create REST endpoints with Spring @RestController for each operation.

Full documentation: https://docs.weaviate.io/weaviate/quickstart
