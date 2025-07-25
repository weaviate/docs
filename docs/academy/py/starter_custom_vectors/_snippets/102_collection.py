# CreateMovieCollection
import weaviate
import os

# CreateMovieCollection  # SubmoduleImport
import weaviate.classes.config as wc

# CreateMovieCollection  # END SubmoduleImport

# END CreateMovieCollection
from weaviate.classes.init import Auth

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.getenv("WEAVIATE_URL"),  # Replace with your WCD URL
    auth_credentials=Auth.api_key(
        os.getenv("WEAVIATE_API_KEY")
    ),  # Replace with your WCD key
)

# CreateMovieCollection
# Instantiate your client (not shown). e.g.:
# client = weaviate.connect_to_weaviate_cloud(..., headers=headers) or
# client = weaviate.connect_to_local(..., headers=headers)

# END CreateMovieCollection

# Actual instantiation

client.collections.delete("MovieCustomVector")

# CreateMovieCollection
client.collections.create(
    name="MovieCustomVector",
    properties=[
        wc.Property(name="title", data_type=wc.DataType.TEXT),
        wc.Property(name="overview", data_type=wc.DataType.TEXT),
        wc.Property(name="vote_average", data_type=wc.DataType.NUMBER),
        wc.Property(name="genre_ids", data_type=wc.DataType.INT_ARRAY),
        wc.Property(name="release_date", data_type=wc.DataType.DATE),
        wc.Property(name="tmdb_id", data_type=wc.DataType.INT),
    ],
    # Define the vectorizer module (none, as we will add our own vectors)
    vector_config=wc.Configure.Vectors.self_provided(),
    # Define the generative module
    generative_config=wc.Configure.Generative.cohere()
    # END generativeDefinition  # CreateMovieCollection
)

client.close()
# END CreateMovieCollection


# See https://docs.cohere.com/reference/embed for further explanations
# ManuallyGenerateEmbeddings
import requests
import pandas as pd
import os
from typing import List
import cohere
from cohere import Client as CohereClient

co_token = os.getenv("COHERE_APIKEY")
co = cohere.Client(co_token)


# Define a function to call the endpoint and obtain embeddings
def vectorize(cohere_client: CohereClient, texts: List[str]) -> List[List[float]]:

    response = cohere_client.embed(
        texts=texts, model="embed-multilingual-v3.0", input_type="search_document"
    )

    return response.embeddings


# Get the source data
data_url = "https://raw.githubusercontent.com/weaviate-tutorials/edu-datasets/main/movies_data_1990_2024.json"
resp = requests.get(data_url)
df = pd.DataFrame(resp.json())

# Loop through the dataset to generate vectors in batches
emb_dfs = list()
src_texts = list()
for i, row in enumerate(df.itertuples(index=False)):
    # Concatenate text to create a source string
    src_text = "Title" + row.title + "; Overview: " + row.overview
    # Add to the buffer
    src_texts.append(src_text)
    if (len(src_texts) == 50) or (i + 1 == len(df)):  # Get embeddings in batches of 50
        # Get a batch of embeddings
        output = vectorize(co, src_texts)
        index = list(range(i - len(src_texts) + 1, i + 1))
        emb_df = pd.DataFrame(output, index=index)
        # Add the batch of embeddings to a list
        emb_dfs.append(emb_df)
        # Reset the buffer
        src_texts = list()


emb_df = pd.concat(emb_dfs)  # Create a combined dataset

# Save the data as a CSV
os.makedirs("scratch", exist_ok=True)  # Create a folder if it doesn't exist
emb_df.to_csv(
    f"scratch/movies_data_1990_2024_embeddings.csv",
    index=False,
)
# END ManuallyGenerateEmbeddings

assert len(emb_df) == len(df)
assert type(output[0]) == list


# BatchImportData
import weaviate
import pandas as pd
import requests
from datetime import datetime, timezone
import json
from weaviate.util import generate_uuid5
from tqdm import tqdm
import os

# END BatchImportData
headers = {"X-Cohere-Api-Key": os.getenv("COHERE_APIKEY")}

from weaviate.classes.init import Auth

client = weaviate.connect_to_weaviate_cloud(
    cluster_url=os.getenv("WEAVIATE_URL"),  # Replace with your WCD URL
    auth_credentials=Auth.api_key(
        os.getenv("WEAVIATE_API_KEY")
    ),  # Replace with your WCD key
    headers=headers,
)

# BatchImportData
# Instantiate your client (not shown). e.g.:
# client = weaviate.connect_to_weaviate_cloud(...) or
# client = weaviate.connect_to_local(...)

# END BatchImportData

# BatchImportData
data_url = "https://raw.githubusercontent.com/weaviate-tutorials/edu-datasets/main/movies_data_1990_2024.json"
data_resp = requests.get(data_url)
df = pd.DataFrame(data_resp.json())

# Load the embeddings (embeddings from the previous step)
embs_path = "https://raw.githubusercontent.com/weaviate-tutorials/edu-datasets/main/movies_data_1990_2024_embeddings.csv"
# Or load embeddings from a local file (if you generated them earlier)
# embs_path = "scratch/movies_data_1990_2024_embeddings.csv"

emb_df = pd.read_csv(embs_path)

# Get the collection
movies = client.collections.get("MovieCustomVector")

# Enter context manager
with movies.batch.fixed_size(batch_size=200) as batch:
    # Loop through the data
    for i, movie in enumerate(df.itertuples(index=False)):
        # Convert data types
        # Convert a JSON date to `datetime` and add time zone information
        release_date = datetime.strptime(movie.release_date, "%Y-%m-%d").replace(
            tzinfo=timezone.utc
        )
        # Convert a JSON array to a list of integers
        genre_ids = json.loads(movie.genre_ids)

        # Build the object payload
        movie_obj = {
            "title": movie.title,
            "overview": movie.overview,
            "vote_average": movie.vote_average,
            "genre_ids": genre_ids,
            "release_date": release_date,
            "tmdb_id": movie.id,
        }

        # Get the vector
        vector = emb_df.iloc[i].to_list()

        # Add object (including vector) to batch queue
        batch.add_object(
            properties=movie_obj,
            uuid=generate_uuid5(movie.id),
            vector=vector  # Add the custom vector
            # references=reference_obj  # You can add references here
        )
        # Batcher automatically sends batches

# Check for failed objects
if len(movies.batch.failed_objects) > 0:
    print(f"Failed to import {len(movies.batch.failed_objects)} objects")

client.close()
