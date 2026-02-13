---
title: クエリの詳細
description:  Weaviate で正確な結果を取得するための効果的なクエリ手法を学びます。
sidebar_position: 50
image: og/docs/tutorials.jpg
# tags: ['basics']
---

import UpdateInProgressNote from '/_includes/update-in-progress.mdx';

<UpdateInProgressNote />

このセクションでは、 Weaviate で実行できるさまざまなクエリを探っていきます。ここでは、 [Quickstart チュートリアル](docs/weaviate/quickstart/index.md) でご覧になった `nearText` クエリを発展させ、利用可能なクエリ種別、フィルター、メトリクスを紹介します。

このセクションの終わりまでに、 ベクトル検索とスカラー検索を個別にも組み合わせても実行し、個々のオブジェクトおよび集計を取得できるようになります。

## 前提条件

まずは [Quickstart チュートリアル](docs/weaviate/quickstart/index.md) を完了されることをお勧めします。

このチュートリアルを始める前に、 Quickstart の手順を実行して次の環境を整えてください:

- 稼働中の Weaviate インスタンス（例: [Weaviate Cloud](https://console.weaviate.cloud) 上）
- OpenAI、 Cohere、 Hugging Face など、お好みの推論 API 用の API キー
- お好みの Weaviate クライアントライブラリをインストール済み
- スキーマに `Question` クラスを設定済み
- `jeopardy_tiny.json` データをインポート済み

## `Get` を使用したオブジェクト取得

:::tip GraphQL
 Weaviate のクエリは GraphQL で構築されています。 GraphQL が初めてでもご心配なく。これから段階的に基礎から構築していきます。また、多くの場合、 GraphQL の構文はクライアントによって抽象化されています。

 Weaviate には意味論的 ( ベクトル ) 検索と語彙的 ( スカラー ) 検索を単独または組み合わせて実行する方法があります。ご存じのように、 ベクトル検索は類似度ベースの検索を可能にし、スカラー検索は厳密な一致によるフィルタリングを可能にします。
:::

まずは、先ほどインポートした **Question** オブジェクトを取得するクエリから始めます。

オブジェクトを取得する Weaviate の関数は `Get` です。

既にご存じの方もいらっしゃるかもしれません。 [Imports in detail チュートリアル](./import.md) を終えている場合、インポートが成功したことを確認するために `Get` クエリを実行したはずです。以下はその際のコードの再掲です:

import CodeImportGet from '/_includes/code/quickstart.import.get.mdx';

<CodeImportGet />

このクエリは、 この (`Question`) クラスのオブジェクトを *いくつか* 取得するように Weaviate に依頼しているだけです。

もちろん多くの場合、何らかの条件に基づいて情報を取得したいでしょう。そこで、このクエリに ベクトル検索を追加してみましょう。

### `nearText` を用いた `Get`

これは `Get` クエリによる ベクトル検索です。

import CodeAutoschemaNeartext from '/_includes/code/quickstart/neartext.mdx'

<CodeAutoschemaNeartext />

これも [Quickstart チュートリアル](docs/weaviate/quickstart/index.md) で使用したので見覚えがあるかもしれません。それでは内容を少し分解してみましょう。

ここでは `nearText` 演算子を使用しています。クエリの `concept` として `biology` を Weaviate に渡し、 Weaviate は推論 API（この例では OpenAI）を通じてそれを ベクトル化し、その ベクトル を基に検索を行います。

ここでヘッダーに API キーを渡している点にもご注目ください。入力クエリの ベクトル化に推論 API を使用するため、これは必須です。

さらに `limit` 引数を指定し、最大 2 件のオブジェクトのみ取得しています。

このクエリを実行すると、 Weaviate から *"DNA"* と *"species"* に関するエントリーが返されるはずです。

### `nearVector` を用いた `Get`

場合によっては、検索クエリとして ベクトル を直接入力したいこともあります。たとえば、外部のカスタム ベクトライザーとともに Weaviate を運用しているケースです。このようなときは、 `nearVector` 演算子を使ってクエリ ベクトル を Weaviate に渡せます。

例として、 OpenAI の埋め込みを手動で取得し、それを `nearVector` 演算子で渡す Python コードを示します:

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

これを実行すると、先ほどと同じ結果が得られるはずです。

ここでは同じ OpenAI 埋め込みモデル (`text-embedding-ada-002`) を使用し、 ベクトル が同一の ベクトル「空間」にあるようにしています。

また、 `with_near_vector` メソッドに `certainty` 引数を追加していることにお気付きかもしれません。これはオブジェクトの類似度のしきい値を指定でき、遠いオブジェクトが返されないようにする際に非常に便利です。

## 追加プロパティ

返されたオブジェクトに対して `_additional` プロパティを要求することもできます。これにより、各オブジェクトの `vector` や実際の `certainty` 値などを取得でき、クエリ ベクトル との近さを確認できます。以下は `certainty` 値を返すクエリです:

import CodeQueryNeartextAdditional from '/_includes/code/quickstart.query.neartext.additional.mdx'

<CodeQueryNeartextAdditional />

試してみると、次のようなレスポンスが得られるはずです:

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

このクエリを変更して、 ベクトル を取得できるか試してみてください（注: 非常に長いレスポンスになります 😉）。

このデータセットだけでなく、別のデータセットや ベクトライザー を用いて異なるクエリを試し、結果や距離がどのように変化するかを確認してみてください。

## フィルター

便利ではありますが、 ベクトル検索だけでは十分でない場合もあります。たとえば特定のカテゴリに属する **Question** オブジェクトだけを取得したいケースです。

このような場合は、 Weaviate のスカラー フィルタリング機能を単独で、あるいは ベクトル検索と組み合わせて使用できます。

次を試してみましょう:

import CodeQueryWhere1 from '/_includes/code/quickstart.query.where.1.mdx'

<CodeQueryWhere1 />

このクエリでは、カテゴリに `ANIMALS` という文字列を含む **Question** オブジェクトを Weaviate に問い合わせています。結果は次のようになります:

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

スカラーフィルターをご覧いただいたところで、これを ベクトル検索とどのように組み合わせるかを見てみましょう。

### スカラーフィルターを組み合わせたベクトル検索

フィルターと ベクトル検索を組み合わせることは「加算的 (additive)」なプロセスです。具体的に見てみましょう。

import CodeQueryWhere2 from '/_includes/code/quickstart.query.where.2.mdx'

<CodeQueryWhere2 />

このクエリでは、カテゴリが `ANIMALS` でありながら "biology" に最も近い **Question** オブジェクトを Weaviate に問い合わせています。次のような結果が得られるはずです:

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

結果が 'animals' カテゴリに限定されている点にご注目ください。これらの結果は最先端の科学情報ではありませんが、生物学に関する豆知識になっています。
## `Aggregate` を用いたメタデータ

名前が示すとおり、 `Aggregate` 関数はクラス全体やオブジェクトのグループなどに対する集計データを表示するために使用できます。

たとえば、次のクエリは `Question` クラスに含まれるデータオブジェクトの数を返します。

import CodeQueryAggregate1 from '/_includes/code/quickstart.query.aggregate.1.mdx'

<CodeQueryAggregate1 />

また、先ほどの `Get` 関数と同様に、 `Aggregate` 関数でもフィルターを利用できます。例えば、次のクエリはカテゴリが「ANIMALS」の **Question** オブジェクト数を返します。

import CodeQueryAggregate2 from '/_includes/code/quickstart.query.aggregate.2.mdx'

<CodeQueryAggregate2 />

上記のとおり、クエリフィルターに一致するオブジェクトは 4 件です。

ここでは、 Weaviate は先ほどの同様の `Get` クエリで確認したのと同じオブジェクトを特定しています。違いは、個々のオブジェクトではなく、要求した集計統計（件数）が返される点です。

ご覧のように、 `Aggregate` 関数を使うことで、 Weaviate データベースから便利な集計情報、つまりメタデータを取得できます。

## Recap

* `Get` クエリはデータオブジェクトの取得に使用します。  
* `Aggregate` クエリはメタデータや集計データの取得に使用できます。  
* `nearText` や `nearVector` などの演算子は ベクトル クエリに利用できます。  
* スカラー フィルターは 転置インデックス を活用して正確なフィルタリングを行えます。  
* ベクトル フィルターとスカラー フィルターは組み合わせることができ、 `Get` と `Aggregate` の両クエリで利用できます。  

## 参考資料

- [チュートリアル：スキーマの詳細](../starter-guides/managing-collections/index.mdx)
- [チュートリアル：インポートの詳細](./import.md)
- [チュートリアル：モジュールの概要](./modules.md)
- [チュートリアル：Weaviate Console 入門](/cloud/tools/query-tool.mdx)

## Notes

### 確信度の計算方法

Weaviate における `certainty` は、 ベクトル からデータオブジェクトまでの距離を表す指標です。 [こちら](/weaviate/config-refs/distances#distance-vs-certainty) で説明されているように、確信度からコサイン類似度を計算することもできます。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>