---
title: ベストプラクティス
sidebar_position: 10
description: Weaviate のパフォーマンスを最大化するための専門的な推奨事項と最適化戦略。
image: og/docs/howto.jpg
# tags: ['best practices', 'how-to']
---

# ベストプラクティスとヒント

このページでは、Weaviate を利用する際の一般的なベストプラクティスを紹介します。これらは私たちの経験とユーザーからのフィードバックに基づいています。

:::info Consider this a hub for best practices
Weaviate が進化し、ユーザーの利用方法についてさらに学ぶにつれて、このページを随時更新します。定期的にご確認ください。
:::

## アップグレードとメンテナンス

### Weaviate とクライアントライブラリーを最新に保つ

Weaviate は急速に進化しており、新機能の追加、パフォーマンス向上、バグ修正が絶えず行われています。最新の機能と改善点を享受するために、Weaviate と使用するクライアントライブラリーを常に最新に保つことを推奨します。

最新リリースを把握するには、以下を行ってください。

- [Weaviate newsletter](https://newsletter.weaviate.io/) に登録する  
- 関連する Weaviate の GitHub リポジトリを [Watch](https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github/managing-subscriptions-for-activity-on-github/viewing-your-subscriptions#reviewing-repositories-that-youre-watching) する  
    - [Weaviate](https://github.com/weaviate/weaviate)  
    - [Weaviate Python client](https://github.com/weaviate/weaviate-python-client)  
    - [Weaviate TS/JS client](https://github.com/weaviate/typescript-client)  
    - [Weaviate Go client](https://github.com/weaviate/weaviate-go-client)  
    - [Weaviate Java client](https://github.com/weaviate/java-client)  

:::info How often are new versions released?
一般的に、Weaviate のマイナーバージョンは 6〜10 週間ごとにリリースされ、パッチバージョンは随時リリースされます。
:::

<!-- ### Plan for upgrades -->

## リソース管理

### 高可用性クラスタで速度と信頼性を向上

高い信頼性要求、高いクエリ負荷、または低レイテンシが求められる環境では、複数ノードによる高可用性 (HA) 構成で Weaviate をデプロイすることを検討してください。HA 構成は次の利点を提供します。

- **優れたフォールトトレランス**: 個々のノードに問題が発生してもリクエスト処理を継続  
- **ローリングアップグレード**: クラスタ全体を停止せずにノード単位でアップグレード可能  
- **クエリ性能の向上**: クエリ負荷を複数ノードに分散しレイテンシを削減  
- **スループットの増加**: 同時クエリやデータ操作をより多く処理  

:::tip Further resources
- [Concepts: Cluster architecture](../concepts/cluster.md)
- [Configuration: Replication](/deploy/configuration/replication.md)
:::

#### レプリケーション設定

HA 構成を使用する場合、次のレプリケーション設定を検討してください。

- **Replication factor**: クォーラム (クラスタサイズの過半数) を得られるよう奇数に設定し、過度なレプリケーションを避けます。注意: ノード数が replication factor 未満の場合、Weaviate は起動しません。  
- **Deletion strategy**: ユースケースに合った削除戦略を選択します。一般的には `NoAutomatedResolution` 戦略を推奨します。  

### データサブセットにマルチテナンシーを使用

次のすべての条件を満たす複数のデータサブセットを扱う場合は、マルチテナンシーの有効化を検討してください。

- 同一のデータ構造 (スキーマ) を持つ  
- ベクトルインデックス、転置インデックス、ベクトライザーモデルなど同一設定を共有できる  
- 互いに同時検索する必要がない  

それぞれのデータサブセットを別々のテナントに割り当てることで、Weaviate のリソースオーバーヘッドを削減し、より効果的にスケールできます。

<p align="center"><img src="/img/docs/system/collections_with_without_mt.png" alt="Replication Factor" width="100%"/></p>

:::tip Further resources
- [How-to: Perform multi-tenancy operations](../manage-collections/multi-tenancy.mdx)
- [How to: Manage tenant states](../manage-collections/tenant-states.mdx)
- [Concepts: Multi-tenancy](../concepts/data.md#multi-tenancy)
:::

### データ規模に合わせたベクトルインデックスタイプの設定

多くの場合、デフォルトの `hnsw` インデックスタイプが良い出発点ですが、場合によっては `flat` インデックスや `dynamic` インデックスの方が適していることもあります。

- `flat` インデックスは、各コレクションが少数 (例: 100,000 未満) のベクトルしか保持しないと分かっている場合に有用です。  
    - メモリ消費が非常に少ない一方、大規模データセットでは検索が遅くなります。  
- `dynamic` インデックスは `flat` で始まり、コレクション内のベクトル数が閾値を超えると自動的に `hnsw` に切り替わります。  
    - メモリ使用量とクエリ性能のバランスに優れています。  

特にマルチテナント環境では、テナント内のベクトル数が閾値を超えた際に自動で `hnsw` に切り替わる `dynamic` インデックスが有益です。

:::tip Further resources
- [How-to: Set the vector index type](../manage-collections/vector-config.mdx#set-vector-index-type)
- [Concepts: Vector indexes](../concepts/indexing/vector-index.md)
:::

### ベクトル量子化でメモリ使用量を削減

データセットが大きくなるにつれ、対応するベクトルインデックスは高いメモリ要求を招き、コスト増大につながります。特に `hnsw` インデックスを使用している場合は顕著です。

大量のベクトルを扱う場合は、ベクトル量子化を使用してインデックスのメモリフットプリントを削減することを検討してください。メモリ要件を抑え、より低コストでスケールできます。

![Overview of quantization schemes](@site/_includes/images/concepts/quantization_overview_light.png#gh-light-mode-only "Overview of quantization schemes")
![Overview of quantization schemes](@site/_includes/images/concepts/quantization_overview_dark.png#gh-dark-mode-only "Overview of quantization schemes")

HNSW インデックスの場合、まず 直積量子化 (PQ) を有効にすることを推奨します。メモリ使用量とクエリ性能のバランスが良好で、ユースケースに合わせてパラメーター調整も可能です。

:::tip Further resources
- [How-to: Configure vector quantization](../configuration/compression/index.md)
- [Concepts: Vector quantization](../concepts/vector-quantization.md)
:::

### システムしきい値を調整してダウンタイムを防止

Weaviate では、メモリまたはディスク使用率が一定の割合を超えると警告を発し、さらに高くなるとリードオンリーモードに移行するよう設定されています。

これらのしきい値はユースケースに合わせて調整可能です。たとえば、大量メモリのマシンで Weaviate を稼働させる場合、同じ割合でも実際のメモリ量が多いため、リードオンリーに移行する前のメモリしきい値を上げたいことがあります。

ディスク使用率のしきい値は `DISK_USE_WARNING_PERCENTAGE` と `DISK_USE_READONLY_PERCENTAGE`、メモリ使用率のしきい値は `MEMORY_WARNING_PERCENTAGE` と `MEMORY_READONLY_PERCENTAGE` で設定します。

:::tip Further resources
- [References: Environment variables](/deploy/configuration/env-vars/index.md#general)

:::



### メモリ割り当て計画

Weaviate を実行する際、メモリ使用量はよくボトルネックになります。経験則として、以下のメモリが必要になります。

- 1 million 件・1024 次元 ベクトル: 6 GB のメモリ
- 1 million 件・256 次元 ベクトル: 1.5 GB のメモリ
- 量子化を有効にした 1 million 件・1024 次元 ベクトル: 2 GB のメモリ

<details>
  <summary>この数値はどのように算出したのか？</summary>

量子化を使用しない場合、各ベクトルは n 次元の float として保存されます。1024 次元ベクトルの場合は次のとおりです。

- 4 byte / float × 1024 次元 × 1 M ベクトル = 4 GB

インデックス構造や追加のオーバーヘッドを加味すると、おおよそ 6 GB になります。

</details>

:::tip 参考リソース
- [概念: リソース計画](../concepts/resources.md)
:::

### メモリ使用量を素早く確認する方法

本番環境では、Grafana や Prometheus などを用いたクラスタ[監視](/deploy/configuration/monitoring.md)を設定することを推奨します。

しかし、Weaviate のメモリ使用量を素早く確認する別の方法もあります。

:::note すでに Prometheus 監視を設定済みの場合
内容に依存せず全体の使用量だけを確認したい場合、既存の Prometheus 監視で `go_memstats_heap_inuse_bytes` メトリクスを確認すると、常に完全なメモリフットプリントが得られます。
:::

#### `pprof` 経由

システムに `go` がインストールされている場合、Golang の `pprof` ツールでヒーププロファイルを確認できます。

- Go ランタイムをインストールするか、Go ベースの Docker コンテナを起動します。
- Docker/K8s で実行している場合はポート 6060 を公開します。

プロファイルを可視化するには:

```bash
go tool pprof -png http://{host}:6060/debug/pprof/heap
```

テキスト出力を表示するには:

```bash
go tool pprof -top http://{host}:6060/debug/pprof/heap
```

#### コンテナ使用量の確認

Kubernetes で Weaviate を実行している場合、`kubectl` でコンテナ全体のメモリ使用量を確認できます。

```bash
kubectl exec weaviate-0 -- /usr/bin/free
```

`weaviate-0` はポッド名です。

外部（OS/コンテナレベル）から見ると、表面的なメモリ消費ははるかに大きく見える点に注意してください。Go ランタイムは非常にオポチュニスティックで、しばしば [MADV_FREE](https://www.man7.org/linux/man-pages/man2/madvise.2.html) を使用します。これは、必要に応じてメモリの一部を容易に解放できることを意味します。その結果、Weaviate がコンテナ内で唯一のアプリケーションの場合、実際に必要な量より多くのメモリを保持しますが、他プロセスが必要とした際には迅速に解放可能です。

したがって、この方法はメモリ使用量の上限を把握するのに有用ですが、`pprof` を用いた方が Weaviate のヒーププロファイルをより正確に把握できます。

### シャード読み込み動作の設定によるシステムとデータ可用性のバランス

Weaviate は起動時に、デプロイ内のすべてのシャードからデータを読み込みます。デフォルトでは、遅延シャード読み込みにより、バックグラウンドでシャードを読み込みつつ、すでに読み込まれたシャードへ即座にクエリを実行できるため、起動が速くなります。

しかし、単一テナントのコレクションで高負荷がかかる場合、遅延読み込みはインポート操作を遅延させたり、部分的に失敗させたりすることがあります。このようなシナリオでは、以下の環境変数を設定して[遅延読み込みを無効化](../concepts/storage.md#lazy-shard-loading)することを検討してください。

```
DISABLE_LAZY_LOAD_SHARDS: "true"
```

これにより、Weaviate が Ready と報告する前に、すべてのシャードが完全に読み込まれます。

:::caution 重要
遅延シャード読み込みを無効化するのは単一テナントのコレクションに限ってください。マルチテナント環境では、遅延読み込みを有効にしておくことで起動時間を大幅に短縮できます。
:::

## データ構造

### クロスリファレンスと平坦化プロパティ

データスキーマを設計する際、クロスリファレンスを使用するか、プロパティを平坦化するかを検討してください。リレーショナルデータベースの経験がある場合、データを正規化してクロスリファレンスを使いたくなるかもしれません。

しかし、Weaviate ではクロスリファレンスにはいくつかの欠点があります。

- ベクトル化されないため、その情報がオブジェクトのベクトル表現に含まれません。
- 参照先オブジェクトの取得に追加クエリが必要となるため、クエリが遅くなる可能性があります。Weaviate はグラフ的なクエリやジョインを前提として設計されていません。

代わりに、各オブジェクトに情報を別のプロパティとして直接埋め込むことを検討してください。これにより情報がベクトル化され、より効率的にクエリできます。

<!-- ### Choose the right property data type -->

<!-- ## Optimize queries -->

<!-- ### Index the right properties -->

## データ操作

### データスキーマの明示的定義

Weaviate には便利な["オートスキーマ"機能](../config-refs/collections.mdx#auto-schema)があり、データのスキーマを自動的に推測できます。

しかし、本番環境ではスキーマを明示的に定義し、オートスキーマ機能を無効化（`AUTOSCHEMA_ENABLED: 'false'` に設定）することを推奨します。これにより、データが Weaviate に正しく解釈され、不正なデータがシステムに取り込まれるのを防げます。

例として、次の 2 件のオブジェクトをインポートする場合を考えます。

```json
[
    {"title": "The Bourne Identity", "category": "Action"},
    {"title": "The Bourne Supremacy", "cattegory": "Action"},
    {"title": "The Bourne Ultimatum", "category": 2007},
]
```

この例では、2 件目と 3 件目のオブジェクトが不正です。2 件目は `cattegory` というプロパティ名のタイプミスがあり、3 件目は `category` が数値であるべきでないにもかかわらず数値です。

オートスキーマが有効だと、Weaviate はコレクションに `cattegory` プロパティを作成してしまい、データクエリ時に予期せぬ動作を招く可能性があります。また 3 件目では、`category` プロパティが `INT` 型で作成されてしまうかもしれません。

オートスキーマを無効にし、スキーマを明示的に定義しましょう。

```python
from weaviate.classes.config import Property, DataType

client.collections.create(
    name="WikiArticle",
    properties=[
        Property(name="title", data_type=DataType.TEXT)
        Property(name="category", data_type=DataType.TEXT)
    ],
)
```

これにより、正しいスキーマを持つオブジェクトのみが Weaviate に取り込まれ、不正なスキーマのオブジェクトをインポートしようとした際にはユーザーに通知されます。

:::tip 参考リソース
- [概念: データスキーマ](../concepts/data.md#data-schema)
- [リファレンス: コレクション定義 - オートスキーマ](../config-refs/collections.mdx#auto-schema)
:::



### バッチインポートによるデータ取り込みの高速化

10 個を超えるオブジェクトなど、一定量以上のデータを取り込む場合はバッチインポートを使用してください。これにより、以下 2 つの理由からインポート速度が大幅に向上します。

- 送信する  Weaviate へのリクエスト数が減り、ネットワークのオーバーヘッドが削減されます。  
-  Weaviate でデータのベクトル化をオーケストレーションしている場合、ベクトル化リクエストもバッチで送信できるため高速化されます。特に推論を  GPU で行う場合に効果的です。

```python
# ⬇️ Don't do this
for obj in objects:
    collection.data.insert(properties=obj)

# ✅ Do this
with collection.batch.fixed_size(batch_size=200) as batch:
    for obj in objects:
        batch.add_object(properties=obj)
```

:::tip さらに詳しく
- [How-to: バッチインポートでデータを取り込む](../manage-objects/import.mdx)
:::

### 非アクティブテナントのオフロードによるコスト最小化

マルチテナンシーを使用しており、頻繁にクエリされないテナントがある場合は、それらをコールド（クラウド）ストレージへオフロードすることをご検討ください。

![Storage Tiers](../starter-guides/managing-resources/img/storage-tiers.jpg)

オフロードされたテナントはクラウドストレージバケットに保存され、必要に応じて  Weaviate へリロードできます。これにより  Weaviate のメモリおよびディスク使用量を大幅に削減でき、コスト削減につながります。

再び使用される可能性がある場合（例: ユーザーがログインしたときなど）は、テナントを  Weaviate へリロードし、再びクエリ可能にできます。

:::info オープンソース版 Weaviate のみで利用可能
現時点では、テナントのオフロード機能はオープンソース版  Weaviate のみで利用可能です。 Weaviate Cloud でも提供予定です。
:::

:::tip さらに詳しく
- [スターターガイド: リソース管理](../starter-guides/managing-resources/index.md)
- [How-to: テナント状態を管理する](../manage-collections/tenant-states.mdx)
:::

<!-- ### Data validation strategies -->

<!-- ## Queries

### Consider using a reranker

### Effective hybrid search strategies -->

## アプリケーション設計と統合

### クライアント生成の最小化

 Weaviate クライアントオブジェクトを生成する際には、接続確立やヘルスチェックを行う I/O 処理のためパフォーマンスのオーバーヘッドが発生します。

可能な限り、同じクライアントオブジェクトを再利用して多くの操作を実行してください。一般にクライアントオブジェクトはスレッドセーフであり、複数スレッド間で並行して使用できます。

どうしても複数のクライアントオブジェクトが必要な場合は、初期チェックをスキップすることをご検討ください（例: [ Python ](../client-libraries/python/notes-best-practices.mdx#initial-connection-checks)）。これにより複数クライアント生成時のオーバーヘッドを大幅に削減できます。

クライアントライブラリごとの制限にもご注意ください。たとえば  Weaviate Python クライアントは、[クライアントオブジェクト 1 つにつきバッチインポートスレッドは 1 つ](../client-libraries/python/notes-best-practices.mdx#thread-safety)の使用に限定されています。

加えて、非同期環境でのパフォーマンス向上のために[非同期クライアント API](#use-the-relevant-async-client-as-needed)の利用をご検討ください。

### 必要に応じた Async Client の利用

非同期環境で  Weaviate を使用する場合は、非同期クライアント API の使用を検討してください。特に複数クエリを並行して実行する際、アプリケーションの性能を大幅に向上させられます。

#### Python

 Weaviate Python クライアント `4.7.0` 以降には、[非同期クライアント API (`WeaviateAsyncClient`)](../client-libraries/python/async.md) が含まれています。

#### Java

 Weaviate Java クライアント `5.0.0` 以降には、[非同期クライアント API (`WeaviateAsyncClient`)](https://javadoc.io/doc/io.weaviate/client/latest/io/weaviate/client/v1/async/WeaviateAsyncClient.html) が含まれています。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

