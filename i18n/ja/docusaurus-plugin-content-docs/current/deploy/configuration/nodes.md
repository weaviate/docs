---
title: クラスタ ノード データ
image: og/docs/configuration.jpg
# tags: ['nodes', 'reference', 'configuration']
---

Weaviate クラスタ内の各ノードに関する情報を取得できます。クエリはクラスタ全体、または特定のコレクションを対象に実行できます。

### パラメーター

| Name | Location | Type | Description |
| ---- | -------- | ---- | ----------- |
| `output` | body | string | 出力に含める情報量を指定します。オプション: `minimal` （デフォルト） および `verbose` （シャード情報を含む）。 |

### 返却データ:

import APIOutputs from '/_includes/rest/node-endpoint-info.mdx';

<APIOutputs />

## 例

次のコマンドはクラスタ内のすべてのノードについて概要情報を取得します。

import Nodes from '/_includes/code/nodes.mdx';

<Nodes/>

出力例:

```json
{
  "nodes": [
    {
      "batchStats": {
        "ratePerSecond": 0
      },
      "gitHash": "e6b37ce",
      "name": "weaviate-0",
      "stats": {
        "objectCount": 0,
        "shardCount": 2
      },
      "status": "HEALTHY",
      "version": "1.22.1"
    },
    {
      "batchStats": {
        "ratePerSecond": 0
      },
      "gitHash": "e6b37ce",
      "name": "weaviate-1",
      "stats": {
        "objectCount": 1,
        "shardCount": 2
      },
      "status": "HEALTHY",
      "version": "1.22.1"
    },
    {
      "batchStats": {
        "ratePerSecond": 0
      },
      "gitHash": "e6b37ce",
      "name": "weaviate-2",
      "stats": {
        "objectCount": 1,
        "shardCount": 2
      },
      "status": "HEALTHY",
      "version": "1.22.1"
    }
  ]
}
```

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

