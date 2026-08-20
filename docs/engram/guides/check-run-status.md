---
title: Check run status
description: "How to poll pipeline run status and interpret committed operations in Engram."
image: og/docs/engram.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!../_includes/check_run_status.py';
import AsyncPyCode from '!!raw-loader!../_includes/check_run_status_async.py';
import CurlCode from '!!raw-loader!../_includes/check_run_status.sh';

When you [store memories](store-memories.md), Engram processes them asynchronously through a [pipeline](../concepts/pipelines.md). Each request returns a `run_id` that you can use to track progress.

:::tip
In most cases, you don't need to poll for completion — memories are eventually consistent and will be available for search once the pipeline finishes. Check the initial response from `memories.add` to catch immediate errors. Poll a run only when you need to confirm that a specific run has completed, such as during testing or debugging.
:::

<details>
<summary>All examples below use a connected <code>client</code></summary>

See [Connect to Engram](../quickstart.md#step-3-connect-to-engram) for how to instantiate one.

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py_engram" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START Connect"
  endMarker="# END Connect"
  language="py"
/>

</TabItem>
<TabItem value="py_engram_async" label="Python (Async)">

<FilteredTextBlock
  text={AsyncPyCode}
  startMarker="# START Connect"
  endMarker="# END Connect"
  language="py"
/>

</TabItem>
<TabItem value="curl" label="cURL">

```bash
export ENGRAM_API_KEY="eng_..."
```

</TabItem>
</Tabs>

</details>

## Poll a run

<Tabs className="code" groupId="languages" docsUrl="engram">
<TabItem value="py_engram" label="Python">

<FilteredTextBlock
  text={PyCode}
  startMarker="# START PollRun"
  endMarker="# END PollRun"
  language="py"
/>

</TabItem>
<TabItem value="py_engram_async" label="Python (Async)">

<FilteredTextBlock
  text={AsyncPyCode}
  startMarker="# START PollRun"
  endMarker="# END PollRun"
  language="pyindent"
/>

</TabItem>
<TabItem value="curl" label="cURL">

<FilteredTextBlock
  text={CurlCode}
  startMarker="# START PollRun"
  endMarker="# END PollRun"
  language="bash"
/>

</TabItem>
</Tabs>

### `get` versus `wait`

The Python SDK offers two ways to read a run:

| Call | What it does |
|------|--------------|
| `client.runs.get(run_id)` | A single request that returns the run's current status, whatever it is. Use it for a snapshot, or when you drive your own polling loop. |
| `client.runs.wait(run_id)` | Calls `get` repeatedly until the run reaches a terminal status (`completed` or `failed`), then returns it. Defaults to `timeout=30.0` seconds and `interval=0.5` seconds, and raises `EngramTimeoutError` when the timeout expires first. |

The snippets above use `wait` because they need a finished run. Both methods exist on `AsyncEngramClient` too, as `await client.runs.get(...)` and `await client.runs.wait(...)`.

```python
from engram import EngramTimeoutError

try:
    status = client.runs.wait(run.run_id, timeout=120.0, interval=2.0)
except EngramTimeoutError:
    ...  # not finished yet — check again later with runs.get
```

:::caution `wait` does not return on `in_buffer`
Only `completed` and `failed` count as terminal. A run parked at a [buffer step](../concepts/pipelines.md#pipeline-steps) stays `in_buffer` until its trigger fires — which can be hours — so `wait` raises `EngramTimeoutError` rather than returning. Use `runs.get` for those.
:::

### Response

```json
{
  "run_id": "run-uuid",
  "status": "completed",
  "group_id": "group-uuid",
  "user_id": "alice",
  "starting_step": 1,
  "input_type": "string",
  "committed_operations": {
    "created": [
      {
        "memory_id": "memory-uuid-1",
        "committed_at": "2025-01-01T00:00:01Z"
      }
    ]
  },
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:01Z"
}
```

## Run statuses

| Status | Meaning |
|--------|---------|
| `running` | Pipeline is actively processing the content |
| `in_buffer` | Run is paused at a buffer step, waiting for a trigger to continue |
| `completed` | All operations have been committed successfully |
| `failed` | An error occurred during processing |

## Committed operations

When a run completes, the `committed_operations` field tells you exactly what changed:

- **`created`** — New memories that were added to storage.
- **`updated`** — Existing memories that were modified (e.g. merged or refined).
- **`deleted`** — Memories that were removed (e.g. superseded by an update).

Each entry includes the `memory_id` and a `committed_at` timestamp.

## Handling failures

If a run fails, the `error` field contains a description of what went wrong.

```json
{
  "run_id": "run-uuid",
  "status": "failed",
  "group_id": "group-uuid",
  "user_id": "alice",
  "starting_step": 1,
  "input_type": "string",
  "error": "extraction failed: invalid input format",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:01Z"
}
```

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
