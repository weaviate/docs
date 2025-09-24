---
title: ランタイム構成管理
sidebar_label: Runtime configuration
sidebar_position: 1
image: og/docs/configuration.jpg
---

:::info `v1.30` で追加
:::

Weaviate はランタイム構成管理をサポートしており、特定の環境変数を再起動なしで動的に更新・読み取りできます。この機能により、リアルタイムで設定を調整し、変化するニーズに合わせてインスタンスを微調整できます。

## ランタイム構成のセットアップ

ランタイム構成管理を設定するには、次の手順に従ってください。

1.  **機能を有効化する**  
    環境変数 `RUNTIME_OVERRIDES_ENABLED` を `true` に設定します。

2.  **オーバーライドファイルを用意する**  
    ランタイムオーバーライドを含む構成ファイルを作成し、`RUNTIME_OVERRIDES_PATH` 変数でそのパスを指定します。

    <details>
    <summary>構成オーバーライドファイルの例</summary>

    ```yaml title="overrides.yaml"
    maximum_allowed_collections_count: 8
    autoschema_enabled: true
    async_replication_disabled: false
    ```

    </details>

3.  **更新間隔を設定する**  
    `RUNTIME_OVERRIDES_LOAD_INTERVAL` 変数で、Weaviate が構成変更をチェックする頻度を定義します（デフォルトは `2m`）。

4.  **インスタンスを再起動する**  
    セットアップを完了するために、Weaviate インスタンスを再起動します。

### 構成変数

ランタイム構成管理を制御するために使用される環境変数は以下のとおりです。

| Variable                          | Description                                                                     | Type                 |
| :-------------------------------- | :------------------------------------------------------------------------------ | :------------------- |
| `RUNTIME_OVERRIDES_ENABLED`       | 設定するとランタイム構成管理が有効になります。デフォルト: `false`                | `boolean`            |
| `RUNTIME_OVERRIDES_PATH`          | 構成オーバーライドファイルのパス。                                               | `string - file path` |
| `RUNTIME_OVERRIDES_LOAD_INTERVAL` | 構成変更の有無を確認するリフレッシュ間隔。デフォルト: `2m`                      | `string - duration`  |

## ランタイムで設定可能な環境変数

以下はランタイムで変更可能な環境変数と、オーバーライドファイルで使用すべき名前の一覧です。

| Environment variable name           | Runtime override name               |
| :---------------------------------- | :---------------------------------- |
| `ASYNC_REPLICATION_DISABLED`        | `async_replication_disabled`        |
| `AUTOSCHEMA_ENABLED`                | `autoschema_enabled`                |
| `MAXIMUM_ALLOWED_COLLECTIONS_COUNT` | `maximum_allowed_collections_count` |

各変数の詳細については、[Environment variables](./index.md) ページを参照してください。

## 運用とモニタリング

ランタイム構成は構成ファイルの変更を追跡する仕組みに基づいており、運用上の注意点がいくつかあります。  
無効なランタイム構成ファイル（例: 不正な YAML）で Weaviate を起動しようとすると、プロセスは起動に失敗し終了します。

稼働中の Weaviate インスタンスでランタイム構成ファイルを変更し、その新しい構成が無効だった場合、Weaviate はメモリに保持している最後に有効な構成を引き続き使用します。エラーログとメトリクスにより、構成の読み込み失敗を確認できます。

### メトリクス

Weaviate はランタイム構成の状態を監視するため、次の [メトリクス](../../configuration/monitoring.md) を提供します。

| Metric Name                                 | Description                                                                                             |
| :------------------------------------------ | :------------------------------------------------------------------------------------------------------- |
| `weaviate_runtime_config_last_load_success` | 直近の読み込みが成功したかを示します（成功で `1`、失敗で `0`）。                                        |
| `weaviate_runtime_config_hash`              | 現在アクティブなランタイム構成のハッシュ値。新しい構成が適用されたかを追跡するのに便利です。             |

### ログ

Weaviate はランタイム構成の変更を監視し、問題をトラブルシュートするための詳細なログを提供します。

#### 構成変更

ランタイム構成値が正常に更新されると、`INFO` ログが出力されます。例:

```
runtime overrides: config 'MaximumAllowedCollectionsCount' changed from '-1' to '7'  action=runtime_overrides_changed field=MaximumAllowedCollectionsCount new_value=7 old_value=-1
```

#### 構成検証エラー

Weaviate が稼働中に無効な構成を検出すると、`ERROR` ログが出力されます。例:

```
loading runtime config every 2m failed, using old config: invalid yaml
```

### 障害モード

ランタイム構成管理は、データ破損やサイレントフェイルを防ぐため「早期失敗（fail early, fail fast）」の原則に従います。

1. **無効な構成での起動**  
   無効なランタイム構成ファイルで Weaviate を起動しようとすると、プロセスは起動に失敗し終了します。これにより不正な設定で実行されることを防ぎます。

2. **稼働中に構成が無効化**  
   Weaviate が稼働中にランタイム構成ファイルが無効になった場合:

   - Weaviate はメモリに保持している最後に有効な構成を引き続き使用します  
   - エラーログとメトリクスが構成読み込み失敗を示します  
   - Weaviate がクラッシュまたはメモリ不足で停止した場合、構成が修正されるまで再起動に失敗します  

この設計により、ランタイムオーバーライドが失敗した際に環境変数のデフォルトに戻ることを防ぎ、意図しない動作やデータ問題を回避します。

例として、次のようなシナリオを考えます。

1.  環境変数 `MAXIMUM_ALLOWED_COLLECTIONS_COUNT` が 10 に設定されている  
2.  ランタイム構成 `MaximumAllowedCollectionsCount` で 4 にオーバーライドしている  
3.  その後、ランタイム構成ファイルが無効になる  
4.  Weaviate は稼働中、最後に有効だった値（4）を使用し続ける  
5.  Weaviate がクラッシュすると、構成ファイルが修正されるまで再起動に失敗する  
6.  これによりデフォルト値（10）で起動してしまう誤動作を防ぐ  

このため、提供されているメトリクスとログを基にしたモニタリングとアラート設定を行い、構成問題を早期に検知・解決できるようにしておくことが重要です。

