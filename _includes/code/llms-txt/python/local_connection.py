"""llms.txt snippet: local connection. Section "Python / TypeScript > Local connection"."""
import weaviate

# START llms_local_connection
client = weaviate.connect_to_local()  # localhost:8080, gRPC 50051
# END llms_local_connection

assert client.is_ready()
client.close()
