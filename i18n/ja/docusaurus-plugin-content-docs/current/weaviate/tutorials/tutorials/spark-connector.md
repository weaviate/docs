---
title: Spark で Weaviate にデータをロードする
description: 大規模データ処理のための Spark Connector と Weaviate との統合方法を解説します。
sidebar_position: 80
image: og/docs/tutorials.jpg
# tags: ['how to', 'spark connector', 'spark']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/weaviate/tutorials/_includes/spark-tutorial.py';

このチュートリアルでは、[Spark Connector](https://github.com/weaviate/spark-connector) を使用して Spark から Weaviate へデータをインポートする例を紹介します。

チュートリアルを終える頃には、[Apache Spark](https://spark.apache.org/) にデータを取り込み、その後 Spark Connector を使って Weaviate に書き込む方法が分かります。

## インストール

まずは [クイックスタート チュートリアル](docs/weaviate/quickstart/index.md) をご覧いただくことをおすすめします。

本チュートリアルでは Python の `weaviate-client` をインストールし、ローカルで Spark を実行するために Python の `pyspark` パッケージもインストールします。次のコマンドをターミナルで実行してください。  
```bash
pip3 install pyspark weaviate-client
```

ここではデモ用に Spark をローカル実行しています。Spark クラスターの構築や Python 以外の言語ランタイムの選択については Apache Spark の公式ドキュメントやクラウド環境のガイドをご参照ください。

さらに Weaviate Spark Connector が必要です。以下のコマンドをターミナルで実行してダウンロードしてください。

```bash
curl https://github.com/weaviate/spark-connector/releases/download/v||site.spark_connector_version||/spark-connector-assembly-||site.spark_connector_version||.jar --output spark-connector-assembly-||site.spark_connector_version||.jar
```

本チュートリアルでは `http://localhost:8080` で稼働する Weaviate インスタンスも必要です。モジュールは不要で、[クイックスタート チュートリアル](docs/weaviate/quickstart/index.md) に従ってセットアップできます。

また、Java 8 以上と Scala 2.12 のインストールも必要です。個別にセットアップしてもかまいませんが、[IntelliJ](https://www.jetbrains.com/idea/) をインストールすると両方を簡単に用意できます。

## Spark Connector の概要

Spark Connector を使うと、Spark のデータ構造から Weaviate へ容易にデータを書き込めます。Spark の ETL（抽出・変換・ロード）プロセスと組み合わせて Weaviate ベクトルデータベースを構築する際に特に便利です。

Spark Connector は、Weaviate のコレクションスキーマに基づいて適切な Spark DataType を自動推論します。書き込み時にベクトル化を行うことも、既にベクトルがある場合はそれを渡すことも可能です。新規ドキュメントには Weaviate クライアントがデフォルトでドキュメント ID を生成しますが、既存の ID がある場合は `dataframe` 内で指定できます。これらはすべて Connector のオプションで設定できます。

## Spark セッションの初期化

多くの場合、Spark セッションは（Databricks ノートブックなどの）Spark 環境で自動的に作成され、Connector の JAR をクラスターに追加するだけで済みます。

ローカルで Spark セッションを手動で作成するには、次のコードを使用して Connector 付きのセッションを生成します。

<Tabs groupId="languages">
 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START InitiateSparkSession"
      endMarker="# END InitiateSparkSession"
      language="py"
    />
  </TabItem>
</Tabs>

これで Spark セッションが作成され、`http://localhost:4040` の **Spark UI** で確認できます。

ローカル Spark セッションが稼働しているかどうかは、次のコマンドで検証できます。

```python
spark
```

## Spark へのデータ読み込み

ここでは Sphere データセットの一部（10 万行）を、先ほど開始した Spark セッションに読み込みます。

データセットは [こちら](https://storage.googleapis.com/sphere-demo/sphere.100k.jsonl.tar.gz) からダウンロードできます。ダウンロード後に解凍してください。

次のコードでデータセットを Spark セッションに読み込めます。

<Tabs groupId="languages">
 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ReadDataIntoSpark"
      endMarker="# END ReadDataIntoSpark"
      language="py"
    />
  </TabItem>
</Tabs>

正しく読み込めたか確認するため、先頭数行を表示してみましょう。

<Tabs groupId="languages">
 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START VerifyDataRead"
      endMarker="# END VerifyDataRead"
      language="py"
    />
  </TabItem>
</Tabs>

## Weaviate への書き込み

:::tip
このステップの前に、`http://localhost:8080` で Weaviate インスタンスが稼働していることを確認してください。セットアップ方法は [クイックスタート チュートリアル](docs/weaviate/quickstart/index.md) を参照してください。
:::

手早く Weaviate を起動するには、以下の `docker-compose.yml` ファイルをローカルに保存します。

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

そのディレクトリに移動して、次のコマンドで `docker-compose.yml` に従って Weaviate を起動します。

```bash
docker compose up -d
```

Spark Connector は Weaviate にスキーマが既に存在することを前提としています。そのため、Python クライアントを使ってスキーマを作成します。スキーマ作成方法の詳細は[こちらのチュートリアル](../starter-guides/managing-collections/index.mdx)をご覧ください。

<Tabs groupId="languages">
 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START CreateCollection"
      endMarker="# END CreateCollection"
      language="py"
    />
  </TabItem>
</Tabs>

続いて Spark の `dataframe` を Weaviate に書き込みます。`.limit(1500)` を削除すれば全データセットをロードできます。

<Tabs groupId="languages">
 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START WriteToWeaviate"
      endMarker="# END WriteToWeaviate"
      language="py"
    />
  </TabItem>
</Tabs>

作業が終わったら Weaviate との接続を閉じることをお忘れなく。

<Tabs groupId="languages">
 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START CloseConnection"
      endMarker="# END CloseConnection"
      language="py"
    />
  </TabItem>
</Tabs>
## Spark コネクターのオプション

上記のコードを詳しく見て、 Spark コネクターで何が起こっているのか、そして利用可能なすべての設定を確認しましょう。

- `.option("host", "localhost:8080")` を使用すると、書き込み先の Weaviate インスタンスを指定できます。  
- `.option("className", "Sphere")` を使用すると、データを先ほど作成したコレクションに書き込むことを保証します。  
- すでに `dataframe` にドキュメント ID が含まれている場合、 `.withColumnRenamed("id", "uuid")` でそれらを保持している列名を `uuid` に変更し、その後 `.option("id", "uuid")` を指定することで Weaviate に渡せます。  
- `.option("vector", "vector")` を使用すると、データを最初から再ベクトル化せずに、 `dataframe` 内の `vector` 列に保存されているベクトルを Weaviate で利用させることができます。  
- `.option("batchSize", 200)` を使用すると、 Weaviate へ書き込む際のバッチサイズを指定します。バッチ処理に加えて、ストリーミングもサポートされています。  
- `.mode("append")` を使用すると、書き込みモードを `append` として指定します。現在サポートされている書き込みモードは append のみです。  

これでデータは Weaviate に書き込まれ、 Spark コネクターの機能とその設定を理解できました。最後のステップとして、 Python クライアント経由でデータをクエリし、ロードが完了していることを確認しましょう。

```python
client.query.get("Sphere", "title").do()
```

## 追加オプション

### Weaviate への接続

[WCD](/cloud/index.mdx) のような認証付きクラスターを使用している場合は、以下のように API キー認証のために `.option("apiKey", WEAVIATE_API_KEY)` を指定できます。

```python
df.limit(1500).withColumnRenamed("id", "uuid").write.format("io.weaviate.spark.Weaviate") \
    .option("batchSize", 200) \
    .option("scheme", "https") \
    .option("host", "demo-env.weaviate.network") \
    .option("apiKey", WEAVIATE_API_KEY) \
    .option("id", "uuid") \
    .option("className", "Sphere") \
    .option("vector", "vector") \
    .mode("append").save()
```

- `.option("retries", 2)` を使用するとリトライ回数を設定します（デフォルト 2）。 Spark も失敗したステージをリトライすることに注意してください。  
- `.option("retriesBackoff", 2)` を使用すると、リトライ間の待機時間を秒単位で指定します（デフォルト 2 秒）。  
- `.option("timeout", 60)` を使用すると、1 バッチあたりのタイムアウトを設定します（デフォルト 60 秒）。  
- `header:` プレフィックスを付けたオプションで任意のヘッダーを渡せます。たとえば `OPENAI_APIKEY` ヘッダーを渡すには `.option("header:OPENAI_APIKEY", ...)` を使用します。  
- さらに OIDC オプションもサポートされています。 `.option("oidc:username", ...)`, `.option("oidc:password", ...)`, `.option("oidc:clientSecret", ...)`, `.option("oidc:accessToken", ...)`, `.option("oidc:accessTokenLifetime", ...)`, `.option("oidc:refreshToken", ...)`。これらの詳細は [Java クライアントドキュメント](../client-libraries/java.md#oidc-authentication) を参照してください。  

### 名前付きベクトルとマルチベクトル埋め込み

Spark コネクターは Weaviate の名前付きベクトルをサポートしており、複数のベクトル（マルチベクトル埋め込みを含む）をコレクションにインポートできます。コレクションが名前付きベクトルで定義されている場合、 `vectors:*` または `multiVectors:*` オプションを使用してそれらを参照できます。

例として、2 つの名前付きベクトルを持つ `BringYourOwnVectors` コレクションを作成します。  
- `regular`  - 通常の埋め込み（例: `[0.1, 0.2]`）  
- `colbert`  - マルチベクトル埋め込み（例: `[[0.1, 0.2], [0.3, 0.4]]`）  

<Tabs groupId="languages">
 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START CreateNamedVectorCollection"
      endMarker="# END CreateNamedVectorCollection"
      language="py"
    />
  </TabItem>
</Tabs>

`regular` と `colbert` の名前付きベクトルに `regularVector` と `multiVector` のデータを挿入する対応する Spark コードは次のようになります。

<Tabs groupId="languages">
 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ReadNamedVectorDataIntoSpark"
      endMarker="# END ReadNamedVectorDataIntoSpark"
      language="py"
    />
  </TabItem>
</Tabs>

## ご質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>