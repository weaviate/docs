# Build a Weaviate Web App with Gin

Build a web application using Gin (Go web framework) and Weaviate with 4 sequential sections:

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
mkdir weaviate-demo && cd weaviate-demo
go mod init weaviate-demo
go get github.com/gin-gonic/gin
go get github.com/weaviate/weaviate-go-client/v5@v5.6.0
go get github.com/joho/godotenv
```

Required packages:
- `github.com/gin-gonic/gin` - Web framework for building the API
- `github.com/weaviate/weaviate-go-client/v5@v5.6.0` - Weaviate Go client for database operations (minimum version 5.6.0)
- `github.com/joho/godotenv` - Load environment variables from .env file

Create `.env` with WEAVIATE_URL, WEAVIATE_API_KEY, ANTHROPIC_API_KEY

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
- **Slider at 0**: Pure Keyword search using GraphQL with `WithBM25(query)`
- **Slider 0.01-0.99**: Hybrid search using GraphQL with `WithHybrid(query).WithAlpha(sliderValue)`
- **Slider at 1**: Pure Vector search using GraphQL with `WithNearText(concepts)`

Display the current mode and alpha value based on slider position (e.g., "Hybrid (α=0.5)" or "Pure Vector")

Search input placeholder: "Enter your search query (e.g., action movies)"

### RAG Options
- Provide two input boxes: one for the search query, another for the generative prompt/task
- **Single Prompt**: Use `WithGenerate()` with `WithSinglePrompt()` (user-provided prompt, can use {title}, {description}, {genre})
- **Grouped Task**: Use `WithGenerate()` with `WithGroupedTask()` (user-provided task)

Input placeholders:
- Search query: "Enter your search query (e.g., superhero movies)"
- Single prompt: "Explain the plot of {title} in one sentence"
- Grouped task: "Summarize these movies and find common themes"

## Connection Setup

```go
import (
    "github.com/weaviate/weaviate-go-client/v5/weaviate"
    "github.com/weaviate/weaviate-go-client/v5/weaviate/auth"
)

cfg := weaviate.Config{
    Host:   os.Getenv("WEAVIATE_URL"),
    Scheme: "https",
    AuthConfig: auth.ApiKey{Value: os.Getenv("WEAVIATE_API_KEY")},
    Headers: map[string]string{
        "X-Anthropic-Api-Key": os.Getenv("ANTHROPIC_API_KEY"),
    },
}

client, err := weaviate.NewClient(cfg)
```

## UI Requirements

Create an HTML interface served via Gin with 4 sections. Each section has a button that:
- Is disabled until the previous section completes
- Shows the data/config being used
- Displays results after execution
- Section 3 has a slider (0-1) for search modes with labels "Keyword" (left) and "Vector" (right), showing current mode/alpha
- Section 4 has toggles for RAG modes (single prompt vs grouped task) and two input boxes: one for search query, one for the generative prompt/task

Create API endpoints with Gin router for each operation.

Full documentation: https://docs.weaviate.io/weaviate/quickstart
