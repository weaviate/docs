---
title: 検索拡張生成 (RAG)
description: Weaviate でパーソナライズされたデータ検索のための生成検索を始めましょう。
sidebar_position: 3
image: og/docs/tutorials.jpg
# tags: ['getting started']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/starter-guides/generative.py';
import PyCodeV3 from '!!raw-loader!/_includes/code/starter-guides/generative_v3.py';
import TSCodeEduDemo from '!!raw-loader!/_includes/code/starter-guides/generative_edudemo.ts';
import TSCodeEduDemoLegacy from '!!raw-loader!/_includes/code/starter-guides/generative_edudemo-v2.ts';
import TSCodeLocal from '!!raw-loader!/_includes/code/starter-guides/generative_local.ts';
import TSCodeLocalLegacy from '!!raw-loader!/_includes/code/starter-guides/generative_local-v2.ts';

:::info Related pages
- [自分に合った Weaviate はどれ？](./which-weaviate.md)
- [ハウツー: 検索拡張生成](../search/generative.md)
:::

このページでは、 Weaviate を使った検索拡張生成 ( RAG ) の概要をご紹介します。内容は次のとおりです。

- RAG とは何か  
- Weaviate を RAG 用に設定する方法  
- RAG を実行する方法  
- RAG を念頭に置いたデータのインポート方法  

### 前提条件

本ガイドは Weaviate にある程度慣れていることを想定していますが、必須ではありません。初めての方は、まず [Weaviate クイックスタートガイド](docs/weaviate/quickstart/index.md) をご覧ください。

## 背景

### 検索拡張生成とは？

検索拡張生成 ( RAG ) は、大規模言語モデル ( LLM ) に対してタスクのプロンプトと共に関連データをコンテキストとして提供する強力な手法です。 RAG 、生成検索、あるいは場合によっては in-context learning とも呼ばれます。

### なぜ RAG を使うのか？

 LLM は非常に強力ですが、重要な 2 つの制限があります。  
- 正しくない、あるいは古い情報を自信満々に生成してしまうこと（「幻覚」とも呼ばれます）  
- 必要な情報が学習データに含まれていない可能性があること  

RAG は 2 段階のプロセスでこの問題を解決します。

まず、クエリを使って関連データを検索します。次に、取得したデータとユーザーからのクエリを組み合わせて LLM にプロンプトを送ります。

これにより LLM に in-context learning が提供され、学習時の記憶や幻覚に頼らず、関連性が高く最新のデータを用いて回答を生成できます。

### Weaviate と検索拡張生成

 Weaviate には RAG をより簡単かつ高速にするための主要機能が組み込まれています。

まず、 Weaviate の検索機能により関連情報を簡単に見つけられます。類似度検索、キーワード検索、ハイブリッド検索に加え、フィルタリング機能を使って必要な情報を取得できます。

さらに、 Weaviate には RAG 機能が統合されているため、検索と生成を 1 つのクエリで実行できます。つまり、 Weaviate の検索機能でデータを取得し、同じクエリ内でそのデータを使って LLM にプロンプトを送ることができます。

これにより、アプリケーションでの RAG ワークフローをより簡単・高速・効率的に実装できます。

## RAG の例

まず、 RAG が実際に動作する例を見てみましょう。その後、 Weaviate を RAG 用に設定する方法を解説します。

ここでは OpenAI の言語モデルとクラウド版 Weaviate を使ってデモを実行しましたが、任意の [デプロイ方法](./which-weaviate.md) と任意の生成 AI [モデル統合](../model-providers/index.md) で実行できます。

以下のようにインスタンスへ接続してください。使用する LLM （ここでは OpenAI）の API キーを必ずご自身のものに置き換えてください。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# Instantiation"
  endMarker="# END Instantiation"
  language="py"
/>
</TabItem>
<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# Instantiation"
  endMarker="# END Instantiation"
  language="pyv3"
