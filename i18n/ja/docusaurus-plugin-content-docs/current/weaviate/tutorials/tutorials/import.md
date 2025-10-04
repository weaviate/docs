---
title: インポートの詳細
description: Weaviate における効率的なデータ統合のためのデータインポート手法を理解します。
sidebar_position: 4
image: og/docs/tutorials.jpg
---

import SkipLink from '/src/components/SkipValidationLink'
import UpdateInProgressNote from '/_includes/update-in-progress.mdx';

<UpdateInProgressNote />

import { DownloadButton } from '/src/theme/Buttons';

このセクションでは、データインポートについて、特にバッチインポートプロセスの詳細を説明します。ベクトルの取り込み方法、バッチインポートとは何か、エラー管理の方法、そして最適化のためのアドバイスなどを取り上げます。

## 前提条件

このチュートリアルを始める前に、他のチュートリアルの手順を終えて、以下を準備してください。

- Weaviate のインスタンス（例: [Weaviate Cloud](https://console.weaviate.cloud) 上）  
- OpenAI、Cohere、Hugging Face など、お好みの推論 API 用の API キー  
- お好みの Weaviate クライアントライブラリのインストール  
- スキーマに `Question` クラスを作成  
  - 未作成の場合は、クイックスタートまたは [スキーマ チュートリアル](../starter-guides/managing-collections/index.mdx) を参照してください。

以下のデータセットを使用します。作業ディレクトリにダウンロードしておくことを推奨します。

<p>
  <DownloadButton link="https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json">jeopardy_tiny.json をダウンロード</DownloadButton>
</p>

## インポート設定

[スキーマ チュートリアル](../starter-guides/managing-collections/index.mdx) で説明したとおり、`schema` は Weaviate におけるデータ構造を定義します。

したがって、データインポートでは各レコードのプロパティをスキーマ内の該当クラスのプロパティへマッピングする必要があります。ここで対象となるクラスは、前節で定義した **Question** です。

### データオブジェクト構造

各 Weaviate データオブジェクトは次のような構造を持ちます。

```json
{
  "class": "<class name>",  // as defined during schema creation
  "id": "<UUID>",     // optional, must be in UUID format.
  "properties": {
    "<property name>": "<property value>", // specified in dataType defined during schema creation
  }
}
```

多くの場合、Weaviate ユーザーはクライアントライブラリを通じてデータをインポートします。

ただし最終的には、データは RESTful API の <SkipLink href="/weaviate/api/rest#tag/objects">`objects` エンドポイント</SkipLink> または <SkipLink href="/weaviate/api/rest#tag/batch">`batch` エンドポイント</SkipLink> を介して追加される点に注意してください。

名前が示すとおり、どのエンドポイントを使うかは、オブジェクトを個別に取り込むか、バッチで取り込むかによって決まります。

### バッチ利用の判断

データをインポートする際は、特別な理由がない限り **バッチインポートの使用を強く推奨** します。バッチインポートでは、複数のオブジェクトを 1 回のリクエストで送信できるため、パフォーマンスが大幅に向上します。

バッチインポートは [`batch` REST エンドポイント](../manage-objects/import.mdx) を通じて行われます。

### バッチインポートプロセス

一般的なバッチインポートの流れは次のとおりです。

1. Weaviate インスタンスへ接続  
1. データファイルからオブジェクトを読み込む  
1. バッチ処理を準備  
1. レコードをループ処理  
    1. 各レコードをパースし、オブジェクトを構築  
    1. オブジェクトをバッチ処理へ追加  
1. バッチ処理をフラッシュ（バッファに残ったオブジェクトを送信）

以下は **Question** オブジェクトをインポートするための完全なコードです。

import CodeImportQuestions from '/_includes/code/quickstart.import.questions.mdx';

<CodeImportQuestions />

いくつか注意点があります。

#### バッチサイズ

クライアントによっては（例: Python クライアントの `batch_size`）、パラメータとして指定できますし、定期的にフラッシュして手動で調整することもできます。

一般には 20 〜 100 程度が出発点として妥当ですが、各データオブジェクトのサイズによって異なります。各オブジェクトにベクトルを含めてアップロードする場合など、サイズが大きいときはバッチサイズを小さくすると良いでしょう。

#### ベクトルの所在

ここではベクトルを明示的に指定していないことに気付くでしょう。スキーマに `vectorizer` が指定されているため、Weaviate は該当モジュール（ここでは `text2vec-openai`）へリクエストを送り、返されたベクトルをインデックス化してデータオブジェクトに保存します。

### 独自ベクトルの持ち込み

独自のベクトルをアップロードしたい場合は、Weaviate で対応できます。詳細は [こちら](../manage-objects/import.mdx#specify-a-vector) を参照してください。

既存のベクトルを手動でアップロードし、クエリのベクトル化にはベクトライザーモジュールを併用することも可能です。

## データインポートの確認

次のようにブラウザで `<weaviate-endpoint>/v1/objects` を開くと、インポートしたオブジェクトをすぐに確認できます（`<weaviate-endpoint>` はご自身のエンドポイントに置き換えてください）。

```
https://some-endpoint.semi.network/v1/objects
```

あるいは、プロジェクト内のオブジェクトを読み取ることもできます。

import CodeImportGet from '/_includes/code/quickstart.import.get.mdx';

<CodeImportGet />

結果は次のようになります。

```json
{
    "deprecations": null,
    "objects": [
        ...  // Details of each object
    ],
    "totalResults": 10  // You should see 10 results here
}
```

## データインポートのベストプラクティス

大規模データセットをインポートする際は、最適化したインポート戦略を検討する価値があります。以下の点を参考にしてください。

1. もっともボトルネックになりやすいのはインポートスクリプトです。利用可能な CPU をすべて使い切ることを目指しましょう。  
1. 複数の CPU を効率的に使うには、データインポート時にシャーディングを有効にします。最速を目指す場合は、単一ノードでもシャーディングを有効にしてください。  
1. [並列化](https://www.computerhope.com/jargon/p/parallelization.htm) を活用します。CPU 使用率が 100 % でなければ、インポートプロセスを追加します。  
1. インポート中は `htop` で CPU 使用率を確認します。  
1. インポート時のメモリ不足を避けるため、`LIMIT_RESOURCES` を `True` に設定するか、`GOMEMLIMIT` 環境変数を設定します。詳細は [環境変数](/deploy/configuration/env-vars/index.md) を参照してください。  
1. Kubernetes では、小さなマシンを多数使うより、大きなマシンを少数使う方が高速です（ネットワーク遅延のため）。

経験則は次のとおりです。

* 常にバッチインポートを使用する  
* 複数シャードを使用する  
* 上述のように CPU（Weaviate クラスター側）を最大限活用する。多くの場合、インポートスクリプトがボトルネックになります  
* エラーメッセージを処理する  
* 一部のクライアント（例: Python）は、バッチインポートを効率的に制御するロジックを内蔵しています  

### エラー処理

<!-- TODO[g-despot]: Add link to external Python references once created for "this example" -->
たとえば次の例のように、オブジェクト単位でエラー処理を実装することをおすすめします。

:::tip `200` status code != 100% バッチ成功
HTTP `200` ステータスコードは、**リクエスト** が Weaviate に正常に送信されたことだけを示します。つまり、接続やバッチの処理に問題がなく、リクエストが不正ではなかったということです。

ただし、`200` レスポンスのリクエストでもオブジェクト単位のエラーが含まれる場合があります。そのため、エラー処理は極めて重要です。
:::

## まとめ

* インポートするデータはデータベーススキーマと一致させる
* 特別な理由がない限り、バッチインポートを使用する
* 大規模データセットをインポートする場合は、インポート戦略を検討し最適化する

## 参考資料

- [チュートリアル: スキーマの詳細](../starter-guides/managing-collections/index.mdx)
- [チュートリアル: クエリの詳細](./query.md)
- [チュートリアル: モジュール入門](./modules.md)
- [チュートリアル: Weaviate Console 入門](/cloud/tools/query-tool.mdx)

### その他のオブジェクト操作

その他の CRUD オブジェクト操作は、[manage-data](../manage-collections/index.mdx) セクションをご覧ください。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>