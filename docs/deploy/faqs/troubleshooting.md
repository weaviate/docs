---

title: Deployment Troubleshooting Guide

---

So you've deployed Weaviate and you're fully immersed in the world of vectors when suddenly you encounter a puzzling mystery. This page will serve as your handbook for when things go awry in "Vector Land!" Consider every error message a clue to solving the mystery you're encountering. 


## Common Issues and Solutions

<details>

<summary> The cluster is not accepting new information and there are disk space or `read-only` error messages in the logs. </summary>

#### Identifying the issue

As a first step, you'll want to examine your cluster's logs to identify the problem. If after checking the logs of your cluster you see error messages that include phrases like "read-only" or "disk space," then your cluster is more than likely in a `read-only` state due to insufficient disk space.

#### Resolving the issue

To solve this mystery, you'll need to increase the available disk space for your nodes. Once the disk space is increased, then you'll need to manually mark the affected shards or collections as writeable again. 

</details>

<details>

<summary> You're receiving inconsistent query results.  </summary>

#### Identifying the issue

To confirm and identify the issue, you'll want to first run the same query multiple times to confirm that the results are inconsistent. If the inconsistent results are persisting, then you probably have asynchronous replication disabled for your deployment. 

#### Resolving the issue

Check your settings to check if you have asynchronous replication enabled. If `async_replication_disabled` is set to "true" then you'll need to set that variable to "false." Once it is enabled, the logs will show messages that indicate successful peers checks and synchronization for the nodes. 
</details>

<details>

<summary> Your nodes won't communicate, join a cluster, or maintain consensus.  </summary>

#### Identifying the issue

To confirm and identify the issue, you'll want to first run the same query multiple times to confirm that the results are inconsistent. If the inconsistent results are persisting, then you probably have asynchronous replication disabled for your deployment. 

#### Resolving the issue

Check your settings to check if you have asynchronous replication enabled. If `async_replication_disabled` is set to "true" then you'll need to set that variable to "false." Once it is enabled, the logs will show messages that indicate successful peers checks and synchronization for the nodes. 
</details>

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>