---
title: Resource Planning
sidebar_position: 90
description: "Theoretical resource-planning examples, published calibration, and validation guidance for Weaviate workloads."
image: og/docs/concepts.jpg
# tags: ['architecture', 'resource', 'cpu', 'memory', 'gpu']
---

Plan CPU, memory, and disk capacity for your vector count, dimensions, index type, compression, and query workload. Count the vectors produced by chunking and each named or token-level vector space, not just source documents.

**Theoretical / not benchmarked:** the five starting configurations on this page are proposed allocations for evaluation, not measured requirements or production recommendations. No Weaviate instance, import, benchmark, or workload test was run to produce them. Throughput, latency, and recall remain unknown. Source checks were performed on November 21, 2026; living documentation and deployed releases can differ.

## Published calibration: what was actually measured

The [HFresh engineering article][B1] (September 9, 2026) reports vendor measurements, not measurements of the scenarios below:

| Published observation | Conditions and scope | What it does not establish |
|---|---|---|
| Heap at rest: **6.67 GB** uncompressed HNSW, **2.38 GB** HNSW/RQ8, **239 MB** HFresh | DBpedia OpenAI 1M; HNSW `maxConnections=16`, `efConstruction=256`. Labels GB/MB are retained as published. These are **Go heap**, excluding OS-managed caching, not whole-process RSS or node RAM. | The DBpedia OpenAI dataset is 1536d [B3], unlike the 768d model below, which also uses different graph settings. The article does not pin a server commit for this comparison. Do not use these figures as model coefficients or compare them directly with the RAM allocations below. |
| **204 GB** peak VM memory; **54 GB** VM memory and **47 GB** Go heap after restart; **3.09 TB** peak disk and **2.28 TB** disk after import | Separate **1 billion random 256d vector construction** test; 32 vCPUs, 256 GB RAM (`n2-highmem-32`), 4 TB SSD Persistent Disk (`pd-ssd`); default construction settings, batches of 1,000 with 12 workers. VM memory is from GCP system metrics; heap is from a Go heap profile. | No recall or QPS measurements were collected for the billion-vector test. Construction, restart, and settled search are distinct phases. This is not evidence of billion-vector query quality or linear scaling to the scenarios below. |

For its separate DBpedia query comparison, the article reports higher throughput for HNSW and its quantized variants than HFresh at comparable recall. A smaller heap is not proof of equivalent query performance. The following allocations are transparent planning choices, not reproductions of those results.

## Plan resources for your workload

Count objects, vectors, and indexed properties before choosing a test machine. A million small objects with one vector space differ from a million objects with several spaces, searchable text, or sustained writes.

These five examples separate **modelled consumption** from **provisioned capacity**. Use them to discuss an initial budget, not to promise throughput, latency, or recall. All performance outputs remain unknown.

### Reference workload and data

Every row assumes one collection, **one node, one shard, replication factor 1**, cosine distance, and externally supplied float32 vectors. Embedding/generation services are excluded. S5 uses two named vectors, not token-level multi-vectors.

Each object contains exactly 1,024 UTF-8 bytes of text and one 16-byte category value. Text has `indexSearchable=false` and `indexFilterable=false`. Category uses field tokenization, `indexFilterable=true`, `indexSearchable=false`, and 100 evenly populated categories. Optional timestamp, null-state, property-length, and range indexes are off. UUIDs, serialization, and the category bitmap index still cost space; the appendix budgets them explicitly. Different cardinality, skew, or text indexing changes that budget [W8].

The reference intent is **batch ingestion followed by low-concurrency exploration**: proposed batches of 200 objects with at most two batches in flight, then one to four concurrent top-10 vector requests returning IDs and distances. Search has no concurrent writes or filters. These are evaluation choices, not achieved performance or an SLO. Reduce batch size if import pressure requires it.

