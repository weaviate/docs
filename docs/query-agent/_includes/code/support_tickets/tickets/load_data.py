"""Load the bundled, fictional support tickets into a dedicated collection."""

import json
import os
from pathlib import Path

import weaviate
from dotenv import load_dotenv
from weaviate.classes.config import Configure, DataType, Property, Tokenization
from weaviate.classes.init import Auth
from weaviate.classes.query import Filter
from weaviate.util import generate_uuid5

from tickets.models import COLLECTION

OWNER = "Reflex support tutorial sample."


def sample_rows() -> list[dict]:
    """Read the fixture shipped with this example, without external downloads."""
    return json.loads(Path(__file__).with_name("sample_tickets.json").read_text())


def import_rows(collection, rows: list[dict]) -> int:
    """Insert missing ticket IDs; reruns never overwrite or duplicate records."""
    keyed = {
        str(generate_uuid5(row["ticket_id"], namespace=COLLECTION)): row for row in rows
    }
    if not keyed:
        return 0
    existing = collection.query.fetch_objects(
        filters=Filter.by_id().contains_any(list(keyed)),
        limit=len(keyed),
        return_properties=[],
    )
    present = {str(obj.uuid) for obj in existing.objects}
    pending = {uid: row for uid, row in keyed.items() if uid not in present}
    with collection.batch.dynamic() as batch:
        for uid, row in pending.items():
            batch.add_object(uuid=uid, properties=row)
    if collection.batch.failed_objects:
        raise RuntimeError(
            f"{len(collection.batch.failed_objects)} tickets failed to import. "
            "Check Cloud embedding configuration and usage limits, then rerun."
        )
    return len(pending)


def load_tickets():
    """Create one tutorial collection and import the bundled tickets."""
    load_dotenv()
    with weaviate.connect_to_weaviate_cloud(
        cluster_url=os.environ["WEAVIATE_URL"],
        auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
    ) as client:
        # START Schema
        if not client.collections.exists(COLLECTION):
            client.collections.create(
                COLLECTION,
                description=f"{OWNER} Fictional support tickets. Each record is one ticket. Status is Open, In progress, or Resolved. An empty workaround means none is documented.",
                vector_config=Configure.Vectors.text2vec_weaviate(),
                properties=[
                    Property(
                        name="ticket_id",
                        data_type=DataType.TEXT,
                        tokenization=Tokenization.FIELD,
                        skip_vectorization=True,
                    ),
                    Property(name="title", data_type=DataType.TEXT),
                    Property(name="description", data_type=DataType.TEXT),
                    Property(name="workaround", data_type=DataType.TEXT),
                    Property(
                        name="status",
                        data_type=DataType.TEXT,
                        tokenization=Tokenization.FIELD,
                        skip_vectorization=True,
                    ),
                    Property(
                        name="priority",
                        data_type=DataType.TEXT,
                        tokenization=Tokenization.FIELD,
                        skip_vectorization=True,
                    ),
                    Property(
                        name="product",
                        data_type=DataType.TEXT,
                        tokenization=Tokenization.FIELD,
                    ),
                ],
            )
        # END Schema
        collection = client.collections.use(COLLECTION)
        if not (collection.config.get().description or "").startswith(OWNER):
            raise RuntimeError(f"{COLLECTION} exists and is not a tutorial collection.")
        inserted = import_rows(collection, sample_rows())
        print(f"Tickets inserted: {inserted}")
        print(f"{COLLECTION}: total {len(collection)}")


if __name__ == "__main__":
    load_tickets()
