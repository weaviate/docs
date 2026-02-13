---
title: Spark を使用して Weaviate にデータをロードする
description: 大規模データ処理のための Spark コネクターと Weaviate の統合を確認します。
sidebar_position: 80
image: og/docs/tutorials.jpg
# tags: ['how to', 'spark connector', 'spark']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/weaviate/tutorials/_includes/spark-tutorial.py';

このチュートリアルでは、 [ Spark Connector ](https://github.com/weaviate/spark-connector) を使用して Spark から Weaviate にデータをインポートする方法の一例を示します。

チュートリアル終了時には、 [ Apache Spark ](https://spark.apache.org/) にデータを取り込み、 Spark Connector を使ってそのデータを Weaviate に書き込む手順を理解できます。

## インストール

まずは [ クイックスタートチュートリアル ](docs/weaviate/quickstart/index.md) をご覧いただくことをおすすめします。

Python の `weaviate-client` をインストールし、ローカルで Spark を実行するために Python の `pyspark` パッケージもインストールします。両方を取得するには、ターミナルで次のコマンドを実行してください。  
```bash
pip3 install pyspark weaviate-client
```

このチュートリアルはデモ目的で Spark をローカル実行します。 Spark クラスターのインストールやデプロイ、Python 以外のランタイム言語の選択については Apache Spark のドキュメントやクラウド環境のガイドを参照してください。

Weaviate Spark コネクターも必要です。ターミナルで次のコマンドを実行してダウンロードしてください。

```bash
curl https://github.com/weaviate/spark-connector/releases/download/v||site.spark_connector_version||/spark-connector-assembly-||site.spark_connector_version||.jar --output spark-connector-assembly-||site.spark_connector_version||.jar
```

また、 `http://localhost:8080` で稼働する Weaviate インスタンスも必要です。モジュールは不要で、 [ クイックスタートチュートリアル ](docs/weaviate/quickstart/index.md) に従ってセットアップできます。

Java 8+ と Scala 2.12 も必要です。個別にセットアップしても構いませんが、 [ IntelliJ ](https://www.jetbrains.com/idea/) をインストールすると両方をまとめて手軽に導入できます。

## Spark コネクターとは？

 Spark Connector は、 Spark のデータ構造から Weaviate へデータを書き込む作業を容易にします。これは、 Spark の ETL（抽出・変換・ロード）プロセスと組み合わせて Weaviate ベクトルデータベースを構築する際に非常に便利です。

Spark Connector は Weaviate のコレクションスキーマを基に、適切な Spark DataType を自動推論します。書き込み時にデータをベクトル化することも、既に ベクトル がある場合はそれを渡すことも可能です。新規ドキュメントには Weaviate クライアントがデフォルトで ID を生成しますが、既存の ID がある場合は `dataframe` で指定することもできます。これらはすべて Spark Connector のオプションで設定できます。

## Spark セッションの初期化

通常、 Spark セッションは（ Databricks ノートブックなどの） Spark 環境で自動的に作成され、クラスターに Weaviate Spark コネクターの jar をライブラリとして追加するだけで済みます。

ローカルで Spark セッションを手動作成する場合は、次のコードを使用してコネクター付きのセッションを作成してください。

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

これで Spark セッションが作成され、 `http://localhost:4040` の **Spark UI** で確認できます。

ローカル Spark セッションが稼働していることを次のコマンドで確認することもできます。

```python
spark
```

## Spark へのデータ読み込み

このチュートリアルでは Sphere データセットの 100k 行のサブセットを、先ほど開始した Spark セッションに読み込みます。

データセットは [こちら](https://storage.googleapis.com/sphere-demo/sphere.100k.jsonl.tar.gz) からダウンロードできます。ダウンロード後に展開してください。

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

正しく読み込まれたかを確認するため、先頭の数レコードを表示してみましょう。

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
この手順の前に、 Weaviate インスタンスが `http://localhost:8080` で稼働していることを確認してください。セットアップ方法は [ クイックスタートチュートリアル ](docs/weaviate/quickstart/index.md) を参照してください。
:::

手早く Weaviate を起動するには、次の `docker-compose.yml` ファイルをローカルに保存します。

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

そのディレクトリへ移動し、次のコマンドで `docker-compose.yml` に従って Weaviate を起動します。

```bash
docker compose up -d
```

Spark Connector は Weaviate にスキーマが既に作成されていることを前提とします。そのため、 Python クライアントを使ってスキーマを作成します。スキーマの詳細な作成方法については、こちらの [チュートリアル](../starter-guides/managing-collections/index.mdx) をご覧ください。

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

続いて Spark の `dataframe` を Weaviate に書き込みます。 `.limit(1500)` を削除すればフルデータセットをロードできます。

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

作業が終わったら Weaviate との接続を忘れずに閉じてください。

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
## Spark Connector オプション

上記のコードを詳しく確認し、Spark Connector で何が起こっているのかと、使用できるすべての設定を理解しましょう。

- `.option("host", "localhost:8080")` を使用して、書き込み先の Weaviate インスタンスを指定します。

- `.option("className", "Sphere")` を使用して、データを先ほど作成したコレクションに書き込むようにします。

- すでに `dataframe` にドキュメント ID がある場合、`.withColumnRenamed("id", "uuid")` でそれを `uuid` にリネームし、続けて `.option("id", "uuid")` を指定することで、Weaviate にその ID を渡せます。

- `.option("vector", "vector")` を使用すると、`dataframe` の `vector` 列に保存されているベクトルを Weaviate に利用させ、ゼロから再ベクトル化する代わりにそれらを使用させることができます。

- `.option("batchSize", 200)` を使用して、Weaviate へ書き込む際のバッチサイズを指定します。バッチ処理に加えて、ストリーミングも可能です。

- `.mode("append")` を使用して、書き込みモードを `append` に指定します。現在サポートされている書き込みモードは `append` のみです。

ここまででデータを書き込み、Spark Connector の機能と設定を理解しました。最後のステップとして、Python client を使ってデータがロードされたことを確認できます。

```python
client.query.get("Sphere", "title").do()
```

## 追加オプション

### Weaviate への接続

[WCD](/cloud/index.mdx) などの認証付きクラスターを使用する場合、API キー認証として `.option("apiKey", WEAVIATE_API_KEY)` を以下のように指定できます。

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

- `.option("retries", 2)` を使用するとリトライ回数を設定できます（デフォルト 2）。Spark も失敗したステージをリトライする点に注意してください。

- `.option("retriesBackoff", 2)` を使用すると、リトライ間で待機する時間（秒）を設定できます（デフォルト 2 秒）。

- `.option("timeout", 60)` を使用すると、1 バッチあたりのタイムアウトを設定できます（デフォルト 60 秒）。

- `header:` プレフィックスを付けることで任意のヘッダーを設定できます。たとえば `OPENAI_APIKEY` ヘッダーを渡すには `.option("header:OPENAI_APIKEY", ...)` を使用します。

- さらに OIDC オプションもサポートされています。`.option("oidc:username", ...)`、`.option("oidc:password", ...)`、`.option("oidc:clientSecret", ...)`、`.option("oidc:accessToken", ...)`、`.option("oidc:accessTokenLifetime", ...)`、`.option("oidc:refreshToken", ...)` です。詳細は [Java client ドキュメント](../client-libraries/java.md#oidc-authentication) を参照してください。

### 名前付きベクトルとマルチベクトル埋め込み

Spark Connector は Weaviate の名前付きベクトルをサポートしており、複数のベクトル（マルチベクトル埋め込みを含む）をコレクションへインポートできます。コレクションが名前付きベクトルで定義されている場合、`vectors:*` または `multiVectors:*` オプションで参照できます。

例として、2 つの名前付きベクトルを持つ `BringYourOwnVectors` コレクションを作成してみましょう。
- `regular` ‐ 通常の埋め込み（例: `[0.1, 0.2]`）
- `colbert` ‐ マルチベクトル埋め込み（例: `[[0.1, 0.2], [0.3, 0.4]]`）

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

`regular` と `colbert` の名前付きベクトルに、それぞれ `regularVector` と `multiVector` のデータを挿入する Spark コードは次のようになります。

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

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>