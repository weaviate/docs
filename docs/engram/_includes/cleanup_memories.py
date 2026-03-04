import os
from engram import EngramClient

client = EngramClient(
    api_key=os.environ["ENGRAM_API_KEY"], base_url="https://api.engram.weaviate.io"
)

user_id = os.environ.get("ENGRAM_USER_ID", "user-uuid")
group = os.environ.get("ENGRAM_GROUP", "default")

deleted = 0
for _ in range(20):
    results = client.memories.search(query="user", user_id=user_id, group=group)
    if len(results) == 0:
        break
    for m in results:
        try:
            client.memories.delete(m.id, topic=m.topic, user_id=user_id)
            deleted += 1
        except Exception:
            pass

print(f"Deleted {deleted} memories for user_id={user_id}, group={group}")

client.close()
