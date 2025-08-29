---
title: Compression
sidebar_position: 5
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression', 'pq']
---

Uncompressed vectors can be large. Compressed vectors lose some information, but they use fewer resources and can be very cost effective.

To balance resource costs and system performance, consider one of these options:

- **[Rotational Quantization (RQ)](/weaviate/configuration/compression/rq-compression)** (_recommended_)
- **[Product Quantization (PQ)](/weaviate/configuration/compression/pq-compression)**
- **[Binary Quantization (BQ)](/weaviate/configuration/compression/bq-compression)**
- **[Scalar Quantization (SQ)](/weaviate/configuration/compression/sq-compression)**

Aside from quantization, Weaviate also offers encodings for multi-vector embeddings:

- **[MUVERA encoding](./multi-vectors.md)**

:::info Compression by Default

Starting with `v1.33`, Weaviate enables **8-bit RQ quantization by default** when creating new collections to ensure efficient resource utilization and faster performance. This behavior can be changed through the [`DEFAULT_QUANTIZATION`](/deploy/configuration/env-vars/index.md#DEFAULT_QUANTIZATION) environment variable.

:::
