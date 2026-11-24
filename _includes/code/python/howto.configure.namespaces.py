import weaviate
from weaviate.classes.init import Auth

# Connect as an operator (the root user of the Docker Compose example on the page)
client = weaviate.connect_to_local(auth_credentials=Auth.api_key("admin-key"))

# Unreleased: needs the Python client release with the namespaces API, a Weaviate server
# with NAMESPACES_ENABLED and a license key. Not listed in tests/test_python.py on purpose,
# because the test servers have no namespaces. The page shows these blocks with pyindent.
# TODO(Ivan): remove this guard and dedent once the client version is known.
if hasattr(client, "namespaces"):
    # START NamespaceCreate
    namespace = client.namespaces.create(name="customer1", home_nodes=["weaviate-0"])
    print(namespace)
    # END NamespaceCreate
    assert namespace.name == "customer1"

    # START NamespaceGetList
    namespace = client.namespaces.get(name="customer1")
    print(namespace)

    all_namespaces = client.namespaces.list_all()
    print(all_namespaces)
    # END NamespaceGetList
    assert any(ns.name == "customer1" for ns in all_namespaces)

    # START NamespaceUpdate
    namespace = client.namespaces.update(name="customer1", home_nodes=["weaviate-1"])
    print(namespace)
    # END NamespaceUpdate
    assert namespace.home_nodes == ["weaviate-1"]

    # START NamespaceSuspendResume
    client.namespaces.suspend(name="customer1")
    client.namespaces.resume(name="customer1")
    # END NamespaceSuspendResume

    # START CreateNamespacedUser
    namespaced_api_key = client.users.db.create(user_id="customer1:api_user")
    print(namespaced_api_key)
    # END CreateNamespacedUser
    assert len(namespaced_api_key) > 0

    # START CreateNamespacedRole
    from weaviate.classes.rbac import Permissions

    client.roles.create(
        role_name="namespaceUser",
        permissions=Permissions.collections(
            collection="*", create_collection=True, read_config=True
        ),
    )
    # END CreateNamespacedRole

    # START AssignNamespacedRole
    client.users.db.assign_roles(
        user_id="customer1:api_user", role_names=["namespaceUser"]
    )
    # END AssignNamespacedRole

    # START NamespacedUserCreateCollection
    namespaced_client = weaviate.connect_to_local(
        auth_credentials=Auth.api_key(namespaced_api_key)
    )
    namespaced_client.collections.create("Movies")
    namespaced_client.close()
    # END NamespacedUserCreateCollection

    # START ManageNamespacesPermission
    from weaviate.classes.rbac import Permissions

    client.roles.create(
        role_name="namespaceAdmin",
        permissions=Permissions.namespaces(namespace="customer1", manage=True),
    )
    # END ManageNamespacesPermission

    # START NamespaceDelete
    client.namespaces.delete(name="customer1")
    # END NamespaceDelete

    client.roles.delete(role_name="namespaceUser")
    client.roles.delete(role_name="namespaceAdmin")

client.close()
