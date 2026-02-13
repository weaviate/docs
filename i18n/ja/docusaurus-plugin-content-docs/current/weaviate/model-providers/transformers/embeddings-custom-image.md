---
title: テキスト埋め込み（カスタム）
description: Transformers カスタムイメージ埋め込み
sidebar_position: 25
image: og/docs/integrations/provider_integrations_transformers.jpg
# tags: ['model providers', 'huggingface', 'embeddings', 'transformers']
---

# ローカルホスト Transformers 埋め込み + Weaviate（カスタムイメージ）


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import PyCode from '!!raw-loader!../_includes/provider.vectorizer.py';
import TSCode from '!!raw-loader!../_includes/provider.vectorizer.ts';

Weaviate と Hugging Face Transformers ライブラリの統合により、Transformers のモデル機能を Weaviate から直接利用できます。

Weaviate ベクトルインデックスを Transformers 統合で構成し、[Weaviate インスタンスを設定](#configure-the-weaviate-instance)してモデルイメージを指定すると、Weaviate は Transformers 推論コンテナ内の指定モデルを使用して各種操作の埋め込みを生成します。この機能は *ベクトライザー* と呼ばれます。

本ページでは、[カスタム Transformers モデルイメージを作成](#build-a-custom-transformers-model-image)し、それを Weaviate で利用する方法を紹介します。これは、ご希望のモデルが[事前構築済みイメージ](./embeddings.md#available-models)に含まれていない場合に役立ちます。

カスタムイメージを構築して設定すれば、利用方法は事前構築済みイメージと同一です。

## カスタム Transformers モデルイメージの作成

Weaviate で使用するカスタム Transformers モデルイメージを作成できます。これは Hugging Face モデル Hub の公開モデルでも、プライベートまたはローカルの互換モデルでも構いません。

[Hugging Face モデル Hub](https://huggingface.co/models) にある埋め込み（feature extraction）モデルは、カスタム Docker イメージを構築することで Weaviate で使用できます。

カスタムイメージを作成する手順は次のとおりです。

- [`Dockerfile` を作成](#create-a-dockerfile)してモデルをダウンロードします。
- [`Dockerfile` をビルドしてタグ付け](#build-and-tag-the-dockerfile)します。
- [イメージを Weaviate インスタンスで使用](#use-the-image)します。

#### `Dockerfile` の作成

作成する `Dockerfile` は、Hugging Face モデル Hub の公開モデルを使うか、プライベートまたはローカルモデルを使うかで異なります。

<Tabs groupId="languages">
<TabItem value="public" label="Public model">

以下の例では [`distilroberta-base` モデル](https://huggingface.co/distilbert/distilroberta-base) 用のカスタムイメージを作成します。`distilroberta-base` を使用したいモデル名に置き換えてください。
<br/>

Hugging Face Hub のモデルでイメージを構築するには、次のような `Dockerfile` を新規作成します。
<br/>

`Dockerfile` を `my-inference-image.Dockerfile` という名前（任意）で保存します。
<br/>

```yaml
FROM semitechnologies/transformers-inference:custom
RUN MODEL_NAME=distilroberta-base ./download.py
```

</TabItem>
<TabItem value="private" label="Private/local model">

Transformers ライブラリの `AutoModel` と `AutoTokenizer` クラスに対応する任意のモデルでもカスタムイメージを作成できます。
<br/>

ローカルのカスタムモデルでイメージを構築するには、次のような `Dockerfile` を新規作成し、`./my-model` をモデルフォルダーのパスに置き換えます。
<br/>

`Dockerfile` を `my-inference-image.Dockerfile` という名前（任意）で保存します。
<br/>

これは、ローカルフォルダー `my-model` に保存されているモデル用のカスタムイメージを作成します。
<br/>

```yaml
FROM semitechnologies/transformers-inference:custom
COPY ./my-model /app/models/model
```
<br/>

アプリケーションがモデルを探すパスは `/app/models/model` ですので、変更しないでください。

</TabItem>
</Tabs>

#### `Dockerfile` のビルドとタグ付け

たとえば `my-inference-image` という名前で `Dockerfile` にタグを付けます:

```shell
docker build -f my-inference-image.Dockerfile -t my-inference-image .
```

#### （オプション）イメージをレジストリへプッシュ

別の環境でイメージを使用する場合は、Docker レジストリへプッシュできます:

```shell
docker push my-inference-image
```

#### イメージの使用

`docker-compose.yml` などの [Weaviate 設定](./embeddings.md#weaviate-configuration)で、ローカルの Docker タグ（例: `my-inference-image`）またはレジストリのイメージ名を `image` パラメーターに指定します。

#### （オプション）`sentence-transformers` ベクトライザーの使用

:::caution 実験的機能
This is an experimental feature. Use with caution.
:::

カスタムイメージを使用する際、環境変数 `USE_SENTENCE_TRANSFORMERS_VECTORIZER` を設定すると、デフォルトの `transformers` ライブラリではなく [`sentence-transformers` ベクトライザー](https://sbert.net/)を利用できます。

## Weaviate インスタンスの設定

カスタム Transformers モデルイメージを構築・設定したら、[Transformers 埋め込み統合](./embeddings.md)ガイドに従って Weaviate でモデルを使用してください。

上記の例では、`text2vec-transformers` サービスの `image` パラメーターにカスタムイメージ名（例: `my-inference-image`）を設定します。

## （オプション）推論コンテナのテスト

推論コンテナが設定されて稼働したら、直接クエリを送信して機能をテストできます。

まず、推論コンテナを公開します。Docker でデプロイしている場合は、`docker-compose.yml` の `text2vec-transformers` サービスに次を追加してポートをフォワードします:

```yaml
services:
  weaviate:
    # Additional settings not shown
  text2vec-transformers:
    # Additional settings not shown
    ports:
      - "9090:8080"  # Add this line to expose the container
```

コンテナが稼働して公開されたら、次のように REST リクエストを直接送信できます:

```shell
curl localhost:9090/vectors -H 'Content-Type: application/json' -d '{"text": "foo bar"}'
```

コンテナが正しく稼働・設定されていれば、入力テキストのベクトル埋め込みを含むレスポンスが返されます。



### 外部リソース

- Hugging Face [Model Hub](https://huggingface.co/models)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

