// Quickstart page prompts for Python and TypeScript

export const fullPrompt = {
  python: `# Weaviate Quickstart Guide for AI Assistants

You are helping a developer get started with Weaviate, an open-source vector database. Follow these steps to set up a working example.

**Note:** If you have access to web browsing or WebSearch tools, please visit the Weaviate documentation for the most up-to-date information:
- Quickstart: https://weaviate.io/developers/weaviate/quickstart
- Query Agent: https://weaviate.io/developers/agents/query/usage
- Python Client: https://weaviate.io/developers/weaviate/client-libraries/python

## Setup

### 1. Create a Weaviate Cloud Sandbox (Free)
1. Go to https://console.weaviate.cloud
2. Create a free Sandbox cluster
3. Get your credentials:
   - REST Endpoint URL (WEAVIATE_URL)
   - Admin API Key (WEAVIATE_API_KEY)

### 2. Install the Python Client
\`\`\`bash
pip install -U "weaviate-client[agents]"
\`\`\`

### 3. Set Environment Variables
\`\`\`bash
export WEAVIATE_URL="your-cluster-url"
export WEAVIATE_API_KEY="your-api-key"
\`\`\`

## Code Examples

### Connect to Weaviate Cloud
\`\`\`python
import weaviate
from weaviate.classes.init import Auth
import os

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
)
print(client.is_ready())  # Should print True
\`\`\`

### Create a Collection with Weaviate Embeddings
No external API keys needed - Weaviate Embeddings (Snowflake Arctic Embed 2.0) is included for Weaviate Cloud users.

\`\`\`python
from weaviate.classes.config import Configure

# Delete if exists (for clean runs)
client.collections.delete("Movie")

# Create collection with Weaviate Embeddings vectorizer
client.collections.create(
    name="Movie",
    vectorizer_config=Configure.Vectorizer.text2vec_weaviate(),  # Uses Weaviate Embeddings
)
\`\`\`

### Import Sample Data
Import at least 30 movies across a variety of genres (Science Fiction, Action, Drama, Comedy, Horror, Romance, Thriller, etc.) to make the search and Query Agent demos more interesting.

\`\`\`python
movies = client.collections.get("Movie")

# Add 30 movies across various genres - here are a few examples:
movie_data = [
    {"title": "The Matrix", "genre": "Science Fiction", "description": "A computer hacker learns about the true nature of reality."},
    {"title": "The Godfather", "genre": "Crime", "description": "The aging patriarch of an organized crime dynasty transfers control to his son."},
    {"title": "Inception", "genre": "Science Fiction", "description": "A thief who steals corporate secrets through dream-sharing technology."},
    {"title": "The Dark Knight", "genre": "Action", "description": "Batman faces the Joker, a criminal mastermind who wants to plunge Gotham into anarchy."},
    {"title": "Forrest Gump", "genre": "Drama", "description": "The story of a man with a low IQ who accomplishes great things in his life."},
    # ... add 25 more movies across different genres (Comedy, Horror, Romance, Thriller, Animation, etc.)
]

with movies.batch.dynamic() as batch:
    for movie in movie_data:
        batch.add_object(properties=movie)

print(f"Imported {len(movie_data)} movies")
\`\`\`

### Semantic Search
\`\`\`python
from weaviate.classes.query import MetadataQuery

movies = client.collections.get("Movie")

response = movies.query.near_text(
    query="sci-fi adventure",
    limit=2,
    return_metadata=MetadataQuery(distance=True)
)

for obj in response.objects:
    print(f"{obj.properties['title']}: {obj.properties['description']}")
    print(f"Distance: {obj.metadata.distance}")
\`\`\`

## RECOMMENDED: Query Agent (Easiest Way to Query)

The Query Agent lets you query your data using natural language - no need to learn the query syntax!

\`\`\`python
from weaviate.agents.query import QueryAgent

agent = QueryAgent(
    client=client,
    collections=["Movie"]
)

response = agent.run("What sci-fi movies are in the database?")
print(response.final_answer)
\`\`\`

### Close Connection
\`\`\`python
client.close()
\`\`\`
`,

  typescript: `# Build a Weaviate Search App with Next.js

You are helping a developer build a simple Next.js application that connects to Weaviate Cloud. The app should have a single-page UI with two search modes:
1. **Semantic Search** - Using Weaviate's nearText() for vector similarity search
2. **Query Agent** - Using natural language questions with the Weaviate Query Agent

**Note:** If you have access to web browsing or WebSearch tools, please visit the Weaviate documentation for the most up-to-date information:
- Quickstart: https://weaviate.io/developers/weaviate/quickstart
- Query Agent: https://weaviate.io/developers/agents/query/usage
- TypeScript Client: https://weaviate.io/developers/weaviate/client-libraries/typescript

## Prerequisites

### 1. Create a Weaviate Cloud Sandbox (Free)
1. Go to https://console.weaviate.cloud
2. Create a free Sandbox cluster
3. Get your credentials:
   - REST Endpoint URL (WEAVIATE_URL)
   - Admin API Key (WEAVIATE_API_KEY)

## Project Setup

### 1. Create Next.js Project
\`\`\`bash
npx create-next-app@latest weaviate-search-app --typescript --tailwind --app --src-dir
cd weaviate-search-app
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install weaviate-client weaviate-agents@latest
\`\`\`

### 3. Create Environment File
Create \`.env.local\` in project root:
\`\`\`
WEAVIATE_URL=your-cluster-url
WEAVIATE_API_KEY=your-api-key
\`\`\`

## Implementation

### 1. Weaviate Client Utility
Create \`src/lib/weaviate.ts\`:
\`\`\`typescript
import weaviate, { WeaviateClient } from 'weaviate-client';

let client: WeaviateClient | null = null;

export async function getWeaviateClient(): Promise<WeaviateClient> {
  if (client) return client;

  client = await weaviate.connectToWeaviateCloud(process.env.WEAVIATE_URL!, {
    authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!),
  });

  return client;
}
\`\`\`

### 2. Setup Script (Run Once)
Create \`scripts/setup.ts\` to initialize collection and sample data:
\`\`\`typescript
import weaviate from 'weaviate-client';

async function setup() {
  const client = await weaviate.connectToWeaviateCloud(process.env.WEAVIATE_URL!, {
    authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!),
  });

  // Delete existing collection if present
  try {
    await client.collections.delete('Movie');
  } catch (e) {
    // Collection doesn't exist, continue
  }

  // Create collection with Weaviate Embeddings (no external API keys needed!)
  await client.collections.create({
    name: 'Movie',
    vectorizers: weaviate.configure.vectorizer.text2VecWeaviate(),
  });

  // Import sample data - add 30 movies across various genres for better demos
  const movies = client.collections.get('Movie');

  // Add 30 movies across different genres (Science Fiction, Action, Drama, Comedy, Horror, Romance, Thriller, Animation, etc.)
  // Here are some examples - expand this to 30 total:
  await movies.data.insertMany([
    { title: 'The Matrix', genre: 'Science Fiction', description: 'A computer hacker learns about the true nature of reality and joins a rebellion against machine overlords.' },
    { title: 'Inception', genre: 'Science Fiction', description: 'A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea.' },
    { title: 'The Godfather', genre: 'Crime', description: 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son.' },
    { title: 'The Dark Knight', genre: 'Action', description: 'Batman faces the Joker, a criminal mastermind who wants to plunge Gotham City into anarchy.' },
    { title: 'Forrest Gump', genre: 'Drama', description: 'The story of a man with a low IQ who accomplishes great things and witnesses historical events.' },
    // ... add 25 more movies across genres: Comedy, Horror, Romance, Thriller, Animation, etc.
  ]);

  console.log('Setup complete! Collection created and data imported.');
  await client.close();
}

setup();
\`\`\`

Run with: \`npx tsx scripts/setup.ts\`

### 3. Search API Route
Create \`src/app/api/search/route.ts\`:
\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server';
import { getWeaviateClient } from '@/lib/weaviate';

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 5 } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const client = await getWeaviateClient();
    const movies = client.collections.get('Movie');

    const response = await movies.query.nearText(query, {
      limit,
      returnMetadata: ['distance'],
    });

    const results = response.objects.map((obj) => ({
      title: obj.properties.title,
      genre: obj.properties.genre,
      description: obj.properties.description,
      distance: obj.metadata?.distance,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
\`\`\`

### 4. Query Agent API Route with Streaming (Recommended for better UX)
Create \`src/app/api/agent/route.ts\` using streaming for real-time responses:
\`\`\`typescript
import { NextRequest } from 'next/server';
import { getWeaviateClient } from '@/lib/weaviate';
import { QueryAgent } from 'weaviate-agents';

export async function POST(request: NextRequest) {
  const { question } = await request.json();

  if (!question) {
    return new Response(JSON.stringify({ error: 'Question is required' }), { status: 400 });
  }

  const client = await getWeaviateClient();
  const agent = new QueryAgent(client, { collections: ['Movie'] });

  // Use streaming for better UX - tokens appear as they're generated
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of agent.askStream(question, {
          includeProgress: true,
          includeFinalState: true,
        })) {
          if (event.outputType === 'progressMessage') {
            // Send progress updates
            controller.enqueue(encoder.encode(\`data: \${JSON.stringify({ type: 'progress', message: event.message })}\\n\\n\`));
          } else if (event.outputType === 'streamedTokens') {
            // Stream answer tokens as they arrive
            controller.enqueue(encoder.encode(\`data: \${JSON.stringify({ type: 'token', delta: event.delta })}\\n\\n\`));
          } else if (event.outputType === 'finalState') {
            // Send final response with sources
            controller.enqueue(encoder.encode(\`data: \${JSON.stringify({ type: 'done', answer: event.finalAnswer, sources: event.sources })}\\n\\n\`));
          }
        }
      } catch (error) {
        controller.enqueue(encoder.encode(\`data: \${JSON.stringify({ type: 'error', message: 'Query failed' })}\\n\\n\`));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
\`\`\`

### 5. Main Page UI with Streaming Support
Replace \`src/app/page.tsx\`:
\`\`\`typescript
'use client';

import { useState } from 'react';

type SearchResult = {
  title: string;
  genre: string;
  description: string;
  distance?: number;
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [agentAnswer, setAgentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'search' | 'agent'>('search');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setAgentAnswer('');

    try {
      if (mode === 'search') {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, limit: 5 }),
        });
        const data = await res.json();
        setResults(data.results || []);
      } else {
        // Stream the agent response for better UX
        const res = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: query }),
        });

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let answer = '';

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\\n').filter(line => line.startsWith('data: '));

          for (const line of lines) {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'token') {
              answer += data.delta;
              setAgentAnswer(answer);
            } else if (data.type === 'done') {
              setAgentAnswer(data.answer);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Weaviate Movie Search</h1>
      <p className="text-gray-600 mb-6">Search movies using semantic search or ask questions with the Query Agent</p>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('search')}
          className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
            mode === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }\`}
        >
          Semantic Search
        </button>
        <button
          onClick={() => setMode('agent')}
          className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
            mode === 'agent' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }\`}
        >
          Query Agent
        </button>
      </div>

      {/* Search Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={mode === 'search' ? 'Search for movies (e.g., "sci-fi adventure")' : 'Ask a question (e.g., "What sci-fi movies are available?")'}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : mode === 'search' ? 'Search' : 'Ask'}
        </button>
      </div>

      {/* Results */}
      {mode === 'search' && results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Results</h2>
          {results.map((movie, index) => (
            <div key={index} className="p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{movie.title}</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{movie.genre}</span>
              </div>
              <p className="text-gray-600 mt-2">{movie.description}</p>
              {movie.distance !== undefined && (
                <p className="text-sm text-gray-400 mt-2">Distance: {movie.distance.toFixed(4)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {mode === 'agent' && agentAnswer && (
        <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
          <h2 className="text-xl font-semibold mb-2">Agent Answer</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{agentAnswer}</p>
        </div>
      )}
    </main>
  );
}
\`\`\`

## Running the App

1. **Run the setup script** (once, to create collection and import data):
   \`\`\`bash
   npx tsx scripts/setup.ts
   \`\`\`

2. **Start the Next.js app**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open http://localhost:3000 and try:
   - **Semantic Search**: "sci-fi movies", "crime drama", "inspiring story"
   - **Query Agent**: "What movies are about technology?", "List all sci-fi movies"
`,
};

