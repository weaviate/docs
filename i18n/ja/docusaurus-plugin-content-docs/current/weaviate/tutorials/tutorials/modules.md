---
title: モジュール概要
description: Weaviate のモジュールについて学び、専門機能でデータソリューションを強化しましょう。
sidebar_position: 90
image: og/docs/tutorials.jpg
# tags: ['modules']
---

import UpdateInProgressNote from '/_includes/update-in-progress.mdx';

<UpdateInProgressNote />

このガイドでは、Weaviate におけるモジュールの役割について概要を説明します。

名前が示すとおり、Weaviate のモジュールは Weaviate の機能を拡張するためのオプションコンポーネントで、データのベクトル化や結果の処理（例: 質問応答）などを行います。モジュール名の構造（`x2vec`）を見ると、そのモジュールが何を行うかが分かります。例えば `text2vec` はテキスト埋め込みを生成し、`img2vec` は画像埋め込みを生成します。

## ベクトライザー & リランカー

ベクトライザーとリランカーはベクトル検索に使用され、データオブジェクトだけでなくクエリもベクトル化します。たとえば、埋め込みモデル統合を有効にすると、セマンティック検索（`nearText`）が利用可能になります。これにより、クエリが自動でベクトル化され、インデックスに保存されているベクトルと照合されます。

クラスごとに次のようにベクトル化を設定できます:

```json
{
    "class": "SomeClass",
    "vectorizer": "text2vec-openai",
}
```

次に、どの要素をベクトル化するかを Weaviate に指定します。ペイロードのみか、それともクラス名やプロパティ名も含めるかを決めます。

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
クラス名やプロパティ名をインデックス化できるのは、これらがセマンティックな文脈を与える場合があるためです。たとえば、クラス _Product_ にはプロパティ _name_ があるとします。すべてをベクトル化すると、_Product_ の _name_ が _some product_ というベクトルを得られます。これは `text2vec` モジュールでのみ適用されます。
:::

プロパティをまったくベクトル化したくない場合は、その設定を省略するだけで構いません。

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

ここでは `Article` クラスの定義を見てみましょう。クラスレベルとプロパティレベルにある `moduleConfig` エントリを探してください。

クラス名とプロパティ名はインデックス化されておらず、記事本体のみがインデックス化されていることが分かります。そのため、記事を 1 件取得すると、そのベクトルが transformers モジュールによって生成されたものだと分かります。

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

リーダーとジェネレーターは、データベースからデータを取得した後にそのデータを処理するために使用されます。質問応答がよい例です。リミットを 10 に設定すると、取得した 10 件の結果が Q&A モジュールを通して処理されます。

これらのモジュールの一部は、ここで示すように GraphQL API を有効にすることもできます。

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


## ご質問・フィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>