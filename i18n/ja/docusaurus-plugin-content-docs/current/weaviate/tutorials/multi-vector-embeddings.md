---
title: マルチベクトル埋め込み（ColBERT、ColPali など）
description: Weaviate でマルチベクトル埋め込みを使用する方法を学びます。
sidebar_position: 2
image: og/docs/tutorials.jpg
# tags: ['import']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/weaviate/tutorials/_includes/multi-vector-embeddings.py';
import TSCode from '!!raw-loader!/docs/weaviate/tutorials/_includes/multi-vector-embeddings.ts';

このセクションでは、 Weaviate でマルチベクトル埋め込みを利用する方法を説明します。マルチベクトル埋め込み（ColBERT、ColPali、ColQwen などのモデルで実装）は、各オブジェクトやクエリを 1 つのベクトルではなく複数のベクトルで表します。この手法は、テキスト全体を比較するのではなく部分ごとに照合する「レイトインタラクション」により、より高精度な検索を実現します。

## 必要条件

開始前に、以下を準備してください。

- [Weaviate Cloud](https://console.weaviate.cloud) またはローカルなどで稼働する Weaviate インスタンス（バージョン `v1.29` 以上）
- お好みの Weaviate クライアントライブラリ
- Jina AI の API キー  
  - 無料の “toy” キーは [Jina AI](https://jina.ai/) から取得できます。

:::tip クイックスタートガイドを参照
Weaviate のセットアップおよびクライアントライブラリのインストール方法は、[クラウド](../quickstart/index.md) または [ローカル](../quickstart/local.md) のクイックスタートガイドをご覧ください。
:::

## はじめに

ベクトルデータベースを利用したことがある方は、オブジェクトを 1 本のベクトルで表現する概念に馴染みがあるでしょう。たとえば、テキスト `"A very nice cat"` は次のようなベクトルで表せます。

```text
[0.0412, 0.1056, 0.5021, ...]
```

一方、マルチベクトル埋め込みでは同じオブジェクトを 2 次元のベクトル集合で表現します。たとえば、テキスト `"A very nice cat"` を ColBERT で埋め込むと、次のようになります。

```text
[
    [0.0543, 0.1941, 0.0451, ...],
    [0.0123, 0.0567, 0.1234, ...],
    ...,
    [0.4299, 0.0491, 0.9811, ...]
]
```

この表現の核となる考え方は、テキストの各部分の意味を個別のベクトルで捉える点です。たとえば、最初のベクトルはトークン `"A"`、次のベクトルは `"very"`、という具合です。

![シングル vs マルチベクトル埋め込み比較ビジュアライゼーション](./_includes/single_multi_vector_comparison_light.png#gh-light-mode-only "シングル vs マルチベクトル埋め込み比較ビジュアライゼーション")
![シングル vs マルチベクトル埋め込み比較ビジュアライゼーション](./_includes/single_multi_vector_comparison_dark.png#gh-dark-mode-only "シングル vs マルチベクトル埋め込み比較ビジュアライゼーション")

マルチベクトル表現によりオブジェクト間の比較がよりきめ細かくなり、類似オブジェクトの検索精度が向上します。

Weaviate `1.29` からマルチベクトル埋め込みがサポートされ、オブジェクトをマルチベクトルで保存・検索できるようになりました。

本チュートリアルでは、[ColBERT モデル統合](#option-1-colbert-model-integration)（JinaAI のモデルを使用）と [ユーザー提供埋め込み](#option-2-user-provided-embeddings) の 2 通りで、Weaviate でマルチベクトル埋め込みを扱う方法を紹介します。

興味のあるセクションへ直接移動するか、順番にお読みください。

- [ColBERT モデル統合](#option-1-colbert-model-integration)
- [ユーザー提供埋め込み](#option-2-user-provided-embeddings)

:::info 詳しく: 「レイトインタラクション」とは

レイトインタラクションは、テキストの個々の部分（単語やフレーズ）を比較することで細かな意味を保持し、類似度を計算する手法です。ColBERT などのモデルはこの技術を用い、従来のシングルベクトル方式より高精度なテキストマッチングを実現します。  
<br/>

下図は、ColBERT のレイトインタラクションとシングルベクトルモデルを比較したものです。

![ColBERT レイトインタラクション vs シングルベクトル](./_includes/colbert_late_interaction_light.png#gh-light-mode-only "ColBERT レイトインタラクション vs シングルベクトル")
![ColBERT レイトインタラクション vs シングルベクトル](./_includes/colbert_late_interaction_dark.png#gh-dark-mode-only "ColBERT レイトインタラクション vs シングルベクトル")

<small>図: レイトインタラクションとシングルベクトルの比較</small>  
<br/><br/>

<details>
  <summary>レイトインタラクションをさらに詳しく</summary>

シングルベクトル方式では、2 つの埋め込みは同じ次元数（例: 768）であり、類似度はドット積やコサイン距離などで直接計算されます。相互作用は 2 本のベクトルを比較する瞬間だけです。  
<br/>

クロスエンコーダー型モデルに見られる「アーリーインタラクション」検索では、クエリとオブジェクトが埋め込み生成から比較まで一貫して用いられます。精度は高いものの、クエリが分かる前に埋め込みを事前計算できないため、大規模データセットには向きません。主にリランカー用途で使われます。  
<br/>

レイトインタラクションは両者の中間で、マルチベクトル埋め込みを利用します。  
<br/>

各マルチベクトル埋め込みは複数のベクトルで構成され、各ベクトルはトークンなどオブジェクトの一部を表します。たとえば、あるオブジェクトの埋め込みが (30, 64) なら 64 次元のベクトルが 30 本、別のオブジェクトが (20, 64) なら 20 本という具合です。  
<br/>

レイトインタラクションでは、クエリの各トークンに対しドキュメント内のすべてのトークンを比較し、最も高い類似度（MaxSim）を取ります。例として ‘data science’ を検索すると、フレーズ全体ではなくトークン単位でドキュメントの最適な部分と比較します。最終的な類似度はこれらトークン単位の最適値を組み合わせて算出します。この方法は語順や細かな関係性を捉えやすく、特に長文で効果的です。  
<br/>

レイトインタラクション検索の流れ:  
1. クエリの各ベクトルをオブジェクトの各ベクトルと比較  
1. トークンレベルの比較結果を統合して最終スコアを算出  
<br/>

この手法により、オブジェクト間の微妙な関係性を捉えやすく、検索精度が向上します。
</details>

:::

### マルチベクトル埋め込みの適用場面

マルチベクトル埋め込みは、語順やフレーズ一致が重要な検索タスクに特に有効です。これはトークンレベルの情報を保持し、レイトインタラクションを可能にするためです。ただし、マルチベクトル埋め込みは一般にシングルベクトルよりリソースを多く消費します。

各ベクトルはシングルベクトルより小さいものの、埋め込み全体では多数のベクトルを含むため、総容量は大きくなります。例として、1536 次元のシングルベクトルは (1536 \* 4 bytes) = 6 kB ですが、64 本・各 96 次元のマルチベクトルは (64 \* 96 \* 4 bytes) = 25 kB と 4 倍以上です。

このため、マルチベクトルは保存時のメモリや検索時の計算量が増加します。

また、埋め込み生成の推論時間やコストも、マルチベクトルの方が高くなる場合があります。

したがって、レイトインタラクションの利点が重要で、追加リソースが許容できるタスクに適しています。

## オプション 1：ColBERT モデル統合

ここでは、Weaviate の JinaAI ColBERT モデル統合を用いて、テキストデータのマルチベクトル埋め込みを生成します。

### 1.1. Weaviate への接続

まず、好みのクライアントライブラリで Weaviate インスタンスへ接続します。以下の例ではローカルの Weaviate インスタンスへ接続しています。別の環境を使用する場合は、接続情報を変更してください（[接続例](docs/weaviate/connections/index.mdx)）。

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

ここでは、`"DemoCollection"` というコレクションを定義します。  
このコレクションには、`jina-colbert-v2` の ColBERT モデル統合で設定された名前付き ベクトル が含まれています。

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

### 1.3. データの取り込み

それでは、データを取り込みましょう。ここでは、いくつかの任意のテキストオブジェクトをインポートします。

:::note このシナリオでは Embeddings は不要
上で `text2colbert-jinaai` のモデル統合を設定しました。これにより、 Weaviate が必要に応じて Embedding を取得できます。
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

#### 1.3.1. Embedding 形状の確認

オブジェクトを取得し、その Embedding の形状を確認してみましょう。

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

結果を確認すると、各 Embedding は float のリストのリストで構成されています。

```text
Embedding data type: <class 'list'>
Embedding first element type: <class 'list'>
This embedding's shape is (22, 128)
This embedding's shape is (25, 128)
This embedding's shape is (22, 128)
```

単一 ベクトル の場合は float のリストになることと対比してください。

### 1.4. クエリの実行

データを取り込んだので、マルチ ベクトル Embedding を使用して検索を実行できます。ここでは、セマンティック検索（Near text）、 ベクトル 検索、ハイブリッド検索の方法を見ていきます。

#### 1.4.1. Near text 検索

ColBERT Embedding モデル統合を用いた Near text（セマンティック）検索は、他の Embedding モデル統合と同じ方法で実行できます。Embedding の次元数の違いはユーザーには見えません。

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

#### 1.4.2. ハイブリッド検索（簡易）

Near text 検索と同様に、ColBERT Embedding モデル統合を使ったハイブリッド検索も他の Embedding モデル統合と同じ方法で実行できます。

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

手動でベクトル検索を実行する場合、ユーザーはクエリ埋め込みを指定する必要があります。次の例では、`multi_vector` インデックスを検索するため、クエリ ベクトルは対応するマルチ ベクトルでなければなりません。

この統合では JinaAI の `jina-colbert-v2` モデルを使用しているため、オブジェクト埋め込みと互換性を保つために、JinaAI の API を通じてクエリ埋め込みを手動で取得します。

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

ベクトル埋め込みを明示的に指定するその他の検索でも、上記の手動ベクトル検索と同様に、必ずマルチ ベクトル埋め込みを使用する必要があります。

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

ここでは、ユーザーが提供した埋め込みを使用して Weaviate を構築します。これは、Weaviate が統合するモデルとは異なるモデルを使用したい場合に便利です。

:::tip モデル統合とユーザー提供埋め込みの併用
モデル統合を使用していても、ユーザー提供の埋め込みを渡すことができます。オブジェクトに埋め込みが指定されている場合は、モデル統合よりも優先して使用されます。  
<br/>

これにより、既存の埋め込みを活用しながら、他のオブジェクトではモデル統合の利便性を享受できます。
:::

### 2.1. Weaviate への接続

まず、お好みのクライアントライブラリを使用して Weaviate インスタンスに接続します。この例ではローカルの Weaviate インスタンスに接続する想定です。別の種類のインスタンスに接続する場合は、必要に応じて接続情報を置き換えてください（[接続例](docs/weaviate/connections/index.mdx)）。

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

ここでは `"DemoCollection"` というコレクションを定義します。埋め込みを手動で提供するため、モデル統合は使用しません。

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

これでデータをインポートできます。この例では、任意のテキスト オブジェクトをいくつかインポートします。

この例では、各オブジェクトは対応する multi-vector 埋め込みと一緒に Weaviate に送信される点に注意してください。ここでは Jina AI の ColBERT 埋め込みを取得していますが、任意の multi-vector 埋め込みを使用できます。

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

データをインポートしたので、multi-vector 埋め込みを使って検索を実行できます。ここではベクトル検索とハイブリッド検索の方法を見ていきましょう。

ユーザー提供の埋め込みでは `near text` 検索は利用できない点に注意してください。この構成では、埋め込みを生成したモデルを Weaviate が認識していないため、テキスト クエリを互換性のある埋め込みに変換できません。

#### 2.4.1. ベクトル検索

クエリの埋め込みを指定することで、手動ベクトル検索を実行できます。この例では、オブジェクト埋め込みを生成したものと同じ Jina AI の `jina-colbert-v2` モデルを使ってクエリをベクトル化します。

これにより、クエリ埋め込みとオブジェクト埋め込みの互換性が保証されます。

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

#### 2.4.2. ハイブリッド検索（手動ベクトル）

ユーザー提供の埋め込みでハイブリッド検索を行うには、ハイブリッド クエリと一緒にクエリ ベクトルを渡してください。

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

このチュートリアルでは、 Weaviate でマルチベクトル埋め込みを使用する方法を説明しました。

Weaviate は、バージョン v1.29 以降でマルチベクトル埋め込みを利用できます。 ColBERT モデル統合を使うか、ご自身で埋め込みを提供するかのいずれかです。

マルチベクトル埋め込みを使用する場合、ベクトルインデックスを手動で設定してマルチベクトルに対応させる必要がある場合があります。これは、埋め込みの形状が単一ベクトル埋め込みとは異なるためです。 ColBERT などのモデル統合を使用する場合は自動で設定されますが、埋め込みを手動で提供する場合は手動設定が必要です。

データの取り込みが完了すれば、セマンティック検索、ハイブリッド検索、ベクトル検索を通常どおり実行できます。主な違いは埋め込みの形状にあり、手動で埋め込みを提供する際にはその点を考慮する必要があります。

## 参考資料

- [ColBERT 論文](https://arxiv.org/abs/2004.12832)、[ColBERT v2 論文](https://arxiv.org/abs/2112.01488)
- [ColPali 論文](https://arxiv.org/abs/2407.01449)

## ご質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>