The HNSW scenarios (S1–S3 and each S5 target) use `maxConnections=32`, `efConstruction=128`, and fixed search `ef=64`; these are not settings for HFresh's internal centroid index. HNSW RQ supports 1, 4, and 8 bits [W3]; these examples choose 8 bits, not a restriction to that width. S1 explicitly disables quantization; S2, S3, and each S5 target explicitly enable RQ8 with `rescoreLimit=20`, without centering. The model keeps all HNSW search representations cached, not all original float vectors in compressed cases. HFresh uses built-in RQ1 postings and RQ8 centroids, `maxPostingSizeKB=48`, posting `replicas=4`, `searchProbe=256`, and `rescoreLimit=350` [W2] [W3]. Posting replicas do not provide node-level availability.

### Starting allocations

**THEORETICAL / NOT BENCHMARKED. Per-node outputs; RAM and SSD in GiB. Generic allocations, not provider SKUs.**

| Scenario: THEORETICAL / NOT BENCHMARKED | Objects; vectors/object; dimensions | Index | vCPU starting budget | RAM allocation | SSD allocation | Modelled memory incl. cache | Modelled settled disk | QPS / latency / recall |
|---|---|---|---:|---:|---:|---:|---:|---|
| S1 | 1M; 1; 768 | HNSW, uncompressed | 4 | 16 | 32 | about 6–9 | about 4.5–6 | Unknown |
| S2 | 1M; 1; 768 | HNSW, RQ8 | 4 | 8 | 32 | about 4–7 | about 5–6.5 | Unknown |
| S3 | 5M; 1; 768 | HNSW, RQ8 | 8 | 32 | 128 | about 15–24 | about 26–32 | Unknown |
| S4 | 5M; 1; 768 | HFresh, built-in compression | 8 | 16 | 64 | about 8–14 | about 24–28 | Unknown |
| S5 | 1M; 2 named; 768 each | HNSW, RQ8 per target | 8 | 16 | 32 | about 6.5–10 | about 9–11 | Unknown |

Memory includes runtime/import and file-cache allowances, **not measured peaks**. SSD includes temporary reserve. The 128 GiB versus 64 GiB allocations in S3/S4 reflect reserve and rounding, not a claimed twofold storage reduction: their modelled settled-disk ranges overlap. The appendix explains the budgets and rounding.

### What the comparison suggests

**S1 versus S2 isolates compression.** A 768d float32 vector has 3,072 value bytes; the pinned RQ8 implementation needs 784 code bytes including metadata. That saves vector-cache memory, but the HNSW graph remains. Both representations coexist on disk because originals remain available for rescoring. Therefore S2 can need more disk than S1, despite its smaller RAM allocation [W4] [I1].

**S3 versus S4 illustrates an index choice, not a performance result.** HFresh moves the full dataset's compressed postings to disk and keeps a smaller centroid graph plus supporting metadata in memory. Its four posting copies, retained originals, and OS cache prevent a simple “32× smaller machine” calculation. The smaller RAM proposal trades against storage reads, rescoring, and background maintenance. Neither row establishes that the index meets your application's quality or latency needs [W2] [B1].

**S5 doubles the vector indexes, not the objects.** It doubles codes, graphs, and original-vector payload, while text and categorical properties are stored once. Its CPU budget allows evaluation of requests that search both spaces; it does not certify twice the throughput.

CPU values are low-confidence, planner-selected starting budgets. Four vCPUs budget scheduling room for queries, indexing, and runtime work; eight budget more for larger imports, HFresh maintenance, or two indexes. No bytes-to-CPU formula supports these values. Weaviate engineering results establish that quantization and rescoring change CPU work, not that these machines achieve a particular QPS [B2]. Do not infer linear scaling from the vCPU column.

### Adjust before adopting

- **Hybrid and filters:** searchable text adds postings and scoring work excluded here. Test real predicates, selectivities, and category skew; enabling a bitmap index does not validate filtered latency. Hybrid relevance needs judged queries, not just ANN recall.
- **Writes and growth:** updates, deletes, encoding, compaction, and HFresh rebalancing can raise memory, disk, CPU, and indexing backlog together. These allocations do not validate concurrent mixed workloads or import peaks.
- **Availability:** RF1 has no replica for failure recovery. Specify replica placement and surviving-node capacity separately. Multiplying stored copies is only a first capacity calculation, not a failover test.
- **More vectors:** count each named space and every token vector in late-interaction models. Compatibility and encoding overhead are release-sensitive; do not reuse S5 for token-level embeddings [W3].

