---
title: クラスタ メタデータ
sidebar_position: 90
image: og/docs/configuration.jpg
# tags: ['metadata', 'reference', 'configuration']
---

以下のような Weaviate インスタンスのメタデータを取得できます:

- `hostname`: Weaviate インスタンスの場所。
- `version`: Weaviate のバージョン。
- `modules`: モジュール固有の情報。

## 例

import Meta from '/_includes/code/meta.mdx';

<Meta/>

返り値:

```json
{
  "hostname": "http://[::]:8080",
  "modules": {
    "text2vec-contextionary": {
      "version": "en0.16.0-v0.4.21",
      "wordCount": 818072
    }
  },
  "version": "1.0.0"
}
```


## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

