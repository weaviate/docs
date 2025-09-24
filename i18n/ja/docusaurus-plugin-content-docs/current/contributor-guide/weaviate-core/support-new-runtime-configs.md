---
title: ランタイム設定
image: og/contributor-guide/weaviate-core.jpg
# tags: ['contributor-guide']
---

:::info `v1.30` で追加
:::

Weaviate はランタイム設定管理をサポートしており、特定の環境変数を再起動せずに動的に更新・読み取りできます。この機能により、リアルタイムで設定を調整し、変化するニーズに合わせてインスタンスを最適化できます。

**ランタイム設定の使い方** については、[ユーザーガイド](/deploy/configuration/env-vars/runtime-config.md) をご覧ください。本ドキュメントでは、実行中に設定を動的に変更できるようにサポートを追加する方法を説明します。

## ランタイム設定変更サポートの追加

設定を動的に管理するために、`runtime.DynamicType` と `runtime.DynamicValue` の 2 つのコア型を使用します。概要は次のとおりです。

```go
// DynamicType represents different types that is supported in runtime configs
type DynamicType interface {
    ~int | ~float64 | ~bool | time.Duration | ~string | []string
}

// DynamicValue represents any runtime config value. Its zero value is fully usable.
// If you want zero value with different `default`, use `NewDynamicValue` constructor.
type DynamicValue[T DynamicType] struct {
    ...[private fields]
}
```

つまり、`DynamicType` は現在 `~int`、`~float64`、`~bool`、`~string`、`time.Duration`、`[]string` の型をサポートしています。

設定オプションを動的更新に対応させるには、以下の高レベル手順に従ってください。例として、`int` 型の `MaxLimit` という設定があるとします。

```go
type Config struct {
    ....
    MaxLimit int
}
```

### 1. 型変換: `int` から `DynamicValue[int]`（または適切な型）へ

```go
type Config struct {
    MaxLimit *runtime.DynamicValue[int]
}
```

設定解析コード（通常は `weaviate/usecases/config/environment.go` の `FromEnv()`）も更新します。

```go
    config.MaxLimit = runtime.NewDynamicValue(12) // default value for your config is `12` now
```

### 2. `config.WeaviateRuntimeConfig` へ追加

```go
type WeaviateRuntimeConfig struct {
    ...
    MaxLimit *runtime.DynamicValue[int] `json:"max_limit" yaml:"max_limit"`
}
```

### 3. `runtime.ConfigManager` で設定を登録

通常は `adaptors/handlers/rest/configure_api.go` の `initRuntimeOverrides()` で行います。

```go
    registered := &config.WeaviateRuntimeConfig{}
    ...
    registered.MaxLimit = appState.ServerConfig.Config.MaxLimit
```

### 4. `value.Get()` で動的値を取得

現在の設定値にアクセスする際は、`config.MaxLimit` を直接参照するのではなく `config.MaxLimit.Get()` を使用してください。これにより、更新された値を動的に取得できます。

:::info
`RUNTIME_OVERRIDES_ENABLED=false` の場合、この設定は静的設定として動作し、`NewDynamicValue(12)` で指定したデフォルト値（この例では 12）が使用されます。
:::

## 参考資料

- [設定: ランタイム設定管理](/deploy/configuration/env-vars/runtime-config.md)
- [Weaviate GitHub リポジトリ](https://github.com/weaviate/weaviate/)

## 質問とフィードバック

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>

