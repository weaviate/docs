---
title: マルチデータセンター
sidebar_position: 5
description: "将来の地理的リージョンをまたぐ分散デプロイメント向けマルチデータセンター レプリケーション機能。"
image: og/docs/concepts.jpg
# tags: ['architecture']
---


マルチデータセンター (Multi-DC) レプリケーションにより、複数のデータセンターにわたる複数のサーバー上にデータのコピーを保持できます。この形式のレプリケーションは v1.17 および v1.18 ではまだサポートされていません。現行のレプリケーション機能は、後日 Multi-DC をサポートできるよう設計されています。この機能に興味がある場合は、[この GitHub issue](https://github.com/weaviate/weaviate/issues/2436) に賛成票をお願いします。

ユーザーグループが地理的に離れた複数の場所（例: アイスランドやオーストラリア）に分散している場合、Multi-DC レプリケーションは有益です。ユーザーグループの近くのローカルリージョンにノードを配置することで、レイテンシーを低減できます。さらに Multi-DC レプリケーションではデータが複数の物理的な場所に冗長化されるため、まれにデータセンター全体が停止した場合でも他リージョンからデータを提供できます。

現時点では、すべてのレプリカノードが同一データセンター内にあるという前提で運用してください。この構成の利点は、ノード間のネットワーク通信が安価で高速な点です。欠点はデータセンター全体が障害を起こした場合に冗長性がなくなることです。これは Multi-DC が[実装されれば](https://github.com/weaviate/weaviate/issues/2436) 解決します!

<p align="center"><img src="/img/docs/replication-architecture/replication-regional-proximity-3.png" alt="Replication multi-dc" width="75%"/></p>



## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>