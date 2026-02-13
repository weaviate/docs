---
title: 環境変数
sidebar_position: 0
image: og/docs/configuration.jpg
# tags: ['HNSW']
---

Docker または Kubernetes デプロイメントで Weaviate を構成するには、これらの環境変数を設定できます。

:::info Boolean environment variables
Boolean 型の環境変数では `"on"`、`"enabled"`、`"1"`、`"true"` が `true` として解釈されます。  
それ以外の値はすべて `false` として解釈されます。
:::

:::tip Runtime configuration updates
Weaviate はランタイム構成管理をサポートしています。設定方法と使用可能な環境変数は [こちら](./runtime-config.md) を参照してください。
:::

## 一般

import Link from '@docusaurus/Link';
import APITable from '@site/src/components/APITable';

```mdx-code-block
<APITable>
```

| Variable | Description | Type | Example Value |
| --- | --- | --- | --- |
| `ASYNC_INDEXING` | (実験的、`v1.22` で追加) オブジェクト作成プロセスとは非同期でベクトル インデックスを作成します。大量データのインポート時に便利です。（既定値: `false`） | `boolean` | `false` |
| `AUTOSCHEMA_ENABLED` | 必要に応じてオートスキーマでスキーマを推論するかどうか（既定値: `true`） | `boolean` | `true` |
| `DEFAULT_VECTORIZER_MODULE` | 既定のベクトライザー モジュール。スキーマでクラス レベルの値が定義されている場合はそちらが優先されます。 | `string` | `text2vec-contextionary` |
| `DISABLE_LAZY_LOAD_SHARDS` | v1.23 で追加。`false` の場合、マルチテナント環境での平均復旧時間を短縮するためにシャードのレイジー ロードを有効にします。 | `string` | `false` |
| `DISABLE_TELEMETRY` | [テレメトリー](/deploy/configuration/telemetry.md) データ収集を無効化します。 | boolean | `false` |
| `DISK_USE_READONLY_PERCENTAGE` | ディスク使用率が指定パーセンテージを超えると、そのノード上のすべてのシャードが `READONLY` とマークされ、以降の書き込み要求が失敗します。詳細は [ディスク使用警告と制限](/deploy/configuration/persistence.md#disk-pressure-warnings-and-limits) を参照してください。 | `string - number` | `90` |
| `DISK_USE_WARNING_PERCENTAGE` | ディスク使用率が指定パーセンテージを超えると、そのノードのディスク上のすべてのシャードが警告をログに出力します。詳細は [ディスク使用警告と制限](/deploy/configuration/persistence.md#disk-pressure-warnings-and-limits) を参照してください。 | `string - number` | `80` |
| `ENABLE_API_BASED_MODULES` | すべての API ベース モジュールを有効にします。（`v1.26.0` 以降実験的） | `boolean` | `true` |
| `ENABLE_MODULES` | 有効化する Weaviate モジュールを指定します。 | `string - comma separated names` | `text2vec-openai,generative-openai` |
| `ENABLE_TOKENIZER_GSE` | [`GSE` トークナイザー](/weaviate/config-refs/collections.mdx) を有効にします。 | `boolean` | `true` |
| `ENABLE_TOKENIZER_KAGOME_JA` | 日本語用 [`Kagome` トークナイザー](/weaviate/config-refs/collections.mdx) を有効にします（`v1.28.0` 以降実験的）。 | `boolean` | `true` |
| `ENABLE_TOKENIZER_KAGOME_KR` | 韓国語用 [`Kagome` トークナイザー](/weaviate/config-refs/collections.mdx#) を有効にします（`v1.25.7` 以降実験的）。 | `boolean` | `true` |
| `GODEBUG` | Go ランタイムのデバッグ変数を制御します。[公式 Go ドキュメント](https://pkg.go.dev/runtime) を参照してください。 | `string - comma-separated list of name=val pairs` | `gctrace=1` |
| `GOMAXPROCS` | 同時に実行可能なスレッド数の最大値を設定します。この値が設定されている場合、`LIMIT_RESOURCES` がそれを尊重します。 | `string - number` | `NUMBER_OF_CPU_CORES` |
| `GOMEMLIMIT` | Go ランタイムのメモリ上限を設定します。Weaviate 用には総メモリの 90〜80% を推奨します。ランタイムは使用量が上限に近づくとガーベジ コレクタを積極的に動作させます。[GOMEMLIMIT について詳しくはこちら](https://weaviate.io/blog/gomemlimit-a-game-changer-for-high-memory-applications)。 | `string - memory limit in SI units` | `4096MiB` |
| `GO_PROFILING_DISABLE` | `true` の場合、Go プロファイリングを無効化します。既定値: `false` | `boolean` | `false` |
| `GO_PROFILING_PORT` | Go プロファイラのポートを設定します。既定値: `6060` | `integer` | `6060` |
| `GRPC_MAX_MESSAGE_SIZE` | gRPC メッセージの最大サイズ（バイト）。(`v1.27.1` で追加) 既定値: 10 MB | `string - number` | `2000000000` |
| `GRPC_PORT` | Weaviate の gRPC サーバーがリクエストを受け付けるポート。既定値: `50051` | `string - number` | `50052` |
| `LIMIT_RESOURCES` | `true` の場合、Weaviate は自動でリソース（メモリ & スレッド）使用量を (0.8 × 総メモリ) と (CPU コア数−1) に制限します。`GOMEMLIMIT` を上書きしますが、`GOMAXPROCS` は尊重します。 | `boolean` | `false` |
| `LOG_FORMAT` | Weaviate のログ フォーマットを設定します。<br/><br/>既定:`json` 出力例: `{"action":"startup","level":"debug","msg":"finished initializing modules","time":"2023-04-12T05:07:43Z"}` <br/>`text`: 文字列出力例: `time="2023-04-12T04:54:23Z" level=debug msg="finished initializing modules" action=startup` | `string` |  |
| `LOG_LEVEL` | Weaviate のログ レベルを設定します。既定: `info`<br/><br/>`panic`: パニックのみ (`v1.24` で追加) <br/>`fatal`: 致命的エントリのみ (`v1.24`) <br/>`error`: エラーのみ (`v1.24`) <br/>`warning`: 警告のみ (`v1.24`) <br/>`info`: 一般運用ログ <br/>`debug`: 非常に詳細 <br/>`trace`: `debug` よりさらに詳細 | `string` | |
| `MAXIMUM_ALLOWED_COLLECTIONS_COUNT` | 1 ノードあたりの最大コレクション数を設定します。`-1` で無制限。既定: `1000` <br/><br/>制限を引き上げる代わりに [アーキテクチャの再検討](/weaviate/starter-guides/managing-collections/collections-scaling-limits.mdx) を推奨します。<br/>`v1.30` で追加 | `string - number` | `20` |
| `MEMORY_READONLY_PERCENTAGE` | メモリ使用率が指定パーセンテージを超えると、そのノード上のすべてのシャードが `READONLY` とマークされ、以降の書き込み要求が失敗します。（既定: `0` ＝無制限） | `string - number` | `75` |
| `MEMORY_WARNING_PERCENTAGE` | メモリ使用率が指定パーセンテージを超えると、そのノードのディスク上のすべてのシャードが警告をログに出力します。（既定: `0` ＝無制限） | `string - number` | `85` |
| `MODULES_CLIENT_TIMEOUT` | Weaviate モジュールへのリクエストのタイムアウト。既定: `50s` | `string - duration` | `5s`, `10m`, `1h` |
| `ORIGIN` | Weaviate の http(s) オリジンを設定します。 | `string - HTTP origin` | `https://my-weaviate-deployment.com` |
| `PERSISTENCE_DATA_PATH` | Weaviate データ ストアのパス。<br/>[ファイルシステムとパフォーマンスに関する注意](/weaviate/concepts/resources.md#file-system)。 | `string - file path` | `/var/lib/weaviate` <br/> v1.24 以降の既定: `./data` |
| `PERSISTENCE_HNSW_DISABLE_SNAPSHOTS` | 設定すると [HNSW スナップショット](/weaviate/concepts/storage.md#persistence-and-crash-recovery) を無効化します。既定: `true`<br/>`v1.31` で追加 | `boolean` | `false` |
| `PERSISTENCE_HNSW_SNAPSHOT_INTERVAL_SECONDS` | 次のスナップショット作成までに必要な最小時間（秒）。既定: `21600` 秒 (6 時間)<br/>`v1.31` で追加 | `string - number` | `3600` |
| `PERSISTENCE_HNSW_SNAPSHOT_MIN_DELTA_COMMITLOGS_NUMBER` | 前回スナップショット以降に作成された新しいコミットログ ファイルの最小数。既定: `1`<br/>`v1.31` で追加 | `string - number` | `100` |
| `PERSISTENCE_HNSW_SNAPSHOT_MIN_DELTA_COMMITLOGS_SIZE_PERCENTAGE` | 新しいコミットログの合計サイズが次のスナップショットをトリガーするために必要な割合（前回スナップショット サイズに対するパーセンテージ）。既定: `5`<br/>`v1.31` で追加 | `string - number` | `15` |
| `PERSISTENCE_HNSW_SNAPSHOT_ON_STARTUP` | 設定すると、起動時にコミットログに変更があれば新しいスナップショットを作成します。変更がなければ既存スナップショットを読み込みます。既定: `true`<br/>`v1.31` で追加 | `boolean` | `false` |
| `PERSISTENCE_HNSW_MAX_LOG_SIZE` | HNSW の [write-ahead-log](/weaviate/concepts/storage.md#hnsw-vector-index-storage) の最大サイズ。大きくするとログ圧縮効率が向上、小さくするとメモリ要件が減少します。既定: 500 MiB | `string` | `4GiB`, `4GB`, `4000000000` |
| `PERSISTENCE_LSM_ACCESS_STRATEGY` | 仮想メモリ内でディスクデータにアクセスする方法。既定: `mmap` | `string` | `mmap` または `pread` |
| `PERSISTENCE_LSM_MAX_SEGMENT_SIZE` | [LSM ストア](/weaviate/concepts/storage.md#object-and-inverted-index-store) のセグメント最大サイズ。コンパクション時のディスク使用スパイクをセグメント サイズの約 2 倍に抑えたい場合に設定します。既定: 制限なし | `string` | `4GiB`, `4GB`, `4000000000` |
| `PROMETHEUS_MONITORING_ENABLED`  | 設定すると [Prometheus 互換形式のメトリクス](/deploy/configuration/monitoring.md) を収集します。 | `boolean` | `false` |
| `PROMETHEUS_MONITORING_GROUP` | 設定すると、同一クラスのメトリクスをすべてのシャードでグループ化します。 | `boolean` | `true` |
| `QUERY_CROSS_REFERENCE_DEPTH_LIMIT` | クエリで解決されるクロスリファレンスの最大深さ。既定: 5。<br/>`v1.24.25`, `v1.25.18`, `v1.26.5` で追加。 | `string - number` | `3` |
| `QUERY_DEFAULTS_LIMIT` | クエリで返されるオブジェクト数の既定値。 | `string - number` | `25` <br/> v1.24 以降の既定: `10` |
| `QUERY_MAXIMUM_RESULTS` | 取得可能なオブジェクトの総数の上限を設定します。 | `string - number` | `10000` |
| `QUERY_SLOW_LOG_ENABLED` | デバッグ用に遅いクエリをログに記録します。更新には再起動が必要です。<br/>(1.24.16, 1.25.3 で追加) | `boolean` | `False` |
| `QUERY_SLOW_LOG_THRESHOLD` | 遅いクエリとして記録する閾値時間を設定します。更新には再起動が必要です。<br/>(1.24.16, 1.25.3 で追加) | `string` | `2s` <br/> 値例: `3h`, `2s`, `100ms` |
| `REINDEX_SET_TO_ROARINGSET_AT_STARTUP` | 起動時に一度だけ再インデックスを実行し、[Roaring Bitmap](/weaviate/concepts/filtering.md#migration-to-indexFilterable) を使用できるようにします。<br/><br/>`1.18` 以降で利用可能。 | `boolean` | `true` |
| `TOKENIZER_CONCURRENCY_COUNT` | GSE と Kagome の合計同時実行数を制限します。既定: `GOMAXPROCS` | `string - number` | `NUMBER_OF_CPU_CORES` |
| `TOMBSTONE_DELETION_CONCURRENCY` | トゥームストーン削除に使用する最大コア数。クリーンアップで使用するコア数を制限できます。既定: 利用可能コアの半分。（`v1.24.0` で追加） | `string - int` | `4` |
| `TOMBSTONE_DELETION_MAX_PER_CYCLE` | 1 回のクリーンアップ サイクルで削除するトゥームストーンの最大数。リソース集約的なクリーンアップ サイクルを制限するために設定します。例: 3 億オブジェクト シャードのクラスターでは 10000000 (10M) を設定。既定: なし | `string - int` (New in `v1.24.15` / `v1.25.2`) | `10000000` |
| `TOMBSTONE_DELETION_MIN_PER_CYCLE` | 1 回のクリーンアップ サイクルで削除するトゥームストーンの最小数。閾値以下で不要なクリーンアップが走るのを防ぎます。例: 3 億オブジェクト シャードのクラスターでは 1000000 (1M) を設定。既定: 0 (New in `v1.24.15`, `v1.25.2`) | `string - int` | `100000` |
| `USE_GSE` | [`GSE` トークナイザー](/weaviate/config-refs/collections.mdx) を有効にします。<br/>（`ENABLE_TOKENIZER_GSE` と同じ。命名の一貫性のため `ENABLE_TOKENIZER_GSE` の使用を推奨） | `boolean` | `true` |
| `USE_INVERTED_SEARCHABLE` | BlockMax WAND アルゴリズム向けに設計された、より効率的なオンディスク形式で検索可能プロパティを保存します。`USE_BLOCKMAX_WAND` とともに `true` にすると、クエリ時に BlockMax WAND が有効になります。<br/><br/>`v1.28` 追加時の既定: `false` <br/> `v1.30` から既定: `true` <br/><Link to="/weaviate/concepts/indexing/inverted-index#blockmax-wand-algorithm">詳細</Link> | `boolean` | `true` |
| `USE_BLOCKMAX_WAND` | BM25 とハイブリッド検索で BlockMax WAND アルゴリズムを使用します。`USE_INVERTED_SEARCHABLE` とともに有効にすることで性能向上が得られます。<br/><br/>`v1.28` 追加時の既定: `false` <br/> `v1.30` から既定: `true` <br/><Link to="/weaviate/concepts/indexing/inverted-index#blockmax-wand-algorithm">詳細</Link> | `boolean` | `true` |

```mdx-code-block
</APITable>
```

## モジュール固有

```mdx-code-block
<APITable>
```

| Variable | Description | Type | Example Value |
| --- | --- | --- | --- |
| `BACKUP_*` | バックアップ プロバイダー モジュール用の各種設定変数。詳細は [バックアップ](/deploy/configuration/backups.md) ページを参照してください。 | |
| `AZURE_BLOCK_SIZE` | バックアップ用 Azure Blob Storage のブロック サイズ。既定: `41943040` (40 MB) | `int - bytes` | `10000000` |
| `AZURE_CONCURRENCY` | バックアップ操作中に同時にアップロード/ダウンロードされるパート数の上限。既定: `1` | `int` | `3` |
| `CLIP_INFERENCE_API` | `clip` モジュールが有効な場合のエンドポイント | `string` | `http://multi2vec-clip:8000` |
| `CONTEXTIONARY_URL` | contextionary コンテナへのサービス ディスカバリー URL | `string - URL` | `http://contextionary` |
| `IMAGE_INFERENCE_API` | `img2vec-neural` モジュールが有効な場合のエンドポイント | `string` | `http://localhost:8000` |
| `LOWERCASE_VECTORIZATION_INPUT` | `true` の場合、ベクトル化前にすべての入力テキストを小文字化します。<br/>`v1.27` で追加（既定: `false`）<br/>`text2vec-contextionary` では `true` を推奨 | `boolean` | `true` |
| `OFFLOAD_S3_BUCKET` | オフロードに使用する S3 バケット（既定: `weaviate-offload`） | `string` | `my-custom-offload-bucket` |
| `OFFLOAD_S3_BUCKET_AUTO_CREATE` | オフロード用 S3 バケットが存在しない場合、自動で作成するかどうか（既定: `false`） | `boolean` | `true` |
| `OFFLOAD_S3_CONCURRENCY` | オフロード操作中に並列アップロード/ダウンロードされるパート数の上限（既定: `25`） | `string - number` | `10` |
| `OFFLOAD_TIMEOUT` | リクエスト タイムアウト値（秒）（既定: `120`） | `string - number` | `60` |
| `TRANSFORMERS_INFERENCE_API` | `transformers` モジュールが有効な場合のエンドポイント | `string` | `http://text2vec-transformers:8080` |
| `USE_GOOGLE_AUTH` | Google Cloud 資格情報を自動検出し、必要に応じて Vertex AI アクセス トークンを生成します（[詳細](/weaviate/model-providers/google/index.md)）。既定: `false` | `boolean` | `true` |
| `USE_SENTENCE_TRANSFORMERS_VECTORIZER` | (実験的) 既定のベクトライザーの代わりに `sentence-transformer` ベクトライザーを使用します（カスタム イメージのみ適用）。 | `boolean` | `true` |
| `CLIP_WAIT_FOR_STARTUP` | `true` の場合、`multi2vec-clip` モジュールの起動を待ってから Weaviate を起動します（既定: `true`）。 | `boolean` | `true` |
| `NER_WAIT_FOR_STARTUP` | `true` の場合、`ner-transformers` モジュールの起動を待ってから Weaviate を起動します（既定: `true`）。(`v1.25.27`, `v1.26.12`, `v1.27.7` で利用可能) | `boolean` | `true` |
| `QNA_WAIT_FOR_STARTUP` | `true` の場合、`qna-transformers` モジュールの起動を待ってから Weaviate を起動します（既定: `true`）。(`v1.25.27`, `v1.26.12`, `v1.27.7` で利用可能) | `boolean` | `true` |
| `RERANKER_WAIT_FOR_STARTUP` | `true` の場合、`reranker-transformers` モジュールの起動を待ってから Weaviate を起動します（既定: `true`）。(`v1.25.27`, `v1.26.12`, `v1.27.7` で利用可能) | `boolean` | `true` |
| `SUM_WAIT_FOR_STARTUP` | `true` の場合、`sum-transformers` モジュールの起動を待ってから Weaviate を起動します（既定: `true`）。(`v1.25.27`, `v1.26.12`, `v1.27.7` で利用可能) | `boolean` | `true` |
| `GPT4ALL_WAIT_FOR_STARTUP` | `true` の場合、`text2vec-gpt4all` モジュールの起動を待ってから Weaviate を起動します（既定: `true`）。(`v1.25.27`, `v1.26.12`, `v1.27.7` で利用可能) | `boolean` | `true` |
| `TRANSFORMERS_WAIT_FOR_STARTUP` | `true` の場合、`text2vec-transformers` モジュールの起動を待ってから Weaviate を起動します（既定: `true`）。(`v1.25.27`, `v1.26.12`, `v1.27.7` で利用可能) | `boolean` | `true` |
| `USAGE_GCS_BUCKET` | GCS バケット名（GCS 使用時は必須） | `string` | `my-weaviate-usage-bucket` |
| `USAGE_GCS_PREFIX` | GCS レポート用のオプションのオブジェクト プレフィックス | `string` | `usage-reports` |
| `USAGE_S3_BUCKET` | S3 バケット名（S3 使用時は必須） | `string` | `my-weaviate-usage-bucket` |
| `USAGE_S3_PREFIX` | S3 レポート用のオプションのオブジェクト プレフィックス | `string` | `usage-reports` |
| `RUNTIME_OVERRIDES_ENABLED` | ランタイム オーバーライド構成を有効にします。 | `boolean` | `true` |
| `RUNTIME_OVERRIDES_PATH` | ランタイム オーバーライド構成ファイルのパス | `string` | `${PWD}/tools/dev/config.runtime-overrides.yaml` |
| `RUNTIME_OVERRIDES_LOAD_INTERVAL` | ランタイム オーバーライド構成のリロード間隔 | `duration` | `30s` |
| `USAGE_SCRAPE_INTERVAL` | 使用状況メトリクスを収集する間隔 | `duration` | `2h` |
| `USAGE_SHARD_JITTER_INTERVAL` | シャード ループのジッタ。多数のシャードがある場合にファイルシステムへの負荷を平準化するために使用します。 | `duration` | `100ms` |
| `USAGE_POLICY_VERSION` | オプションのポリシー バージョン | `string` | `2025-06-01` |
| `USAGE_VERIFY_PERMISSIONS` | 起動時にバケットの権限を検証します（オプトイン）。 | `boolean` | `false` |


```mdx-code-block
</APITable>
```

## 認証と認可

:::info Authentication & Authorization documentation
認証および認可の詳細については、[Authentication](/deploy/configuration/authentication.md) ページと [Authorization](/deploy/configuration/authorization.md) ページを参照してください。
:::

```mdx-code-block
<APITable>
```

| Variable | Description | Type | Example Value |
| --- | --- | --- | --- |
| `AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED` | 認証なしで Weaviate と対話できるようにします | `boolean` | `true` <br/> v1.24 以降ではデフォルトは `true` です |
| `AUTHENTICATION_APIKEY_ALLOWED_KEYS` | 許可される API キー。<br/><br/> 各キーは下記の特定ユーザー ID に対応します。 | `string - comma-separated list` | `jane-secret-key,ian-secret-key` |
| `AUTHENTICATION_APIKEY_ENABLED` | API キーを用いた認証を有効にします | `boolean` | `false` |
| `AUTHENTICATION_APIKEY_USERS` | API キーに基づくユーザー ID。<br/><br/> 各 ID は上記の特定キーに対応します。 | `string - comma-separated list` | `jane@doe.com,ian-smith` |
| `AUTHENTICATION_DB_USERS_ENABLED` | 実行時の [ユーザー管理](/weaviate/configuration/rbac/manage-users.mdx) を許可します。デフォルト: `false` | `boolean` | `true` |
| `AUTHENTICATION_OIDC_CLIENT_ID` | OIDC クライアント ID | `string` | `my-client-id` |
| `AUTHENTICATION_OIDC_ENABLED` | OIDC ベースの認証を有効にします | `boolean` | `false` |
| `AUTHENTICATION_OIDC_GROUPS_CLAIM` | OIDC Groups Claim | `string` | `groups` |
| `AUTHENTICATION_OIDC_ISSUER` | OIDC トークン発行者 | `string - URL` | `https://myissuer.com` |
| `AUTHENTICATION_OIDC_USERNAME_CLAIM` | OIDC Username Claim | `string` | `email` |
| `AUTHORIZATION_ADMINLIST_ENABLED` | AdminList 認可方式を有効にします（`AUTHORIZATION_RBAC_ENABLED` との併用不可） | `boolean` | `true` |
| `AUTHORIZATION_ADMINLIST_USERS` | AdminList 方式使用時に管理者権限を持つユーザー | `string - comma-separated list` | `jane@example.com,john@example.com` |
| `AUTHORIZATION_ADMINLIST_READONLY_USERS` | AdminList 方式使用時に読み取り専用権限を持つユーザー | `string - comma-separated list` | `alice@example.com,dave@example.com` |

```mdx-code-block
</APITable>
```

### RBAC 認可

```mdx-code-block
<APITable>
```

| Variable | Description | Type | Example Value |
| --- | --- | --- | --- |
| `AUTHORIZATION_RBAC_ENABLED` | RBAC 認可方式を有効にします（`AUTHORIZATION_ADMINLIST_ENABLED` との併用不可）。 | `boolean` | `true` |
| `AUTHORIZATION_RBAC_ROOT_USERS` | RBAC 方式使用時に組み込みの root／管理者ロールを持つユーザー。RBAC では少なくとも 1 つの root ユーザーを定義する必要があります。 | `string - comma-separated list` | `admin-user,another-admin-user` |

```mdx-code-block
</APITable>
```

## マルチノードインスタンス

```mdx-code-block
<APITable>
```

| Variable | Description | Type | Example Value |
| --- | --- | --- | --- |
| `CLUSTER_DATA_BIND_PORT` | データ交換に使用するポートです。 | `string - number` | `7103` |
| `CLUSTER_GOSSIP_BIND_PORT` | ネットワーク状態情報を交換するポートです。 | `string - number` | `7102` |
| `CLUSTER_HOSTNAME` | ノードのホスト名です。デフォルトの OS ホスト名が変わる可能性がある場合は、必ずこの値を設定してください。 | `string` | `node1` |
| `CLUSTER_JOIN` | クラスタ構成時の「創設」メンバーノードのサービス名です。 | `string` | `weaviate-node-1:7100` |
| `HNSW_STARTUP_WAIT_FOR_VECTOR_CACHE` | `true` の場合、ノード起動時にベクトルキャッシュのプリフィルが同期的に行われます。キャッシュがウォームアップした時点でノードはレディ状態を報告します。デフォルトは `false` です。 1.24.20 および 1.25.5 で追加されました。 | `boolean` | `false` |
| `COLLECTION_RETRIEVAL_STRATEGY`| データリクエスト時のコレクション定義取得方法を設定します。<br/><br/> <ul><li>`LeaderOnly` (デフォルト): 常にリーダーノードから定義を取得</li><li>`LocalOnly`: 常にローカル定義を使用</li><li>`LeaderOnMismatch`: 定義が古い場合に取得</li></ul> ([詳細はこちら](/weaviate/concepts/replication-architecture/consistency.md#collection-definition-requests-in-queries))（v1.27.10、v1.28.4 で追加） | `string` | `LeaderOnly` |
| `RAFT_BOOTSTRAP_EXPECT` | ブートストラップ時の投票者ノード数です。 | `string - number` | `1` |
| `RAFT_BOOTSTRAP_TIMEOUT` | クラスタがブートストラップするまで待機する秒数です。 | `string - number` | `90` |
| `RAFT_ENABLE_FQDN_RESOLVER` | `true` の場合、Raft で memberlist 参照の代わりに DNS ルックアップを使用します。v1.25.15 で追加され、v1.30 で削除されました。([詳細はこちら](/weaviate/concepts/cluster.md#node-discovery)) | `boolean` | `true` |
| `RAFT_ENABLE_ONE_NODE_RECOVERY` | 再起動時に単一ノードリカバリルーチンを実行します。デフォルトのホスト名が変わり、単一ノードクラスタが 2 ノード存在すると誤認する場合に有用です。 | `boolean` | `false` |
| `RAFT_FQDN_RESOLVER_TLD` | DNS ルックアップに使用するトップレベルドメイン。形式は `[node-id].[tld]`。v1.25.15 で追加され、v1.30 で削除されました。([詳細はこちら](/weaviate/concepts/cluster.md#node-discovery)) | `string` | `example.com` |
| `RAFT_GRPC_MESSAGE_MAX_SIZE` | 内部 Raft gRPC メッセージの最大サイズ（バイト単位）です。デフォルトは 1073741824 です。 | `string - number` | `1073741824` |
| `RAFT_JOIN` | Raft の投票者ノードを手動で設定します。設定する場合、`RAFT_BOOTSTRAP_EXPECT` を投票者数に合わせて手動調整する必要があります。 | `string` | `weaviate-0,weaviate-1` |
| `RAFT_METADATA_ONLY_VOTERS` | `true` の場合、投票者ノードはスキーマのみを処理し、データを受け付けません。 | `boolean` | `false` |
| `REPLICATION_ENGINE_MAX_WORKERS` | レプリカ移動を並列処理するワーカー数です。デフォルト: `10` <br/>v1.32 で追加 | `string - number` | `5` |
| `REPLICATION_MINIMUM_FACTOR` | クラスタ内のすべてのコレクションに適用される最小レプリケーションファクターです。 | `string - number` | `3` |
| `REPLICA_MOVEMENT_MINIMUM_ASYNC_WAIT` | ファイルコピー後、移動を確定する前に進行中の書き込みが完了するまで待機する時間です。デフォルト: `60` 秒 <br/>v1.32 で追加 | `string - number` | `90` |

```mdx-code-block
</APITable>
```

### 非同期レプリケーション

:::info Added in `v1.29`
非同期レプリケーションを構成する環境変数は v1.29 で追加されました。  
使用方法の詳細は **[replication how-to guide](/deploy/configuration/replication#async-replication-settings)** を参照してください。
:::

```mdx-code-block
<APITable>
```

| Variable | Description | Type | Example Value |
| --- | --- | --- | --- |
| `ASYNC_REPLICATION_DISABLED` | 非同期レプリケーションを無効にします。デフォルト: `false` | `boolean` | `false` |
| `ASYNC_REPLICATION_HASHTREE_HEIGHT` | ノード間のデータ比較に使用するハッシュツリーの高さです。高さが `0` の場合、各ノードはシャードごとに 1 つのダイジェストのみを保持します。デフォルト: `16`、最小: `0`、最大: `20`<br/> [メモリ使用量増加の可能性についてはこちら](/weaviate/concepts/replication-architecture/consistency#memory-and-performance-considerations-for-async-replication) | `string - number` | `10` |
| `ASYNC_REPLICATION_FREQUENCY` | ノード間で定期的にデータ比較を行う間隔（秒）。デフォルト: `30` | `string - number` | `60` |
| `ASYNC_REPLICATION_FREQUENCY_WHILE_PROPAGATING` | ノードが同期された後にデータ比較を行う間隔（ミリ秒）。デフォルト: `10` | `string - number` | `20` |
| `ASYNC_REPLICATION_ALIVE_NODES_CHECKING_FREQUENCY` | バックグラウンドプロセスがノードの可用性変化をチェックする間隔（秒）。デフォルト: `5` | `string - number` | `20` |
| `ASYNC_REPLICATION_LOGGING_FREQUENCY` | バックグラウンドプロセスがイベントをログ出力する間隔（秒）。デフォルト: `5` | `string - number` | `7` |
| `ASYNC_REPLICATION_DIFF_BATCH_SIZE` | ノード間でダイジェスト情報を比較する際のバッチサイズです。デフォルト: `1000`、最小: `1`、最大: `10000` | `string - number` | `2000` |
| `ASYNC_REPLICATION_DIFF_PER_NODE_TIMEOUT` | ノードが比較応答を返すまでのタイムアウト（秒）。デフォルト: `10` | `string - number` | `30` |
| `ASYNC_REPLICATION_PROPAGATION_TIMEOUT` | ノードが伝播応答を返すまでのタイムアウト（秒）。デフォルト: `30` | `string - number` | `60` |
| `ASYNC_REPLICATION_PROPAGATION_LIMIT` | 1 回の非同期レプリケーションで伝播できる未同期オブジェクトの上限です。デフォルト: `10000`、最小: `1`、最大: `1000000` | `string - number` | `5000` |
| `ASYNC_REPLICATION_PROPAGATION_DELAY` | 新規または更新済みオブジェクトを伝播する前に、非同期書き込みがシャード／テナントの全ノードに到達するまで待機する遅延時間です。デフォルト: `30` | `string - number` | `40` |
| `ASYNC_REPLICATION_PROPAGATION_CONCURRENCY` | オブジェクトをバッチ伝播するワーカー数です。デフォルト: `5`、最小: `1`、最大: `20` | `string - number` | `10` |
| `ASYNC_REPLICATION_PROPAGATION_BATCH_SIZE` | 1 バッチで伝播するオブジェクトの最大数です。デフォルト: `100`、最小: `1`、最大: `1000` | `string - number` | `200` |

```mdx-code-block
</APITable>
```
<!-- Docs notes:
Undocumented environment variables - for internal use only:
MAINTENANCE_NODES
ASYNC_BRUTE_FORCE_SEARCH_LIMIT
RAFT_FORCE_ONE_NODE_RECOVERY
-->

## ご質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

