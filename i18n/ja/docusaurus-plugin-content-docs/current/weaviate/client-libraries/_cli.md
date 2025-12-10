---
title: Weaviate CLI
sidebar_position: 90
image: og/docs/client-libraries.jpg
# tags: ['cli']
---

:::note Weaviate CLI バージョン
現在の Weaviate CLI のバージョンは `v||site.weaviate_cli_version||` です。
:::

## インストール

Weaviate CLI は [Pypi.org](https://pypi.org/project/weaviate-cli/) で公開されています。パッケージは [pip](https://pypi.org/project/pip/) を使って簡単にインストールできます。クライアントは Python 3.7 以上で開発およびテストされています。

Weaviate CLI は次のコマンドでインストールできます。

```sh
pip install weaviate-cli
```

CLI が正しくインストールされたかを確認するには、次を実行します。

```sh
weaviate version
```

`||site.weaviate_cli_version||` が返ってくれば成功です。

## 機能

### 設定

Weaviate CLI でインスタンスと対話する前に、CLI ツールを設定する必要があります。手動で設定する方法と、コマンドにフラグを追加する方法があります。
- 手動 (対話式):
  ```sh
  weaviate config set
  ```
  または
  ```sh
  weaviate init
  ```
  その後、Weaviate の URL と認証モードを入力するよう求められます。

- フラグ: 手動で設定していない場合、各コマンドに設定用 JSON ファイルへのパスを指定するフラグ (`--config-file myconfig.json`) を付けられます。

  ```bash
  weaviate --config-file myconfig.json
  ```

  `myconfig.json` は次のいずれかの形式である必要があります。
  ```json
  {
    "url": "http://localhost:8080",
    "auth": null
  }
  ```
  または
  ```json
  {
    "url": "http://localhost:8080",
    "auth": {
        "type": "client_secret",
        "secret": <your_client_secret>
    }
  }
  ```
  または

  ```json
  {
    "url": "http://localhost:8080",
    "auth": {
        "type": "username_and_password",
        "user": <user name>,
        "pass": <user password>
    }
  }
  ```
  または

  ```json
  {
    "url": "http://localhost:8080",
    "auth": {
        "type": "api_key",
        "api_key": <api key>
    }
  }
  ```

現在の設定は次のコマンドで確認できます。

```sh
weaviate config view
```

### Ping
接続先の Weaviate URL に Ping を送るには次を実行します。
```sh
weaviate ping
```

接続が正しく確立されている場合、`Weaviate is reachable!` が返ります。

### スキーマ
スキーマに関しては、[インポート](#import)、[エクスポート](#export)、[ truncate ](#truncate) の 3 つの操作が利用できます。

#### インポート

スキーマを追加するには次を実行します。

```sh
weaviate schema import my_schema.json
```

`my_schema.json` には [こちら](../starter-guides/managing-collections/index.mdx) で説明されているスキーマを含めてください。

スキーマを上書きしたい場合は `--force` フラグを付けることで、インデックスをクリアしてスキーマを置き換えられます。

```sh
weaviate schema import --force my_schema.json # using --force will delete your data
```

#### エクスポート
Weaviate インスタンスに存在するスキーマを JSON ファイルとしてエクスポートするには次を実行します。

```sh
weaviate schema export my_schema.json
```

`my_schema.json` は任意のファイル名およびローカルパスに変更できます。もちろん、Weaviate にスキーマが存在する場合のみ指定した場所にスキーマが出力されます。

#### Truncate

`delete` を使うと、スキーマとそれに紐付くすべてのデータを削除できます。`--force` フラグを付けない限り、実行前に確認が求められます。

```sh
weaviate schema delete
```

### データ

#### インポート
`import` 機能は JSON ファイルからのデータインポートを実行します。`--fail-on-error` フラグを付けると、データオブジェクトのロード中に Weaviate がエラーを返した場合、コマンド実行が失敗します。

```sh
weaviate data import my_data_objects.json
```

コマンドで指定した JSON ファイルとパスを読み込みます。ファイルは Weaviate のデータスキーマに従ってフォーマットされている必要があります。例:

```json
{
    "classes": [
        {
            "class": "Publication",
            "id": "f81bfe5e-16ba-4615-a516-46c2ae2e5a80",
            "properties": {
                "name": "New York Times"
            }
        },
        {
            "class": "Author",
            "id": "36ddd591-2dee-4e7e-a3cc-eb86d30a4303",
            "properties": {
                "name": "Jodi Kantor",
                "writesFor": [{
                    "beacon": "weaviate://localhost/f81bfe5e-16ba-4615-a516-46c2ae2e5a80",
                    "href": "/v1/f81bfe5e-16ba-4615-a516-46c2ae2e5a80"
                }]
            }
        }
    ]
}
```

#### 空にする
`delete` を使うと、Weaviate 内のすべてのデータオブジェクトを削除できます。`--force` フラグを付けない限り、実行前に確認が求められます。

```sh
weaviate data delete
```

## 変更履歴

最新の `CLI` 変更については [GitHub の変更履歴](https://github.com/weaviate/weaviate-cli/releases) をご確認ください。

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

