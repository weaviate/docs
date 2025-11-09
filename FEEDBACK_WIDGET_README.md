# Documentation Feedback Widget

This document provides a brief overview of the feedback widget and how to test it locally.

## What It Is

The feedback widget is a component that appears on documentation pages, allowing internal team members to submit feedback.

When a user clicks "Yes" or "No", a modal opens for optional, detailed feedback. Upon submission, a single data object is sent to a Netlify serverless function, which then stores it in a dedicated Weaviate instance.

## Data Payload

The JSON payload sent to the Weaviate instance has the following structure:

```json
{
  "page": "/weaviate/installation",
  "vote": "down",
  "feedbackType": "Content is hard to understand, Other",
  "comments": "The explanation was confusing.",
  "timestamp": "2023-10-27T10:00:00.000Z",
  "testData": true,
  "hostname": "localhost:8888"
}
```
-   `testData` is `true` for any non-production hostname (e.g., localhost, deploy previews).
    - Update `PROD_HOSTNAME = 'docs.weaviate.io'` in `src/components/PageRatingWidget/index.js` if the production hostname changes
-   `feedbackType` is a comma-separated string of the selected checkbox options.

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

### 4. Create the Weaviate Collection

Ensure the `DocFeedback` class exists in your Weaviate instance. It should look like this:

```python
client.collections.create(
    "DocFeedback",
    properties=[
        Property(name="page", data_type=DataType.TEXT, tokenization=Tokenization.FIELD),
        Property(name="vote", data_type=DataType.TEXT, tokenization=Tokenization.FIELD),
        Property(name="feedbackType", data_type=DataType.TEXT),
        Property(name="comments", data_type=DataType.TEXT),
        Property(name="timestamp", data_type=DataType.DATE),
        Property(name="testData", data_type=DataType.BOOL),
        Property(name="hostname", data_type=DataType.TEXT, tokenization=Tokenization.FIELD),
    ],
    vector_config=[Configure.Vectors.self_provided(name="default")],
)
```

## Notes

- Thumbs up & down icons: from Lucide (https://lucide.dev/)
