---
title: Deployment Troubleshooting Guide
---

import SkipLink from '/src/components/SkipValidationLink'

So you've deployed Weaviate and you're fully immersed in the world of vectors when suddenly you encounter a puzzling mystery. This page will serve as your handbook for when things go awry in "Vector Land!"

Consider every error message a clue to solving the mystery you're encountering. The [LOG_LEVEL](/deploy/configuration/env-vars#LOG_LEVEL) environment variable helps you to solve any mysteries you encounter. The various levels of logging will allow you to right-size the precise amount of information you need to solve any Vector Land mysteries.

## Common issues and solutions

### The cluster is not accepting new information and there are disk space or `read-only` error messages in the logs.

<details>

<summary>Answer</summary>

#### Identifying the issue

As a first step, you'll want to examine your cluster's logs to identify the problem. If after checking the logs of your cluster you see error messages that include phrases like "read-only" or "disk space," then your cluster is more than likely in a `read-only` state due to insufficient disk space.

#### Resolving the issue

To solve this mystery, you'll need to increase the available disk space for your nodes. Once the disk space is increased, then you'll need to manually mark the affected shards or collections as writeable again.
You can also set the [`MEMORY_WARNING_PERCENTAGE`](/deploy/configuration/env-vars/index.md#MEMORY_WARNING_PERCENTAGE) environment variable to issue warnings when the memory limit is near.

</details>

### You're receiving inconsistent query results.

<details>

<summary> Answer </summary>

#### Identifying the issue

To confirm and identify the issue, you'll want to first run the same query multiple times to confirm that the results are inconsistent. If the inconsistent results are persisting, then you probably have asynchronous replication disabled for your deployment.

#### Resolving the issue

Check your settings to check if you have asynchronous replication enabled. If `async_replication_disabled` is set to "true" then you'll need to set that variable to "false." Once it is enabled, the logs will show messages that indicate successful peers checks and synchronization for the nodes.

</details>

### Your nodes won't communicate, join a cluster, or maintain consensus.

<details>

<summary> Answer </summary>

#### Identifying the issue

To confirm and identify the issue, you'll want to first run the same query multiple times to confirm that the results are inconsistent. If the inconsistent results are persisting, then you probably have asynchronous replication disabled for your deployment.

#### Resolving the issue

Check your settings to check if you have asynchronous replication enabled. If `async_replication_disabled` is set to "true" then you'll need to set that variable to "false." Once it is enabled, the logs will show messages that indicate successful peers checks and synchronization for the nodes. Additionally, test the <SkipLink href="/weaviate/api/rest#tag/well-known/GET/.well-known/live">live and ready REST endpoints</SkipLink>. and check the network configuration of the nodes.
</details>

### You've downgraded and now your clusters won't reach the `Ready` state.

<details>

<summary> Answer </summary>

#### Identifying the issue

If you have a multi-node instance running `1.28.13+`, `1.29.5+`, or `1.30.2+` and have downgraded to a `v1.27.x` version earlier than `1.27.26`.

#### Resolving the issue

If you need to downgrade Weaviate to `v1.27.x`, use `1.27.26` or higher.

- [Migration guides](../migration/index.md)

</details>

As you continue your adventures in Vector Land, remember that even the most seasoned vector detectives encounter mysterious cases from time to time. Behind every error message lies not just a problem, but the clue you need to run Weaviate in its most optimal form!

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
