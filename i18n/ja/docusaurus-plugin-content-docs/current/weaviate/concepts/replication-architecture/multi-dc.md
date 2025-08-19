---
title: Multi-Data center
sidebar_position: 5
image: og/docs/concepts.jpg
# tags: ['architecture']
---

Multi-Data center （ Multi-DC ）レプリケーションを使用すると、複数のデータセンターにまたがる複数のサーバー上にデータのコピーを保持できます。この形式のレプリケーションは v1.17 と v1.18 ではまだサポートされていません。現行バージョンのレプリケーションは、将来的に Multi-DC をサポートできるように設計されています。この機能に興味がある場合は、[この GitHub issue](https://github.com/weaviate/weaviate/issues/2436) に投票してください。

Multi-DC レプリケーションは、ユーザーグループが異なる地理的ロケーション（例: アイスランドとオーストラリア）に分散している場合に有用です。ユーザーグループの近くのローカル地域にノードを配置すると、レイテンシーを低減できます。さらに、Multi-DC レプリケーションにはデータが複数の物理ロケーションに冗長化されるという利点もあります。そのため、まれにデータセンター全体がダウンした場合でも、別のロケーションからデータを提供できます。

現時点では、すべてのレプリカノードが同一のデータセンター内にあるという前提で運用できます。この構成の利点は、ノード間のネットワークリクエストが低コストで高速になることです。一方、データセンター全体が障害に遭った場合には冗長性がないという欠点があります。これは Multi-DC が[実装されたら](https://github.com/weaviate/weaviate/issues/2436)解決されます。

<p align="center"><img src="/img/docs/replication-architecture/replication-regional-proximity-3.png" alt="Replication multi-dc" width="75%"/></p>

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>