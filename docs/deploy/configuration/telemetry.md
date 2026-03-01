---
title: Telemetry
sidebar_position: 80
image: og/docs/configuration.jpg
# tags: ['telemetry', 'reference', 'configuration']
---

To help us improve Weaviate and understand community usage trends, Weaviate collects telemetry data by default. This includes basic information like your server version, operating system, and the number of objects in your instance.

We do **not** collect your data objects, collection names, or any content from your datasets. Only the information listed below is collected.

## Data collected

On startup, the Weaviate server generates a unique instance ID. Every 24 hours the instance sends this information:

- Machine id
- Payload type
- Server version
- Host operating system
- Modules used
- Number of objects in the instance
- Cloud Metadata (see below)

Weaviate does not collect any other telemetry information.

## Disabling telemetry data

To disable telemetry, add this line to your [system configuration](/deploy/configuration/env-vars/index.md) file:

```bash
DISABLE_TELEMETRY=true
```

## Cloud metadata

Since Weaviate version `v1.33`, Weaviate will, when available, collect basic metadata from metadata endpoints it has access to on selected cloud providers (Google Cloud, Amazon Web Services, Azure).

More information about the metadata endpoints:

* [AWS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html)
* [GCP](https://docs.cloud.google.com/compute/docs/metadata/overview)
* [Azure](https://learn.microsoft.com/en-us/azure/virtual-machines/instance-metadata-service)

The cloud metadata contains:

* AWS: [AWS Account ID](https://docs.aws.amazon.com/accounts/latest/reference/manage-acct-identifiers.html)
* GCP: [Project ID](https://docs.cloud.google.com/resource-manager/docs/creating-managing-projects)
* Azure: [Subscription ID](https://learn.microsoft.com/en-us/azure/azure-portal/get-subscription-tenant-id)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
