---
title: バックアップ
image: og/docs/configuration.jpg
# tags: ['configuration', 'backups']
---

import SkipLink from '/src/components/SkipValidationLink'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/configure.backups.py';
import PyCodeV3 from '!!raw-loader!/_includes/code/howto/configure.backups-v3.py';
import TSCodeBackup from '!!raw-loader!/_includes/code/howto/configure.backups.backup.ts';
import TSCodeRestore from '!!raw-loader!/_includes/code/howto/configure.backups.restore.ts';
import TSCodeStatus from '!!raw-loader!/_includes/code/howto/configure.backups.status.ts';
import TSCodeLegacy from '!!raw-loader!/_includes/code/howto/configure.backups-v2.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/deploy/backups_test.go';
import JavaCode from '!!raw-loader!/_includes/code/howto/configure.backups.java';
import CurlCode from '!!raw-loader!/_includes/code/howto/configure.backups.sh';

Weaviate の Backup 機能は、クラウド テクノロジーとネイティブに連携するよう設計されています。主な特長は次のとおりです。

* AWS S3、GCS、Azure Storage など、広く利用されているクラウド ブロブ ストレージとのシームレスな統合  
* 異なるストレージ プロバイダー間での Backup および Restore  
* 単一コマンドでのバックアップとリストア  
* インスタンス全体、または選択したコレクションのみをバックアップするオプション  
* 新しい環境への簡単な移行  

:::caution 重要なバックアップに関する注意事項

- **バージョン要件**: Weaviate `v1.23.12` 以前をご利用の場合、バックアップをリストアする前に必ず [アップデート](/deploy/migration/index.md) して `v1.23.13` 以上にしてください。データ破損を防ぎます。  
- **[マルチテナンシー](/weaviate/concepts/data.md#multi-tenancy) の制限**: バックアップに含まれるのは `active` テナントのみです。マルチテナント コレクション内の `inactive` または `offloaded` テナントは含まれません。バックアップ作成前に、必要なテナントを必ず [activate](/weaviate/manage-collections/multi-tenancy.mdx#manage-tenant-states) してください。  
:::

## バックアップ クイックスタート

このクイックスタートでは、ローカル ファイルシステムをバックアップ プロバイダーとして使用し、開発およびテスト環境に適した Weaviate のバックアップ手順を示します。

### 1. Weaviate の設定

次の環境変数を Weaviate の構成（例: Docker または Kubernetes の設定ファイル）に追加します。

```yaml
# Enable the filesystem backup module
ENABLE_MODULES=backup-filesystem

# Set backup location (e.g. within a Docker container or on a Kubernetes pod)
BACKUP_FILESYSTEM_PATH=/var/lib/weaviate/backups
```

### 2. バックアップの開始

新しい構成を適用するために Weaviate を再起動します。その後、バックアップを開始できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START CreateBackup"
      endMarker="# END CreateBackup"
      language="py"
    />
  </TabItem>

  <TabItem value="pyv3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START CreateBackup"
      endMarker="# END CreateBackup"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCodeBackup}
      startMarker="// START CreateBackup"
      endMarker="// END CreateBackup"
      language="ts"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// START CreateBackup"
      endMarker="// END CreateBackup"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START CreateBackup"
      endMarker="// END CreateBackup"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START CreateBackup"
      endMarker="// END CreateBackup"
      language="java"
    />
  </TabItem>

  <TabItem value="curl" label="curl">
    <FilteredTextBlock
      text={CurlCode}
      startMarker="# START CreateBackup"
      endMarker="# END CreateBackup"
      language="bash"
    />
  </TabItem>
</Tabs>

以上で Weaviate でのバックアップの準備は完了です。バックアップはローカル ファイルシステム上の指定した場所に保存されます。