Use SSD-backed persistent storage with measured random-read latency and compaction throughput. Capacity alone does not establish IOPS suitability, especially for HFresh or cold rescoring. Keep backups outside the stated SSD budget.

Monitor import, settled search, and restart separately [W7]. Compare anonymous memory and file cache without adding overlapping RSS and cache metrics. `vectorCacheMaxObjects` limits entries, not whole-process memory. `GOMEMLIMIT` is a soft Go-runtime control, not process containment [G1] [G2]. Replace these estimates with observed peaks, cache behavior, disk high-water marks, and quality-matched query results before making production commitments.

## Operational controls and sizing considerations

### Limit available resources

Use [environment variables][W6] to manage runtime pressure:

- `LIMIT_RESOURCES=true` automatically sets the Go memory limit to 80% of detected memory and uses all but one CPU core. It overrides `GOMEMLIMIT` but respects an explicit `GOMAXPROCS`.
- `GOMEMLIMIT` controls the Go runtime's soft memory limit and garbage-collection aggressiveness. Leave room for non-Go memory and file-backed pages; it is not a process or container memory cap [G1] [G2].
- `GOMAXPROCS` controls simultaneous Go execution, not the total number of operating-system threads.

Imports can allocate faster than garbage collection reclaims memory. Measure peaks as well as settled usage; these controls do not guarantee protection from an OOM kill. The model's runtime pool already includes GC slack: do not add another blanket GC multiplier.

### The role of CPUs

Vector search and indexing can be CPU-intensive: HNSW insertion searches the graph. Traversal is largely single-threaded, but complete requests can include parallel rescoring, and concurrent searches and batch inserts can use multiple threads. Multiple shards can increase import parallelism even on one node, but add overhead and change the single-shard assumptions here. Sharding distributes data; it does not remove resource requirements. Size each node for the shards and replicas it hosts.

Add CPUs when measurements show CPU is the bottleneck. Cache misses, object retrieval, storage I/O, throttling, and indexing backlog can limit requests even when CPU is available. Reducing dimensions or HNSW `maxConnections` can reduce payload or graph memory, but changes quality trade-offs. Tune `efConstruction` for construction quality/work and `ef` for search quality/work rather than assuming a fixed CPU-to-vector ratio [W3].

### The role of memory

HNSW keeps its graph in memory and normally caches vectors for traversal. Compression reduces the vector portion, not the graph. HFresh keeps a smaller compressed centroid index and supporting metadata in memory, with postings on disk. Account for object/inverted indexes, per-shard and per-target caches, replicas, runtime slack, and OS-managed pages rather than applying an HNSW rule to HFresh. See the modelled component budgets in Appendix A.

### An example calculation

This separate dimension-payload example is not one of S1–S5. It excludes the components itemized in Appendix A and is not a measured machine requirement.

For 5,000,000 vectors with 1,024 dimensions, the dimension payload alone is:

| Encoding | Calculation | Payload size (decimal GB) |
| --- | --- | --- |
| Float32 | `5,000,000 * 1,024 * 4 bytes` | 20.48 GB |
| 8-bit codes | `5,000,000 * 1,024 * 1 byte` | 5.12 GB |
| 4-bit codes | `5,000,000 * 1,024 * 0.5 bytes` | 2.56 GB |
| 1-bit [BQ](../configuration/compression/bq-compression.md) codes (opt-in) | `5,000,000 * 1,024 / 8 bytes` | 0.64 GB |

The BQ row illustrates an opt-in encoding, not HNSW RQ configuration or a Cloud default.
In v1.40.6, BQ packs dimensions into 64-bit blocks; 1,024 dimensions need no padding.
The row covers dimension payload only, not total physical code storage or a recall estimate.

