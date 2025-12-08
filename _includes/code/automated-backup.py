import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.data import GeoCoordinate
import json
import os
from datetime import datetime

# Custom JSON encoder to handle datetime and Weaviate-specific objects
class WeaviateEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, GeoCoordinate):
            return {
                "latitude": obj.latitude,
                "longitude": obj.longitude
            }
        # Handle any other non-serializable objects by converting to string
        try:
            return super().default(obj)
        except TypeError:
            return str(obj)

# Configuration
wcd_url = os.environ["WEAVIATE_URL"]
wcd_api_key = os.environ["WEAVIATE_API_KEY"]
BASE_DIR = "/Users/ivandespot/dev/docs/tests/backups"
BACKUP_DIR = os.path.join(BASE_DIR, f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}")

# Create backup directory
os.makedirs(BACKUP_DIR, exist_ok=True)

# Connect to Weaviate Cloud
client = weaviate.connect_to_weaviate_cloud(
    cluster_url=wcd_url, auth_credentials=Auth.api_key(wcd_api_key)
)

try:
    # Get all collections
    collections = client.collections.list_all()
    print(f"Found {len(collections)} collections to back up")

    backup_metadata = {
        "timestamp": datetime.now().isoformat(),
        "cluster_url": wcd_url,
        "collections": [],
    }

    # Back up each collection
    for collection_name in collections:
        print(f"\nBacking up collection: {collection_name}")
        collection = client.collections.get(collection_name)

        # Get collection config (schema)
        config = collection.config.get()
        config_dict = {
            "name": collection_name,
            "description": config.description,
            "properties": [
                {
                    "name": prop.name,
                    "data_type": prop.data_type.value,
                    "description": prop.description,
                }
                for prop in config.properties
            ],
            "vectorizer_config": str(config.vectorizer_config),
            "vector_index_config": str(config.vector_index_config),
            "generative_config": (
                str(config.generative_config) if config.generative_config else None
            ),
            "replication_config": (
                str(config.replication_config) if config.replication_config else None
            ),
            "multi_tenancy_config": (
                str(config.multi_tenancy_config)
                if config.multi_tenancy_config
                else None
            ),
        }

        # Check if multi-tenancy is enabled
        is_multi_tenant = config.multi_tenancy_config and config.multi_tenancy_config.enabled
        
        # Save collection config
        config_file = os.path.join(BACKUP_DIR, f"{collection_name}_config.json")
        with open(config_file, "w") as f:
            json.dump(config_dict, f, indent=2, cls=WeaviateEncoder)

        collection_metadata = {
            "name": collection_name,
            "config_file": f"{collection_name}_config.json",
            "is_multi_tenant": is_multi_tenant,
            "tenants": []
        }

        if is_multi_tenant:
            # Get all tenants (returns list of tenant names as strings)
            tenants = collection.tenants.get()
            print(f"  Found {len(tenants)} tenants")
            
            # Back up each tenant
            for tenant_name in tenants:
                print(f"  Backing up tenant: {tenant_name}")
                
                # Get tenant-specific collection
                tenant_collection = collection.with_tenant(tenant_name)
                
                # Export tenant objects
                objects = []
                object_count = 0
                
                try:
                    for item in tenant_collection.iterator(include_vector=True):
                        obj = {
                            "uuid": str(item.uuid),
                            "properties": item.properties,
                            "vector": item.vector,
                        }
                        objects.append(obj)
                        object_count += 1
                        
                        if object_count % 1000 == 0:
                            print(f"    Exported {object_count} objects...")
                    
                    # Save tenant objects
                    objects_file = os.path.join(BACKUP_DIR, f"{collection_name}_{tenant_name}_objects.json")
                    with open(objects_file, "w") as f:
                        json.dump(objects, f, indent=2, cls=WeaviateEncoder)
                    
                    print(f"    ✓ Backed up {object_count} objects for tenant {tenant_name}")
                    
                    collection_metadata["tenants"].append({
                        "tenant_name": tenant_name,
                        "object_count": object_count,
                        "objects_file": f"{collection_name}_{tenant_name}_objects.json"
                    })
                except Exception as e:
                    print(f"    ⚠ Warning: Could not back up tenant {tenant_name}: {e}")
                    collection_metadata["tenants"].append({
                        "tenant_name": tenant_name,
                        "object_count": 0,
                        "error": str(e)
                    })
        else:
            # Non-multi-tenant collection - backup normally
            objects = []
            object_count = 0

            for item in collection.iterator(include_vector=True):
                obj = {
                    "uuid": str(item.uuid),
                    "properties": item.properties,
                    "vector": item.vector,
                }
                objects.append(obj)
                object_count += 1

                if object_count % 1000 == 0:
                    print(f"  Exported {object_count} objects...")

            # Save objects
            objects_file = os.path.join(BACKUP_DIR, f"{collection_name}_objects.json")
            with open(objects_file, "w") as f:
                json.dump(objects, f, indent=2, cls=WeaviateEncoder)

            print(f"  ✓ Backed up {object_count} objects")
            
            collection_metadata["object_count"] = object_count
            collection_metadata["objects_file"] = f"{collection_name}_objects.json"

        backup_metadata["collections"].append(collection_metadata)

    # Save backup metadata
    metadata_file = os.path.join(BACKUP_DIR, "backup_metadata.json")
    with open(metadata_file, "w") as f:
        json.dump(backup_metadata, f, indent=2, cls=WeaviateEncoder)

    print(f"\n✓ Backup completed successfully!")
    print(f"Backup location: {BACKUP_DIR}")

finally:
    client.close()