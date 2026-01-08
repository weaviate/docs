---
title: Logging
image: og/docs/configuration.jpg
# tags: ['configuration', 'operations', 'logging', 'observability']
---

Weaviate produces structured logs that provide visibility into system operations, help with troubleshooting, and support security auditing.

Logs can be used to debug issues, monitor operational health, track authorization decisions, identify slow queries, and understand system behavior.

For example, the following logs showing system initialization:

```json
{"action":"startup","build_git_commit":"5f0048c","build_go_version":"go1.25.5","build_image_tag":"v1.35.1","build_wv_version":"1.35.1","default_vectorizer_module":"none","level":"info","msg":"the default vectorizer modules is set to \"none\", as a result all new schema classes without an explicit vectorizer setting, will use this vectorizer","time":"2026-01-06T15:51:32Z"}
{"action":"grpc_startup","build_git_commit":"5f0048c","build_go_version":"go1.25.5","build_image_tag":"v1.35.1","build_wv_version":"1.35.1","level":"info","msg":"grpc server listening at [::]:50051","time":"2026-01-06T15:51:34Z"}
{"action":"restapi_management","build_git_commit":"5f0048c","build_go_version":"go1.25.5","build_image_tag":"v1.35.1","build_wv_version":"1.35.1","level":"info","msg":"Serving weaviate at http://[::]:8080","time":"2026-01-06T15:51:34Z","version":"1.35.1"}
```

The "Serving weaviate at" message indicates the server is ready to accept requests. If there were issues during startup, error logs would provide details to help diagnose the problem.

## Configure Logging

Logging can be configured using [environment variables](./env-vars/index.md). Many of these environment variables can also be configured with [runtime configuration overrides](./env-vars/runtime-config.md), which allow you to change settings without restarting Weaviate.

### Log Level