This is encoding arithmetic, not a measured deployment requirement, resident memory (RSS), cost, or latency estimate. The code sizes exclude quantizer metadata and padding. They also exclude the HNSW graph, objects, inverted indexes, caches, replicas, and runtime headroom listed above. The original float32 vectors remain on disk when compression is enabled. A 4x or 8x reduction in dimension payload is not a 4x or 8x reduction in total RAM.

For an uncompressed HNSW index caching all vectors, a rough starting heuristic is twice the raw float32 vector bytes, or 40.96 GB in this example. That heuristic combines allowances for graph and runtime overhead, including garbage collection; it does not measure those components or guarantee sufficient capacity. Do not apply it to compressed HNSW or HFresh, or treat it as a complete node-sizing formula. Validate steady-state and peak memory with representative imports and queries before choosing capacity.

### Vector Cache

`vectorCacheMaxObjects` limits entries, not bytes, the HNSW graph, or whole-process memory. Separate shards and named-vector indexes have separate cache instances; replicas add copies. The default is one trillion (`1e12`) entries. Quantized HNSW caches compressed search representations, not all original float32 vectors.

**Version-specific caveat:** in the pinned v1.40.6 source, a newly created HNSW index using RQ without centering initializes its compressed cache with `1e12` entries, even if a smaller value was configured. Later updates and dynamic-index conversion use different paths. Verify effective cache behavior for your version and quantization configuration before relying on a smaller value [I1].

For uncompressed HNSW, aim to cache traversal vectors during import. A reduced cache can cause disk reads and churn; when the cache fills, it can be dropped and populated again. Test reduced limits against the real working set, restart behavior, and storage performance rather than treating cache maintenance as an instantaneous allocation cap. HFresh's disk-backed postings have a different caching model.

### The role of GPUs in Weaviate

Weaviate Database does not itself use GPUs. Separately deployed embedding or other inference services can use GPUs; their resources and costs are excluded from this model.

### Disks: SSD vs Spinning Disk

Use SSD-backed persistent storage and measure I/O, not just capacity. A disk allocation does not certify random-read latency, compaction throughput, or recovery time. The scenario budgets are not calibrated for spinning disks.

### File system

Avoid NFS or similar network file systems for the persistent volume; prefer file systems such as Ext4 or XFS on appropriate block storage (for example EBS). Keep backup capacity separate.

---

## Appendix A: Reproducible numerical model

### Units, version basis, and component inputs

`1 GiB = 2^30 bytes`; `1 KiB = 1,024 bytes`; `1 GB = 10^9 bytes`. Counts use decimal millions. Thus 1M × 768 × 4 = 3,072,000,000 bytes = **2.861 GiB**, not 3.072 GiB.

Mechanisms were checked against living official documentation and the **v1.40.6 source at commit `8ca283a5be2d3638b5530af85653a4f171e7e460`**. Static inspection establishes neither RSS nor current-binary equivalence. Verify the release, effective settings, and allocator/cache behavior before testing.

Let `N` be objects, `T` vectors/object, `V=N×T`, and `G=2^30`. Coefficient ranges are planning envelopes, **not confidence intervals or proven bounds**.

**THEORETICAL / NOT BENCHMARKED. Formula inputs and their provenance.**

