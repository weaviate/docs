import io.weaviate.client6.v1.api.Authentication;
import io.weaviate.client6.v1.api.WeaviateClient;
import io.weaviate.client6.v1.api.backup.Backup;
import io.weaviate.client6.v1.api.backup.BackupStatus;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class BackupsTest {

  private static WeaviateClient client;

  // TODO[g-despot] DX: Authentication.apiKey is not needed, why not string?
  @BeforeAll
  public static void beforeAll() {
    // Connect to the Weaviate instance specified in the Python script
    client = WeaviateClient.connectToLocal(config -> config.port(8580)
        .grpcPort(50551)
        .authentication(Authentication.apiKey("root-user-key")));
  }

  @AfterAll
  public static void afterAll() throws Exception {
    if (client != null) {
      client.close();
    }
  }

  // Helper method to set up collections for tests
  private void setupCollections() throws IOException {
    client.collections.delete("Article");
    client.collections.delete("Publication");
    var articles = client.collections.create("Article");
    var publications = client.collections.create("Publication");

    articles.data.insert(Map.of("title", "Dummy"));
    publications.data.insert(Map.of("title", "Dummy"));
  }

  @Test
  @Order(1)
  void testBackupAndRestoreLifecycle() throws IOException, TimeoutException {
    setupCollections();
    String backupId = "my-very-first-backup";
    String backend = "filesystem";

    // START CreateBackup
    var createResult = client.backup
        .create(backupId, backend,
            backup -> backup.includeCollections("Article", "Publication"))
        .waitForCompletion(client); // Replicates wait_for_completion=True

    System.out.println(createResult);
    // END CreateBackup

    assertThat(createResult.status()).isEqualTo(BackupStatus.SUCCESS);

    // START StatusCreateBackup
    Optional<Backup> createStatus =
        client.backup.getCreateStatus(backupId, backend);

    System.out.println(createStatus.orElse(null));
    // END StatusCreateBackup

    assertThat(createStatus).isPresent();
    assertThat(createStatus.get().status()).isEqualTo(BackupStatus.SUCCESS);

    // Delete all classes before restoring
    client.collections.deleteAll();
    assertThat(client.collections.exists("Article")).isFalse();
    assertThat(client.collections.exists("Publication")).isFalse();

    // START RestoreBackup
    var restoreResult = client.backup.restore(backupId, backend,
        restore -> restore.excludeCollections("Article")
    // Note: roles_restore and users_restore syntax not provided
    ).waitForCompletion(client); // Replicates wait_for_completion=True

    System.out.println(restoreResult);
    // END RestoreBackup

    assertThat(restoreResult.status()).isEqualTo(BackupStatus.SUCCESS);
    // Verify that Publication was restored and Article was excluded
    assertThat(client.collections.exists("Publication")).isTrue();
    assertThat(client.collections.exists("Article")).isFalse();

    // START StatusRestoreBackup
    Optional<Backup> restoreStatus =
        client.backup.getRestoreStatus(backupId, backend);

    System.out.println(restoreStatus.orElse(null));
    // END StatusRestoreBackup

    assertThat(restoreStatus).isPresent();
    assertThat(restoreStatus.get().status()).isEqualTo(BackupStatus.SUCCESS);

    // Clean up
    client.collections.delete("Publication");
  }

  @Test
  @Order(2)
  void testCancelBackup() throws IOException, TimeoutException, InterruptedException {
    setupCollections();
    String backupId = "some-unwanted-backup";
    String backend = "filesystem";

    // Start a backup to cancel (replicates wait_for_completion=False)
    var backupToCancel = client.backup.create(backupId, backend,
        backup -> backup.includeCollections("Article", "Publication"));

    System.out.println(backupToCancel);

    // START CancelBackup
    // Note: The cancel() method is called on the Backup object
    backupToCancel.cancel(client);
    // END CancelBackup

    // Poll until the backup reaches a terminal state.
    // The cancel is async, so it may still be STARTED briefly after the call.
    BackupStatus status = BackupStatus.STARTED;
    for (int i = 0; i < 20; i++) {
      var s = client.backup.getCreateStatus(backupId, backend);
      if (s.isPresent()) {
        status = s.get().status();
        if (status != BackupStatus.STARTED) break;
      }
      Thread.sleep(500);
    }

    // The backup may complete before the cancel arrives,
    // so accept either CANCELED or SUCCESS.
    assertThat(status).isIn(BackupStatus.CANCELED, BackupStatus.SUCCESS);

    // Clean up
    client.collections.delete("Article");
    client.collections.delete("Publication");
  }

  @Test
  @Order(3)
  void testCancelRestore() throws IOException, TimeoutException, InterruptedException {
    setupCollections();
    String backupId = "backup-to-cancel-restore";
    String backend = "filesystem";

    // Create a backup first
    client.backup.create(backupId, backend,
        backup -> backup.includeCollections("Article", "Publication"))
        .waitForCompletion(client);

    // Delete collections before restoring
    client.collections.deleteAll();

    // Start a restore and cancel it
    var restoreToCancel = client.backup.restore(backupId, backend);

    // START CancelRestore
    client.backup.cancelRestore(backupId, backend);
    // END CancelRestore

    // Poll until the restore reaches a terminal state
    BackupStatus status = BackupStatus.STARTED;
    for (int i = 0; i < 20; i++) {
      var s = client.backup.getRestoreStatus(backupId, backend);
      if (s.isPresent()) {
        status = s.get().status();
        if (status != BackupStatus.STARTED && status != BackupStatus.TRANSFERRING) break;
      }
      Thread.sleep(500);
    }

    // The restore may complete before the cancel arrives
    assertThat(status).isIn(BackupStatus.CANCELED, BackupStatus.SUCCESS);
  }
}
