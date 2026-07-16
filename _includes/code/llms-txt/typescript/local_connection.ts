// llms.txt snippet: local connection. Section "Python / TypeScript > Local connection".
import weaviate from 'weaviate-client';

// START llms_local_connection
import weaviate from 'weaviate-client';

const client = await weaviate.connectToLocal();
// END llms_local_connection

if (!(await client.isReady())) throw new Error('Weaviate not ready');
await client.close();
