---
title: Inverted indexes
sidebar_position: 2
image: og/docs/concepts.jpg
# tags: ['basics']
---

<details>
  <summary>2024 年 10 月に追加されたパフォーマンス改善</summary>

Weaviate のバージョン `v1.24.26`、`v1.25.20`、`v1.26.6`、`v1.27.0` では、BM25F スコアリング アルゴリズムに対するパフォーマンス改善とバグ修正を行いました。  
<br/>

- BM25 セグメント マージ アルゴリズムを高速化しました。  
- WAND アルゴリズムを改良し、スコア計算から消費し尽くした語（ term ）を除外し、必要な場合のみ完全ソートを実行します。  
- BM25F の複数プロパティ検索で、すべてのセグメントに対してクエリ語のスコアを合算しないバグを修正しました。  
- 複数セグメントに対する BM25 スコア計算を並列で実行するようにしました。  

常に最新の Weaviate へアップグレードし、このような改善の恩恵を受けることを推奨します。

</details>

### BlockMax WAND アルゴリズム

:::info `v1.30` で追加
:::

BlockMax WAND アルゴリズムは、BM25 およびハイブリッド検索を高速化するための WAND アルゴリズムの派生版です。転置インデックスをブロックに整理し、クエリに関連しないブロックをスキップできるようにすることで、スコアリングが必要なドキュメント数を大幅に削減し、検索性能を向上させます。

BM25（またはハイブリッド）検索が遅い場合で、`v1.30` より前の Weaviate を使用している場合は、BlockMax WAND アルゴリズムを採用した新しいバージョンへ移行して性能が向上するかをお試しください。既存データを以前のバージョンから移行する必要がある場合は、[v1.30 への移行ガイド](/deploy/migration/weaviate-1-30.md)を参照してください。

:::note BlockMax WAND によるスコアの変更

BlockMax WAND アルゴリズムの特性上、BM25 およびハイブリッド検索のスコアは、デフォルトの WAND アルゴリズムとはわずかに異なる場合があります。さらに、単一プロパティ検索と複数プロパティ検索では、IDF とプロパティ長の正規化計算が異なるため、BlockMax WAND のスコアも異なる場合があります。これは期待される挙動でありバグではありません。

:::

### 転置インデックスの設定

Weaviate には 3 種類の転置インデックスがあります。

- `indexSearchable` – BM25 またはハイブリッド検索用の検索可能インデックス  
- `indexFilterable` – 高速な [フィルタリング](../filtering.md) 用の一致ベース インデックス  
- `indexRangeFilters` – 数値範囲での [フィルタリング](../filtering.md) 用の範囲ベース インデックス  

各転置インデックスは、プロパティ単位で `true`（オン）または `false`（オフ）に設定できます。`indexSearchable` と `indexFilterable` はデフォルトでオン、`indexRangeFilters` はデフォルトでオフです。

フィルタリング専用インデックスは [フィルタリング](../filtering.md) のみが可能ですが、検索可能インデックスは検索とフィルタリングの両方に使用できます（ただしフィルタリング性能はフィルタリング専用インデックスほど高速ではありません）。

したがって `"indexFilterable": false` かつ `"indexSearchable": true`（または未設定）の場合、1 つのインデックスのみを更新すればよいため取り込みが高速になりディスク使用量も減りますが、フィルタリング性能は低下します。

プロパティ単位で転置インデックスを有効・無効にする方法は、[関連ハウツー](../../manage-collections/vector-config.mdx#property-level-settings)をご覧ください。

インデックスをオフにするかを判断する目安は次のとおりです。_そのプロパティを基に検索やフィルタリングを一切行わないのであれば、オフにできます。_

#### 転置インデックス種別の概要

import InvertedIndexTypesSummary from '/_includes/inverted-index-types-summary.mdx';

<InvertedIndexTypesSummary/>

- 高速なフィルタリングのために、`indexFilterable` と `indexRangeFilters` のいずれか、または両方を有効にします。  
    - どちらか一方のみ有効な場合、そのインデックスがフィルタリングに使用されます。  
    - 両方を有効にした場合、比較演算子を伴う操作では `indexRangeFilters` が、等価・非等価演算では `indexFilterable` が使用されます。  

次の表は、対象プロパティでいずれか、または両方のインデックスが `true` のとき、どのフィルタが比較を行うかを示しています。

| 演算子 | `indexRangeFilters` のみ | `indexFilterable` のみ | 両方有効 |
| :- | :- | :- | :- |
| 等しい | `indexRangeFilters` | `indexFilterable` | `indexFilterable` |
| 等しくない | `indexRangeFilters` | `indexFilterable` | `indexFilterable` |
| より大きい | `indexRangeFilters` | `indexFilterable` | `indexRangeFilters` |
| 以上 | `indexRangeFilters` | `indexFilterable` | `indexRangeFilters` |
| より小さい | `indexRangeFilters` | `indexFilterable` | `indexRangeFilters` |
| 以下 | `indexRangeFilters` | `indexFilterable` | `indexRangeFilters` |

#### タイムスタンプ用の転置インデックス

[タイムスタンプを基に検索](/weaviate/config-refs/schema/index.md#indextimestamps)するための転置インデックスも有効にできます。

タイムスタンプは現在 `indexFilterable` インデックスで索引化されています。

## インデックスなしのコレクション

インデックスを一切設定しないことも可能です。

インデックスなしのコレクションを作成するには、コレクションとプロパティの両方でインデックス設定を省略します。

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

## 参考リソース

:::info 関連ページ
- [Concepts: Vector Indexing](./vector-index.md)
- [Configuration: Vector index](../../config-refs/schema/vector-index.md)
:::

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>