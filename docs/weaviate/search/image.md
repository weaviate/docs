---
title: Image search
sidebar_position: 25
image: og/docs/howto.jpg
# tags: ['how to', 'image']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/_includes/code/howto/search.image.py';
import PyCodeV3 from '!!raw-loader!/_includes/code/howto/search.image-v3.py';
import TSCode from '!!raw-loader!/_includes/code/howto/search.image.ts';
import TSCodeLegacy from '!!raw-loader!/_includes/code/howto/search.image-v2.ts';
import GoCode from '!!raw-loader!/_includes/code/howto/go/docs/mainpkg/search-image_test.go';
import JavaCode from '!!raw-loader!/_includes/code/howto/java/src/test/java/io/weaviate/docs/search/ImageSearchTest.java';

`Image` search uses an **image as a search input** to perform vector similarity search.

<details>
  <summary>
    Additional information
  </summary>

**Configure image search**

To use images as search inputs, configure an image vectorizer integration for your collection. See the model provider integrations page for a [list of available integrations](../model-providers/index.md).

</details>

<!-- ## Named vectors

:::info Added in `v1.24`
::: -->

<!-- Any vector-based search on collections with [named vectors](../config-refs/collections.mdx#named-vectors) configured must include a `target` vector name in the query. This allows Weaviate to find the correct vector to compare with the query vector. -->

## By local image path

Use the `Near Image` operator to execute image search.<br/>
If your query image is stored in a file, you can use the client library to search by its filename.

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START ImageFileSearch"
      endMarker="# END ImageFileSearch"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START ImageFileSearch"
      endMarker="# END ImageFileSearch"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">

  <FilteredTextBlock
    text={TSCode}
    startMarker="// START ImageFileSearch"
    endMarker="// END ImageFileSearch"
    language="ts"
  />

  </TabItem>

  <TabItem value="js2" label="JS/TS Client v2">

  > Not available yet. Vote for the [feature request](https://github.com/weaviate/typescript-client/issues/65). DIY code below.

  <FilteredTextBlock
    text={TSCodeLegacy}
    startMarker="// START ImageFileSearch"
    endMarker="// END ImageFileSearch"
    language="ts"
  />
  </TabItem>


  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START ImageFileSearch"
      endMarker="// END ImageFileSearch"
      language="gonew"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START ImageFileSearch"
      endMarker="// END ImageFileSearch"
      language="java"
    />
  </TabItem>

</Tabs>

<details>
  <summary>Example response</summary>

  <FilteredTextBlock
    text={TSCode}
    startMarker="# START Expected base64 results"
    endMarker="# END Expected base64 results"
    language="json"
  />

</details>


## By the base64 representation

You can search by a base64 representation of an image:

<Tabs groupId="languages">
  <TabItem value="py" label="Python Client v4">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START search with base64"
      endMarker="# END search with base64"
      language="py"
    />
  </TabItem>

  <TabItem value="py3" label="Python Client v3">
    <FilteredTextBlock
      text={PyCodeV3}
      startMarker="# START search with base64"
      endMarker="# END search with base64"
      language="pyv3"
    />
  </TabItem>

  <TabItem value="js" label="JS/TS Client v3">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START search with base64"
      endMarker="// END search with base64"
      language="ts"
    />
  </TabItem>

   <TabItem value="js2" label="JS/TS Client v2">
    <FilteredTextBlock
      text={TSCodeLegacy}
      startMarker="// START search with base64"
      endMarker="// END search with base64"
      language="tsv2"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START search with base64"
      endMarker="// END search with base64"
      language="gonew"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START search with base64"
      endMarker="// END search with base64"
      language="java"
    />
  </TabItem>
</Tabs>


<details>
  <summary>Example response</summary>

  <FilteredTextBlock
    text={PyCode}
    startMarker="# START Expected base64 results"
    endMarker="# END Expected base64 results"
    language="json"
  />

</details>


## Create a base64 representation of an online image.

You can create a base64 representation of an online image, and use it as input for similarity search [as shown above](#by-the-base64-representation).

<Tabs groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START helper base64 functions"
      endMarker="# END helper base64 functions"
      language="py"
    />
  </TabItem>
  <TabItem value="js" label="JS/TS">
    <FilteredTextBlock
      text={TSCode}
      startMarker="// START helper base64 functions"
      endMarker="// END helper base64 functions"
      language="js"
    />
  </TabItem>

  <TabItem value="go" label="Go">
    <FilteredTextBlock
      text={GoCode}
      startMarker="// START helper base64 functions"
      endMarker="// END helper base64 functions"
      language="gonew"
    />
  </TabItem>

  <TabItem value="java" label="Java">
    <FilteredTextBlock
      text={JavaCode}
      startMarker="// START helper base64 functions"
      endMarker="// END helper base64 functions"
      language="java"
    />
  </TabItem>

</Tabs>

## Combination with other operators

A `Near Image` search can be combined with any other operators (like filter, limit, etc.), just as other similarity search operators.

See the [`similarity search`](./similarity.md) page for more details.

## Related pages

- [Connect to Weaviate](/weaviate/connections/index.mdx)

## Questions and feedback

import DocsFeedback from '/_includes/docs-feedback.mdx';

<DocsFeedback/>