| Component: THEORETICAL / NOT BENCHMARKED | Bytes/formula before GiB conversion | Basis |
|---|---|---|
| Retained originals, all scenarios | `F=V×3,072` on disk; also search-cache payload in S1 | Float32 arithmetic; object serializer retains vectors [I1] |
| HNSW RQ8 codes | `Q=V×(768+16)=V×784` | Source code metadata; rotation pads to multiples of 64, so 768 needs no dimension padding [I1] |
| HNSW resident graph | `V×[448,896]` | Chosen conservative envelope: connections, vertices/locks, upper layers, pointers, growth slack; not just packed IDs |
| HNSW vector-cache/index metadata | `V×[64,128]` in RAM | Chosen allowance for cache slice headers, slots, allocator rounding, per-index state; excludes graph and payload |
| Shared nonvector resident state | `N×[256,512]` | Chosen allowance for object/index metadata and resident filter/LSM structures; excludes runtime pool below |
| Object/property/filter disk, excluding vectors | `P=N×[1,536,2,048]` | 1,040 property-value bytes plus 496–1,008 bytes/object for serialization, UUID/keys, bitmap/index and LSM overhead; discretionary |
| HNSW graph persistence | `Dg=V×[256,768]` | Chosen compacted graph/log allowance, not an assumed in-memory graph layout |
| HNSW disk record envelope | `Dv=V×[64,128]` | Chosen framing/keys/index metadata and shared quantizer state allowance; code's own 16 bytes already in Q |
| HFresh posting records | `L=4N×(768/8+8+9)=4N×113` | Four memberships; 96 value bytes + 8 quantizer bytes + 8-byte ID + 1-byte version [I2] |
| HFresh resident membership/version state | `N×[32,96]` | Chosen envelope above packed membership IDs and version bytes; includes metadata capacity, page slack, posting sizes and locks |
| HFresh centroid RAM / disk | `[0.2,0.5] GiB` / `[0.25,0.6] GiB` | Chosen aggregate for codes, centroid graph/cache metadata; disk also retains centroid originals |
| HFresh disk metadata | `N×[64,160]` | Chosen envelope for persisted membership/version data, keys and posting framing; excludes L and centroids |

**Graph rationale.** With M=32, layer zero permits 64 connections; upper layers permit 32 [W3]. Even 64 eight-byte IDs would already be 512 bytes before vertex and allocation costs. The pinned code packs small IDs into 2/3/4/5/8-byte encodings: dense IDs below 16,777,216 can fit in three bytes. Neither this packing nor a serialized link count establishes resident RAM. The 448–896-byte graph budget intentionally spans extra capacity and bookkeeping rather than claiming an exact struct size [I1]. Search scratch belongs to the runtime pool, not this graph term.

**HFresh rationale.** Assume roughly 200–350 memberships/posting after settling, giving `4×5M/[350,200] ≈ 57k–100k` centroids. This occupancy is a planner choice, not a documented invariant. The historical sizing function conservatively computes `ceil(48×1024/(96+25))=407` maximum vectors/posting using a 16-byte RQ allowance, whereas the inspected RQ1 code carries 8 metadata bytes. We use actual 113-byte records for payload arithmetic, not that sizing heuristic [I2].

Centroid codes alone occupy about 0.042–0.073 GiB; chosen RAM of 0.2–0.5 GiB additionally allows graph, cache metadata, and maintenance copies. Centroid original payload alone is about 0.16–0.29 GiB on disk. Four packed three-byte membership IDs/object total about 0.056 GiB across 5M objects, and version bytes add about 0.005 GiB. Those are **partial payloads**, not the complete resident structure: the model instead allows 0.149–0.447 GiB. Sparse IDs, skewed postings, deletions, or excessive split churn can exceed this envelope.

### Memory subtotals and allocations

`Memory = search payload + graph/centroids + vector metadata + shared nonvector state + runtime pool + file working set`.

Runtime pools below are discretionary single envelopes for Go/GC slack, stacks, encoding/search scratch, bounded import/memtables, and background work. **Do not apply an additional GC multiplier.** File working sets cover original-vector rescoring and object/index pages, plus postings in S4. No full original-vector RAM copy is added for compressed scenarios; any temporary decode copies belong to the runtime pool. A fully cached-originals strategy would require revising these numbers.

**THEORETICAL / NOT BENCHMARKED. All entries GiB; display precision supports arithmetic review, not sizing accuracy.**

