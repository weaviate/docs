---
title: ランタイム構成管理
sidebar_label: Runtime configuration
sidebar_position: 1
image: og/docs/configuration.jpg
---

:::caution Technical preview

ランタイム構成管理は **`v1.30`** で **テクニカルプレビュー** として追加されました。  
<br/>

この機能は現在も開発中であり、将来のリリースで互換性のない変更を含む可能性があります。  
**現時点では本番環境での使用を推奨しません。**

:::

Weaviate はランタイム構成管理をサポートしており、特定の環境変数を再起動なしで動的に更新・読み取りできます。これにより、ニーズの変化に合わせてリアルタイムで設定を調整し、インスタンスを最適化できます。

## ランタイム構成のセットアップ

以下の手順でランタイム構成管理をセットアップします。

1. **機能を有効化する**  
   環境変数 `RUNTIME_OVERRIDES_ENABLED` に `true` を設定します。

2. **オーバーライドファイルを用意する**  
   ランタイムオーバーライドを含む構成ファイルを作成し、`RUNTIME_OVERRIDES_PATH` でその場所を指定します。

<details>
  <summary>構成オーバーライドファイルの例</summary>

```yaml title="overrides.yaml"
maximum_allowed_collections_count: 8
autoschema_enabled: true
async_replication_disabled: false
```

</details>

3. **更新間隔を設定する**  
   `RUNTIME_OVERRIDES_LOAD_INTERVAL` で、Weaviate が構成変更を確認する頻度を指定します（デフォルトは `2m`）。

4. **インスタンスを再起動する**  
   セットアップを完了するために、Weaviate インスタンスを再起動します。

### 構成用変数

ランタイム構成管理を制御する環境変数は次のとおりです。

| Variable                          | Description                                                                  | Type                 |
| --------------------------------- | ---------------------------------------------------------------------------- | -------------------- |
| `RUNTIME_OVERRIDES_ENABLED`       | 設定するとランタイム構成管理が有効になります。デフォルト: `false`              | `boolean`            |
| `RUNTIME_OVERRIDES_PATH`          | 構成オーバーライドファイルのパス。デフォルト: `"/config/overrides.yaml"`        | `string - file path` |
| `RUNTIME_OVERRIDES_LOAD_INTERVAL` | 構成変更を確認する間隔。デフォルト: `2m`                                      | `string - duration`  |

## ランタイムで変更可能な環境変数

ランタイムで変更できる環境変数と、オーバーライドファイルで使用する名前は以下のとおりです。

| Environment variable name           | Runtime override name               |
| ----------------------------------- | ----------------------------------- |
| `ASYNC_REPLICATION_DISABLED`        | `async_replication_disabled`        |
| `AUTOSCHEMA_ENABLED`                | `autoschema_enabled`                |
| `MAXIMUM_ALLOWED_COLLECTIONS_COUNT` | `maximum_allowed_collections_count` |

各変数の詳細については、[Environment variables](./index.md) ページを参照してください。

## 運用と監視

ランタイム構成は構成ファイルの変更を監視して行われるため、いくつかの運用上の考慮事項があります。  
Weaviate が無効なランタイム構成ファイル（例: 不正な YAML）で起動しようとすると、プロセスは起動に失敗し終了します。

稼働中の Weaviate インスタンスのランタイム構成ファイルを変更し、新しい構成が無効だった場合、Weaviate はメモリに保持している最後の有効な構成を引き続き使用します。エラーログとメトリクスにより構成の読み込み失敗を確認できます。

### メトリクス
Weaviate はランタイム構成の状態を監視するために、以下の [メトリクス](../../configuration/monitoring.md) を提供します。

| Metric Name                                 | Description                                                                                                       |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `weaviate_runtime_config_last_load_success` | 直近の読み込み試行が成功したかどうかを示します（成功で `1`、失敗で `0`）                                         |
| `weaviate_runtime_config_hash`              | 現在有効なランタイム構成のハッシュ値で、新しい構成が適用されたタイミングを追跡するのに便利です                   |

### ログ

Weaviate はランタイム構成の変更を監視し、問題をトラブルシュートするための詳細なログを提供します。

#### 構成変更

ランタイム構成値が正常に更新されると、`INFO` ログが出力されます。例:

```
runtime overrides: config 'MaximumAllowedCollectionsCount' changed from '-1' to '7'  action=runtime_overrides_changed field=MaximumAllowedCollectionsCount new_value=7 old_value=-1
```

#### 構成検証エラー

稼働中に無効な構成が検出されると、`ERROR` ログが出力されます。例:

```
loading runtime config every 2m failed, using old config: invalid yaml
```

### 障害モード

ランタイム構成管理は、データ破損やサイレントフェイルを防ぐため、「早期検出・早期失敗」の原則に従います。

**1. 無効な構成での起動**  
Weaviate が無効なランタイム構成ファイルで起動しようとした場合、プロセスは起動に失敗し終了します。これにより、誤った設定で Weaviate が稼働することを防ぎます。

**2. 稼働中の無効な構成**  
Weaviate が稼働中にランタイム構成ファイルが無効になった場合:
- Weaviate はメモリに保持している最後の有効な構成を引き続き使用します  
- エラーログとメトリクスで構成読み込みの失敗を示します  
- Weaviate がクラッシュするかメモリ不足になった場合、構成が修正されるまで再起動に失敗します  

この設計により、ランタイムオーバーライドが失敗した際に環境変数デフォルトへ戻ってしまうことを防ぎ、意図しない動作やデータ問題を回避できます。

例として、次のようなシナリオを考えます。  
1. 環境変数 `MAXIMUM_ALLOWED_COLLECTIONS_COUNT` が 10 に設定されている  
2. ランタイム構成 `MaximumAllowedCollectionsCount` が 4 にオーバーライドする  
3. しばらくしてランタイム構成ファイルが無効になる  
4. Weaviate は稼働中に最後の有効な値（4）を使用し続ける  
5. Weaviate がクラッシュした場合、構成ファイルが修正されるまで再起動に失敗する  
6. これにより、誤ったデフォルト値（10）で起動することを防ぐ  

そのため、提供されているメトリクスとログを基に監視とアラートを設定し、構成の問題を積極的に検知・解決することが重要です。

