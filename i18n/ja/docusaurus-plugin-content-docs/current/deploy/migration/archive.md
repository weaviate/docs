---
title: アーカイブ
image: og/docs/more-resources.jpg
sidebar_position: 10
# tags: ['migration']
---

# 移行ガイド: アーカイブ

このページでは、古いバージョンの Weaviate の移行ガイドをまとめています。最新の移行ガイドについては、親ページの [移行ガイド](./index.md) を参照してください。

## バージョン 1.19.0 への移行

このバージョンでは、新しいテキストインデックス向けに `indexFilterable` と `indexSearchable` という変数が導入されました。これらの値は `indexInverted` の値に基づいて設定されます。

filterable と searchable は別々のインデックスであるため、`v1.19` 以前から `v1.19` へアップグレードした Weaviate インスタンスには filterable インデックスが存在しません。ただし、環境変数 `INDEX_MISSING_TEXT_FILTERABLE_AT_STARTUP` を設定すると、起動時にすべての `text/text[]` プロパティに対して不足している `filterable` インデックスを作成できます。

## バージョン v1.9.0 の変更ログ

* 破壊的変更なし

* *新機能*
  * ### 最初のマルチモーダルモジュール: CLIP モジュール (#1756, #1766)
    このリリースでは、[ `multi2vec-clip` インテグレーション](/weaviate/model-providers/transformers/embeddings-multimodal.md) を導入しました。これは、単一のベクトル空間内でマルチモーダルベクトル化を可能にするモジュールです。クラスには `image` フィールド、`text` フィールド、またはその両方を持たせることができます。同様に、このモジュールは `nearText` 検索と `nearImage` 検索の両方を提供し、画像のみのコンテンツに対するテキスト検索など、さまざまな検索の組み合わせを実現します。

    #### 使い方

    以下は、画像とテキストの両方をベクトル化するクラスの有効なペイロード例です。
    ```json
    {
        "class": "ClipExample",
        "moduleConfig": {
            "multi2vec-clip": {
                "imageFields": [
                    "image"
                ],
                "textFields": [
                    "name"
                ],
                "weights": {
                  "textFields": [0.7],
                  "imageFields": [0.3]
                }
            }
        },
        "vectorIndexType": "hnsw",
        "vectorizer": "multi2vec-clip",
        "properties": [
          {
            "dataType": [
              "text"
            ],
            "name": "name"
          },
          {
            "dataType": [
                "blob"
            ],
            "name": "image"
          }
        ]
      }
      ```

    注意:
       - `moduleConfig.multi2vec-clip` 内の `imageFields` と `textFields` は両方を設定する必要はありません。ただし、少なくともいずれか一方は設定する必要があります。
       - `moduleConfig.multi2vec-clip` 内の `weights` は省略可能です。プロパティが 1 つだけの場合、そのプロパティがすべての重みを取得します。複数のプロパティが存在し、重みが指定されていない場合は、プロパティが等しい重みで扱われます。

    その後、通常どおりデータオブジェクトをインポートできます。`text` または `string` フィールドにはテキストを、`blob` フィールドには base64 エンコードした画像を設定してください。

    #### 制限事項
    * `v1.9.0` 時点では、このモジュールはクラスを明示的に作成する必要があります。auto-schema に依存してクラスを作成すると、どのフィールドをベクトル化するかという設定が欠けてしまいます。これは今後のリリースで改善予定です。

