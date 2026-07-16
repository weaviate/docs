---
title: Collection export
description: Export Weaviate collections to cloud or local storage in Parquet format.
image: og/docs/configuration.jpg
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/configure.export.py';
import CsCode from '!!raw-loader!/\_includes/code/csharp/ManageDataExportTest.cs';

:::caution Preview — added in `v1.37`
This is a preview feature. The API may change in future releases.
:::

Export collections from Weaviate to cloud storage in [Apache Parquet](https://parquet.apache.org/) format. Exports are point-in-time snapshots, writes that occur during an export do not affect the exported data. Only one export at a time per node is possible.

The export feature is **disabled by default**. To use it:

1. [Enable the export API](#environment-variables) and configure a storage bucket.
2. [Configure cloud storage credentials](#backend-configuration) for your backend (S3, GCS, or Azure).
3. [Create an export](#create-a-collection-export) via the client or REST API.

## Environment variables

Set these [environment variables](/docs/deploy/configuration/env-vars/index.md) to enable and configure exports:

| Environment Variable    | Default          | Description                                                                       |
| :---------------------- | :--------------- | :-------------------------------------------------------------------------------- |
| `EXPORT_ENABLED`        | `false`          | Enable the export API.                                                            |
| `EXPORT_DEFAULT_BUCKET` | (empty)          | Storage bucket name. Required for S3, GCS, and Azure backends.                    |
| `EXPORT_DEFAULT_PATH`   | `""`             | Optional base path prefix for exported files within the bucket. Defaults to an empty string (no prefix). _Changed in `v1.37.1`: previously required to be explicitly set._ |
| `EXPORT_PARALLELISM`    | `0` (GOMAXPROCS) | Number of concurrent scan workers.                                                |
| `EXPORT_SKIP_ACCESS_CHECK` | `false`       | Skip the write-and-delete access check that runs when the export backend initializes. Set to `true` for immutable (write-once / WORM) buckets or least-privilege credentials that cannot delete objects. _Added in `v1.37.8`._ |

`EXPORT_ENABLED`, `EXPORT_DEFAULT_BUCKET`, `EXPORT_DEFAULT_PATH`, and `EXPORT_PARALLELISM` are [runtime-configurable](/docs/deploy/configuration/env-vars/runtime-config.md) and can be changed without restarting Weaviate. `EXPORT_SKIP_ACCESS_CHECK` is applied at startup and requires a restart to change.

:::note Weaviate Cloud

The collection export feature is not available in Weaviate Cloud.

:::

## Backend configuration

Exports support three cloud storage backends and the [local filesystem](./backups.md#filesystem). Each cloud storage backend uses the same credential environment variables as [backups](./backups.md#configuration):

| Backend                                                       | Value   | Credential env vars                                                               |
| :------------------------------------------------------------ | :------ | :-------------------------------------------------------------------------------- |
| [Amazon S3](./backups.md#s3-aws-or-s3-compatible)             | `s3`    | `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`                        |
| [Google Cloud Storage](./backups.md#gcs-google-cloud-storage) | `gcs`   | `GOOGLE_APPLICATION_CREDENTIALS`                                                  |
| [Azure Blob Storage](./backups.md#azure-storage)              | `azure` | `AZURE_STORAGE_ACCOUNT`, `AZURE_STORAGE_KEY` or `AZURE_STORAGE_CONNECTION_STRING` |

:::warning Use a separate bucket for exports

Do not export to backup buckets. Backup buckets may have immutability policies that cause export operations to fail. Use a dedicated bucket for exports.

:::

## Create a collection export

Specify an export ID, backend, file format, and optionally which collections to include or exclude. If neither `include` nor `exclude` is specified, all collections are exported.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START CreateExport"
      endMarker="# END CreateExport"
      language="py"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CsCode}
      startMarker="// START CreateExport"
      endMarker="// END CreateExport"
      language="csharp"
    />
  </TabItem>
  <TabItem value="curl" label="cURL">

```bash
curl -X POST http://localhost:8080/v1/export/filesystem \
  -H "Content-Type: application/json" \
  -d '{
    "id": "my-export-2024",
    "file_format": "parquet",
    "include": ["Articles", "Products"]
  }'
```

  </TabItem>
</Tabs>

### Request parameters

| Field         | Required | Description                                                                 |
| :------------ | :------- | :-------------------------------------------------------------------------- |
| `id`          | Yes      | Unique export ID. Must match `^[a-z0-9_-]+$`, max 128 characters.           |
| `file_format` | Yes      | Output format. Currently only `parquet` is supported.                       |
| `include`     | No       | Collections to export. Cannot be used together with `exclude`.              |
| `exclude`     | No       | Collections to exclude from export. Cannot be used together with `include`. |

## Check collection export status

Exports run asynchronously. Poll the status endpoint to track progress.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START GetExportStatus"
      endMarker="# END GetExportStatus"
      language="py"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CsCode}
      startMarker="// START GetExportStatus"
      endMarker="// END GetExportStatus"
      language="csharp"
    />
  </TabItem>
  <TabItem value="curl" label="cURL">

```bash
curl http://localhost:8080/v1/export/filesystem/my-async-export
```

  </TabItem>
</Tabs>

### Export states

| State          | Description                                    |
| :------------- | :--------------------------------------------- |
| `STARTED`      | Export has been created and is initializing.   |
| `TRANSFERRING` | Data is being written to cloud storage.        |
| `SUCCESS`      | Export completed successfully.                 |
| `FAILED`       | Export failed. Check shard status for details. |
| `CANCELED`     | Export was canceled by the user.               |

### Shard states

Each shard within an export has its own status:

| State          | Description                                 |
| :------------- | :------------------------------------------ |
| `TRANSFERRING` | Shard data is being written.                |
| `SUCCESS`      | Shard export completed.                     |
| `FAILED`       | Shard export failed.                        |
| `SKIPPED`      | Shard was skipped (e.g., offloaded tenant). |

## Cancel a collection export

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START CancelExport"
      endMarker="# END CancelExport"
      language="py"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CsCode}
      startMarker="// START CancelExport"
      endMarker="// END CancelExport"
      language="csharp"
    />
  </TabItem>
  <TabItem value="curl" label="cURL">

```bash
curl -X DELETE http://localhost:8080/v1/export/filesystem/my-async-export
```

  </TabItem>
</Tabs>

## Output format

Exports produce [Apache Parquet](https://parquet.apache.org/) files with Zstd compression. Each file contains:

| Column          | Type   | Description                            |
| :-------------- | :----- | :------------------------------------- |
| `id`            | string | Object UUID                            |
| `creation_time` | int64  | Creation timestamp (nanoseconds)       |
| `update_time`   | int64  | Last update timestamp (nanoseconds)    |
| `vector`        | bytes  | Primary vector (little-endian float32) |
| `named_vectors` | bytes  | JSON-encoded named vectors             |
| `multi_vectors` | bytes  | JSON-encoded multi-vectors             |
| `properties`    | bytes  | Raw JSON of object properties          |

Files are named `{collection}_{shard}_{rangeIndex}.parquet`. Collection and tenant names are stored as Parquet file-level metadata.

## Multi-tenancy

| Tenant state | Behavior                                                                |
| :----------- | :---------------------------------------------------------------------- |
| HOT          | Exported from live data.                                                |
| COLD         | Exported directly from disk without loading into memory (remains COLD). |
| OFFLOADED    | Skipped. The skip reason is recorded in the shard status.               |

The tenant list is snapshotted when the export is created — tenants created during the export are not included.

## Permissions

Export uses the backups permission `manage_backups` for [RBAC authorization](/weaviate/configuration/rbac/index.mdx).

## Further resources

- [REST API endpoint](/weaviate/api/rest)

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
