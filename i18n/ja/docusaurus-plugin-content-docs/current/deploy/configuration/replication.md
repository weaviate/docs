---
title: レプリケーション
image: og/docs/configuration.jpg
# tags: ['configuration', 'operations', 'monitoring', 'observability']
---

import SkipLink from '/src/components/SkipValidationLink'

Weaviate インスタンスはレプリケーション可能です。レプリケーションにより読み取りスループットが向上し、可用性が高まり、ゼロダウンタイムでのアップグレードが可能になります。

Weaviate におけるレプリケーションの設計と実装の詳細については、[レプリケーションアーキテクチャ](/weaviate/concepts/replication-architecture/index.md)を参照してください。

## 設定方法

import RaftRFChangeWarning from '/\_includes/1-25-replication-factor.mdx';

<RaftRFChangeWarning/>

レプリケーションはデフォルトで無効になっています。コレクションごとに[コレクション設定](/weaviate/manage-collections/multi-node-setup.mdx#replication-settings)で有効化できます。これにより、データセット内の各クラスに異なるレプリケーションファクターを設定できます。

レプリケーションを有効にするには、以下のいずれか、または両方を設定します。

- Weaviate 全体に対して `REPLICATION_MINIMUM_FACTOR` 環境変数を設定
- コレクションに対して `replicationFactor` パラメーターを設定

### Weaviate 全体の最小レプリケーションファクター

`REPLICATION_MINIMUM_FACTOR` 環境変数は、該当 Weaviate インスタンス内のすべてのコレクションに対する最小レプリケーションファクターを設定します。

[コレクションのレプリケーションファクター](#replication-factor-for-a-collection)を設定した場合は、そのコレクションの値が最小レプリケーションファクターより優先されます。

### コレクションのレプリケーションファクター

import SchemaReplication from '/\_includes/code/schema.things.create.replication.mdx';

<SchemaReplication/>

この例ではレプリケーション数が 3 です。データをインポートする前にレプリケーションファクターを設定すると、すべてのデータが 3 回複製されます。

レプリケーションファクターは、データを追加した後でも変更できます。変更後は、新しいデータが新旧両方のレプリカノードにコピーされます。

例のデータスキーマでは[書き込み整合性](/weaviate/concepts/replication-architecture/consistency.md#tunable-write-consistency)レベルが `ALL` に設定されています。スキーマをアップロードまたは更新すると、変更はコーディネーターノード経由で `ALL` ノードに送信されます。コーディネーターノードはすべてのノードから成功応答を受け取ってからクライアントに成功メッセージを返すため、分散 Weaviate で高い整合性が確保されます。

## データ整合性

Weaviate はノード間でデータの不一致を検出すると、同期が取れていないデータを修復しようとします。

バージョン  v1.26 以降では、Weaviate は[非同期レプリケーション](/weaviate/concepts/replication-architecture/consistency.md#async-replication)を追加し、能動的に不整合を検出します。以前のバージョンでは、Weaviate は[リード時修復](/weaviate/concepts/replication-architecture/consistency.md#repair-on-read)戦略を採用しており、読み取り時に不整合を修復します。

リード時修復は自動で行われます。非同期レプリケーションを有効にするには、コレクション定義の `replicationConfig` セクションで `asyncEnabled` を `true` に設定します。

import ReplicationConfigWithAsyncRepair from '/\_includes/code/configuration/replication-consistency.mdx';

<ReplicationConfigWithAsyncRepair />

### 非同期レプリケーション設定 {#async-replication-settings}

:::info `v1.29` で追加
非同期レプリケーションを設定するための[環境変数](/deploy/configuration/env-vars/index.md#async-replication)（`ASYNC_*`）は  v1.29 で導入されました。
:::

非同期レプリケーションは、複数ノード間で複製されたデータの整合性を確保するのに役立ちます。

ユースケースに合わせて、以下の[環境変数](/deploy/configuration/env-vars/index.md#async-replication)を調整してください。

#### ロギング

- **ロガーの頻度を設定:** `ASYNC_REPLICATION_LOGGING_FREQUENCY`  
  非同期レプリケーションのバックグラウンドプロセスがイベントをログ出力する間隔を定義します。

#### データ比較

- **比較の実行頻度を設定:** `ASYNC_REPLICATION_FREQUENCY`  
  各ノードがローカルデータを他ノードと比較する間隔を定義します。
- **比較タイムアウトを設定:** `ASYNC_REPLICATION_DIFF_PER_NODE_TIMEOUT`  
  ノードが応答しない場合に比較処理を待機するタイムアウトを任意で設定します。
- **ノード可用性を監視:** `ASYNC_REPLICATION_ALIVE_NODES_CHECKING_FREQUENCY`  
  ノードの可用性に変化があった際に比較をトリガーします。
- **ハッシュツリーの高さを設定:** `ASYNC_REPLICATION_HASHTREE_HEIGHT`  
  ハッシュツリーのサイズを指定します。複数レベルでハッシュダイジェストを比較することで、全データをスキャンする代わりに差分を絞り込みます。メモリおよびパフォーマンスへの影響については[こちら](/weaviate/concepts/replication-architecture/consistency.md#memory-and-performance-considerations-for-async-replication)を参照してください。
- **ダイジェスト比較のバッチサイズ:** `ASYNC_REPLICATION_DIFF_BATCH_SIZE`  
  ノード間でダイジェスト（例: 最終更新時刻）を比較してから実際のオブジェクトを伝播するまでに比較するオブジェクト数を定義します。

#### データ同期

ノード間の差分が検出されると、Weaviate は不足または古いデータを伝播します。同期を次のように設定してください。

- **伝播の頻度を設定:** `ASYNC_REPLICATION_FREQUENCY_WHILE_PROPAGATING`  
  ノードで同期が完了した後、一時的にデータ比較の頻度をこの値に調整します。
- **伝播タイムアウトを設定:** `ASYNC_REPLICATION_PROPAGATION_TIMEOUT`  
  ノードが応答しない場合に伝播処理を待機するタイムアウトを任意で設定します。
- **伝播遅延を設定:** `ASYNC_REPLICATION_PROPAGATION_DELAY`  
  非同期書き込みがすべてのノードに届くまで待機する遅延時間を定義します。
- **データ伝播のバッチサイズ:** `ASYNC_REPLICATION_PROPAGATION_BATCH_SIZE`  
  伝播フェーズで 1 バッチとして送信されるオブジェクト数を定義します。
- **伝播の上限を設定:** `ASYNC_REPLICATION_PROPAGATION_LIMIT`  
  1 回のレプリケーションイテレーションで伝播する未同期オブジェクトの上限を設定します。
- **伝播の並列数を設定:** `ASYNC_REPLICATION_PROPAGATION_CONCURRENCY`  
  オブジェクトのバッチを他ノードへ送信できる同時ワーカー数を指定し、複数の伝播バッチを同時に送信できるようにします。

:::tip
クラスターサイズやネットワーク遅延に応じてこれらの設定を調整し、最適なパフォーマンスを確保してください。高トラフィックのクラスターでは小さなバッチサイズと短いタイムアウトが有効な場合があり、大規模クラスターではより保守的な設定が必要になることがあります。
:::

## 使用方法: クエリ

データを追加（書き込み）したりクエリ（読み取り）を実行したりすると、クラスター内の 1 つ以上のレプリカノードがリクエストに応答します。何台のノードから成功応答と確認応答をコーディネーターノードが受け取る必要があるかは `consistency_level` に依存します。利用可能な[整合性レベル](/weaviate/concepts/replication-architecture/consistency.md)は `ONE`, `QUORUM`（`replication_factor / 2 + 1`）および `ALL` です。

`consistency_level` はクエリ時に指定できます。

```bash
# Get an object by ID, with consistency level ONE
curl "http://localhost:8080/v1/objects/{ClassName}/{id}?consistency_level=ONE"
```

:::note
バージョン  v1.17 では、[ID でデータを取得する読み取りクエリ](/weaviate/manage-objects/read.mdx#get-an-object-by-id)のみが調整可能な整合性レベルを持ち、その他のオブジェクト固有 REST エンドポイント（読み取り・書き込み）はすべて `ALL` を使用していました。  v1.18 以降は、すべての書き込み・読み取りクエリで `ONE`, `QUORUM`（デフォルト）または `ALL` を選択できます。GraphQL エンドポイントは両バージョンとも `ONE` を使用します。
:::

import QueryReplication from '/\_includes/code/replication.get.object.by.id.mdx';

<QueryReplication/>



## レプリカの移動とステータス

:::info Added in `v1.32`
:::

初期のレプリケーションファクターを設定するだけでなく、Weaviate クラスター内でシャード レプリカの配置を積極的に管理できます。これは、スケール後のデータ再バランス、ノードの廃止、データローカリティの最適化に役立ちます。レプリカの移動は、専用の <SkipLink href="/weaviate/api/rest#tag/replication">RESTful API エンドポイント</SkipLink> または [クライアントライブラリを通じたプログラムによる操作](./replica-movement.mdx) により管理できます。

## 関連ページ

- [概念: レプリケーションアーキテクチャ](/weaviate/concepts/replication-architecture/index.md)
- [非同期レプリケーションの設定](./async-rep.md)

## 質問とフィードバック

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>

