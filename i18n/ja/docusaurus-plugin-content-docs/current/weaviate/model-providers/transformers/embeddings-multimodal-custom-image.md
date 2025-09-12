---
title: マルチモーダル埋め込み（カスタム）
description: Transformers カスタムイメージ マルチモーダル埋め込み
sidebar_position: 35
image: og/docs/integrations/provider_integrations_transformers.jpg
# tags: ['model providers', 'huggingface', 'embeddings', 'clip']
---

# ローカルホスト CLIP 埋め込み + Weaviate（カスタム画像）


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyConnect from '!!raw-loader!../_includes/provider.connect.py';
import TSConnect from '!!raw-loader!../_includes/provider.connect.ts';
import PyCode from '!!raw-loader!../_includes/provider.vectorizer.py';
import TSCode from '!!raw-loader!../_includes/provider.vectorizer.ts';

Weaviate の Hugging Face Transformers ライブラリとの統合により、CLIP モデルの機能を Weaviate から直接利用できます。

Weaviate の ベクトル インデックスを CLIP 連携で構成し、[Weaviate インスタンスを設定](#configure-the-weaviate-instance) してモデルイメージを指定すると、CLIP 推論コンテナ内の指定モデルを用いて各種操作の埋め込みを生成します。この機能は *ベクトライザー* と呼ばれます。

このページでは、[カスタム CLIP モデル イメージを作成](#build-a-custom-clip-model-image) し、それを Weaviate で利用する方法を説明します。これは、使用したいモデルが[事前構築イメージ](./embeddings-multimodal.md#available-models)に含まれていない場合に役立ちます。

カスタムイメージを作成して設定すると、利用方法は事前構築イメージと同一です。

## カスタム CLIP モデル イメージの作成

Weaviate で使用するためのカスタム CLIP モデル イメージを作成できます。これは Hugging Face Model Hub の公開モデルでも、互換性のある非公開またはローカルモデルでもかまいません。

[Hugging Face Model Hub](https://huggingface.co/models) にある **公開 SBERT CLIP** モデルは、カスタム Docker イメージを作成することで Weaviate で利用できます。

カスタムイメージを作成する手順は次のとおりです。

- [モデルをダウンロードする `Dockerfile` を作成](#create-a-dockerfile)
- [Dockerfile をビルドしてタグ付け](#build-and-tag-the-dockerfile)
- [イメージを Weaviate インスタンスで利用](#use-the-image)

#### `Dockerfile` の作成

作成する `Dockerfile` は、Hugging Face Model Hub からの公開モデルを使用するか、非公開またはローカルモデルを使用するかによって異なります。

<Tabs groupId="languages">
<TabItem value="public" label="Public model">

以下の例では、[`clip-ViT-B-32` モデル](https://huggingface.co/sentence-transformers/clip-ViT-B-32) 用のカスタムイメージを作成します。使用したいモデル名に `clip-ViT-B-32` を置き換えてください。  
<br/>

Hugging Face Hub のモデルでイメージをビルドするには、次のような新しい `Dockerfile` を作成します。  
<br/>

`Dockerfile` を `my-inference-image.Dockerfile` として保存します。（任意の名前でかまいません。）  
<br/>

```yaml
FROM semitechnologies/multi2vec-clip:custom
RUN CLIP_MODEL_NAME=clip-ViT-B-32 TEXT_MODEL_NAME=clip-ViT-B-32 ./download.py
```

</TabItem>
<TabItem value="private" label="Private/local model">

Transformers ライブラリの `SentenceTransformers` と `ClIPModel` クラスに互換性のあるモデルであれば、どのモデルでもカスタムイメージを作成できます。テキスト埋め込みと画像埋め込みで互換性のある ベクトル を出力するために、必ず CLIP 用に特別に学習されたモデルのみを使用してください。（CLIP モデルは実際にはテキスト用と画像用の 2 つのモデルで構成されています。）  
<br/>

ローカルのカスタムモデルでイメージを作成するには、次のような新しい `Dockerfile` を作成し、`./my-test-model` と `./my-clip-model` をモデルフォルダーへのパスに置き換えてください。  
<br/>

`Dockerfile` を `my-inference-image.Dockerfile` として保存します。（任意の名前でかまいません。）  
<br/>

この例では、ローカルマシンのフォルダー `my-model` に保存されたモデル用のカスタムイメージを作成します。  
<br/>

```yaml
FROM semitechnologies/multi2vec-clip:custom
COPY ./my-text-model /app/models/text
COPY ./my-clip-model /app/models/clip
```  
<br/>

アプリケーションはモデルファイルを `/app/models/text` と `/app/models/clip` に配置されていることを前提としていますので、これらのパスは変更しないでください。

</TabItem>
</Tabs>

#### Dockerfile のビルドとタグ付け

Dockerfile を例えば `my-inference-image` という名前でタグ付けします:

```shell
docker build -f my-inference-image.Dockerfile -t my-inference-image .
```

#### （任意）イメージをレジストリへプッシュ

別の環境でこのイメージを使用したい場合は、Docker レジストリへプッシュできます:

```shell
docker push my-inference-image
```

#### イメージの利用

`docker-compose.yml` などの [Weaviate 設定](./embeddings.md#weaviate-configuration) で、ローカル Docker タグ（例: `my-inference-image`）またはレジストリのイメージを `image` パラメーターに指定してください。

## Weaviate インスタンスの設定

カスタム Transformers モデルイメージを作成して設定したら、[CLIP 埋め込み連携](./embeddings-multimodal.md) ガイドに従って Weaviate でモデルを使用します。

上記の例では、`multi2vec-clip` サービスの `image` パラメーターにカスタムイメージ名（例: `my-inference-image`）を設定します。

## （任意）推論コンテナのテスト

推論コンテナを設定して起動したら、その機能を直接テストするためにクエリを送信できます。

まず、推論コンテナを公開します。Docker でデプロイしている場合、`docker-compose.yml` の `multi2vec-clip` サービスに次を追加してポートをフォワードします:

```yaml
services:
  weaviate:
    # Additional settings not shown
  multi2vec-clip:
    # Additional settings not shown
    ports:
      - "9090:8080"  # Add this line to expose the container
```

コンテナが起動して公開されたら、次のように REST リクエストを直接送信できます:

```shell
curl localhost:9090/vectors -H 'Content-Type: application/json' -d '{"text": "foo bar"}'
```

コンテナが正しく稼働・設定されていれば、入力テキストの ベクトル 埋め込みがレスポンスとして返ってきます。

### 参考リソース

- Hugging Face [Model Hub](https://huggingface.co/models)



## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>


