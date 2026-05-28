---
title: Boost
sidebar_position: 76
image: og/docs/howto.jpg
description: Soft-rank vector, hybrid, and BM25 results — promote or demote matching documents without filtering them out. Worked Python examples for filter, property, time-decay, numeric-decay, and blended boosts.
# tags: ['boost', 'search', 'ranking']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/search.boost.py';
import BoostPreview from '/_includes/feature-notes/boost.mdx';

<BoostPreview/>

**Boost** soft-ranks search results — promote or demote matching documents without removing them from the result set. Matching documents move up. Non-matching documents stay in the results but rank lower.

Apply boost to vector, hybrid, BM25, near-text, near-vector, near-object, and aggregate queries.

## How it works

A boost is a **post-retrieval rescorer**:

1. The primary search (vector, hybrid, BM25, ...) fetches `depth` candidate results. Set `depth` higher than `offset + limit` if you want boost to consider candidates beyond the first page.
2. The boost scorer rescores those candidates in memory by evaluating each condition per candidate, normalizing per result set, and blending with the primary score. There are no new index queries — the cost is per-candidate in-memory scoring, not extra shard fan-out. Both primary and boost scores are min-max normalized into `[0, 1]` before blending, and the final score is renormalized to `[0, 1]`.
3. The user's original `offset` and `limit` are applied **after** the re-sort.

## Condition types

A boost is one or more **conditions**, blended into a single rescore. Every condition is one of: filter, property value, time decay, or numeric decay.

### Filter condition (soft `WHERE`)

Score is `1` if the result matches the filter, `0` if not. Non-matching documents stay in the result set but rank lower than matching ones. Supported filter operators: `Equal`, `NotEqual`, `GreaterThan`, `GreaterThanEqual`, `LessThan`, `LessThanEqual`, `And`, `Or`, `Not`. (`Like`, `IsNull`, geo operators, and ref-path filters are not supported in boost conditions.)

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BoostFilter"
      endMarker="# END BoostFilter"
      language="py"
    />
  </TabItem>
</Tabs>

### Property-value condition

Continuous score proportional to a numeric property's value (`likes`, `downloads`, `popularity`, ...). The raw value is optionally modified, then min-max normalized to `[0, 1]` across the result set.

The `name` argument is required, only numeric properties (`int`, `number`) are supported.

| Modifier | Effect | When to use |
|---|---|---|
| `NONE` (default) | `score = value` | Values in a narrow range. |
| `LOG1P` | `score = log(1 + value)` | Long-tail dampening (e.g. download counts from `5` to `5_000_000`). |
| `SQRT` | `score = sqrt(value)` | Milder long-tail dampening. |

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BoostProperty"
      endMarker="# END BoostProperty"
      language="py"
    />
  </TabItem>
</Tabs>

For "closer to a specific value is better" instead of "higher is better", use [numeric decay](#numeric-decay) below.

### Time decay

Continuous `[0, 1]` score that **decays with distance from an origin time**. The canonical use case is "boost more recent documents".

| Parameter | Required | Notes |
|---|---|---|
| `property` | Yes | Name of a `date` property. |
| `origin` | No | `"now"` (default), a `datetime`, or an ISO string. |
| `scale` | Yes | Distance at which the score equals `decay`. Accepts a `timedelta` or duration string (`"7d"`, `"6h"`, `"30m"`). |
| `offset` | No | Distance below which the score is exactly `1`. Default `0`. |
| `curve` | No | `EXPONENTIAL` (default), `GAUSSIAN`, or `LINEAR`. See [Curves](#curves) below. |
| `decay` | No | Score at `scale` distance. Default `0.5`. Range `(0, 1]`. |

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BoostTimeDecay"
      endMarker="# END BoostTimeDecay"
      language="py"
    />
  </TabItem>
</Tabs>

### Numeric decay {#numeric-decay}

Like time decay but for numeric (`int`, `number`) properties. Use this when "closer to X is better" — prices near a target, distances near a coordinate, ages near a band. Same `scale` / `offset` / `decay` / `curve` semantics as time decay, with all values expressed as numbers.

`scale` must be `> 0` and `decay` (if set) must be in `(0, 1]` — same as time decay.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BoostNumericDecay"
      endMarker="# END BoostNumericDecay"
      language="py"
    />
  </TabItem>
</Tabs>

## Curves

The three decay curves shape how score falls off with distance. At `distance == 0` the score is always `1`. At `distance == scale` the score is always exactly `decay`. Past `scale` they behave differently:

| Curve | Shape | When to use |
|---|---|---|
| `EXPONENTIAL` (default) | Heavy tail — score halves geometrically every `scale` past the origin. | "Recency matters, but don't aggressively flatten older items to zero." |
| `GAUSSIAN` | Bell curve — sharp falloff past `scale`. | "Items close to the origin are great, items far away are nearly worthless." |
| `LINEAR` | Straight line — score reaches zero at a finite distance past `scale`. | "Predictable falloff with a clear cutoff." |

Only these three values are accepted — anything else is rejected at request time.

## Blending and weights

A boost must carry **at least one** and **at most 20** conditions. Use `Boost.blend(...)` to combine multiple conditions into one rescore. Each condition can carry its own `weight` (default `1.0`). The outer `weight` (default `0.5`) controls how much the combined boost affects the final score.

```
final_score = (1 − weight) · primary_norm + weight · boost_norm
```

- **`weight`** — the outer blending weight, in `[0, 1]`. Defaults to `0.5`.
- **`weight: 0`** is a no-op: the boost short-circuits and primary results are returned unchanged.
- **Per-condition `weight`** — a `float` defaulting to `1.0`. Use it to balance multiple boosts ("recency twice as important as popularity").
- **Negative per-condition `weight`** — *demotes* matching documents. They stay in the result set but rank lower than non-matching ones.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BoostBlend"
      endMarker="# END BoostBlend"
      language="py"
    />
  </TabItem>
</Tabs>

### Negative weights demote

A condition with `weight: -1.0` (or `-2.0`, etc.) reverses the effect: documents that match the condition rank below non-matching ones instead of above them. They are not removed. This is useful for deprioritizing — for example, surfacing drafts last without filtering them out.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START BoostNegativeWeight"
      endMarker="# END BoostNegativeWeight"
      language="py"
    />
  </TabItem>
</Tabs>

## Depth and pagination

`depth` controls the **candidate pool**. The primary search fetches `depth` results before the boost rescorer runs. After rescoring, the user's `offset` and `limit` are applied.

| Property | Value |
|---|---|
| Default | `100` |
| Operator override | [`QUERY_BOOST_DEFAULT_DEPTH`](/deploy/configuration/env-vars#QUERY_BOOST_DEFAULT_DEPTH) env var |
| Hard cap | `QUERY_MAXIMUM_RESULTS` (cluster-wide limit) |
| Lower bound | At least `offset + limit` — boost always sees enough to fill the page |
| Accepted range | `≥ 0` — `0` means "use the default" |

:::tip Raise `depth` to reorder beyond the top page

Boost can only reorder what the primary search already retrieved. If your boost should reorder past the default top-100 — for example, to pull a popular older article back to page 1 — pass a higher `depth` on the query.

Higher `depth` increases the primary search cost (BM25 / vector index work) and per-candidate scoring cost. Set it as tight as your use case allows.

:::

## Further resources

- [Rerank](./rerank.md) — second-stage reranking with an external model.
- [Hybrid search](./hybrid.md) — the BM25 / vector `alpha` blend.
- [Filters](./filters.md) — hard filters (remove non-matching docs).
- [BM25](./bm25.md) — keyword search.

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
