---
title: BlockMax WAND 移行ガイド
sidebar_label: 1.30 (BlockMax WAND migration)
sidebar_position: 1
image: og/docs/more-resources.jpg
---

この包括的なガイドでは、Weaviate `v1.30` 以降で転置インデックスに BlockMax WAND アルゴリズムを使用するために、既存データを移行する方法を説明します。

**BlockMax WAND** は、BM25 およびハイブリッド検索のパフォーマンスを向上させます。Weaviate `v1.30` 以降で新規に作成されたコレクションは自動的に最適化された形式を使用しますが、`v1.30` より前に作成された既存コレクションは、これらの改善を利用するために移行が必要です。

この変更の技術的な詳細については、[BlockMax WAND のブログ記事](https://weaviate.io/blog/blockmax-wand)をご覧ください。

## 前提条件

移行を開始する前に次の点を確認してください。

- BlockMax WAND アルゴリズムを使用していない `v1.30` 以前の Weaviate バージョンを使用している  
- 移行前に最新の Weaviate バージョン（現在は `||site.weaviate_version||`）へ更新している  

## 移行の検討事項

移行を開始する前に、次の点に注意してください。

- BM25 またはハイブリッド検索を使用していて、現在のクエリ時間に満足していない場合に主に移行を推奨します  
- 再インデックス化ステージではサーバーリソースの負荷が増加します  
- ドキュメントが数百万件あるシャードでは、検索可能プロパティ数によっては移行に数時間かかる場合があります  
- 可能であれば、特に再インデックス化ステージ中は大量のデータインポート/更新/削除を避けるスケジュールで移行してください  
- 複数プロパティで検索する場合や削除が多いワークフローの場合、BlockMax WAND は用語統計を異なる方法で計算するため WAND とわずかに異なるスコアを返すことがあります  

## 移行プロセス

移行は次の 3 つのステージで行われます。

1. **再インデックス化**: 内部表現を `mapcollection` から転置 `blockmax` 形式へ変換  
2. **置き換え**: 新しい形式を使用しつつ、ロールバックの可能性を維持  
3. **クリーンアップ**: 移行が成功した後に旧データを削除  

### ステージ 1: 再インデックス化

:::info

このステージでは次の動作が行われます。

- 既存データが新しい BlockMax 形式で再取り込みされます  
- 新規データ/更新/削除は旧形式と BlockMax 形式の両方に書き込まれます（ダブルライト）  
- 検索は引き続き旧形式を使用します  

:::

1. 次の設定で Weaviate インスタンスを再起動してください。

```
REINDEX_MAP_TO_BLOCKMAX_AT_STARTUP=weaviate
```

:::note

ノード名が "weaviate" と異なる場合は、実際のノード名に置き換えてください。

:::

2. 次を確認して移行の進行状況を監視します。

   ```
   http://<node_name>:<<debug_endpoint_port>/debug/index/rebuild/inverted/status?collection=<collection_name>
   ```

:::note

置き換える項目:  
- `<node_name>`: Weaviate ノード名  
- `<debug_endpoint_port>`: 実際のポート（デフォルトは `6060`）  
- `<collection_name>`: 移行対象コレクション名  

:::

3. 返却される JSON で移行ステータスを追跡します。  
   - 最初は `collection not found or not ready` と表示されることがあります  
   - 移行中は `in progress` になります  
   - 進行状況は `latest_snapshot` フィールドに約 5 分ごとに更新されます。更新がない場合は、エラーが発生している可能性があるため、ログを確認してください。  
   ```json
   {
     "shards": [
       {
         "latest_snapshot": "2025-03-31T16:34:08.477558Z, 00000000-0000-0000-0000-00000003b38f, all 241446, idx 241446",
         "message": "migration started recently, no snapshots yet",
         "properties": "<searchable properties to migrate>",
         "shard": "<shard path>",
         "snapshot_count": "1",
         "objects_migrated": "241446",
         "start_time": "2025-03-31T16:33:20.21005Z",
         "status": "in progress"
       }
     ]
   }
   ```
   - 再インデックス化が完了すると、`status` フィールドが `reindexed` に変わり、メッセージが `reindexing done, merging buckets` になります  

### ステージ 2: 置き換え

:::info

このステージでは次の動作が行われます。

- システムが BlockMax 形式を使用し始めます  
- ダブルライトは継続します  
- 旧形式データはディスクに保持されます  
- 旧形式へのロールバックが可能です  

:::

再インデックス化が終了し（`status` が `reindexed`）、バケットを置き換えるには次を行います。

1. 以下の設定で Weaviate インスタンスを再起動します。

```
REINDEX_MAP_TO_BLOCKMAX_AT_STARTUP=weaviate
REINDEX_MAP_TO_BLOCKMAX_SWAP_BUCKETS=weaviate
```

2. 再起動後、ステータスエンドポイントを再度確認します。

   - ステータスは一時的に `merged` に変わります（ログで確認できないほど速い場合があります）  
   - その後 `done` と表示されます  

3. この時点で、キーワード検索はデフォルトで BlockMax WAND を使用します。  
   - 次のステージに進む前に、BM25 およびハイブリッド検索のパフォーマンスと結果をテストすることを推奨します  

### ステージ 3: クリーンアップ

:::caution

移行が正常に完了したことを詳細に検証・確認した後にのみ、このステップを実行してください。このステップの後はロールバックできません。

:::

:::info

このステージでは次の動作が行われます。

- ダブルライトが無効化され、BlockMax 形式のみを使用します  
- 旧形式データがディスクから削除されます  

:::

すべてが期待どおりに動作し、キーワード検索機能を確認できたら、次のコマンドですべてのノードを再起動します。

```
REINDEX_MAP_TO_BLOCKMAX_AT_STARTUP=true
REINDEX_MAP_TO_BLOCKMAX_TIDY_BUCKETS=true
```

## マルチノード展開

同一設定でデプロイされたマルチノードサーバーでは、サーバーを 1 台ずつ移行できます。

1. 移行中の現在のノード名を設定します。  
2. すでに移行済みのノードをカンマ区切りで列挙します。

現在移行中のノード（ `<node_name>` ）と、すでに移行されたノード（ `<migrated_node_names>` ）の場合:

```
REINDEX_MAP_TO_BLOCKMAX_AT_STARTUP=<migrated_node_names>,<node_name>
REINDEX_MAP_TO_BLOCKMAX_SWAP_BUCKETS=<migrated_node_names>,<node_name>
```

<details>
    <summary>マルチノード移行の手順例</summary>

ノード名が `weaviate-0`, `weaviate-1`, `weaviate-2` などの場合。

1. `weaviate-0` を移行します:

```
REINDEX_MAP_TO_BLOCKMAX_AT_STARTUP=weaviate-0
```

2. `weaviate-0` が完了したら、`weaviate-1` を移行します:

```
REINDEX_MAP_TO_BLOCKMAX_AT_STARTUP=weaviate-0,weaviate-1
REINDEX_MAP_TO_BLOCKMAX_SWAP_BUCKETS=weaviate-1
```

3. `weaviate-1` が完了したら、`weaviate-2` を移行します:

```
REINDEX_MAP_TO_BLOCKMAX_AT_STARTUP=weaviate-0,weaviate-1,weaviate-2
REINDEX_MAP_TO_BLOCKMAX_SWAP_BUCKETS=weaviate-1,weaviate-2
```

4. 他のノードについても同じ手順を繰り返します。

5. すべての移行が完了し、クリーンアップ前であれば、フルノードリストの代わりに `true` を使用できます:

```
REINDEX_MAP_TO_BLOCKMAX_AT_STARTUP=true
REINDEX_MAP_TO_BLOCKMAX_SWAP_BUCKETS=true
```

</details>

## マルチテナンシー特有の注意点

テナントは動的に変化するため、マルチテナンシーコレクションは多少異なる挙動を示します。

- `REINDEX_MAP_TO_BLOCKMAX_AT_STARTUP` が設定されている場合、テナントはアクティブ化時に移行されます  
- 非アクティブ化すると移行が停止します。短時間だけテナントをアクティブにする場合、十分に進行しない可能性があるため避けてください  
- テナントの再アクティブ化（active → cold → active）は再起動と同等です:  
  - テナントでバケットを入れ替えるには、`REINDEX_MAP_TO_BLOCKMAX_SWAP_BUCKETS=true` を設定したうえで再アクティブ化が必要です  
  - 片付けを行うには、`REINDEX_MAP_TO_BLOCKMAX_TIDY_BUCKETS=true` が設定されていると、入れ替えたテナントは再アクティブ化時に片付けを行います  
  - 手順間でサーバー変数を変更した場合でも、再起動が必要です  
- 移行中に作成されたテナントは旧フォーマットで作成され、他のテナントと同様に移行されます  
  - `REINDEX_MAP_TO_BLOCKMAX_TIDY_BUCKETS` が設定されていれば、デフォルトで BlockMax フォーマットを使用し始めます  
- 最終片付けステップ後も、すべてのテナントが最終的に移行されるよう、サーバーはすべての移行変数を保持しておく必要があります  

## 移行ステータスの監視

移行プロセスはいくつかの段階を経て進行し、ステータスエンドポイントで監視できます。

1. **Not active**（マルチテナンシーのみ）

   - Status: `shard_not_loaded`  
   - Message: `shard not loaded`  
   - テナントがアクティブではありません

2. **Not Started**

   - Status: `not_started`  
   - Message: `no searchable_map_to_blockmax found` または `no started.mig found`  
   - まだ移行ファイルが存在しない、またはプロセスが開始されていません

3. **Started**

   - Status: `started`  
   - `started.mig` から開始時刻を記録  
   - `properties.mig` が存在しない場合、Message は `computing properties to reindex`

4. **In Progress**

   - Status: `in progress`  
   - `progress.mig.*` ファイル（スナップショット）で進捗を追跡  
   - 約 15 分ごとに `latest_snapshot` を更新  
   - 進捗ファイルがない場合、Message は `no progress.mig.* files found, no snapshots created yet`

5. **Reindexed**

   - Status: `reindexed`  
   - Message: `reindexing done` または `reindexing done, merging buckets`  
   - 再インデックスが完了したことを示します

6. **Merged**

   - Status: `merged`  
   - Message: `merged reindex and ingest buckets`  
   - バケットはマージ済みですが、まだ入れ替えられていません

7. **Swapped**

   - Status: `swapped`  
   - Message: `swapped buckets` または `swapped X files`  
   - 複数の `swapped.mig.*` ファイルが存在する場合があります

8. **Done**

   - Status: `done`  
   - Message: `reindexing done`  
   - 移行が完了した最終状態です

9. **Error**（どの段階でも発生し得ます）  
   - Status: `error`  
   - 失敗したファイル操作に応じたエラーメッセージが表示されます

## トラブルシューティング

### 移行中に Weaviate がクラッシュする

- 移行変数が設定されたまま再起動すれば、変換は自動的に再開します  
- 再起動時に環境変数がリセットされると、移行は停止します  
- 変数が解除され新しいデータが流入している場合、最初から移行プロセスをやり直す必要があります  

### 移行を中止してロールバックする

再インデックス処理に問題があり停止したい場合:

1. abort エンドポイントを呼び出します:

   ```
   http://<node_name>:<<debug_endpoint_port>/debug/index/rebuild/inverted/abort
   ```

2. 完全に停止し、データを初期段階に戻すにはサーバーを以下で再起動します:  
   ```
   REINDEX_MAP_TO_BLOCKMAX_AT_STARTUP=true
   REINDEX_MAP_TO_BLOCKMAX_ROLLBACK=true
   ```

:::caution

クリーンアップ前にのみロールバックが可能です！

:::

## 環境変数リファレンス

- `REINDEX_MAP_TO_BLOCKMAX_AT_STARTUP=<node_names>`: `property_<property_name>_searchable` を mapcollection から inverted/`blockmax` 形式へ変換する移行プロセスを有効化して開始します (二重書き込みを行います)。ほかの `REINDEX_MAP_TO_BLOCKMAX_*` 変数を機能させるために必要です  
- `REINDEX_MAP_TO_BLOCKMAX_SWAP_BUCKETS=<node_names>`: `mapcollection` バケットを inverted/`blockmax` にスワップし、二重書き込みを継続します。再起動時にのみ実行され、移行が完了している場合に限ります  
- `REINDEX_MAP_TO_BLOCKMAX_UNSWAP_BUCKETS=<node_names>`: inverted/`blockmax` バケットを `mapcollection` にアン スワップし、二重書き込みを継続します。再起動時にのみ実行され、バケットが既にスワップされている場合に限ります  
- `REINDEX_MAP_TO_BLOCKMAX_TIDY_BUCKETS=<node_names>`: `mapcollection` バケットを削除し、二重書き込みを停止します  
- `REINDEX_MAP_TO_BLOCKMAX_ROLLBACK=<node_names>`: 移行プロセスをロールバックし、`mapcollection` バケット (まだ削除されていない場合) を復元し、作成された inverted/`blockmax` バケットを削除します  

## `v1.29` での BlockMax WAND の使用 (技術プレビュー)

:::caution BlockMax WAND technical preview

BlockMax WAND アルゴリズムは `v1.29` で **技術プレビュー** として提供されています。**本バージョンを本番環境で使用することは推奨しません。`v1.30+` のご利用をおすすめします。**

:::

**Weaviate `v1.29` で BlockMax WAND を使用するには、コレクションを作成する前に有効化する必要があります。** このバージョンでは、既存のコレクションを BlockMax WAND に移行することはできません。

BlockMax WAND を有効にするには、環境変数 `USE_BLOCKMAX_WAND` と `USE_INVERTED_SEARCHABLE` を `true` に設定します。

これで、Weaviate に追加される新しいデータはすべて BM25 およびハイブリッド検索で BlockMax WAND を使用します。ただし、既存のデータは引き続きデフォルトの WAND アルゴリズムを使用します。


## 質問とフィードバック

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>