* *修正*
  * `geoCoordinates` を含むクラスを削除するとパニックが発生する可能性があった問題を修正 (#1730)
  * モジュール内のエラーがユーザーに転送されない問題を修正 (#1754)
  * 一部のファイルシステム（例: AWS EFS）でクラスを削除できない問題を修正 (#1757)


## バージョン v1.8.0 への移行

### 移行に関する注意

バージョン `v1.8.0` ではマルチシャードインデックスと水平スケーリングが導入されます。その結果、データセットの移行が必要です。この移行は、`v1.8.0` の Weaviate を初めて起動した際にユーザー操作なしで自動的に実行されます。ただし、移行は元に戻せません。そのため、以下の移行メモをよく読み、ニーズに応じて最適なアップグレード方法を検討してください。

#### データ移行が必要な理由

`v1.8.0` より前の Weaviate ではマルチシャードインデックスをサポートしていませんでした。この機能は計画されていたため、データは固定名の単一シャード内に格納されていました。データを固定シャードからマルチシャード構成に移行する必要があります。シャード数は変更されません。`v1.8.0` をデータセットで実行すると、以下の手順が自動的に行われます。

* Weaviate がクラスの欠落しているシャーディング設定を検出し、デフォルト値で補完します
* シャード起動時、ディスク上に存在しない場合でも `v1.7.x` の固定名シャードが存在すると、Weaviate は自動的に移行が必要であることを認識し、ディスク上のデータを移動します
* Weaviate が起動完了すると、データは移行されています

**Important Notice:** 移行の一環として、Weaviate はシャードをクラスタ内の（唯一の）ノードに割り当てます。このノードには安定したホスト名が必要です。Kubernetes ではホスト名は安定しています（例: `weaviate-0`）。しかし `Docker Compose` では、ホスト名はコンテナの ID になります。コンテナを削除して（例: `docker compose down`）再起動すると、ホスト名が変わってしまいます。その結果、「シャードを保持するノードが見つからない」というエラーが発生します。エラーメッセージを送信するノード自身がシャードを保持していますが、自身の名前が変わったため認識できません。

これを回避するには、**v1.8.0 を起動する前に** 環境変数 `CLUSTER_HOSTNAME=node1` を設定して安定したホスト名を割り当ててください。名前自体は何でも構いませんが、安定している必要があります。

安定したホスト名を設定し忘れて上記のエラーが発生した場合でも、エラーメッセージから以前使用されていたホスト名を取得し、それを明示的に設定することで復旧できます。

例:

エラーメッセージに `"shard Knuw6a360eCY: resolve node name \"5b6030dbf9ea\" to host"` と表示されている場合、`CLUSTER_HOSTNAME=5b6030dbf9ea` を設定すると Weaviate を再び使用できるようになります。

#### アップグレードするか再インポートするか

`v1.8.0` には新機能に加え、多数のバグ修正が含まれています。いくつかのバグは HNSW インデックスのディスク書き込みに影響します。`v1.8.0` より前に作成されたインデックスは、新たに `v1.8.0` で構築したインデックスほど品質が高くない可能性があります。スクリプトでインポートできる場合は、新しい `v1.8.0` インスタンスを用意し、再インポートすることを推奨します。

#### アップグレード後にダウングレードは可能か

`v1.8.0` の初回起動時に行われるデータ移行は自動的には元に戻せません。アップグレード後に `v1.7.x` へダウングレードする予定がある場合は、アップグレード前の状態を必ずバックアップしてください。

### 変更ログ


## バージョン v1.7.2 の変更ログ
* 破壊的変更なし
* 新機能
  * ### 配列データ型 (#1691)
    `boolean[]` と `date[]` を追加しました。
  * ### プロパティ名の制約緩和 (#1562)
    データスキーマのプロパティ名で `/[_A-Za-z][_0-9A-Za-z]*/` を許可しました。これによりアンダースコアや数字が使用でき、末尾が大文字になる問題が解消されます。ただし、ダッシュ（-）やウムラウトなど GraphQL の制限により多くの特殊文字は引き続き使用できません。
* バグ修正
  * ### 配列データ型での集計 (#1686)



## バージョン v1.7.0 の変更履歴
* 破壊的変更なし
* 新機能
  * ### 配列データ型 (#1611)
    今回のリリースから、プリミティブオブジェクトプロパティは単一のプロパティに限定されず、プリミティブのリストも扱えるようになりました。配列型は、他のプリミティブと同様に保存・フィルタリング・集計が可能です。

    オートスキーマは `string`/`text` と `number`/`int` のリストを自動認識します。スキーマで明示的に配列を指定する場合は、`string[]`、`text[]`、`int[]`、`number[]` を使用してください。配列として定義された型は、要素が 1 つだけであっても常に配列のままです。

  * ### 新モジュール: `text-spellcheck` - 誤入力された検索語句をチェックして自動修正 (#1606)
    新しいスペルチェッカーモジュールを使用すると、ユーザーが入力した検索クエリ（既存の `nearText` または `ask` 関数内）が正しく綴られているかを確認し、代替案となる正しい綴りを提案できます。スペルチェックはクエリ時に実行されます。

    モジュールの利用方法は 2 つあります。  
    1. 新しい追加プロパティを介して、提供されたクエリを確認（修正はしない）できます。  
       次のクエリ:
    ```graphql
    {
      Get {
        Post(nearText: {
          concepts: "missspelled text"
        }) {
          content
          _additional {
            spellCheck {
              changes {
                corrected
                original
              }
              didYouMean
              location
              originalText
            }
          }
        }
      }
    }
    ```

       は次のような結果を返します:

    ```
      "_additional": {
        "spellCheck": [
          {
            "changes": [
              {
                "corrected": "misspelled",
                "original": "missspelled"
              }
            ],
            "didYouMean": "misspelled text",
            "location": "nearText.concepts[0]",
            "originalText": "missspelled text"
          }
        ]
      },
      "content": "..."
    },
    ```
    2. 既存の `text2vec-*` モジュールに `autoCorrect` フラグを追加し、誤入力があれば自動的に修正します。

  * ### 新モジュール `ner-transformers` - Transformers で Weaviate からエンティティ抽出 (#1632)
    変換器 (transformer) ベースのモデルを用いて、既存の Weaviate オブジェクトからエンティティをオンザフライで抽出できます。エンティティ抽出はクエリ時に行われます。最高性能を得るには GPU での実行を推奨しますが、CPU でも動作します（スループットは低下します）。

    モジュールの機能を利用するには、クエリに次の新しい `_additional` プロパティを追加してください:

    ```graphql
    {
      Get {
        Post {
          content
          _additional {
            tokens(
              properties: ["content"],    # is required
              limit: 10,                  # optional, int
              certainty: 0.8              # optional, float
            ) {
              certainty
              endPosition
              entity
              property
              startPosition
              word
            }
          }
        }
      }
    }

    ```
    これにより、次のような結果が返されます:

    ```
    "_additional": {
      "tokens": [
        {
          "property": "content",
          "entity": "PER",
          "certainty": 0.9894614815711975,
          "word": "Sarah",
          "startPosition": 11,
          "endPosition": 16
        },
        {
          "property": "content",
          "entity": "LOC",
          "certainty": 0.7529033422470093,
          "word": "London",
          "startPosition": 31,
          "endPosition": 37
        }
      ]
    }
    ```
* バグ修正
  * `number` データ型を集計する際に集計処理が停止する可能性がある問題を修正 (#1660)

## バージョン 1.6.0 の変更履歴
* 破壊的変更なし
* 新機能なし
 *  **ゼロショット分類 (#1603)** 本リリースでは、新しい分類タイプ `zeroshot` が追加されました。これは任意の ベクトライザー またはカスタムベクトルで動作し、ソースオブジェクトとの距離が最も近いラベルオブジェクトを選択します。リンクは既存の Weaviate における分類と同様にクロスリファレンスで行います。`zeroshot` 分類を開始するには `POST /v1/classficiations` リクエストに `"type": "zeroshot"` を指定し、通常どおり `"classifyProperties": [...]` で分類したいプロパティを設定してください。ゼロショットでは学習データを使用しないため `trainingSetWhere` フィルターは設定できませんが、ソース (`"sourceWhere"`) とラベルオブジェクト (`"targetWhere"`) の両方を直接フィルタリングできます。
* バグ修正


## バージョン 1.5.2 の変更履歴

* 破壊的変更なし
* 新機能なし
* バグ修正:
* ### 競合状態による `short write` 可能性を修正 (#1643)
  本リリースでは、最悪の場合に回復不能なエラー `"short write"` を引き起こす可能性があった複数の競合状態を修正しました。この問題は `v.1.5.0` で導入されたため、`v1.5.x` 系を使用している方は直ちに `v1.5.2` へのアップグレードを強く推奨します。

## バージョン 1.5.1 の変更履歴

* 破壊的変更なし
* 新機能なし
* バグ修正:
* ### HNSW コミットログでの予期しないクラッシュ後にクラッシュループが発生する問題を修正 (#1635)
  コミットログ書き込み中に Weaviate が終了（例: OOMKill）した場合、次回の再起動時にパースできずクラッシュループに陥る可能性がありました。この修正により問題を解消しました。なお、このようなクラッシュでもデータ損失はありません。部分的に書き込まれたコミットログはユーザーにまだアクノリッジされていないため、安全に破棄できます。

* ### `Like` 演算子のチェーンが機能しない問題を修正 (#1638)
  修正前は、`where` フィルターで `Like` 演算子をチェーンし、それぞれの `valueString` または `valueText` にワイルドカード (`*`) を含めた場合、通常は最初の演算子の結果のみが反映されていました。本修正により、`And` や `Or` のチェーンが正しく反映されます。このバグは他の演算子（`Equal`、`GreaterThan` など）には影響せず、ワイルドカードを使用した `Like` クエリにのみ影響していました。

* ### オートスキーマ機能での潜在的な競合状態を修正 (#1636)
  オートスキーマ機能における不適切な同期を改善し、極端なケースで競合状態が発生する可能性を解消しました。

## バージョン 1.5.0 への移行

### 移行に関する注意
*本リリースでは API レベルの破壊的変更はありませんが、Weaviate のストレージメカニズム全体が変更されています。その結果、インプレースアップデートはできません。以前のバージョンからアップグレードする場合は、新しいセットアップを作成し、すべてのデータを再インポートする必要があります。以前のバックアップは本バージョンとは互換性がありません。*

### 変更履歴
* 破壊的変更なし
* 新機能:
  * *LSM-Tree ベースのストレージ*。従来の Weaviate は B+Tree ベースのストレージ機構を使用していましたが、大規模インポート時の高速書き込み要求に追従できませんでした。本リリースではストレージ層を完全に書き換え、独自の LSM-Tree アプローチを採用しています。これにより、インポート時間が大幅に短縮され、従来バージョンより 100% 以上高速になることもあります。
  * *オートスキーマ機能*。インポート前にスキーマを作成しなくてもデータオブジェクトをインポートできます。クラスは自動的に作成され、手動で調整することも可能です。Weaviate は初めてプロパティを検出した際にプロパティタイプを推測します。デフォルト設定は #1539 に示す環境変数で変更できます。デフォルトで有効ですが完全に非破壊的で、必要に応じて明示的なスキーマを作成できます。
* 修正:
  * *集計クエリの改善*。一部の集計クエリで必要なアロケーション数を削減し、高速化とタイムアウトの減少を実現しました。


すべての変更点は [こちらの GitHub ページ](https://github.com/weaviate/weaviate/releases/tag/v1.5.0) をご覧ください。


## バージョン 1.4.0 の変更履歴

* 破壊的変更なし
* 新機能:
  * 画像モジュール [`img2vec-neural`](/weaviate/modules/img2vec-neural.md)
  * `amd64` CPU (Intel, AMD) 向けハードウェアアクセラレーション追加
  * Weaviate スタック全体で `arm64` をサポート
  * 検索時に `ef` を設定可能
  * 新しいデータ型 `blob` を導入
  * クラスの ベクトル インデックス作成をスキップ
* 修正:
  * HNSW ベクトルインデックス周辺のパフォーマンスを複数改善
  * ベクトル化時のプロパティ順序を一貫性のあるものに
  * カスタムベクトル使用時の `PATCH` API に関する問題を修正
  * 重複した ベクトル を生成する可能性が高いスキーマ設定を検出し、警告を表示
  * transformers モジュールでのスキーマ検証漏れを修正

すべての変更点は [こちらの GitHub ページ](https://github.com/weaviate/weaviate/releases/tag/v1.4.0) をご覧ください。


## バージョン 1.3.0 の変更履歴

* 破壊的変更なし
* 新機能: [質問応答 (Q&A) モジュール](/weaviate/modules/qna-transformers.md)
* 新機能: すべての transformer ベースモジュール向け新しいメタ情報

すべての変更点は [こちらの GitHub ページ](https://github.com/weaviate/weaviate/releases/tag/v1.3.0) をご覧ください。

## バージョン 1.2.0 の変更履歴

* 破壊的変更なし
* 新機能: [Transformer モジュール](/weaviate/modules/qna-transformers.md) の導入

すべての変更点は [こちらの GitHub ページ](https://github.com/weaviate/weaviate/releases/tag/v1.2.0) をご覧ください。

## バージョン 1.1.0 の変更履歴

* 破壊的変更なし
* 新機能: GraphQL `nearObject` 検索で最も類似したオブジェクトを取得
* アーキテクチャ変更: クロスリファレンスのバッチインポート速度を改善

すべての変更点は [こちらの GitHub ページ](https://github.com/weaviate/weaviate/releases/tag/v1.1.0) をご覧ください。



## バージョン 1.0.0 への移行

Weaviate バージョン 1.0.0 は 2021 年 1 月 12 日にリリースされ、大規模なモジュール化アップデートが含まれています。バージョン 1.0.0 から、Weaviate はモジュール方式となり、基盤構造は *プラグイン可能な* ベクトル インデックス、*プラグイン可能な* ベクトライゼーション モジュール、さらに *カスタム* モジュールでの拡張が可能になりました。

0.23.2 から 1.0.0 へのリリースでは、データ スキーマ、API、クライアントに多くの破壊的変更が含まれています。以下は主な（破壊的）変更点の概要です。

クライアント ライブラリ固有の変更については、各クライアントの変更履歴をご覧ください（[Go](/weaviate/client-libraries/go.md#releases)、[Python](/weaviate/client-libraries/python/index.mdx#releases)、[TypeScript/JavaScript](/weaviate/client-libraries/typescript/index.mdx#releases)）。

また、Console の新バージョンもリリースされています。詳細は Console ドキュメントをご参照ください。

### 概要
ここでは主な変更点をまとめています。詳細は ["Changes"](#changes) をご覧ください。

#### RESTful API の変更点一覧
* `/v1/schema/things/{ClassName}` から `/v1/schema/{ClassName}` へ
* `/v1/schema/actions/{ClassName}` から `/v1/schema/{ClassName}` へ
* `/v1/things` から `/v1/objects` へ
* `/v1/actions` から `/v1/objects` へ
* `/v1/batching/things` から `/v1/batch/objects` へ
* `/v1/batching/actions` から `/v1/batch/objects` へ
* `/v1/batching/references` から `/v1/batch/references` へ
* 追加データ オブジェクト プロパティは `?include=...` にまとめられ、先頭のアンダースコアが削除されました
* `/v1/modules/` エンドポイントが追加されました
* `/v1/meta/` エンドポイント内に `"modules"` としてモジュール固有情報が含まれます

#### GraphQL API の変更点一覧
* クエリ階層から Things と Actions レイヤーを削除
* データ オブジェクトのリファレンス プロパティが小文字化（従来は大文字）
* アンダースコア プロパティ、uuid、certainty は `_additional` オブジェクトにまとめられました
* `explore()` フィルターは `near<MediaType>` フィルターに名称変更
* `Get{}` クエリに `nearVector(vector:[])` フィルターを追加
* `Explore (concepts: ["foo"]){}` クエリは `Explore (near<MediaType>: ... ){}` に変更

#### データスキーマの変更点一覧
* Things と Actions の削除
* クラス単位・プロパティ単位の設定がモジュールおよびベクトル インデックス タイプ設定に対応

#### データオブジェクトの変更点一覧
* データ オブジェクト内の `schema` を `properties` に置換

#### Contextionary
* Contextionary はモジュール `text2vec-contextionary` に改名
* `/v1/c11y/concepts` から `/v1/modules/text2vec-contextionary/concepts` へ
* `/v1/c11y/extensions` から `/v1/modules/text2vec-contextionary/extensions` へ
* `/v1/c11y/corpus` は削除

#### その他
* 短・長形式のビーカンから `/things` と `/actions` を削除
* 分類ボディをモジュール化に合わせて変更
* `DEFAULT_VECTORIZER_MODULE` という新しい環境変数を追加

### 変更点

#### Things と Actions の削除
`Things` と `Actions` はデータ スキーマから削除されました。これに伴い、スキーマ定義および API エンドポイントは以下のように変更されます。
1. **データ スキーマ:** `semantic kind`（`Things` と `Actions`）がスキーマ エンドポイントから削除され、URL が以下のように変わります。
  * `/v1/schema/things/{ClassName}` から `/v1/schema/{ClassName}`
  * `/v1/schema/actions/{ClassName}` から `/v1/schema/{ClassName}`
1. **データ RESTful API エンドポイント:** `semantic kind`（`Things` と `Actions`）がデータ エンドポイントから削除され、名前空間が `/objects` になります。URL は以下のように変わります。
  * `/v1/things` から `/v1/objects`
  * `/v1/actions` から `/v1/objects`
  * `/v1/batching/things` から `/v1/batch/objects` へ（[バッチの名称変更](#renaming-batching-to-batch) も参照）
  * `/v1/batching/actions` から `/v1/batch/objects` へ（[バッチの名称変更](#renaming-batching-to-batch) も参照）
1. **GraphQL:** クエリ階層の `Semantic Kind` レベルは置き換え無しで削除されます（`Get` および `Aggregate` クエリ）。  
   ```graphql
   {
     Get {
       Things {
         ClassName {
           propName
         }
       }
     }
   }
   ```

   は次のようになります  

   ```graphql
   {
     Get {
       ClassName {
         propName
       }
     }
   }
   ```
1. **データ ビーカン:** `Semantic Kind` はビーカンから削除されます。
   * **短形式ビーカン:**

     * `weaviate://localhost/things/4fbacd6e-1153-47b1-8cb5-f787a7f01718`

     から

     * `weaviate://localhost/4fbacd6e-1153-47b1-8cb5-f787a7f01718`

   * **長形式ビーカン:**

     * `weaviate://localhost/things/ClassName/4fbacd6e-1153-47b1-8cb5-f787a7f01718/propName`

     から

     * `weaviate://localhost/ClassName/4fbacd6e-1153-47b1-8cb5-f787a7f01718/propName`

#### /batching/ から /batch/ への名称変更

* `/v1/batching/things` から `/v1/batch/objects`
* `/v1/batching/actions` から `/v1/batch/objects`
* `/v1/batching/references` から `/v1/batch/references`

#### データオブジェクトの「schema」から「properties」への変更

データ オブジェクト上の "schema" は直感的ではないため "properties" に置き換えられました。変更例は以下の通りです。

```json
{
  "class": "Article",
  "schema": {
    "author": "Jane Doe"
  }
}
```

から

```json
{
  "class": "Article",
  "properties": {
    "author": "Jane Doe"
  }
}
```

#### GraphQL プロパティの大文字小文字の一貫性

以前は、スキーマ定義のリファレンス プロパティは常に小文字でしたが、GraphQL では大文字にする必要がありました。例：`Article { OfAuthor { … on Author { name } } }`（プロパティ定義は ofAuthor）。新バージョンでは GraphQL の大文字小文字がスキーマ定義と完全に一致します。上記の例は `Article { ofAuthor { … on Author { name } } }` となります。

#### GraphQL と RESTful API における追加データプロパティ
モジュール化により、モジュールはデータ オブジェクトの追加プロパティを提供できるようになりました（固定ではありません）。これらは GraphQL や RESTful API で取得できます。
1. **REST:** 追加プロパティ（旧 `"underscore"` プロパティ）は `?include=...` で指定して取得します。例：`?include=classification`。アンダースコア付き（例：`?include=_classification`）は非推奨です。Open API 仕様では、すべての追加プロパティが `additional` オブジェクトにまとめられます。例：
    ```json
    {
      "class": "Article",
      "schema": { ... },
      "_classification": { … }
    }
    ```

    から

    ```json
    {
      "class": "Article",
      "properties": { ... },
      "additional": {
        "classification": { ... }
      }
    }
    ```
2. **GraphQL:** `"underscore"` プロパティは GraphQL クエリ内で `additional` プロパティに名称変更されます。
   1. すべての `"underscore"` プロパティ（例：`_certainty`）は `_additional {}` オブジェクトにまとめられます（例：`_additional { certainty }`）。
   2. `uuid` プロパティも `_additional {}` に配置され `id` に改名されます（例：`_additional { id }`）。
   以下の例は両方の変更を示します。

   変更前

   ```graphql
    {
      Get {
        Things {
          Article {
            title
            uuid
            certainty
            _classification
          }
        }
      }
    }
   ```

   変更後

   ```graphql
   {
     Get {
       Article {
         title
         _additional {      # leading _ prevents clashes
           certainty
           id               # replaces uuid
           classification
         }
       }
     }
   }
   ```

#### モジュール RESTful エンドポイント
Weaviate のモジュール化に伴い、`v1/modules/` エンドポイントが導入されました。

#### GraphQL セマンティック検索
モジュール化により、非テキストオブジェクトをベクトル化できるようになりました。検索は、Contextionary によるテキストおよびデータオブジェクトのベクトル化に限定されず、非テキストオブジェクトや生の ベクトル に対しても適用可能になります。以前は Get クエリの 'explore' フィルターと GraphQL の 'Explore' クエリはテキストに紐付いていましたが、新しい Weaviate バージョンでは次の変更が加えられました。

1. フィルター `Get ( explore: {} ) {}` は `Get ( near<MediaType>: {} ) {}` にリネームされました。  
   1. 新機能: `Get ( nearVector: { vector: [.., .., ..] } ) {}` はモジュールに依存せず、常に利用できます。  
   2. `Get ( explore { concepts: ["foo"] } ) {}` は `Get ( nearText: { concepts: ["foo"] } ) {}` となり、`text2vec-contextionary` モジュールがアタッチされている場合にのみ使用できます。  

    From

    ```graphql
      {
        Get {
          Things {
            Article (explore: { concepts: ["foo"] } ) {
              title
            }
          }
        }
      }
    ```

    to

    ```graphql
    {
      Get {
        Article (near<MediaType>: ... ) {
          title
        }
      }
    }
    ```

2. `Get {}` API で使用される explore ソーターと同様に、`Explore {}` API もテキストを前提としています。次の変更が適用されます。  

   From

   ```graphql
    {
      Explore (concepts: ["foo"]) {
        beacon
      }
    }
   ```

   to

   ```graphql
    {
      Explore (near<MediaType>: ... ) {
        beacon
      }
    }
   ```

#### データスキーマ設定
1. **クラス単位の設定**

    モジュール化により、クラスごとにベクトライザー モジュール、モジュール固有のクラス設定、ベクトルインデックスタイプ、およびベクトルインデックスタイプ固有の設定を行えます。  
    * `vectorizer` はベクトル化を担当するモジュール（存在する場合）を示します。  
    * `moduleConfig` はモジュール名ごとの設定を可能にします。  
      * Contextionary 固有のプロパティ設定については [こちら](#text2vec-contextionary) を参照してください。  
    * `vectorIndexType` では使用するベクトルインデックスを選択できます（デフォルトは [HNSW](/weaviate/concepts/indexing/vector-index.md#hierarchical-navigable-small-world-hnsw-index)）。  
    * `vectorIndexConfig` はインデックスに渡される任意の設定オブジェクトです（デフォルト値は [こちら](/weaviate/config-refs/indexing/vector-index.mdx#hnsw-index) を参照）。  

    変更はすべて次の例に示します。  

    ```json
    {
      "class": "Article",
      "vectorizeClassName": true,
      "description": "string",
      "properties": [ … ]
    }
    ```

    は次のようになります。  

    ```json
    {
      "class": "Article",
      "vectorIndexType": "hnsw",        # defaults to hnsw
      "vectorIndexConfig": {
        "efConstruction": 100
      },
      "moduleConfig": {
        "text2vec-contextionary": {
          "vectorizeClassName": true
        },
        "encryptor5000000": { "enabled": true }  # example
      },
      "description": "string",
      "vectorizer": "text2vec-contextionary",  # default is configurable
      "properties": [ … ]
    }
    ```

2. **プロパティ単位の設定**

  モジュール化により、プロパティごとにモジュール固有の設定を行えるようになり、また、そのプロパティを転置インデックスに含めるかどうかを指定できます。  
  * `moduleConfig` はモジュール名ごとの設定を可能にします。  
    * Contextionary 固有のプロパティ設定については [こちら](#text2vec-contextionary) を参照してください。  
  * `index` は `indexInverted` に変更されます。これは、そのプロパティを転置インデックスに登録するかどうかを示すブール値です。  

  変更はすべて次の例に示します。  

  ```json
  {
    "dataType": [ "text" ],
    "description": "string",
    "cardinality": "string",
    "vectorizePropertyName": true,
    "name": "string",
    "keywords": [ … ],
    "index": true
  }
  ```

  は次のようになります。  

  ```json
  {
    "dataType": [ "text" ],
    "description": "string",
    "moduleConfig": {
      "text2vec-contextionary": {
        "skip": true,
        "vectorizePropertyName": true,
      }
    },
    "name": "string",
    "indexInverted": true
  }
  ```

#### RESTful /meta エンドポイント
`/v1/meta` オブジェクトには、新しく導入された名前空間 `modules.<moduleName>` プロパティにモジュール固有の情報が含まれるようになりました。

From

```json
{
  "hostname": "string",
  "version": "string",
  "contextionaryWordCount": 0,
  "contextionaryVersion": "string"
}
```

to

```json
{
  "hostname": "string",
  "version": "string",
  "modules": {
    "text2vec-contextionary": {
      "wordCount": 0,
      "version": "string"
     }
  }
}
```

#### モジュール分類
一部の分類タイプはモジュールに紐付いています（例: 以前の "contextual" 分類は `text2vec-contextionary` モジュールに紐付いています）。常に存在するフィールドと、タイプに依存するフィールドを区別しました。さらに、API では `settings` と `filters` を個別のプロパティにまとめて改善しています。kNN 分類はモジュールに依存せず Weaviate Database で利用できる唯一の分類タイプです。以前の "contextual" 分類は `text2vec-contextionary` モジュールに紐付いており、詳細は [こちら](#text2vec-contextionary) を参照してください。以下は分類 API の POST 本文での変更例です。

From

```json
{
  "class": "City",
  "classifyProperties": ["inCountry"],
  "basedOnProperties": ["description"],
  "type": "knn",
  "k": 3,
  "sourceWhere": { … },
  "trainingSetWhere": { … },
  "targetWhere": { … },
}

```

To

```json
{
  "class": "City",
  "classifyProperties": ["inCountry"],
  "basedOnProperties": ["description"],
  "type": "knn",
  "settings": {
    "k": 3
  },
  "filters": {
    "sourceWhere": { … },
    "trainingSetWhere": { … },
    "targetWhere": { … },
  }
}
```

そして API GET 本文:

From

```json
{
  "id": "ee722219-b8ec-4db1-8f8d-5150bb1a9e0c",
  "class": "City",
  "classifyProperties": ["inCountry"],
  "basedOnProperties": ["description"],
  "status": "running",
  "meta": { … },
  "type": "knn",
  "k": 3,
  "sourceWhere": { … },
  "trainingSetWhere": { … },
  "targetWhere": { … },
}
```

To

```json
{
  "id": "ee722219-b8ec-4db1-8f8d-5150bb1a9e0c",
  "class": "City",
  "classifyProperties": ["inCountry"],
  "basedOnProperties": ["description"],
  "status": "running",
  "meta": { … },
  "type": "knn",
  "settings": {
    "k": 3
  },
  "filters": {
    "sourceWhere": { … },
    "trainingSetWhere": { … },
    "targetWhere": { … },
  }
}
```

#### text2vec-contextionary
Contextionary は Weaviate における最初のベクトル化モジュールとなり、正式名称は `text2vec-contextionary` になりました。これに伴い、次の変更があります。

1. **RESTful** エンドポイント `/v1/c11y` は `v1/modules/text2vec-contextionary` に変更されました。  
   * `/v1/c11y/concepts` → `/v1/modules/text2vec-contextionary/concepts`  
   * `/v1/c11y/extensions` → `/v1/modules/text2vec-contextionary/extensions`  
   * `/v1/c11y/corpus` は削除されました  

2. **データスキーマ:** スキーマ定義に `text2vec-contextionary` 固有のモジュール設定オプションが追加されました  
   1. **クラス単位** `"vectorizeClassName"` はデータオブジェクトのベクトル計算にクラス名を含めるかどうかを示します。  

    ```json
    {
      "class": "Article",
      "moduleConfig": {
        "text2vec-contextionary": {
          "vectorizeClassName": true
        }
      },
      "description": "string",
      "vectorizer": "text2vec-contextionary",
      "properties": [ … ]
    }
    ```

   2. **プロパティ単位** `skip` はそのプロパティ（値を含む）をデータオブジェクトのベクトル位置から完全に除外するかどうかを示します。`vectorizePropertyName` はプロパティ名をデータオブジェクトのベクトル計算に含めるかどうかを示します。  

    ```json
    {
      "dataType": [ "text" ],
      "description": "string",
      "moduleConfig": {
        "text2vec-contextionary": {
          "skip": true,
          "vectorizePropertyName": true,
        }
      },
      "name": "string",
      "indexInverted": true
    }
    ```

3. **コンテキスト分類** コンテキスト分類は `text2vec-contextionary` モジュールに依存します。`/v1/classifications/` で、分類名 `text2vec-contextionary-contextual` を用いて次のように有効化できます。  

From

```json
{
  "class": "City",
  "classifyProperties": ["inCountry"],
  "basedOnProperties": ["description"],
  "type": "contextual",
  "informationGainCutoffPercentile": 30,
  "informationGainMaximumBoost": 3,
  "tfidfCutoffPercentile": 80,
  "minimumUsableWords": 3,
  "sourceWhere": { … },
  "trainingSetWhere": { … },
  "targetWhere": { … },
}
```

To

```json
{
  "class": "City",
  "classifyProperties": ["inCountry"],
  "basedOnProperties": ["description"],
  "type": "text2vec-contextionary-contextual",
  "settings": {
    "informationGainCutoffPercentile": 30,
    "informationGainMaximumBoost": 3,
    "tfidfCutoffPercentile": 80,
    "minimumUsableWords": 3
  },
  "filters": {
    "sourceWhere": { … },
    "trainingSetWhere": { … },
    "targetWhere": { … }
  }
}
```

#### デフォルト ベクトライザー モジュール
スキーマの各データ クラスに毎回指定する必要がないよう、新しい環境変数でデフォルト ベクトライザー モジュールを指定できます。  
その環境変数は `DEFAULT_VECTORIZER_MODULE` で、例えば `DEFAULT_VECTORIZER_MODULE="text2vec-contextionary"` のように設定できます。

### 公式リリースノート
公式リリースノートは [GitHub](https://github.com/weaviate/weaviate/releases/tag/0.23.0) でご覧いただけます。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

