// llms.txt snippet: RBAC. Section "Python / TypeScript > RBAC".
import weaviate from 'weaviate-client';

// RBAC requires an authenticated connection; the test instance runs on :8580
const client = await weaviate.connectToLocal({
  port: 8580,
  grpcPort: 50551,
  authCredentials: new weaviate.ApiKey('root-user-key'),
});
try { await client.roles.delete('movie_reader'); } catch { /* not present */ }
try { await client.users.db.delete('alice'); } catch { /* not present */ }

// START llms_rbac
// Create a role scoped to one collection
await client.roles.create('movie_reader', [
  ...weaviate.permissions.collections({ collection: 'Movie', read_config: true }),
  ...weaviate.permissions.data({ collection: 'Movie', read: true }),
]);

// Create a user and assign the role
const apiKey = await client.users.db.create('alice');
await client.users.db.assignRoles(['movie_reader'], 'alice');
// END llms_rbac

if (!(await client.roles.exists('movie_reader'))) throw new Error('role missing');
await client.roles.delete('movie_reader');
await client.users.db.delete('alice');
await client.close();
