---
title: Docker
image: og/docs/installation.jpg
# tags: ['installation', 'Docker']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Weaviate は Docker を使用してデプロイできます。

[コマンドラインから Weaviate をデフォルト設定で実行](#run-weaviate-with-default-settings)するか、独自の `docker-compose.yml` ファイルを作成して[設定をカスタマイズ](#customize-your-weaviate-configuration)できます。

## デフォルト設定で Weaviate を実行

:::info Added in v1.24.1

:::

デフォルト設定で Docker を使用して Weaviate を実行するには、シェルから次のコマンドを実行してください。

```bash
docker run -p 8080:8080 -p 50051:50051 cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
```

このコマンドは、コンテナ内で以下のデフォルトの[環境変数](#environment-variables)を設定します。

- `PERSISTENCE_DATA_PATH` のデフォルトは `./data` です  
- `AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED` のデフォルトは `true` です  
- `QUERY_DEFAULTS_LIMIT` のデフォルトは `10` です

## Weaviate 設定をカスタマイズ

`docker-compose.yml` ファイルを作成して Weaviate の設定をカスタマイズできます。[サンプルの Docker Compose ファイル](#sample-docker-compose-file)を利用するか、対話型の[Configurator](#configurator)で `docker-compose.yml` ファイルを生成してください。

## サンプル Docker Compose ファイル

このスターター Docker Compose ファイルでは次のことが可能です。  
* 任意の[API ベースのモデルプロバイダー連携](/weaviate/model-providers/index.md)（例: `OpenAI`、`Cohere`、`Google`、`Anthropic`）の利用  
    * これには、対応する埋め込みモデル、生成、リランカーの[連携](/weaviate/model-providers/index.md)が含まれます。  
* ベクトライザーなしでの事前ベクトル化データの検索  
* コンテナ内 `/var/lib/weaviate` に `weaviate_data` という永続ボリュームをマウントしてデータを保存

### ダウンロードと実行

<Tabs queryString="docker-compose">
  <TabItem value="anonymous" label="Anonymous access" default>

次のコードを `docker-compose.yml` として保存し、匿名アクセスを有効にした状態で Weaviate をダウンロードして実行します。

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
    volumes:
    - weaviate_data:/var/lib/weaviate
    restart: on-failure:0
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      ENABLE_API_BASED_MODULES: 'true'
      CLUSTER_HOSTNAME: 'node1'
volumes:
  weaviate_data:
...
```

:::caution
匿名アクセスは開発または評価用途以外では強く推奨されません。
:::

  </TabItem>
  <TabItem value="auth" label="With authentication and authorization enabled">

次のコードを `docker-compose.yml` として保存し、認証（非匿名アクセス）および認可を有効にした状態で Weaviate をダウンロードして実行します。

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
    volumes:
    - weaviate_data:/var/lib/weaviate
    restart: on-failure:0
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      ENABLE_API_BASED_MODULES: 'true'
      CLUSTER_HOSTNAME: 'node1'
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'false'
      AUTHENTICATION_APIKEY_ENABLED: 'true'
      AUTHENTICATION_APIKEY_ALLOWED_KEYS: 'user-a-key,user-b-key'
      AUTHENTICATION_APIKEY_USERS: 'user-a,user-b'
      AUTHORIZATION_ENABLE_RBAC: 'true'
      AUTHORIZATION_RBAC_ROOT_USERS: 'user-a'
volumes:
  weaviate_data:
...
```

この設定では、API キーを用いた[認証](/deploy/configuration/authentication.md)と、ロールベースアクセス制御による[認可](/deploy/configuration/authorization.md)が有効になります。

`user-a` と `user-b` のユーザー、およびそれぞれのキー `user-a-key` と `user-b-key` が定義されており、これが Weaviate インスタンスへの接続時の認証情報となります。

ユーザー `user-a` には **ロールベースアクセス制御 (RBAC)** 方式で管理者権限が付与されています。ユーザー `user-b` には[認可と RBAC ガイド](/deploy/configuration/authorization.md)に従ってカスタムロールを割り当てることができます。

  </TabItem>
</Tabs>

`docker-compose.yml` を編集して環境に合わせてください。[環境変数](#environment-variables)の追加・削除、ポートマッピングの変更、または [Ollama](/weaviate/model-providers/ollama/index.md) や [Hugging Face Transformers](/weaviate/model-providers/transformers/index.md) など追加の[モデルプロバイダー連携](/weaviate/model-providers/index.md)を行うことができます。

Weaviate インスタンスを起動するには、シェルから次のコマンドを実行してください。

```bash
docker compose up -d
```

## Configurator

Configurator を使うと `docker-compose.yml` を自動生成できます。ローカルで実行されるベクトライザー（例: `text2vec-transformers`、`multi2vec-clip`）を含む特定の Weaviate モジュールを選択できます。

import DocsConfigGen from '@site/src/components/DockerConfigGen';

<DocsConfigGen />

## 環境変数

環境変数を使用して Weaviate のセットアップ、認証と認可、モジュール設定、データストレージ設定を制御できます。

:::info List of environment variables
環境変数の包括的な一覧は[こちらのページ](/deploy/configuration/env-vars/index.md)をご覧ください。
:::

## 設定例

以下に `docker-compose.yml` の設定例を示します。

### 永続ボリューム

データ損失を防ぎ、読み書き速度を向上させるために永続ボリュームを設定することを推奨します。

シャットダウン時には `docker compose down` を実行して、メモリ上のファイルをディスクに書き込んでください。

**名前付きボリュームの場合**  
```yaml
services:
  weaviate:
    volumes:
        - weaviate_data:/var/lib/weaviate
    # etc

volumes:
    weaviate_data:
```

`docker compose up -d` を実行すると、Docker は名前付きボリューム `weaviate_data` を作成し、コンテナ内の `PERSISTENCE_DATA_PATH` にマウントします。

**ホストバインドの場合**  
```yaml
services:
  weaviate:
    volumes:
      - /var/weaviate:/var/lib/weaviate
    # etc
```

`docker compose up -d` を実行すると、ホストの `/var/weaviate` がコンテナ内の `PERSISTENCE_DATA_PATH` にマウントされます。

### モジュールなしの Weaviate

モジュールを一切使用しない Weaviate 用 Docker Compose 設定例です。この場合、インポート時と検索時の両方でモデル推論は行われません。外部の ML モデルなどで生成したベクトルを、インポート時と検索時にご自身で提供する必要があります。

```yaml
services:
  weaviate:
    image: cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8080:8080
    - 50051:50051
    restart: on-failure:0
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      CLUSTER_HOSTNAME: 'node1'
```

### `text2vec-transformers` モジュールを使用した Weaviate

transformers モデル [`sentence-transformers/multi-qa-MiniLM-L6-cos-v1`](https://huggingface.co/sentence-transformers/multi-qa-MiniLM-L6-cos-v1) を使用する Docker Compose ファイル例です。

```yaml
services:
  weaviate:
    image: cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
    restart: on-failure:0
    ports:
    - 8080:8080
    - 50051:50051
    environment:
      QUERY_DEFAULTS_LIMIT: 20
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: "./data"
      DEFAULT_VECTORIZER_MODULE: text2vec-transformers
      ENABLE_MODULES: text2vec-transformers
      TRANSFORMERS_INFERENCE_API: http://text2vec-transformers:8080
      CLUSTER_HOSTNAME: 'node1'
  text2vec-transformers:
    image: cr.weaviate.io/semitechnologies/transformers-inference:sentence-transformers-multi-qa-MiniLM-L6-cos-v1
    environment:
      ENABLE_CUDA: 0 # set to 1 to enable
      # NVIDIA_VISIBLE_DEVICES: all # enable if running with CUDA
```

transformer モデルは GPU での実行を想定したニューラルネットワークです。`text2vec-transformers` モジュールを GPU なしで実行することも可能ですが、速度は低下します。GPU が利用可能な場合は `ENABLE_CUDA=1` で CUDA を有効にしてください。

`text2vec-transformers` 連携のセットアップ方法について詳しくは[こちらのページ](/weaviate/model-providers/transformers/embeddings.md)をご覧ください。

`text2vec-transformers` モジュールを使用するには、Weaviate バージョン `v1.2.0` 以上が必要です。



### 未リリース版

import RunUnreleasedImages from '/_includes/configuration/run-unreleased.mdx'

<RunUnreleasedImages />

## マルチノード構成

複数のホストノードで Weaviate を構成するには、次の手順を行います。

- 1 つのノードを「創設」メンバーとして設定します  
- クラスター内の他のノードに `CLUSTER_JOIN` 変数を設定します  
- 各ノードに `CLUSTER_GOSSIP_BIND_PORT` を設定します  
- 各ノードに `CLUSTER_DATA_BIND_PORT` を設定します  
- 各ノードに `RAFT_JOIN` を設定します  
- 各ノードに投票者数を指定する `RAFT_BOOTSTRAP_EXPECT` を設定します  
- 必要に応じて `CLUSTER_HOSTNAME` を使用して各ノードのホスト名を設定します  

（詳しくは [Weaviate における水平レプリケーション](/weaviate/concepts/cluster.md) を参照してください。）

そのため、Docker Compose ファイルでは「創設」メンバー用に以下のような環境変数を含めます。

```yaml
  weaviate-node-1:  # Founding member service name
    ...  # truncated for brevity
    environment:
      CLUSTER_HOSTNAME: 'node1'
      CLUSTER_GOSSIP_BIND_PORT: '7100'
      CLUSTER_DATA_BIND_PORT: '7101'
      RAFT_JOIN: 'node1,node2,node3'
      RAFT_BOOTSTRAP_EXPECT: 3
```

その他のメンバーの設定例は次のようになります。

```yaml
  weaviate-node-2:
    ...  # truncated for brevity
    environment:
      CLUSTER_HOSTNAME: 'node2'
      CLUSTER_GOSSIP_BIND_PORT: '7102'
      CLUSTER_DATA_BIND_PORT: '7103'
      CLUSTER_JOIN: 'weaviate-node-1:7100'  # This must be the service name of the "founding" member node.
      RAFT_JOIN: 'node1,node2,node3'
      RAFT_BOOTSTRAP_EXPECT: 3
```

以下は 3 ノード構成のサンプル設定です。この構成を使ってローカルで [レプリケーション](/deploy/configuration/replication.md) の例をテストできる場合があります。

<details>
  <summary>3 ノードのレプリケーション構成用 Docker Compose ファイル</summary>

```yaml
services:
  weaviate-node-1:
    init: true
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
    - 6060:6060
    - 50051:50051
    restart: on-failure:0
    volumes:
      - ./data-node-1:/var/lib/weaviate
    environment:
      LOG_LEVEL: 'debug'
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      ENABLE_API_BASED_MODULES: 'true'
      CLUSTER_HOSTNAME: 'node1'
      CLUSTER_GOSSIP_BIND_PORT: '7100'
      CLUSTER_DATA_BIND_PORT: '7101'
      RAFT_JOIN: 'node1,node2,node3'
      RAFT_BOOTSTRAP_EXPECT: 3

  weaviate-node-2:
    init: true
    command:
    - --host
    - 0.0.0.0
    - --port
    - '8080'
    - --scheme
    - http
    image: cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8081:8080
    - 6061:6060
    - 50052:50051
    restart: on-failure:0
    volumes:
      - ./data-node-2:/var/lib/weaviate
    environment:
      LOG_LEVEL: 'debug'
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      ENABLE_API_BASED_MODULES: 'true'
      CLUSTER_HOSTNAME: 'node2'
      CLUSTER_GOSSIP_BIND_PORT: '7102'
      CLUSTER_DATA_BIND_PORT: '7103'
      CLUSTER_JOIN: 'weaviate-node-1:7100'
      RAFT_JOIN: 'node1,node2,node3'
      RAFT_BOOTSTRAP_EXPECT: 3

  weaviate-node-3:
    init: true
    command:
    - --host
    - 0.0.0.0
    - --port
    - '8080'
    - --scheme
    - http
    image: cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
    ports:
    - 8082:8080
    - 6062:6060
    - 50053:50051
    restart: on-failure:0
    volumes:
      - ./data-node-3:/var/lib/weaviate
    environment:
      LOG_LEVEL: 'debug'
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      ENABLE_API_BASED_MODULES: 'true'
      CLUSTER_HOSTNAME: 'node3'
      CLUSTER_GOSSIP_BIND_PORT: '7104'
      CLUSTER_DATA_BIND_PORT: '7105'
      CLUSTER_JOIN: 'weaviate-node-1:7100'
      RAFT_JOIN: 'node1,node2,node3'
      RAFT_BOOTSTRAP_EXPECT: 3
```

</details>

:::note Port number conventions
Weaviate では `CLUSTER_GOSSIP_BIND_PORT` より 1 大きい値を `CLUSTER_DATA_BIND_PORT` に設定するのが慣例です。
:::

## シェルのアタッチオプション

`docker compose up` の出力はすべてのコンテナのログにアタッチするため、かなり冗長になります。

代わりに次のコマンドを実行すると、Weaviate 自身のログのみにアタッチできます。

```bash
# Run Docker Compose
docker compose up -d && docker compose logs -f weaviate
```

あるいは、`docker compose up -d` で完全にデタッチして起動し、`{bindaddress}:{port}/v1/meta` をステータス `200 OK` を受け取るまでポーリングする方法もあります。

<!-- TODO:
1. Check that all environment variables are also applicable for the kubernetes setup and associated values.yaml config file.
2. Take this section out and into References; potentially consolidate with others as they are strewn around the docs. (E.g. backup env variables are not included here.) -->

## トラブルシューティング

### `CLUSTER_HOSTNAME` の変動に備えた設定

システムによっては、クラスターのホスト名が時間とともに変わる場合があります。これは単一ノードの Weaviate デプロイで問題を引き起こすことが知られています。これを回避するために、`values.yaml` ファイルで `CLUSTER_HOSTNAME` 環境変数をクラスターのホスト名に設定してください。

```yaml
---
services:
  weaviate:
    # ...
    environment:
      CLUSTER_HOSTNAME: 'node1'
...
```

## 関連ページ

- Docker が初めての方は [Weaviate ユーザーのための Docker 入門](https://weaviate.io/blog/docker-and-containers-with-weaviate) をご覧ください。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

