---
title: 多ベクトル埋め込み（ColBERT、ColPali など）
description: Weaviate で多ベクトル埋め込みを利用する方法を学びます。
sidebar_position: 2
image: og/docs/tutorials.jpg
# tags: ['import']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/weaviate/tutorials/_includes/multi-vector-embeddings.py';
import TSCode from '!!raw-loader!/docs/weaviate/tutorials/_includes/multi-vector-embeddings.ts';


このセクションでは、Weaviate で多ベクトル埋め込みを使用する方法を紹介します。多ベクトル埋め込み（ColBERT、ColPali、ColQwen などのモデルで実装）は、各オブジェクトやクエリを 1 つのベクトルではなく複数のベクトルで表現します。このアプローチは、テキスト全体を比較するのではなくテキストの個々の部分をマッチングさせる「late interaction」により、より高精度な検索を可能にします。

## 前提条件

始める前に、以下を準備してください。

- Weaviate のインスタンス（例: [Weaviate Cloud](https://console.weaviate.cloud) 上またはローカル）、バージョン `v1.29` 以上  
- お好みの Weaviate クライアントライブラリがインストールされていること  
- Jina AI の API キー  
  - 無料の「toy」キーは [Jina AI](https://jina.ai/) から取得できます。  

:::tip クイックスタートガイドを参照
Weaviate のセットアップとクライアントライブラリのインストール方法については、[クラウド](../quickstart/index.md) もしくは [ローカル](../quickstart/local.md) のクイックスタートガイドをご覧ください。
:::

## はじめに

これまでに vector データベースを利用したことがある場合、1 つのオブジェクトを 1 本のベクトルで表現する概念に慣れているかもしれません。たとえば、テキスト `"A very nice cat"` は次のようなベクトルで表されます。

```text
[0.0412, 0.1056, 0.5021, ...]
```

一方、多ベクトル埋め込みでは同じオブジェクトを入れ子状、つまり 2 次元のベクトル集合で表現します。たとえば、テキスト `"A very nice cat"` は ColBERT 埋め込みでは次のようになります。

```text
[
    [0.0543, 0.1941, 0.0451, ...],
    [0.0123, 0.0567, 0.1234, ...],
    ...,
    [0.4299, 0.0491, 0.9811, ...]
]
```

この表現の核心は、テキストの異なる部分の意味を異なるベクトルで捉えられる点にあります。たとえば、最初のベクトルがトークン `"A"`、2 番目のベクトルがトークン `"very"` を表す、といった具合です。

![Single vs Multi-vector embedding comparison visualization](./_includes/single_multi_vector_comparison_light.png#gh-light-mode-only "Single vs Multi-vector embedding comparison visualization")
![Single vs Multi-vector embedding comparison visualization](./_includes/single_multi_vector_comparison_dark.png#gh-dark-mode-only "Single vs Multi-vector embedding comparison visualization")

多ベクトル表現によりオブジェクト間の比較がよりきめ細かく行えるため、類似オブジェクトの検索精度が向上します。

Weaviate 1.29 では多ベクトル埋め込みがサポートされ、オブジェクトを多ベクトル埋め込みで保存・検索できるようになりました。

本チュートリアルでは、[ColBERT モデル統合](#option-1-colbert-model-integration)（JinaAI のモデル使用）または [ユーザー提供の埋め込み](#option-2-user-provided-embeddings) のどちらかを用いて、多ベクトル埋め込みを Weaviate で利用する方法を紹介します。興味のあるセクションを選んで読み進めてください。

- [ColBERT モデル統合](#option-1-colbert-model-integration)  
- [ユーザー提供の埋め込み](#option-2-user-provided-embeddings)  

:::info 詳しく: late interaction の理解

late interaction は、テキストの単語やフレーズなどの個々の部分を比較することで、細粒度の意味を保持したまま類似度を計算する手法です。ColBERT のようなモデルはこの技術を用いることで、従来の単一ベクトル方式よりも精密なテキストマッチングを実現します。  
<br/>

以下の図は、ColBERT モデルにおける late interaction と単一ベクトルモデルの動作の違いを示しています。

![ColBERT late interaction vs single-vector visualization](./_includes/colbert_late_interaction_light.png#gh-light-mode-only "ColBERT late interaction vs single-vector visualization")
![ColBERT late interaction vs single-vector visualization](./_includes/colbert_late_interaction_dark.png#gh-dark-mode-only "ColBERT late interaction vs single-vector visualization")

<small>図: late interaction と単一ベクトル方式の比較</small>
<br/><br/>

<details>
  <summary>late interaction について詳しく</summary>

単一ベクトル方式では、2 つの埋め込みは同じ次元数（例: 768）を持つため、ドット積やコサイン距離などで直接類似度を計算します。この場合、相互作用は 2 本のベクトルを比較するときに一度だけ発生します。  
<br/>

別のアプローチとして「early interaction」検索があります。いわゆるクロスエンコーダーモデルがこれに当たります。この方法では、クエリとオブジェクトを埋め込み生成および比較プロセスの最初から最後まで一緒に利用します。精度は高くなりますが、クエリが分かる前に埋め込みを事前計算できないため、大規模データセットには不向きで、主に小規模データセットのリランカーで使われます。  
<br/>

late interaction はこれら 2 つの中間的な方法で、多ベクトル埋め込みを用います。  
<br/>

各多ベクトル埋め込みは複数のベクトルで構成され、各ベクトルがトークンなどオブジェクトの一部を表します。たとえば、あるオブジェクトの埋め込み形状が (30, 64) であれば 30 本の 64 次元ベクトル、別のオブジェクトが (20, 64) であれば 20 本の 64 次元ベクトルを持ちます。  
<br/>

late interaction では、MaxSim 演算を用いて各クエリトークンに対して対象テキスト内のすべてのトークンから最適な一致を探します。たとえば「data science」を検索するとき、各トークンレベルのベクトルがドキュメント内で最も関連性の高い部分と比較され、フレーズ全体を 1 度にマッチングするのではありません。最終的な類似度スコアはこれら個別の最適一致を組み合わせて算出されます。トークンレベルのマッチングにより、単語順やニュアンスを捉えやすく、長文に対して特に効果的です。  
<br/>

late interaction 検索では次の手順を取ります。  
1. 各クエリベクトルを各オブジェクトベクトルと比較  
1. これらトークンレベルの比較結果を組み合わせ、最終的な類似度スコアを生成  
<br/>

この手法により、オブジェクト間の微妙な関係を捉えやすくなり、検索結果の精度が向上します。  
</details>

:::

### 多ベクトル埋め込みを使用するタイミング

多ベクトル埋め込みは、単語の順序や正確なフレーズマッチングが重要な検索タスクで特に有効です。これは、多ベクトル埋め込みがトークンレベルの情報を保持し、late interaction を可能にするためです。ただし、多ベクトル埋め込みは単一ベクトル埋め込みよりもリソースを多く必要とします。

各ベクトルは単一ベクトル埋め込みより短いものの、1 つの埋め込みに含まれるベクトル数が多いため、全体のサイズは通常大きくなります。たとえば、1536 次元の単一ベクトル埋め込みは (1536 \* 4 bytes) = 6 kB ですが、96 次元のベクトルが 64 本ある多ベクトル埋め込みは (64 \* 96 \* 4 bytes) = 25 kB と、4 倍以上のサイズになります。

このため、メモリ使用量と検索時の計算量が増大します。

また、多ベクトル埋め込みの生成には計算コストが高くなる場合があるため、推論時間や費用も増える可能性があります。

したがって、多ベクトル埋め込みは late interaction の利点が重要で、追加リソースを許容できるタスクに適しています。

## オプション 1: ColBERT モデル統合

ここでは、JinaAI の ColBERT モデルと Weaviate のモデル統合を使用して、テキストデータの多ベクトル埋め込みを生成します。

### 1.1. Weaviate へ接続

まず、使用するクライアントライブラリで Weaviate インスタンスに接続します。以下の例ではローカルの Weaviate へ接続しています。クラウドインスタンスなど別の環境を利用する場合は、接続情報を適宜変更してください（[接続例](docs/weaviate/connections/index.mdx)）。

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ConnectToWeaviate"
      endMarker="# END ConnectToWeaviate"
      language="py"
    />
  </TabItem>
   <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START ConnectToWeaviate"
      endMarker="// END ConnectToWeaviate"
      language="js"
    />
  </TabItem>

</Tabs>
### 1.2. コレクション設定

ここでは、`"DemoCollection"` というコレクションを定義します。`jina-colbert-v2` ColBERT モデル統合を用いた名前付きベクトルを設定しています。

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ColBERTCollectionConfig"
      endMarker="# END ColBERTCollectionConfig"
      language="py"
    />
  </TabItem>
   <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START ColBERTCollectionConfig"
      endMarker="// END ColBERTCollectionConfig"
      language="js"
    />
  </TabItem>

</Tabs>

### 1.3. データのインポート

次に、データをインポートします。この例では、いくつかの任意のテキストオブジェクトをインポートします。

:::note このシナリオでは埋め込みは不要です
上でモデル統合（`text2colbert-jinaai`）を設定したことを思い出してください。これにより、必要に応じて Weaviate が埋め込みを取得できます。
:::

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ColBERTImport"
      endMarker="# END ColBERTImport"
      language="py"
    />
  </TabItem>
   <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START ColBERTImport"
      endMarker="// END ColBERTImport"
      language="js"
    />
  </TabItem>

</Tabs>

#### 1.3.1. 埋め込みの形状を確認する

オブジェクトを取得し、その埋め込みの形状を確認してみましょう。

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ColBERTCheckEmbeddings"
      endMarker="# END ColBERTCheckEmbeddings"
      language="py"
    />
  </TabItem>
   <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START ColBERTCheckEmbeddings"
      endMarker="// END ColBERTCheckEmbeddings"
      language="js"
    />
  </TabItem>

</Tabs>

結果を確認すると、各埋め込みは浮動小数点数のリストのリストで構成されています。

```text
Embedding data type: <class 'list'>
Embedding first element type: <class 'list'>
This embedding's shape is (22, 128)
This embedding's shape is (25, 128)
This embedding's shape is (22, 128)
```

これは、浮動小数点数のリストである単一ベクトルとは対照的です。

### 1.4. クエリの実行

データをインポートしたので、マルチベクトル埋め込みを使って検索を実行できます。ここでは、セマンティック検索、ベクトル検索、およびハイブリッド検索の方法を見ていきます。

#### 1.4.1. near text 検索

ColBERT 埋め込みモデル統合で near text（セマンティック）検索を行う方法は、他の埋め込みモデル統合と同じです。埋め込みの次元数の違いはユーザーには見えません。

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ColBERTNearText"
      endMarker="# END ColBERTNearText"
      language="py"
    />
  </TabItem>
   <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START ColBERTNearText"
      endMarker="// END ColBERTNearText"
      language="js"
    />
  </TabItem>

</Tabs>

#### 1.4.2. ハイブリッド検索 (シンプル版)

near text 検索と同様に、ColBERT 埋め込みモデル統合でのハイブリッド検索も他の埋め込みモデル統合と同じ方法で実行できます。

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ColBERTHybrid"
      endMarker="# END ColBERTHybrid"
      language="py"
    />
  </TabItem>
   <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START ColBERTHybrid"
      endMarker="// END ColBERTHybrid"
      language="js"
    />
  </TabItem>

</Tabs>
#### 1.4.3. ベクトル検索

手動でベクトル検索を行う場合、ユーザーはクエリ埋め込みを指定する必要があります。次の例では、 `multi_vector` インデックスを検索するため、クエリ ベクトルも対応するマルチ ベクトルでなければなりません。

統合では JinaAI の `jina-colbert-v2` モデルを使用しているため、クエリ埋め込みがオブジェクト埋め込みと互換性を持つよう、JinaAI の API を通じて埋め込みを手動で取得します。

<details>
  <summary>埋め込みを手動で取得する</summary>

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ObtainColBERTEmbedding"
      endMarker="# END ObtainColBERTEmbedding"
      language="py"
    />
  </TabItem>
   <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START ObtainColBERTEmbedding"
      endMarker="// END ObtainColBERTEmbedding"
      language="js"
    />
  </TabItem>

</Tabs>

</details>

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ColBERTVector"
      endMarker="# END ColBERTVector"
      language="py"
    />
  </TabItem>
   <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START ColBERTVector"
      endMarker="// END ColBERTVector"
      language="js"
    />
  </TabItem>

</Tabs>

#### 1.4.4. ハイブリッド検索（手動ベクトル）

クエリにベクトル埋め込みを明示的に指定するその他すべての検索でも、上記の手動ベクトル検索と同様に、マルチ ベクトル埋め込みである必要があります。

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ColBERTHybrid"
      endMarker="# END ColBERTHybrid"
      language="py"
    />
  </TabItem>
   <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START ColBERTHybrid"
      endMarker="// END ColBERTHybrid"
      language="js"
    />
  </TabItem>

</Tabs>

## オプション 2: ユーザー提供の埋め込み

このセクションでは、ユーザー提供の埋め込みを使用して Weaviate を構築します。Weaviate が統合していない別のモデルを使いたい場合に便利です。

:::tip モデル統合とユーザー提供埋め込みの併用
モデル統合を使用している場合でも、ユーザー提供の埋め込みを渡すことができます。オブジェクトに埋め込みが指定されていれば、モデル統合の埋め込みではなく、そちらが使用されます。  
<br/>

これにより、既存の埋め込みを活用しつつ、他のオブジェクトではモデル統合の利便性を享受できます。
:::

### 2.1. Weaviate への接続

まず、お好みのクライアント ライブラリを使って Weaviate インスタンスへ接続します。ここではローカルの Weaviate へ接続する例を示します。別の種類のインスタンスに接続する場合は、必要に応じて接続情報を置き換えてください（[接続例](docs/weaviate/connections/index.mdx)）。

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ConnectToWeaviate"
      endMarker="# END ConnectToWeaviate"
      language="py"
    />
  </TabItem>
 <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START ConnectToWeaviate"
      endMarker="// END ConnectToWeaviate"
      language="js"
    />
  </TabItem>

</Tabs>

### 2.2. コレクション設定

ここでは `"DemoCollection"` というコレクションを定義します。埋め込みは手動で提供するため、モデル統合は使用しません。

コレクション設定では `multi-vector` インデックス オプションを明示的に有効にしています。これはマルチ ベクトル埋め込みを扱うために必要です。

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START UserEmbeddingCollectionConfig"
      endMarker="# END UserEmbeddingCollectionConfig"
      language="py"
    />
  </TabItem>
   <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START UserEmbeddingCollectionConfig"
      endMarker="// END UserEmbeddingCollectionConfig"
      language="js"
    />
  </TabItem>

</Tabs>
### 2.3. データのインポート

これでデータをインポートできます。この例では、いくつかの任意のテキストオブジェクトをインポートします。

この例では、各オブジェクトは対応するマルチ ベクトル埋め込みと共に Weaviate に送信されます。例では Jina AI の ColBERT 埋め込みを取得していますが、任意のマルチ ベクトル埋め込みを使用できます。

<details>
  <summary>埋め込みを手動で取得</summary>

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ObtainColBERTEmbedding"
      endMarker="# END ObtainColBERTEmbedding"
      language="py"
    />
  </TabItem>
   <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START ObtainColBERTEmbedding"
      endMarker="// END ObtainColBERTEmbedding"
      language="js"
    />
  </TabItem>

</Tabs>

</details>

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START UserEmbeddingImport"
      endMarker="# END UserEmbeddingImport"
      language="py"
    />
  </TabItem>
   <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START UserEmbeddingImport"
      endMarker="// END UserEmbeddingImport"
      language="js"
    />
  </TabItem>

</Tabs>

### 2.4. クエリの実行

データをインポートしたので、マルチ ベクトル埋め込みを使って検索を実行できます。ここではベクトル検索とハイブリッド検索の方法を見ていきます。

`near text` 検索はユーザー提供の埋め込みでは利用できません。この構成では、使用したモデルが不明なため、Weaviate はテキストクエリを互換性のある埋め込みに変換できません。

#### 2.4.1. ベクトル検索

クエリの埋め込みを指定することで、手動のベクトル検索を実行できます。この例では、オブジェクト埋め込みを生成したのと同じモデル（ JinaAI の `jina-colbert-v2` ）を使用してクエリをベクトルに変換しています。

これにより、クエリ埋め込みがオブジェクト埋め込みと互換性を持つことが保証されます。

<details>
  <summary>埋め込みを手動で取得</summary>

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ObtainColBERTEmbedding"
      endMarker="# END ObtainColBERTEmbedding"
      language="py"
    />
  </TabItem>
   <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START ObtainColBERTEmbedding"
      endMarker="// END ObtainColBERTEmbedding"
      language="js"
    />
  </TabItem>

</Tabs>

</details>

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ColBERTVector"
      endMarker="# END ColBERTVector"
      language="py"
    />
  </TabItem>
   <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START ColBERTVector"
      endMarker="// END ColBERTVector"
      language="js"
    />
  </TabItem>

</Tabs>

#### 2.4.2. ハイブリッド検索（手動 ベクトル）

ユーザー提供の埋め込みでハイブリッド検索を行うには、ハイブリッドクエリと共にクエリ ベクトルを指定します。

<Tabs groupId="languages">

 <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ColBERTHybrid"
      endMarker="# END ColBERTHybrid"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START ColBERTHybrid"
      endMarker="// END ColBERTHybrid"
      language="js"
    />
  </TabItem>

</Tabs>
## 概要

このチュートリアルでは、Weaviate でマルチ ベクトル埋め込みを使用する方法を紹介しました。

Weaviate は、`v1.29` からマルチ ベクトル埋め込みをサポートしており、ColBERT モデル統合を利用する場合でも、独自の埋め込みを提供する場合でも使用できます。

マルチ ベクトル埋め込みを使用する際は、ベクトルインデックスを手動で設定しておく必要がある場合があります。これは、マルチ ベクトル埋め込みの形状がシングル ベクトル埋め込みと異なるためです。ColBERT などのモデル統合を使用する場合は自動で設定されますが、埋め込みを手動で提供する場合はご自身で設定してください。

データを取り込んだ後は、セマンティック検索、ハイブリッド検索、ベクトル検索を通常どおり実行できます。主な違いは埋め込みの形状にあり、手動で埋め込みを提供する際にはこの点を考慮する必要があります。

## 参考資料

- [ColBERT 論文](https://arxiv.org/abs/2004.12832)、[ColBERT v2 論文](https://arxiv.org/abs/2112.01488)
- [ColPali 論文](https://arxiv.org/abs/2407.01449)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>