/>
</TabItem>
<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeEduDemo}
  startMarker="// Instantiation"
  endMarker="// END Instantiation"
  language="ts"
/>
</TabItem>

<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeEduDemoLegacy}
  startMarker="// Instantiation"
  endMarker="// END Instantiation"
  language="tsv2"
/>
</TabItem>

</Tabs>

### データ検索

次に、書籍の抜粋を例にとってみましょう。ここでは、 [Pro Git book](https://git-scm.com/book/en/v2) からの抜粋を含むコレクションが Weaviate インスタンスに保存されています。

テキストを生成する前に、関連データを取得する必要があります。意味検索を使って `history of git` の意味に最も近い 3 つの抜粋を取得してみましょう。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# DataRetrieval"
  endMarker="# END DataRetrieval"
  language="py"
/>
</TabItem>
<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# DataRetrieval"
  endMarker="# END DataRetrieval"
  language="pyv3"
/>
</TabItem>
<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeEduDemo}
  startMarker="// DataRetrieval"
  endMarker="// END DataRetrieval"
  language="ts"
/>
</TabItem>
<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeEduDemoLegacy}
  startMarker="// DataRetrieval"
  endMarker="// END DataRetrieval"
  language="tsv2"
/>
</TabItem>
</Tabs>

結果は次のようになります（簡略化しています）。

```
{
  "data": {
    "Get": {
      "GitBookChunk": [
        {
          "chapter_title": "01-introduction",
          "chunk": "=== A Short History of Git\n\nAs with many great things in life, Git began with a bit of creative ...",
          "chunk_index": 0
        },
        {
          "chapter_title": "01-introduction",
          "chunk": "== Nearly Every Operation Is Local\n\nMost operations in Git need only local files and resources ...",
          "chunk_index": 2
        },
        {
          "chapter_title": "02-git-basics",
          "chunk": "==\nYou can specify more than one instance of both the `--author` and `--grep` search criteria...",
          "chunk_index": 2
        },
      ]
    }
  }
}

```
### 結果セットの変換

この結果セットは、コードを少し変更するだけで ​RAG​ を用いて新しいテキストへ変換できます。まず、`grouped task` プロンプトを使用して情報を要約してみましょう。

以下のコードスニペットを実行し、結果を確認してください。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# TransformResultSets"
  endMarker="# END TransformResultSets"
  language="py"
/>
</TabItem>
<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# TransformResultSets"
  endMarker="# END TransformResultSets"
  language="pyv3"
/>
</TabItem>
<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeEduDemo}
  startMarker="// TransformResultSets"
  endMarker="// END TransformResultSets"
  language="ts"
/>
</TabItem>
<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeEduDemoLegacy}
  startMarker="// TransformResultSets"
  endMarker="// END TransformResultSets"
  language="tsv2"
/>
</TabItem>
</Tabs>

生成されたテキストは以下のとおりです。

```
- Git began as a replacement for the proprietary DVCS called BitKeeper, which was used by the Linux kernel project.
- The relationship between the Linux development community and BitKeeper broke down in 2005, leading to the development of Git by Linus Torvalds.
- Git was designed with goals such as speed, simple design, strong support for non-linear development, and the ability to handle large projects efficiently.
- Most operations in Git only require local files and resources, making them fast and efficient.
- Git allows browsing project history instantly and can calculate differences between file versions locally.
- Git allows offline work and does not require a network connection for most operations.
- This book was written using Git version 2, but most commands should work in older versions as well.
```

`grouped task` ​RAG​ クエリでは、Weaviate は以下を行います。
- `history of git`​ の意味に最も近い 3 件のパッセージを取得します。
- そして LLM を以下の内容でプロンプトします。
    - すべての検索結果からのテキスト
    - ユーザー提供プロンプト `Summarize the key information here in bullet points`

