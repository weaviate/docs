import 'dotenv/config'
const { loadClientInternally } = await import('./util.mjs').catch(() => import('../docs/query-agent/_includes/code/util.mjs'));

const client = await loadClientInternally();

// START BasicImageExample
import { QueryAgent, QAImage } from 'weaviate-agents';

const qa = new QueryAgent(client); // your Weaviate Cloud client
const response = await qa.ask(
    "Chart the temperature for the first four weeks of 2023",
    { collections: ["Weather"], outputFormat: QAImage }
);

response.finalAnswerParsed.base64; // base64 of the image
response.finalAnswerParsed.image_prompt; // prompt used to generate image based on data
// END BasicImageExample

// START ReadImageBase64
const imageBytes = Buffer.from(response.finalAnswerParsed.base64, "base64"); // PNG
// END ReadImageBase64

// START DisplayImage
import { writeFileSync } from 'node:fs';

writeFileSync("image.png", imageBytes);
// END DisplayImage

// START BaseModelImageExample
import { z } from 'zod';

const AdvertsResponse = z.object({
    speech: z.string().describe("What to say during the presentation"),
    adverts: z.array(QAImage)
        .min(2)
        .max(4) // max must be specified for lists of images
        .describe("A list of advertisements for each of the best selling products"),
});

const advertsResult = await qa.ask(
    "Find the best selling items in the store and then create a series of adverts for them.",
    { collections: ["ECommerce"], outputFormat: AdvertsResponse }
);
// END BaseModelImageExample

// START UnionImageExample
const UnionResponse = z.object({
    chart: QAImage.nullable(), // same as z.union([QAImage, z.null()])
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
    slide: QAImage.describe("A presentation slide detailing a single product"),
});

const PresentationResponse = z.object({
    highlights: z.string().describe("Overall things to highlight across the full presentation"),
    slides: z.array(Slide).min(2).max(4),
});

const presentationResult = await qa.ask(
    "Find the best selling items in the store and then create a presentation for them.",
    { collections: ["ECommerce"], outputFormat: PresentationResponse }
);
// END ComplexBaseModelImageExample

// START AnnotateListImageExample
const AnnotatedImagesResponse = z.object({
    image_field: z.array(QAImage.describe("<image guidance/style description here>")).max(4),
});
// END AnnotateListImageExample

// START CustomShapeImageExample
import { imageWithOptions } from 'weaviate-agents';

const advertResult = await qa.ask(
    "Generate a picture of someone wearing the most expensive hat",
    { collections: ["ECommerce"], outputFormat: imageWithOptions({ shape: "portrait" }) }
);
// END CustomShapeImageExample

// START RawJSONSchemaImageExample
const res = await qa.ask(
    "Find the most expensive item in the store",
    {
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

await client.close();
