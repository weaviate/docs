---
title: Compression
sidebar_position: 5
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression', 'pq']
---

Uncompressed vectors can be large. Compressed vectors lose some information, but they use fewer resources and can be very cost effective.

## Vector quantization

To balance resource costs and system performance, consider one of these options:

- **[Rotational Quantization (RQ)](rq-compression.md)** (_recommended_)
- **[Product Quantization (PQ)](pq-compression.md)**
- **[Binary Quantization (BQ)](bq-compression.md)**
- **[Scalar Quantization (SQ)](sq-compression.md)**

You can also [disable quantization](uncompressed.md) for a collection.

:::info Compression by Default

Starting with `v1.33`, Weaviate enables **8-bit RQ quantization by default** when creating new collections to ensure efficient resource utilization and faster performance. This behavior can be changed through the [`DEFAULT_QUANTIZATION`](/deploy/configuration/env-vars/index.md#DEFAULT_QUANTIZATION) environment variable.

:::

## Multi-vector encoding

Aside from quantization, Weaviate also offers encodings for multi-vector embeddings:

- **[MUVERA encoding](./multi-vectors.md)**
