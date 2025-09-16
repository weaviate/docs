---
title: 距離メトリクス
description: "ベクトル類似度計算と検索結果ランキングアルゴリズムのための距離メトリクスのオプション。"
image: og/docs/configuration.jpg
---

import SkipLink from '/src/components/SkipValidationLink'

## 利用可能な距離メトリクス

明示的に指定しない場合、 Weaviate のデフォルトの距離メトリクスは `cosine` です。スキーマの一部として [vectorIndexConfig](/weaviate/config-refs/indexing/vector-index.mdx#hnsw-index) フィールドで設定でき（[例](../manage-collections/vector-config.mdx#specify-a-distance-metric)）、以下のいずれかの型を指定できます。

:::tip 距離の比較
いずれの場合も、値が大きいほど類似度は低くなり、値が小さいほど類似度は高くなります。
:::

| Name | 説明 | 定義 | 範囲 | 例 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| <span style={{ whiteSpace: 'nowrap' }}>`cosine`</span> | コサイン（角度）距離。<br/><sub>下記の注 1 を参照</sub> | <span style={{ whiteSpace: 'nowrap' }}>`1 - cosine_sim(a,b)`</span> | <span style={{ whiteSpace: 'nowrap' }}>`0 <= d <= 2`</span> | `0`: 同一のベクトル<br/><br/>`2`: 反対方向のベクトル |
| <span style={{ whiteSpace: 'nowrap' }}>`dot`</span> | ドット積に基づく距離の指標。<br/><br/>より正確には負のドット積。<br/><sub>下記の注 2 を参照</sub> | <span style={{ whiteSpace: 'nowrap' }}>`-dot(a,b)`</span> | <span style={{ whiteSpace: 'nowrap' }}>`-∞ < d < ∞`</span> | `-3`: `-2` より類似<br/><br/>`2`: `5` より類似 |
| <span style={{ whiteSpace: 'nowrap' }}>`l2-squared`</span> | 2 つのベクトル間の二乗ユークリッド距離。 | <span style={{ whiteSpace: 'nowrap' }}>`sum((a_i - b_i)^2)`</span> | <span style={{ whiteSpace: 'nowrap' }}>`0 <= d < ∞`</span> | `0`: 同一のベクトル |
| <span style={{ whiteSpace: 'nowrap' }}>`hamming`</span> | 各次元でのベクトルの差の数。 | <span style={{ whiteSpace: 'nowrap' }}><code>sum(&#124;a_i != b_i&#124;)</code></span> | <span style={{ whiteSpace: 'nowrap' }}>`0 <= d < dims`</span> | `0`: 同一のベクトル |
| <span style={{ whiteSpace: 'nowrap' }}>`manhattan`</span> | 直交軸に沿って測定した 2 つのベクトル次元間の距離。 | <span style={{ whiteSpace: 'nowrap' }}><code>sum(&#124;a_i - b_i&#124;)</code></span> | <span style={{ whiteSpace: 'nowrap' }}>`0 <= d < ∞`</span> | `0`: 同一のベクトル |

お気に入りの距離タイプが見当たらず、 Weaviate に貢献したい場合は、ぜひ [PR](https://github.com/weaviate/weaviate) をお送りください。お待ちしています。

:::note 補足

1. `cosine` を選択した場合、読み取り時にすべてのベクトルが長さ 1 に正規化され、計算効率のためにドット積が距離計算に使用されます。  
2. ドット積自体は類似度メトリクスであり、距離メトリクスではありません。そのため Weaviate では、距離の値が小さいほど類似、値が大きいほど非類似という直感を保つために負のドット積を返します。

:::

## 距離計算の実装と最適化

一般的な Weaviate のユースケースでは、 CPU 時間の大部分がベクトル距離計算に費やされます。近似最近傍インデックスを使用して計算回数を大幅に減らしても、距離計算の効率は [全体のパフォーマンス](/weaviate/benchmarks/ann.md) に大きな影響を与えます。

Weaviate は、以下の距離メトリクスとアーキテクチャに対して SIMD（ Single Instruction, Multiple Data ）命令を使用しています。利用可能な最適化は表に示す順序で解決されます（例: SVE → Neon）。

| 距離 | `arm64` | `amd64` |
| ----------------------------- | ----------- | --------------------------------------------- |
| `cosine`, `dot`, `l2-squared` | SVE または Neon | Sapphire Rapids with AVX512、または AVX2 対応 |
| `hamming`, `manhattan` | SIMD なし | SIMD なし |

アセンブリ言語、 SIMD、ベクトル命令セットに興味がある方は、まだ最適化されていない組み合わせへのご貢献をお待ちしています。

## API における distance フィールド

`distance` は API で 2 つの方法で利用できます。

- [ベクトル検索](../search/similarity.md#set-a-similarity-threshold) が関与する場合、<span style={{ whiteSpace: 'nowrap' }}>`_additional { distance }`</span> を使用して結果に距離を表示できます。  
- 同じく [ベクトル検索](../search/similarity.md#set-a-similarity-threshold) で、<span style={{ whiteSpace: 'nowrap' }}>`nearVector({distance: 1.5, vector: ... })`</span> のように距離を制限条件として指定できます。

## Distance と Certainty の比較

バージョン `v1.14` 以前は、 API で `certainty` のみが利用可能でした。 `certainty` の基本的な考え方は、距離スコアを `0 <= certainty <= 1` に正規化し、1 が同一ベクトル、0 が反対方向のベクトルを表すというものでした。

しかし、この概念は `cosine` 距離に特有です。ほかの距離メトリクスではスコアが無限に広がる場合があります。そのため、現在は `certainty` より `distance` の使用が推奨されています。

互換性維持のため、距離が `cosine` の場合に限り `certainty` を引き続き使用できます。それ以外の距離を選択した場合、 `certainty` は使用できません。

関連事項: [Search API: 追加プロパティ（メタデータ）](../api/graphql/additional-properties.md)

## 参考情報

- [How-to: コレクションの管理](../manage-collections/index.mdx)
- <SkipLink href="/weaviate/api/rest#tag/schema">REST API: コレクション定義（スキーマ）</SkipLink>
- [概念: データ構造](../concepts/data.md)

## 質問とフィードバック

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>

