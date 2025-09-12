---
title: HNSW スナップショット
sidebar_position: 47
sidebar_label: HNSW Snapshots
description: Weaviate における HNSW スナップショットで起動時間を短縮する方法と、その管理方法について学びます。
---

:::info Added in `v1.31`
:::

HNSW (Hierarchical Navigable Small World) スナップショットは、大規模な ベクトル インデックス を持つインスタンスの起動時間を大幅に短縮できます。

デフォルトでは、HNSW スナップショット機能は **無効** です。この機能を使用するには、以下に示す [環境変数](/deploy/configuration/env-vars/index.md) を設定してください。

:::info Concepts: HNSW snapshots
詳細な説明は、この [概念ページ](../concepts/storage.md#hnsw-snapshots) をご覧ください。
:::

## 1. HNSW スナップショットの有効化

`PERSISTENCE_HNSW_DISABLE_SNAPSHOTS` を `false` に設定して HNSW スナップショット機能を有効にします。（デフォルト: `true`）

## 2. スナップショット作成の設定

以下のオプションの環境変数を設定することで、スナップショット動作を調整できます。

:::note
新しいスナップショットを作成する前に、前回のスナップショットとコミットログの差分をメモリに読み込む必要があります。この処理を行うのに十分なメモリがあることをご確認ください。
:::

### 起動時のスナップショット

起動時のスナップショット作成を有効または無効にします:

- `PERSISTENCE_HNSW_SNAPSHOT_ON_STARTUP`: `true` の場合、最後のスナップショット以降にコミットログに変更があれば、起動時に新しいスナップショットを作成します。変更がなければ既存のスナップショットが読み込まれます。  
  - **Default:** `true`

### 定期的なスナップショット

定期的なスナップショット作成を設定します。スナップショットをトリガーするには、以下 **すべて** の条件を満たす必要があります:

1. **一定時間が経過していること:**

    - `PERSISTENCE_HNSW_SNAPSHOT_INTERVAL_SECONDS`: 前回のスナップショットからの最小経過時間（秒）。  
      - **Default:** `21600` 秒（6 時間）

2. **新しいコミットログが十分な数あること:**

    - `PERSISTENCE_HNSW_SNAPSHOT_MIN_DELTA_COMMITLOGS_NUMBER`: 前回のスナップショット以降に作成された新しいコミットログファイル数の最小値。  
      - **Default:** `1`

3. **新しいコミットログの合計サイズが十分であること（割合）:**  
    - `PERSISTENCE_HNSW_SNAPSHOT_MIN_DELTA_COMMITLOGS_SIZE_PERCENTAGE`: 前回のスナップショットサイズに対する新しいコミットログ合計サイズの最小割合。  
      - **Default:** `5` （前回のスナップショットサイズの 5% に相当するコミットログが必要）。例えば前回のスナップショットが 1000MB の場合、新しいコミットログが 50MB 以上になるとスナップショットが作成されます。

## 参考リソース

- [概念: ストレージ - 永続化とクラッシュリカバリー](../concepts/storage.md#persistence-and-crash-recovery)

## 質問とフィードバック

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>

