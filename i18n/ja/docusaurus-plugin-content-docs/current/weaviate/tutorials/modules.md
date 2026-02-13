---
title: モジュール - 入門
description: Weaviate のモジュールについて学び、専門機能でデータ ソリューションを強化しましょう。
sidebar_position: 90
image: og/docs/tutorials.jpg
# tags: ['modules']
---

import UpdateInProgressNote from '/_includes/update-in-progress.mdx';

<UpdateInProgressNote />

このガイドでは、モジュールが Weaviate で果たす役割について紹介します。

名前が示すとおり、Weaviate のモジュールはオプションのコンポーネントで、データのベクトル化や結果の処理（例: 質問応答）など、Weaviate の機能を拡張します。モジュール名の構造（`x2vec`）は、そのモジュールが何を行うかを示しています。たとえば、`text2vec` はテキスト埋め込みを生成し、`img2vec` は画像埋め込みを生成します。

## ベクトライザー & リランカー

ベクトライザーとリランカーはベクトル検索に使用され、データ オブジェクトとクエリの両方をベクトル化します。たとえば、埋め込みモデル統合を有効にすると、セマンティック検索（`nearText`）が利用できるようになります。クエリが自動的にベクトル化され、インデックスに保存されているベクトルと照合されます。

クラスごとに以下のようにベクトル化を設定できます:

```json
{
    "class": "SomeClass",
    "vectorizer": "text2vec-openai",
}
```

次に、どの部分をベクトル化するかを Weaviate に指定します。ペイロードだけにするか、クラス名やプロパティ名も含めるかを選択できます。

```json
{
    "class": "SomeClass",
    "vectorizer": "text2vec-openai",
    "moduleConfig": {
        "text2vec-openai": {
            "vectorizeClassName": true
        }
    },
    "properties": [
        {
            "moduleConfig": {
                "text2vec-openai": {
                    "vectorizePropertyName": false
                }
            }
        }
    ]
}
```

:::note
クラス名とプロパティ名をインデックス化できる理由は、それらがセマンティックな文脈を与える場合があるためです。たとえば、_Product_ というクラスに _name_ というプロパティがあるとします。すべてをベクトル化すると、_Product_ に _some product_ という _name_ を持つベクトルが生成されます。これは `text2vec` モジュールでのみ有効です。
:::

プロパティをまったくベクトル化したくない場合は、単に省略できます。

```json
{
    "class": "SomeClass",
    "vectorizer": "text2vec-openai",
    "moduleConfig": {
        "text2vec-openai": {
            "vectorizeClassName": true
        }
    },
    "properties": [
        {
            "moduleConfig": {
                "text2vec-openai": {
                    "vectorizePropertyName": false,
                    "skip": true
                }
            }
        }
    ]
}
```

## 例

以下のコードはスキーマの完全な例です。

`Article` クラスの定義を見てみましょう。クラスレベルとプロパティレベルの `"moduleConfig"` エントリを探してください。

クラス名とプロパティ名はインデックス化されていませんが、記事 _自体_ はインデックス化されています。そのため、単一の記事を取得すると、そのベクトルが transformers モジュール由来であることがわかります。

```json
{
    "classes": [
        {
            "class": "Article",
            "description": "Normalised types",
            "invertedIndexConfig": {
                "bm25": {
                    "b": 0.75,
                    "k1": 1.2
                },
                "cleanupIntervalSeconds": 60,
                "stopwords": {
                    "additions": null,
                    "preset": "en",
                    "removals": null
                }
            },
            "moduleConfig": {
                "text2vec-transformers": {
                    "poolingStrategy": "masked_mean",
                    "vectorizeClassName": false
                }
            },
            "properties": [
                {
                    "dataType": [
                        "text"
                    ],
                    "description": "title of the article",
                    "indexFilterable": true,
                    "indexSearchable": true,
                    "moduleConfig": {
                        "text2vec-transformers": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "title",
                    "tokenization": "word"
                },
                {
                    "dataType": [
                        "text"
                    ],
                    "description": "url of the article",
                    "indexFilterable": true,
                    "indexSearchable": true,
                    "moduleConfig": {
                        "text2vec-transformers": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "url",
                    "tokenization": "word"
                },
                {
                    "dataType": [
                        "text"
                    ],
                    "description": "summary of the article",
                    "indexFilterable": true,
                    "indexSearchable": true,
                    "moduleConfig": {
                        "text2vec-transformers": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "summary",
                    "tokenization": "word"
                },
                {
                    "dataType": [
                        "date"
                    ],
                    "description": "date of publication of the article",
                    "moduleConfig": {
                        "text2vec-transformers": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "publicationDate"
                },
                {
                    "dataType": [
                        "int"
                    ],
                    "description": "Words in this article",
                    "moduleConfig": {
                        "text2vec-transformers": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "wordCount"
                },
                {
                    "dataType": [
                        "boolean"
                    ],
                    "description": "whether the article is currently accessible through the url",
                    "moduleConfig": {
                        "text2vec-transformers": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "isAccessible"
                },
                {
                    "dataType": [
                        "Author",
                        "Publication"
                    ],
                    "description": "authors this article has",
                    "moduleConfig": {
                        "text2vec-transformers": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "hasAuthors"
                },
                {
                    "dataType": [
                        "Publication"
                    ],
                    "description": "publication this article is in",
                    "moduleConfig": {
                        "text2vec-transformers": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "inPublication"
                },
                {
                    "dataType": [
                        "Category"
                    ],
                    "description": "category this article is of",
                    "moduleConfig": {
                        "text2vec-transformers": {
                            "skip": false,
                            "vectorizePropertyName": false
                        }
                    },
                    "name": "ofCategory"
                }
            ],
            "shardingConfig": {
                "virtualPerPhysical": 128,
                "desiredCount": 1,
                "actualCount": 1,
                "desiredVirtualCount": 128,
                "actualVirtualCount": 128,
                "key": "_id",
                "strategy": "hash",
                "function": "murmur3"
            },
            "vectorIndexConfig": {
                "skip": false,
                "cleanupIntervalSeconds": 300,
                "maxConnections": 32,
                "efConstruction": 128,
                "ef": -1,
                "dynamicEfMin": 100,
                "dynamicEfMax": 500,
                "dynamicEfFactor": 8,
                "vectorCacheMaxObjects": 2000000,
                "flatSearchCutoff": 40000,
                "distance": "cosine"
            },
            "vectorIndexType": "hnsw",
            "vectorizer": "text2vec-transformers"
        }
    ]
}
```

## リーダー & ジェネレーター

リーダー & ジェネレーターは、データベースからデータを取得した後にデータを処理するために使用されます。質問応答はその良い例です。limit を 10 に設定すると、取得された 10 件の結果が Q&A モジュールで処理されます。

これらのモジュールの中には、ここで示すように GraphQL API を有効にできるものもあります。

```graphql
{
  Get {
    Article(
      # the ask filter is introduced through the QandA module
      ask: {
        question: "What was the monkey doing during Elon Musk's brain-chip startup release?"
      }
      limit: 1
    ) {
      _additional {
        # the answer properties extend the _additional filters
        answer {
          result
          certainty
        }
      }
    }
  }
}
```

## まとめ

モジュールは Weaviate に追加機能を提供するアドオンです。必ずしも使用する必要はありませんが、必要に応じて利用できます。


## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>