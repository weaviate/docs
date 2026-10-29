---
title: Image generation
description: "Generate images grounded in your data as part of an Ask Mode response."
image: og/docs/query-agent.png
# tags: ['agents', 'query-agent', 'configuration']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/query-agent/_includes/code/image_gen.py';
import TSCode from '!!raw-loader!/docs/query-agent/_includes/code/image_gen.mts';

In Ask Mode, the Query Agent can generate images as part of its response. Each image is grounded in the data the agent retrieves.

:::info Client versions
Image generation requires `weaviate-agents` **1.9.0 or later** in Python, and **1.8.0 or later** in JavaScript/TypeScript. [See the installation page](../installation.md).
:::

To generate an image, pass `GeneratedImage` as the output format:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BasicImageExample"
            endMarker="# END BasicImageExample"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START BasicImageExample"
            endMarker="// END BasicImageExample"
            language="ts"
        />
    </TabItem>
</Tabs>

`GeneratedImage` is an object with two fields, `base64` and `image_prompt`. `base64` holds the generated PNG, and `image_prompt` holds the prompt the agent wrote for the image model.

<details>
<summary>Saving and displaying the image</summary>

To decode the image from its base64:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START ReadImageBase64"
            endMarker="# END ReadImageBase64"
            language="py"
        />
        Optionally, you can display the image with [Pillow](https://pypi.org/project/pillow/):
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START DisplayImage"
            endMarker="# END DisplayImage"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START ReadImageBase64"
            endMarker="// END ReadImageBase64"
            language="ts"
        />
    </TabItem>
</Tabs>

You can save it as a PNG file:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SaveImage"
            endMarker="# END SaveImage"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START SaveImage"
            endMarker="// END SaveImage"
            language="ts"
        />
    </TabItem>
</Tabs>
</details>


<details>
<summary>Uploading and searching the image in Weaviate</summary>

Provided you have a valid multimodal embedding vectorizer set up on your Weaviate collection, [for example, from the JinaAI multi2vec module](/weaviate/model-providers/jinaai/embeddings-multimodal), you can upload the base64 of the image directly to your collection.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START UploadWeaviateImage"
            endMarker="# END UploadWeaviateImage"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START UploadWeaviateImage"
            endMarker="// END UploadWeaviateImage"
            language="ts"
        />
    </TabItem>
</Tabs>

You can also search using the base64 directly on a [collection that is set up for image searching](/weaviate/search/image#by-the-base64-representation).

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START SearchWeaviateImage"
            endMarker="# END SearchWeaviateImage"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START SearchWeaviateImage"
            endMarker="// END SearchWeaviateImage"
            language="ts"
        />
    </TabItem>
</Tabs>

[See more about building an image search application in Weaviate.](https://weaviate.io/blog/how-to-build-an-image-search-application-with-weaviate#image-vectorization)
</details>

## Structured outputs with images

You can also use the `GeneratedImage` type within a structured output specification, allowing any field to return a generated image as part of a structured response. For example:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START BaseModelImageExample"
            endMarker="# END BaseModelImageExample"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START BaseModelImageExample"
            endMarker="// END BaseModelImageExample"
            language="ts"
        />
    </TabItem>
</Tabs>

See [Structured outputs](./structured_outputs.md) for more on typed responses.

You can place images anywhere in your output format, within [some constraints](#constraints). For example, you can nest types and add custom descriptions:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START ComplexBaseModelImageExample"
            endMarker="# END ComplexBaseModelImageExample"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START ComplexBaseModelImageExample"
            endMarker="// END ComplexBaseModelImageExample"
            language="ts"
        />
    </TabItem>
</Tabs>

Set a description with `Field(description=...)` in Pydantic or `.describe()` in Zod. The image model receives the description of its image field, so use it for design instructions.

:::note
If you describe a list of images, the description applies to the list, not to each image in it.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        `image_field: list[GeneratedImage] = Field(description="...")` describes the list as a whole. The image model does not receive that description for each image. To describe each image, use the following:
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START AnnotateListImageExample"
            endMarker="# END AnnotateListImageExample"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        `image_field: z.array(GeneratedImage).max(4).describe("...")` describes the list as a whole. The image model does not receive that description for each image. To describe each image, use the following:
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START AnnotateListImageExample"
            endMarker="// END AnnotateListImageExample"
            language="ts"
        />
    </TabItem>
</Tabs>
:::

## Union types with images

`GeneratedImage` is a type, so you can use it in a union. For example, the agent can return null when it finds no relevant data:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START UnionImageExample"
            endMarker="# END UnionImageExample"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START UnionImageExample"
            endMarker="// END UnionImageExample"
            language="ts"
        />
    </TabItem>
</Tabs>

## Customizing shape

You can set the shape of a generated image. In both clients, you set the shape on an image field in your structured output model.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        Import `GeneratedImageOptions` and add it as an annotation to a `GeneratedImage` field in your structured output model.
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START CustomShapeImageExample"
            endMarker="# END CustomShapeImageExample"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        Import `generatedImageWithOptions` and call it in place of `GeneratedImage` on a field in your Zod schema.
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START CustomShapeImageExample"
            endMarker="// END CustomShapeImageExample"
            language="ts"
        />
    </TabItem>
</Tabs>

Shape is the only image option. The shapes and their dimensions are:
* `"square"`: 1024×1024
* `"landscape"` (default): 1536×1024
* `"portrait"`: 1024×1536

## Raw JSON Schema

If you pass the output format as a raw JSON Schema (instead of a Pydantic model or Zod schema), add `"X-query-agent-image": true` to any object you want generated as an image. This is a custom keyword that the Query Agent recognizes. Other JSON Schema tools ignore it, so your schema stays valid. The object needs an `image_prompt` string property, where the agent writes the prompt for the image model. Do not declare a `base64` property yourself: the server adds it to the response, holding the generated PNG as a base64 string.

You can also set `"X-image-shape"` on the object to `"square"`, `"landscape"` (the default) or `"portrait"`. Any description you give the field is passed to the image model as extra instructions. Image quality cannot be configured. You can add other properties next to `image_prompt`, such as `alt_text`, and the agent fills them in like any other field.

For example, your output format can be:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START RawJSONSchemaImageExample"
            endMarker="# END RawJSONSchemaImageExample"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START RawJSONSchemaImageExample"
            endMarker="// END RawJSONSchemaImageExample"
            language="ts"
        />
    </TabItem>
</Tabs>

This declares two fields: `answer` and `image`, where the `image` field is an object with only the declared property `image_prompt`. The server adds `base64` to the `image` object in the response.

## Cost

Each generated image consumes 1 request, on top of the 4 requests an Ask Mode query consumes. A query that generates 2 images consumes 6 requests. See [usage limits](./troubleshooting.md#usage-limits).

If an image is optional, only the images that get generated are counted. This applies to a list with a variable number of images or to a nullable field.

## Constraints

* Images are generated independently. For a consistent theme among your images, add a consistent description to your image field. Try specific layout instructions, hex color codes and stylistic choices.
* Image generation adds latency. A request for several images can exceed the Python `QueryAgent` timeout, which defaults to 60 seconds. To raise it, pass `timeout` to the constructor, for example `QueryAgent(client=client, timeout=120)`. The Weaviate client timeout does not affect this limit. The JavaScript/TypeScript client has no timeout of its own.
* A request can include at most 10 images. Requests over this limit are rejected before any image is generated.
* A list of images must set a maximum number of items. Recursive schemas that contain images are rejected.

## Streaming

Image generation works with [streaming in Ask Mode](../guides/ask_mode.md#streaming). The streamed tokens include the text of `image_prompt`, because the agent writes the image prompt as part of its answer. Images are generated after the answer is complete, so the base64 of each image arrives only in the final response.

## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
