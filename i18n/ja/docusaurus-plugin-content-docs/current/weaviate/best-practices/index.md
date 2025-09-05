---
title: ベストプラクティス
sidebar_position: 10
description: " Weaviate のパフォーマンスを最大化するための専門的な推奨事項と最適化戦略。"
image: og/docs/howto.jpg
# tags: ['best practices', 'how-to']
---

# ベストプラクティスとヒント

このページでは、 Weaviate を使用する際の一般的なベストプラクティスをご紹介します。これらは私たちの経験とユーザーの皆さまからいただいたフィードバックに基づいています。

:::info これはベストプラクティスのハブとお考えください
 Weaviate が進化し、ユーザーの利用方法についてさらに学ぶにつれて、このページを随時更新します。定期的にご確認ください。
:::

## アップグレードとメンテナンス

### Weaviate とクライアントライブラリーの最新状態維持

 Weaviate は急速に進化しているプロダクトで、新機能の追加、パフォーマンスの向上、バグ修正を継続的に行っています。最新の機能と改善を享受するために、 Weaviate 本体とご利用のクライアントライブラリーを常に最新に保つことを推奨します。

最新リリースを把握する方法:

- [ Weaviate ニュースレター](https://newsletter.weaviate.io/)を購読する
- 関連する Weaviate GitHub リポジトリを [Watch](https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github/managing-subscriptions-for-activity-on-github/viewing-your-subscriptions#reviewing-repositories-that-youre-watching) する  
    - [Weaviate](https://github.com/weaviate/weaviate)  
    - [ Weaviate Python client](https://github.com/weaviate/weaviate-python-client)  
    - [ Weaviate TS/JS client](https://github.com/weaviate/typescript-client)  
    - [ Weaviate Go client](https://github.com/weaviate/weaviate-go-client)  
    - [ Weaviate Java client](https://github.com/weaviate/java-client)

:::info 新バージョンはどのくらいの頻度でリリースされますか？
一般的に、 Weaviate の新しいマイナーバージョンは 6〜10 週間ごとに、パッチバージョンは定期的にリリースされます。
:::

<!-- ### Plan for upgrades -->

## リソース管理

### 高可用性クラスターで速度と信頼性を向上

高い信頼性要件、クエリ負荷、レイテンシー要件がある環境では、 Weaviate を高可用性 (HA) 構成でデプロイすることをご検討ください。複数ノードによる HA 構成には以下の利点があります。

- **優れたフォールトトレランス**: 個々のノードに問題が発生してもリクエストを処理し続けられます  
- **ローリングアップグレード**: クラスター全体のダウンタイムなしに個別ノードをアップグレード可能  
- **クエリ性能の向上**: 複数ノードにクエリ負荷を分散し、レイテンシーを削減  
- **スループットの増加**: 同時クエリおよびデータ操作をより多く処理可能  

:::tip 参考リソース
- [コンセプト: クラスターアーキテクチャ](../concepts/cluster.md)
- [設定: レプリケーション](/deploy/configuration/replication.md)
:::

### マルチテナンシーでデータサブセットを管理

以下のすべてを満たす複数のデータサブセットを扱う場合:

- 同一のデータ構造 (スキーマ) を持つ  
- ベクトルインデックス、転置インデックス、ベクトライザーのモデルなど同じ設定を共有できる  
- 互いに一緒にクエリする必要がない  

このような場合はマルチテナンシーを有効化し、各サブセットを別々のテナントに割り当てることを検討してください。 Weaviate のリソースオーバーヘッドを削減し、より効率的なスケールが可能になります。

<p align="center"><img src="/img/docs/system/collections_with_without_mt.png" alt="Replication Factor" width="100%"/></p>

:::tip 参考リソース
- [ハウツー: マルチテナンシー操作を行う](../manage-collections/multi-tenancy.mdx)
- [ハウツー: テナント状態を管理する](../manage-collections/tenant-states.mdx)
- [コンセプト: マルチテナンシー](../concepts/data.md#multi-tenancy)
:::

### データ規模に合わせたベクトルインデックスタイプの設定

多くのケースではデフォルトの `hnsw` インデックスタイプが適切な出発点ですが、場合によっては `flat` インデックスや `dynamic` インデックスの方が適していることがあります。

- `flat` インデックスは、コレクションに含まれるベクトル数が少数 (例: 100,000 未満) とわかっている場合に有効です。  
    - メモリ使用量は非常に少ないものの、大規模データセットでは遅くなる可能性があります。  
- `dynamic` インデックスは `flat` インデックスで開始し、コレクション内のベクトル数が一定の閾値を超えると自動で `hnsw` インデックスに切り替わります。  
    - メモリ使用量とクエリ性能のバランスを取る良い妥協点です。  

特にマルチテナント構成では、テナント内のベクトル数が閾値を超えた際に自動で `hnsw` に切り替わる `dynamic` インデックスの恩恵を受けやすいです。

:::tip 参考リソース
- [ハウツー: ベクトルインデックスタイプを設定する](../manage-collections/vector-config.mdx#set-vector-index-type)
- [コンセプト: ベクトルインデックス](../concepts/indexing/vector-index.md)
:::

### ベクトル量子化でメモリフットプリントを削減

データセットが大きくなると、ベクトルインデックスにより高いメモリ要件が発生し、コストが増大します。特に `hnsw` インデックスタイプを使用している場合は顕著です。

大量のベクトルを扱う場合は、ベクトル量子化を使用してベクトルインデックスのメモリフットプリントを削減することをご検討ください。必要メモリを抑えることで、低コストで効率的にスケールできます。

![Overview of quantization schemes](@site/_includes/images/concepts/quantization_overview_light.png#gh-light-mode-only "Overview of quantization schemes")
![Overview of quantization schemes](@site/_includes/images/concepts/quantization_overview_dark.png#gh-dark-mode-only "Overview of quantization schemes")

HNSW インデックスでは、まず直積量子化 (PQ) を有効にすることを推奨します。これはメモリ使用量とクエリ性能の間で良好なトレードオフを提供し、ユースケースに合わせたパラメータ調整も可能です。

:::tip 参考リソース
- [ハウツー: ベクトル量子化を設定する](../configuration/compression/index.md)
- [コンセプト: ベクトル量子化](../concepts/vector-quantization.md)
:::

### システム閾値を調整してダウンタイムを防止

 Weaviate はメモリやディスク使用率が特定の閾値 (パーセンテージ) を超えると警告を出したり、リードオンリー モードに移行したりするように設定されています。

これらの閾値はユースケースに合わせて調整可能です。たとえば、大量のメモリを搭載したマシンで Weaviate を実行している場合、リードオンリー モードへ移行するメモリ閾値を高めに設定したいことがあります。メモリ量が多いほど、同じパーセンテージでも実際のメモリ容量は大きくなるためです。

ディスク使用率の閾値は `DISK_USE_WARNING_PERCENTAGE` と `DISK_USE_READONLY_PERCENTAGE`、メモリ使用率の閾値は `MEMORY_WARNING_PERCENTAGE` と `MEMORY_READONLY_PERCENTAGE` で設定します。

:::tip 参考リソース
- [リファレンス: 環境変数](/deploy/configuration/env-vars/index.md#general)
:::

### メモリ割り当てを計画する

 Weaviate を実行する際、メモリフットプリントがボトルネックになることがよくあります。経験則として、以下のメモリが必要になるとお考えください。

- 1,000,000 件の 1,024 次元ベクトルで 6 GB  
- 1,000,000 件の 256 次元ベクトルで 1.5 GB  
- 量子化を有効にした 1,000,000 件の 1,024 次元ベクトルで 2 GB  

<details>
  <summary>この数字の根拠</summary>

量子化なしの場合、各ベクトルは n 次元の float として保存されます。1,024 次元ベクトルの場合:

- 4 バイト × 1,024 次元 × 1M ベクトル = 4 GB

インデックス構造や追加オーバーヘッドを考慮して、概算で 6 GB となります。

</details>

:::tip 参考リソース
- [コンセプト: リソース計画](../concepts/resources.md)
:::



### メモリ使用量を素早く確認する方法

本番環境では、Grafana と Prometheus などのツールを用いてクラスタ [モニタリング](/deploy/configuration/monitoring.md) を設定することを推奨します。

ただし、Weaviate のメモリ使用量を素早く確認する他の方法もあります。

:::note すでに Prometheus でモニタリングしている場合
コンテンツに依存しない全体的なメモリ使用量だけを把握したい場合、かつすでに Prometheus を使用している場合は、`go_memstats_heap_inuse_bytes` メトリクスを確認してください。これが常に実際のメモリフットプリントを示します。
:::

#### `pprof` を使用する

`go` がシステムにインストールされていれば、golang の `pprof` ツールでヒーププロファイルを確認できます。

- Go ランタイムをインストールするか、Go ベースの Docker コンテナを起動します  
- Docker/Kubernetes で実行している場合はポート 6060 を公開します

プロファイルをビジュアルで確認するには:

```bash
go tool pprof -png http://{host}:6060/debug/pprof/heap
```

テキスト形式で確認するには:

```bash
go tool pprof -top http://{host}:6060/debug/pprof/heap
```

#### コンテナ使用量を確認する

Kubernetes 上で Weaviate を実行している場合、`kubectl` でコンテナ全体のメモリ使用量を確認できます:

```bash
kubectl exec weaviate-0 -- /usr/bin/free
```

ここで `weaviate-0` は Pod 名です。

外部（OS／コンテナレベル）から見たメモリ消費は、実際よりかなり高く見える点に注意してください。Go ランタイムは非常に機会主義的で、しばしば [MADV_FREE](https://www.man7.org/linux/man-pages/man2/madvise.2.html) を使用します。これは必要に応じてメモリの一部を容易に解放できることを意味します。そのため、コンテナで Weaviate だけが動作している場合、実際に必要な量以上のメモリを保持しますが、他プロセスが必要としたときには迅速に解放できます。

したがって、この方法はメモリ使用量の上限を把握するのに有用です。一方、`pprof` を見ると Weaviate の具体的なヒーププロファイルをより正確に把握できます。

### システムとデータの可用性を両立させるシャード読み込み設定

Weaviate は起動時にデプロイ内のすべてのシャードからデータを読み込みます。既定ではレイジーシャード読み込みが有効で、シャードをバックグラウンドで読み込みながら、すでに読み込まれたシャードに対しては即座にクエリを受け付けるため、起動が高速化されます。

しかし、単一テナントのコレクションで高負荷の状況では、レイジー読み込みによりインポート操作が遅くなったり部分的に失敗したりする場合があります。このような場合は、以下の環境変数を設定し、[レイジー読み込みを無効化](../concepts/storage.md#lazy-shard-loading)することを検討してください。

```
DISABLE_LAZY_LOAD_SHARDS: "true"
```

これにより、Weaviate が Ready と報告する前にすべてのシャードが完全に読み込まれます。

:::caution 重要
レイジーシャード読み込みを無効化するのは単一テナントのコレクションに限ってください。マルチテナント環境では、起動時間を大幅に短縮できるため、レイジー読み込みを有効のままにしておくことを推奨します。
:::

## データ構造

### クロスリファレンスとフラット化プロパティの比較

データスキーマ設計時には、クロスリファレンスを使用するかフラット化プロパティを使用するかを検討してください。リレーショナルデータベースの経験があると、データを正規化しクロスリファレンスを使いたくなるかもしれません。

しかし、Weaviate ではクロスリファレンスには以下のような欠点があります。

- ベクトライズされないため、その情報がオブジェクトのベクトル表現に組み込まれません。
- 参照先オブジェクトを取得する追加クエリが必要なため、クエリが遅くなる可能性があります。Weaviate はグラフのようなクエリやジョインを想定していません。

代わりに、情報を別のプロパティとして各オブジェクトに直接埋め込むことを検討してください。これにより情報がベクトライズされ、より効率的にクエリできます。

<!-- ### Choose the right property data type -->

<!-- ## Optimize queries -->

<!-- ### Index the right properties -->

## データ操作

### データスキーマの明示的な定義

Weaviate には、データのスキーマを自動推論する便利な ["auto-schema" 機能](../config-refs/collections.mdx#auto-schema) があります。

しかし、本番環境ではスキーマを明示的に定義し、auto-schema 機能を無効化する（`AUTOSCHEMA_ENABLED: 'false'` と設定）ことを推奨します。これにより、データが Weaviate に正しく解釈され、不正なデータがシステムに取り込まれて予期せぬプロパティが作成されるのを防げます。

例として、次の 2 つのオブジェクトをインポートする場合を考えます。

```json
[
    {"title": "The Bourne Identity", "category": "Action"},
    {"title": "The Bourne Supremacy", "cattegory": "Action"},
    {"title": "The Bourne Ultimatum", "category": 2007},
]
```

この例では、2 つ目と 3 つ目のオブジェクトが不正です。2 つ目はプロパティ名 `cattegory` にタイプミスがあり、3 つ目は `category` が文字列ではなく数値です。

auto-schema が有効だと、Weaviate はコレクションにプロパティ `cattegory` を作成し、クエリ時に想定外の挙動を引き起こす可能性があります。また、3 つ目のオブジェクトにより `category` プロパティが `INT` 型で作成され、意図しない結果となります。

代わりに auto-schema を無効化し、スキーマを明示的に定義します。

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

これにより、正しいスキーマを持つオブジェクトのみが Weaviate に取り込まれ、不正なスキーマのオブジェクトを取り込もうとした場合にはユーザーに通知されます。

:::tip さらなるリソース
- [概念: データスキーマ](../concepts/data.md#data-schema)
- [リファレンス: コレクション定義 - Auto-schema](../config-refs/collections.mdx#auto-schema)
:::

### バッチインポートによるデータ取り込みの高速化

10 件を超えるデータをインポートする場合は、必ずバッチインポートを使用してください。これにより、インポート速度が大幅に向上します。その理由は次の 2 点です。

- Weaviate へのリクエスト回数が減り、ネットワークのオーバーヘッドが減少します。
- Weaviate がデータのベクトライズを調整する場合、ベクトライズもバッチで送信でき、特に GPU で推論を行う場合に大幅な高速化が期待できます。

```python
# ⬇️ Don't do this
for obj in objects:
    collection.data.insert(properties=obj)

# ✅ Do this
with collection.batch.fixed_size(batch_size=200) as batch:
    for obj in objects:
        batch.add_object(properties=obj)
```

:::tip さらなるリソース
- [How-to: データのバッチインポート](../manage-objects/import.mdx)
:::

### 非アクティブテナントのオフロードによるコスト削減

マルチテナンシーを利用しており、頻繁にクエリされないテナントがある場合は、それらをコールド（クラウド）ストレージへオフロードすることを検討してください。

![Storage Tiers](../starter-guides/managing-resources/img/storage-tiers.jpg)

オフロードされたテナントはクラウドストレージバケットに保存され、必要に応じて Weaviate に再ロードできます。これにより Weaviate のメモリおよびディスク使用量を大幅に削減でき、コスト削減につながります。

テナントが再度使用される可能性がある場合（例: ユーザーがログインしたとき）には、Weaviate に再ロードすることで再度クエリ可能になります。

:::info オープンソース版 Weaviate のみで利用可能
現時点ではテナントのオフロードはオープンソース版 Weaviate のみで利用可能です。将来的には Weaviate Cloud でも提供予定です。
:::

:::tip さらなるリソース
- [スターターガイド: リソース管理](../starter-guides/managing-resources/index.md)
- [How-to: テナント状態の管理](../manage-collections/tenant-states.mdx)
:::

<!-- ### Data validation strategies -->

<!-- ## Queries -->

### リランカーの使用検討

### 効果的なハイブリッド検索戦略 -->

## アプリケーション設計と統合

### クライアントのインスタンス生成の最小化

 Weaviate クライアントオブジェクトをインスタンス化する際には、接続の確立やヘルスチェックを行うための I/O 操作によりパフォーマンスのオーバーヘッドが発生します。

可能な限り、同じクライアントオブジェクトを再利用してできるだけ多くの操作を行ってください。一般的に、クライアントオブジェクトはスレッドセーフで、複数スレッド間で並列に使用できます。

どうしても複数のクライアントオブジェクトが必要な場合は、初期チェックをスキップすることをご検討ください（例: [Python](../client-libraries/python/notes-best-practices.mdx#initial-connection-checks)）。これにより、複数のクライアントをインスタンス化する際のオーバーヘッドを大幅に削減できます。

なお、クライアントライブラリ固有の制限が存在する場合があります。たとえば、 Weaviate Python クライアントは、[クライアントオブジェクトにつき 1 つのバッチインポートスレッド](../client-libraries/python/notes-best-practices.mdx#thread-safety)のみで使用する必要があります。

さらに、非同期環境でのパフォーマンス向上のために、[非同期クライアント API の利用](#use-the-relevant-async-client-as-needed)をご検討ください。

### 必要に応じた Async Client の使用

非同期環境で Weaviate を使用する場合は、非同期クライアント API の利用を検討してください。特に複数のクエリを並列に実行する場合、アプリケーションのパフォーマンスを大幅に向上させることができます。

#### Python

 Weaviate Python クライアント `4.7.0` 以降には、[非同期クライアント API (`WeaviateAsyncClient`)](../client-libraries/python/async.md) が含まれています。

#### Java

 Weaviate Java クライアント `5.0.0` 以降には、[非同期クライアント API (`WeaviateAsyncClient`)](https://javadoc.io/doc/io.weaviate/client/latest/io/weaviate/client/v1/async/WeaviateAsyncClient.html) が含まれています。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

