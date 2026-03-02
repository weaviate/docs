# How-to: Configure -> Backups - Python examples

# ================================
# ===== INSTANTIATION-COMMON =====
# ================================

import weaviate
from weaviate.auth import AuthApiKey

# START CreateBackup  # START RestoreBackup  # START StatusCreateBackup  # START StatusRestoreBackup  # START CancelBackup  # START CancelRestore
from weaviate.classes.backup import BackupLocation

# END CreateBackup  # END RestoreBackup  # END StatusCreateBackup  # END StatusRestoreBackup  # END CancelBackup  # END CancelRestore

client = weaviate.connect_to_local(
    port=8580,
    grpc_port=50551,
    auth_credentials=AuthApiKey(api_key="root-user-key"),
)

# ==============================================
# ===== Create, restore, and check backup =====
# ==============================================

# Create the collections, whether they exist or not
client.collections.delete(["Article", "Publication"])
articles = client.collections.create(name="Article")
publications = client.collections.create(name="Publication")

articles.data.insert(properties={"title": "Dummy"})
publications.data.insert(properties={"title": "Dummy"})

# Add a user to be backed up
# Clean up user if it exists from a previous failed run
client.users.db.delete(user_id="test-user-for-backup")
client.users.db.create(user_id="test-user-for-backup")


# START CreateBackup
result = client.backup.create(
    backup_id="my-very-first-backup",
    backend="filesystem",
    include_collections=["Article", "Publication"],
    wait_for_completion=True,
    backup_location=BackupLocation.FileSystem(path="/tmp/weaviate-backups"),  # Optional, requires Weaviate 1.27.2 / 1.28.0 or above and Python client 4.10.3 or above
)

print(result)
# END CreateBackup

# Test
assert result.status == "SUCCESS"

# Delete the user after creating the backup to test restoration
client.users.db.delete(user_id="test-user-for-backup")
assert not any(user.user_id == "test-user-for-backup" for user in client.users.db.list_all())


# START StatusCreateBackup
result = client.backup.get_create_status(
    backup_id="my-very-first-backup",
    backend="filesystem",
    backup_location=BackupLocation.FileSystem(path="/tmp/weaviate-backups"),  # Required if a non-default location was used at creation
)

print(result)
# END StatusCreateBackup

# Test
assert result.status == "SUCCESS"

# Delete all classes before restoring to ensure a clean slate
client.collections.delete_all()

# START RestoreBackup
result = client.backup.restore(
    backup_id="my-very-first-backup",
    backend="filesystem",
    exclude_collections="Article",
    wait_for_completion=True,
    roles_restore="all",
    users_restore="all",
    backup_location=BackupLocation.FileSystem(path="/tmp/weaviate-backups"),  # Required if a non-default location was used at creation
)

print(result)
# END RestoreBackup

# Test
assert result.status == "SUCCESS"

# Verify that the user was restored
assert any(user.user_id == "test-user-for-backup" for user in client.users.db.list_all())


# START StatusRestoreBackup
result = client.backup.get_restore_status(
    backup_id="my-very-first-backup",
    backend="filesystem",
    backup_location=BackupLocation.FileSystem(path="/tmp/weaviate-backups"),  # Required if a non-default location was used at creation
)

print(result)
# END StatusRestoreBackup

# Test
assert result.status == "SUCCESS"

# Clean up
client.collections.delete(["Article", "Publication"])


# ==============================================
# ===== Cancel ongoing backup =====
# ==============================================

# Note - this will fail in automated tests as the backup is already completed

# Create the collections, whether they exist or not
client.collections.delete(["Article", "Publication"])
articles = client.collections.create(name="Article")
publications = client.collections.create(name="Publication")

articles.data.insert(properties={"title": "Dummy"})
publications.data.insert(properties={"title": "Dummy"})

# Start a backup to cancel
result = client.backup.create(
    backup_id="some-unwanted-backup",
    backend="filesystem",
    include_collections=["Article", "Publication"],
    wait_for_completion=False,
    backup_location=BackupLocation.FileSystem(path="/tmp/weaviate-backups"),  # Optional
)

print(result)

# START CancelBackup
result = client.backup.cancel(
    backup_id="some-unwanted-backup",
    backend="filesystem",
    backup_location=BackupLocation.FileSystem(path="/tmp/weaviate-backups"),  # Required if a non-default location was used at creation
)

print(result)
# END CancelBackup


# ==============================================
# ===== Cancel ongoing restore =====
# ==============================================

# START CancelRestore
result = client.backup.cancel(
    backup_id="my-very-first-backup",
    backend="filesystem",
    backup_location=BackupLocation.FileSystem(path="/tmp/weaviate-backups"),  # Required if a non-default location was used at creation
    operation="restore",
)

print(result)
# END CancelRestore

client.close()
