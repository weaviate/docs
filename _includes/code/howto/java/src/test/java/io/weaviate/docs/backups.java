// How-to: Configure -> Backups - Java examples
package io.weaviate.docs;

import io.weaviate.client.Config;
import io.weaviate.client.WeaviateAuthClient;
import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.auth.exception.AuthException;
import io.weaviate.client.v1.backup.api.BackupCreator;
import io.weaviate.client.v1.backup.api.BackupRestorer;
import io.weaviate.client.v1.backup.model.Backend;
import io.weaviate.client.v1.backup.model.BackupCreateResponse;
import io.weaviate.client.v1.backup.model.BackupCreateStatusResponse;
import io.weaviate.client.v1.backup.model.BackupRestoreResponse;
import io.weaviate.client.v1.backup.model.BackupRestoreStatusResponse;
import io.weaviate.client.v1.backup.model.RbacRestoreOption;
import io.weaviate.client.v1.data.model.WeaviateObject;
import io.weaviate.client.v1.schema.model.DataType;
import io.weaviate.client.v1.schema.model.Property;
import io.weaviate.client.v1.schema.model.WeaviateClass;
import java.util.Collections;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("backup")
class BackupsTest {

  private static WeaviateClient client;

  @BeforeAll
  public static void beforeAll() throws AuthException {
    // In a real-world scenario, you would externalize this configuration
    String scheme = "http";
    String host = "localhost";
    String port = "8580";
    String apiKey = "root-user-key";

    Config config = new Config(scheme, host + ":" + port);
    client = WeaviateAuthClient.apiKey(config, apiKey);

    // Cleanup all classes to ensure a clean slate
    Result<Boolean> result = client.schema().allDeleter().run();
    assertThat(result).isNotNull()
        .withFailMessage(() -> result.getError() != null ? result.getError().toString() : "No error")
        .returns(false, Result::hasErrors);
  }

  @Test
  public void shouldConfigureBackups() {
    createAndCheckBackup();
    restoreAndCheckBackup();
    cancelBackup();
  }

  private void createAndCheckBackup() {
    createCollections(client);

    // START CreateBackup
    Result<BackupCreateResponse> createResult = client.backup().creator()
        .withBackend(Backend.FILESYSTEM)
        .withBackupId("my-very-first-backup")
        .withIncludeClassNames("Article", "Publication")
        .withBackend(Backend.FILESYSTEM)
        .withConfig(BackupCreator.BackupCreateConfig.builder()
            .path("/var/lib/weaviate/backups")
            .build())
        .withWaitForCompletion(true)
        .run();

    System.out.println("Create backup response: " + createResult.getResult());
    // END CreateBackup

    assertThat(createResult).isNotNull()
        .withFailMessage(() -> createResult.getError() != null ? createResult.getError().toString() : "No error")
        .returns(false, Result::hasErrors)
        .extracting(Result::getResult).isNotNull()
        .returns("SUCCESS", BackupCreateResponse::getStatus);

    // START StatusCreateBackup
    Result<BackupCreateStatusResponse> createStatusResult = client.backup().createStatusGetter()
        .withBackend(Backend.FILESYSTEM)
        .withBackupId("my-very-first-backup")
        .run();

    System.out.println("Create status response: " + createStatusResult.getResult());
    // END StatusCreateBackup

    assertThat(createStatusResult).isNotNull()
        .withFailMessage(
            () -> createStatusResult.getError() != null ? createStatusResult.getError().toString() : "No error")
        .returns(false, Result::hasErrors)
        .extracting(Result::getResult).isNotNull()
        .returns("SUCCESS", BackupCreateStatusResponse::getStatus);
  }

  private void restoreAndCheckBackup() {
    client.schema().allDeleter().run();
    System.out.println("Deleted all collections before restore.");

    // START RestoreBackup
    Result<BackupRestoreResponse> restoreResult = client.backup().restorer()
        .withBackend(Backend.FILESYSTEM)
        .withBackupId("my-very-first-backup")
        .withExcludeClassNames("Article")
        // Use a specific config object for restore options like path and RBAC
        .withConfig(BackupRestorer.BackupRestoreConfig.builder()
            .path("/var/lib/weaviate/backups")
            .usersRestore(RbacRestoreOption.ALL)
            .rolesRestore(RbacRestoreOption.ALL)
            .build())
        .withWaitForCompletion(true)
        .run();

    System.out.println("Restore backup response: " + restoreResult.getResult());
    // END RestoreBackup

    assertThat(restoreResult).isNotNull()
        .withFailMessage(() -> restoreResult.getError() != null ? restoreResult.getError().toString() : "No error")
        .returns(false, Result::hasErrors)
        .extracting(Result::getResult).isNotNull()
        .returns("SUCCESS", BackupRestoreResponse::getStatus);

    // START StatusRestoreBackup
    Result<BackupRestoreStatusResponse> restoreStatusResult = client.backup().restoreStatusGetter()
        .withBackend(Backend.FILESYSTEM)
        .withBackupId("my-very-first-backup")
        .run();

    System.out.println("Restore status response: " + restoreStatusResult.getResult());
    // END StatusRestoreBackup

    assertThat(restoreStatusResult).isNotNull()
        .withFailMessage(
            () -> restoreStatusResult.getError() != null ? restoreStatusResult.getError().toString() : "No error")
        .returns(false, Result::hasErrors)
        .extracting(Result::getResult).isNotNull()
        .returns("SUCCESS", BackupRestoreStatusResponse::getStatus);
  }

  private void cancelBackup() {
    cleanupCollections(client);
    createCollections(client);

    client.backup().creator()
        .withBackend(Backend.FILESYSTEM)
        .withBackupId("some-unwanted-backup")
        .withConfig(BackupCreator.BackupCreateConfig.builder().path("/var/lib/weaviate/backups").build())
        .withWaitForCompletion(false) // Run asynchronously to allow for cancellation
        .run();

    // START CancelBackup
    Result<Void> cancelResult = client.backup().canceler()
        .withBackend(Backend.FILESYSTEM)
        .withBackupId("some-unwanted-backup")
        .run();
    // END CancelBackup

    // This may error out if the backup completes before the cancel call is
    // processed.
    if (cancelResult.hasErrors()) {
      System.out.println("Could not cancel backup (it may have already completed): " + cancelResult.getError());
    } else {
      System.out.println("Backup cancellation request sent successfully.");
    }

    assertThat(cancelResult).isNotNull();
    cleanupCollections(client);
  }

  private void createCollections(WeaviateClient client) {
    WeaviateClass articleClass = WeaviateClass.builder()
        .className("Article")
        .properties(Collections
            .singletonList(Property.builder().name("title").dataType(Collections.singletonList(DataType.TEXT)).build()))
        .build();
    client.schema().classCreator().withClass(articleClass).run();

    WeaviateClass publicationClass = WeaviateClass.builder()
        .className("Publication")
        .properties(Collections
            .singletonList(Property.builder().name("title").dataType(Collections.singletonList(DataType.TEXT)).build()))
        .build();
    client.schema().classCreator().withClass(publicationClass).run();

    client.data().creator().withClassName("Article").withProperties(Collections.singletonMap("title", "Dummy Article"))
        .run();
    client.data().creator().withClassName("Publication")
        .withProperties(Collections.singletonMap("title", "Dummy Publication")).run();
    System.out.println("Created and populated 'Article' and 'Publication' collections.");
  }

  private void cleanupCollections(WeaviateClient client) {
    client.schema().classDeleter().withClassName("Article").run();
    client.schema().classDeleter().withClassName("Publication").run();
  }
}
