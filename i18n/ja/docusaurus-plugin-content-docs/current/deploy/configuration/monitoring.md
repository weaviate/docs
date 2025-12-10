---
title: 監視
image: og/docs/configuration.jpg
# tags: ['configuration', 'operations', 'monitoring', 'observability']
---

Weaviate は監視用に Prometheus 互換のメトリクスを公開できます。  
一般的な Prometheus/Grafana 構成を使って、メトリクスをさまざまなダッシュボードで可視化できます。

メトリクスを使用すると、リクエストのレイテンシー、インポート速度、ベクトルストレージとオブジェクトストレージに費やした時間、メモリ使用量、アプリケーション使用状況などを測定できます。

## 監視の設定

### Weaviate での有効化

Weaviate にメトリクスを収集し、Prometheus 互換形式で公開させるには、次の環境変数を設定するだけです。

```sh
PROMETHEUS_MONITORING_ENABLED=true
```

デフォルトでは、Weaviate は `<hostname>:2112/metrics` でメトリクスを公開します。必要に応じて、次の環境変数を使用してポートを変更できます。

```sh
PROMETHEUS_MONITORING_PORT=3456
```

### Weaviate からのメトリクス収集

メトリクスは通常、Prometheus などの時系列データベースにスクレイピングされます。メトリクスの利用方法は、環境やセットアップによって異なります。

