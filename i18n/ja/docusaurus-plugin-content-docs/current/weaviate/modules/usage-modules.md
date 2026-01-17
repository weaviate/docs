---
title: Usage モジュール
description: 使用状況モジュールを追加して、Google Cloud Storage (GCS) または AWS S3 に使用状況分析データを収集・アップロードします。 
---

:::info ` v1.32 ` で追加
Usage モジュールは使用状況分析データを収集し、Google Cloud Storage (GCS) または AWS S3 にアップロードします。このモジュールは **課金** を目的とした分析およびモニタリングのために Weaviate インスタンスの使用状況を追跡します。
:::

:::danger
このモジュールは開発中のため、破壊的変更が発生する場合があります。 
:::

### 機能

- 定期的に使用状況データを収集。
- JSON レポートを S3 または GCS にアップロード。
- 実行時の設定上書きをサポート。 
- メトリクスとログを含む。 
- アップロード前にストレージ権限を検証。

## 設定

### Backup と Usage を含む設定例

```yaml

# environment variables
ENABLE_MODULES="backup-gcs,usage-gcs" 
BACKUP_GCS_BUCKET=weaviate-backups 
USAGE_GCS_BUCKET=weaviate-usage 
USAGE_GCS_PREFIX=billing-usage 
TRACK_VECTOR_DIMENSIONS=true  # won't be needed from 1.32.1
RUNTIME_OVERRIDES_ENABLED=true 
RUNTIME_OVERRIDES_PATH="${PWD}/tools/dev/config.runtime-overrides.yaml"
RUNTIME_OVERRIDES_LOAD_INTERVAL=30s

# in tools/dev/config.runtime-overrides.yaml
usage_scrape_interval: 1h
usage_shard_jitter_interval: 100ms  #(optional)
usage_gcs_bucket: weaviate-usage
usage_gcs_prefix: billing

```

### 環境変数

:::tip
Usage モジュールを有効にしない限り、いかなる設定も効果を持ちません。  
このモジュールはバックアップ機能とは直接関係ありませんが、バックアップが有効でない場合はバックアップのメトリクスは収集されません。 
:::

```bash
# Enable the usage modules (required)

ENABLE_MODULES=usage-gcs # if you want gcs
ENABLE_MODULES=usage-s3 # if you want s3
ENABLE_MODULES=usage-s3,usage-gcs # or both

```

#### 実行時オーバーライド

:::tip
`TRACK_VECTOR_DIMENSIONS=true` は Usage レポートでベクトル次元のメトリクスを収集するために必要です。 ` v1.32.1 ` からは不要になります。 
:::

```shell
RUNTIME_OVERRIDES_ENABLED=true
RUNTIME_OVERRIDES_PATH="${PWD}/tools/dev/config.runtime-overrides.yaml"
RUNTIME_OVERRIDES_LOAD_INTERVAL=30s

# Required: Enable vector dimension tracking metrics

TRACK_VECTOR_DIMENSIONS=true # won't be needed from 1.32.1

# Collection interval (default: 1h)
USAGE_SCRAPE_INTERVAL=2h

# (optional) Shard loop jitter (default: 100ms)
USAGE_SHARD_JITTER_INTERVAL=50ms

# (optional) Policy version (default: 2025-06-01)
USAGE_POLICY_VERSION=2025-06-01

# (optional) verify the bucket permission on start (default:false)
USAGE_VERIFY_PERMISSIONS=true
```

:::info
実行時オーバーライドを有効にすると、Usage モジュールの設定を更新しても Weaviate を再起動する必要がありません。
:::

#### `runtime-overrides.yaml` の例

```yaml
usage_scrape_interval: 1s
usage_shard_jitter_interval: 100ms # (optional)
usage_verify_permissions: true/false # (optional)

# usage-gcs config
usage_gcs_bucket: weaviate-usage
usage_gcs_prefix: billing

# usage-s3 config
usage_s3_bucket: weaviate-usage
usage_s3_prefix: billing
```

#### AWS S3 変数

```bash
# Required: S3 bucket name
USAGE_S3_BUCKET=my-weaviate-usage-bucket

# Optional: Object prefix (default: empty)
USAGE_S3_PREFIX=usage-reports

```

#### GCP GCS 変数 

```bash
# Required: GCS bucket name
USAGE_GCS_BUCKET=my-weaviate-usage-bucket

# Optional: Object prefix (default: empty)
USAGE_GCS_PREFIX=usage-reports
```

### 監視

モジュールは Prometheus メトリクスを提供します:

- `weaviate_usage_{gcs|s3}_operations_total`: モジュールの総操作回数。ラベル (`operation`: collect/upload, `status`: success, error)。
- `weaviate_usage_{gcs|s3}_operation_latency_seconds`: 使用状況操作のレイテンシ (秒)。ラベル (`operation`: collect/upload)。
- `weaviate_usage_{gcs|s3}_resource_count`: モジュールが追跡するリソース数。ラベル (`resource_type`: collections/shards/backups)。
- `weaviate_usage_{gcs|s3}_uploaded_file_size_bytes`: アップロードされた使用状況ファイルのサイズ (バイト)。

### デバッグログ

デバッグを有効にするとモジュールの詳細な動作を確認できます。 

```bash
LOG_LEVEL=debug
```

### テスト
Minio を使用する場合は、環境変数 `AWS_ENDPOINT`, `AWS_REGION` を設定してください。

#### ローカル
```bash
AWS_REGION=us-east-1
AWS_ENDPOINT=http://localhost:9000
```

#### クラウド

```
AWS_REGION=us-east-1
AWS_ENDPOINT=minio.weaviate.svc.cluster.local:9000 
```

## 参考リソース

- [監視](/docs/deploy/configuration/monitoring.md)
- [環境変数](/docs/deploy/configuration/env-vars/index.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

