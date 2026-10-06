---
title: Install & integrate
description: "Ways to use Engram: the Python SDK, the REST API, and agent integrations such as the Claude Code and Hermes memory plugins."
image: og/docs/engram.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

There are several ways to use Engram, from calling the API directly to dropping it into an agent framework as a memory provider.

- **[Python SDK](#python-sdk)** — the `weaviate-engram` client for Python applications.
- **[REST API](#rest-api)** — call Engram over HTTP from any language.
- **[Claude Code plugin](#claude-code-plugin)** — persistent, cross-session memory for Claude Code through the `engram` plugin.
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

Engram is a REST service at `https://api.engram.weaviate.io/v1`. Every path carries the `/v1` prefix, and requests are scoped by the API key rather than by a project ID in the URL. Authenticate every request with your API key as a bearer token:

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

## Claude Code plugin

The [`engram` plugin](https://github.com/weaviate/engram-plugins) gives [Claude Code](https://claude.com/claude-code) long-term memory backed by Engram. It recalls relevant memories before each answer and stores each completed turn — everything happens automatically via hooks, with no tools for the agent to call. Memory is best-effort and never blocks a session.

When creating your Engram project, you choose [topics](concepts/topics.md) that control what memories get extracted. Select the **Coding Assistant** template for topics tailored to coding sessions — you can also define custom topics for a more tailored experience.

Once the project is created, set your API key in your shell profile (e.g. `~/.zshrc` or `~/.bashrc`), then install the plugin inside a Claude Code session:

```bash
export ENGRAM_API_KEY=...
```

Then install the plugin inside a Claude Code session:

```bash
/plugin marketplace add weaviate/engram-plugins
/plugin install engram@weaviate-engram
```

That's it — memory starts working on your next prompt. By default the plugin recalls only memories from the repository you are working in, filtering on the `repo_name` property; set `search.properties` to `[]` in a `.engram.json` to recall across all of them. See the [plugin README](https://github.com/weaviate/engram-plugins) for more info and optional customization.

## Hermes Agent

[`hermes-weaviate-engram`](https://github.com/weaviate/hermes-weaviate-engram) is a memory provider plugin that gives the [Hermes Agent](https://github.com/NousResearch/hermes-agent) long-term memory backed by Engram. It recalls relevant memories into the system prompt before each turn, and stores each completed turn through Engram's pipeline.

The plugin is not published on PyPI, so install it from the repository, then run the setup wizard, which prompts for your API key:

```bash
pip install git+https://github.com/weaviate/hermes-weaviate-engram
hermes memory setup        # choose weaviate_engram
```

:::note It pins an older SDK
The plugin requires `weaviate-engram>=0.6,<1`, so installing it into an environment that already has the current 1.x [Python SDK](#python-sdk) downgrades that SDK. Install it into its own virtual environment if you also write against the SDK directly.
:::

The wizard saves `ENGRAM_API_KEY` to `~/.hermes/.env` and sets `memory.provider` in your Hermes config.

The plugin exposes three tools to the agent:

| Tool | Description |
|------|-------------|
| `engram_search` | Search memories by semantic similarity. |
| `engram_store` | Store a memory. This is also how the agent "forgets" — it stores a correcting memory, and Engram's reconcile pipeline supersedes the old one. |
| `engram_fetch` | Profile-shaped recall, such as "what do you know about me?" |

Optional settings live in `~/.hermes/weaviate_engram.json` (for example `auto_recall`, `auto_capture`, and `max_recall_results`). Set `ENGRAM_BASE_URL` to point at a non-default Engram endpoint, such as a staging deployment. See the [plugin README](https://github.com/weaviate/hermes-weaviate-engram) for the full configuration reference.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
