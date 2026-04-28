---
title: DigitalOcean Managed Weaviate
description: Run Weaviate as a managed service on DigitalOcean infrastructure.
image: og/docs/installation.jpg
# tags: ['installation', 'DigitalOcean']
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import FilteredTextBlock from "@site/src/components/Documentation/FilteredTextBlock";
import PyCodeV4 from "!!raw-loader!/\_includes/code/connections/connect-python-v4.py";
import TsCodeV3 from "!!raw-loader!/\_includes/code/connections/connect-ts-v3.ts";
import JavaV6Code from "!!raw-loader!/\_includes/code/java-v6/src/test/java/ConnectionTest.java";
import CSharpCode from "!!raw-loader!/\_includes/code/csharp/ConnectionTest.cs";

[**DigitalOcean Managed Weaviate**](https://docs.digitalocean.com/products/vector-databases/weaviate/) is a fully managed offering of the Weaviate open-source vector database, operated by DigitalOcean. Clusters are provisioned, secured, backed up, and patched by DigitalOcean. You are responsible for your data, your schema, and the application that reads and writes to the cluster.

:::caution Private preview
DigitalOcean Managed Weaviate is in **private preview**. APIs, plans, regions, and Control Panel surfaces may change before general availability.
:::

## Provisioning

Cluster lifecycle (creation, sizing, regions, plans, backups, credential rotation, deletion) is documented and maintained by DigitalOcean:

- [DigitalOcean - Managed Weaviate documentation](https://docs.digitalocean.com/products/vector-databases/weaviate/)

Once a cluster is provisioned, DigitalOcean returns an HTTP host, gRPC host, and an API key. Use those values to connect from an official Weaviate client.

## Connecting from a Weaviate client

Connect using the [custom-connection helper](/weaviate/connections/connect-custom). Set `WEAVIATE_HTTP_HOST`, `WEAVIATE_GRPC_HOST`, and `WEAVIATE_API_KEY` from the values DigitalOcean returned, then run:

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCodeV4}
      startMarker="# START CustomConnect"
      endMarker="# END CustomConnect"
      language="py"
    />
  </TabItem>
  <TabItem value="ts" label="JavaScript/TypeScript">
    <FilteredTextBlock
      text={TsCodeV3}
      startMarker="// START CustomConnect"
      endMarker="// END CustomConnect"
      language="ts"
    />
  </TabItem>
  <TabItem value="java6" label="Java v6">
    <FilteredTextBlock
      text={JavaV6Code}
      startMarker="// START CustomConnect"
      endMarker="// END CustomConnect"
      language="java"
    />
  </TabItem>
  <TabItem value="csharp" label="C#">
    <FilteredTextBlock
      text={CSharpCode}
      startMarker="// START CustomConnect"
      endMarker="// END CustomConnect"
      language="csharp"
    />
  </TabItem>
</Tabs>

For usage from here on out, see the standard [search](/weaviate/search), [manage collections](/weaviate/manage-collections), and [manage objects](/weaviate/manage-objects) guides.

## Further resources

- [DigitalOcean Managed Weaviate docs](https://docs.digitalocean.com/products/vector-databases/weaviate/)
- [Connect to a custom Weaviate instance](/weaviate/connections/connect-custom)
- [How-to guides](/weaviate/guides)
