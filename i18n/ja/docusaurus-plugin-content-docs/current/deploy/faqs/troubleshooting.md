---
title: デプロイ トラブルシューティング ガイド
---

import SkipLink from '/src/components/SkipValidationLink'

Weaviate をデプロイしてベクトルの世界にどっぷり浸かっていると、突然謎に遭遇することがあります。このページは、「Vector Land」で問題が発生したときのハンドブックとしてお役立てください。

すべてのエラーメッセージは、遭遇している謎を解くための手がかりです。[LOG_LEVEL](/deploy/configuration/env-vars#LOG_LEVEL) 環境変数を設定すると、遭遇した謎を解くのに役立ちます。さまざまなログ レベルを使い分けることで、Vector Land の謎を解くために必要な、最適な量の情報を取得できます。

## 一般的な問題と解決策

### クラスターが新しい情報を受け付けず、ログにディスク容量不足または `read-only` エラーが表示される

<details>

<summary>Answer</summary>

#### 問題の特定

まずはクラスターのログを確認して、問題を特定します。ログに「read-only」や「disk space」といった文言が含まれている場合、ディスク容量不足によりクラスターが `read-only` 状態になっている可能性が高いです。

#### 解決方法

この謎を解くには、ノードの空きディスク容量を増やす必要があります。ディスク容量を増やした後、影響を受けたシャードまたはコレクションを手動で再度書き込み可能に設定してください。  
また、[`MEMORY_WARNING_PERCENTAGE`](/deploy/configuration/env-vars/index.md#MEMORY_WARNING_PERCENTAGE) 環境変数を設定すると、メモリ使用量が上限に近づいたときに警告を発することができます。

</details>

### クエリ結果が一貫しない

<details>

<summary> Answer </summary>

#### 問題の特定

まず同じクエリを複数回実行して、結果が一貫しないことを確認します。結果の不一致が続く場合、デプロイで非同期レプリケーションが無効になっている可能性があります。

#### 解決方法

設定を確認し、非同期レプリケーションが有効かどうかを確かめてください。`async_replication_disabled` が "true" の場合は "false" に変更します。有効化すると、ログにノード間のピアチェックと同期が成功した旨のメッセージが表示されます。

</details>

### ノードが通信・クラスタ参加・コンセンサス維持を行えない

<details>

<summary> Answer </summary>

#### 問題の特定

まず同じクエリを複数回実行して、結果が一貫しないことを確認します。結果の不一致が続く場合、デプロイで非同期レプリケーションが無効になっている可能性があります。

#### 解決方法

設定を確認し、非同期レプリケーションが有効かどうかを確かめてください。`async_replication_disabled` が "true" の場合は "false" に変更します。有効化すると、ログにノード間のピアチェックと同期が成功した旨のメッセージが表示されます。  
さらに、<SkipLink href="/weaviate/api/rest#tag/well-known/GET/.well-known/live">live と ready の REST エンドポイント</SkipLink> をテストし、ノードのネットワーク設定を確認してください。

</details>

### ダウングレード後、クラスターが `Ready` 状態に到達しない

<details>

<summary> Answer </summary>

#### 問題の特定

`1.28.13+`、`1.29.5+`、または `1.30.2+` を実行している複数ノードのインスタンスを、`1.27.26` より前の `v1.27.x` バージョンにダウングレードした場合に発生します。

#### 解決方法

Weaviate を `v1.27.x` へダウングレードする必要がある場合は、`1.27.26` 以上を使用してください。

- [移行ガイド](../migration/index.md)

</details>

Vector Land での冒険を続ける中で、熟練したベクトル探偵でも時には不可解な事件に遭遇するものです。すべてのエラーメッセージの背後には、Weaviate を最適に運用するための手がかりが隠れています！

## 質問とフィードバック

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>

