# Build a Weaviate Web App with FastAPI

Build a web application using FastAPI and Weaviate with 5 sequential sections:

## Sections

1. **Create Collection** - Display collection config and create Movie collection
2. **Import Data** - Show and import 5 sample movie objects
3. **Query Agent** - Natural language query interface for retrieving information
4. **Hybrid Search** - Search with toggle for vector/hybrid/keyword modes
5. **RAG** - Generative search with single prompt and grouped task options

## Prerequisites

1. Create a free Weaviate Cloud Sandbox at https://console.weaviate.cloud
2. Get your **WEAVIATE_URL** (REST Endpoint) and **WEAVIATE_API_KEY** (Admin API Key)
3. Get an **ANTHROPIC_API_KEY** from https://console.anthropic.com

## Installation

```bash
pip install fastapi uvicorn "weaviate-client>=4.19.0" "weaviate-agents>=1.2.0" python-dotenv
```

Required packages:
- `fastapi` - Web framework for building the API
- `uvicorn` - ASGI server to run FastAPI
- `weaviate-client>=4.19.0` - Weaviate Python client for database operations
- `weaviate-agents>=1.2.0` - Weaviate agents library for natural language query capabilities
- `python-dotenv` - Load environment variables from .env file

## Project Structure

Create:
- `main.py` - FastAPI backend with Weaviate integration
- `.env` - Environment variables with WEAVIATE_URL, WEAVIATE_API_KEY, ANTHROPIC_API_KEY

## Implementation Details

### Collection Configuration
- Name: "Movie"
- Vectorizer: text2vec-weaviate (use `vector_config=Configure.Vectors.text2vec_weaviate()` syntax)
- Generative: anthropic
- Properties: title (text), description (text), genre (text) (use Property(name="title", data_type=DataType.TEXT) syntax)

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
- Use the import `from weaviate.agents.query import QueryAgent`
- Initialize the agent with:
    - `client` parameter set to the Weaviate client
    - `collections` parameter (list) set to `["Movie"]`
- Execute queries using the `agent.search(query)`
- Parse results from the response structure:
    - The agent returns a result object with `search_results.objects` attribute
    - Each object has a `.properties` dict containing title, description, genre
    - Return the parsed results as a list of dictionaries

  **Example implementation:**
  ```python
  agent = QueryAgent(
      client=client,
      collections=["Movie"]
  )

  result = agent.search(request["query"])

  results = []
  if hasattr(result, 'search_results') and result.search_results and hasattr(result.search_results, 'objects'):
      for obj in result.search_results.objects:
          results.append({
              "title": obj.properties.get("title"),
              "description": obj.properties.get("description"),
              "genre": obj.properties.get("genre")
          })

  return {"results": results}

### Search Modes
Implement a single slider control (0 to 1) to demonstrate the search continuum:
- **Slider at 0**: Pure Keyword search using `movies.query.bm25(query)`
- **Slider 0.01-0.99**: Hybrid search using `movies.query.hybrid(query, alpha=slider_value)`
- **Slider at 1**: Pure Vector search using `movies.query.near_text(query)`

Display the current mode and alpha value based on slider position (e.g., "Hybrid (α=0.5)" or "Pure Vector")

Search input placeholder: "Enter your search query (e.g., action movies)"

### RAG Options
- Provide two input boxes: one for the search query, another for the generative prompt/task
- **Single Prompt**: `movies.generate.near_text()` with `single_prompt=` (user-provided prompt, can use {title}, {description}, {genre})
- **Grouped Task**: `movies.generate.near_text()` with `grouped_task=` (user-provided task)

Input placeholders:
- Search query: "Enter your search query (e.g., superhero movies)"
- Single prompt: "Explain the plot of {title} in one sentence"
- Grouped task: "Summarize these movies and find common themes"

## Connection Setup

```python
import weaviate
from weaviate.classes.config import Configure

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.getenv("WEAVIATE_URL"),
    auth_credentials=os.getenv("WEAVIATE_API_KEY"),
    headers={"X-Anthropic-Api-Key": os.getenv("ANTHROPIC_API_KEY")}
)
```

## UI Requirements

Create an HTML interface with 5 sections. Each section has a button that:
- Is disabled until the previous section completes
- Shows the data/config being used
- Displays results after execution
- Section 3 has an input box for natural language queries
- Section 4 has a slider (0-1) for search modes with labels "Keyword" (left) and "Vector" (right), showing current mode/alpha
- Section 5 has toggles for RAG modes (single prompt vs grouped task) and two input boxes: one for search query, one for the generative prompt/task

Full documentation: https://docs.weaviate.io/weaviate/quickstart
