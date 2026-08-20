---
title: Install & integrate
description: "Ways to use Engram: the Python SDK, the REST API, and agent integrations such as the Claude Code and Hermes memory plugins."
image: og/docs/engram.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

There are several ways to use Engram, from calling the API directly to dropping it into an agent framework as a memory provider.

- **[Python SDK](#python-sdk)** — the `weaviate-engram` client for Python applications.
- **[REST API](#rest-api)** — call Engram over HTTP from any language. Start with the [API overview](api-overview.md).
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

### Errors

The SDK raises typed exceptions rather than returning status codes: `AuthenticationError` for a rejected API key, `APIError` — carrying `status_code` and the parsed response `body` — for every other failed request, `ValidationError` when the client rejects your arguments before sending anything, and `EngramTimeoutError` when `runs.wait()` gives up on a run. All of them derive from `EngramError`, and all are importable from `engram`.

See [Errors in the Python SDK](api-overview.md#errors-in-the-python-sdk) for the full table and a `try`/`except` example.

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

The [API overview](api-overview.md) covers the base URL, authentication and the `401` responses that trip people up, the error format and status codes, and your plan's limits. The [REST API reference](/engram/api/rest) has the schema of every endpoint, and the [guides](guides/store-memories.md) cover storing, searching, and managing memories.

:::note TypeScript and other languages
The Python SDK is the only official client. There is no Weaviate-published npm package for Engram — the `engram-sdk` package on npm is an unrelated third-party project — so from TypeScript, Go, or anything else, call the REST API directly.
:::

## Claude Code plugin

The [`engram` plugin](https://github.com/weaviate/engram-plugins) gives [Claude Code](https://claude.com/claude-code) long-term memory backed by Engram. It recalls relevant memories before each answer and stores each completed turn — everything happens automatically via hooks, with no tools for the agent to call. Memory is best-effort and never blocks a session.

### Install

Create an Engram project in the [Engram console](https://console.weaviate.cloud) and set its API key in a shell profile that persists (`~/.zshenv`, `~/.zshrc`, or `~/.bashrc`):

```bash
export ENGRAM_API_KEY=...
```

Then install the plugin inside a Claude Code session:

```bash
/plugin marketplace add weaviate/engram-plugins
/plugin install engram@weaviate-engram
```

That's it — memory starts working on your next prompt.

Which [topics](concepts/topics.md) get extracted is decided by the project you point the key at, so pick the template whose topics suit coding sessions when you create it. Note that only the personalization pipeline is available on the free plan; the other presets start at the Starter plan (see the [pricing page](https://weaviate.io/pricing), Engram tab).

### Identity

The plugin sends a `user_id` so memories stay separate per person. It defaults to your `git config user.email`; set `ENGRAM_USER_ID` to override it.

### Scope properties

Before each store, the plugin reads your project's [scope](concepts/scopes.md) requirements from [`GET /v1/groups`](api-overview.md#groups-and-topics) and resolves the properties it knows about:

| Property | Resolved from |
|----------|---------------|
| `repo_name` | The git remote's owner-scoped repository name, falling back to the working directory when there is no remote |
| `session_id` | The Claude Code session ID |

Those two are the only built-ins.

:::caution A topic scoped by anything else needs a mapping
If any topic in your project's group is scoped by another property — a `ConversationSummary` topic scoped by `conversation_id`, for example — the plugin has nothing to resolve it from, the store request is rejected for insufficient scope, and **every turn** ends with an `Engram · saving memory failed` notice until you map it.

Map it in a `.engram.json` in the project directory:

```json
{
  "properties": {
    "conversation_id": { "from": "session_id" }
  }
}
```
:::

### Configuration

Two optional files configure scope resolution and how recall is narrowed:

| File | Scope | What it may contain |
|------|-------|---------------------|
| `~/.engram/config.json` | Your machine, everywhere | Everything below, including `cmd` sources |
| `.engram.json` | One project directory, safe to commit | Literals and `from` tokens only — a `cmd` here is ignored, so a cloned repository cannot run a command on your machine |

A property value's JSON shape decides how it resolves:

- A **string** is a literal, used verbatim: `"payments"`.
- An **object** is a dynamic source — `{"from": "<token>"}` for a built-in value, where the tokens are `git-repo`, `cwd`, and `session_id`; or `{"cmd": ["prog", "arg"]}` to run a command directly, with no shell.
- An **array** is a cascade: entries are tried in order and the first non-empty value wins.

A `search` object narrows what gets recalled — `search.properties` restricts recall to memories matching those scope keys, and `search.topics` restricts it to named topics, each with its own optional filter. Search is broad by default.

The plugin caches your project's scope requirements after the first fetch, so reinstall it if you repoint the key at a differently configured project. Configuration always overrides the cache.

### Environment variables

| Variable | Purpose |
|----------|---------|
| `ENGRAM_API_KEY` | Your Engram API key. Required. |
| `ENGRAM_USER_ID` | Override the identity memories are stored under. Defaults to `git config user.email`. |
| `ENGRAM_BASE_URL` | Point the plugin at a different Engram endpoint. |

### When something is wrong

Because memory is best-effort, the plugin never fails a session. When it needs attention — a bad API key, an unresolvable scope property — Claude surfaces a short `Engram · …` note at the top of its reply. See the [plugin README](https://github.com/weaviate/engram-plugins) for the full configuration reference.

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
