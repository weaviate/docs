import weaviate
from weaviate.classes.config import Configure, Property, DataType

# Connect to local Weaviate instance
client = weaviate.connect_to_local()

client.collections.delete("CollectionWithTTL")

# START TTLByCreationTime
from weaviate.classes.config import Configure, Property, DataType
import datetime

client.collections.create(
    name="CollectionWithTTL",
    properties=[
        Property(name="ReferenceDate", data_type=DataType.DATE),
    ],
    object_ttl_config=Configure.ObjectTTL.delete_by_creation_time(
        time_to_live=datetime.timedelta(hours=1),  # Or set "3600" for seconds
        filter_expired_objects=True,  # Optional: automatically filter out expired objects from queries
    ),
)
# END TTLByCreationTime

client.collections.delete("CollectionWithTTL")

# START TTLByUpdateTime
from weaviate.classes.config import Configure, Property, DataType
import datetime

client.collections.create(
    name="CollectionWithTTL",
    properties=[
        Property(name="ReferenceDate", data_type=DataType.DATE),
    ],
    object_ttl_config=Configure.ObjectTTL.delete_by_update_time(
        time_to_live=datetime.timedelta(days=10)  # Or set "864000" for seconds
        filter_expired_objects=True,  # Optional: automatically filter out expired objects from queries
    ),
)
# END TTLByUpdateTime

client.collections.delete("CollectionWithTTL")

# START TTLByDateProperty
from weaviate.classes.config import Configure
import datetime

client.collections.create(
    name="CollectionWithTTL",
    properties=[
        Property(name="ReferenceDate", data_type=DataType.DATE),
    ],
    object_ttl_config=Configure.ObjectTTL.delete_by_date_property(
        property_name="ReferenceDate",
        ttl_offset=datetime.timedelta(minutes=5)
    ),
)
# END TTLByDateProperty


client.close()
