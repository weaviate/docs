---
title: Go
sidebar_position: 70
description: Weaviate を Go アプリケーションやサービスに統合するための公式 Go クライアントライブラリのドキュメント。
image: og/docs/client-libraries.jpg
# tags: ['go', 'client library']
---

import QuickLinks from "/src/components/QuickLinks";

export const goCardsData = [
  {
  title: "weaviate/weaviate-go-client",
  link: "https://github.com/weaviate/weaviate-go-client",
  icon: "fa-brands fa-github",
  },
];

:::note Go client (SDK)

最新の Go クライアントはバージョン `v||site.go_client_version||` です。

<QuickLinks items={goCardsData} />

:::

Weaviate Go クライアントは Go 1.16+ と互換性があります。

## インストール
クライアントは旧式の Go modules システムをサポートしていません。Weaviate クライアントをインポートする前に、コード用のリポジトリを作成してください。

リポジトリを作成します:

```bash
go mod init github.com/weaviate-go-client
go mod tidy
```

最新の安定版 Go クライアントライブラリを取得するには、次を実行します:

```bash
go get github.com/weaviate/weaviate-go-client/v4
```

## 例

この例では、Weaviate インスタンスへ接続し、スキーマを取得します:

``` go
package main

import (
	"context"
	"fmt"
	"github.com/weaviate/weaviate-go-client/v5/weaviate"
)

func GetSchema() {
    cfg := weaviate.Config{
        Host:   "localhost:8080",
		  Scheme: "http",
    }
    client, err := weaviate.NewClient(cfg)
    if err != nil {
        panic(err)
    }

    schema, err := client.Schema().Getter().Do(context.Background())
    if err != nil {
        panic(err)
    }
    fmt.Printf("%v", schema)
}

func main() {
   GetSchema()
}
```

## 認証

import ClientAuthIntro from '/docs/weaviate/client-libraries/_components/client.auth.introduction.mdx'

<ClientAuthIntro clientName="Go"/>

### WCD 認証

import ClientAuthWCD from '/docs/weaviate/client-libraries/_components/client.auth.wcs.mdx'

<ClientAuthWCD />

### API キー認証

:::info Weaviate Go クライアントバージョン `4.7.0` で追加されました。
:::

import ClientAuthApiKey from '/docs/weaviate/client-libraries/_components/client.auth.api.key.mdx'

<ClientAuthApiKey />


```go
cfg := weaviate.Config{
	Host:       "weaviate.example.com",
	Scheme:     "http",
	AuthConfig: auth.ApiKey{Value: "my-secret-key"},
	Headers:    nil,
}
client, err := weaviate.NewClient(cfg)
if err != nil{
  fmt.Println(err)
}
```

### OIDC 認証

import ClientAuthOIDCIntro from '/docs/weaviate/client-libraries/_components/client.auth.oidc.introduction.mdx'

<ClientAuthOIDCIntro />

#### <i class="fa-solid fa-key"></i> リソースオーナー パスワードフロー

import ClientAuthFlowResourceOwnerPassword from '/docs/weaviate/client-libraries/_components/client.auth.flow.resource.owner.password.mdx'

<ClientAuthFlowResourceOwnerPassword />

```go
cfg := weaviate.Config{
	Host:   "weaviate.example.com",
	Scheme: "http",
	AuthConfig: auth.ResourceOwnerPasswordFlow{
		Username: "Your user",
		Password: "Your password",
		Scopes:   []string{"offline_access"}, // optional, depends on the configuration of your identity provider (not required with WCD)
	},
	Headers: nil,
}
client, err := weaviate.NewClient(cfg)
if err != nil{
	fmt.Println(err)
}
```

#### <i class="fa-solid fa-key"></i> クライアントクレデンシャルフロー

import ClientAuthFlowClientCredentials from '/docs/weaviate/client-libraries/_components/client.auth.flow.client.credentials.mdx'

<ClientAuthFlowClientCredentials />

