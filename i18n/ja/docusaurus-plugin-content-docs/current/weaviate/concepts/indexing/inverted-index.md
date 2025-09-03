---
title: 転置インデックス
sidebar_position: 2
description: "キーワード検索とフィルタリングを効率化する転置インデックス アーキテクチャとその性能向上"
image: og/docs/concepts.jpg
# tags: ['basics']
---

Weaviate の転置インデックスは、単語や数値などの値をそれを含むオブジェクトへマッピングし、高速なキーワード検索とフィルタリングを実現します。

## Weaviate における転置インデックスの作成

Weaviate のインデックス アーキテクチャを理解することは、パフォーマンスとリソース使用量の最適化に欠かせません。Weaviate は **各プロパティと各インデックスタイプごとに個別の転置インデックス** を作成します。つまり:

- コレクション内の各プロパティごとに専用の転置インデックスが作成されます  
- 作成日時などのメタプロパティにも、それぞれ独立した転置インデックスが作成されます  
- 1 つのプロパティが複数のインデックスタイプをサポートしている場合、その数だけ転置インデックスが作成されます  
- プロパティをまたぐ集約や組み合わせはインデックス作成時ではなくクエリ実行時に行われます  

**例**: `title` プロパティで `indexFilterable: true` と `indexSearchable: true` の両方を設定すると、検索用に最適化されたインデックスとフィルタリング用に最適化されたインデックスの 2 つが生成されます。

このアーキテクチャは柔軟性とパフォーマンスを提供する一方で、複数のインデックスタイプを有効にするとストレージ消費とインデックス作成コストが増加する点に注意してください。

`text` プロパティの場合、インデックス作成は次の手順で行われます:

