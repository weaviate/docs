---
title: 組み込み Weaviate
sidebar_position: 4
image: og/docs/installation.jpg
# tags: ['installation', 'embedded', 'client']
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::caution Experimental
組み込み Weaviate は **実験的** ソフトウェアです。API やパラメーターは変更される可能性があります。
:::

import EMBDIntro from '/_includes/embedded-intro.mdx';

<EMBDIntro />

## Embedded Weaviate インスタンスの起動

import EmbeddedInstantiation from '/_includes/code/embedded.instantiate.mdx';

<EmbeddedInstantiation />

:::tip ログレベルを設定して冗長さを減らす
組み込み Weaviate は多数のログメッセージを出力する場合があります。ログ量を減らすには、上記の例のように `LOG_LEVEL` 環境変数を `error` または `warning` に設定してください。
:::

クライアントを終了すると、Embedded Weaviate インスタンスも終了します。

### カスタム接続設定

追加の設定情報を組み込みインスタンスに渡す場合は、カスタム接続を使用します。

import EMDBCustom from '/_includes/code/embedded.instantiate.custom.mdx';

<EMDBCustom />

## 設定オプション

Embedded Weaviate を設定するには、インスタンス生成コード内で変数を設定するか、クライアント呼び出し時のパラメーターとして渡します。システム環境変数として渡すこともできます。すべてのパラメーターは省略可能です。

