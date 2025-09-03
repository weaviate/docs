---
title: 検索拡張生成 (RAG)
sidebar_position: 70
image: og/docs/howto.jpg
# tags: ['how to', 'generative']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/search.generative.py';
import PyCodeV3 from '!!raw-loader!/_includes/code/howto/search.generative-v3.py';
import TSCode from '!!raw-loader!/_includes/code/howto/search.generative.ts';
import TSCodeLegacy from '!!raw-loader!/_includes/code/howto/search.generative-v2.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/mainpkg/search-generative_test.go';

検索拡張生成 (RAG) は、情報検索と生成 AI モデルを組み合わせます。

Weaviate では、RAG クエリは 2 つの要素で構成されます: *検索クエリ* と *モデルへのプロンプト* です。Weaviate はまず検索を実行し、その検索結果とプロンプトの両方を生成 AI モデルに渡した後、生成された応答を返します。

## 生成モデルプロバイダーの設定

:::info `v1.30` で追加
:::

[generative model integration](../model-providers/index.md) で RAG を使用する場合は、以下を行います。
- [コレクションのデフォルト設定を指定](../manage-collections/generative-reranker-models.mdx#specify-a-generative-model-integration) する、または
- クエリの一部として設定を提供します:

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START DynamicRag"
      endMarker="# END DynamicRag"
      language="python"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START DynamicRag"
      endMarker="// END DynamicRag"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">

```ts
// Go support coming soon
```

  </TabItem>
    <TabItem value="java" label="Java">

```ts
// Java support coming soon
```

  </TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

```
Properties: {'country': 'Austria', 'title': 'Gebeshuber 2013 Frizzante Rosé Pinot Noir (Österreichischer Perlwein)', 'review_body': "With notions of cherry and cinnamon on the nose and just slight fizz, this is a refreshing, fruit-driven sparkling rosé that's full of strawberry and cherry notes—it might just be the very definition of easy summer wine. It ends dry, yet refreshing.", 'points': 85, 'price': 21.0}

Single prompt result: Mit Noten von Kirsche und Zimt in der Nase und nur leicht prickelnd, ist dies ein erfrischender, fruchtiger sprudelnder Rosé, der voller Erdbeer- und Kirschnoten steckt - es könnte genau die Definition von leichtem Sommerwein sein. Er endet trocken, aber erfrischend.

Properties: {'price': 27.0, 'points': 89, 'review_body': 'Beautifully perfumed, with acidity, white fruits and a mineral context. The wine is layered with citrus and lime, hints of fresh pineapple acidity. Screw cap.', 'title': 'Stadt Krems 2009 Steinterrassen Riesling (Kremstal)', 'country': 'Austria'}

Single prompt result: Wunderschön parfümiert, mit Säure, weißen Früchten und einem mineralischen Kontext. Der Wein ist mit Zitrus- und Limettennoten durchzogen, mit Anklängen von frischer Ananas-Säure. Schraubverschluss.

Grouped task result: The first review is for the Gebeshuber 2013 Frizzante Rosé Pinot Noir from Austria, describing it as a refreshing and fruit-driven sparkling rosé with cherry and cinnamon notes. It is said to be the perfect easy summer wine, ending dry yet refreshing.

The second review is for the Stadt Krems 2009 Steinterrassen Riesling from Austria, noting its beautiful perfume, acidity, white fruits, and mineral context. The wine is described as layered with citrus and lime flavors, with hints of fresh pineapple acidity. It is sealed with a screw cap.
```

</details>

:::tip

利用可能なモデルや追加オプションの詳細については、[モデルプロバイダーのセクション](../model-providers/index.md) を参照してください。

:::
## 名前付きベクトル

:::info `v1.24` で追加
:::

[named vectors](../config-refs/collections.mdx#named-vectors) を設定したコレクションでベクトルベース検索を行う場合、クエリに `target` ベクトル名を含める必要があります。これにより、Weaviate はクエリ ベクトルと比較する正しいベクトルを見つけることができます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# NamedVectorNearTextPython"
      endMarker="# END NamedVectorNearTextPython"
      language="python"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# NamedVectorNearTextPython"
      endMarker="# END NamedVectorNearTextPython"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// NamedVectorNearText"
      endMarker="// END NamedVectorNearText"
      language="ts"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// NamedVectorNearText"
      endMarker="// END NamedVectorNearText"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# NamedVectorNearTextGraphql"
      endMarker="# END NamedVectorNearTextGraphql"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>レスポンス例</summary>

```
Properties: {'country': 'Austria', 'title': 'Gebeshuber 2013 Frizzante Rosé Pinot Noir (Österreichischer Perlwein)', 'review_body': "With notions of cherry and cinnamon on the nose and just slight fizz, this is a refreshing, fruit-driven sparkling rosé that's full of strawberry and cherry notes—it might just be the very definition of easy summer wine. It ends dry, yet refreshing.", 'points': 85, 'price': 21.0}

Single prompt result: Mit Noten von Kirsche und Zimt in der Nase und nur leicht prickelnd, ist dies ein erfrischender, fruchtiger sprudelnder Rosé, der voller Erdbeer- und Kirschnoten steckt - es könnte genau die Definition von leichtem Sommerwein sein. Er endet trocken, aber erfrischend.

Properties: {'price': 27.0, 'points': 89, 'review_body': 'Beautifully perfumed, with acidity, white fruits and a mineral context. The wine is layered with citrus and lime, hints of fresh pineapple acidity. Screw cap.', 'title': 'Stadt Krems 2009 Steinterrassen Riesling (Kremstal)', 'country': 'Austria'}

Single prompt result: Wunderschön parfümiert, mit Säure, weißen Früchten und einem mineralischen Kontext. Der Wein ist mit Zitrus- und Limettennoten durchzogen, mit Anklängen von frischer Ananas-Säure. Schraubverschluss.

Grouped task result: The first review is for the Gebeshuber 2013 Frizzante Rosé Pinot Noir from Austria, describing it as a refreshing and fruit-driven sparkling rosé with cherry and cinnamon notes. It is said to be the perfect easy summer wine, ending dry yet refreshing.

The second review is for the Stadt Krems 2009 Steinterrassen Riesling from Austria, noting its beautiful perfume, acidity, white fruits, and mineral context. The wine is described as layered with citrus and lime flavors, with hints of fresh pineapple acidity. It is sealed with a screw cap.
```

</details>
## 単一プロンプト検索

単一プロンプト検索では、クエリ結果に含まれる各オブジェクトに対して生成されたレスポンスを返します。<br/>
取得した内容をプロンプト内に挿入するために、`{prop-name}` 構文を使用してオブジェクトの `properties` を定義します。<br/>
プロンプトで使用するプロパティは、クエリで取得するプロパティと一致している必要はありません。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# SingleGenerativePropertiesPython"
      endMarker="# END SingleGenerativePropertiesPython"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# SingleGenerativePropertiesPython"
      endMarker="# END SingleGenerativePropertiesPython"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START SingleGenerativePropertiesTS"
      endMarker="// END SingleGenerativePropertiesTS"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// SingleGenerativeProperties TS"
      endMarker="// END SingleGenerativeProperties TS"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START SingleGenerativeProperties"
      endMarker="// END SingleGenerativeProperties"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# SingleGenerativePropertiesGraphQL"
      endMarker="# END SingleGenerativePropertiesGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

```
Property 'question': Including, in 19th century, one quarter of world's land & people, the sun never set on it
Single prompt result: Did you know that in the 19th century, one quarter of the world's land and people were part of an empire where the sun never set? ☀️🌍 #historybuffs #funfact

Property 'question': From Menes to the Ptolemys, this country had more kings than any other in ancient history
Single prompt result: Which country in ancient history had more kings than any other, from Menes to the Ptolemys? 👑🏛️ #historybuffs #ancientkings
```

</details>

### 追加パラメーター

:::info `v1.30` で追加
:::

単一プロンプト検索を実行する際、追加オプションを指定するために *generative parameters* を利用できます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# SingleGenerativeParametersPython"
      endMarker="# END SingleGenerativeParametersPython"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START SingleGenerativeParametersTS"
      endMarker="// END SingleGenerativeParametersTS"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">

```go
// Go support coming soon
```

  </TabItem>
    <TabItem value="java" label="Java">

```java
// Java support coming soon
```

  </TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

```
Properties: {'points': 400, 'answer': 'the British Empire', 'air_date': datetime.datetime(1984, 12, 10, 0, 0, tzinfo=datetime.timezone.utc), 'question': "Including, in 19th century, one quarter of world's land & people, the sun never set on it", 'round': 'Double Jeopardy!'}

Single prompt result: Did you know that in the 19th century, the sun never set on the British Empire, which included one quarter of the world's land and people? #triviatuesday #britishempire

Debug: full_prompt: "Convert this quiz question: Including, in 19th century, one quarter of world\'s land & people, the sun never set on it and answer: the British Empire into a trivia tweet."

Metadata: usage {
  prompt_tokens: 46
  completion_tokens: 43
  total_tokens: 89
}

Properties: {'points': 400, 'answer': 'Egypt', 'air_date': datetime.datetime(1989, 9, 5, 0, 0, tzinfo=datetime.timezone.utc), 'question': 'From Menes to the Ptolemys, this country had more kings than any other in ancient history', 'round': 'Double Jeopardy!'}

Single prompt result: Did you know that Egypt had more kings than any other country in ancient history, from Menes to the Ptolemys? #triviathursday #ancienthistory

Debug: full_prompt: "Convert this quiz question: From Menes to the Ptolemys, this country had more kings than any other in ancient history and answer: Egypt into a trivia tweet."

Metadata: usage {
  prompt_tokens: 42
  completion_tokens: 36
  total_tokens: 78
}
```

</details>

## グループ化タスク検索

グループ化タスク検索では、クエリ結果をすべて含む 1 件のレスポンスを返します。デフォルトでは、プロンプトにはすべてのオブジェクト `properties` が使用されます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# GroupedGenerativePython"
      endMarker="# END GroupedGenerativePython"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GroupedGenerativePython"
      endMarker="# END GroupedGenerativePython"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START GroupedGenerativeTS"
      endMarker="// END GroupedGenerativeTS"
      language="js"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// GroupedGenerative TS"
      endMarker="// END GroupedGenerative TS"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START GroupedGenerative"
      endMarker="// END GroupedGenerative"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GroupedGenerativeGraphQL"
      endMarker="# END GroupedGenerativeGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

```
Grouped task result: All of these animals are mammals.
```

</details>
### グループ化タスクのプロンプトプロパティの設定

プロンプトで使用するオブジェクト `properties` を定義します。これによりプロンプト内の情報量が制限され、プロンプトの長さが短縮されます。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# GroupedGenerativeProperties Python"
      endMarker="# END GroupedGenerativeProperties Python"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GroupedGenerativeProperties Python"
      endMarker="# END GroupedGenerativeProperties Python"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START GroupedGenerativeProperties"
      endMarker="// END GroupedGenerativeProperties"
      language="ts"
    />
  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// GroupedGenerativeProperties"
      endMarker="// END GroupedGenerativeProperties"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START GroupedGenerativeProperties"
      endMarker="// END GroupedGenerativeProperties"
      language="gonew"
    />
  </TabItem>

  <TabItem value="graphql" label="GraphQL">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# GroupedGenerativePropertiesGraphQL"
      endMarker="# END GroupedGenerativePropertiesGraphQL"
      language="graphql"
    />
  </TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

```
Grouped task result: The commonality among these animals is that they are all native to Australia.
```

</details>

### 追加パラメーター

:::info `v1.30` で追加
:::

グループ化タスクを実行する際に追加のオプションを指定するために、 *generative parameters* を使用できます:

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START GroupedGenerativeParametersPython"
      endMarker="# END GroupedGenerativeParametersPython"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START GroupedGenerativeParametersTS"
      endMarker="// END GroupedGenerativeParametersTS"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">

```go
// Go support coming soon
```

  </TabItem>
    <TabItem value="java" label="Java">

```java
// Java support coming soon
```

  </TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

```
Grouped task result: They are all animals.
Metadata: usage {
  prompt_tokens: 42
  completion_tokens: 36
  total_tokens: 78
}
```

</details>

## 画像の取り扱い

単一プロンプトおよびグループ化タスクで検索拡張生成を行う際、入力の一部として画像を提供することもできます。  
画像を用いた生成検索で利用可能なフィールドは次のとおりです:
- `images`: 画像のバイト列を base64 でエンコードした文字列。  
- `image_properties`: 追加コンテキストとして画像を保存する Weaviate のプロパティ名。

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START WorkingWithImages"
      endMarker="# END WorkingWithImages"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START WorkingWithImages"
      endMarker="// END WorkingWithImages"
      language="ts"
    />
  </TabItem>
  <TabItem value="go" label="Go">

```go
// Go support coming soon
```

  </TabItem>
    <TabItem value="java" label="Java">

```java
// Java support coming soon
```

  </TabItem>
</Tabs>

<details>
  <summary>例: レスポンス</summary>

```
Properties: {'points': 800, 'answer': 'sheep', 'air_date': datetime.datetime(2007, 12, 13, 0, 0, tzinfo=datetime.timezone.utc), 'question': 'Australians call this animal a jumbuck or a monkey', 'round': 'Jeopardy!'}
Properties: {'points': 100, 'answer': 'Australia', 'air_date': datetime.datetime(2000, 3, 10, 0, 0, tzinfo=datetime.timezone.utc), 'question': 'An island named for the animal seen <a href="http://www.j-archive.com/media/2000-03-10_J_01.jpg" target="_blank">here</a> belongs to this country [kangaroo]', 'round': 'Jeopardy!'}
Properties: {'points': 300, 'air_date': datetime.datetime(1996, 7, 18, 0, 0, tzinfo=datetime.timezone.utc), 'answer': 'Kangaroo', 'question': 'Found chiefly in Australia, the wallaby is a smaller type of this marsupial', 'round': 'Jeopardy!'}

Grouped task result: I'll formulate a Jeopardy!-style question based on the image of the koala:

Answer: This Australian marsupial, often mistakenly called a bear, spends most of its time in eucalyptus trees.

Question: What is a koala?
```

</details>
## 関連ページ

- [Weaviate への接続](/weaviate/connections/index.mdx)
- [モデルプロバイダー統合](../model-providers/index.md).
- [API リファレンス: GraphQL: Get](../api/graphql/get.md)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>