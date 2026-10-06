import sys
sys.path.insert(0, "docs/query-agent/_includes/code")
from util import load_client_internally

client = load_client_internally()

# START BasicImageExample
from weaviate.agents.query import QueryAgent
from weaviate.agents.classes import GeneratedImage

qa = QueryAgent(
    client=client, # your Weaviate cloud client
)
response = qa.ask(
    "Chart the temperature for the first four weeks of 2023",
    collections=["Weather"],
    output_format=GeneratedImage
)

response.final_answer_parsed.base64 # base64 of the image
response.final_answer_parsed.image_prompt # prompt used to generate image based on data
# END BasicImageExample

# START ReadImageBase64
from base64 import b64decode
image_bytes = b64decode(response.final_answer_parsed.base64) # PNG
# END ReadImageBase64

# START DisplayImage
from PIL import Image
from io import BytesIO
image = Image.open(BytesIO(image_bytes))
image.show()
# END DisplayImage

# START SaveImage
with open("image.png", "wb") as f:
    f.write(image_bytes)
# END SaveImage

# START UploadWeaviateImage
from weaviate.classes.config import Configure, Property, DataType, Multi2VecField

collection = client.collections.create(
    "QueryAgentImageUpload",
    vector_config=Configure.Vectors.multi2vec_jinaai(
        name="image_vector",
        image_fields=[Multi2VecField(name="image")],
    ),
    properties=[
        Property(name="image", data_type=DataType.BLOB),
    ]
)

collection.data.insert(
    properties={
        "image": response.final_answer_parsed.base64,
    }
)
# END UploadWeaviateImage

# START SearchWeaviateImage
search_response = collection.query.near_image(
    near_image=response.final_answer_parsed.base64,
    return_properties=["image"]
)
# END SearchWeaviateImage 


# START BaseModelImageExample
from pydantic import BaseModel, Field

class AdvertsResponse(BaseModel):
    speech: str = Field(description="What to say during the presentation")
    adverts: list[GeneratedImage] = Field(
        description="A list of advertisements for each of the best selling products",
        min_length = 2,
        max_length = 4 # max_length must be specified for lists of images
    )
    
response = qa.ask(
    "Find the best selling items in the store and then create a series of adverts for them.",
    collections=["ECommerce"],
    output_format=AdvertsResponse,
)
# END BaseModelImageExample

# START UnionImageExample
class UnionResponse(BaseModel):
    chart: GeneratedImage | None # Union[GeneratedImage, None] for Python < 3.10

response = qa.ask(
    "Chart the temperature for the first four weeks of 2024. If no data exists, return null",
    collections=["Weather"],
    output_format=UnionResponse
)

print(response.final_answer_parsed.chart is None)
# END UnionImageExample

# START ComplexBaseModelImageExample
class Slide(BaseModel):
    speech: str = Field(description = "What to say during this particular slide")
    slide: GeneratedImage = Field(
        description = "A presentation slide detailing a single product"
    )

class PresentationResponse(BaseModel):
    highlights: str = Field(description="Overall things to highlight across the full presentation")
    slides: list[Slide] = Field(
        min_length=2, max_length=4
    )

response = qa.ask(
    "Find the best selling items in the store and then create a presentation for them.",
    collections=["ECommerce"],
    output_format=PresentationResponse,
)
# END ComplexBaseModelImageExample

# START AnnotateListImageExample
from typing import Annotated

class AnnotatedImagesResponse(BaseModel):
    image_field: list[Annotated[GeneratedImage, Field(description="<image guidance/style description here>")]] = Field(
        max_length = 4 # max_length must be specified for lists of images
    )
# END AnnotateListImageExample

# START CustomShapeImageExample
from typing import Annotated
from weaviate.agents.classes import GeneratedImageOptions

response = qa.ask(
    "Generate a picture of someone wearing the most expensive hat",
    collections=["ECommerce"],
    output_format=Annotated[GeneratedImage, GeneratedImageOptions(shape="portrait")],
)
# END CustomShapeImageExample

# START RawJSONSchemaImageExample
response = qa.ask(
    "Find the most expensive item in the store",
    collections=["ECommerce"],
    output_format={
        "type": "object",
        "properties": {
            "answer": { "type": "string" },
            "image": {
                "X-query-agent-image": True,
                "X-image-shape": "square",
                "description": "A product photo on a white background",
                "type": "object",
                "properties": {
                    "image_prompt": { "type": "string" }
                }
            }
        }
    }
),
# END RawJSONSchemaImageExample

if client.collections.exists("QueryAgentImageUpload"):
    client.collections.delete("QueryAgentImageUpload")
    
client.close()