| Scenario: THEORETICAL / NOT BENCHMARKED | Search payload | Graph or centroid aggregate | Vector metadata | Shared nonvector | Runtime/import/GC pool | File working set | Total | Provisioned RAM |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| S1 | 2.861 | 0.417–0.834 | 0.060–0.119 | 0.238–0.477 | 2–3 | 0.5–1 | 6.08–8.29 | 16 |
| S2 | 0.730 | 0.417–0.834 | 0.060–0.119 | 0.238–0.477 | 1.5–2.5 | 1–2 | 3.95–6.66 | 8 |
| S3 | 3.651 | 2.086–4.172 | 0.298–0.596 | 1.192–2.384 | 4–7 | 4–6 | 15.23–23.80 | 32 |
| S4 | Included in centroids; postings on disk | 0.2–0.5 | 0.149–0.447 | 1.192–2.384 | 2.5–4 | 4–6 | 8.04–13.33 | 16 |
| S5 | 1.460 | 0.834–1.669 | 0.119–0.238 | 0.238–0.477 | 2–3 | 2–3 | 6.65–9.84 | 16 |

Totals use unrounded coefficients. Round up to `{8,16,32,…}` GiB, leaving approximately 7.7, 1.3, 8.2, 2.7, and 6.2 GiB respectively. This remainder is unassigned OS/model-error capacity, **not another planned heap or cache budget**. In particular, S2's 8 GiB proposal is sensitive to runtime and cache assumptions; 16 GiB is the next evaluation step if telemetry exceeds them.

Totals describe private memory plus one file-backed allowance. Mapped resident pages can appear in RSS and file-cache accounting; count them once. Do not compute consumption as “RSS plus OS cache.” Provisioning does not validate that the working set is large enough for cold or tail-latency requirements.

### Persistent and transient disk

HNSW settled disk is `(F+Q+P+Dg+Dv)/G`, with Q=0 in S1. HFresh settled disk is `(F+L+P+metadata)/G + centroid disk`. Originals are counted once inside object storage, separate from the nonvector P term. S5 doubles vector terms, not P.

**THEORETICAL / NOT BENCHMARKED. All entries GiB.**

| Scenario: THEORETICAL / NOT BENCHMARKED | Originals | Codes or posting records | Object/property/filter | Graph or centroid disk | Record/metadata envelope | Settled total | Temporary reserve | SSD allocation |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| S1 | 2.861 | 0 | 1.431–1.907 | 0.238–0.715 | 0.060–0.119 | 4.59–5.60 | 9.60 | 32 |
| S2 | 2.861 | 0.730 | 1.431–1.907 | 0.238–0.715 | 0.060–0.119 | 5.32–6.33 | 10.33 | 32 |
| S3 | 14.305 | 3.651 | 7.153–9.537 | 1.192–3.576 | 0.298–0.596 | 26.60–31.66 | 35.66 | 128 |
| S4 | 14.305 | 2.105 | 7.153–9.537 | 0.25–0.6 | 0.298–0.745 | 24.11–27.29 | 31.29 | 64 |
| S5 | 5.722 | 1.460 | 1.431–1.907 | 0.477–1.431 | 0.119–0.238 | 9.21–10.76 | 14.76 | 32 |

Set temporary reserve to **upper settled estimate + 4 GiB**, allowing roughly one additional settled copy plus WAL/queue space. Then choose the next capacity in `{32,64,128,…}` above `2×upper+4`: respectively **15.21, 16.67, 67.33, 58.58, 25.52 GiB** before rounding. This discretionary policy covers a planning envelope for compaction, WAL, and a rebuild copy, not every combination of them or an unbounded ingestion queue. It excludes local backups and future dataset growth. LSM segments, WALs and HNSW commit logs explain why settled payload is not sufficient provisioned storage [W9]. No IOPS or MB/s result follows from these capacity totals.

## Appendix B: Evidence, calibration, and confidence

**THEORETICAL / NOT BENCHMARKED: provenance for this model. External observations below are attributed, not reproduced. Sources checked on 2026-11-21 UTC using retained documentation captures and targeted official-source reads; this date is not a claim that every linked web page was refetched.**

