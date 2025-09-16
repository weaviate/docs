---
title: OIDC 設定
sidebar_position: 95
image: og/docs/configuration.jpg
# tags: ['metadata', 'reference', 'configuration']
---

もし OpenID Connect（ OIDC ）認証が有効になっている場合、その詳細は `/v1/.well-known/openid-configuration` エンドポイントから取得できます。

トークンが設定されている場合、このエンドポイントはそのトークンにリダイレクトします。

#### 使用方法

ディスカバリーエンドポイントは `GET` リクエストを受け付けます:

```js
GET /v1/.well-known/openid-configuration
```

OIDC プロバイダーが存在する場合、エンドポイントは以下のフィールドを返します:
- `href`: クライアントへの参照です。
- `cliendID`: クライアントの ID です。

OIDC プロバイダーが存在しない場合、エンドポイントは `404` HTTP ステータスコードを返します。

#### 例

import WellknownOpenIDConfig from '/_includes/code/wellknown.openid-configuration.mdx';

<WellknownOpenIDConfig/>

OIDC が設定されている場合、エンドポイントは次のようなドキュメントを返します:

```json
{
  "href": "http://my-token-issuer/auth/realms/my-weaviate-usecase",
  "cliendID": "my-weaviate-client"
}
```

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>


