---
title: インポートの詳細
description: Weaviate における効率的なデータ統合のためのデータインポート手法を理解する。
sidebar_position: 4
image: og/docs/tutorials.jpg
---

import SkipLink from '/src/components/SkipValidationLink'
import UpdateInProgressNote from '/_includes/update-in-progress.mdx';

<UpdateInProgressNote />

import { DownloadButton } from '/src/theme/Buttons';

本セクションでは、データインポート、特にバッチインポート処理の詳細を解説します。 ベクトル の取り込み方法、バッチインポートとは何か、エラーの管理方法、そして最適化のためのアドバイスについて説明します。

## 前提条件

このチュートリアルを開始する前に、以下のチュートリアルの手順を実行し、次を準備してください。

- 例として [ Weaviate Cloud ](https://console.weaviate.cloud) 上などで稼働している Weaviate インスタンス
- OpenAI、Cohere、Hugging Face など、お好みの推論 API 用の API キー
- ご利用のプログラミング言語向けの Weaviate クライアントライブラリのインストール
- スキーマ内に `Question` クラスを作成  
    - 未作成の場合はクイックスタートや [スキーマチュートリアル](../starter-guides/managing-collections/index.mdx) を参照して `Question` クラスを構築してください。

以下のデータセットを使用します。作業ディレクトリにダウンロードしておくことを推奨します。

<p>
  <DownloadButton link="https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json">jeopardy_tiny.json をダウンロード</DownloadButton>
</p>

## インポート設定

[スキーマチュートリアル](../starter-guides/managing-collections/index.mdx) で説明したとおり、`schema` は Weaviate のデータ構造を定義します。

そのため、データインポートでは各レコードのプロパティをスキーマ内の該当クラスのプロパティへマッピングする必要があります。ここでは、前節で定義した **Question** クラスが該当します。

### データオブジェクトの構造

各 Weaviate データオブジェクトは次のような構造になっています。

```json
{
  "class": "<class name>",  // as defined during schema creation
  "id": "<UUID>",     // optional, must be in UUID format.
  "properties": {
    "<property name>": "<property value>", // specified in dataType defined during schema creation
  }
}
```

多くの場合、 Weaviate ユーザーは Weaviate クライアントライブラリを介してデータをインポートします。

ただし、最終的には <SkipLink href="/weaviate/api/rest#tag/objects">`objects` エンドポイント</SkipLink> または <SkipLink href="/weaviate/api/rest#tag/batch">`batch` エンドポイント</SkipLink> を通じて RESTful API でデータが追加される点に留意してください。

名前が示すとおり、どちらのエンドポイントを使用するかは、オブジェクトを個別に取り込むかバッチで取り込むかによって決まります。

### バッチインポートの是非

データをインポートする際、特別な理由がない限り **バッチインポートの利用を強く推奨** します。バッチインポートでは複数のオブジェクトを 1 回のリクエストで送信できるため、パフォーマンスが大幅に向上します。

バッチインポートは [`batch` REST エンドポイント](../manage-objects/import.mdx) を使用して実行されます。

### バッチインポートの流れ

一般的なバッチインポート処理は次のようになります。

1. Weaviate インスタンスへ接続  
1. データファイルからオブジェクトを読み込み  
1. バッチ処理を準備  
1. レコードをループ処理  
    1. 各レコードを解析してオブジェクトを構築  
    1. オブジェクトをバッチ処理に追加  
1. バッチ処理をフラッシュして、バッファに残っているオブジェクトを送信  

以下は **Question** オブジェクトをインポートするための完全なコード例です。

import CodeImportQuestions from '/_includes/code/quickstart.import.questions.mdx';

<CodeImportQuestions />

ここでいくつか注目すべき点があります。

#### バッチサイズ

一部のクライアントではパラメーターとして指定できます（例： Python クライアントの `batch_size`）。または、定期的にバッチをフラッシュすることで手動設定することも可能です。

一般的には 20〜100 件程度が出発点として妥当ですが、これは各データオブジェクトのサイズに依存します。各オブジェクトに ベクトル を含める場合など、サイズが大きいときはより小さい値が望ましい場合があります。

#### ベクトル はどこに？

ベクトル を指定していない点にお気付きかもしれません。スキーマで `vectorizer` が設定されているため、 Weaviate は適切なモジュール（ここでは `text2vec-openai`）へリクエストを送り、データをベクトル化します。レスポンスで返された ベクトル はインデックス化され、データオブジェクトの一部として保存されます。

### 独自ベクトルのアップロード

独自の ベクトル をアップロードしたい場合は、 Weaviate で実行可能です。詳細は [こちら](../manage-objects/import.mdx#specify-a-vector) を参照してください。

既存の ベクトル を手動でアップロードし、クエリのベクトル化にはベクトライザーモジュールを使用することもできます。

## データインポートの確認

インポートしたオブジェクトはブラウザで `<weaviate-endpoint>/v1/objects` を開くことで簡単に確認できます（実際の Weaviate エンドポイントに置き換えてください）。

```
https://some-endpoint.semi.network/v1/objects
```

または、プロジェクト内のオブジェクトを読み取ることもできます。

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

大規模なデータセットをインポートする際は、最適化されたインポート戦略を計画する価値があります。以下の点に留意してください。

1. もっとも発生しやすいボトルネックはインポートスクリプトです。そのため、利用可能なすべての CPU を最大限活用することを目指してください。  
1. CPU を効率的に使用するには、データインポート時にシャーディングを有効にします。最速のインポートを行うには、単一ノードでもシャーディングを有効にしてください。  
1. [並列化](https://www.computerhope.com/jargon/p/parallelization.htm) を使用します。CPU が最大限使用されていない場合は、インポートプロセスを追加するだけです。  
1. インポート中に `htop` を使用して、すべての CPU が最大限に使われているか確認します。  
1. インポート中のメモリ不足を避けるため、`LIMIT_RESOURCES` を `True` に設定するか、`GOMEMLIMIT` 環境変数を設定してください。詳細は [環境変数](/deploy/configuration/env-vars/index.md) を参照してください。  
1. Kubernetes 環境では、多数の小さなマシンよりも少数の大きなマシンの方が高速です（ネットワーク遅延のため）。  

私たちの経験則は次のとおりです。  
* 常にバッチインポートを使用してください。  
* 複数シャードを使用してください。  
* 上述のとおり、CPU（ Weaviate クラスター上）を最大限活用してください。インポートスクリプトがボトルネックになりがちです。  
* エラーメッセージを処理してください。  
* 一部のクライアント（例： Python）は、バッチインポートを効率的に制御する組み込みロジックを備えています。
### エラー処理

<!-- TODO[g-despot]: Add link to external Python references once created for "this example" -->
この例のように、オブジェクト レベルでエラー処理を実装することを推奨します。

:::tip `200` status code != 100% batch success
HTTP `200` ステータス コードは、 **リクエスト** が Weaviate に正常に送信されたことのみを示します。つまり、接続やバッチ処理に問題がなく、リクエストが不正でなかったことを意味します。

`200` 応答を受け取ったリクエストでも、オブジェクト レベルのエラーが含まれている可能性があります。そのため、エラー処理が重要です。
:::

## まとめ

* インポートするデータはデータベース スキーマと一致している必要があります  
* 特別な理由がない限り、バッチ インポートを使用してください  
* 大規模なデータセットをインポートする際は、インポート戦略を検討し最適化するようにしてください  

## 参考資料

- [チュートリアル: スキーマの詳細](../starter-guides/managing-collections/index.mdx)
- [チュートリアル: クエリの詳細](./query.md)
- [チュートリアル: モジュールの紹介](./modules.md)
- [チュートリアル: Weaviate Console の紹介](/cloud/tools/query-tool.mdx)

### その他のオブジェクト操作

その他の CRUD オブジェクト操作については、[manage-data](../manage-collections/index.mdx) セクションをご覧ください。

## ご質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>