| Evidence class: THEORETICAL / NOT BENCHMARKED model | Source and conditions | Use and confidence |
|---|---|---|
| Derived bytes | Float32 inputs; pinned RQ8/RQ1 encodings [I1] [I2] | High confidence in conditional payload arithmetic; not in whole-process requirements. RQ8 value-payload reduction is 4×, but `3072/784≈3.92×` including code metadata. |
| Documented mechanisms/configuration | [Vector indexes][W2], [index configuration][W3], [quantization][W4], [inverted indexes][W8], [persistence][W9] | Supports graph limits, two HFresh encodings, rescoring, property flags and storage mechanisms. Living docs; verify deployed version. These mechanism references do not validate the chosen allocation envelopes. |
| Cloud defaults | [Cloud settings][W5] | Cost Optimized defaults to HFresh; Performance Optimized to HNSW/RQ. Free-tier enforcement constrains overrides. This is a self-configured model, not a Cloud plan or promise of free-tier compatibility. |
| Operational controls | [Environment variables][W6], [monitoring][W7], [Go limit API][G1], [GC guide][G2] | Supports control/telemetry semantics, not peak containment. Monitoring metric names may change by release. |
| Published heap calibration | [HFresh engineering article][B1], 2026-09-09: DBpedia OpenAI 1M; HNSW M=16, efConstruction=256 | Reports heap at rest: 6.67 GB uncompressed, 2.38 GB RQ8, 239 MB HFresh. Different graph settings and vector dimensions from this model; GB labels retained as published. Article does not pin a server commit for that comparison. Qualitative magnitude check only, not our RSS/cgroup measurements or coefficients. |
| Published construction calibration | Same article: 1B random 256d vectors, 32 vCPUs/256 GB RAM, batches 1,000 with 12 workers | Reports 204 GB peak VM memory vs 54 GB after restart, 47 GB Go heap after restart; 3.09 TB peak disk vs 2.28 TB after import. Shows phase and cache distinctions. No QPS/recall at that scale; no linear extrapolation to S4. |
| CPU/search calibration | [RQ8 engineering article][B2], 2025-08-26: 1M 1536d DBpedia OpenAI, cosine; rotation microbenchmark on Apple M4 Pro | Rescoring fetches originals and adds distance computations; rotation benchmark reports about 7 μs at 1536d. Does not calibrate end-to-end CPU demand on our generic vCPUs. CPU allocations remain discretionary, low confidence. |
| Rejected hardware calibration | [ANN benchmark page][B3] | Page names n4-highmem-16 / 16 vCPU / 128 GB but elsewhere calls the CPU type c2. Inconsistency unresolved; neither description supports a minimum machine or a per-core scaling rule here. |
| Planning choices | All graph/metadata/property envelopes, centroid occupancy, runtime/cache pools, CPU counts and allocation rounding in Appendix A | Low confidence until measured. Chosen transparently rather than borrowed from competitors; not guaranteed bounds. |

### Historical implementation provenance

