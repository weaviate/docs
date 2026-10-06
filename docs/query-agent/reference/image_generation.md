---
title: Image generation
description: "Use your data to influence image generation"
image: og/docs/query-agent.png
# tags: ['agents', 'query-agent', 'configuration']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import FilteredTextBlock from '@site/src/components/Documentation/FilteredTextBlock';
import PyCode from '!!raw-loader!/docs/query-agent/_includes/code/image_gen.py';
import TSCode from '!!raw-loader!/docs/query-agent/_includes/code/image_gen.mts';

In ask mode, as part of your response, you can ask the query agent to output an image type. The image generation is grounded in data retrieved from any searches performed.

To generate an image, you can set the output format argument, which controls the structured output, to be a `QAImage`, imported and used as below:

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

`QAImage` is a custom object containing two fields, `base64` and `image_prompt`. This object can be placed anywhere within a structured output model to add an image's base64 to that field. 

<details>
<summary>Saving and displaying the image</summary>

To read an image from its base64, for example, you can do the following:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START ReadImageBase64"
            endMarker="# END ReadImageBase64"
            language="py"
        />
        Optionally, you can display the image using [PIL](https://pypi.org/project/pillow/)
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
<summary>Uploading/searching the image with Weaviate</summary>

Provided you have a valid multimodal embedding vectorizer set up on your Weaviate collection, [for example, from the JinaAI multi2vec module](https://docs.weaviate.io/weaviate/model-providers/jinaai/embeddings-multimodal), you can upload the base64 of the image directly to your collection.

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

You can also search using the base64 directly on a [collection that is set up for image searching](https://docs.weaviate.io/weaviate/search/image#by-the-base64-representation).

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

You can also use the `QAImage` type within a structured output specification, allowing any field to return a generated image as part of a structured response. For example:

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

[See the structured output section for more details on enforcing typed responses](./structured_outputs.md). 

You are free to specify images within your output format as freely as you want (within [some constraints](#constraints)), meaning you can nest types, add custom descriptions, and more:

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

The `description` field (set with `.describe()` on a Zod schema) allows you to customize instructions for each particular field. For image generation, this is especially useful, as it will allow you to place specific image-based design instructions here. This description is always included in the request to image generation.

:::note
If you are describing a list of images, the description is placed upon the list itself, and not the individual images. To pass a list of images with a shared image description, you can do the following:

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        Using `image_field: list[QAImage] = Field(description="...")`, will place a shared image description across the entire list, and won't be seen (directly) by the image generation model. To describe individual images, use the following:
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START AnnotateListImageExample"
            endMarker="# END AnnotateListImageExample"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        Using `image_field: z.array(QAImage).max(4).describe("...")`, will place a shared image description across the entire list, and won't be seen (directly) by the image generation model. To describe individual images, use the following:
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

Since the `QAImage` is a type, you can also do, for example, unions on the type. This allows the model to either fill in an image, or if some other condition is met, fill in something else. A simple example involves outputting a null type if no relevant data is found:

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

You can optionally change the shape of a generated image by sending an additional field to the image request. This works for direct requests or any structured output model fields.

<Tabs className="code" groupId="languages">
    <TabItem value="py_agents" label="Python">
        Import `ImageOptions` and add it as an annotation to the `QAImage` class itself. 
        <FilteredTextBlock
            text={PyCode}
            startMarker="# START CustomShapeImageExample"
            endMarker="# END CustomShapeImageExample"
            language="py"
        />
    </TabItem>
    <TabItem value="ts_agents" label="JavaScript/TypeScript">
        Import `imageWithOptions` and use this class instead of `QAImage`.
        <FilteredTextBlock
            text={TSCode}
            startMarker="// START CustomShapeImageExample"
            endMarker="// END CustomShapeImageExample"
            language="ts"
        />
    </TabItem>
</Tabs>

Currently, the only supported optional keyword on images is image shape. These shapes and their dimensions are as follows:
* `"square"`: 1024×1024
* `"landscape"` (default): 1536×1024
* `"portrait"`: 1024×1536

## Raw JSON Schema

If you pass the output format as a raw JSON Schema (instead of a Pydantic model or Zod schema), add `"X-query-agent-image": true` to any object you want generated as an image. This is a custom keyword that the Query Agent recognises. Other JSON Schema tools ignore it, so your schema stays valid. The object needs an `image_prompt` string property, where the agent writes the prompt for the image model. Don't declare a `base64` property yourself: the server adds it to the response, holding the generated PNG as a base64 string.

You can also set `"X-image-shape"` on the object to `"square"`, `"landscape"` (the default) or `"portrait"`. Any description you give the field is passed to the image model as extra instructions. Image quality can't be configured. You can add other properties next to `image_prompt`, such as `alt_text`, and the agent fills them in like any other field.

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

This declares two fields: `answer` and `image`, where the `image` field is an object with only the declared property `image_prompt`. The `base64` property will be added to the `image` object on the response from the server. 

## Cost

Each requested image costs a single request unit, on top of existing request costs. Ask mode by default costs 4 requests, so a single ask mode request with 2 generated images will cost `4 + 2 = 6` requests.

If you specify an optional image, for example a list with a variable number of images, or an optional field, you will only be billed for those images that get generated.

## Constraints

**Streaming**: The streamed tokens contain the text of `image_prompt` (the model writes the image prompt as part of its answer). The image's base64 only arrives in the final response, because images are generated after the answer is written.

**Images are generated independently**, meaning that if you want a consistent theme amongst your requested images, you should add a consistent description to your image field. Try specifying specific layout instructions, hex color codes and stylistic choices.

**Timeouts**: image generation adds latency. In Python, when your output format contains images, the client's default timeout rises from 60 to 180 seconds. If you set your own `timeout`, make sure it's long enough.

The following requests will be rejected before any generation attempt is made:
* You cannot have more than 10 image requests per structured output request.
* You cannot have an unbounded number of images, if requesting a list of images, it must set the maximum number of items. Recursive schemas containing images are also rejected.


## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>
