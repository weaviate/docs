# START CreateExport
import weaviate
from weaviate.classes.export import ExportStorage, ExportFileFormat

client = weaviate.connect_to_local()

# Create an export of specific collections to the filesystem
result = client.export.create(
    export_id="my-export-2024",
    backend=ExportStorage.FILESYSTEM,
    file_format=ExportFileFormat.PARQUET,
    include_collections=["Articles", "Products"],
    wait_for_completion=True,
)

print(result.status)  # ExportStatus.SUCCESS
print(result.collections)  # ['Articles', 'Products']
# END CreateExport

# START CreateExportExclude
# Export all collections except the ones listed
result = client.export.create(
    export_id="my-export-all-except",
    backend=ExportStorage.FILESYSTEM,
    file_format=ExportFileFormat.PARQUET,
    exclude_collections=["TempData"],
    wait_for_completion=True,
)
# END CreateExportExclude

# START CreateExportAsync
# Start an export without waiting
result = client.export.create(
    export_id="my-async-export",
    backend=ExportStorage.FILESYSTEM,
    file_format=ExportFileFormat.PARQUET,
    include_collections=["Articles"],
)

print(result.status)  # ExportStatus.STARTED or ExportStatus.TRANSFERRING
# END CreateExportAsync

# START GetExportStatus
status = client.export.get_status(
    export_id="my-async-export",
    backend=ExportStorage.FILESYSTEM,
)

print(status.status)        # e.g. ExportStatus.TRANSFERRING
print(status.collections)   # ['Articles']
print(status.shard_status)  # Per-shard progress details
# END GetExportStatus

# START CancelExport
client.export.cancel(
    export_id="my-async-export",
    backend=ExportStorage.FILESYSTEM,
)
# END CancelExport

client.close()