export const condensedPrompt = {
  python: `# Weaviate Quickstart (Python)

**If you have WebSearch access, visit https://weaviate.io/developers/weaviate/quickstart for latest docs.**

Setup: Create free sandbox at console.weaviate.cloud, get WEAVIATE_URL and WEAVIATE_API_KEY.

Install: pip install -U "weaviate-client[agents]"

\`\`\`python
import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.config import Configure
import os

# Connect
client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.environ["WEAVIATE_URL"],
    auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
)

# Create collection with Weaviate Embeddings (no external API keys needed)
client.collections.delete("Movie")
client.collections.create(name="Movie", vectorizer_config=Configure.Vectorizer.text2vec_weaviate())

# Import data - create 30 movies across various genres (Sci-Fi, Action, Drama, Comedy, Horror, Romance, Thriller, etc.)
movies = client.collections.get("Movie")
data = [
    {"title": "The Matrix", "genre": "Sci-Fi", "description": "A hacker discovers reality is a simulation."},
    {"title": "Inception", "genre": "Sci-Fi", "description": "A thief steals secrets through dreams."},
    {"title": "The Godfather", "genre": "Crime", "description": "A crime family's patriarch transfers power."},
    # ... add 27 more movies across different genres
]
with movies.batch.dynamic() as batch:
    for item in data:
        batch.add_object(properties=item)

# Semantic search
response = movies.query.near_text(query="science fiction", limit=2)
for obj in response.objects:
    print(obj.properties)

# RECOMMENDED: Query Agent (natural language queries)
from weaviate.agents.query import QueryAgent
agent = QueryAgent(client=client, collections=["Movie"])
print(agent.run("What sci-fi movies exist?").final_answer)

client.close()
\`\`\`

More docs: https://weaviate.io/developers/agents/query/usage`,

  typescript: `# Build a Weaviate Search App (Next.js + TypeScript)

**If you have WebSearch access, visit https://weaviate.io/developers/weaviate/quickstart for latest docs.**

Create a Next.js app with semantic search and Query Agent UI.

Setup: Create sandbox at console.weaviate.cloud, get WEAVIATE_URL and WEAVIATE_API_KEY.

\`\`\`bash
npx create-next-app@latest weaviate-search --typescript --tailwind --app
cd weaviate-search && npm install weaviate-client weaviate-agents@latest
\`\`\`

Create .env.local with WEAVIATE_URL and WEAVIATE_API_KEY.

Key files to create:
1. src/lib/weaviate.ts - Client singleton using connectToWeaviateCloud()
2. scripts/setup.ts - Initialize collection with text2VecWeaviate() vectorizer, import 30 sample movies across various genres
3. src/app/api/search/route.ts - POST endpoint using nearText() search
4. src/app/api/agent/route.ts - POST endpoint using QueryAgent with streaming (askStream) for better UX
5. src/app/page.tsx - UI with search input, mode toggle (Search/Agent), streaming response display

**Use streaming for Query Agent (better UX):**
\`\`\`typescript
import { QueryAgent } from 'weaviate-agents';

const agent = new QueryAgent(client, { collections: ['Movie'] });

// Use askStream for real-time token streaming
for await (const event of agent.askStream(question, { includeProgress: true, includeFinalState: true })) {
  if (event.outputType === 'streamedTokens') {
    process.stdout.write(event.delta); // Tokens arrive in real-time
  } else if (event.outputType === 'finalState') {
    console.log(event.finalAnswer);
  }
}
\`\`\`

Run setup script once: npx tsx scripts/setup.ts
Then: npm run dev

More docs: https://weaviate.io/developers/agents/query/usage`,
};
