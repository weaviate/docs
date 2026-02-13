---
title: ResNet 画像 ベクトライザー
sidebar_position: 20
image: og/docs/modules/img2vec-neural.jpg
# tags: ['img2vec', 'img2vec-neural']
---

:::caution 新規プロジェクトには CLIP を推奨
新規プロジェクトでは `img2vec-neural` の代わりに [Transformers マルチモーダル統合](../model-providers/transformers/embeddings-multimodal.md) モジュールの利用を推奨します。これは CLIP モデルを使用しており、`img2vec-neural` が使用する `resnet` モデルよりもモダンなアーキテクチャです。さらに CLIP モデルはマルチモーダルで、画像とテキストの両方を扱えるため、より広いユースケースに適用できます。
:::

`img2vec-neural` モジュールを使用すると、 Weaviate は [`resnet50`](https://arxiv.org/abs/1512.03385) モデルを用いてローカルで画像からベクトルを取得できます。

`img2vec-neural` はモデルを Docker コンテナにカプセル化しており、 GPU 対応ハードウェア上で独立してスケールさせつつ、 CPU 最適化された Weaviate を CPU のみのハードウェア上で動かすことが可能です。

Key notes:

- このモジュールは Weaviate Cloud (WCD) では利用できません。
- 本モジュールを有効にすると [`nearImage` 検索オペレーター](#additional-search-operator) が利用可能になります。
- モデルは Docker コンテナにカプセル化されています。
- 本モジュールは Auto-schema と互換性がありません。 [以下](#class-configuration) のとおりクラスを手動で定義する必要があります。


## Weaviate インスタンス設定

:::info WCD には適用されません
このモジュールは Weaviate Cloud では利用できません。
:::

### Docker Compose ファイル

`img2vec-neural` を使用するには、 Docker Compose ファイル (例: `docker-compose.yml`) で本モジュールを有効にする必要があります。

:::tip 設定ツールの利用を推奨
手動で記述することも可能ですが、 [Weaviate 設定ツール](/deploy/installation-guides/docker-installation.md#configurator) を使って `Docker Compose` ファイルを生成することを推奨します。
:::

#### パラメーター

Weaviate:

- `ENABLE_MODULES` (Required): 有効化するモジュールを指定します。 `img2vec-neural` を含めてください。
- `DEFAULT_VECTORIZER_MODULE` (Optional): 既定のベクトライザーモジュールを指定します。すべてのクラスで `img2vec-neural` を既定にする場合に設定します。
- `IMAGE_INFERENCE_API` (Required): 推論コンテナの URL。

推論コンテナ:

- `image` (Required): 推論コンテナのイメージ名 (例: `semitechnologies/img2vec-pytorch:resnet50` または `semitechnologies/img2vec-keras:resnet50`)。

#### 例

この設定例では `img2vec-neural` を有効にし、既定のベクトライザーに設定し、 Docker コンテナの各種パラメーターを指定しています。ここでは `img2vec-pytorch:resnet50` イメージを使用しています。

```yaml
services:
  weaviate:
    image: cr.weaviate.io/semitechnologies/weaviate:||site.weaviate_version||
    restart: on-failure:0
    ports:
     - 8080:8080
     - 50051:50051
    environment:
      QUERY_DEFAULTS_LIMIT: 20
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: "./data"
      # highlight-start
      ENABLE_MODULES: 'img2vec-neural'
      IMAGE_INFERENCE_API: "http://i2v-neural:8080"
      # highlight-end
      CLUSTER_HOSTNAME: 'node1'
# highlight-start
  i2v-neural:
    image: cr.weaviate.io/semitechnologies/img2vec-pytorch:resnet50
# highlight-end
...
```

### 代替案: 別コンテナの実行

代替として、推論コンテナを Weaviate とは別に起動することも可能です。手順は以下のとおりです。

- Docker Compose ファイルで `img2vec-neural` を有効化する  
- `img2vec-neural` 固有のパラメーターを省略する  
- 推論コンテナを Docker などで個別に起動する  
- `IMAGE_INFERENCE_API` に推論コンテナの URL を設定する  

たとえば Weaviate を Docker 外で動かしている場合は、 `IMAGE_INFERENCE_API="http://localhost:8000"` と設定します。 Weaviate と推論コンテナが同じ Docker ネットワークに属している場合 (同じ `docker-compose.yml` に記述されているなど) は、 `IMAGE_INFERENCE_API=http://i2v-neural:8080` のように Docker の DNS 名を利用できます。

推論コンテナを起動する例:

```shell
docker run -itp "8000:8080" semitechnologies/img2vec-neural:resnet50-61dcbf8
```


## クラス設定

各クラスでのモジュール挙動は [コレクション設定](../manage-collections/vector-config.mdx) で調整できます。

### ベクトル化設定

クラスおよびプロパティの `moduleConfig` セクションでベクトライザーの挙動を設定します。

#### クラスレベル

- `vectorizer` - データをベクトル化する際に使用するモジュール
- `imageFields` - ベクトル化対象となる画像プロパティ名

#### プロパティレベル

- `dataType` - プロパティのデータ型。 `imageFields` で使用する場合は `blob` に設定する必要があります。

#### 例

以下のクラス定義では、 `FashionItem` クラスの `vectorizer` として `img2vec-neural` を設定し、

- `image` プロパティを `blob` 型かつ画像フィールドとして指定しています。

```json
{
  "classes": [
    {
      "class": "FashionItem",
      "description": "Each example is a 28x28 grayscale image, associated with a label from 10 classes.",
      // highlight-start
      "vectorizer": "img2vec-neural",
      "moduleConfig": {
        "img2vec-neural": {
          "imageFields": [
            "image"
          ]
        }
      },
      // highlight-end
      "properties": [
        // highlight-start
        {
          "dataType": [
            "blob"
          ],
          "description": "Grayscale image",
          "name": "image"
        },
        // highlight-end
        {
          "dataType": [
            "number"
          ],
          "description": "Label number for the given image.",
          "name": "labelNumber"
        },
        {
          "dataType": [
            "text"
          ],
          "description": "label name (description) of the given image.",
          "name": "labelName"
        }
      ],
    }
  ]
}
```

:::note すべての `blob` プロパティは base64 エンコードされたデータである必要があります。
:::


### `blob` データオブジェクトの追加

`blob` 型のデータはすべて base64 エンコードする必要があります。画像の base64 文字列を取得するには、 Weaviate クライアントのヘルパーメソッドを使うか、次のコマンドを実行してください。

```bash
cat my_image.png | base64
```

## 追加の検索オペレーター

`img2vec-neural` ベクトライザーモジュールを有効にすると `nearImage` 検索オペレーターが利用可能になります。

## 使用例

### NearImage

import CodeNearImage from '/_includes/code/img2vec-neural.nearimage.mdx';

<CodeNearImage />

## モデルについて

[`resnet50`](https://arxiv.org/abs/1512.03385) は、 residual 畳み込みニューラルネットワークで、 2,550 万個のパラメーターを持ち、 [ImageNet データベース](https://www.image-net.org/) の 100 万枚以上の画像で学習されています。名前が示すとおり合計 50 層で構成され、 48 の畳み込み層、 1 つの MaxPool 層、 1 つの Average Pool 層からなります。



### 利用可能な img2vec-neural モデル

選択できる推論モデルは 2 種類あります。マシンが `arm64` かその他か、また特徴 ベクトル 抽出にマルチスレッドを使用するかどうかに応じて、`keras` と `pytorch` から選択できます。両モデルの違いはそれ以外にはありません。  
- `resnet50` (`keras`):
  - `amd64` をサポートし、`arm64` はサポートしません。
  - 現在 `CUDA` をサポートしていません
  - マルチスレッド推論をサポートします
- `resnet50` (`pytorch`):
  - `amd64` と `arm64` の両方をサポートします。
  - `CUDA` をサポートします
  - マルチスレッド推論はサポートしません

## モデルライセンス

`img2vec-neural` モジュールは `resnet50` モデルを使用しています。  

ライセンス条件がご利用目的に適しているかどうかを評価する責任は利用者にあります。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

