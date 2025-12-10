---
title: クエリの詳細
description: Weaviate で正確な結果を取得するための効果的なクエリ手法を学びます。
sidebar_position: 50
image: og/docs/tutorials.jpg
# tags: ['basics']
---

import UpdateInProgressNote from '/_includes/update-in-progress.mdx';

<UpdateInProgressNote />

このセクションでは、 Weaviate で実行できるさまざまなクエリを紹介します。ここでは、 [クイックスタート チュートリアル](docs/weaviate/quickstart/index.md) でご覧いただいた `nearText` クエリを拡張し、異なるクエリタイプ、フィルター、メトリクスの使い方を説明します。

このセクションを終える頃には、ベクトル検索とスカラー検索を別々に、そして組み合わせて実行し、個々のオブジェクトとアグリゲーションを取得できるようになります。

## 前提条件

まずは [クイックスタート チュートリアル](docs/weaviate/quickstart/index.md) を終えておくことをお勧めします。

クイックスタートの手順を実施して、以下を準備してください。

- Weaviate のインスタンス（例: [Weaviate Cloud](https://console.weaviate.cloud)）を起動済み
- OpenAI、 Cohere、 Hugging Face など、お好みの推論 API 用の API キー
- ご利用のプログラミング言語向け Weaviate クライアントライブラリをインストール
- スキーマに `Question` クラスを作成
- `jeopardy_tiny.json` データをインポート済み

## `Get` を使用したオブジェクト取得

:::tip GraphQL
Weaviate のクエリは GraphQL を使用して構築されています。初めて触れる方もご安心ください。基本から段階的に解説します。また、多くの場合クライアントライブラリが GraphQL 構文を抽象化してくれます。

Weaviate では、セマンティック（ベクトル）検索とレキシカル（スカラー）検索を単独または組み合わせて実行できます。ベクトル検索は類似度検索を、スカラー検索は完全一致によるフィルタリングを提供します。
:::

まずは、インポート済みの **Question** オブジェクトを取得するクエリを実行しましょう。

Weaviate でオブジェクトを取得する関数は `Get` です。

この操作に見覚えがある方もいるかもしれません。 [インポート詳細チュートリアル](./import.md) を完了していれば、データインポートが成功したか確認するために `Get` クエリを実行したはずです。以下に同じコードを示します。

import CodeImportGet from '/_includes/code/quickstart.import.get.mdx';

<CodeImportGet />

このクエリは単に Weaviate に対して、この (`Question`) クラスのオブジェクトを *いくつか* 返すよう依頼しています。

もちろん、ほとんどの場合は何らかの条件で情報を取得したいでしょう。ここではベクトル検索を追加してクエリを発展させます。

### `nearText` を用いた `Get`

こちらは `Get` クエリによるベクトル検索です。

import CodeAutoschemaNeartext from '/_includes/code/quickstart/neartext.mdx'

<CodeAutoschemaNeartext />

これもクイックスタートで使用しましたが、少し詳しく見ていきましょう。

ここでは `nearText` オペレーターを使用しています。 `concept` として `biology` を渡すと、 Weaviate は推論 API（この例では OpenAI）を通じてこれをベクトル化し、そのベクトルを検索の基準にします。

また、ヘッダーに API キーを渡している点にも注目してください。入力クエリのベクトル化に推論 API を使用するため、必須となります。

さらに `limit` 引数を指定して、最大 2 件のオブジェクトのみを取得しています。

このクエリを実行すると、 *"DNA"* と *"species"* に関するエントリが返されるはずです。

### `nearVector` を用いた `Get`

場合によっては、検索クエリとして直接ベクトルを入力したいことがあります。たとえば、独自の外部ベクトライザーで Weaviate を実行しているケースです。その場合は `nearVector` オペレーターを使い、クエリベクトルを Weaviate に渡せます。

以下は、 OpenAI の埋め込みを手動で取得し、 `nearVector` オペレーター経由で渡す Python 例です。

```python
import openai

openai.api_key = "YOUR-OPENAI-API-KEY"
model="text-embedding-ada-002"
oai_resp = openai.Embedding.create(input = ["biology"], model=model)

oai_embedding = oai_resp['data'][0]['embedding']

result = (
    client.query
    .get("Question", ["question", "answer"])
    .with_near_vector({
        "vector": oai_embedding,
        "certainty": 0.7
    })
    .with_limit(2)
    .do()
)

print(json.dumps(result, indent=4))
```

上記と同じ結果が返るはずです。

同じ OpenAI 埋め込みモデル（ `text-embedding-ada-002` ）を使用している点に注意してください。これにより、ベクトルが同じベクトル空間に配置されます。

また、 `with_near_vector` メソッドに `certainty` 引数を追加していることにも気づいたでしょう。これはオブジェクトの類似度しきい値を設定でき、離れたオブジェクトが返されないようにするのに便利です。

## 追加プロパティ

返却されるオブジェクトに対して `_additional` プロパティを要求できます。これにより、各オブジェクトの `vector` や実際の `certainty` 値などを取得し、クエリベクトルとの距離を確認できます。以下は `certainty` を返すクエリです。

import CodeQueryNeartextAdditional from '/_includes/code/quickstart.query.neartext.additional.mdx'

<CodeQueryNeartextAdditional />

実行すると、次のようなレスポンスが得られるはずです。

```json
{
    "data": {
        "Get": {
            "Question": [
                {
                    "_additional": {
                        "certainty": 0.9030631184577942
                    },
                    "answer": "DNA",
                    "category": "SCIENCE",
                    "question": "In 1953 Watson & Crick built a model of the molecular structure of this, the gene-carrying substance"
                },
                {
                    "_additional": {
                        "certainty": 0.900638073682785
                    },
                    "answer": "species",
                    "category": "SCIENCE",
                    "question": "2000 news: the Gunnison sage grouse isn't just another northern sage grouse, but a new one of this classification"
                }
            ]
        }
    }
}
```

このクエリを変更してベクトルを取得してみてください（注: 非常に長いレスポンスになります 😉）。

また、異なるクエリやデータセット、ベクトライザーで結果と距離がどのように変わるかをぜひ試してみてください。

## フィルター

便利なベクトル検索ですが、それだけでは十分でない場合もあります。たとえば、特定カテゴリの **Question** オブジェクトだけを対象にしたい場合などです。

そんなときは、 Weaviate のスカラーフィルタリング機能をベクトル検索と単独、または組み合わせて使用できます。

次のクエリを試してみてください。

import CodeQueryWhere1 from '/_includes/code/quickstart.query.where.1.mdx'

<CodeQueryWhere1 />

このクエリは、カテゴリに `ANIMALS` を含む **Question** オブジェクトを取得します。結果は次のようになります。

```json
{
    "data": {
        "Get": {
            "Question": [
                {
                    "answer": "the diamondback rattler",
                    "category": "ANIMALS",
                    "question": "Heaviest of all poisonous snakes is this North American rattlesnake"
                },
                {
                    "answer": "Elephant",
                    "category": "ANIMALS",
                    "question": "It's the only living mammal in the order Proboseidea"
                },
                {
                    "answer": "the nose or snout",
                    "category": "ANIMALS",
                    "question": "The gavial looks very much like a crocodile except for this bodily feature"
                },
                {
                    "answer": "Antelope",
                    "category": "ANIMALS",
                    "question": "Weighing around a ton, the eland is the largest species of this animal in Africa"
                }
            ]
        }
    }
}
```

スカラーフィルターを確認したところで、ベクトル検索とどのように組み合わせられるかを見てみましょう。

### スカラーフィルターとのベクトル検索

フィルターとベクトル検索の組み合わせは加算的なプロセスです。具体例をご覧ください。

import CodeQueryWhere2 from '/_includes/code/quickstart.query.where.2.mdx'

<CodeQueryWhere2 />

このクエリは「biology」に最も近い **Question** オブジェクトを、カテゴリ `ANIMALS` 内に限定して取得します。結果は次のようになります。

```json
{
    "data": {
        "Get": {
            "Question": [
                {
                    "_additional": {
                        "certainty": 0.8918434679508209
                    },
                    "answer": "the nose or snout",
                    "category": "ANIMALS",
                    "question": "The gavial looks very much like a crocodile except for this bodily feature"
                },
                {
                    "_additional": {
                        "certainty": 0.8867587149143219
                    },
                    "answer": "Elephant",
                    "category": "ANIMALS",
                    "question": "It's the only living mammal in the order Proboseidea"
                }
            ]
        }
    }
}
```

結果が 'animals' カテゴリ内に限定されていることに注目してください。最先端の科学というわけではありませんが、生物学的な豆知識が返ってきます。
## `Aggregate` によるメタデータ

名前が示すとおり、`Aggregate` 関数を使用すると、クラス全体やオブジェクトのグループといった集約データを表示できます。

例えば、次のクエリは `Question` クラスに含まれるデータオブジェクトの数を返します。

import CodeQueryAggregate1 from '/_includes/code/quickstart.query.aggregate.1.mdx'

<CodeQueryAggregate1 />

また、上の `Get` 関数と同様に、`Aggregate` 関数でもフィルターを使用できます。例えば、このクエリはカテゴリが "ANIMALS" の **Question** オブジェクトの数を返します。

import CodeQueryAggregate2 from '/_includes/code/quickstart.query.aggregate.2.mdx'

<CodeQueryAggregate2 />

上記のとおり、クエリフィルターに一致するオブジェクトは 4 件あります。

```json
{
    "data": {
        "Aggregate": {
            "Question": [
                {
                    "meta": {
                        "count": 4
                    }
                }
            ]
        }
    }
}
```

ここで Weaviate は、先ほどの類似した `Get` クエリで確認したのと同じオブジェクトを特定しています。違いは、個々のオブジェクトではなく、要求された集約統計（count）を返している点です。

このように、`Aggregate` 関数を使用すると、Weaviate データベースから便利な集約情報、つまりメタデータを取得できます。

## まとめ

* `Get` クエリはデータオブジェクトの取得に使用します。  
* `Aggregate` クエリはメタデータや集約データの取得に使用できます。  
* `nearText` や `nearVector` などのオペレーターはベクトル クエリに使用できます。  
* スカラー フィルターは転置インデックスを活用して厳密なフィルタリングを行えます。  
* ベクトル フィルターとスカラー フィルターは組み合わせて使用でき、`Get` と `Aggregate` の両クエリで利用可能です。  

## 参考資料

- [チュートリアル: スキーマを詳しく理解する](../starter-guides/managing-collections/index.mdx)
- [チュートリアル: インポートを詳しく理解する](./import.md)
- [チュートリアル: モジュールの紹介](./modules.md)
- [チュートリアル: Weaviate Console 入門](/cloud/tools/query-tool.mdx)

## Notes

### certainty はどのように計算されますか？

Weaviate における `certainty` は、ベクトルとデータオブジェクトとの距離を測る指標です。`certainty` を基にコサイン類似度を計算する方法については、[こちら](/weaviate/config-refs/distances#distance-vs-certainty) をご覧ください。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>