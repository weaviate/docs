---
title: Telemetry
sidebar_position: 80
image: og/docs/configuration.jpg
# tags: ['telemetry', 'reference', 'configuration']
---

In order to better understand community needs, Weaviate collects some telemetry data. This data helps Weaviate to identify usage trends and improve our software for our users. Weaviate collects this information by default, but you can disable telemetry at any time.

## Data collected

On startup, the Weaviate server generates a unique instance ID. Every 24 ours the instance sends this information:

- Machine id
- Payload type
- Server version
- Host operating system
- Modules used
- Number of objects in the instance
- Metadata

Weaviate does not collect any other telemetry information.

## Disabling Telemetry Data

To disable telemetry data collection, add this line to your [system configuration](/deploy/configuration/env-vars/index.md) file:

```bash
DISABLE_TELEMETRY=true
```

## Metadata

Since Weaviate version `v1.33`, Weaviate will, when available, collect basic metadata from metadata endpoints it has access to on selected cloud providers. More info for: [AWS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html), [GCP](https://docs.cloud.google.com/compute/docs/metadata/overview), [Azure](https://learn.microsoft.com/en-us/azure/virtual-machines/instance-metadata-service).

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
