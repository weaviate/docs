---
title: Java
sidebar_position: 50
description: "Weaviate と Go アプリケーションおよびサービスを統合するための公式 Java クライアントライブラリのドキュメント。"
image: og/docs/client-libraries.jpg
# tags: ['java', 'client library']
---

import QuickLinks from "/src/components/QuickLinks";

export const javaCardsData = [
  {
  title: "weaviate/java-client",
  link: "https://github.com/weaviate/java-client",
  icon: "fa-brands fa-github",
  },
];

:::note Java クライアント (SDK)

最新の Java クライアントのバージョンは `v||site.java_client_version||` です。

<QuickLinks items={javaCardsData} />

:::

:::info v4 で導入された破壊的変更
`package` と `import` のパスが `technology.semi.weaviate` から `io.weaviate` に変更されました。

詳細は [移行ガイド](#from-3xx-to-400) を参照してください。
:::

## インストールとセットアップ
最新の安定版 Java クライアントライブラリを取得するには、次の依存関係をプロジェクトに追加してください。

```xml
<dependency>
  <groupId>io.weaviate</groupId>
  <artifactId>client</artifactId>
  <version>4.7.0</version>  <!-- Check latest version -->
</dependency>
```

この API クライアントは Java 8 以降と互換性があります。

プロジェクト内でのクライアントの使用例は次のとおりです。

```java
package io.weaviate;

import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.misc.model.Meta;

public class App {
  public static void main(String[] args) {
    Config config = new Config("http", "localhost:8080");
    WeaviateClient client = new WeaviateClient(config);
    Result<Meta> meta = client.misc().metaGetter().run();
    if (meta.getError() == null) {
      System.out.printf("meta.hostname: %s\n", meta.getResult().getHostname());
      System.out.printf("meta.version: %s\n", meta.getResult().getVersion());
      System.out.printf("meta.modules: %s\n", meta.getResult().getModules());
    } else {
      System.out.printf("Error: %s\n", meta.getError().getMessages());
    }
  }
}
```

## 認証

import ClientAuthIntro from '/docs/weaviate/client-libraries/_components/client.auth.introduction.mdx'

<ClientAuthIntro clientName="Java"/>

### WCD 認証

import ClientAuthWCD from '/docs/weaviate/client-libraries/_components/client.auth.wcs.mdx'

<ClientAuthWCD />

### API キー認証

:::info Weaviate Java クライアントバージョン `4.0.2` で追加されました。
:::

import ClientAuthApiKey from '/docs/weaviate/client-libraries/_components/client.auth.api.key.mdx'

<ClientAuthApiKey />

```java
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;

Config config = new Config("https", "WEAVIATE_INSTANCE_URL");
WeaviateClient client = WeaviateAuthClient.apiKey(config, "YOUR-WEAVIATE-API-KEY");  // Replace with your Weaviate instance API key
```

### OIDC 認証

import ClientAuthOIDCIntro from '/docs/weaviate/client-libraries/_components/client.auth.oidc.introduction.mdx'

<ClientAuthOIDCIntro />

#### <i class="fa-solid fa-key"></i> リソースオーナーパスワードフロー

import ClientAuthFlowResourceOwnerPassword from '/docs/weaviate/client-libraries/_components/client.auth.flow.resource.owner.password.mdx'

<ClientAuthFlowResourceOwnerPassword />

```java
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;

Config config = new Config("http", "weaviate.example.com:8080");
WeaviateAuthClient.clientPassword(
    config,
    "Your user",
    "Your password",
    Arrays.asList("scope1", "scope2") // optional, depends on the configuration of your identity provider (not required with WCD)
);
```

#### <i class="fa-solid fa-key"></i> クライアントクレデンシャルフロー

import ClientAuthFlowClientCredentials from '/docs/weaviate/client-libraries/_components/client.auth.flow.client.credentials.mdx'

<ClientAuthFlowClientCredentials />

```java
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;

Config config = new Config("http", "weaviate.example.com:8080");
WeaviateAuthClient.clientCredentials(
    config,
    "your_client_secret",
    Arrays.asList("scope1" ,"scope2") // optional, depends on the configuration of your identity provider
);
```

#### <i class="fa-solid fa-key"></i> リフレッシュトークンフロー

import ClientAuthBearerToken from '/docs/weaviate/client-libraries/_components/client.auth.bearer.token.mdx'

<ClientAuthBearerToken />

```java
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;

Config config = new Config("http", "weaviate.example.com:8080");
WeaviateAuthClient.bearerToken(
    config,
    "Your_access_token",
    500,  // lifetime in seconds
    "Your_refresh_token",
);
```

## カスタムヘッダー

クライアント初期化時に追加されるカスタムヘッダーを渡すことができます。

```java
import io.weaviate.client.Config;
import io.weaviate.client.WeaviateClient;

public class App {
  public static void main(String[] args) {
    Map<String, String> headers = new HashMap<String, String>() { {
      put("header_key", "value");
    } };
    Config config = new Config("http", "localhost:8080", headers);
    WeaviateClient client = new WeaviateClient(config);
  }
}
```

## 参照

すべての [RESTful エンドポイント](/weaviate/api/rest) と [GraphQL 関数](../api/graphql/index.md) のリファレンスは Java クライアントでサポートされており、各リファレンスページのコードブロックで解説しています。

## 型付き GraphQL 応答

Weaviate Java クライアントは、GraphQL クエリの応答を自動的に Java オブジェクトへデシリアライズします。これにより手動で JSON を解析する必要がなくなり、コレクションデータを扱う際にコンパイル時の型安全性が得られます。

たとえば、次のクエリの応答を受け取るために `Pizzas` クラスを定義できます。

```java
@Getter
public static class Pizzas {
  @SerializedName(value = "Pizza")
  List<Pizza> pizzas;

  @Getter
  public static class Pizza extends GraphQLGetBaseObject {
    String name;
    String description;
    String bestBefore;
    Float price;
  }
}

try (WeaviateAsyncClient asyncClient = client.async()) {
  return asyncClient.graphQL().get()
    .withClassName("Pizza")
    .withFields(Field.builder().name("name").build(), Field.builder().name("description").build())
    .run(Pizzas.class)
    .get();
}
```

返却される応答は `GraphQLTypedResponse<Pizzas>` オブジェクトになります。

```java
Result<GraphQLTypedResponse<Pizzas>> result = getResults();

List<Pizzas.Pizza> pizzas = result.getResult().getData().getObjects().getPizzas();

Pizzas.Pizza pizza = pizzas.get(0);

// access Pizza specific properties
Float price = pizza.getPrice();

// access _additional values like vector (and others)
Float[] vector = pizza.getAdditional().getVector();
Float certainty = pizza.getAdditional().getCertainty();
```

## 設計

### ビルダー パターン

Java クライアントの各関数は「 Builder パターン」で設計されています。 このパターンは複雑なクエリ オブジェクトを構築するために使用されます。 つまり、（ RESTful の GET リクエストに似たリクエストで Weaviate からデータを取得する場合や、より複雑な GraphQL クエリを行う場合など）1 つ 1 つのオブジェクトを組み合わせて関数を構築し、複雑さを低減します。 ビルダー オブジェクトの中にはオプションのものもあれば、特定の機能を実行するために必須のものもあります。 詳細は [RESTful API リファレンス](/weaviate/api/rest) と [GraphQL リファレンス](../api/graphql/index.md) に記載されています。

上記のコード スニペットは、`RESTful GET /v1/meta` に相当するシンプルなクエリを示しています。 クライアントはパッケージをインポートし、起動中のインスタンスへ接続することで初期化します。 その後、`.misc()` に対して `.metaGetter()` を呼び出してクエリを構築します。 クエリは `.run()` 関数で送信されるため、このオブジェクトは作成して実行したいすべての関数で必須になります。

## 移行ガイド

### `3.x.x` から `4.0.0` への移行

#### `technology.semi.weaviate` から `io.weaviate` パッケージへ移動

Before:
```java
package technology.semi.weaviate;
import technology.semi.weaviate.client.*;
```

After:
```java
package io.weaviate;
import io.weaviate.client.*;
```

### `2.4.0` から `3.0.0` への移行

#### 非推奨 (@Deprecated) メソッド `Aggregate::withFields(Fields fields)` を削除

Before:
```java
// import io.weaviate.client.v1.graphql.query.fields.Field;
// import io.weaviate.client.v1.graphql.query.fields.Fields;

Fields fields = Fields.builder().fields(new Field[]{name, description}).build();
client.graphQL().aggregate().withFields(fields)...
```

After:
```java
client.graphQL().aggregate().withFields(name, description)...
```

#### 非推奨 (@Deprecated) メソッド `Get::withFields(Fields fields)` を削除

Before:
```java
// import io.weaviate.client.v1.graphql.query.fields.Field;
// import io.weaviate.client.v1.graphql.query.fields.Fields;

Fields fields = Fields.builder().fields(new Field[]{name, description}).build();
client.graphQL().get().withFields(fields)...
```

After:
```java
client.graphQL().get().withFields(name, description)...
```

#### 非推奨 (@Deprecated) メソッド `Get::withNearVector(Float[] vector)` を削除

Before:
```java
client.graphQL().get().withNearVector(new Float[]{ 0f, 1f, 0.8f })...
```

After:
```java
// import io.weaviate.client.v1.graphql.query.argument.NearVectorArgument;

NearVectorArgument nearVector = NearVectorArgument.builder().vector(new Float[]{ 0f, 1f, 0.8f }).certainty(0.8f).build();
client.graphQL().get().withNearVector(nearVector)...
```

#### すべての `where` フィルターが同一実装を使用

`batch delete` 機能の導入に伴い、`filters.WhereFilter` の統一実装が追加され、`classifications.WhereFilter`、`graphql.query.argument.WhereArgument`、`graphql.query.argument.WhereFilter` を置き換えました。

##### GraphQL

Before:
```java
// import io.weaviate.client.v1.graphql.query.argument.GeoCoordinatesParameter;
// import io.weaviate.client.v1.graphql.query.argument.WhereArgument;
// import io.weaviate.client.v1.graphql.query.argument.WhereOperator;

GeoCoordinatesParameter geo = GeoCoordinatesParameter.builder()
    .latitude(50.51f)
    .longitude(0.11f)
    .maxDistance(3000f)
    .build();
WhereArgument where = WhereArgument.builder()
    .valueGeoRange(geo)
    .operator(WhereOperator.WithinGeoRange)
    .path(new String[]{ "add "})
    .build();

client.graphQL().aggregate().withWhere(where)...
```

After:
```java
// import io.weaviate.client.v1.filters.Operator;
// import io.weaviate.client.v1.filters.WhereFilter;

WhereFilter where = WhereFilter.builder()
    .valueGeoRange(WhereFilter.GeoRange.builder()
        .geoCoordinates(WhereFilter.GeoCoordinates.builder()
            .latitude(50.51f)
            .longitude(0.11f)
            .build()
        )
        .distance(WhereFilter.GeoDistance.builder()
            .max(3000f)
            .build()
        )
        .build()
    )
    .operator(Operator.WithinGeoRange)
    .path(new String[]{ "add" })
    .build();

client.graphQL().aggregate().withWhere(where)...
```

Before:
```java
// import io.weaviate.client.v1.graphql.query.argument.WhereArgument;
// import io.weaviate.client.v1.graphql.query.argument.WhereOperator;

WhereArgument where = WhereArgument.builder()
    .valueText("txt")
    .operator(WhereOperator.Equal)
    .path(new String[]{ "add" })
    .build();

client.graphQL().aggregate().withWhere(where)...
```

After:
```java
// import io.weaviate.client.v1.filters.Operator;
// import io.weaviate.client.v1.filters.WhereFilter;

WhereFilter where = WhereFilter.builder()
    .valueText("txt")
    .operator(Operator.Equal)
    .path(new String[]{ "add" })
    .build();

client.graphQL().aggregate().withWhere(where)...
```

Before:
```java
// import io.weaviate.client.v1.graphql.query.argument.WhereArgument;
// import io.weaviate.client.v1.graphql.query.argument.WhereFilter;
// import io.weaviate.client.v1.graphql.query.argument.WhereOperator;

WhereArgument where = WhereArgument.builder()
    .operands(new WhereFilter[]{
        WhereFilter.builder()
            .valueInt(10)
            .path(new String[]{ "wordCount" })
            .operator(WhereOperator.LessThanEqual)
            .build(),
        WhereFilter.builder()
            .valueText("word")
            .path(new String[]{ "word" })
            .operator(WhereOperator.LessThan)
            .build()
    })
    .operator(WhereOperator.And)
    .build();

client.graphQL().aggregate().withWhere(where)...
```

After:
```java
// import io.weaviate.client.v1.filters.Operator;
// import io.weaviate.client.v1.filters.WhereFilter;

WhereFilter where = WhereFilter.builder()
    .operands(new WhereFilter[]{
        WhereFilter.builder()
            .valueInt(10)
            .path(new String[]{ "wordCount" })
            .operator(Operator.LessThanEqual)
            .build(),
        WhereFilter.builder()
            .valueText("word")
            .path(new String[]{ "word" })
            .operator(Operator.LessThan)
            .build(),
    })
    .operator(Operator.And)
    .build();

client.graphQL().aggregate().withWhere(where)...
```

##### 分類

Before:
```java
// import io.weaviate.client.v1.classifications.model.GeoCoordinates;
// import io.weaviate.client.v1.classifications.model.Operator;
// import io.weaviate.client.v1.classifications.model.WhereFilter;
// import io.weaviate.client.v1.classifications.model.WhereFilterGeoRange;
// import io.weaviate.client.v1.classifications.model.WhereFilterGeoRangeDistance;

WhereFilter where = WhereFilter.builder()
    .valueGeoRange(WhereFilterGeoRange.builder()
        .geoCoordinates(GeoCoordinates.builder()
            .latitude(50.51f)
            .longitude(0.11f)
            .build())
        .distance(WhereFilterGeoRangeDistance.builder()
            .max(3000d)
            .build())
        .build())
    .operator(Operator.WithinGeoRange)
    .path(new String[]{ "geo" })
    .build();

client.classifications().scheduler().withTrainingSetWhereFilter(where)...
```

After:
```java
// import io.weaviate.client.v1.filters.Operator;
// import io.weaviate.client.v1.filters.WhereFilter;

WhereFilter where = WhereFilter.builder()
    .valueGeoRange(WhereFilter.GeoRange.builder()
        .geoCoordinates(WhereFilter.GeoCoordinates.builder()
            .latitude(50.51f)
            .longitude(0.11f)
            .build())
        .distance(WhereFilter.GeoDistance.builder()
            .max(3000f)
            .build())
        .build())
    .operator(Operator.WithinGeoRange)
    .path(new String[]{ "geo" })
    .build();

client.classifications().scheduler().withTrainingSetWhereFilter(where)...
```

## リリース

Java クライアント ライブラリのリリース履歴については、[GitHub のリリース ページ](https://github.com/weaviate/java-client/releases) をご覧ください。

<details>
  <summary>Weaviate と対応するクライアント バージョンの表を表示</summary>

import ReleaseHistory from '/_includes/release-history.md';

<ReleaseHistory />

</details>

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

