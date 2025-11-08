# Documentation Feedback Widget (Internal MVP)

This document provides a brief overview of the MVP feedback widget and how to test it locally.

## What It Is

The feedback widget is a small component that appears on documentation pages, allowing internal team members to submit quick feedback. This feedback is stored in a dedicated Weaviate instance for analysis.

## How to Test Locally

The widget's backend is a Netlify serverless function. To run this function locally, you must use the Netlify CLI, as the standard Docusaurus development server cannot process the requests.

### 1. Prerequisites

*   Install the Netlify CLI globally:
    ```bash
    npm install -g netlify-cli
    ```
*   You will need the Weaviate URL and API key for the feedback database.

### 2. Create a Local Environment File

Create a file named `.env` at the root of the project. **This file should not be committed to git.**

Add the credentials to your `.env` file like this:

```
WEAVIATE_DOCFEEDBACK_URL="https://your-weaviate-instance.weaviate.network"
WEAVIATE_DOCFEEDBACK_API_KEY="YourSecretWeaviateApiKey"
```

### 3. Run the Development Server

Start the local development environment using the Netlify CLI:

```bash
netlify dev
```

The CLI will automatically start the Docusaurus site and the serverless function, loading your local environment variables. You can now navigate to the local site (usually at `http://localhost:8888`) and test the feedback widget. Submissions will be sent to the configured Weaviate instance.