ユーザーが入力したプロンプトには、対象トピックに関する情報は入っていません。しかし Weaviate が git の歴史に関する関連データを取得したため、その検証可能なデータを用いて要約を生成できました。

これほど簡単に Weaviate で ​RAG​ クエリを実行できます。

:::note あなたの結果は異なる場合があります
生成されたテキストにはばらつきが生じます。これは LLM のランダム性やモデル間の違いによるもので、正常な挙動です。
:::

### 個別オブジェクトの変換

次に、個別オブジェクトを変換する方法を見てみましょう。これは結果セット全体ではなく、各オブジェクトごとにテキストを生成したい場合に便利です。

ここでは、ワインレビューをフランス語かつ絵文字付きで翻訳するようモデルに依頼します。レビューは [公開データセット](https://www.kaggle.com/zynicide/wine-reviews) からのサブセットです。

今回のクエリでは `single prompt` パラメーターを適用しています。つまり LLM は結果セット全体ではなく、各オブジェクト単位でプロンプトされます。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# TransformIndividualObjects"
  endMarker="# END TransformIndividualObjects"
  language="py"
/>
</TabItem>
<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# TransformIndividualObjects"
  endMarker="# END TransformIndividualObjects"
  language="pyv3"
/>
</TabItem>
<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeEduDemo}
  startMarker="// TransformIndividualObjects"
  endMarker="// END TransformIndividualObjects"
  language="ts"
/>
</TabItem>
<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeEduDemoLegacy}
  startMarker="// TransformIndividualObjects"
  endMarker="// END TransformIndividualObjects"
  language="tsv2"
/>
</TabItem>
</Tabs>

クエリを 5 件の制限で実行したため、生成テキストを含む 5 件のオブジェクトが返されるはずです。

最初のオブジェクトについて、生成テキストと元テキストは次のとおりです。

```
===== Generated text =====
🇺🇸🍷🌿🍑🌼🍯🍊🍮🍽️🌟

Origine : États-Unis
Titre : Schmitz 24 Brix 2012 Sauvignon Blanc (Sierra Foothills)
Corps de la critique : Pas du tout un Sauvignon Blanc typique, il sent l'abricot et le chèvrefeuille et a le goût de la marmelade. Il est sec, mais a le goût d'un vin de dessert tardif. Attendez-vous à une petite aventure gustative ici.

===== Original review =====
Country: US,
Title: Schmitz 24 Brix 2012 Sauvignon Blanc (Sierra Foothills)
Review body Not at all a typical Sauvignon Blanc, this smells like apricot and honeysuckle and tastes like marmalade. It is dry, yet tastes like a late-harvest dessert wine. Expect a little taste adventure here.
```

ここで Weaviate は以下を実行しました。
- `fruity white wine`​ の意味に最も類似したワインレビューを 5 件取得。
- 各結果に対し、ユーザープロンプトで `{country}`、`{title}`、`{review_body}` を該当テキストに置き換えて LLM に提示。

どちらの例でも、Weaviate は取得したデータに基づきながらもオリジナルの新しいテキストを返しています。これにより、データ検索と自然言語生成の強みを組み合わせた ​RAG​ の力を実感できます。

## RAG のエンドツーエンド

では、Weaviate を用いた ​RAG​ のエンドツーエンド例を見ていきましょう。

### ご自身の Weaviate インスタンス

この例では、書き込み権限のある Weaviate インスタンスが必要です。ローカル Docker インスタンスや WCD インスタンスなど、任意の Weaviate を使用できます。
### RAG 用 Weaviate 設定

import MutableGenerativeConfig from '/_includes/mutable-generative-config.md';

<MutableGenerativeConfig />

RAG を使用するには、適切な `generative-xxx` モジュールを次のように設定する必要があります:  
- Weaviate で有効化されていること  
- コレクション定義で指定されていること  

各モジュールは特定の LLM グループに紐付けられています。たとえば `generative-cohere` は Cohere モデル、`generative-openai` は OpenAI モデル、`generative-google` は Google モデル向けです。

