# Build a Weaviate Web App with FastAPI

Build a web application using FastAPI and Weaviate with 4 sequential sections:

## Sections

1. **Create Collection** - Display collection config and create Movie collection
2. **Import Data** - Show and import 5 sample movie objects
3. **Hybrid Search** - Search with toggle for vector/hybrid/keyword modes
4. **RAG** - Generative search with single prompt and grouped task options

## Prerequisites

1. Create a free Weaviate Cloud Sandbox at https://console.weaviate.cloud
2. Get your **WEAVIATE_URL** (REST Endpoint) and **WEAVIATE_API_KEY** (Admin API Key)
3. Get an **ANTHROPIC_API_KEY** from https://console.anthropic.com

## Installation

```bash
pip install fastapi uvicorn weaviate-client python-dotenv
```

## Project Structure

Create:
- `main.py` - FastAPI backend with Weaviate integration
- `.env` - Environment variables with WEAVIATE_URL, WEAVIATE_API_KEY, ANTHROPIC_API_KEY

## Implementation Details

### Collection Configuration
- Name: "Movie"
- Vectorizer: text2vec-weaviate
- Generative: anthropic
- Properties: title (text), description (text), genre (text)

### Sample Data (5 movies)
1. The Matrix - "A computer hacker learns about the true nature of reality and his role in the war against its controllers." (Science Fiction)
2. Inception - "A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea." (Science Fiction)
3. The Godfather - "The aging patriarch of an organized crime dynasty transfers control to his reluctant son." (Crime)
4. Spirited Away - "A young girl becomes trapped in a mysterious world of spirits and must find a way to save her parents." (Animation)
5. The Dark Knight - "Batman faces the Joker, a criminal mastermind who wants to plunge Gotham into anarchy." (Action)

### Search Modes
- **Vector**: Use `movies.query.near_text()` with query text
- **Hybrid**: Use `movies.query.hybrid()` combining vector and keyword
- **Keyword**: Use `movies.query.bm25()` for keyword-only search

### RAG Options
- **Single Prompt**: `movies.generate.near_text()` with `single_prompt="Explain this movie: {title} - {description}"`
- **Grouped Task**: `movies.generate.near_text()` with `grouped_task="Write a short summary comparing these movies"`

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

Create an HTML interface with 4 sections. Each section has a button that:
- Is disabled until the previous section completes
- Shows the data/config being used
- Displays results after execution
- Has toggles for search modes (section 3) and RAG modes (section 4)

Full documentation: https://docs.weaviate.io/weaviate/quickstart
