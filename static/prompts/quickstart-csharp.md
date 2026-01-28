# Build a Weaviate Web App with ASP.NET Core

Build a web application using ASP.NET Core and Weaviate with 4 sequential sections:

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

```bash
dotnet new mvc -n WeaviateDemo
cd WeaviateDemo
dotnet add package Weaviate.Client --version 1.0.0
```

Add to `appsettings.json`:

```json
{
  "Weaviate": {
    "Url": "your-weaviate-url",
    "ApiKey": "your-weaviate-api-key"
  },
  "Anthropic": {
    "ApiKey": "your-anthropic-api-key"
  }
}
```

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
- **Vector**: Use GraphQL `GetAsync()` with `WithNearText()` and concepts
- **Hybrid**: Use GraphQL `GetAsync()` with `WithHybrid()` query
- **Keyword**: Use GraphQL `GetAsync()` with `WithBM25()` query

### RAG Options
- **Single Prompt**: Use `WithGenerate()` with `SingleResult = "Explain this movie: {title} - {description}"`
- **Grouped Task**: Use `WithGenerate()` with `GroupedResult = "Write a short summary comparing these movies"`

## Connection Setup

```csharp
using Weaviate.Client;

var config = new WeaviateConfig
{
    Scheme = "https",
    Host = configuration["Weaviate:Url"],
    Headers = new Dictionary<string, string>
    {
        { "Authorization", $"Bearer {configuration["Weaviate:ApiKey"]}" },
        { "X-Anthropic-Api-Key", configuration["Anthropic:ApiKey"] }
    }
};

var client = new WeaviateClient(config);
```

## UI Requirements

Create an HTML interface with 4 sections. Each section has a button that:
- Is disabled until the previous section completes
- Shows the data/config being used
- Displays results after execution
- Has toggles for search modes (section 3) and RAG modes (section 4)

Create API controllers with [ApiController] and [Route] attributes for each operation.

Full documentation: https://weaviate.io/developers/weaviate/quickstart
