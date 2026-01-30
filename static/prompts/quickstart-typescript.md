# Build a Weaviate Web App with Next.js

Build a web application using Next.js and Weaviate with 5 sequential sections:

## Sections

1. **Create Collection** - Display collection config and create Movie collection
2. **Import Data** - Show and import 5 sample movie objects
3. **Query Agent** - Natural language query interface for retrieving information
4. **Hybrid Search** - Search with toggle for vector/hybrid/keyword modes
5. **RAG** - Generative search with single prompt and grouped task options

## Prerequisites

1. Create a free Weaviate Cloud Sandbox at https://console.weaviate.cloud
2. Get your **WEAVIATE_URL** and **WEAVIATE_API_KEY**
3. Get an **ANTHROPIC_API_KEY** from https://console.anthropic.com

## Setup

```bash
npx create-next-app@latest weaviate-demo --typescript --tailwind --app
cd weaviate-demo
npm install weaviate-client@^3.11.0 weaviate-agents@^1.1.0
```

Required packages:
- `next` - React framework for production (installed via create-next-app)
- `react` and `react-dom` - React library (installed via create-next-app)
- `weaviate-client@^3.11.0` - Weaviate TypeScript client for database operations (minimum version 3.11.0)
- `weaviate-agents@^1.1.0` - Weaviate agents library for natural language query capabilities (minimum version 1.1.0)
- `tailwindcss` - Utility-first CSS framework (installed via create-next-app)

Create `.env.local` with WEAVIATE_URL, WEAVIATE_API_KEY, ANTHROPIC_API_KEY

## Implementation Details

### Collection Configuration
- Name: "Movie"
- Vectorizer: text2vec-weaviate (use `vectorizers: configure.vectors.text2VecWeaviate()` syntax)
- Generative: anthropic
- Properties: title (text), description (text), genre (text)

### Sample Data (5 movies)
1. The Matrix - "A computer hacker learns about the true nature of reality and his role in the war against its controllers." (Science Fiction)
2. Inception - "A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea." (Science Fiction)
3. The Godfather - "The aging patriarch of an organized crime dynasty transfers control to his reluctant son." (Crime)
4. Spirited Away - "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents." (Animation)
5. The Dark Knight - "Batman faces the Joker, a criminal mastermind who wants to plunge Gotham into anarchy." (Action)

### Query Agent
- Use the query agent to write queries in natural language to retrieve information from the Movie collection
- Allow users to ask questions like "Show me all science fiction movies" or "Find movies about dreams"
- The query agent translates natural language into Weaviate queries automatically
- Display the results in a readable format

### Search Modes
Implement a single slider control (0 to 1) to demonstrate the search continuum:
- **Slider at 0**: Pure Keyword search using `movies.query.bm25(query)`
- **Slider 0.01-0.99**: Hybrid search using `movies.query.hybrid(query, { alpha: sliderValue })`
- **Slider at 1**: Pure Vector search using `movies.query.nearText(query)`

Display the current mode and alpha value based on slider position (e.g., "Hybrid (α=0.5)" or "Pure Vector")

Search input placeholder: "Enter your search query (e.g., action movies)"

### RAG Options
- Provide two input boxes: one for the search query, another for the generative prompt/task
- **Single Prompt**: `movies.generate.nearText()` with `singlePrompt=` (user-provided prompt, can use {title}, {description}, {genre})
- **Grouped Task**: `movies.generate.nearText()` with `groupedTask=` (user-provided task)

Input placeholders:
- Search query: "Enter your search query (e.g., superhero movies)"
- Single prompt: "Explain the plot of {title} in one sentence"
- Grouped task: "Summarize these movies and find common themes"

## Connection Setup

```typescript
import weaviate, { WeaviateClient, ApiKey } from 'weaviate-client';

const client = await weaviate.connectToWeaviateCloud(
  process.env.WEAVIATE_URL!,
  {
    authCredentials: new ApiKey(process.env.WEAVIATE_API_KEY!),
    headers: { 'X-Anthropic-Api-Key': process.env.ANTHROPIC_API_KEY! }
  }
);
```

## UI Requirements

Create a React interface with 5 sections. Each section has a button that:
- Is disabled until the previous section completes
- Shows the data/config being used
- Displays results after execution
- Section 3 has an input box for natural language queries
- Section 4 has a slider (0-1) for search modes with labels "Keyword" (left) and "Vector" (right), showing current mode/alpha
- Section 5 has toggles for RAG modes (single prompt vs grouped task) and two input boxes: one for search query, one for the generative prompt/task

Create API routes under `/app/api/` for each operation.

Full documentation: https://docs.weaviate.io/weaviate/quickstart