WCD を使用している場合、モジュールを有効化するための設定は不要です。

<details>
  <summary>有効なモジュールを一覧表示する方法</summary>

以下のように Weaviate インスタンスの `meta` 情報を確認すると、どのモジュールが有効になっているかを確認できます。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# ListModules"
  endMarker="# END ListModules"
  language="py"
/>
</TabItem>
<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# ListModules"
  endMarker="# END ListModules"
  language="pyv3"
/>
</TabItem>
<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeEduDemo}
  startMarker="// ListModules"
  endMarker="// END ListModules"
  language="ts"
/>
</TabItem>
<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeEduDemoLegacy}
  startMarker="// ListModules"
  endMarker="// END ListModules"
  language="tsv2"
/>
</TabItem>
</Tabs>

レスポンスにはモジュールの一覧が含まれます。目的のモジュールが有効になっているか確認してください。

</details>

<details>
  <summary>モジュールを有効化する方法</summary>

設定可能なデプロイメントでは、有効化するモジュールを指定できます。たとえば Docker デプロイでは、以下のように `ENABLE_MODULES` 環境変数にリストすることで設定できます。

```yaml
services:
  weaviate:
    environment:
      ENABLE_MODULES: 'text2vec-cohere,text2vec-huggingface,text2vec-openai,text2vec-google,generative-cohere,generative-openai,generative-googles'
```

設定方法の詳細は、使用しているデプロイメント方法のドキュメント（[Docker](/deploy/installation-guides/docker-installation.md)、[Kubernetes](/deploy/installation-guides/k8s-installation.md)、[Embedded Weaviate](/deploy/installation-guides/embedded.md)）をご参照ください。

</details>

<details>
  <summary>言語モデルを設定する方法</summary>

モデルのプロパティは Weaviate モジュール設定として公開されています。そのため、コレクション定義の `moduleConfig` パラメーターでカスタマイズできます。

たとえば `generative-cohere` モジュールでは、次のプロパティを設定できます。

```json
    "moduleConfig": {
        "generative-cohere": {
            "model": "command-xlarge-nightly",  // Optional - Defaults to `command-xlarge-nightly`. Can also use`command-xlarge-beta` and `command-xlarge`
            "temperatureProperty": <temperature>,  // Optional
            "maxTokensProperty": <maxTokens>,  // Optional
            "kProperty": <k>, // Optional
            "stopSequencesProperty": <stopSequences>, // Optional
            "returnLikelihoodsProperty": <returnLikelihoods>, // Optional
        }
    }
```

また `generative-openai` モジュールは次のように設定できます。

```json
    "moduleConfig": {
        "generative-openai": {
            "model": "gpt-3.5-turbo",  // Optional - Defaults to `gpt-3.5-turbo`
            "temperatureProperty": <temperature>,  // Optional, applicable to both OpenAI and Azure OpenAI
            "maxTokensProperty": <max_tokens>,  // Optional, applicable to both OpenAI and Azure OpenAI
            "frequencyPenaltyProperty": <frequency_penalty>,  // Optional, applicable to both OpenAI and Azure OpenAI
            "presencePenaltyProperty": <presence_penalty>,  // Optional, applicable to both OpenAI and Azure OpenAI
            "topPProperty": <top_p>,  // Optional, applicable to both OpenAI and Azure OpenAI
        },
    }
```

さまざまなモデルプロバイダー統合については、[ドキュメント](../model-providers/index.md)をご覧ください。

</details>

### データベースの投入

RAG 用に Weaviate にデータを追加する方法は、他の用途の場合とほぼ同じです。ただし、チャンク化やデータ構造など、いくつか重要なポイントがあります。

