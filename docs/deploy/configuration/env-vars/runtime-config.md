---
title: Runtime configuration management
sidebar_label: Runtime configuration
sidebar_position: 1
image: og/docs/configuration.jpg
---

:::info Added in `v1.30`
:::

Weaviate supports runtime configuration management, allowing some configurations to be changed without any further restarts.

Each runtime configuration corresponds to an existing environment variable. When a runtime configuration is updated, it overrides the value set by the corresponding environment variable.

## How to set up runtime configuration

1.  **Enable the feature**
    Set the environment variable `RUNTIME_OVERRIDES_ENABLED` to `true`.

2.  **Provide an overrides file**
    Create a configuration file that contains the runtime overrides and point to it using the `RUNTIME_OVERRIDES_PATH` variable.

    <details>
    <summary>Example configuration override file</summary>

    ```yaml title="overrides.yaml"
    maximum_allowed_collections_count: 8
    autoschema_enabled: true
    async_replication_disabled: false
    ```

    </details>

3.  **Set the update interval**
    Set the `RUNTIME_OVERRIDES_LOAD_INTERVAL` variable to define how often Weaviate should check for configuration changes (default is `2m`).

4.  **Restart the instance**
    In order to finish the setup, restart your Weaviate instance.

### Configuration variables

The following environment variables are used to control runtime configuration management:

| Variable                          | Description                                                                  | Type                 |
| :-------------------------------- | :--------------------------------------------------------------------------- | :------------------- |
| `RUNTIME_OVERRIDES_ENABLED`       | If set, the runtime configuration management is enabled. Default: `false`    | `boolean`            |
| `RUNTIME_OVERRIDES_PATH`          | Path of the configuration override file.                      | `string - file path` |
| `RUNTIME_OVERRIDES_LOAD_INTERVAL` | The interval between reading the configuration override file. Default: `2m`  | `string - duration`  |

## Available overrides

The following overrides are currently supported:

### General

| Runtime override name                            | Environment variable name                    |
| :----------------------------------------------- | :------------------------------------------- |
| `async_replication_disabled`                     | `ASYNC_REPLICATION_DISABLED`                 |
| `async_replication_cluster_max_workers`          | `ASYNC_REPLICATION_CLUSTER_MAX_WORKERS`      |
| `autoschema_enabled`                             | `AUTOSCHEMA_ENABLED`                         |
| `default_quantization`                           | `DEFAULT_QUANTIZATION`                       |
| `inverted_sorter_disabled`                       | `INVERTED_SORTER_DISABLED`                   |
| `maximum_allowed_collections_count`              | `MAXIMUM_ALLOWED_COLLECTIONS_COUNT`          |
| `objects_ttl_delete_schedule`                    | `OBJECTS_TTL_DELETE_SCHEDULE`                |
| `operational_mode`                               | `OPERATIONAL_MODE`                           |
| `query_slow_log_enabled`                         | `QUERY_SLOW_LOG_ENABLED`                     |
| `query_slow_log_threshold`                       | `QUERY_SLOW_LOG_THRESHOLD`                   |
| `replica_movement_minimum_async_wait`            | `REPLICA_MOVEMENT_MINIMUM_ASYNC_WAIT`        |
| `replicated_indices_request_queue_enabled`       | `REPLICATED_INDICES_REQUEST_QUEUE_ENABLED`   |
| `revectorize_check_disabled`                     | `REVECTORIZE_CHECK_DISABLED`                 |
| `tenant_activity_read_log_level`                 | `TENANT_ACTIVITY_READ_LOG_LEVEL`             |
| `tenant_activity_write_log_level`                | `TENANT_ACTIVITY_WRITE_LOG_LEVEL`            |

### Raft settings

| Runtime override name       | Environment variable name   |
| :-------------------------- | :-------------------------- |
| `raft_drain_sleep`          | `RAFT_DRAIN_SLEEP`          |
| `raft_timeouts_multiplier`  | `RAFT_TIMEOUTS_MULTIPLIER`  |

### Usage tracking

