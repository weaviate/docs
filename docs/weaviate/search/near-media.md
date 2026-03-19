---
title: Multi-media search
image: og/docs/howto.jpg
description: "Search using images, video, and audio as query inputs with near_media in Weaviate."
# tags: ['how to', 'near media', 'video', 'image']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/\_includes/code/howto/search.near-media.py';

Multi-media search uses **images, video, or audio as a search input** to perform vector similarity search via the `near_media` operator.

:::tip Image search
For image-only search using `near_image`, see the dedicated [Image search](./image.md) page. The `near_media` operator shown here provides a unified interface for multiple media types.
:::

<details>
  <summary>
    Additional information
  </summary>

**Configure multi-media search**

To use images, video, or audio as search inputs, configure a multi-modal vectorizer integration that supports these media types for your collection.

For example, Google's `multi2vec-google` with the `gemini-embedding-2-preview` model supports image, video, and audio inputs. See the [model provider integrations](../model-providers/index.md) page for available options.

**Collection configuration**

The collection must be configured with the appropriate media fields. For example:

<FilteredTextBlock
  text={PyCode}
  startMarker="# START CreateCollection"
  endMarker="# END CreateCollection"
  language="py"
/>

</details>

## By local file path

Use the `near_media` operator to search by providing a file path to a video.

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START VideoFileSearch"
      endMarker="# END VideoFileSearch"
      language="py"
    />
  </TabItem>
</Tabs>

## By base64 representation

You can also provide a base64-encoded video string:

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START VideoBase64Search"
      endMarker="# END VideoBase64Search"
      language="py"
    />
  </TabItem>
</Tabs>

## Set a maximum distance

Set a maximum `distance` to filter results and return the distance metadata:

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START DistanceSearch"
      endMarker="# END DistanceSearch"
      language="py"
    />
  </TabItem>
</Tabs>

## With a filter

Combine near media searches with filters to narrow results:

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START FilteredSearch"
      endMarker="# END FilteredSearch"
      language="py"
    />
  </TabItem>
</Tabs>

## Other media types

The `near_media` operator supports other media types such as audio. Set the `media_type` parameter to the appropriate `NearMediaType` value:

<Tabs className="code" groupId="languages">
  <TabItem value="py" label="Python">
    <FilteredTextBlock
      text={PyCode}
      startMarker="# START AudioBase64Search"
      endMarker="# END AudioBase64Search"
      language="py"
    />
  </TabItem>
</Tabs>

## Supported media types

The `NearMediaType` enum supports the following media types. Available types depend on the vectorizer module and model used.

| Media type | Enum value              | Description                                                              |
| :--------- | :---------------------- | :----------------------------------------------------------------------- |
| Audio      | `NearMediaType.AUDIO`   | Audio files (e.g., `.wav`, `.mp3`)                                       |
| Image      | `NearMediaType.IMAGE`   | Image files (e.g., `.jpg`, `.png`). See also [Image search](./image.md). |
| Video      | `NearMediaType.VIDEO`   | Video files (e.g., `.mp4`, `.avi`)                                       |
| Depth      | `NearMediaType.DEPTH`   | Depth map data                                                           |
| Thermal    | `NearMediaType.THERMAL` | Thermal image data                                                       |
| IMU        | `NearMediaType.IMU`     | Inertial measurement unit data                                           |

:::note Model support
Not all models support all media types. For example, `gemini-embedding-2-preview` supports image, video, and audio. Check your model provider's documentation for supported modalities.
:::

## Related pages

- [Image search](./image.md)
- [Vector similarity search](./similarity.md)
- [Google multimodal embeddings](../model-providers/google/embeddings-multimodal.md)
- [Connect to Weaviate](/weaviate/connections/index.mdx)

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
