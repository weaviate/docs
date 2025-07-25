---
title: Usage Module
description: Add the usage module to collect and upload usage analytics data to Google Cloud Storage (GCS) or AWS S3. 
---

:::info Added in `v1.32`
The usage module collects and uploads usage anaytics data to Google Cloud Storage (GCS) or AWS S3. The modules help to track Weaviate instance usage for analytics and monitoring for the purposes of **billing**.
:::

:::danger
This module is in development and breaking changes can and will happen. 
:::

### What it does:

- Periodically collecting usage data.
- Uploading JSON reports to  either S3 or GCS.
- Supports runtime configuration overrides. 
- Includes metrics and logging. 
- Verifies storage permissions before uploading.

## Configuration

### Example configuration with backup and usage

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

### Environment variables

:::tip
The usage module must be enabled for any configuration to take effect. 
While this module is not related to backups, if backups are not enabled it won't collect metrics for backups. 
:::

```bash
# Enable the usage modules (required)

ENABLE_MODULES=usage-gcs # if you want gcs
ENABLE_MODULES=usage-s3 # if you want s3
ENABLE_MODULES=usage-s3,usage-gcs # or both

```

#### Runtime overrides

:::tip
`TRACK_VECTOR_DIMENSIONS=true` is required to collect vector dimension metrics in your usage reports, from `v1.32.1` this will no longer be required. 
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
Enable runtime overrides to avoid needing to restart Weaviate when updating usage module configurations.
:::

#### Example `runtime-overrides.yaml`

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

#### AWS S3 variables

```bash
# Required: S3 bucket name
USAGE_S3_BUCKET=my-weaviate-usage-bucket

# Optional: Object prefix (default: empty)
USAGE_S3_PREFIX=usage-reports

```

#### GCP GCS variables 

```bash
# Required: GCS bucket name
USAGE_GCS_BUCKET=my-weaviate-usage-bucket

# Optional: Object prefix (default: empty)
USAGE_GCS_PREFIX=usage-reports
```

### Monitoring

The modules provide Prometheus metrics:

- `weaviate_usage_{gcs|s3}_operations_total`: Total number of operations for module labels (`operation`:collect/upload,  status: success, error).
- `weaviate_usage_{gcs|s3}_operation_latency_seconds`: Latency of usage operations in seconds labels (`operation` :collect/upload).
- `weaviate_usage_{gcs|s3}_resource_count`: Number of resources tracked by module, labels (`resource_type` :collections/shards/backups).
- `weaviate_usage_{gcs|s3}_uploaded_file_size_bytes`: Size of the uploaded usage file in bytes.

### Debug logs

See detailed module activity by enabling debugging. 

```bash
LOG_LEVEL=debug
```

### Testing
If using Minio, set the environment variable `AWS_ENDPOINT`, `AWS_REGION`

#### Local
```bash
AWS_REGION=us-east-1
AWS_ENDPOINT=http://localhost:9000
```

#### Cloud

```
AWS_REGION=us-east-1
AWS_ENDPOINT=minio.weaviate.svc.cluster.local:9000 
```

## Further resources

- [Monitoring](/docs/deploy/configuration/monitoring.md)
- [Environment variables](/docs/deploy/configuration/env-vars/index.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