詳細は [ベストプラクティスとヒント](#best-practices--tips) セクションで説明しています。ここではチャンク長を 150 ワード、オーバーラップを 25 ワードに設定します。また、書籍のタイトル、章、チャンク番号を含めます。これにより、チャンクを検索したりフィルターしたりできるようになります。

#### ダウンロードとチャンク化

次のスニペットでは、`Pro Git` のある章をダウンロードし、クリーニングしてチャンク化します。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# ChunkText"
  endMarker="# END ChunkText"
  language="py"
/>
</TabItem>
<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# ChunkText"
  endMarker="# END ChunkText"
  language="pyv3"
/>
</TabItem>
<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeLocal}
  startMarker="// ChunkText"
  endMarker="// END ChunkText"
  language="ts"
/>
</TabItem>
<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLocalLegacy}
  startMarker="// ChunkText"
  endMarker="// END ChunkText"
  language="tsv2"
/>
</TabItem>
</Tabs>

このコードは章のテキストをダウンロードし、150 ワードのチャンクを 25 ワードのオーバーラップ付きで文字列のリスト／配列として返します。
#### コレクション定義の作成

これでチャンク用のコレクション定義を作成できます。RAG を使用するには、下記のように生成モジュールをコレクションレベルで指定する必要があります。

以下の `GitBookChunk` コレクションの定義では、`text2vec-openai` をベクトライザーに、`generative-openai` を生成モジュールに設定しています。`generative-openai` パラメーターには空の辞書／オブジェクトを指定することもでき、その場合はデフォルトのパラメーターが使用されます。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# CreateClass"
  endMarker="# END CreateClass"
  language="py"
/>
</TabItem>
<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# CreateClass"
  endMarker="# END CreateClass"
  language="pyv3"
/>
</TabItem>
<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeLocal}
  startMarker="// CreateClass"
  endMarker="// END CreateClass"
  language="ts"
/>
</TabItem>
<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLocalLegacy}
  startMarker="// CreateClass"
  endMarker="// END CreateClass"
  language="tsv2"
/>
</TabItem>
</Tabs>

#### データのインポート

次に、データを Weaviate にインポートします。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# ImportData"
  endMarker="# END ImportData"
  language="py"
/>
</TabItem>
<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# ImportData"
  endMarker="# END ImportData"
  language="pyv3"
/>
</TabItem>
<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeLocal}
  startMarker="// ImportData"
  endMarker="// END ImportData"
  language="ts"
/>
</TabItem>
<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLocalLegacy}
  startMarker="// ImportData"
  endMarker="// END ImportData"
  language="tsv2"
/>
</TabItem>
</Tabs>

これが完了すると、章から取得したチャンクのコレクションが Weaviate にインポートされているはずです。簡単な集約クエリを実行して確認できます:

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# CountObjects"
  endMarker="# END CountObjects"
  language="py"
/>
</TabItem>
<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# CountObjects"
  endMarker="# END CountObjects"
  language="pyv3"
/>
</TabItem>
<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeLocal}
  startMarker="// CountObjects"
  endMarker="// END CountObjects"
  language="ts"
/>
</TabItem>
<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLocalLegacy}
  startMarker="// CountObjects"
  endMarker="// END CountObjects"
  language="tsv2"
/>
</TabItem>
</Tabs>

これにより、データベースに `10` 個のチャンクが存在することが確認できます。

### 生成クエリ

Weaviate の設定とデータの投入が完了したので、上記の例で示したように生成クエリを実行できます。
#### 単一 (オブジェクトごと) プロンプト

単一プロンプトでは、取得した各オブジェクトとユーザーが入力したプロンプトに基づいて Weaviate にテキストを生成させます。次の例では 2 件のオブジェクトを取得し、それぞれのチャンクのテキストをもとに言語モデルへ俳句の作成を依頼します。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# SinglePrompt"
  endMarker="# END SinglePrompt"
  language="py"
/>
</TabItem>
<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# SinglePrompt"
  endMarker="# END SinglePrompt"
  language="pyv3"
