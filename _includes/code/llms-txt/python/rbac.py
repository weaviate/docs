"""llms.txt snippet: RBAC. Section "Python / TypeScript > RBAC"."""
import weaviate
from weaviate.classes.init import Auth

# RBAC requires an authenticated connection; the test instance runs on :8580
client = weaviate.connect_to_local(
    port=8580,
    grpc_port=50551,
    auth_credentials=Auth.api_key("root-user-key"),
)
for _cleanup in (lambda: client.roles.delete("movie_reader"),
                  lambda: client.users.db.delete(user_id="alice")):
    try:
        _cleanup()
    except Exception:
        pass

# START llms_rbac
from weaviate.classes.rbac import Permissions

# Create a role scoped to one collection
client.roles.create(
    role_name="movie_reader",
    permissions=[
        Permissions.collections(collection="Movie", read_config=True),
        Permissions.data(collection="Movie", read=True),
    ],
)

# Create a user and assign the role
api_key = client.users.db.create(user_id="alice")
client.users.db.assign_roles(user_id="alice", role_names="movie_reader")
# END llms_rbac

assert client.roles.exists("movie_reader")
assert "movie_reader" in client.users.db.get_assigned_roles(user_id="alice")
client.roles.delete("movie_reader")
client.users.db.delete(user_id="alice")
client.close()
