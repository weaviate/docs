import weaviate
from weaviate.classes.config import Configure, Property, DataType
import datetime
import time

# Requires OBJECTS_TTL_DELETE_SCHEDULE set to a frequent interval (e.g. "*/10 * * * * *")
# and OBJECTS_TTL_ALLOW_SECONDS=true on the Weaviate instance.

def wait_for_count(collection, expected_count, timeout=70, poll_interval=5):
    """Poll until the collection reaches the expected object count or timeout."""
    start = time.time()
    while time.time() - start < timeout:
        result = collection.aggregate.over_all(total_count=True)
        if result.total_count == expected_count:
            return result.total_count
        time.sleep(poll_interval)
    result = collection.aggregate.over_all(total_count=True)
    return result.total_count

# Connect to local Weaviate instance
client = weaviate.connect_to_local()

client.collections.delete("CollectionWithTTL")

# START TTLByCreationTime
from weaviate.classes.config import Configure, Property, DataType
import datetime

client.collections.create(
    name="CollectionWithTTL",
    properties=[
        Property(name="referenceDate", data_type=DataType.DATE),
    ],
    object_ttl_config=Configure.ObjectTTL.delete_by_creation_time(
        time_to_live=datetime.timedelta(hours=1),  # Or set 3600 for seconds
        filter_expired_objects=True,  # Optional: automatically filter out expired objects from queries
    ),
)
# END TTLByCreationTime

# Verify creation time TTL config
collection = client.collections.get("CollectionWithTTL")
config = collection.config.get()
assert config.object_ttl_config is not None, "TTL config should not be None"
assert config.object_ttl_config.enabled == True, "TTL should be enabled"
assert config.object_ttl_config.delete_on == "creationTime", f"Expected creationTime, got {config.object_ttl_config.delete_on}"
assert config.object_ttl_config.time_to_live == datetime.timedelta(hours=1), f"Expected 1 hour, got {config.object_ttl_config.time_to_live}"
assert config.object_ttl_config.filter_expired_objects == True, "filter_expired_objects should be True"

# Add an object and verify it exists
collection.data.insert(properties={"referenceDate": datetime.datetime.now(datetime.timezone.utc).isoformat()})
result = collection.aggregate.over_all(total_count=True)
assert result.total_count == 1, f"Expected 1 object, got {result.total_count}"

# Verify deletion: recreate with minimum TTL (60s), insert, and wait for expiry
client.collections.delete("CollectionWithTTL")
client.collections.create(
    name="CollectionWithTTL",
    properties=[Property(name="referenceDate", data_type=DataType.DATE)],
    object_ttl_config=Configure.ObjectTTL.delete_by_creation_time(
        time_to_live=datetime.timedelta(seconds=60),
        #filter_expired_objects=True,
    ),
)
collection = client.collections.get("CollectionWithTTL")
collection.data.insert(properties={"referenceDate": datetime.datetime.now(datetime.timezone.utc).isoformat()})
assert collection.aggregate.over_all(total_count=True).total_count == 1
count = wait_for_count(collection, expected_count=0, timeout=70)
assert count == 0, f"Expected 0 objects after creation time TTL, got {count}"

client.collections.delete("CollectionWithTTL")

# START TTLByUpdateTime
from weaviate.classes.config import Configure, Property, DataType
import datetime

client.collections.create(
    name="CollectionWithTTL",
    properties=[
        Property(name="referenceDate", data_type=DataType.DATE),
    ],
    object_ttl_config=Configure.ObjectTTL.delete_by_update_time(
        time_to_live=datetime.timedelta(days=10),  # Or set 864000 for seconds
        filter_expired_objects=True,  # Optional: automatically filter out expired objects from queries
    ),
)
# END TTLByUpdateTime

# Verify update time TTL config
collection = client.collections.get("CollectionWithTTL")
config = collection.config.get()
assert config.object_ttl_config is not None, "TTL config should not be None"
assert config.object_ttl_config.enabled == True, "TTL should be enabled"
assert config.object_ttl_config.delete_on == "updateTime", f"Expected updateTime, got {config.object_ttl_config.delete_on}"
assert config.object_ttl_config.time_to_live == datetime.timedelta(days=10), f"Expected 10 days, got {config.object_ttl_config.time_to_live}"
assert config.object_ttl_config.filter_expired_objects == True, "filter_expired_objects should be True"

# Add an object and verify it exists
collection.data.insert(properties={"referenceDate": datetime.datetime.now(datetime.timezone.utc).isoformat()})
result = collection.aggregate.over_all(total_count=True)
assert result.total_count == 1, f"Expected 1 object, got {result.total_count}"

# Verify deletion: recreate with minimum TTL (60s), insert, and wait for expiry
client.collections.delete("CollectionWithTTL")
client.collections.create(
    name="CollectionWithTTL",
    properties=[Property(name="referenceDate", data_type=DataType.DATE)],
    object_ttl_config=Configure.ObjectTTL.delete_by_update_time(
        time_to_live=60,
        filter_expired_objects=True,
    ),
)
collection = client.collections.get("CollectionWithTTL")
collection.data.insert(properties={"referenceDate": datetime.datetime.now(datetime.timezone.utc).isoformat()})
assert collection.aggregate.over_all(total_count=True).total_count == 1
count = wait_for_count(collection, expected_count=0, timeout=70)
assert count == 0, f"Expected 0 objects after update time TTL, got {count}"

client.collections.delete("CollectionWithTTL")

# START TTLByDateProperty
from weaviate.classes.config import Configure, Property, DataType
import datetime

client.collections.create(
    name="CollectionWithTTL",
    properties=[
        Property(name="referenceDate", data_type=DataType.DATE),
    ],
    object_ttl_config=Configure.ObjectTTL.delete_by_date_property(
        property_name="referenceDate",
        ttl_offset=datetime.timedelta(minutes=5),
    ),
)
# END TTLByDateProperty

# Verify date property TTL config
collection = client.collections.get("CollectionWithTTL")
config = collection.config.get()
assert config.object_ttl_config is not None, "TTL config should not be None"
assert config.object_ttl_config.enabled == True, "TTL should be enabled"
assert config.object_ttl_config.delete_on == "referenceDate", f"Expected referenceDate, got {config.object_ttl_config.delete_on}"
assert config.object_ttl_config.time_to_live == datetime.timedelta(minutes=5), f"Expected 5 minutes, got {config.object_ttl_config.time_to_live}"

# Add an object with a future date and verify it exists
future_date = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)).isoformat()
collection.data.insert(properties={"referenceDate": future_date})
result = collection.aggregate.over_all(total_count=True)
assert result.total_count == 1, f"Expected 1 object, got {result.total_count}"

# Verify deletion: recreate with ttl_offset=0, insert object expiring in 60s, and wait
client.collections.delete("CollectionWithTTL")
client.collections.create(
    name="CollectionWithTTL",
    properties=[Property(name="expiresAt", data_type=DataType.DATE)],
    object_ttl_config=Configure.ObjectTTL.delete_by_date_property(
        property_name="expiresAt",
        ttl_offset=datetime.timedelta(seconds=0),
        filter_expired_objects=True,
    ),
)
collection = client.collections.get("CollectionWithTTL")
expires = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=60)).isoformat()
collection.data.insert(properties={"expiresAt": expires})
assert collection.aggregate.over_all(total_count=True).total_count == 1
count = wait_for_count(collection, expected_count=0, timeout=70)
assert count == 0, f"Expected 0 objects after date property TTL, got {count}"

# Clean up
client.collections.delete("CollectionWithTTL")

client.close()
