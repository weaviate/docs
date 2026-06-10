---
title: Install & integrate
description: "Ways to use Engram: the Python SDK, the REST API, and agent integrations such as the Hermes memory plugin."
image: og/docs/engram.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

There are several ways to use Engram, from calling the API directly to dropping it into an agent framework as a memory provider.

- **[Python SDK](#python-sdk)** — the `weaviate-engram` client for Python applications.
- **[REST API](#rest-api)** — call Engram over HTTP from any language.
- **[Hermes Agent](#hermes-agent)** — long-term memory for the Hermes Agent through the `hermes-weaviate-engram` plugin.

Every method authenticates with an [Engram API key](quickstart.md#step-2-create-an-api-key).

## Python SDK

Install the [`weaviate-engram`](https://pypi.org/project/weaviate-engram/) client:

<Tabs groupId="python-install">
<TabItem value="pip" label="pip">

```bash
pip install weaviate-engram
```

</TabItem>
<TabItem value="uv" label="uv">

```bash
uv add weaviate-engram
```

</TabItem>
</Tabs>

Connect with your API key, then store and search memories:

```python
import os
from engram import EngramClient

client = EngramClient(api_key=os.environ["ENGRAM_API_KEY"])
```

For an async client, use `AsyncEngramClient` instead. The [Quickstart](quickstart.md) has a full walkthrough, and the [guides](guides/store-memories.md) cover storing, searching, and managing memories. The source is on [GitHub](https://github.com/weaviate/engram-python-sdk).

## REST API

Engram is a REST service at `https://api.engram.weaviate.io`. Authenticate every request with your API key as a bearer token:

```bash
curl -X POST "https://api.engram.weaviate.io/v1/memories" \
  -H "Authorization: Bearer $ENGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {"string": {"content": ["The user prefers dark mode."]}},
    "user_id": "alice"
  }'
```

See the [REST API reference](/engram/api/rest) for the full list of endpoints, and the [guides](guides/store-memories.md) cover storing, searching, and managing memories.

## Hermes Agent

[`hermes-weaviate-engram`](https://github.com/weaviate/hermes-weaviate-engram) is a memory provider plugin that gives the [Hermes Agent](https://github.com/NousResearch/hermes-agent) long-term memory backed by Engram. It recalls relevant memories into the system prompt before each turn, and stores each completed turn through Engram's pipeline.

Install the plugin and run the setup wizard, which prompts for your API key:

```bash
pip install hermes-weaviate-engram
hermes memory setup        # choose weaviate_engram
```

The wizard saves `ENGRAM_API_KEY` to `~/.hermes/.env` and sets `memory.provider` in your Hermes config.

The plugin exposes three tools to the agent:

| Tool | Description |
|------|-------------|
| `engram_search` | Search memories by semantic similarity. |
| `engram_store` | Store a memory. This is also how the agent "forgets" — it stores a correcting memory, and Engram's reconcile pipeline supersedes the old one. |
| `engram_fetch` | Profile-shaped recall, such as "what do you know about me?" |

Optional settings live in `~/.hermes/weaviate_engram.json` (for example `auto_recall`, `auto_capture`, and `max_recall_results`). Set `ENGRAM_BASE_URL` to point at a staging or self-hosted endpoint. See the [plugin README](https://github.com/weaviate/hermes-weaviate-engram) for the full configuration reference.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
