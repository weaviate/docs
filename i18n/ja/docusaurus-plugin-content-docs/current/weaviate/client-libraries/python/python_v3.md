---
title: "レガシー (v3) API (非推奨)"
sidebar_position: 80
description: "レガシーアプリケーションの互換性維持のみを目的とした、非推奨の Python v3 クライアント向けドキュメントです。"
image: og/docs/client-libraries.jpg
# tags: ['python', 'client library']
---

:::caution `v3` client is deprecated
このドキュメントはレガシーである `v3` クライアントおよび API に関するものです。  
<br/>

`v4.10.0` 以降、[Weaviate Python クライアントのインストール](https://pypi.org/project/weaviate-client/)には `v3` API（つまり `weaviate.Client` クラス）が含まれません。これにより、開発者体験を最適化し、最新の Weaviate 機能をサポートできるようになりました。  
<br/>

`v3` クライアントには、今後もしばらくの間は重大なセキュリティアップデートとバグ修正が提供されますが、新機能の追加は行われません。  
<br/>

**これは何を意味するのでしょうか？**  
<br/>

最新の Weaviate Database の開発成果を利用するために、コードベースを [`v4` クライアント API](./index.mdx) へ移行することを推奨します。  
<br/>

ドキュメントには[移行ガイド](./v3_v4_migration.md)があり、多くのコード例で `v3` と `v4` の構文を併記しています。今後も移行を容易にする専用リソースを追加していく予定です。  
<br/>

既存のコードベースと Weaviate Database を当面変更しない予定の場合は、`requirements.txt` などの要件ファイルでバージョンを固定してください。例:

```bash
  weaviate-client>=3.26.7,<4.0.0
```

コード移行は手間がかかることがありますが、最終的な体験と機能セットがその価値を十分に上回ると確信しています。  
<br/>

移行ドキュメントやリソースに関する具体的な要望がございましたら、[GitHub リポジトリ](https://github.com/weaviate/docs/issues)までお気軽にお知らせください。
:::

## インストールとセットアップ

### 要件

`v3` クライアントは、Weaviate `1.22` で導入された gRPC API とは併用できません。Weaviate `1.22` 以降でも `v3` クライアントを使用できますが、gRPC API による改善の恩恵は受けられません。gRPC API を利用する場合は `v4` クライアントをご使用ください。

### インストール

`v3` Python ライブラリは [PyPI.org](https://pypi.org/project/weaviate-client/) で利用可能です。パッケージは [pip](https://pypi.org/project/pip/) を使用してインストールできます。クライアントは Python 3.7 以上で開発・テストされています。

```bash
pip install "weaviate-client==3.*"
```

### セットアップ

Python スクリプト内では次のようにクライアントを使用できます。

```python
import weaviate

client = weaviate.Client("https://WEAVIATE_INSTANCE_URL")  # Replace WEAVIATE_INSTANCE_URL with your instance URL.

assert client.is_ready()  # Will return True if the client is connected & the server is ready to accept requests
```

あるいは、以下のような追加引数を指定することも可能です。

```python
import weaviate

client = weaviate.Client(
  url="https://WEAVIATE_INSTANCE_URL",  # URL of your Weaviate instance
  auth_client_secret=auth_config,  # (Optional) If the Weaviate instance requires authentication
  timeout_config=(5, 15),  # (Optional) Set connection timeout & read timeout time in seconds
  additional_headers={  # (Optional) Any additional headers; e.g. keys for API inference services
    "X-Cohere-Api-Key": "YOUR-COHERE-API-KEY",            # Replace with your Cohere key
    "X-HuggingFace-Api-Key": "YOUR-HUGGINGFACE-API-KEY",  # Replace with your Hugging Face key
    "X-OpenAI-Api-Key": "YOUR-OPENAI-API-KEY",            # Replace with your OpenAI key
  }
)

assert client.is_ready()  # Will return True if the client is connected & the server is ready to accept requests
```

## 認証

import ClientAuthIntro from '/docs/weaviate/client-libraries/_components/client.auth.introduction.mdx'

<ClientAuthIntro clientName="Python"/>

### WCD 認証

import ClientAuthWCD from '/docs/weaviate/client-libraries/_components/client.auth.wcs.mdx'

<ClientAuthWCD />

### API キー認証

:::info Weaviate Python クライアント バージョン `3.14.0` で追加されました。
:::

import ClientAuthApiKey from '/docs/weaviate/client-libraries/_components/client.auth.api.key.mdx'

<ClientAuthApiKey />

```python
import weaviate

auth_config = weaviate.auth.AuthApiKey(api_key="YOUR-WEAVIATE-API-KEY")  # Replace with your Weaviate instance API key

# Instantiate the client with the auth config
client = weaviate.Client(
    url="https://WEAVIATE_INSTANCE_URL",  # Replace with your Weaviate endpoint
    auth_client_secret=auth_config
)
```

### OIDC 認証

import ClientAuthOIDCIntro from '/docs/weaviate/client-libraries/_components/client.auth.oidc.introduction.mdx'

<ClientAuthOIDCIntro />

#### <i class="fa-solid fa-key"></i> Resource Owner Password フロー

import ClientAuthFlowResourceOwnerPassword from '/docs/weaviate/client-libraries/_components/client.auth.flow.resource.owner.password.mdx'

<ClientAuthFlowResourceOwnerPassword />

```python
import weaviate

resource_owner_config = weaviate.AuthClientPassword(
  username = "user",
  password = "pass",
  scope = "offline_access" # optional, depends on the configuration of your identity provider (not required with WCD)
  )

# Initiate the client with the auth config
client = weaviate.Client("http://localhost:8080", auth_client_secret=resource_owner_config)
```

#### <i class="fa-solid fa-key"></i> Client Credentials フロー

import ClientAuthFlowClientCredentials from '/docs/weaviate/client-libraries/_components/client.auth.flow.client.credentials.mdx'

<ClientAuthFlowClientCredentials />

```python
import weaviate

client_credentials_config = weaviate.AuthClientCredentials(
  client_secret = "client_secret",
  scope = "scope1 scope2" # optional, depends on the configuration of your identity provider (not required with WCD)
  )

# Initiate the client with the auth config
client = weaviate.Client("https://localhost:8080", auth_client_secret=client_credentials_config)
```

#### <i class="fa-solid fa-key"></i> Refresh Token フロー

import ClientAuthBearerToken from '/docs/weaviate/client-libraries/_components/client.auth.bearer.token.mdx'

<ClientAuthBearerToken />

```python
import weaviate

bearer_config = weaviate.AuthBearerToken(
  access_token="some token"
  expires_in=300 # in seconds, by default 60s
  refresh_token="other token" # Optional
)

# Initiate the client with the auth config
client = weaviate.Client("https://localhost:8080", auth_client_secret=bearer_config)
```

## カスタムヘッダー

クライアント初期化時にカスタムヘッダーを渡すことができます。

```python
client = weaviate.Client(
  url="https://localhost:8080",
  additional_headers={"HeaderKey": "HeaderValue"},
)
```

## ニューラル検索フレームワーク

Weaviate を基盤としてベクトルを保存・検索・取得する多様なニューラル検索フレームワークがあります。

- deepset の [haystack](https://www.deepset.ai/weaviate-vector-search-engine-integration)  
- Jina の [DocArray](https://github.com/docarray/docarray)



# 参照ドキュメント

この Weaviate ドキュメントサイトでは、すべての RESTful エンドポイントおよび GraphQL 関数を Python クライアントで利用する方法をご覧いただけます。各リファレンスには、Python（およびその他）のクライアントでその関数を使用する例を示したコードブロックが含まれています。とはいえ、Python クライアントには追加機能もあり、これらは weaviate-python-client.readthedocs.io にある完全版クライアントドキュメントで説明されています。以下では、そのうちいくつかの機能を紹介します。

### 例: client.schema.create(schema)

RESTful の `v1/schema` エンドポイントを使用してクラスを 1 つずつ追加する代わりに、Python クライアントを使って JSON 形式のスキーマ全体を一度にアップロードできます。次のように `client.schema.create(schema)` 関数を使用してください:

```python
import weaviate

client = weaviate.Client("http://localhost:8080")

schema = {
  "classes": [{
    "class": "Publication",
    "description": "A publication with an online source",
    "properties": [
      {
        "dataType": [
          "text"
        ],
        "description": "Name of the publication",
        "name": "name"
      },
      {
        "dataType": [
          "Article"
        ],
        "description": "The articles this publication has",
        "name": "hasArticles"
      },
      {
        "dataType": [
            "geoCoordinates"
        ],
        "description": "Geo location of the HQ",
        "name": "headquartersGeoLocation"
      }
    ]
  }, {
    "class": "Article",
    "description": "A written text, for example a news article or blog post",
    "properties": [
      {
        "dataType": [
          "text"
        ],
        "description": "Title of the article",
        "name": "title"
      },
      {
        "dataType": [
          "text"
        ],
        "description": "The content of the article",
        "name": "content"
      }
    ]
  }, {
    "class": "Author",
    "description": "The writer of an article",
    "properties": [
      {
        "dataType": [
            "text"
        ],
        "description": "Name of the author",
        "name": "name"
      },
      {
        "dataType": [
            "Article"
        ],
        "description": "Articles this author wrote",
        "name": "wroteArticles"
      },
      {
        "dataType": [
            "Publication"
        ],
        "description": "The publication this author writes for",
        "name": "writesFor"
      }
    ]
  }]
}

client.schema.create(schema)
```

#### 例: Weaviate と Python クライアントの入門ブログポスト

Weaviate の Python クライアントを使ったフル例は、[この Towards Data Science の記事](https://towardsdatascience.com/quickstart-with-weaviate-python-client-e85d14f19e4f)でご覧いただけます。

## バッチ処理

バッチ処理とは、単一の API リクエストで `objects` と `references` を一括でインポート／作成する方法です。Python では次の 3 つの方法を利用できます。

1. ***Auto-batching***
2. ***Dynamic-batching***
3. ***Manual-batching***

一般的には、コンテキストマネージャ内で `client.batch` を使用することを推奨します。コンテキストを抜ける際に自動でフラッシュされるため、最も簡単にバッチ機能を利用できます。

バッチインポート速度に最も影響する主なパラメーターは次のとおりです。

| Parameter | Type | 推奨<br/>値 | 目的 |
| :- | :- | :- | :- |
| `batch_size` | integer | 50 - 200 | 初期バッチサイズ |
| `num_workers` | integer | 1 - 2 | 同時実行ワーカーの最大数 |
| `dynamic` | boolean | True | `batch_size` に基づきバッチサイズを動的に調整するか |

### マルチスレッドバッチインポート

:::info Weaviate Python クライアント バージョン `3.9.0` で追加されました。
:::

マルチスレッドバッチインポートは `Auto-batching` と `Dynamic-batching` の両方で動作します。

利用するには、`.configure(...)`（`.__call__(...)` と同じ）でバッチ設定の引数 `num_workers` にワーカー（スレッド）の数を指定します。詳しくは後述の [Batch configuration](#batch-configuration) をご覧ください。

:::warning
マルチスレッドはデフォルトでは無効（`num_workers=1`）です。ご利用の Weaviate インスタンスを過負荷にしないようご注意ください。
:::

**Example**

```python
client.batch(  # or client.batch.configure(
  batch_size=100,
  dynamic=True,
  num_workers=4,
)
```

### Auto-batching

この方法では、Python クライアントが `object` と `reference` のインポート／作成をすべて処理します。つまり、オブジェクトやクロスリファレンスを明示的に作成する必要はありません。インポート／作成したいものをすべて `Batch` に追加するだけで、`Batch` がオブジェクトとクロスリファレンスの作成を行います。Auto-batching を有効にするには、`batch_size` を正の整数（デフォルトは `None`）に設定します（詳細は [Batch configuration](#batch-configuration) を参照）。`Batch` は「オブジェクト数 + リファレンス数 == `batch_size`」になったタイミングで、オブジェクトを作成し、その後クロスリファレンスを作成します。例を以下に示します。

```python
import weaviate
from weaviate.util import generate_uuid5
client = weaviate.Client("http://localhost:8080")

# create schema
schema = {
  "classes": [
    {
      "class": "Author",
      "properties": [
        {
          "name": "name",
          "dataType": ["text"]
        },
        {
          "name": "wroteBooks",
          "dataType": ["Book"]
        }
      ]
    },
    {
      "class": "Book",
      "properties": [
        {
          "name": "title",
          "dataType": ["text"]
        },
        {
          "name": "ofAuthor",
          "dataType": ["Author"]
        }
      ]
    }
  ]
}

client.schema.create(schema)

author = {
  "name": "Jane Doe",
}
book_1 = {
  "title": "Jane's Book 1"
}
book_2 = {
  "title": "Jane's Book 2"
}

client.batch.configure(
  batch_size=5, # int value for batch_size enables auto-batching, see Batch configuration section below
)

with client.batch as batch:
  # add author
  uuid_author = generate_uuid5(author, "Author")
  batch.add_data_object(
    data_object=author,
    class_name="Author",
    uuid=uuid_author,
  )
  # add book_1
  uuid_book_1 = generate_uuid5(book_1, "Book")
  batch.add_data_object(
    data_object=book_1,
    class_name="Book",
    uuid=uuid_book_1,
  )
  # add references author ---> book_1
  batch.add_reference(
    from_object_uuid=uuid_author,
    from_object_class_name="Author",
    from_property_name="wroteBooks",
    to_object_uuid=uuid_book_1,
    to_object_class_name="Book",
  )
  # add references author <--- book_1
  batch.add_reference(
    from_object_uuid=uuid_book_1,
    from_object_class_name="Book",
    from_property_name="ofAuthor",
    to_object_uuid=uuid_author,
    to_object_class_name="Author",
  )
  # add book_2
  uuid_book_2 = generate_uuid5(book_2, "Book")
  batch.add_data_object(
    data_object=book_2,
    class_name="Book",
    uuid=uuid_book_2,
  )
  # add references author ---> book_2
  batch.add_reference(
    from_object_uuid=uuid_author,
    from_object_class_name="Author",
    from_property_name="wroteBooks",
    to_object_uuid=uuid_book_2,
    to_object_class_name="Book",
  )
  # add references author <--- book_2
  batch.add_reference(
    from_object_uuid=uuid_book_2,
    from_object_class_name="Book",
    from_property_name="ofAuthor",
    to_object_uuid=uuid_author,
    to_object_class_name="Author",
  )

# NOTE: When exiting context manager the method `batch.flush()` is called
# done, everything is imported/created
```

### Dynamic-batching

この方法も、Python クライアントがオブジェクトとクロスリファレンスのインポート／作成を動的に処理します（[Auto-batching](#auto-batching) と同様、ユーザーが明示的に行う必要はありません）。Dynamic-batching を有効にするには、`batch_size` を正の整数（デフォルトは `None`）に設定し、さらに `dynamic` を `True`（デフォルトは `False`）にします（詳細は [Batch configuration](#batch-configuration) を参照）。この方法では、最初の `Batch` 作成後に `recommended_num_objects` と `recommended_num_references` が計算され、その初期値として `batch_size` が使用されます。`Batch` は現在のオブジェクト数が `recommended_num_objects` に達するか、リファレンス数が `recommended_num_references` に達した時点で、オブジェクトまたはリファレンスを作成します。例を以下に示します。

```python
import weaviate
from weaviate.util import generate_uuid5
client = weaviate.Client("http://localhost:8080")

# create schema
schema = {
  "classes": [
    {
      "class": "Author",
      "properties": [
        {
          "name": "name",
          "dataType": ["text"]
        },
        {
          "name": "wroteBooks",
          "dataType": ["Book"]
        }
      ]
    },
    {
      "class": "Book",
      "properties": [
        {
          "name": "title",
          "dataType": ["text"]
        },
        {
          "name": "ofAuthor",
          "dataType": ["Author"]
        }
      ]
    }
  ]
}

client.schema.create(schema)

author = {
  "name": "Jane Doe",
}
book_1 = {
  "title": "Jane's Book 1"
}
book_2 = {
  "title": "Jane's Book 2"
}

client.batch.configure(
  batch_size=5, # int value for batch_size enables auto-batching, see Batch configuration section below
  dynamic=True, # makes it dynamic
)

with client.batch as batch:
  # add author
  uuid_author = generate_uuid5(author, "Author")
  batch.add_data_object(
    data_object=author,
    class_name="Author",
    uuid=uuid_author,
  )
  # add book_1
  uuid_book_1 = generate_uuid5(book_1, "Book")
  batch.add_data_object(
    data_object=book_1,
    class_name="Book",
    uuid=uuid_book_1,
  )
  # add references author ---> book_1
  batch.add_reference(
    from_object_uuid=uuid_author,
    from_object_class_name="Author",
    from_property_name="wroteBooks",
    to_object_uuid=uuid_book_1,
    to_object_class_name="Book",
  )
  # add references author <--- book_1
  batch.add_reference(
    from_object_uuid=uuid_book_1,
    from_object_class_name="Book",
    from_property_name="ofAuthor",
    to_object_uuid=uuid_author,
    to_object_class_name="Author",
  )
  # add book_2
  uuid_book_2 = generate_uuid5(book_2, "Book")
  batch.add_data_object(
    data_object=book_2,
    class_name="Book",
    uuid=uuid_book_2,
  )
  # add references author ---> book_2
  batch.add_reference(
    from_object_uuid=uuid_author,
    from_object_class_name="Author",
    from_property_name="wroteBooks",
    to_object_uuid=uuid_book_2,
    to_object_class_name="Book",
  )
  # add references author <--- book_2
  batch.add_reference(
    from_object_uuid=uuid_book_2,
    from_object_class_name="Book",
    from_property_name="ofAuthor",
    to_object_uuid=uuid_author,
    to_object_class_name="Author",
  )
# NOTE: When exiting context manager the method `batch.flush()` is called
# done, everything is imported/created
```

### Manual-batching

この方法では、`Batch` の操作をすべてユーザーが制御します。つまり、`Batch` はインポート／作成を自動では行わず、全てユーザーに委ねます。例を以下に示します。

```python
import weaviate
from weaviate.util import generate_uuid5
client = weaviate.Client("http://localhost:8080")

# create schema
schema = {
  "classes": [
    {
      "class": "Author",
      "properties": [
        {
          "name": "name",
          "dataType": ["text"]
        },
        {
          "name": "wroteBooks",
          "dataType": ["Book"]
        }
      ]
    },
    {
      "class": "Book",
      "properties": [
        {
          "name": "title",
          "dataType": ["text"]
        },
        {
          "name": "ofAuthor",
          "dataType": ["Author"]
        }
      ]
    }
  ]
}

client.schema.create(schema)

author = {
  "name": "Jane Doe",
}
book_1 = {
  "title": "Jane's Book 1"
}
book_2 = {
  "title": "Jane's Book 2"
}

client.batch.configure(
  batch_size=None, # None disable any automatic functionality
)

with client.batch as batch:
  # add author
  uuid_author = generate_uuid5(author, "Author")
  batch.add_data_object(
    data_object=author,
    class_name="Author",
    uuid=uuid_author,
  )
  # add book_1
  uuid_book_1 = generate_uuid5(book_1, "Book")
  batch.add_data_object(
    data_object=book_1,
    class_name="Book",
    uuid=uuid_book_1,
  )
  result = batch.create_objects()  # <----- implicit object creation

  # add references author ---> book_1
  batch.add_reference(
    from_object_uuid=uuid_author,
    from_object_class_name="Author",
    from_property_name="wroteBooks",
    to_object_uuid=uuid_book_1,
    to_object_class_name="Book",
  )
  # add references author <--- book_1
  batch.add_reference(
    from_object_uuid=uuid_book_1,
    from_object_class_name="Book",
    from_property_name="ofAuthor",
    to_object_uuid=uuid_author,
    to_object_class_name="Author",
  )
  result = batch.create_references()  # <----- implicit reference creation


  # add book_2
  uuid_book_2 = generate_uuid5(book_2, "Book")
  batch.add_data_object(
    data_object=book_2,
    class_name="Book",
    uuid=uuid_book_2,
  )
  result = batch.create_objects()  # <----- implicit object creation

  # add references author ---> book_2
  batch.add_reference(
    from_object_uuid=uuid_author,
    from_object_class_name="Author",
    from_property_name="wroteBooks",
    to_object_uuid=uuid_book_2,
    to_object_class_name="Book",
  )
  # add references author <--- book_2
  batch.add_reference(
    from_object_uuid=uuid_book_2,
    from_object_class_name="Book",
    from_property_name="ofAuthor",
    to_object_uuid=uuid_author,
    to_object_class_name="Author",
  )
  result = batch.create_references()  # <----- implicit reference creation

# NOTE: When exiting context manager the method `batch.flush()` is called
# done, everything is imported/created
```

### Batch configuration

`Batch` オブジェクトは `batch.configure()` メソッド、または `batch()`（`__call__`）メソッドで設定できます。両者は同じ関数です。上記の例では `batch_size` と `dynamic` を設定しましたが、利用可能なパラメーターは以下のとおりです。

- `batch_size` - (`int` または `None`、デフォルト `None`): `int` を指定すると Auto／Dynamic-batching が有効になります。Auto-batching では「オブジェクト数 + リファレンス数 == `batch_size`」になるとオブジェクト → リファレンスの順で作成します（詳細は [Auto-batching](#auto-batching) を参照）。Dynamic-batching では初期値として `recommended_num_objects` と `recommended_num_references` に使用されます（詳細は [Dynamic-batching](#dynamic-batching) を参照）。`None` の場合は Manual-batching となり、自動作成は行われません。  
- `dynamic` - (`bool`, デフォルト `False`): Dynamic-batching の有効／無効を切り替えます。`batch_size` が `None` の場合は無効です。  
- `creation_time` - (`int` または `float`, デフォルト `10`): バッチのインポート／作成を行う時間間隔（秒）です。`recommended_num_objects` と `recommended_num_references` の計算に使用され、Dynamic-batching に影響します。  
- `callback` (Optional[Callable[[dict], None]], デフォルト `weaviate.util.check_batch_result`): `batch.create_objects()` と `batch.create_references()` の結果に対して呼び出されるコールバック関数です。Auto／Dynamic-batching におけるエラーハンドリングに使用されます。`batch_size` が `None` の場合は影響しません。  
- `timeout_retries` - (`int`, デフォルト `3`): `TimeoutError` になる前にバッチのインポート／作成を再試行する回数です。  
- `connection_error_retries` - (`int`, デフォルト `3`): `ConnectionError` になる前にバッチのインポート／作成を再試行する回数です。**注:** `weaviate-client 3.9.0` で追加されました。  
- `num_workers` - (`int`, デフォルト `1`): バッチインポートを並列化する最大スレッド数です。Manual-batching 以外（AUTO または DYNAMIC）のみで使用されます。***Weaviate インスタンスを過負荷にしないようご注意ください。*** **注:** `weaviate-client 3.9.0` で追加されました。  

NOTE: このメソッドを呼び出すたびに、必要な設定をすべて指定してください。指定しない設定はデフォルト値に置き換えられます。  
```python
client.batch(
  batch_size=100,
  dynamic=False,
  creation_time=5,
  timeout_retries=3,
  connection_error_retries=5,
  callback=None,
  num_workers=1,
)
```

### ヒント & コツ

* コミット／作成前にバッチへ追加できるオブジェクト／リファレンスの数に制限はありません。ただし、バッチが大きすぎると TimeOut エラーが発生する場合があります。これは、Weaviate が指定された時間内にバッチ内のすべてのオブジェクトを処理・作成できなかったことを意味します（タイムアウト設定は [こちら](https://weaviate-python-client.readthedocs.io/en/latest/weaviate.html#weaviate.Client) や [こちら](https://weaviate-python-client.readthedocs.io/en/latest/weaviate.html#weaviate.Client.timeout_config) を参照）。タイムアウト設定を 60 秒以上にする場合は docker-compose.yml／Helm chart の変更が必要です。  
* Python クライアントの `batch` クラスは次の 3 通りの使い方ができます。  
    * ケース 1: すべてユーザーが実行。ユーザーはオブジェクト／オブジェクト参照を追加し、任意のタイミングで作成します。データ型を作成するには `create_objects`、`create_references`、`flush` を使用します。この場合、Batch インスタンスの `batch_size` は `None` です（`configure` または `__call__` のドキュメントを参照）。コンテキストマネージャでも使用できます。  
    * ケース 2: バッチが満杯になると自動作成。Batch インスタンスの `batch_size` を正の整数に設定します（`configure` または `__call__` を参照）。このとき `batch_size` は追加されたオブジェクトとリファレンスの合計に対応します。ユーザーによるバッチ作成は必須ではありませんが、行うことも可能です。要件を満たさない最後のバッチを作成するには `flush` を使用します。コンテキストマネージャでも使用できます。  
    * ケース 3: ケース 2 と似ていますが、Dynamic-batching を使用します。すなわち、オブジェクトまたはリファレンスのいずれかが `recommended_num_objects` または `recommended_num_references` に達した時点で自動作成されます。設定方法は `configure` または `__call__` のドキュメントを参照してください。  
    * **コンテキストマネージャ対応**: `with` 文と共に使用できます。コンテキストを抜ける際に `flush` を自動で呼び出します。`configure` または `__call__` と組み合わせて、上記の任意のケースに設定できます。  

### エラー処理

`Batch` でオブジェクトを作成する方が、オブジェクト／リファレンスを個別に作成するより高速ですが、その分いくつかのバリデーションステップをスキップします。バリデーションをスキップすると、作成に失敗するオブジェクトや、追加に失敗するリファレンスが発生する場合があります。このとき `Batch` 自体は失敗しませんが、個々のオブジェクト／リファレンスが失敗する可能性があります。そのため、`batch.create_objects()` や `batch.create_references()` の戻り値をチェックし、すべてがエラーなくインポート／作成されたか確認することを推奨します。以下に、個々の `Batch` オブジェクト／リファレンスでエラーを検出・処理する方法を示します。

まず、エラーをチェックして出力する関数を定義します。  
```python
def check_batch_result(results: dict):
  """
  Check batch results for errors.

  Parameters
  ----------
  results : dict
      The Weaviate batch creation return value.
  """

  if results is not None:
    for result in results:
      if "result" in result and "errors" in result["result"]:
        if "error" in result["result"]["errors"]:
          print(result["result"])
```

次に、この関数を使用してアイテム（オブジェクト／リファレンス）レベルのエラーメッセージを出力します。Auto／Dynamic-batching を用い、`create` メソッドを暗黙的に呼び出さない場合の例を示します。

```python
client.batch(
  batch_size=100,
  dynamic=True,
  creation_time=5,
  timeout_retries=3,
  connection_error_retries=3,
  callback=check_batch_result,
)

# done, easy as that
```

Manual-batching では、戻り値に対してこの関数を呼び出せます。  
```python
# on objects
result = client.batch.create_object()
check_batch_result(result)

# on references
result = client.batch.create_references()
check_batch_result(result)
```


<details>
  <summary>例コード</summary>

以下の Python コードは、バッチ内の個々のデータオブジェクトでエラーを処理する方法を示しています。

```python
import weaviate

client = weaviate.Client("http://localhost:8080")

def check_batch_result(results: dict):
  """
  Check batch results for errors.

  Parameters
  ----------
  results : dict
      The Weaviate batch creation return value, i.e. returned value of the client.batch.create_objects().
  """
  if results is not None:
    for result in results:
      if 'result' in result and 'errors' in result['result']:
        if 'error' in result['result']['errors']:
          print("We got an error!", result)

object_to_add = {
    "name": "Jane Doe",
    "writesFor": [{
        "beacon": "weaviate://localhost/f81bfe5e-16ba-4615-a516-46c2ae2e5a80"
    }]
}

client.batch.configure(
  # `batch_size` takes an `int` value to enable auto-batching
  # (`None` is used for manual batching)
  batch_size=100,
  # dynamically update the `batch_size` based on import speed
  dynamic=False,
  # `timeout_retries` takes an `int` value to retry on time outs
  timeout_retries=3,
  # checks for batch-item creation errors
  # this is the default in weaviate-client >= 3.6.0
  callback=check_batch_result,
  consistency_level=weaviate.data.replication.ConsistencyLevel.ALL,  # default QUORUM
)

with client.batch as batch:
  batch.add_data_object(object_to_add, "Author", "36ddd591-2dee-4e7e-a3cc-eb86d30a4303", vector=[1,2])
  # lets force an error, adding a second object with unmatching vector dimensions
  batch.add_data_object(object_to_add, "Author", "cb7d0da4-ceaa-42d0-a483-282f545deed7", vector=[1,2,3])
```

同じ方法はリファレンスの追加にも適用できます。特にリファレンスをバッチで送信する場合、オブジェクトやリファレンスレベルのバリデーションが一部スキップされます。上記のように単一データオブジェクトで検証を行うことで、エラーが見逃される可能性を低減できます。

</details>


## 設計

### GraphQL クエリビルダー パターン

複雑な GraphQL クエリ（例: フィルターを使用する場合）を扱う際、クライアントではビルダー パターンを使用してクエリを組み立てます。以下は、複数のフィルターを持つクエリの例です:

```python
import weaviate
client = weaviate.Client("http://localhost:8080")

where_filter = {
  "path": ["wordCount"],
  "operator": "GreaterThan",
  "valueInt": 1000
}

near_text_filter = {
  "concepts": ["fashion"],
  "certainty": 0.7,
  "moveAwayFrom": {
    "concepts": ["finance"],
    "force": 0.45
  },
  "moveTo": {
    "concepts": ["haute couture"],
    "force": 0.85
  }
}

query_result = client.query\
    .get("Article", ["title"])\
    .with_where(where_filter)\
    .with_near_text(near_text_filter)\
    .with_limit(50)\
    .do()

print(query_result)
```

クエリを実行するには `.do()` メソッドを使用する必要がある点にご注意ください。

:::tip
`.build()` を使用すると、生成される GraphQL クエリ を確認できます
:::

```python
query_result = client.query\
    .get("Article", ["title"])\
    .with_where(where_filter)\
    .with_near_text(near_text_filter)\
    .with_limit(50)

query_result.build()

>>> '{Get{Article(where: {path: ["wordCount"] operator: GreaterThan valueInt: 1000} limit: 50 nearText: {concepts: ["fashion"] certainty: 0.7 moveTo: {force: 0.85 concepts: ["haute couture"]} moveAwayFrom: {force: 0.45 concepts: ["finance"]}} ){title}}}'

```

## ベストプラクティスと注意事項

### スレッド セーフティ

Python クライアントは基本的にスレッド セーフになるよう設計されていますが、`requests` ライブラリに依存しているため、完全なスレッド セーフティは保証されません。

この点については将来的に改善を検討しています。

:::warning Thread safety
クライアントのバッチ処理アルゴリズムはスレッド セーフではありません。Python クライアントをマルチスレッド環境で使用する際は、この点を念頭に置き、よりスムーズで予測しやすい動作を確保してください。
:::

マルチスレッド環境でバッチ処理を行う場合は、任意の時点でバッチ ワークフローを実行するスレッドが 1 つだけになるようにしてください。複数のスレッドが同じ `client.batch` オブジェクトを同時に使用することはできません。

## リリース

[GitHub のリリース ページ](https://github.com/weaviate/weaviate-python-client/releases) にアクセスすると、Python クライアント ライブラリのリリース履歴を確認できます。

<details>
  <summary>Weaviate と対応するクライアント バージョンの一覧を表示するにはここをクリック</summary>

import ReleaseHistory from '/_includes/release-history.md';

<ReleaseHistory />

</details>

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