[Weaviate examples レポジトリには、Prometheus、Grafana、いくつかのサンプルダッシュボードを使用した完全に事前設定済みのセットアップが含まれています](https://github.com/weaviate/weaviate-examples/tree/main/monitoring-prometheus-grafana)。  
1 つのコマンドで監視とダッシュボードを含むフルセットアップを起動できます。このセットアップでは、次のコンポーネントが使用されます。

* Docker Compose を使用して、1 つのコマンドで起動できる完全構成済みのセットアップを提供します。  
* Weaviate は前述のとおり Prometheus メトリクスを公開するように設定されています。  
* Prometheus インスタンスも起動され、15 秒ごとに Weaviate からメトリクスをスクレイピングするよう構成されています。  
* Grafana インスタンスも起動され、Prometheus インスタンスをメトリクスプロバイダーとして使用するように設定されています。さらに、いくつかのサンプルダッシュボードを含むダッシュボードプロバイダーも実行します。

### マルチテナンシー

マルチテナンシーを使用する場合は、すべてのテナントのデータをまとめて監視できるよう、`PROMETHEUS_MONITORING_GROUP` [環境変数](/deploy/configuration/env-vars/index.md) を `true` に設定することをお勧めします。

## 取得可能なメトリクス

Weaviate のメトリクスシステムで取得できるメトリクスのリストは、継続的に拡張されています。完全な一覧は [`prometheus.go`](https://github.com/weaviate/weaviate/blob/main/usecases/monitoring/prometheus.go) ソースコードファイルにあります。

このページでは、特に重要なメトリクスとその用途を紹介します。

メトリクスは通常、後から集約できるよう、かなり細かい粒度で収集されます。たとえば粒度が「shard」の場合、同じ「class」のすべての「shard」メトリクスを集約してクラス単位のメトリクスを得たり、すべてを集約して Weaviate インスタンス全体のメトリクスを得たりできます。

| メトリクス | 説明 | ラベル | 種類 |
|---|---|---|---|
| `async_operations_running` | 現在実行中の非同期操作の数。対象の操作は `operation` ラベルで定義されます。 | `operation`, `class_name`, `shard_name`, `path` | `Gauge` |
| `batch_delete_durations_ms` | バッチ削除に要した時間（ms）。どの操作を測定しているかは `operation` ラベルでさらに区別します。粒度はクラスのシャードです。 | `class_name`, `shard_name` | `Histogram` |
| `batch_durations_ms` | 単一のバッチ操作に要した時間（ms）。バッチ内でどの操作（例: object、inverted、vector）が実行されたかは `operation` ラベルで区別します。粒度はクラスのシャードです。 | `operation`, `class_name`, `shard_name` | `Histogram` |
| `index_queue_delete_duration_ms` | インデックスキューおよび基盤となるインデックスから 1 つ以上のベクトルを削除するのに要した時間。 | `class_name`, `shard_name`, `target_vector` | `Summary` |
| `index_queue_paused` | インデックスキューが一時停止しているかどうか。 | `class_name`, `shard_name`, `target_vector` | `Gauge` |
| `index_queue_preload_count` | インデックスキューに事前ロードされたベクトルの数。 | `class_name`, `shard_name`, `target_vector` | `Gauge` |
| `index_queue_preload_duration_ms` | 未インデックスのベクトルをインデックスキューに事前ロードするのに要した時間。 | `class_name`, `shard_name`, `target_vector` | `Summary` |
| `index_queue_push_duration_ms` | 1 つ以上のベクトルをインデックスキューにプッシュするのに要した時間。 | `class_name`, `shard_name`, `target_vector` | `Summary` |
| `index_queue_search_duration_ms` | インデックスキューおよび基盤となるインデックス内でベクトルを検索するのに要した時間。 | `class_name`, `shard_name`, `target_vector` | `Summary` |
| `index_queue_size` | インデックスキュー内のベクトルの数。 | `class_name`, `shard_name`, `target_vector` | `Gauge` |
| `index_queue_stale_count` | インデックスキューが stale と判定された回数。 | `class_name`, `shard_name`, `target_vector` | `Counter` |
| `index_queue_vectors_dequeued` | 1 ティックあたりにワーカーへ送信されたベクトルの数。 | `class_name`, `shard_name`, `target_vector` | `Gauge` |
| `index_queue_wait_duration_ms` | ワーカーの処理完了を待機した時間。 | `class_name`, `shard_name`, `target_vector` | `Summary` |
| `lsm_active_segments` | 各シャードに現在存在するセグメントの数。粒度はクラスのシャードで、`strategy` ごとにグループ化されます。 | `strategy`, `class_name`, `shard_name`, `path` | `Gauge` |
| `lsm_bloom_filter_duration_ms` | シャードごとのブルームフィルター操作に要した時間（ms）。粒度はクラスのシャードで、`strategy` ごとにグループ化されます。 | `operation`, `strategy`, `class_name`, `shard_name` | `Histogram` |
| `lsm_segment_count` | レベル別のセグメント数。 | `strategy`, `class_name`, `shard_name`, `path`, `level` | `Gauge` |
| `lsm_segment_objects` | レベル別の LSM セグメントあたりのエントリ数。粒度はクラスのシャードで、`strategy` と `level` でグループ化されます。 | `operation`, `strategy`, `class_name`, `shard_name`, `path`, `level` | `Gauge` |
| `lsm_segment_size` | レベルと単位ごとの LSM セグメントサイズ。 | `strategy`, `class_name`, `shard_name`, `path`, `level`, `unit` | `Gauge` |
| `object_count` | 存在するオブジェクトの数。粒度はクラスのシャードです。 | `class_name`, `shard_name` | `Gauge` |
| `objects_durations_ms` | `put`、`delete` など `operation` ラベルで示される個別オブジェクト操作の所要時間（バッチの一部としても計測）。`step` ラベルでさらに詳細な区別が可能です。粒度はクラスのシャードです。 | `class_name`, `shard_name` | `Histogram` |
| `requests_total` | ユーザーリクエストが成功したか失敗したかを追跡するメトリクス。 | `api`, `query_type`, `class_name` | `Gauge` |
| `startup_diskio_throughput` | 起動時操作（HNSW インデックスの読み込みや LSM セグメントの復元など）におけるディスク I/O スループット（bytes/s）。操作の種類は `operation` ラベルで定義されます。 | `operation`, `step`, `class_name`, `shard_name` | `Histogram` |
| `startup_durations_ms` | 個々の起動時操作に要した時間（ms）。操作の種類は `operation` ラベルで定義されます。 | `operation`, `class_name`, `shard_name` | `Histogram` |
| `vector_index_durations_ms` | ベクトルインデックスの通常操作（挿入、削除など）に要した時間。操作の種類は `operation` ラベルで定義され、`step` ラベルでさらに詳細を区別できます。 | `operation`, `step`, `class_name`, `shard_name` | `Histogram` |
| `vector_index_maintenance_durations_ms` | 同期または非同期のベクトルインデックスメンテナンス操作に要した時間。操作の種類は `operation` ラベルで定義されます。 | `opeartion`, `class_name`, `shard_name` | `Histogram` |
| `vector_index_operations` | ベクトルインデックスに対して実行された変更操作の総数。操作の種類は `operation` ラベルで定義されます。 | `operation`, `class_name`, `shard_name` | `Gauge` |
| `vector_index_size` | ベクトルインデックスの総容量。インデックスは先読みで拡張されるため、取り込んだベクトル数より大きくなるのが一般的です。 | `class_name`, `shard_name` | `Gauge` |
| `vector_index_tombstone_cleaned` | 修復操作後に削除・除去されたベクトルの総数。 | `class_name`, `shard_name` | `Counter` |
| `vector_index_tombstone_cleanup_threads` | 削除後のベクトルインデックス修復・クリーンアップで現在稼働中のスレッド数。 | `class_name`, `shard_name` | `Gauge` |
| `vector_index_tombstones` | ベクトルインデックス内で現在有効なトゥームストーンの数。削除が行われるたびに増加し、修復が完了すると減少します。 | `class_name`, `shard_name` | `Gauge` |
| `weaviate_build_info` | ビルドに関する一般情報（実行中のバージョン、稼働時間など）を提供します。 | `version`, `revision`, `branch`, `goVersion` | `Gauge` |
| `weaviate_runtime_config_hash` | 現在有効なランタイム設定のハッシュ値。新しい設定が反映されたタイミングを追跡するのに役立ちます。 | `sha256` | `Gauge` |
| `weaviate_runtime_config_last_load_success` | 最後の設定読み込みが成功したかどうかを示します（成功は `1`、失敗は `0`）。 |  | `Gauge` |
| `weaviate_schema_collections` | 任意の時点でのコレクション総数を示します。 | `nodeID` | `Gauge` |
| `weaviate_schema_shards` | 任意の時点でのシャード総数を示します。  | `nodeID`, `status(HOT, COLD, WARM, FROZEN)` | `Gauge` |
| `weaviate_internal_sample_memberlist_queue_broadcasts` | Memberlist のブロードキャストキューにあるメッセージ数を示します。 | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_timer_memberlist_gossip` | Memberlist で行われる各ゴシップのレイテンシー分布を示します。 | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_counter_raft_apply` | 設定された間隔内のトランザクション数。 | NA | `counter` |
| `weaviate_internal_counter_raft_state_candidate` | Raft サーバーが選挙を開始した回数。 | NA | `counter` |
| `weaviate_internal_counter_raft_state_follower` | 設定間隔内で Raft サーバーが follower になった回数。 | NA | `summary` |
| `weaviate_internal_counter_raft_state_leader` | Raft サーバーが leader になった回数。 | NA | `counter` |
| `weaviate_internal_counter_raft_transition_heartbeat_timeout` | 最後に認識した leader からのハートビートを受信できず `candidate` 状態へ遷移した回数。 | NA | `Counter` |
| `weaviate_internal_gauge_raft_commitNumLogs` | 有限状態マシンに適用するために 1 バッチで処理されたログ数。 | NA | `gauge` |
| `weaviate_internal_gauge_raft_leader_dispatchNumLogs` | 直近のバッチでディスクにコミットされたログ数。 | NA | `gauge` |
| `weaviate_internal_gauge_raft_leader_oldestLogAge` | リーダーのログストアにある最も古いログが書き込まれてからの経過ミリ秒数。書き込み速度が高くスナップショットが大きい場合、レプリケーションの健全性に影響する可能性があります。フォロワーが再起動後に復元を行う際、この値より復元時間が長いと追従できなくなる可能性があるためです。`raft_fsm_lastRestoreDuration` や `aft_rpc_installSnapshot` と合わせて監視してください。通常は、リーダーでスナップショットが完了してログが切り詰められるまで、このゲージ値は時間とともに線形に増加します。 | NA | `gauge` |
| `weaviate_internal_gauge_raft_peers` | Raft クラスター構成内のピア数。 | NA | `gauge` |
| `weaviate_internal_sample_raft_boltdb_logBatchSize` | 1 バッチで DB に書き込まれるログの合計サイズ（バイト）を測定します。 | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_sample_raft_boltdb_logSize` | DB に書き込まれるログのサイズを測定します。 | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_sample_raft_boltdb_logsPerBatch` | DB にバッチ書き込みされるログ数を測定します。 | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_sample_raft_boltdb_writeCapacity` | 1 秒あたりに書き込めるログ数という観点での理論上の書き込み容量。このサンプルは、今後のバッチログ書き込みが今回と同様であった場合の容量を示します。この“同様”には、バッチサイズ、バイトサイズ、ディスク性能、BoltDB 性能の 4 つが含まれます。これらは固定ではなく、サンプルごとに値が変動する可能性が高いですが、より長い時間窓で集約することで、この BoltDB ストアの実力を把握できます。 | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_sample_raft_thread_fsm_saturation` | Raft FSM の goroutine がビジーで新しい作業を受け付けられない時間の割合を概算で測定します。 | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_sample_raft_thread_main_saturation` | Raft のメイン goroutine がビジーで新しい作業を受け付けられない時間の割合（パーセント）を概算で測定します。 |  `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_timer_raft_boltdb_getLog` | DB からログを読み出すのに要した時間（ms）を測定します。 | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_timer_raft_boltdb_storeLogs` | 指定されたノードに対して最後にエントリ追加を要求してから未処理のログをすべて記録するまでの時間。 | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_internal_timer_raft_commitTime` | リーダーノードで新しいエントリを Raft ログにコミットするのに要した時間。 | `quantile=0.5, 0.9, 0.99` | `summary` |
| `weaviate_internal_timer_raft_fsm_apply` | 前回のインターバル以降に有限状態マシンがコミットしたログ数。 | `quantile=0.5, 0.9, 0.99` | `summary` |
| `weaviate_internal_timer_raft_fsm_enqueue` | 有限状態マシンが適用するためにログをバッチでキューに入れるのに要した時間。 | `quantile=0.5, 0.9, 0.99` | `summary` |
| `weaviate_internal_timer_raft_leader_dispatchLog` | リーダーノードがログエントリをディスクに書き込むのに要した時間。 | `quantile=0.5, 0.9, 0.99` | `Summary` |
| `weaviate_usage_{gcs\|s3}_operations_total` | モジュールラベルごとの操作総数。 | `operation`: collect/upload, `status`: success/error | `Counter` |
| `weaviate_usage_{gcs\|s3}_operation_latency_seconds` | 使用状況操作のレイテンシー（秒）。 | `operation`: collect/upload | `Histogram` |
| `weaviate_usage_{gcs\|s3}_resource_count` | モジュールが追跡しているリソース数。 | `resource_type`: collections/shards/backups | `Gauge` |
| `weaviate_usage_{gcs\|s3}_uploaded_file_size_bytes` | アップロードされた使用状況ファイルのサイズ（バイト）。 | NA | `Gauge` |

新しいメトリクスで Weaviate を拡張するのは非常に簡単です。新しいメトリクスを提案するには、[コントリビューターガイド](/contributor-guide) をご覧ください。

### バージョニング

メトリクスは他の Weaviate 機能で採用されているセマンティックバージョニングのガイドラインには従わないことにご注意ください。Weaviate のメイン API は安定しており、破壊的変更は非常にまれです。しかし、メトリクスはライフサイクルが短い傾向があります。たとえば、本番環境で特定のメトリクスを監視するコストが高くなり過ぎた場合、互換性のない変更を導入したりメトリクス自体を削除したりする必要が生じることがあります。その結果、Weaviate のマイナーリリースに Monitoring システムへ影響する破壊的変更が含まれる可能性があります。その際には、リリースノートで明確に案内されます。

## サンプルダッシュボード

Weaviate にはデフォルトでダッシュボードは付属していませんが、開発中およびユーザー支援時に各 Weaviate チームが使用しているダッシュボードの一覧を以下に示します。サポートは提供されませんが、参考になるかもしれません。用途に最適化した独自のダッシュボードを設計する際のヒントとしてご活用ください:

| ダッシュボード | 目的 | プレビュー |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [Kubernetes でのクラスターワークロード](https://github.com/weaviate/weaviate/blob/main/tools/dev/grafana/dashboards/kubernetes.json) | Kubernetes におけるクラスターワークロード、使用状況、アクティビティを可視化します | ![Kubernetes でのクラスターワークロード](./img/weaviate-sample-dashboard-kubernetes.png 'Kubernetes でのクラスターワークロード') |
| [Weaviate へのデータインポート](https://github.com/weaviate/weaviate/blob/master/tools/dev/grafana/dashboards/importing.json) | インポート処理（オブジェクトストア、転置インデックス、ベクトルインデックスなどのコンポーネントを含む）の速度を可視化します | ![Weaviate へのデータインポート](./img/weaviate-sample-dashboard-importing.png 'Weaviate へのデータインポート') |
| [オブジェクト操作](https://github.com/weaviate/weaviate/blob/master/tools/dev/grafana/dashboards/objects.json) | GET や PUT など、オブジェクト操作全体の速度を可視化します | ![オブジェクト操作](./img/weaviate-sample-dashboard-objects.png 'オブジェクト操作') |
| [ベクトルインデックス](https://github.com/weaviate/weaviate/blob/master/tools/dev/grafana/dashboards/vectorindex.json) | HNSW ベクトルインデックスの現在の状態と操作を可視化します | ![ベクトルインデックス](./img/weaviate-sample-dashboard-vector.png 'ベクトルインデックス') |
| [LSM ストア](https://github.com/weaviate/weaviate/blob/master/tools/dev/grafana/dashboards/lsm.json) | Weaviate 内の各 LSM ストア（セグメントを含む）の内部を分析できます | ![LSM ストア](./img/weaviate-sample-dashboard-lsm.png 'LSM ストア') |
| [スタートアップ](https://github.com/weaviate/weaviate/blob/master/tools/dev/grafana/dashboards/startup.json) | リカバリー処理を含む起動プロセスを可視化します | ![スタートアップ](./img/weaviate-sample-dashboard-startup.png 'スタートアップ') |
| [使用状況](https://github.com/weaviate/weaviate/blob/master/tools/dev/grafana/dashboards/usage.json) | インポートされたオブジェクト数などの使用状況メトリクスを取得します | ![使用状況](./img/weaviate-sample-dashboard-usage.png '使用状況') |
| [非同期インデックスキュー](https://github.com/weaviate/weaviate/blob/main/tools/dev/grafana/dashboards/index_queue.json) | インデックスキューのアクティビティを監視します | ![非同期インデックスキュー](./img/weaviate-sample-dashboard-async-queue.png '非同期インデックスキュー') |

## `nodes` API エンドポイント

コレクションの詳細をプログラムから取得するには、[`nodes`](/deploy/configuration/nodes.md) REST エンドポイントをご利用ください。

import APIOutputs from '/_includes/rest/node-endpoint-info.mdx';

<APIOutputs />

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

