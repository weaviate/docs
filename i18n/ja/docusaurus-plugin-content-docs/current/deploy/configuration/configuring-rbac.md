---
title: RBAC を有効化して設定する
sidebar_label: RBAC
image: og/docs/configuration.jpg
# tags: ['rbac', 'roles', 'configuration', 'authorization']
---

import SkipLink from '/src/components/SkipValidationLink'

:::info `v1.29` で追加
役割ベースアクセス制御 (RBAC) は、バージョン `v1.29` から Weaviate で一般利用可能になりました。
:::

役割ベースアクセス制御 (RBAC) は、ユーザーの役割に基づいてリソースへのアクセスを制限する方法です。Weaviate では、RBAC を使用して **[ロールを定義し、それらに権限を割り当てる](/weaviate/configuration/rbac/manage-roles)** ことができます。ユーザーをロールに割り当てると、そのロールに関連付けられた権限を継承します。

Weaviate には、あらかじめ定義されたロールが用意されています。これらのロールは次のとおりです。

- `root`: root ロールは Weaviate 内のすべてのリソースに対するフルアクセス権を持ちます。
- `viewer`: viewer ロールは Weaviate 内のすべてのリソースに対する読み取り専用アクセス権を持ちます。

`root` ロールは Weaviate の設定ファイルを通じて割り当てることができます。定義済みロールは変更できませんが、ユーザーには Weaviate API を介して追加のロールを割り当てることができます。

:::tip 旧バージョンでの root ユーザー要件
Weaviate バージョン `v1.30.6` および `v1.31.0` 以前では、RBAC が有効な場合、組み込みの root ロールを持つユーザーを少なくとも 1 人設定する必要があります。設定しない場合、Weaviate は起動しません。この要件は `v1.30.7` と `v1.31.1` で削除されました。
:::

## Docker <i class="fa-brands fa-docker"></i> {#docker}

RBAC 認可は環境変数で設定できます。Docker Compose では、以下の例のように設定ファイル (`docker-compose.yml`) に記述します。

```yaml
services:
  weaviate:
    ...
    environment:
      ...
      # Example authentication configuration using API keys
      # OIDC access can also be used with RBAC
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'false'
      AUTHENTICATION_APIKEY_ENABLED: 'true'
      AUTHENTICATION_APIKEY_ALLOWED_KEYS: 'root-user-key'
      AUTHENTICATION_APIKEY_USERS: 'root-user'

      # Authorization configuration
      # Enable RBAC
      AUTHORIZATION_RBAC_ENABLED: 'true'

      # Provide pre-configured roles to users
      # This assumes that the relevant user has been authenticated and identified

      # You MUST define at least one root user
      AUTHORIZATION_RBAC_ROOT_USERS: 'root-user'
      # Enable the runtime user management
      AUTHENTICATION_DB_USERS_ENABLED: 'true'
```

この設定では、
- RBAC を有効化
- `root-user` を組み込みの管理者権限を持つユーザーとして設定

root ユーザーでインスタンスに接続し、<SkipLink href="/weaviate/api/rest#tag/authz">REST API</SkipLink> や [クライアントライブラリを利用したプログラム](/weaviate/configuration/rbac/manage-roles.mdx) を使用してカスタムロールと権限を割り当てられる [新しいユーザーを作成](/weaviate/configuration/rbac/manage-users.mdx) できます。

import DynamicUserManagement from '/_includes/configuration/dynamic-user-management.mdx';

<DynamicUserManagement />

:::caution 環境変数の変更
Weaviate バージョン `v1.29` 以降、以下の環境変数が変更されました。
- `AUTHORIZATION_VIEWER_USERS` と `AUTHORIZATION_ADMIN_USERS` は削除されました
- `AUTHORIZATION_ADMIN_USERS` は `AUTHORIZATION_RBAC_ROOT_USERS` に置き換えられました
:::

## Kubernetes <i class="fa fa-cubes"></i> {#kubernetes}

Helm を使用した Kubernetes デプロイでは、API キー認証を `values.yaml` ファイルの `authorization` セクションで設定します。以下は設定例です。

```yaml
# Example authentication configuration using API keys
authentication:
  anonymous_access:
    enabled: false
  apikey:
    enabled: true
    allowed_keys:
      - root-user-key
    users:
      - root-user

# Authorization configuration
authorization:
  rbac:
    # Enable RBAC
    enabled: true
    # Provide pre-configured roles to users
    # This assumes that the relevant user has been authenticated and identified
    #
    # You MUST define at least one root user
    root_users:
    - root-user
```

この設定では、
- RBAC を有効化
- `root-user` を組み込みの管理者権限を持つユーザーとして設定

root ユーザーでインスタンスに接続し、<SkipLink href="/weaviate/api/rest#tag/authz">REST API</SkipLink> や [クライアントライブラリを利用したプログラム](/weaviate/configuration/rbac/manage-roles.mdx) を使用してカスタムロールと権限を割り当てられる [新しいユーザーを作成](/weaviate/configuration/rbac/manage-users.mdx) できます。

## RBAC とパフォーマンス

RBAC はきめ細かなアクセス制御ポリシーを定義できる強力な機能ですが、各操作でユーザーの権限をチェックする必要があるため、パフォーマンスに影響を与える可能性があります。

具体的な影響はセットアップとユースケースによって異なりますが、内部テストではオブジェクト作成操作で最も大きな影響が見られました。

組み込みロールと比較してカスタムロールを使用しても、追加のパフォーマンス低下は確認されませんでした。

RBAC 使用時のパフォーマンス最適化のヒント:
- オブジェクト作成時のパフォーマンスを監視する
- 可用性の高い (3 ノード以上) 構成で負荷を分散する

## 参考リソース

- [RBAC: 概要](/weaviate/configuration/rbac/index.mdx)
- [RBAC: ロールの管理](/weaviate/configuration/rbac/manage-roles.mdx)
- [RBAC: ユーザーの管理](/weaviate/configuration/rbac/manage-users.mdx)
- [RBAC: チュートリアル](/deploy/tutorials/rbac.mdx)

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

