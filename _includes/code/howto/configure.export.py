import weaviate
from weaviate.classes.config import Property, DataType
from weaviate.classes.export import ExportStorage, ExportFileFormat
from weaviate.export.export import ExportStatus
import uuid

client = weaviate.connect_to_local()

# Setup: create test collections
for name in ["Articles", "Products", "TempData"]:
    client.collections.delete(name)
    col = client.collections.create(name=name, properties=[Property(name="title", data_type=DataType.TEXT)])
    col.data.insert({"title": f"Test {name} object"})

# START CreateExport
# Export specific collections
result = client.export.create(
    export_id="my-export-include",
    backend=ExportStorage.FILESYSTEM,
    file_format=ExportFileFormat.PARQUET,
    include_collections=["Articles", "Products"],
    wait_for_completion=True,
)

print(result.status)       # ExportStatus.SUCCESS
print(result.collections)  # ['Articles', 'Products']

# Or exclude specific collections (exports everything else)
result = client.export.create(
    export_id="my-export-exclude",
    backend=ExportStorage.FILESYSTEM,
    file_format=ExportFileFormat.PARQUET,
    exclude_collections=["TempData"],
    wait_for_completion=True,
)
# END CreateExport

assert result.status == ExportStatus.SUCCESS
assert "TempData" not in result.collections
assert "Articles" in result.collections

# START CreateExportAsync
result = client.export.create(
    export_id="my-async-export-" + uuid.uuid4().hex[:8],
    backend=ExportStorage.FILESYSTEM,
    file_format=ExportFileFormat.PARQUET,
    include_collections=["Articles"],
)

print(result.status)  # ExportStatus.STARTED or ExportStatus.TRANSFERRING
# END CreateExportAsync

assert result.status in [ExportStatus.STARTED, ExportStatus.TRANSFERRING, ExportStatus.SUCCESS]
async_export_id = result.export_id

# START GetExportStatus
status = client.export.get_status(
    export_id=async_export_id,
    backend=ExportStorage.FILESYSTEM,
)

print(status.status)        # e.g. ExportStatus.TRANSFERRING
print(status.collections)   # ['Articles']
print(status.shard_status)  # Per-shard progress details
# END GetExportStatus

assert status.status in [ExportStatus.STARTED, ExportStatus.TRANSFERRING, ExportStatus.SUCCESS]
assert status.export_id == async_export_id

# Create a new export to test cancellation
cancel_id = "my-cancel-export-" + uuid.uuid4().hex[:8]
client.export.create(
    export_id=cancel_id,
    backend=ExportStorage.FILESYSTEM,
    file_format=ExportFileFormat.PARQUET,
    include_collections=["Articles"],
)

# START CancelExport
client.export.cancel(
    export_id=cancel_id,
    backend=ExportStorage.FILESYSTEM,
)
# END CancelExport

# Cleanup
for name in ["Articles", "Products", "TempData"]:
    client.collections.delete(name)

client.close()