```go
cfg := weaviate.Config{
	Host:   "weaviate.example.com",
	Scheme: "http",
	AuthConfig: auth.ClientCredentials{
		ClientSecret: "your_client_secret",
		Scopes:       []string{"scope1 scope2"}, // optional, depends on the configuration of your identity provider (not required with WCD)
	},
	Headers: nil,
}
client, err := weaviate.NewClient(cfg)
if err != nil{
	fmt.Println(err)
}
```

#### <i class="fa-solid fa-key"></i> リフレッシュトークンフロー

import ClientAuthBearerToken from '/docs/weaviate/client-libraries/_components/client.auth.bearer.token.mdx'

<ClientAuthBearerToken />

```go
cfg := weaviate.Config{
	Host:   "weaviate.example.com",
	Scheme: "http",
	AuthConfig: auth.BearerToken{
		AccessToken:  "some token",
		RefreshToken: "other token",
		ExpiresIn:    uint(500), // in seconds
	},
	Headers: nil,
}
client, err := weaviate.NewClient(cfg)
if err != nil{
	fmt.Println(err)
}
```

## カスタムヘッダー

初期化時に追加されるカスタムヘッダーをクライアントに渡すことができます:

```go
cfg := weaviate.Config{
  Host:"weaviate.example.com",
  Scheme: "http",
  AuthConfig: nil,
  Headers: map[string]string{
    "header_key1": "value",
    "header_key2": "otherValue",
    },
}
client, err := weaviate.NewClient(cfg)
if err != nil{
  fmt.Println(err)
}
```

## リファレンス

Go クライアントでカバーされているすべての [RESTful エンドポイント](/weaviate/api/rest) と [GraphQL 関数](/weaviate/api) のリファレンスは、これらのリファレンスページ上のコードブロックで解説されています。

## 設計

### ビルダー・パターン

Go クライアントの関数は「ビルダー・パターン」で設計されています。これは複雑なクエリオブジェクトを構築するためのパターンです。たとえば、RESTful の GET リクエストに近いデータ取得や、より複雑な GraphQL クエリのリクエストを行う関数は、複数のオブジェクトを組み合わせて構築され、複雑さを軽減します。ビルダーオブジェクトにはオプションのものと必須のものがあり、すべて [RESTful API リファレンスページ](/weaviate/api/rest) と [GraphQL リファレンスページ](/weaviate/api) にドキュメントがあります。

上記のコードスニペットは `RESTful GET /v1/schema` に類似したシンプルなクエリを示しています。まずパッケージを読み込み、実行中のインスタンスへ接続してクライアントを初期化します。その後、`.Getter()` で `.Schema` を取得してクエリを構築します。クエリは `.Go()` 関数で送信されます。このオブジェクトは、構築して実行したいすべての関数で必須です。

## 移行ガイド

### `v2` から `v4` への移行

#### 不要な `.Objects()` の削除

Before:

```go
client.GraphQL().Get().Objects().WithClassName...
```

After:

```go
client.GraphQL().Get().WithClassName
```

#### GraphQL `Get().WithNearVector()` のビルダーパターン化

`v2` では `client.GraphQL().Get()` に `nearVector` 引数を指定する際、文字列を渡す必要がありました。そのため、ユーザーは GraphQL API の構造を理解している必要がありました。`v4` では次のようにビルダーパターンを採用してこの問題を解決しています。

Before:

```go
client.GraphQL().Get().
  WithNearVector("{vector: [0.1, -0.2, 0.3]}")...
```

After

```go
nearVector := client.GraphQL().NearVectorArgBuilder().
  WithVector([]float32{0.1, -0.2, 0.3})

client.GraphQL().Get().
  WithNearVector(nearVector)...
```

#### すべての `where` フィルターが同一のビルダーを使用

`v2` ではフィルターの指定方法が文字列だったり構造化されていたりとまちまちでした。`v4` では統一され、常に同じビルダーパターンを使用できます。

##### GraphQL Get

Before:

```go
// using filter encoded as string
where := `where :{
  operator: Equal
  path: ["id"]
  valueText: "5b6a08ba-1d46-43aa-89cc-8b070790c6f2"
}`

client.GraphQL().Get().
  Objects().
  WithWhere(where)...
```