/>
</TabItem>
<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeLocal}
  startMarker="// SinglePrompt"
  endMarker="// END SinglePrompt"
  language="ts"
/>
</TabItem>
<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLocalLegacy}
  startMarker="// SinglePrompt"
  endMarker="// END SinglePrompt"
  language="tsv2"
/>
</TabItem>
</Tabs>

返却される結果は、次のような俳句風のテキストになります。

```
===== Object index: [1] =====
Git's data stored
As snapshots of files, not changes
Efficient and unique

===== Object index: [6] =====
Git has three states:
Untracked, modified, staged.
Commit to save changes.
```

#### グループ化タスク

グループ化タスクは、検索で得られたオブジェクトの集合に対して 1 つのプロンプトを適用する機能です。これにより、ソースドキュメントや関連するパッセージなど、検索結果全体を材料にして言語モデルへ指示を出せます。

この例では、検索結果をもとにトリビア風ツイートを作成するようモデルに依頼します。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# GroupedTask"
  endMarker="# END GroupedTask"
  language="py"
/>
</TabItem>
<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# GroupedTask"
  endMarker="# END GroupedTask"
  language="pyv3"
/>
</TabItem>
<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeLocal}
  startMarker="// GroupedTask"
  endMarker="// END GroupedTask"
  language="ts"
/>
</TabItem>
<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLocalLegacy}
  startMarker="// GroupedTask"
  endMarker="// END GroupedTask"
  language="tsv2"
/>
</TabItem>
</Tabs>

結果は、次のようなソーシャルメディア向けのファクトイドになります。

```
Did you know? 🤔 Git thinks of its data as snapshots, not just changes to files.
📸 Every time you commit, Git takes a picture of all your files and stores a reference to that snapshot.
📂🔗 #GitTrivia
```

#### 検索との組み合わせ

Weaviate における RAG は、オブジェクトの取得とテキスト生成という 2 段階のプロセスで構成されています。つまり、生成に使用したいオブジェクトを取得する際に Weaviate の強力な検索機能をフル活用できます。

次の例では、まず git のステートに関連するパッセージをチャプターから検索し、その結果をもとにツイートを生成します。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# NearTextGroupedTask"
  endMarker="# END NearTextGroupedTask"
  language="py"
/>
</TabItem>
<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# NearTextGroupedTask"
  endMarker="# END NearTextGroupedTask"
  language="pyv3"
/>
</TabItem>
<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeLocal}
  startMarker="// NearTextGroupedTask"
  endMarker="// END NearTextGroupedTask"
  language="ts"
/>
</TabItem>
<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLocalLegacy}
  startMarker="// NearTextGroupedTask"
  endMarker="// END NearTextGroupedTask"
  language="tsv2"
/>
</TabItem>
</Tabs>

生成結果は次のようなテキストになります。

```
📝 Did you know? Git has three main states for files: modified, staged, and committed.
🌳📦📂 Learn more about these states and how they affect your Git project!
#GitBasics #Trivia
```

検索クエリを変更するだけで、異なるトピックについて同様のコンテンツを生成できます。

<Tabs groupId="languages">
<TabItem value="py" label="Python Client v4">
<FilteredTextBlock
  text={PyCode}
  startMarker="# SecondNearTextGroupedTask"
  endMarker="# END SecondNearTextGroupedTask"
  language="py"
/>
</TabItem>
<TabItem value="py3" label="Python Client v3">
<FilteredTextBlock
  text={PyCodeV3}
  startMarker="# SecondNearTextGroupedTask"
  endMarker="# END SecondNearTextGroupedTask"
  language="pyv3"
/>
</TabItem>
<TabItem value="js" label="JS/TS Client v3">
<FilteredTextBlock
  text={TSCodeLocal}
  startMarker="// SecondNearTextGroupedTask"
  endMarker="// END SecondNearTextGroupedTask"
  language="ts"