1. **トークン化**: まず、プロパティに設定された [tokenization method](../../config-refs/collections.mdx#tokenization) に従ってテキストをトークン化します。  
3. **インデックス エントリーの作成**: 処理された各トークンに対し、そのトークンを含むオブジェクトを指すインデックス エントリーを作成します。  

このプロセスにより、テキスト検索やフィルタリングで対象トークンを含むオブジェクトを素早く特定できます。

<details>
  <summary>2024 年 10 月に追加されたパフォーマンス向上</summary>

Weaviate バージョン `v1.24.26`、`v1.25.20`、`v1.26.6`、`v1.27.0` では、 BM25F スコアリング アルゴリズムに関して以下のパフォーマンス向上とバグ修正を行いました。

- BM25 セグメント マージ アルゴリズムを高速化  
- WAND アルゴリズムを改良し、スコア計算から尽きたタームを除外、必要な場合のみ完全ソートを実施  
- マルチプロパティ検索で、すべてのセグメントのクエリターム スコアを合算しない場合があるバグを修正  
- BM25 スコアを複数セグメントで並列計算するように変更  

常に最新の Weaviate へのアップグレードを推奨します。これらの改善点を含む最新機能を利用できます。

</details>

## BlockMax WAND アルゴリズム

:::info Added in `v1.30`
:::

BlockMax WAND アルゴリズムは、 BM25 やハイブリッド検索の高速化に用いられる WAND アルゴリズムの派生版です。転置インデックスをブロック単位に整理し、クエリに無関係なブロックをスキップできるようにします。これによりスコアリングが必要なドキュメント数を大幅に削減し、検索性能を向上させます。

BM25（またはハイブリッド）検索が遅い場合で `v1.30` より前の Weaviate を使用している場合は、 BlockMax WAND アルゴリズムを搭載した新しいバージョンへ移行し、パフォーマンスが向上するかお試しください。以前のバージョンからデータを移行する必要がある場合は、[v1.30 移行ガイド](/deploy/migration/weaviate-1-30.md) を参照してください。

:::note BlockMax WAND によるスコア変化

BlockMax WAND アルゴリズムの特性上、 BM25 やハイブリッド検索のスコアはデフォルトの WAND アルゴリズムと若干異なる場合があります。また、単一プロパティ検索と複数プロパティ検索で IDF やプロパティ長正規化の計算が異なるため、スコアも変わる可能性があります。これは仕様でありバグではありません。

:::

## 転置インデックスの設定

Weaviate には 3 種類の転置インデックスがあります。

- `indexSearchable` - BM25 またはハイブリッド検索用の検索インデックス  
- `indexFilterable` - 一致条件による高速 [フィルタリング](../filtering.md) 用のインデックス  
- `indexRangeFilters` - 数値範囲による [フィルタリング](../filtering.md) 用のインデックス  

各転置インデックスはプロパティ単位で `true`（有効）または `false`（無効）を設定できます。`indexSearchable` と `indexFilterable` はデフォルトで有効、`indexRangeFilters` はデフォルトで無効です。

フィルタリング用インデックスは [フィルタリング](../filtering.md) 専用ですが、検索用インデックスは検索とフィルタリングの両方に使用できます（ただしフィルタリング速度はフィルタリング用インデックスに劣ります）。

そのため、`"indexFilterable": false` で `"indexSearchable": true`（または未設定）とすると、フィルタリング性能は低下しますが、インポートが速くなり（1 つのインデックスのみ更新）、ディスク使用量も減少するというトレードオフがあります。

プロパティ単位で転置インデックスを有効・無効にする方法は、[関連 How-to セクション](../../manage-collections/vector-config.mdx#property-level-settings) をご覧ください。

インデックスを無効にするかどうかの目安としては、_そのプロパティを基にクエリを実行することがない場合は、無効にして構いません。_

#### 転置インデックス タイプの概要

import InvertedIndexTypesSummary from '/_includes/inverted-index-types-summary.mdx';

<InvertedIndexTypesSummary/>

- `indexFilterable` と `indexRangeFilters` のいずれか、または両方を有効にすると、フィルタリングが高速化されます。  
    - 片方のみ有効の場合、そのインデックスがフィルタリングに使用されます。  
    - 両方有効の場合、`indexRangeFilters` は比較演算子を伴う操作に、`indexFilterable` は等価・不等価の操作に使用されます。  

次の表は、適用可能なプロパティで 1 つまたは両方のインデックスタイプが `true` の場合、どちらのフィルターが比較を行うかを示しています。

| Operator | `indexRangeFilters` only | `indexFilterable` only | Both enabled |
| :- | :- | :- | :- |
| Equal | `indexRangeFilters` | `indexFilterable` | `indexFilterable` |
| Not equal | `indexRangeFilters` | `indexFilterable` | `indexFilterable` |
| Greater than | `indexRangeFilters` | `indexFilterable` | `indexRangeFilters` |
| Greater than equal | `indexRangeFilters` | `indexFilterable` | `indexRangeFilters` |
| Less than | `indexRangeFilters` | `indexFilterable` | `indexRangeFilters` |
| Less than equal | `indexRangeFilters` | `indexFilterable` | `indexRangeFilters` |

#### タイムスタンプ用転置インデックス

[タイムスタンプ検索](/weaviate/config-refs/indexing/inverted-index.mdx#indextimestamps) のためにインデックスを有効にすることもできます。

タイムスタンプは現在、`indexFilterable` インデックスでインデックス化されます。

## インデックスなしのコレクション

インデックスを一切設定しないことも可能です。コレクションとプロパティの両方でインデックスをスキップすることで、インデックスなしのコレクションを作成できます。

<details>
  <summary>インデックスなしの転置インデックス設定例 - JSON オブジェクト</summary>

転置インデックスを使用しない完全なコレクション オブジェクトの例:

```js
{
    "class": "Author",
    "description": "A description of this collection, in this case, it's about authors",
    "vectorIndexConfig": {
        "skip": true // <== disable vector index
    },
    "properties": [
        {
            "indexFilterable": false,  // <== disable filterable index for this property
            "indexSearchable": false,  // <== disable searchable index for this property
            "dataType": [
                "text"
            ],
            "description": "The name of the Author",
            "name": "name"
        },
        {
            "indexFilterable": false,  // <== disable filterable index for this property
            "dataType": [
                "int"
            ],
            "description": "The age of the Author",
            "name": "age"
        },
        {
            "indexFilterable": false,  // <== disable filterable index for this property
            "dataType": [
                "date"
            ],
            "description": "The date of birth of the Author",
            "name": "born"
        },
        {
            "indexFilterable": false,  // <== disable filterable index for this property
            "dataType": [
                "boolean"
            ],
            "description": "A boolean value if the Author won a nobel prize",
            "name": "wonNobelPrize"
        },
        {
            "indexFilterable": false,  // <== disable filterable index for this property
            "indexSearchable": false,  // <== disable searchable index for this property
            "dataType": [
                "text"
            ],
            "description": "A description of the author",
            "name": "description"
        }
    ]
}
```

</details>

## 参照資料

:::info Related pages

- [Configuration: Inverted index](../../config-refs/indexing/inverted-index.mdx)
- [How-to: Configure collections](../../manage-collections/vector-config.mdx#property-level-settings)

:::

## 質問とフィードバック

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>