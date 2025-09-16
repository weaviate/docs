---
title: テナントオフロード
sidebar_position: 5
image: og/docs/configuration.jpg
---

:::info `v1.26` で追加
:::

テナントはコールドストレージへオフロードしてメモリとディスク使用量を削減でき、必要に応じてオンロードし直すことができます。

このページでは、Weaviate でテナントオフロードを設定する方法を説明します。テナントのオフロードおよびオンロード手順については、[How-to: テナント状態の管理](/weaviate/manage-collections/tenant-states.mdx) を参照してください。

## テナントオフロードモジュール

import OffloadingLimitation from '/_includes/offloading-limitation.mdx';

<OffloadingLimitation/>

Weaviate でテナントオフロードを利用するには、該当するオフロード [module](/weaviate/configuration/modules.md) を有効化する必要があります。

## `offload-s3` モジュール

`offload-s3` モジュールを使用すると、S3 バケットへテナントを[オフロードまたはオンロード](/weaviate/manage-collections/tenant-states.mdx)できます。

`offload-s3` モジュールを利用するには、以下のように docker-compose ファイルの `ENABLE_MODULES` に `offload-s3` を追加してください。

```yaml
services:
  weaviate:
    environment:
      # highlight-start
      ENABLE_MODULES: 'offload-s3' # plus other modules you may need
      OFFLOAD_S3_BUCKET: 'weaviate-offload' # the name of the S3 bucket
      OFFLOAD_S3_BUCKET_AUTO_CREATE: 'true' # create the bucket if it does not exist
      # highlight-end
```

対象の S3 バケットが存在しない場合、Weaviate が自動でバケットを作成できるように `OFFLOAD_S3_BUCKET_AUTO_CREATE` を `true` に設定する必要があります。

kubernetes を利用している場合は、helm chart の values ファイルで該当するオフロードサービスを有効化し、必要な環境変数を設定してください。

```yaml
# Configure offload providers
offload:
  s3:
    enabled: true  # Set this value to true to enable the offload-s3 module
    envconfig:
      OFFLOAD_S3_BUCKET: weaviate-offload  # the name of the S3 bucket
      OFFLOAD_S3_BUCKET_AUTO_CREATE: true  # create the bucket if it does not exist
```

### 環境変数

`offload-s3` モジュールは次の環境変数を読み取ります。

| Env Var | 説明 | 既定値 |
|---|---|---|
| `OFFLOAD_S3_BUCKET` | テナントをオフロードする先の S3 バケット名。 | `weaviate-offload` |
| `OFFLOAD_S3_BUCKET_AUTO_CREATE` | `true` の場合、バケットが存在しなければ Weaviate が自動作成します。 | `false` |
| `OFFLOAD_S3_CONCURRENCY` | 同時に実行するオフロード操作数。 | `25` |
| `OFFLOAD_TIMEOUT` | オフロード操作（バケット作成、アップロード、ダウンロード）のタイムアウト。 | `120`（秒） |

:::info Timeout

- オフロード操作は非同期で実行されます。そのため、このタイムアウトは操作完了ではなく開始までの制限時間です。
- 各操作はタイムアウト時に最大 10 回までリトライします。ただし認証／認可エラーの場合は除きます。

:::

### AWS パーミッション

:::tip Requirements
Weaviate インスタンスには [S3 バケットへのアクセス権限](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html) が必要です。
- 指定された AWS アイデンティティはバケットへ書き込める必要があります。
- `OFFLOAD_S3_BUCKET_AUTO_CREATE` が `true` の場合、バケット作成権限も必要です。
:::

Weaviate に AWS 認証情報を提供する必要があります。アクセスキー方式と ARN 方式のいずれかを選択できます。

#### Option 1: IAM および ARN ロールを使用

バックアップモジュールはまず AWS IAM を用いた認証を試みます。失敗した場合は `Option 2` の認証を試みます。

#### Option 2: アクセスキーとシークレットアクセスキーを使用

| Environment variable | 説明 |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | 対象アカウントの AWS アクセスキー ID。 |
| `AWS_SECRET_ACCESS_KEY` | 対象アカウントの AWS シークレットアクセスキー。 |
| `AWS_REGION` | （任意）AWS リージョン。指定しない場合、モジュールは `AWS_DEFAULT_REGION` の解析を試みます。 |

## 関連ページ
- [Configure: Modules](/weaviate/configuration/modules.md)
- [How-to: テナント状態の管理](/weaviate/manage-collections/tenant-states.mdx)
- [Guide: テナント状態の管理](/weaviate/starter-guides/managing-resources/tenant-states.mdx)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>