また、次のことも可能です。  
- Weaviate インスタンスへ [バックアップをリストア](#restore-backup)  
- バックアップの [ステータス確認](#asynchronous-status-checking)（完了を待たなかった場合）  
- 必要に応じて [バックアップをキャンセル](#cancel-backup)  

ローカル バックアップは本番環境には適していません。本番環境では S3、GCS、Azure Storage などのクラウド プロバイダーをご利用ください。

以下のセクションでは、Weaviate でバックアップを構成および使用する方法をさらに詳しく説明します。



## 設定

Weaviate は 4 つのバックアップストレージオプションをサポートしています:

| プロバイダー | モジュール名 | 最適用途 | マルチノード対応 |
|----------|------------|-----------|-------------------|
| AWS S3 | `backup-s3` | 本番環境、AWS 環境 | Yes |
| Google Cloud Storage | `backup-gcs` | 本番環境、GCP 環境 | Yes |
| Azure Storage | `backup-azure` | 本番環境、Azure 環境 | Yes |
| ローカルファイルシステム | `backup-filesystem` | 開発、テスト、シングルノード構成 | No |

任意のプロバイダーを使用する手順:
1. モジュールを有効化  
   - `ENABLE_MODULES` 環境変数にモジュール名を追加します  
   - Weaviate Cloud インスタンスでは、関連するデフォルトモジュールが有効化されています
2. 必要なモジュールを設定  
   - オプション 1: 必要な環境変数を設定する  
   - オプション 2 (Kubernetes): [Helm チャートの values](#kubernetes-configuration) を設定する

複数のプロバイダーを同時に有効化できます

### S3 (AWS または S3 互換)

- AWS S3 および S3 互換サービス (例: MinIO) で動作します
- マルチノードデプロイをサポートします
- 本番環境での使用を推奨します

`backup-s3` を設定するには、モジュールを有効化し、必要な設定を行います。

#### モジュールの有効化

`backup-s3` を `ENABLE_MODULES` 環境変数に追加します。たとえば `text2vec-cohere` モジュールと併せて S3 モジュールを有効化する場合は、次のように設定します:

```
ENABLE_MODULES=backup-s3,text2vec-cohere
```

#### S3 設定 (ベンダー非依存)

この設定はすべての S3 互換バックエンドに適用されます。

| 環境変数 | 必須 | 説明 |
| --- | --- | --- |
| `BACKUP_S3_BUCKET` | yes | すべてのバックアップに使用する S3 バケット名です。 |
| `BACKUP_S3_PATH` | no | バケット内でバックアップをコピーおよび取得する先頭パスです。<br/><br/>オプション。デフォルトは `""` で、バックアップはサブフォルダーではなくバケットのルートに保存されます。 |
| `BACKUP_S3_ENDPOINT` | no | 使用する S3 エンドポイントです。<br/><br/>オプション。デフォルトは `"s3.amazonaws.com"` です。 |
| `BACKUP_S3_USE_SSL` | no | 接続を SSL/TLS で保護するかどうか。<br/><br/>オプション。デフォルトは `"true"` です。 |

#### S3 設定 (AWS 固有)

AWS では、Weaviate に認証情報を提供する必要があります。アクセスキー認証と ARN ベース認証のいずれかを選択できます。

#### オプション 1: IAM と ARN ロールを使用

バックアップモジュールは最初に AWS IAM を使用して認証を試みます。認証に失敗した場合は `Option 2` で認証を試行します。

#### オプション 2: アクセスキーとシークレットアクセスキーを使用

| 環境変数 | 説明 |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | 対象アカウントの AWS アクセスキー ID。 |
| `AWS_SECRET_ACCESS_KEY` | 対象アカウントの AWS シークレットアクセスキー。 |
| `AWS_REGION` | (Optional) AWS リージョン。指定しない場合、モジュールは `AWS_DEFAULT_REGION` を解析しようとします。 |


### GCS (Google Cloud Storage)

- Google Cloud Storage で動作します
- マルチノードデプロイをサポートします
- 本番環境での使用を推奨します

`backup-gcs` を設定するには、モジュールを有効化し、必要な設定を行います。

#### モジュールの有効化

`backup-gcs` を `ENABLE_MODULES` 環境変数に追加します。たとえば `text2vec-cohere` モジュールと併せて S3 モジュールを有効化する場合は、次のように設定します:

```
ENABLE_MODULES=backup-gcs,text2vec-cohere
```

#### GCS バケット関連変数

| 環境変数 | 必須 | 説明 |
| --- | --- | --- |
| `BACKUP_GCS_BUCKET` | yes | すべてのバックアップに使用する GCS バケット名です。 |
| `BACKUP_GCS_USE_AUTH` | no | 認証に資格情報を使用するかどうか。デフォルトは `true` です。ローカル GCS エミュレーターを使用する場合は `false` にすることがあります。 |
| `BACKUP_GCS_PATH` | no | バケット内でバックアップをコピーおよび取得する先頭パスです。<br/><br/>オプション。デフォルトは `""` で、バックアップはサブフォルダーではなくバケットのルートに保存されます。 |

#### Google Application Default Credentials

`backup-gcs` モジュールは Google の [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials) のベストプラクティスに従います。これにより、環境変数、ローカルの Google Cloud CLI 設定、またはアタッチされたサービスアカウントを通じて資格情報を検出できます。

そのため、異なる環境で同じモジュールを簡単に使用できます。たとえば、本番環境では環境変数ベースの方法を使用し、ローカルマシンでは CLI ベースの方法を使用できます。これにより、リモート環境で作成したバックアップをローカル環境に簡単に取得でき、問題のデバッグに役立ちます。

#### 環境変数による設定

| 環境変数 | 例 | 説明 |
| --- | --- | --- |
| `GOOGLE_APPLICATION_CREDENTIALS` | `/your/google/credentials.json` | GCP サービスアカウントまたはワークロードアイデンティティファイルへのパス。 |
| `GCP_PROJECT` | `my-gcp-project` | オプション。`GOOGLE_APPLICATION_CREDENTIALS` でサービスアカウントを使用している場合、プロジェクトはサービスアカウントに含まれています。ユーザー資格情報を使用し複数プロジェクトへアクセスできる場合などに、明示的にプロジェクトを設定できます。 |

### Azure Storage

- Microsoft Azure Storage で動作します
- マルチノードデプロイをサポートします
- 本番環境での使用を推奨します

`backup-azure` を設定するには、モジュールを有効化し、必要な設定を行います。

#### モジュールの有効化

`backup-azure` を `ENABLE_MODULES` 環境変数に追加します。たとえば `text2vec-cohere` モジュールと併せて Azure モジュールを有効化する場合は、次のように設定します:

```
ENABLE_MODULES=backup-azure,text2vec-cohere
```

モジュールを有効化するだけでなく、環境変数を使用して設定する必要があります。コンテナー関連の変数と認証関連の変数があります。

#### Azure コンテナー関連変数

| 環境変数 | 必須 | 説明 |
| --- | --- | --- |
| `BACKUP_AZURE_CONTAINER` | yes | すべてのバックアップに使用する Azure コンテナー名です。 |
| `BACKUP_AZURE_PATH` | no | コンテナー内でバックアップをコピーおよび取得する先頭パスです。<br/><br/>オプション。デフォルトは `""` で、バックアップはサブフォルダーではなくコンテナーのルートに保存されます。 |



#### Azure 認証情報

`backup-azure` で Azure に対して認証を行う方法は 2 通りあります。次のいずれかを使用できます:

1. Azure Storage の接続文字列、または  
1. Azure Storage のアカウント名とキー

どちらの方法も、以下の環境変数で設定できます。

| Environment variable | Required | Description |
| --- | --- | --- |
| `AZURE_STORAGE_CONNECTION_STRING` | yes (*see note) | 認証情報を含む文字列です（[Azure のドキュメント](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string) を参照）。 <br/><br/> `AZURE_STORAGE_ACCOUNT` よりも先にこちらがチェックされ、使用されます。 |
| `AZURE_STORAGE_ACCOUNT` | yes (*see note) | Azure Storage アカウントの名前です。 |
| `AZURE_STORAGE_KEY` | no | Azure Storage アカウントのアクセスキーです。<br/><br/>匿名アクセスを行う場合は `""` を指定してください。 |

`AZURE_STORAGE_CONNECTION_STRING` と `AZURE_STORAGE_ACCOUNT` の両方が指定されている場合、認証には `AZURE_STORAGE_CONNECTION_STRING` が使用されます。

:::note At least one credential option is required
`AZURE_STORAGE_CONNECTION_STRING` または `AZURE_STORAGE_ACCOUNT` のいずれかは必ず設定する必要があります。
:::

#### Azure ブロック サイズと並列度

| Environment variable | Required | Default | Description |
| --- | --- | --- | --- |
| `AZURE_BLOCK_SIZE` | no | `41943040` (40MB) | Azure のブロックサイズ（バイト単位） |
| `AZURE_CONCURRENCY` | no | `1` | アップロードの並列度 |

:::note
クライアントヘッダーのパラメーターとして `X-Azure-Block-Size` および `X-Azure-Concurrency` を使用することもできます。これらが指定された場合、環境変数より優先されます。
:::

### ファイルシステム

- Google Cloud Storage で動作します  
- シングルノード デプロイのみをサポートします  
- 本番利用には推奨されません  

`backup-filesystem` を設定するには、モジュールを有効化し、必要な設定を行います。

#### モジュールの有効化

`ENABLE_MODULES` 環境変数に `backup-filesystem` を追加します。たとえば、S3 モジュールと `text2vec-cohere` モジュールを併用する場合は、次のように設定します:

```
ENABLE_MODULES=backup-filesystem,text2vec-cohere
```

#### バックアップ設定

モジュールを有効化するだけでなく、以下の環境変数で設定を行う必要があります。

| Environment variable | Required | Description |
| --- | --- | --- |
| `BACKUP_FILESYSTEM_PATH` | yes | すべてのバックアップをコピーして取得するルートパス |

### その他のバックアップバックエンド

ご希望のバックアップモジュールがない場合は、[Weaviate GitHub リポジトリ](https://github.com/weaviate/weaviate/issues) でフィーチャーリクエストを提出できます。新しいバックアップモジュールに関するコミュニティからの貢献も歓迎しています。

## API

REST API の詳細は <SkipLink href="/weaviate/api/rest#tag/backups">バックアップ セクション</SkipLink> をご覧ください。

### バックアップの作成

モジュールを有効化し設定が完了したら、1 つのリクエストで実行中の任意のインスタンスに対してバックアップを開始できます。

バックアップに特定のコレクションを含める、または除外することができます。コレクションを指定しない場合、すべてのコレクションがデフォルトで含まれます。

`include` と `exclude` オプションは排他的です。どちらも設定しないか、どちらか一方のみ設定してください。

##### 使用可能な `config` オブジェクトのプロパティ

| name | type | required | default | description |
| ---- | ---- | ---- | ---- | ---- |
| `CPUPercentage`   | number | no | `50%` | 1%〜80% の範囲で希望する CPU コア使用率を設定するオプションの整数値です。 |
| `ChunkSize`       | number | no | `128MB` | チャンクサイズを指定するオプションの整数値です。Weaviate は指定サイズに近づけるよう試みます。最小 2MB、デフォルト 128MB、最大 512MB です。 |
| `CompressionLevel`| string | no | `DefaultCompression` | 圧縮アルゴリズムで使用する圧縮レベルを指定するオプションの値です。（`DefaultCompression`、`BestSpeed`、`BestCompression`） Weaviate はデフォルトで [gzip 圧縮](https://pkg.go.dev/compress/gzip#pkg-constants) を使用します。 |
| `Path`            | string | no | `""` | バックアップの保存先を手動で設定するオプションの文字列です。指定しない場合はデフォルトの場所に保存されます。Weaviate `v1.27.2` で追加されました。 |

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START CreateBackup"
      endMarker="# END CreateBackup"
      language="py"
    />
  </TabItem>

  <TabItem value="pyv3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START CreateBackup"
      endMarker="# END CreateBackup"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCodeBackup}
      startMarker="// START CreateBackup"
      endMarker="// END CreateBackup"
      language="ts"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// START CreateBackup"
      endMarker="// END CreateBackup"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START CreateBackup"
      endMarker="// END CreateBackup"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START CreateBackup"
      endMarker="// END CreateBackup"
      language="java"
    />
  </TabItem>

  <TabItem value="curl" label="curl">
    <FilteredTextBlock
      text={CurlCode}
      startMarker="# START CreateBackup"
      endMarker="# END CreateBackup"
      language="bash"
    />
  </TabItem>
</Tabs>

バックアップが完了するまでの間も、[Weaviate は利用可能なままです](#read--write-requests-while-a-backup-is-running)。

#### 非同期ステータス確認

すべてのクライアント実装には、バックアップのステータスをバックグラウンドでポーリングし、バックアップが完了（成功・失敗を問わず）するまで戻らない `wait for completion` オプションがあります。

この `wait for completion` オプションを `false` に設定した場合、Backup Creation Status API を使用してご自身でステータスを確認できます。

```js
GET /v1/backups/{backend}/{backup_id}
```

#### パラメーター

##### URL パラメーター

| Name | Type | Required | Description |
| ---- | ---- | ---- | ---- |
| `backend` | string | yes | `backup-` プレフィックスを除いたバックアッププロバイダー モジュールの名前。例：`s3`、`gcs`、`filesystem`。 |
| `backup_id` | string | yes | バックアップ作成リクエスト時にユーザーが指定したバックアップ識別子。 |

レスポンスには `"status"` フィールドが含まれます。ステータスが `SUCCESS` の場合、バックアップは完了しています。ステータスが `FAILED` の場合は追加のエラー情報が返されます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START StatusCreateBackup"
      endMarker="# END StatusCreateBackup"
      language="py"
    />
  </TabItem>
  <TabItem value="pyv3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START StatusCreateBackup"
      endMarker="# END StatusCreateBackup"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCodeStatus}
      startMarker="// START StatusCreateBackup"
      endMarker="// END StatusCreateBackup"
      language="ts"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// START StatusCreateBackup"
      endMarker="// END StatusCreateBackup"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START StatusCreateBackup"
      endMarker="// END StatusCreateBackup"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START StatusCreateBackup"
      endMarker="// END StatusCreateBackup"
      language="java"
    />
  </TabItem>

  <TabItem value="curl" label="curl">
    <FilteredTextBlock
      text={CurlCode}
      startMarker="# START StatusCreateBackup"
      endMarker="# END StatusCreateBackup"
      language="bash"
    />
  </TabItem>
</Tabs>

### バックアップのキャンセル

進行中のバックアップはいつでもキャンセルできます。バックアップ プロセスは停止し、バックアップは `CANCELLED` とマークされます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START CancelBackup"
      endMarker="# END CancelBackup"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCodeStatus}
      startMarker="// START CancelBackup"
      endMarker="// END CancelBackup"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START CancelBackup"
      endMarker="// END CancelBackup"
      language="go"
    />
  </TabItem>
</Tabs>

この操作は、誤ってバックアップを開始してしまった場合や、時間がかかり過ぎているバックアップを停止したい場合に特に便利です。

### バックアップの復元

ソースとターゲット間でノードの名前と数が同一であれば、任意のバックアップを任意のマシンへ復元できます。バックアップは同じインスタンスで作成されている必要はありません。バックアップ backend を設定したら、単一のリクエストでバックアップを復元できます。

バックアップ作成時と同様に、`include` と `exclude` オプションは相互排他的です。どちらも設定しないか、どちらか一方だけを設定してください。復元操作では、`include` と `exclude` はバックアップに含まれるコレクションを基準とします。バックアップに含まれていないソース マシン上のコレクションについて、復元プロセスは認識していません。

なお、復元先インスタンスに同名のコレクションがすでに存在する場合、復元は失敗します。

:::caution `v1.23.12` 以前からのバックアップを復元する場合
Weaviate `v1.23.12` 以前をご利用の場合は、バックアップを復元する前に **[Weaviate をバージョン 1.23.13 以上へ更新](/deploy/migration/index.md)** してください。  
`v1.23.13` より前のバージョンには、バックアップからデータが正しく保存されない可能性があるバグが存在しました。
:::

##### 利用可能な `config` オブジェクトのプロパティ

| 名前 | 型 | 必須 | デフォルト | 説明 |
| ---- | ---- | ---- | ---- |---- |
| `cpuPercentage`   | number | いいえ | `50%` | 1%〜80% の範囲で希望する CPU コア使用率を設定するためのオプションの整数です。 |
| `Path`            | string | カスタムパスで作成する場合は必須 | `""` | バックアップ場所を手動で設定するためのオプションの文字列です。指定しない場合、バックアップはデフォルトのロケーションから復元されます。Weaviate `v1.27.2` で導入されました。 |
| `rolesOptions`            | string | いいえ | `"noRestore"` | RBAC ロールをバックアップおよび復元するかどうかを手動で設定するためのオプションの文字列です。`"noRestore"` を指定するとロールと権限をバックアップせず、`"all"` を指定するとすべてを含めます。Weaviate `v1.32.0` で導入されました。 |
| `usersOptions`            | string | いいえ | `"noRestore"` | RBAC ユーザーをバックアップするかどうかを手動で設定するためのオプションの文字列です。`"noRestore"` を指定するとユーザーをバックアップせず、`"all"` を指定するとすべてを含めます。Weaviate `v1.32.0` で導入されました。 |

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START RestoreBackup"
      endMarker="# END RestoreBackup"
      language="py"
    />
  </TabItem>
  <TabItem value="pyv3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START RestoreBackup"
      endMarker="# END RestoreBackup"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCodeRestore}
      startMarker="// START RestoreBackup"
      endMarker="// END RestoreBackup"
      language="ts"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// START RestoreBackup"
      endMarker="// END RestoreBackup"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START RestoreBackup"
      endMarker="// END RestoreBackup"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START RestoreBackup"
      endMarker="// END RestoreBackup"
      language="java"
    />
  </TabItem>

  <TabItem value="curl" label="curl">
    <FilteredTextBlock
      text={CurlCode}
      startMarker="# START RestoreBackup"
      endMarker="# END RestoreBackup"
      language="bash"
    />
  </TabItem>
</Tabs>


#### 非同期ステータスチェック

すべてのクライアント実装には、復元が完了するまでバックグラウンドでステータスをポーリングし、完了（成功または失敗）した時点でのみ結果を返す `wait for completion` オプションがあります。

`wait for completion` オプションを false に設定した場合は、ご自身で Backup Restore Status API を使用してステータスを確認できます。

レスポンスには `"status"` フィールドが含まれます。ステータスが `SUCCESS` の場合、復元は完了しています。ステータスが `FAILED` の場合は、追加のエラー情報が提供されます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START StatusRestoreBackup"
      endMarker="# END StatusRestoreBackup"
      language="py"
    />
  </TabItem>
  <TabItem value="pyv3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START StatusRestoreBackup"
      endMarker="# END StatusRestoreBackup"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCodeStatus}
      startMarker="// START StatusRestoreBackup"
      endMarker="// END StatusRestoreBackup"
      language="ts"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// START StatusRestoreBackup"
      endMarker="// END StatusRestoreBackup"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START StatusRestoreBackup"
      endMarker="// END StatusRestoreBackup"
      language="go"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START StatusRestoreBackup"
      endMarker="// END StatusRestoreBackup"
      language="java"
    />
  </TabItem>

  <TabItem value="curl" label="curl">
    <FilteredTextBlock
      text={CurlCode}
      startMarker="# START StatusRestoreBackup"
      endMarker="# END StatusRestoreBackup"
      language="bash"
    />
  </TabItem>
</Tabs>


## Kubernetes 構成

 Kubernetes 上で Weaviate を実行する際、Helm chart の values を用いてバックアッププロバイダーを設定できます。

これらの値は `values.yaml` ファイルの `backups` キー配下で指定します。詳細は `values.yaml` 内のインラインドキュメントを参照してください。

<!-- TODO - update this page with proper Helm docs. -->

## 技術的考慮事項

### バックアップ実行中の Read & Write リクエスト

バックアッププロセスは稼働中のセットアップへの影響を最小限に抑えるよう設計されています。テラバイト級のデータコピーが必要な非常に大規模な環境でも、 Weaviate はバックアップ中も利用可能です。バックアップ実行中であっても Write リクエストを受け付けます。本セクションではバックアップの仕組みと、バックアップ中に Write を安全に受け付けられる理由を説明します。

 Weaviate はオブジェクトストアと転置インデックスに独自の [LSM ストア](/weaviate/concepts/storage.md#object-and-inverted-index-store) を使用しています。LSM ストアは不変のディスクセグメントと、書き込み（更新・削除を含む）を受け付けるインメモリ構造である memtable のハイブリッドです。通常、ディスク上のファイルは不変ですが、ファイルが変更されるのは次の 3 つの状況のみです。

1. memtable がフラッシュされるたびに新しいセグメントが作成されます。既存のセグメントは変更されません。  
2. memtable へのすべての書き込みは Write-Ahead-Log (WAL) にも書き込まれます。WAL は災害復旧のためだけに必要です。セグメントが正常にフラッシュされると WAL は破棄できます。  
3. 既存セグメントを最適化する非同期バックグラウンドプロセス Compaction があり、2 つの小さなセグメントを 1 つの大きなセグメントにマージしたり、冗長データを削除したりします。

 Weaviate のバックアップ実装は上記の特性を次のように利用します。

1. まずすべてのアクティブな memtable をディスクへフラッシュします。この処理は数十〜数百ミリ秒で完了します。保留中の Write リクエストは、新しい memtable が作成されるまで待つだけで、失敗や大きな遅延は発生しません。  
2. memtable がフラッシュされたことで、バックアップ対象のデータが既存ディスクセグメントに含まれていることが保証されます。バックアップ要求後に取り込まれるデータは新しいディスクセグメントに書き込まれます。バックアップは不変ファイルのリストを参照します。  
3. コピー中にディスク上のファイルが変更されないよう、Compaction はファイルコピー完了まで一時停止し、その後自動で再開します。  

この方法により、リモートバックエンドへ転送されるファイルは不変であり（したがって安全にコピー可能）、新規 Write が届いても問題ありません。数分〜数時間かかる大規模バックアップでも、 Weaviate はバックアップ実行中にユーザーへの影響なく利用できます。

バックアップは安全であるだけでなく、ユーザーリクエストを処理中の本番環境で取得することが推奨されます。

### Backup API の非同期特性

Backup API は長時間のネットワークリクエストを必要としないように設計されています。新しいバックアップ作成リクエストは即時に戻り、基本的なバリデーションのみを実行してからユーザーに応答します。この時点でバックアップのステータスは `STARTED` になります。実行中バックアップのステータスを取得するには、[ステータスエンドポイント](#asynchronous-status-checking) をポーリングしてください。これによりネットワークやクライアントの障害にも強くなります。

アプリケーション側でバックグラウンドのバックアップ完了を待ちたい場合、各言語クライアントに備わる「完了待ち」機能を使用できます。クライアントはバックグラウンドでステータスエンドポイントをポーリングし、ステータスが `SUCCESS` または `FAILED` になるまでブロックします。これにより、API が非同期であってもシンプルな同期バックアップスクリプトを容易に記述できます。

## その他のユースケース

### 別環境への移行

バックアッププロバイダーの柔軟性により、新しいユースケースが生まれます。災害復旧だけでなく、環境複製やクラスター間移行にもバックアップ & リストア機能を利用できます。

例として、次のような状況を考えてみましょう。プロダクションデータでロードテストを実施したいが、本番環境で行うとユーザーに影響が出るかもしれません。影響を与えず有意義な結果を得る簡単な方法は、環境全体を複製することです。新しい本番相当の「loadtest」環境を立ち上げたら、プロダクション環境でバックアップを作成し、それを「loadtest」環境へリストアします。プロダクション環境がまったく別のクラウドプロバイダー上で稼働していても機能します。

## トラブルシューティングと注意事項

- シングルノードバックアップは Weaviate `v1.15` から利用可能です。マルチノードバックアップは `v1.16` から利用可能です。  
- 場合によってはバックアップに時間がかかったり「停止」状態になったりして、 Weaviate が応答しなくなることがあります。その際は [バックアップをキャンセル](#cancel-backup) して再試行してください。  
- バックアップモジュールの設定ミス（無効なバックアップパスなど）があると、 Weaviate が起動しないことがあります。システムログでエラーを確認してください。  
- RBAC のロールとユーザーはデフォルトではリストアされません。 [バックアップをリストア](#restore-backup) する際、設定プロパティで手動有効化が必要です。  

## 関連ページ
- <SkipLink href="/weaviate/api/rest#tag/backups">リファレンス: REST API: バックアップ</SkipLink>

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

