---
title: モジュール
sidebar_position: 11
image: og/docs/configuration.jpg
# tags: ['configuration', 'modules']
---

Weaviate の機能は、[モジュール](/weaviate/concepts/modules.md) を使用してカスタマイズできます。ここでは、モジュールを有効化して設定する方法について説明します。

## インスタンスレベルの設定

インスタンス (つまり Weaviate クラスター) レベルでは、次のことが行えます。

- モジュールの有効化  
- デフォルト ベクトライザー モジュールの設定  
- モジュール固有の変数 (例: API キー) の設定

これらは、以下のように適切な [環境変数](/deploy/configuration/env-vars/index.md) を設定することで行えます。

:::tip WCD については？
Weaviate Cloud (WCD) のインスタンスにはモジュールがあらかじめ設定されています。詳細は [こちらのページ](/cloud/manage-clusters/status#enabled-modules) をご覧ください。
:::

### 個別モジュールの有効化

`ENABLE_MODULES` 変数にモジュールのリストを指定すると、モジュールを有効化できます。たとえば、以下のコードは `text2vec-transformers` モジュールを有効化します。

```yaml
services:
  weaviate:
    environment:
      ENABLE_MODULES: 'text2vec-transformers'
```

複数のモジュールを有効化する場合は、カンマ区切りで追加します。

次の例では、`text2vec-huggingface`、`generative-cohere`、`qna-openai` モジュールを有効化します。

```yaml
services:
  weaviate:
    environment:
      ENABLE_MODULES: 'text2vec-huggingface,generative-cohere,qna-openai'
```

### すべての API ベース モジュールを有効化

:::caution 実験的機能
`v1.26.0` 以降で利用可能な実験的機能です。使用にはご注意ください。
:::

`ENABLE_API_BASED_MODULES` 変数を `true` に設定すると、すべての API ベース [モデル統合](../model-providers/index.md) (Anthropic、Cohere、OpenAI など) を有効化できます。これにより関連モジュールがすべて有効化されます。これらのモジュールは軽量のため、まとめて有効化してもリソース使用量が大幅に増えることはありません。

```yaml
services:
  weaviate:
    environment:
      ENABLE_API_BASED_MODULES: 'true'
```

API ベース モジュールの一覧は [モデルプロバイダー統合ページ](../model-providers/index.md#api-based) で確認できます。また、リストが定義されている [ソースコード](https://github.com/weaviate/weaviate/blob/main/adapters/handlers/rest/configure_api.go) を参照することも可能です。

個別モジュールの有効化と組み合わせることもできます。たとえば、次の例ではすべての API ベース モジュール、Ollama モジュール、そして `backup-s3` モジュールを有効化しています。

```yaml
services:
  weaviate:
    environment:
      ENABLE_API_BASED_MODULES: 'true'
      ENABLE_MODULES: 'text2vec-ollama,generative-ollama,backup-s3'
```

複数のベクトライザー (例: `text2vec`, `multi2vec`) モジュールを有効化すると、[`Explore` 機能](../api/graphql/explore.md) が無効化されます。`Explore` を使用する必要がある場合は、ベクトライザー モジュールを 1 つだけ有効化してください。

### モジュール固有の変数

モジュールによっては、追加の環境変数設定が必要です。たとえば、`backup-s3` モジュールでは `BACKUP_S3_BUCKET` にバックアップ用 S3 バケットを指定する必要があり、`text2vec-contextionary` モジュールでは `TRANSFORMERS_INFERENCE_API` に推論 API の場所を指定する必要があります。

詳細は各 [モジュールのドキュメント](../modules/index.md) を参照してください。

## ベクトライザーモジュール

[ベクトル化統合](../model-providers/index.md) により、インポート時にデータをベクトル化し、`nearText` や `nearImage` などの [`near<Media>`](../search/similarity.md) 検索を実行できます。

:::info 利用可能なベクトライザー統合の一覧
[こちらのセクション](../model-providers/index.md) に掲載しています。
:::

### ベクトライザーモジュールの有効化

`ENABLE_MODULES` 環境変数に追加することで、ベクトライザーモジュールを有効化できます。下記コードは `text2vec-cohere`、`text2vec-huggingface`、`text2vec-openai` の各ベクトライザーモジュールを有効化します。

```yaml
services:
  weaviate:
    environment:
      ENABLE_MODULES: 'text2vec-cohere,text2vec-huggingface,text2vec-openai'
```

### デフォルト ベクトライザー モジュール

`DEFAULT_VECTORIZER_MODULE` 変数を使用して、デフォルトのベクトライザーモジュールを指定できます。

デフォルト ベクトライザーモジュールを設定しない場合、スキーマでベクトライザーを設定するまで `near<Media>` やインポート時のベクトル化は利用できません。

次のコードでは `text2vec-huggingface` をデフォルト ベクトライザーとして設定しています。そのため、クラスで別のベクトライザーを指定しない限り、`text2vec-huggingface` が使用されます。

``` yaml
services:
  weaviate:
    environment:
      DEFAULT_VECTORIZER_MODULE: text2vec-huggingface
```

## 生成モデル統合

[生成モデル統合](../model-providers/index.md) により、[検索拡張生成](../search/generative.md) 機能を利用できます。

### 生成モジュールの有効化

生成モジュールを有効化するには、目的のモジュールを `ENABLE_MODULES` 環境変数に追加します。以下のコードは、`generative-cohere` モジュールと `text2vec-huggingface` ベクトライザーモジュールを有効化します。

```yaml
services:
  weaviate:
    environment:
      ENABLE_MODULES: 'text2vec-huggingface,generative-cohere'
```

:::tip `generative` モジュールと `text2vec` モジュールの選択は独立
`text2vec` モジュールの選択が `generative` モジュールの選択を制限することはありません。逆も同様です。
:::

## テナントオフロードモジュール

テナントをコールドストレージにオフロードしてメモリとディスクの使用量を削減し、必要に応じてオンロードできます。

設定方法の詳細は [テナントオフロード設定](/deploy/configuration/tenant-offloading.md) の専用ページをご覧ください。テナントのオフロードとオンロードの方法については、[How-to: テナント状態の管理](../manage-collections/tenant-states.mdx) を参照してください。

## カスタムモジュール

独自モジュールの作成と使用方法については [こちら](../modules/custom-modules.md) をご覧ください。

## 使用量モジュール

[使用量モジュール](../modules/usage-modules.md) は、使用状況の分析データを GCS または S3 に収集しアップロードします。 

## 関連ページ
- [概念: モジュール](../concepts/modules.md)
- [リファレンス: モジュール](../modules/index.md)

## 質問・フィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>