The `LOG_LEVEL` [environment variable](./env-vars/index.md#LOG_LEVEL) controls the verbosity of Weaviate's logging output. The following log levels are available (from least to most verbose):

| Level | Description |
| --- | --- |
| `panic` | Panic entries only |
| `fatal` | Fatal entries only |
| `error` | Error entries only |
| `warning` | Warning and error entries |
| `info` | Informational, warning, and error entries |
| `debug` | Detailed debugging information |
| `trace` | Extremely detailed trace information |

:::warning Performance impact
The `trace` and `debug` log levels can generate significant log volume and may impact performance. Use them judiciously in production environments.
:::

### Log Format

The `LOG_FORMAT` [environment variable](./env-vars/index.md#LOG_FORMAT) controls how log entries are formatted. Weaviate supports two formats, `json` and `text`:

```sh
LOG_FORMAT=json
```

#### JSON format (default)

JSON format produces structured logs that are ideal for parsing by log aggregation systems:

```json
{"action":"startup","build_git_commit":"5f0048c","build_go_version":"go1.25.5","build_image_tag":"v1.35.1","build_wv_version":"1.35.1","default_vectorizer_module":"none","level":"info","msg":"the default vectorizer modules is set to \"none\", as a result all new schema classes without an explicit vectorizer setting, will use this vectorizer","time":"2026-01-06T15:51:32Z"}
{"action":"authorize","build_git_commit":"5f0048c","build_go_version":"go1.25.5","build_image_tag":"v1.35.1","build_wv_version":"1.35.1","component":"RBAC","level":"info","msg":"","permissions":[{"resource":"[Domain: collections, Collection: TempCollection]","results":"success"}],"rbac_log_version":2,"request_action":"D","source_ip":"192.168.65.1","time":"2026-01-06T15:51:36Z","user":"root-user"}
```

**Use JSON format when:**
- Using log aggregation tools (Elasticsearch, Loki, CloudWatch, etc.)
- Automating log analysis or alerting
- Running in production environments

#### Text format

Text format produces human-readable logs suitable for direct viewing:

```text
time="2026-01-06T15:54:58Z" level=info msg="the default vectorizer modules is set to \"none\", as a result all new schema classes without an explicit vectorizer setting, will use this vectorizer" action=startup build_git_commit=5f0048c build_go_version=go1.25.5 build_image_tag=v1.35.1 build_wv_version=1.35.1 default_vectorizer_module=none
time="2026-01-06T15:55:01Z" level=info action=authorize build_git_commit=5f0048c build_go_version=go1.25.5 build_image_tag=v1.35.1 build_wv_version=1.35.1 component=RBAC permissions="[map[resource:[Domain: collections, Collection: TempCollection] results:success]]" rbac_log_version=2 request_action=D source_ip=192.168.65.1 user=root-user
```

**Use text format when:**
- Viewing logs directly in the terminal during development
- Debugging issues locally
- Easier visual scanning is preferred over machine parsing

## Accessing Logs

Weaviate logs can be accessed using standard container logging commands. For example:

**Docker:**
```bash
# View logs
docker logs <container-name>

# Follow logs in real-time
docker logs -f <container-name>
```

For more Docker logging options, see the [Docker logs documentation](https://docs.docker.com/reference/cli/docker/container/logs/).

**Kubernetes:**
```bash
# View logs
kubectl logs <pod-name>

# Follow logs in real-time
kubectl logs -f <pod-name>
```

For more Kubernetes logging options, see the [kubectl logs documentation](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/).

## Special-Purpose Logging

### Slow Query Logging

Weaviate can log queries that exceed a specified duration threshold. This is useful for identifying performance bottlenecks.

To enable slow query logging, set these [environment variables](./env-vars/index.md):

```sh
QUERY_SLOW_LOG_ENABLED=true
QUERY_SLOW_LOG_THRESHOLD=2s
```

When enabled, queries exceeding the threshold will be logged at the configured log level, allowing you to identify and optimize slow operations.

### Tenant Activity Logging

For multi-tenant collections, you can configure the log level for tenant read and write activity.

```sh
TENANT_ACTIVITY_READ_LOG_LEVEL=info
TENANT_ACTIVITY_WRITE_LOG_LEVEL=info
```

### Authorization Audit Logging

When [RBAC authorization](/deploy/configuration/configuring-rbac.md) is enabled, Weaviate automatically logs authorization decisions and role management operations for audit purposes. These logs capture:

- User making the request
- Action being authorized or performed
- Authorization decision (allowed or denied)
- User groups (if applicable)
- Source IP address (optional)
- Resource being accessed

#### Authorization decision logs

Authorization decision logs are generated for RBAC-based authorization evaluations. These logs record both successful and denied authorization attempts, making them valuable for security auditing and troubleshooting access issues.

**Key fields:**
- `user` - The user making the request
- `request_action` - The action being attempted (see action codes below)
- `permissions.resource` - The resource being accessed
- `permissions.results` - Authorization outcome (`success` or `denied`)
- `source_ip` - IP address of the client (if available)

**Example successful authorization:**

In this example, user `root-user` successfully deleted the `TempCollection`:

```json
{
  "action": "authorize",
  "build_git_commit": "5f0048c",
  "build_go_version": "go1.25.5",
  "build_image_tag": "v1.35.1",
  "build_wv_version": "1.35.1",
  "component": "RBAC",
  "level": "info",
  "msg": "",
  "permissions": [
    {
      "resource": "[Domain: collections, Collection: TempCollection]",
      "results": "success"
    }
  ],
  "rbac_log_version": 2,
  "request_action": "D",
  "source_ip": "192.168.65.1",
  "time": "2026-01-06T15:51:36Z",
  "user": "root-user"
}
```

The `request_action: "D"` indicates a Delete operation, and `results: "success"` confirms the user had the necessary permissions.

**Example denied authorization:**

When authorization is denied, the log entry differs in several ways. Here is a denied authorization example:

```json
{
  "action": "authorize",
  "build_git_commit": "5f0048c",
  "build_go_version": "go1.25.5",
  "build_image_tag": "v1.35.1",
  "build_wv_version": "1.35.1",
  "component": "RBAC",
  "level": "error",
  "msg": "authorization denied",
  "permissions": [],
  "rbac_log_version": 2,
  "request_action": "D",
  "source_ip": "192.168.65.1",
  "time": "2026-01-08T16:17:47Z",
  "user": "readonly-user"
}
```

In this example, user `readonly-user` attempted to delete a collection but lacked the necessary permissions.

:::note Request action codes
The `request_action` field uses single-letter codes for compactness:
- `C` - Create
- `R` - Read
- `U` - Update
- `D` - Delete
- `A` - Assign/Revoke (for user and group assignments)
- `C_ALL`, `R_ALL`, `U_ALL`, `D_ALL` - Role actions on all resources of a type
- `C_MATCH`, `R_MATCH`, `U_MATCH`, `D_MATCH` - Role actions on resources matching a pattern
:::

#### Role management logs

RBAC role creation and deletion operations are also logged for audit purposes:

Example role creation:

```json
{
  "action": "create_role",
  "build_git_commit": "5f0048c",
  "build_go_version": "go1.25.5",
  "build_image_tag": "v1.35.1",
  "build_wv_version": "1.35.1",
  "component": "RBAC",
  "level": "info",
  "msg": "role created",
  "permissions": [
    {
      "action": "read_collections",
      "collections": {"collection": "*"}
    },
    {
      "action": "read_data",
      "data": {"collection": "*", "tenant": "*"}
    }
  ],
  "roleName": "ReaderRole",
  "time": "2026-01-06T15:52:58Z",
  "user": "root-user"
}
```

Example role deletion:

```json
{
  "action": "delete_role",
  "build_git_commit": "5f0048c",
  "build_go_version": "go1.25.5",
  "build_image_tag": "v1.35.1",
  "build_wv_version": "1.35.1",
  "component": "RBAC",
  "level": "info",
  "msg": "role deleted",
  "roleName": "ReaderRole",
  "time": "2026-01-06T15:53:31Z",
  "user": "root-user"
}
```

These audit logs are automatically generated when RBAC is enabled - no additional configuration is required.

## Further resources

- [Configuration: Monitoring (Prometheus metrics)](./monitoring.md)
- [Configuration: Environment variables](./env-vars/index.md)
- [Configuration: RBAC](./configuring-rbac.md)
- [Troubleshooting](../faqs/troubleshooting.md)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