| パラメーター | 型 | デフォルト | 説明 |
| :-- | :-- | :-- | :-- |
| `additional_env_vars` | string | なし | API キーなど追加の環境変数をサーバーに渡します。 |
| `binary_path` | string | 可変 | バイナリのダウンロードディレクトリ。バイナリが存在しない場合、クライアントがダウンロードします。<br/><br/>`XDG_CACHE_HOME` が設定されている場合のデフォルト: `XDG_CACHE_HOME/weaviate-embedded/`<br/><br/>`XDG_CACHE_HOME` が設定されていない場合のデフォルト: `~/.cache/weaviate-embedded` |
| `hostname` | string | 127.0.0.1 | ホスト名または IP アドレス |
| `persistence_data_path` | string | 可変 | データ保存ディレクトリ。<br/><br/>`XDG_DATA_HOME` が設定されている場合のデフォルト: `XDG_DATA_HOME/weaviate/`<br/><br/>`XDG_DATA_HOME` が設定されていない場合のデフォルト: `~/.local/share/weaviate` |
| `port` | integer | 8079 | Weaviate サーバーのリクエストポート |
| `version` | string | 最新安定版 | 次のいずれかでバージョンを指定します。<br/>- `"latest"`<br/>- バージョン番号文字列: `"1.19.6"`<br/>- Weaviate バイナリの URL（[下記参照](/deploy/installation-guides/embedded.md#file-url)） |

:::warning `XDG_CACHE_HOME` または `XDG_DATA_HOME` を変更しないでください
`XDG_DATA_HOME` と `XDG_CACHE_HOME` の環境変数は多くのシステムで使用されています。これらを変更すると、他のアプリケーションが正常に動作しなくなる可能性があります。
:::

## デフォルトモジュール

次のモジュールがデフォルトで有効になっています:
- `generative-openai`
- `qna-openai`
- `ref2vec-centroid`
- `text2vec-cohere`
- `text2vec-huggingface`
- `text2vec-openai`

追加のモジュールを有効にするには、インスタンス生成コードにモジュールを追加してください。

たとえば、`backup-s3` モジュールを追加する場合は次のようにクライアントを生成します。

import EmbeddedInstantiationModule from '/_includes/code/embedded.instantiate.module.mdx';

<EmbeddedInstantiationModule />

## バイナリソース

Weaviate Database のリリースには Linux 用実行バイナリが含まれています。Embedded Weaviate クライアントを生成すると、クライアントはバイナリパッケージのローカルコピーをチェックします。バイナリファイルが見つかれば、それを実行して一時的な Weaviate インスタンスを起動します。見つからない場合、クライアントはバイナリをダウンロードして `binary_path` ディレクトリに保存します。

Embedded Weaviate インスタンスはクライアント終了時に終了しますが、クライアントはバイナリファイルを削除しません。次回クライアントが実行されると、保存済みバイナリが存在するかを確認し、存在すればそれを使用します。

### ファイル一覧
リリースに含まれるファイル一覧は、対象リリースの [GitHub](https://github.com/weaviate/weaviate/releases) ページの Assets セクションを参照してください。

### ファイル URL
特定のバイナリアーカイブファイルの URL を取得する手順:
1. [リリースノート](/weaviate/release-notes/index.md) ページで目的の Weaviate Database リリースを探します。  
1. そのバージョンのリリースノートを開きます。Assets セクションに `linux-amd64` と `linux-arm64` の `tar.gz` バイナリがあります。  
1. ご利用のプラットフォーム用 `tar.gz` ファイルのフル URL をコピーします。  

例として、Weaviate `1.19.6` の `AMD64` バイナリの URL は次のとおりです。

`https://github.com/weaviate/weaviate/releases/download/v1.19.6/weaviate-v1.19.6-linux-amd64.tar.gz`.

## 機能概要

通常、Weaviate Database はスタンドアロンのサーバーとして実行され、クライアントが接続してデータにアクセスします。Embedded Weaviate インスタンスはクライアントスクリプトやアプリケーションと共に動作するプロセスです。Embedded インスタンスは永続データストアにアクセスできますが、クライアント終了時にインスタンスも終了します。

クライアントが起動すると、保存済みの Weaviate バイナリをチェックし、見つかればそのバイナリで Embedded Weaviate インスタンスを作成します。見つからなければバイナリをダウンロードします。

インスタンスは既存のデータストアもチェックします。クライアントは同じデータストアを再利用し、更新はクライアント起動間で保持されます。

クライアントスクリプトやアプリケーションを終了すると Embedded Weaviate インスタンスも終了します。

- スクリプト: スクリプト終了時に Embedded Weaviate インスタンスが終了します。  
- アプリケーション: アプリケーション終了時に Embedded Weaviate インスタンスが終了します。  
- Jupyter Notebook: ノートブックがアクティブでなくなると Embedded Weaviate インスタンスが終了します。  

## Embedded サーバーの出力

Embedded サーバーは `STDOUT` と `STDERR` をクライアントにパイプします。コマンドラインで `STDERR` をリダイレクトするには、次のようにスクリプトを実行します。

```bash
python3 your_embedded_client_script.py 2>/dev/null
```

## サポートされる環境

Embedded Weaviate は Linux と macOS でサポートされています。

## クライアント言語

Embedded Weaviate は Python と TypeScript クライアントで利用できます。

### Python クライアント

[Python](docs/weaviate/client-libraries/python/index.mdx) v3 クライアントのサポートは、Linux では `v3.15.4`、macOS では `v3.21.0` から新たに追加されました。Python クライアント v4 では、サーバーバージョン v1.23.7 以上が必要です。

### TypeScript クライアント

組み込み TypeScript クライアントは、標準 TypeScript クライアントの一部ではなくなりました。

組み込みクライアントには、標準クライアントには含まれていない追加の依存関係があります。ただし、組み込みクライアントは元の TypeScript クライアントを拡張しているため、 Embedded Weaviate インスタンスを作成した後は、組み込み TypeScript クライアントを標準クライアントと同じ方法で利用できます。

組み込み TypeScript クライアントをインストールするには、次のコマンドを実行します。

```
npm install weaviate-ts-embedded
```

TypeScript クライアントは以下の GitHub リポジトリで公開されています:
- [Embedded TypeScript クライアント](https://github.com/weaviate/typescript-embedded)
- [Standard TypeScript クライアント](https://github.com/weaviate/typescript-client)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