Static layout evidence is pinned to [Weaviate v1.40.6, commit `8ca283a5be2d3638b5530af85653a4f171e7e460`](https://github.com/weaviate/weaviate/tree/8ca283a5be2d3638b5530af85653a4f171e7e460). The following immutable file links describe that historical implementation, not a mutable checkout or a claim of current production equivalence. No product source was changed or executed.

### I1

- **I1:** [`adapters/repos/db/vector/compressionhelpers/rotational_quantization.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/adapters/repos/db/vector/compressionhelpers/rotational_quantization.go): `RQMetadataSize`, `NewRQCode`, `encode`; [`entities/vectorindex/compression/fast_rotation.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/entities/vectorindex/compression/fast_rotation.go): `NewFastRotation`; [`adapters/repos/db/vector/hnsw/vertex.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/adapters/repos/db/vector/hnsw/vertex.go) and [`entities/vectorindex/hnsw/packedconn/connections.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/entities/vectorindex/hnsw/packedconn/connections.go): vertex state and packed connections; [`adapters/repos/db/vector/hnsw/compress.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/adapters/repos/db/vector/hnsw/compress.go): compressed-mode switch and float-cache drop; [`adapters/repos/db/vector/hnsw/index.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/adapters/repos/db/vector/hnsw/index.go): RQ activation; [`adapters/repos/db/vector/hnsw/insert.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/adapters/repos/db/vector/hnsw/insert.go): compressed-cache initialization; [`adapters/repos/db/vector/hnsw/config_update.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/adapters/repos/db/vector/hnsw/config_update.go) and [`adapters/repos/db/vector/dynamic/index.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/adapters/repos/db/vector/dynamic/index.go): cache update and dynamic-conversion paths; [`adapters/repos/db/vector/compressionhelpers/binary_quantization.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/adapters/repos/db/vector/compressionhelpers/binary_quantization.go): BQ block padding. [`entities/storobj/storage_object.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/entities/storobj/storage_object.go): `MarshalBinaryDisk` includes main and named vectors. These establish layouts/retention paths, not exact resident sizes.

### I2

- **I2:** [`adapters/repos/db/vector/compressionhelpers/binary_rotational_quantization.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/adapters/repos/db/vector/compressionhelpers/binary_rotational_quantization.go): `oneBitFieldWords`, `NewRQOneBitCode`; [`adapters/repos/db/vector/hfresh/posting.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/adapters/repos/db/vector/hfresh/posting.go): `NewVector`; [`adapters/repos/db/vector/hfresh/config.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/adapters/repos/db/vector/hfresh/config.go): `computeMaxPostingSize`; [`adapters/repos/db/vector/hfresh/hnsw.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/adapters/repos/db/vector/hfresh/hnsw.go): RQ8 centroid configuration; [`adapters/repos/db/vector/hfresh/hfresh.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/adapters/repos/db/vector/hfresh/hfresh.go), [`adapters/repos/db/vector/hfresh/posting_map.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/adapters/repos/db/vector/hfresh/posting_map.go), [`adapters/repos/db/vector/hfresh/version_map.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/adapters/repos/db/vector/hfresh/version_map.go), [`adapters/repos/db/vector/hfresh/posting_size.go`](https://github.com/weaviate/weaviate/blob/8ca283a5be2d3638b5530af85653a4f171e7e460/adapters/repos/db/vector/hfresh/posting_size.go): resident membership/version/posting structures. “Only centroids in memory” is not a complete accounting of these structures.

## Appendix C: Validation required before production use

Before these numbers become production recommendations:

1. Pin the deployed binary/image and effective per-target settings. Check source-snapshot differences, cache behavior, quantizer padding/metadata, retained originals, HFresh occupancy/membership state, and Cloud restrictions.
2. Import a licensed representative corpus with this exact schema; record accepted versus indexed counts and queue drain. Measure anonymous/file memory, Go heap/runtime, CPU/throttling, allocated disk and I/O from empty through settled state. Replace runtime, metadata, graph and transient-reserve envelopes with observed ranges and repeat variation.
3. Measure cold restart and warm search separately. Use exact top-10 references and quality-matched index settings. Report offered/completed QPS, concurrency, errors and p50/p95/p99 without importing a performance target from this draft.
4. Evaluate representative filtered/hybrid queries, then concurrent writes/deletes and maintenance. Validate required recovery/failover on the intended replica topology. Publish tested hardware and storage performance before recommending capacity.

[I1]: #i1
[I2]: #i2
[W2]: https://docs.weaviate.io/weaviate/concepts/vector-index
[W3]: https://docs.weaviate.io/weaviate/config-refs/indexing/vector-index
[W4]: https://docs.weaviate.io/weaviate/concepts/vector-quantization
[W5]: https://docs.weaviate.io/cloud/manage-clusters/default-settings
[W6]: https://docs.weaviate.io/deploy/configuration/env-vars
[W7]: https://docs.weaviate.io/deploy/configuration/monitoring
[W8]: https://docs.weaviate.io/weaviate/config-refs/indexing/inverted-index
[W9]: https://docs.weaviate.io/weaviate/concepts/storage
[G1]: https://pkg.go.dev/runtime/debug#SetMemoryLimit
[G2]: https://go.dev/doc/gc-guide
[B1]: https://weaviate.io/blog/hfresh
[B2]: https://weaviate.io/blog/8-bit-rotational-quantization
[B3]: https://docs.weaviate.io/weaviate/benchmarks/ann

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
