import 'dotenv/config'
const { loadClientInternally, populateWeaviate } = await import('./util.mjs').catch(() => import('../docs/query-agent/_includes/code/util.mjs'));

const client = await loadClientInternally();
await populateWeaviate(client, false);

if (await client.collections.exists("QueryAgentImageUpload")) {
    await client.collections.delete("QueryAgentImageUpload");
}

// START BasicImageExample
import { QueryAgent, GeneratedImage } from '@weaviate/agents';

const qa = new QueryAgent(client); // your Weaviate Cloud client
const response = await qa.ask(
    "Chart the temperature for the first four weeks of 2023",
    { collections: ["Weather"], outputFormat: GeneratedImage }
);

response.finalAnswerParsed.base64; // base64 of the image
response.finalAnswerParsed.image_prompt; // prompt used to generate image based on data
// END BasicImageExample

// START ReadImageBase64
const imageBytes = Buffer.from(response.finalAnswerParsed.base64, "base64"); // PNG
// END ReadImageBase64

// START SaveImage
import { writeFileSync } from 'node:fs';

writeFileSync("image.png", imageBytes);
// END SaveImage

// START UploadWeaviateImage
import weaviate from '@weaviate/node';

const collection = await client.collections.create({
    name: "QueryAgentImageUpload",
    vectorizers: weaviate.configure.vectors.multi2VecJinaAI({
        name: "image_vector",
        imageFields: [{ name: "image" }],
    }),
    properties: [
        { name: "image", dataType: weaviate.configure.dataType.BLOB },
    ],
});

await collection.data.insert({
    image: response.finalAnswerParsed.base64,
});
// END UploadWeaviateImage

// START SearchWeaviateImage
const searchResponse = await collection.query.nearImage(
    response.finalAnswerParsed.base64,
    { returnProperties: ["image"] }
);
// END SearchWeaviateImage

// START BaseModelImageExample
import { z } from 'zod';

const AdvertsResponse = z.object({
    speech: z.string().describe("What to say during the presentation"),
    adverts: z.array(GeneratedImage)
        .min(2)
        .max(4) // max must be specified for lists of images
        .describe("A list of advertisements for each of the best selling products"),
});

const advertsResult = await qa.ask(
    "Find the best selling items in the store and then create a series of adverts for them.",
    {
        collections: [{
            name: "ECommerce",
            targetVector: ["name_description_brand_vector"],
        }],
        outputFormat: AdvertsResponse,
    }
);
// END BaseModelImageExample

// START UnionImageExample
const UnionResponse = z.object({
    chart: GeneratedImage.nullable(), // same as z.union([GeneratedImage, z.null()])
});

const unionResult = await qa.ask(
    "Chart the temperature for the first four weeks of 2024. If no data exists, return null",
    { collections: ["Weather"], outputFormat: UnionResponse }
);

console.log(unionResult.finalAnswerParsed.chart === null);
// END UnionImageExample

// START ComplexBaseModelImageExample
const Slide = z.object({
    speech: z.string().describe("What to say during this particular slide"),
    slide: GeneratedImage.describe("A presentation slide detailing a single product"),
});

const PresentationResponse = z.object({
    highlights: z.string().describe("Overall things to highlight across the full presentation"),
    slides: z.array(Slide).min(2).max(4),
});

const presentationResult = await qa.ask(
    "Find the best selling items in the store and then create a presentation for them.",
    {
        collections: [{
            name: "ECommerce",
            targetVector: ["name_description_brand_vector"],
        }],
        outputFormat: PresentationResponse,
    }
);
// END ComplexBaseModelImageExample

// START AnnotateListImageExample
const AnnotatedImagesResponse = z.object({
    image_field: z.array(GeneratedImage.describe("<image guidance/style description here>")).max(4),
});
// END AnnotateListImageExample

// START CustomShapeImageExample
import { generatedImageWithOptions } from '@weaviate/agents';

const HatResponse = z.object({
    picture: generatedImageWithOptions({ shape: "portrait" }),
});

const hatResult = await qa.ask(
    "Generate a picture of someone wearing the most expensive hat",
    {
        collections: [{
            name: "ECommerce",
            targetVector: ["name_description_brand_vector"],
        }],
        outputFormat: HatResponse,
    }
);
// END CustomShapeImageExample

// START RawJSONSchemaImageExample
const res = await qa.ask(
    "Find the most expensive item in the store",
    {
        collections: [{
            name: "ECommerce",
            targetVector: ["name_description_brand_vector"],
        }],
        outputFormat: {
            type: "object",
            properties: {
                answer: { type: "string" },
                image: {
                    "X-query-agent-image": true,
                    "X-image-shape": "square",
                    description: "A product photo on a white background",
                    type: "object",
                    properties: {
                        image_prompt: { "type": "string" }
                    }
                },
            }
        }
    }
);
// END RawJSONSchemaImageExample

if (await client.collections.exists("QueryAgentImageUpload")) {
    await client.collections.delete("QueryAgentImageUpload");
}

await client.close();
