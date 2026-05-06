---
title: Query profiling
sidebar_position: 95
image: og/docs/howto.jpg
description: "Profile search queries to get per-shard timing breakdowns for vector search, keyword scoring, and filter evaluation."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/search.profile.py';
import TsCode from '!!raw-loader!/_includes/code/howto/search.profile.ts';
import JavaV6Code from '!!raw-loader!/_includes/code/java-v6/src/test/java/SearchProfileTest.java';
import CsCode from '!!raw-loader!/_includes/code/csharp/SearchProfileTest.cs';
import QueryProfileNote from '/_includes/feature-notes/query-profile.mdx';

<QueryProfileNote/>

Query profiling provides per-shard timing breakdowns for search queries. Enable it on any search request to see how long each phase takes — vector search, keyword scoring, filter evaluation, object retrieval — broken down by shard and cluster node.

Profiling uses the same instrumentation as [slow query logging](/deploy/configuration/logging.md#slow-query-logging). It adds minimal overhead when enabled and zero overhead when disabled.

## Enable profiling

Add `query_profile=True` to `MetadataQuery`, or include `"query_profile"` in the metadata list:

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ProfileNearVector"
      endMarker="# END ProfileNearVector"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TsCode}
      startMarker="// START ProfileNearVector"
      endMarker="// END ProfileNearVector"
      language="ts"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START ProfileNearVector"
      endMarker="// END ProfileNearVector"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CsCode}
      startMarker="// START ProfileNearVector"
      endMarker="// END ProfileNearVector"
      language="csharp"
    />
  </TabItem>
</Tabs>

Profile data is returned on the response object at `response.query_profile`, not on individual result objects. It represents the entire query across all shards.

## Supported search types

| Search type | Profile sections | Query methods |
| :---------- | :--------------- | :------------ |
| Vector search | `vector` | `near_vector`, `near_object`, `near_text`, `near_image`, etc. |
| Keyword search (BM25) | `keyword` | `bm25` |
| Hybrid search | `vector` + `keyword` | `hybrid` |
| Object fetch | `object` | `fetch_objects` |
| Any search + filters | Includes filter metrics | Add `filters` to any search |
| Any search + groupBy | Profile at query level | Add `group_by` to any search |

### BM25 example

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ProfileBM25"
      endMarker="# END ProfileBM25"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TsCode}
      startMarker="// START ProfileBM25"
      endMarker="// END ProfileBM25"
      language="ts"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START ProfileBM25"
      endMarker="// END ProfileBM25"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CsCode}
      startMarker="// START ProfileBM25"
      endMarker="// END ProfileBM25"
      language="csharp"
    />
  </TabItem>
</Tabs>

### Hybrid example

Hybrid search produces both `vector` and `keyword` profile sections per shard:

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ProfileHybrid"
      endMarker="# END ProfileHybrid"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TsCode}
      startMarker="// START ProfileHybrid"
      endMarker="// END ProfileHybrid"
      language="ts"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START ProfileHybrid"
      endMarker="// END ProfileHybrid"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CsCode}
      startMarker="// START ProfileHybrid"
      endMarker="// END ProfileHybrid"
      language="csharp"
    />
  </TabItem>
</Tabs>

## Response structure

The profile is structured as:

```
response.query_profile
  └── shards[]
        ├── name          # Shard identifier (e.g. "shard_0")
        ├── node          # Cluster node (e.g. "weaviate-0")
        └── searches      # Dict of search type → profile
              ├── "vector" → details: { key: value, ... }
              ├── "keyword" → details: { key: value, ... }
              └── "object" → details: { key: value, ... }
```

Each search type contains a `details` dict with string key-value pairs. The available metrics depend on the query type, index configuration, and filter usage.

## Available metrics

### General metrics

| Metric | Description | Present when |
| :----- | :---------- | :----------- |
| `total_took` | Total time for this shard's search | Always |
| `objects_took` | Time retrieving objects from storage | Always |
| `sort_took` | Time sorting results | When sorting is applied |

### Vector search metrics

| Metric | Description |
| :----- | :---------- |
| `vector_search_took` | Time spent in vector index search |
| `knn_search_layer_N_took` | Per-layer HNSW graph traversal time (N = layer number) |
| `knn_search_rescore_took` | Time rescoring compressed vectors (PQ/BQ/SQ) |
| `hnsw_flat_search` | Whether flat (brute-force) search was used instead of HNSW (`"true"` or `"false"`) |

### Filter metrics

| Metric | Description |
| :----- | :---------- |
| `filters_build_allow_list_took` | Time building the filter allow-list |
| `filters_ids_matched` | Number of object IDs matching the filter |

### BM25 keyword metrics

| Metric | Description |
| :----- | :---------- |
| `kwd_method` | BM25 scoring method used (e.g., `blockmaxwand`) |
| `kwd_time` | Total BM25 scoring time |
| `kwd_1_tok_time` | Query tokenization time |
| `kwd_3_term_time` | Term dictionary lookup time |
| `kwd_4_bmw_time` | BlockMaxWAND scoring time |
| `kwd_6_res_count` | Number of results from keyword scoring |

## Example output

A hybrid search on a 3-node cluster with filters produces profiles for both vector and keyword phases on each shard:

```
Shard: shard_abc (node: weaviate-0)
  [keyword]
    kwd_method:                        blockmaxwand
    kwd_time:                          242.75µs
    kwd_1_tok_time:                    18.291µs
    kwd_3_term_time:                   52.083µs
    kwd_4_bmw_time:                    156.417µs
    total_took:                        248.833µs
  [vector]
    filters_build_allow_list_took:     31.125µs
    filters_ids_matched:               847
    knn_search_layer_0_took:           14µs
    objects_took:                      153.542µs
    total_took:                        198.666µs
    vector_search_took:                40.959µs

Shard: shard_def (node: weaviate-1)
  [keyword]
    kwd_method:                        blockmaxwand
    kwd_time:                          189.333µs
    total_took:                        195.25µs
  [vector]
    filters_build_allow_list_took:     27.458µs
    filters_ids_matched:               912
    total_took:                        172.417µs
    vector_search_took:                35.75µs
```

## Multi-node behavior

In multi-node clusters, the coordinator node aggregates profile data from all shards across all nodes. Each shard profile includes the `node` field identifying which cluster node executed that shard's search. This makes it straightforward to identify performance imbalances across nodes.

## Performance impact

- **When disabled (default):** Zero overhead. A single boolean check skips all profiling code paths.
- **When enabled:** Adds timing instrumentation to each shard search. The overhead is small (microsecond-level timer reads) but measurable under high-throughput workloads. Use for debugging and optimization, not in production hot paths.

## Limitations

- **Response-level only:** Profile data is on `response.query_profile`, not on individual objects. It represents the entire query, not individual result objects.
- **Search phases only:** Profiling covers vector search, keyword scoring, and filter evaluation. It does not include time spent in generative modules, rerankers, or post-processing.
- **No per-object breakdown:** You get per-shard timing, not per-object timing.
- **Metrics vary by query:** Not all metrics appear in every response. Available metrics depend on the search type, index type (HNSW vs. flat), compression settings, and whether filters are used.

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
