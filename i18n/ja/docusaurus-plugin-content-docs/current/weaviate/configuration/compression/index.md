---
title: 圧縮
sidebar_position: 5
image: og/docs/configuration.jpg
# tags: ['configuration', 'compression', 'pq']
---

未圧縮のベクトルは大きくなる場合があります。圧縮したベクトルは一部の情報を失いますが、使用リソースが少なく、コスト効率に優れています。  

リソースコストとシステム性能を両立させるために、次のオプションを検討してください。

- [バイナリ量子化 ( BQ )](/weaviate/configuration/compression/bq-compression)
- [直積量子化 ( PQ )](/weaviate/configuration/compression/pq-compression)
- [回転量子化 ( RQ )](/weaviate/configuration/compression/rq-compression)
- [スカラー量子化 ( SQ )](/weaviate/configuration/compression/sq-compression)

量子化以外にも、Weaviate ではマルチ ベクトル埋め込み向けのエンコーディングを提供しています:  
- [MUVERA エンコーディング](./multi-vectors.md)

