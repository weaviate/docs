# Weaviate Docs MCP Server

## How it works

1. You ask a question in Claude Desktop or Cursor
2. The MCP server sends your query to kapa.ai
3. kapa.ai performs semantic search using Weaviate
4. Results are returned with citations and relevant documentation snippets

### Architecture

The MCP server is built as a Netlify Edge Function using Deno runtime. It implements the Model Context Protocol specification to expose Weaviate documentation as a tool that AI assistants can use.

**Key components:**

- **Edge Function**: Serverless function handling MCP protocol requests
- **kapa.ai Integration**: API integration for documentation search
- **Server-Sent Events (SSE)**: Real-time communication with MCP clients

## How to deploy Weaviate Docs MCP server

### Step 1: Get Your Kapa.ai Credentials

1. Log in to your [kapa.ai dashboard](https://kapa.ai)
2. Navigate to **API Keys** and create a new API key
3. Note your **Project ID** (UUID in the dashboard URL)
4. Create a new **Integration** and note the Integration ID

### Step 2: Install Netlify CLI

```bash
npm install -g netlify-cli
netlify login
```

### Step 3: Configure Environment Variables

```bash
netlify env:set KAPA_API_KEY "your-api-key"
netlify env:set KAPA_PROJECT_ID "your-project-id"
netlify env:set KAPA_INTEGRATION_ID "your-integration-id"
```

### Step 4: Deploy

```bash
netlify deploy --prod
```

Your MCP server will be available at: `https://your-site-name.netlify.app/mcp-server`
