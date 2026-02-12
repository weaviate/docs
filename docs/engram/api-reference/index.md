---
title: API reference
sidebar_position: 4
description: "Engram REST API overview: authentication, base URL, and interactive API reference."
---

The Engram API is a REST API for storing, searching, and managing memories.

## Base URL

Your project's API URL is available in the [Weaviate Cloud console](https://console.weaviate.cloud). It follows the format:

```
https://your-project.engram.weaviate.cloud
```

## Authentication

Include your API key in the `Authorization` header:

```
Authorization: Bearer eng_your_api_key
```

API keys are scoped to a project. All requests authenticated with a key operate within that project's scope. You can create and manage API keys in the Weaviate Cloud console.

## Interactive API reference

The full API reference is generated from the OpenAPI spec and includes request/response schemas, parameter details, and example payloads.

**[Open the interactive API reference](/engram/api-reference/rest)**

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/memories` | Store a new memory (async) |
| GET | `/v1/memories/{id}` | Get a memory by ID |
| DELETE | `/v1/memories/{id}` | Delete a memory |
| POST | `/v1/memories/search` | Search memories |
| GET | `/v1/runs/{run_id}` | Get pipeline run status |

## Error format

All error responses use a consistent format:

```json
{
  "status": 400,
  "message": "error description"
}
```

### HTTP status codes

| Code | Description |
|------|-------------|
| 400 | Bad request — invalid input or missing required fields |
| 401 | Unauthorized — missing or invalid API key |
| 403 | Forbidden — insufficient permissions |
| 404 | Not found — resource does not exist |
| 500 | Internal server error |

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
