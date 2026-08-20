---
title: API overview
description: "Engram's REST API: base URL and versioning, bearer authentication, error format and status codes, endpoints, and plan limits."
image: og/docs/engram.png
---

import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import CurlCode from '!!raw-loader!./_includes/api_overview.sh';

Everything in Engram happens over one HTTP API. The [Python SDK](install-integrate.md#python-sdk) wraps it, the [Claude Code plugin](install-integrate.md#claude-code-plugin) calls it, and you can call it directly from any language. This page is the reference for the parts that are the same for every request: where the API lives, how to authenticate, what an error looks like, and what your plan allows.

For the request and response schema of each endpoint, see the [REST API reference](/engram/api/rest).

## Base URL and versioning

```
https://api.engram.weaviate.io/v1
```

Every endpoint is under the `/v1` prefix. Keep these three things in mind, because each one produces the same unhelpful plain-text `404 page not found`:

- **The `/v1` is not optional.** `https://api.engram.weaviate.io/memories` is a 404; `https://api.engram.weaviate.io/v1/memories` is the endpoint.
- **No trailing slash.** `…/v1/memories/` does not match `…/v1/memories`.
- **No project or group ID in the path.** Requests are scoped by the API key you send, not by the URL. There is no `/projects/{project_id}/…` route. To address a group other than `default`, pass a `group` field in the request body or query string.

HTTPS only — port 80 is closed, so an `http://` URL fails to connect rather than redirecting.

## Authentication

Send your [API key](quickstart.md#step-2-create-an-api-key) as a bearer token on every request:

```
Authorization: Bearer eng_your_api_key
```

The key identifies the project, so all reads and writes are confined to that project's memories.

A few details cause most `401` responses:

| What you sent | Result |
|---------------|--------|
| No `Authorization` header | `401` — `detail` reports a missing header |
| The key alone, without `Bearer ` | `401` — the header must use the Bearer scheme |
| `bearer` or `BEARER` instead of `Bearer` | `401` — the scheme is case-sensitive |
| An `X-API-Key` header | `401` — that header is ignored; Engram reads only `Authorization` |
| A key that does not start with `eng_` | `401` — invalid key format |

The `detail` field of the error body tells you which of these it was. Authentication runs before request validation, so a request with both a bad key and a bad body always reports the key.

### Verify a key

`GET /v1/auth/verify` checks a key and nothing else. It returns `204 No Content` with an empty body when the key is valid, and `401` when it is not — useful in a setup script or a health check for your own service.

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START VerifyKey"
  endMarker="# END VerifyKey"
  language="bash"
/>

## Errors

Error responses are problem documents ([RFC 9457](https://www.rfc-editor.org/rfc/rfc9457), formerly RFC 7807) with the content type `application/problem+json`:

```json
{
  "$schema": "https://api.engram.weaviate.io/schemas/ErrorModel.json",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "group \"marketing\" not found"
}
```

Read `detail` for the human-readable cause and `status` for the code. Validation failures add an `errors` array, where each entry has a `message`, the `location` of the offending field, and the `value` that was rejected.

:::note
The prose in `info.description` of the OpenAPI document still describes errors as `{"status", "message"}`. That is out of date — the `ErrorModel` schema in the same document, and the server itself, use the problem-document shape above.
:::

### Status codes

| Code | Meaning | Typical cause |
|------|---------|---------------|
| `400` | Bad request | Semantically invalid input: a missing `user_id` or `properties` value the topic requires, empty `content`, an unknown property key, more than one input type in a single request, or an unrecognized `retrieval_type`. |
| `401` | Unauthorized | Missing, malformed, or unknown API key (see the table above). |
| `403` | Forbidden | The resource belongs to another project — for example a `run_id` created with a different key. |
| `404` | Not found | The memory or run ID does not exist in this project. Also returned, as plain text, for a URL that is missing `/v1`. |
| `422` | Unprocessable entity | The body failed schema validation, or it names something that does not exist: an unknown `group`, an unknown or wrong-case `topic`, or an unknown `user_id` on a get or delete. |
| `429` | Too many requests | The plan's monthly run cap is exhausted. See [Plan limits](#plan-limits). |
| `500` | Internal server error | A server-side failure. |

Topic and group names are matched case-sensitively, so `userknowledge` is a `422` where `UserKnowledge` succeeds.

### Errors in the Python SDK

The SDK raises typed exceptions instead of returning status codes. All of them derive from `EngramError`:

| Exception | Raised when |
|-----------|-------------|
| `APIError` | Any non-success response. Carries `status_code` and the parsed `body`, so you can branch on `429` versus `422`. |
| `AuthenticationError` | A `401`. A subclass of `APIError` with `status_code` fixed at `401`. |
| `ValidationError` | The client rejected your arguments before sending a request. |
| `ConnectionError` | The connection to Engram failed. |
| `EngramTimeoutError` | A run did not reach a terminal status within the timeout you gave. Carries `run_id` and `timeout`. |

```python
from engram import APIError, AuthenticationError

try:
    client.memories.add(...)
except AuthenticationError:
    ...  # bad or missing key
except APIError as err:
    if err.status_code == 429:
        ...  # monthly run cap reached
    raise
```

## Endpoints

| Method and path | What it does | Guide |
|-----------------|--------------|-------|
| `POST /v1/memories` | Send content to the pipeline. Returns a `run_id` immediately. | [Store memories](guides/store-memories.md) |
| `POST /v1/memories/search` | Search memories with a query. | [Search memories](guides/search-memories.md) |
| `POST /v1/memories/list` | List memories without a query. | [List memories](guides/manage-memories.md#list-memories) |
| `GET /v1/memories/{id}` | Get one memory by ID. | [Manage memories](guides/manage-memories.md#get-a-memory) |
| `DELETE /v1/memories/{id}` | Delete one memory by ID. | [Manage memories](guides/manage-memories.md#delete-a-memory) |
| `GET /v1/runs/{run_id}` | Check the status of a pipeline run. | [Check run status](guides/check-run-status.md) |
| `GET /v1/groups` | Read the project's groups and topics. | [Groups and topics](#groups-and-topics) |
| `GET /v1/auth/verify` | Validate an API key. | [Verify a key](#verify-a-key) |

`POST /v1/memories` returns `200` with `{"run_id": "…", "status": "running"}` — the work is queued, not finished, so treat it as an acknowledgement rather than a result. See [Check run status](guides/check-run-status.md).

### Groups and topics

`GET /v1/groups` returns every [group](concepts/groups.md) configured for the project, with the [topics](concepts/topics.md) in each one and the [scope](concepts/scopes.md) each topic requires. It is the reliable way to discover the exact topic names and required properties to send, without reading them off the console.

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START ListGroups"
  endMarker="# END ListGroups"
  language="bash"
/>

<details>

<summary>Example response</summary>

```json
{
  "$schema": "https://api.engram.weaviate.io/schemas/GroupList.json",
  "groups": [
    {
      "group_id": "group-uuid",
      "name": "default",
      "topics": [
        {
          "topic_name": "UserKnowledge",
          "description": "General information about the user.",
          "is_bounded": false,
          "scoping": {
            "user_scoped": true,
            "scope_properties": []
          }
        },
        {
          "topic_name": "ConversationSummary",
          "description": "A running summary of a single conversation.",
          "is_bounded": true,
          "scoping": {
            "user_scoped": true,
            "scope_properties": ["conversation_id"]
          }
        }
      ]
    }
  ]
}
```

</details>

For each topic, `is_bounded` tells you whether a scope holds at most one memory, `scoping.user_scoped` whether a `user_id` is required, and `scoping.scope_properties` which `properties` keys you must send.

:::info Groups and topics are created in the console
`GET /v1/groups` is read-only, and it is the only groups endpoint. There is no public API for creating or editing a project, group, or topic — you configure those in the [Engram console](console.md) when you create the project. Nor is there an API for adding or removing a topic afterwards.
:::

### Service health

`GET https://api.engram.weaviate.io/health` reports whether the service is up. It is the one endpoint that is **not** under `/v1` and needs no API key:

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START Health"
  endMarker="# END Health"
  language="bash"
/>

```json
{ "status": "healthy", "service": "engram-memory-server" }
```

Because it is unauthenticated, it tells you nothing about your key or your project — use [`GET /v1/auth/verify`](#verify-a-key) for that.

## Plan limits

Your plan sets how many [pipeline runs](concepts/pipelines.md#runs) you can make per month and how many projects you can create. On the free plan that is **1,000 runs per month** and **1 project**. Once the cap is reached, further runs are rejected with `429` until the next billing period — nothing is queued, so retry after the reset or upgrade.

A [run](concepts/pipelines.md#runs) is one pipeline execution, started each time you send content with `POST /v1/memories`. Searching, listing, and getting memories do not start a pipeline, so they do not count against the cap.

The console's [Plans page](console.md#plans) shows your current plan and the usage in the current period, and the [pricing page](https://weaviate.io/pricing) (Engram tab) has the limits and prices for every plan.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