/>
</TabItem>
<TabItem value="js2" label="JS/TS Client v2">
<FilteredTextBlock
  text={TSCodeLocalLegacy}
  startMarker="// SecondNearTextGroupedTask"
  endMarker="// END SecondNearTextGroupedTask"
  language="tsv2"
/>
</TabItem>
</Tabs>

この場合、生成されるテキストは次のようになります。

```
Did you know? 🤔 Git stores everything by the hash value of its contents, not by file name!
📁🔍 It's hard to lose data in Git, making it a joy to use!
😄🔒 Git thinks of its data as a stream of snapshots, making it more than just a VCS!
📸🌟 Most Git operations are local, so no need for network latency!
🌐💨 #GitTrivia
```

ご覧のとおり、Weaviate の検索機能を活用して生成に使用したいオブジェクトを取得できるため、最新情報という文脈に基づいて言語モデルを適切にグラウンディングできます。
## ベストプラクティスとヒント


### チャンキング

言語処理の文脈では、 「チャンキング」 とはテキストをより小さな単位、すなわち “チャンク” に分割するプロセスを指します。

 RAG では、チャンキングは情報検索と提供される文脈情報の量の両方に影響します。

万能なチャンキング戦略は存在しませんが、一般的なガイドラインをいくつかご紹介します。セマンティックマーカーによる方法とテキスト長による方法の両方が有効な戦略になり得ます。

#### セマンティックマーカーによるチャンキング

段落やセクションなどのセマンティックマーカーを用いると、各チャンク内に関連情報を保持できるため有効な戦略になります。ただし、チャンクの長さが大きく変動しやすい点や、あまり意味のないヘッダーのみのチャンクが発生するといったリスクがあります。

#### テキスト長によるチャンキング

100〜150 ワードのようにテキスト長で区切る方法は、堅牢なベースライン戦略になります。テキストの正確な長さを気にせずに関連情報を取得できますが、文脈的に意味のある部分で区切られず重要な情報が切り落とされる可能性があります。

このリスクを軽減するため、スライディングウィンドウを用いてチャンクを重ねる方法を取れます。チャンク長はワード、トークン、文字など任意の単位で調整可能です。

ベースラインとしては、100〜200 ワードのスライディングウィンドウと 50 ワードのオーバーラップでチャンクを作成する方法が考えられます。

#### 混合戦略によるチャンキング

もう少し複雑な方法としては、段落単位で区切りつつ最大 200 ワード、最小 50 ワードといった制限を設ける混合戦略もあります。

### データ構造

もう一つ重要なのがデータ構造です。たとえば、チャンクオブジェクトに書籍タイトルや章、チャンク番号といったソースレベルの追加データを含めることができます。

これによりチャンクを検索・フィルタリングでき、さらに LLM へのプロンプトにソース文書内の順序でチャンクを渡すなど、生成プロセスを制御できます。

加えて、チャンクをソース文書へ紐付けておくことで、必要に応じてソースの一部または全文を取得することも可能です。

### 複雑なプロンプト

プロンプティングの分野は比較的新しいものの、すでに大きな進歩が見られます。

一例として “[chain-of-thought prompting](https://arxiv.org/abs/2201.11903)” という手法があります。これはプロンプトによってモデルに中間的な推論ステップを促し、回答品質を向上させるものです。

最新の研究動向を追い、さまざまな手法を試すことをおすすめします。

弊社の [Connor Shorten のポッドキャスト](https://weaviate.io/podcast) や、[Arxiv](https://arxiv.org/) などのリソースも情報収集に役立ちます。

## まとめ

本記事では、 Weaviate における RAG のダイナミックな能力を紹介し、検索拡張生成によって大規模言語モデルがどのように強化されるかを説明しました。

具体的な検索機能については、[How-to: search ガイド](../search/index.mdx) をご覧ください。各モジュールの詳細は [Modules セクション](../modules/index.md) で確認できます。


## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>