```go
// using deprecated graphql arg builder
where := client.GraphQL().WhereArgBuilder().
  WithOperator(graphql.Equal).
  WithPath([]string{"id"}).
  WithValueString("5b6a08ba-1d46-43aa-89cc-8b070790c6f2")

client.GraphQL().Get().
  Objects().
  WithWhere(where)...
```

After:

```go
where := filters.Where().
  WithPath([]string{"id"}).
  WithOperator(filters.Equal).
  WithValueString("5b6a08ba-1d46-43aa-89cc-8b070790c6f2")

client.GraphQL().Get().
  WithWhere(where)...
```

##### GraphQL Aggregate

Before:

```go
where := client.GraphQL().WhereArgBuilder().
  WithPath([]string{"id"}).
  WithOperator(graphql.Equal).
  WithValueString("5b6a08ba-1d46-43aa-89cc-8b070790c6f2")

client.GraphQL().Aggregate().
  Objects().
  WithWhere(where)...
```

After:

```go
where := filters.Where().
  WithPath([]string{"id"}).
  WithOperator(filters.Equal).
  WithValueString("5b6a08ba-1d46-43aa-89cc-8b070790c6f2")

client.GraphQL().Aggregate().
  WithWhere(where)...
```

##### Classification

Before:

```go
valueInt := 100
valueText  := "Government"

sourceWhere := &models.WhereFilter{
  ValueInt: &valueInt,
  Operator: string(graphql.GreaterThan),
  Path:     []string{"wordCount"},
}

targetWhere := &models.WhereFilter{
  ValueString: &valueText,
  Operator:    string(graphql.NotEqual),
  Path:        []string{"name"},
}

client.Classifications().Scheduler().
  WithSourceWhereFilter(sourceWhere).
  WithTargetWhereFilter(targetWhere)...
```

After:

```go
sourceWhere := filters.Where().
  WithOperator(filters.GreaterThan).
  WithPath([]string{"wordCount"}).
  WithValueInt(100)

targetWhere := filters.Where().
  WithOperator(filters.NotEqual).
  WithPath([]string{"name"}).
  WithValueString("Government")

client.Classifications().Scheduler().
  WithSourceWhereFilter(sourceWhere).
  WithTargetWhereFilter(targetWhere)...
```

#### GraphQL `Get().WithFields()`

`v2` の `.WithFields()` は GraphQL 文字列を受け取り、GraphQL フィールド構造の理解が必要でした。現在は可変長引数の関数で指定できます。例:

Before:

```go
client.GraphQL.Get().WithClassName("MyClass").WithFields("name price age")...
```

After:

```go
client.GraphQL.Get().WithClassName("MyClass").
  WithFields(graphql.Field{Name: "name"},graphql.Field{Name: "price"}, graphql.Field{Name: "age"})...
```

#### GraphQL `Get().WithGroup()`

`v2` の `.WithGroup()` は GraphQL 文字列を受け取り、GraphQL フィールド構造の理解が必要でした。現在はビルダーで指定できます。例:

Before:

```go
client.GraphQL.Get().WithClassName("MyClass")
  .WithGroup("{type:merge force:1.0}")
```

After:

```go
group := client.GraphQL().GroupArgBuilder()
  .WithType(graphql.Merge).WithForce(1.0)

client.GraphQL.Get().WithClassName("MyClass").WithGroup(group)
```

#### GraphQL `Data().Validator()` プロパティのリネーム

`v2` ではスキーマを指定するメソッド名がクライアントの他の場所と一貫していませんでした。`v4` で修正されています。以下のようにリネームしてください。

Before:
```go
client.Data().Validator().WithSchema(properties)
```

After:
```go
client.Data().Validator().WithProperties(properties)
```

## リリース

Go のクライアントライブラリのリリース履歴は、[GitHub releases ページ](https://github.com/weaviate/weaviate-go-client/releases)をご覧ください。

<details>
  <summary>Weaviate と対応クライアントバージョンの一覧はこちらをクリック</summary>

import ReleaseHistory from '/_includes/release-history.md';

<ReleaseHistory />

</details>

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