| Runtime override name          | Environment variable name      |
| :----------------------------- | :----------------------------- |
| `usage_gcs_bucket`             | `USAGE_GCS_BUCKET`             |
| `usage_gcs_prefix`             | `USAGE_GCS_PREFIX`             |
| `usage_policy_version`         | `USAGE_POLICY_VERSION`         |
| `usage_s3_bucket`              | `USAGE_S3_BUCKET`              |
| `usage_s3_prefix`              | `USAGE_S3_PREFIX`              |
| `usage_scrape_interval`        | `USAGE_SCRAPE_INTERVAL`        |
| `usage_shard_jitter_interval`  | `USAGE_SHARD_JITTER_INTERVAL`  |
| `usage_verify_permissions`     | `USAGE_VERIFY_PERMISSIONS`     |

### Authentication

| Runtime override name                      | Environment variable name              |
| :----------------------------------------- | :------------------------------------- |
| `authentication_oidc_certificate`          | `AUTHENTICATION_OIDC_CERTIFICATE`      |
| `authentication_oidc_client_id`            | `AUTHENTICATION_OIDC_CLIENT_ID`        |
| `authentication_oidc_groups_claim`         | `AUTHENTICATION_OIDC_GROUPS_CLAIM`     |
| `authentication_oidc_issuer`               | `AUTHENTICATION_OIDC_ISSUER`           |
| `authentication_oidc_jwks_url`             | `AUTHENTICATION_OIDC_JWKS_URL`         |
| `authentication_oidc_scopes`               | `AUTHENTICATION_OIDC_SCOPES`           |
| `authentication_oidc_skip_client_id_check` | `AUTHENTICATION_OIDC_SKIP_CLIENT_ID_CHECK` |
| `authentication_oidc_username_claim`       | `AUTHENTICATION_OIDC_USERNAME_CLAIM`   |

Refer to the [Environment variables](./index.md) page for descriptions on each configuration option

## Operation and monitoring

Runtime configuration is based on tracking configuration file changes, which involves certain operational considerations.
If Weaviate attempts to start with an invalid runtime configuration file (e.g., malformed YAML), the process will fail to start and exit.

When modifying the runtime configuration file for a running Weaviate instance, if the new configuration is invalid, Weaviate continues using the last valid configuration that is stored in memory. Error logs and metrics will indicate when configuration loading fails.

### Metrics

Weaviate provides the following [metrics to help you monitor](../../configuration/monitoring.md) runtime configuration status:

| Metric Name                                 | Description                                                                                                       |
| :------------------------------------------ | :---------------------------------------------------------------------------------------------------------------- |
| `weaviate_runtime_config_last_load_success` | Indicates whether the last loading attempt was successful (`1` for success, `0` for failure)                      |
| `weaviate_runtime_config_hash`              | Hash value of the currently active runtime configuration, useful for tracking when new configurations take effect |

### Logs

Weaviate provides detailed logging to help you monitor runtime configuration changes and troubleshoot issues.

#### Configuration changes

When runtime configuration values are successfully updated, you'll see an `INFO` log. For example:

```
runtime overrides: config 'MaximumAllowedCollectionsCount' changed from '-1' to '7'  action=runtime_overrides_changed field=MaximumAllowedCollectionsCount new_value=7 old_value=-1
```

#### Configuration validation errors

When an invalid configuration is detected while Weaviate is running, you'll see an `ERROR` log. For example:

```
loading runtime config every 2m failed, using old config: invalid yaml
```

### Failure modes

Runtime configuration management follows a "fail early, fail fast" principle to prevent data corruption and silent failures:

**1. Startup with invalid configuration** - If Weaviate attempts to start with an invalid runtime configuration file, the process will fail to start and exit. This ensures Weaviate never runs with incorrect settings.

**2. Invalid configuration during runtime** - When Weaviate is running and the runtime configuration file becomes invalid:

- Weaviate continues using the last valid configuration stored in memory
- Error logs and metrics indicate the configuration loading failure
- If Weaviate crashes or runs out of memory, it will fail to restart until the configuration is fixed

This design prevents Weaviate from falling back to environment variable defaults when runtime overrides fail, which could lead to unintended behavior or data issues.

Here is an example scenario:

1.  Environment variable `MAXIMUM_ALLOWED_COLLECTIONS_COUNT` is set to 10
2.  Runtime configuration `MaximumAllowedCollectionsCount` overrides this to 4
3.  After some time, the runtime configuration file becomes invalid
4.  Weaviate continues using the last valid value (4) while running
5.  If Weaviate crashes, it will fail to restart until the configuration file is fixed
6.  This prevents starting with the environment default (10), which would be incorrect

This is why it's important to set up monitoring and alerting based on the provided metrics and logs to proactively identify and resolve configuration issues.
