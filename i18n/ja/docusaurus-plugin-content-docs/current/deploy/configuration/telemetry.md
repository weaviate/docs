---
title: テレメトリー
sidebar_position: 80
image: og/docs/configuration.jpg
# tags: ['telemetry', 'reference', 'configuration']
---

コミュニティのニーズをより深く理解するために、 Weaviate は一部のテレメトリー データを収集しています。これらのデータは、使用状況の傾向を把握し、ユーザーの皆さま向けにソフトウェアを改善する目的で利用されます。テレメトリーはデフォルトで有効になっていますが、いつでも無効にできます。

## 収集されるデータ

起動時に、 Weaviate サーバーは一意のインスタンス ID を生成します。24 時間ごとにインスタンスは次の情報を送信します。

- マシン ID
- ペイロードタイプ
- サーバー バージョン
- ホスト OS
- 使用されているモジュール
- インスタンス内のオブジェクト数

Weaviate はこれ以外のテレメトリー情報を収集しません。

## テレメトリーの無効化

テレメトリー データの収集を無効にするには、次の行を [システム設定](/deploy/configuration/env-vars/index.md) ファイルに追加してください。

```bash
DISABLE_TELEMETRY=true
```

## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>

