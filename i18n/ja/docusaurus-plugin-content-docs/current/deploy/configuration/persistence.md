---
title: 永続化
image: og/docs/configuration.jpg
---

import SkipLink from '/src/components/SkipValidationLink'

Weaviate を Docker または Kubernetes で実行する際、ボリュームをマウントしてコンテナ外にデータを保存することでデータを永続化できます。これにより、再起動時に Weaviate インスタンスはマウントされたボリュームからデータを読み込みます。

Weaviate は `v1.15` からシングルノード、`v1.16` からマルチノード向けにネイティブのバックアップモジュールを提供しています。より古いバージョンでは、ここで説明する方法でデータを永続化することでバックアップが可能です。

## Docker Compose

### 永続化

Docker Compose で Weaviate を実行する場合、`weaviate` サービスの下に `volumes` 変数と、環境変数として一意のクラスター hostname を設定します。

```yaml
services:
  weaviate:
    volumes:
      - /var/weaviate:/var/lib/weaviate
    environment:
      CLUSTER_HOSTNAME: 'node1'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
```

* volumes について  
  * `/var/weaviate` はローカルマシン上でデータを保存したい場所です  
  * `/var/lib/weaviate` コロン (:) 以降の値はコンテナ内の保存場所です。この値は PERSISTENCE_DATA_PATH 変数と一致させる必要があります。  
* hostname について  
  * `CLUSTER_HOSTNAME` は任意の名前を指定できます  

より詳細な出力が必要な場合は、`LOG_LEVEL` の環境変数を変更してください。

```yaml
services:
  weaviate:
    environment:
      LOG_LEVEL: 'debug'
```

モジュールなし、外部ボリュームをマウントし、詳細ログ出力を有効にした Weaviate の完全な例:

```yaml
---
services:
  weaviate:
    command:
    - --host
    - 0.0.0.0
    - --port
    - '8080'
    - --scheme
    - http
    image: cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8080:8080
    - 50051:50051
    restart: on-failure:0
    volumes:
      - /var/weaviate:/var/lib/weaviate # <== set a volume here
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      ENABLE_API_BASED_MODULES: 'true'
      CLUSTER_HOSTNAME: 'node1' # <== this can be set to an arbitrary name
...
```

### バックアップ

[バックアップ](./backups.md) を参照してください。

## Kubernetes

Kubernetes セットアップでは、Weaviate が `PersistentVolumeClaims` を通じて `PersistentVolumes` を必要とする点だけを覚えておいてください（[詳細はこちら](../installation-guides/k8s-installation.md#requirements)）。Helm chart は既にデータを外部ボリュームに保存するよう構成されています。

## ディスクプレッシャーの警告と制限

`v1.12.0` 以降、ディスク使用量に関する 2 段階の通知と動作を環境変数で設定できます。どちらの変数も任意で、設定しない場合は下記のデフォルト値が適用されます。

| Variable | Default Value | Description |
| --- | --- | --- |
| `DISK_USE_WARNING_PERCENTAGE` | `80` | ディスク使用率が指定パーセンテージを超えると、そのノードのすべてのシャードが警告をログに記録します |
| `DISK_USE_READONLY_PERCENTAGE` | `90` | ディスク使用率が指定パーセンテージを超えると、そのノードのすべてのシャードが `READONLY` とマークされ、以降の書き込み要求は失敗します |

ディスクプレッシャーによりシャードが `READONLY` にマークされ、空き容量を増やすか閾値を変更したあとでシャードを再び ready にしたい場合は、<SkipLink href="/weaviate/api/rest#tag/schema/get/schema/%7BclassName%7D/shards">Shards API</SkipLink> を使用してください。

## ディスクアクセス方式

:::info Added in `v1.21`
:::

Weaviate はディスク上のデータをメモリにマッピングします。仮想メモリの使用方法を設定するには、`PERSISTENCE_LSM_ACCESS_STRATEGY` 環境変数を設定します。デフォルト値は `mmap` です。代替として `pread` を使用できます。

これら 2 つの関数は、メモリ管理の内部動作が異なります。`mmap` はメモリマップファイルを使用し、ファイルをプロセスの仮想メモリにマッピングします。`pread` は指定したオフセットからファイルディスクリプタを読み取る関数です。

一般的にはメモリ管理上の利点から `mmap` が推奨されますが、メモリ負荷が高い状況で停止が発生する場合は `pread` を試してみてください。

## 関連ページ
- [設定: バックアップ](/deploy/configuration/backups.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

