---
title: Compression
sidebar_position: 5
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression', 'pq']
---

Uncompressed vectors can be large. Compressed vectors lose some information, but they use fewer resources and can be very cost effective. 

To balance resource costs and system performance, consider one of these options:

- [Binary Quantization (BQ)](/weaviate/configuration/compression/bq-compression)
- [Product Quantization (PQ)](/weaviate/configuration/compression/pq-compression)
- [Rotational Quantization (RQ)](/weaviate/configuration/compression/rq-compression)
- [Scalar Quantization (SQ)](/weaviate/configuration/compression/sq-compression)

Aside from quantization, Weaviate also offers encodings for multi-vector embeddings:
- [MUVERA encoding](./multi-vectors.md)
