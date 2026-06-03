# Removed content — cleanup tracking

This file tracks documentation content that describes **removed** Weaviate features,
environment variables, or configuration fields. Rather than deleting such content the
moment a feature is removed, we keep it in place with a short "Removed in `vX.Y`" note so
that users upgrading from an older version can still find the entry and understand what
happened to it. Once enough releases have passed that few users are upgrading across the
removal boundary, the noted content should be deleted.

## Policy

- When a feature/env var/config field is removed from Weaviate, **mark** the corresponding
  docs entry as `Removed in vX.Y` instead of deleting it immediately.
- Add a row to the table below so the kept-but-stale content can be found and cleaned later.
- **Suggested cleanup window:** keep the note for roughly three minor releases after the
  removal, then delete the entry and remove its row here. (Adjust per the supported-version
  policy at cleanup time — these are guidelines, not hard commitments.)

## Tracked entries

| Page / file | Removed item | Removed in | Suggested cleanup | Notes |
| --- | --- | --- | --- | --- |
| `docs/deploy/configuration/env-vars/index.md` | `ASYNC_REPLICATION_CLUSTER_MAX_WORKERS` (table row) | `v1.38` | `v1.41`+ | Replaced by `ASYNC_REPLICATION_SCHEDULER_WORKERS`. |
| `docs/deploy/configuration/env-vars/index.md` | `ASYNC_REPLICATION_ALIVE_NODES_CHECKING_FREQUENCY` (table row) | `v1.38` | `v1.41`+ | Scheduler no longer polls alive nodes separately. |
| `docs/deploy/configuration/env-vars/runtime-config.md` | `async_replication_cluster_max_workers` (override mapping row) | `v1.38` | `v1.41`+ | Runtime override removed alongside the env var. |
| `docs/deploy/configuration/async-rep.md` | "Removed environment variables (v1.38)" `<details>` block (both vars above) | `v1.38` | `v1.41`+ | Delete the whole block at cleanup. |
| `docs/deploy/configuration/replication.md` | "Removed in `v1.38`" `:::note` admonition | `v1.38` | `v1.41`+ | Mentions both removed env vars. |
