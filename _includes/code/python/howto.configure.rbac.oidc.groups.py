#!/usr/bin/env python3
"""
OIDC Group Management Testing Script with Built-in Keycloak Setup Helper
Complete example of how to configure RBAC with OIDC groups in Weaviate
"""

import requests
import sys
from typing import Optional
import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.rbac import Permissions


def test_keycloak_connection(keycloak_ports: list = [8081]) -> Optional[str]:
    """Test if Keycloak is accessible on common ports"""
    # Try keycloak hostname first (requires /etc/hosts mapping), then localhost
    keycloak_configs = [
        ("keycloak", 8081),  # This should match Weaviate's expected issuer
        ("localhost", 8081),  # Fallback for initial testing
    ]

    for host, port in keycloak_configs:
        keycloak_url = f"http://{host}:{port}"
        try:
            # First check if Keycloak is responding at all
            response = requests.get(f"{keycloak_url}", timeout=5)
            if response.status_code == 200:
                print(f"OK: Keycloak server found at {keycloak_url}")

                # Check if master realm exists (always exists)
                master_response = requests.get(
                    f"{keycloak_url}/realms/master", timeout=5
                )
                if master_response.status_code == 200:
                    print(f"OK: Keycloak realms accessible")

                    # Check if our test realm exists
                    test_response = requests.get(
                        f"{keycloak_url}/realms/weaviate-test", timeout=5
                    )
                    if test_response.status_code == 200:
                        print(f"OK: weaviate-test realm found")
                        print(f"OK: weaviate-test realm accessible")
                        return keycloak_url
                    else:
                        print(
                            f"Warning: weaviate-test realm not found - you'll need to create it"
                        )
                        return keycloak_url
        except Exception as e:
            print(f"Testing {keycloak_url}: {e}")
            continue

    print(f"Error: Cannot connect to Keycloak")
    print("Hint: Make sure you have '127.0.0.1 keycloak' in /etc/hosts")
    print("Hint: Run: echo '127.0.0.1 keycloak' | sudo tee -a /etc/hosts")
    return None


def get_oidc_token(
    keycloak_url: str,
    client_secret: str,
    username: str,
    password: str = "password123",
    realm: str = "weaviate-test",
    client_id: str = "weaviate",
) -> Optional[str]:
    """Get OIDC token from Keycloak for a user"""
    token_url = f"{keycloak_url}/realms/{realm}/protocol/openid-connect/token"

    data = {
        "grant_type": "password",
        "client_id": client_id,
        "client_secret": client_secret,
        "username": username,
        "password": password,
    }

    try:
        response = requests.post(token_url, data=data, timeout=10)

        if response.status_code == 200:
            token_data = response.json()
            print(f"OK: Successfully got token for user: {username}")
            return token_data["access_token"]
        else:
            print(f"Error: Failed to get token for {username}: {response.status_code}")
            if response.status_code == 401:
                print("   → Check username/password or client secret")
            elif response.status_code == 400:
                print("   → Check client configuration (Direct Access Grants enabled?)")
            print(f"   → Response: {response.text}")
            return None

    except Exception as e:
        print(f"Error: Error getting token for {username}: {e}")
        return None


def setup_and_validate_oidc() -> tuple[Optional[str], Optional[str]]:
    """Setup and validate OIDC connection, return (client_secret, keycloak_url) if successful"""
    print("KEYCLOAK OIDC SETUP VALIDATOR")
    print("=" * 50)

    # Test Keycloak connection
    print("Testing Keycloak connection...")
    keycloak_url = test_keycloak_connection([8081])
    if not keycloak_url:
        print("Error: Keycloak not accessible!")
        print("\nTroubleshooting:")
        print(
            "1. Add keycloak to /etc/hosts: echo '127.0.0.1 keycloak' | sudo tee -a /etc/hosts"
        )
        print("2. Check if docker-compose is running: docker-compose ps")
        print("3. Check Keycloak logs: docker-compose logs keycloak")
        return None, None

    # Check if weaviate-test realm exists
    try:
        realm_response = requests.get(f"{keycloak_url}/realms/weaviate-test", timeout=5)
        realm_exists = realm_response.status_code == 200
    except:
        realm_exists = False

    if not realm_exists:
        print(f"\nWarning: The 'weaviate-test' realm doesn't exist yet.")
        print(
            "Please complete the Keycloak setup first with keycloak_helper_script.py, then run this script again."
        )
        return None, None

    else:
        print(f"OK: weaviate-test realm accessible")
        print("\n" + "-" * 30)
        # Using a fixed secret for automated testing
        client_secret = "weaviate-client-secret-123"
        print(f"Using client secret: {client_secret}")

    # Test tokens with the keycloak_url (which should be http://keycloak:8081)
    print(f"\nTesting OIDC tokens...")
    admin_token = get_oidc_token(
        keycloak_url=keycloak_url, client_secret=client_secret, username="test-admin"
    )

    if not admin_token:
        print("\nError: Cannot get admin token. Please verify:")
        print("- User 'test-admin' exists with password 'password123'")
        print("- User is in groups like '/admin-group'")
        print("- Client 'weaviate' has 'Direct access grants' enabled")
        print("- Client secret is correct")
        return None, None

    viewer_token = get_oidc_token(
        keycloak_url=keycloak_url, client_secret=client_secret, username="test-viewer"
    )
    if not viewer_token:
        print("Warning: Viewer token failed, but continuing with admin token")

    print("\nOK: OIDC setup validated successfully!")
    return client_secret, keycloak_url


# Setup and validate OIDC first
client_secret, keycloak_url = setup_and_validate_oidc()
if not client_secret or not keycloak_url:
    sys.exit(1)

print("\n" + "=" * 60)
print("STARTING OIDC GROUP MANAGEMENT TESTS")
print("=" * 60)

# The admin_client is used for setup and cleanup that requires root privileges
admin_client = None

# START AdminClient
# Connect to Weaviate as root user (for admin operations)
admin_client = weaviate.connect_to_local(
    port=8580,
    grpc_port=50551,
    auth_credentials=Auth.api_key("root-user-key"),
)
# END AdminClient

# Create test roles for group management
print("\nSetting up test roles...")
permissions = [
    Permissions.collections(
        collection="TargetCollection*", read_config=True, create_collection=True
    ),
    Permissions.data(collection="TargetCollection*", read=True, create=True),
]

admin_client.roles.delete(role_name="testRole")
admin_client.roles.create(role_name="testRole", permissions=permissions)

admin_client.roles.delete(role_name="groupViewerRole")
admin_client.roles.create(
    role_name="groupViewerRole",
    permissions=[Permissions.data(collection="*", read=True)],
)

print("\nADMIN OPERATIONS (Using API Key)")
print("-" * 40)

# START AssignOidcGroupRoles
admin_client.groups.oidc.assign_roles(
    group_id="/admin-group", role_names=["testRole", "viewer"]
)
# END AssignOidcGroupRoles
admin_client.groups.oidc.assign_roles(group_id="/viewer-group", role_names=["viewer"])
admin_client.groups.oidc.assign_roles(
    group_id="/my-test-group", role_names=["groupViewerRole"]
)

# START GetKnownOidcGroups
known_groups = admin_client.groups.oidc.get_known_group_names()
print(f"Known OIDC groups ({len(known_groups)}): {known_groups}")
# END GetKnownOidcGroups
assert len(known_groups) == 3
assert set(known_groups) == {"/admin-group", "/viewer-group", "/my-test-group"}

# START GetGroupAssignments
group_assignments = admin_client.roles.get_group_assignments(role_name="testRole")
print(f"Groups assigned to role 'testRole':")
for group in group_assignments:
    print(f"  - Group ID: {group.group_id}, Type: {group.group_type}")
# END GetGroupAssignments
assert len(group_assignments) == 1
assert group_assignments[0].group_id == "/admin-group"

print(f"\nOIDC USER OPERATIONS")
print("-" * 40)

# Get tokens for different users using keycloak_url
# START GetOidcToken
admin_token = get_oidc_token(
    keycloak_url=keycloak_url, client_secret=client_secret, username="test-admin"
)
viewer_token = get_oidc_token(
    keycloak_url=keycloak_url, client_secret=client_secret, username="test-viewer"
)
# END GetOidcToken
assert admin_token is not None
assert viewer_token is not None

# --- Admin User Tests ---
# START OidcAdminClient
# Connect as OIDC admin user
oidc_admin_client = weaviate.connect_to_local(
    port=8580,
    grpc_port=50551,
    auth_credentials=Auth.bearer_token(admin_token),
)
# END OidcAdminClient

# START GetCurrentUserRoles
my_user = oidc_admin_client.users.get_my_user()
current_roles_dict = my_user.roles if my_user else []
role_names = list(current_roles_dict.keys())
print(f"Admin user's current roles ({len(role_names)}): {role_names}")
# END GetCurrentUserRoles
assert set(role_names) == {"viewer", "testRole", "groupViewerRole"}

# START GetOidcGroupRoles
group_roles = oidc_admin_client.groups.oidc.get_assigned_roles(
    group_id="/admin-group", include_permissions=True
)
print(f"Roles assigned to '/admin-group': {list(group_roles.keys())}")
# END GetOidcGroupRoles
assert set(group_roles.keys()) == {"testRole", "viewer"}
oidc_admin_client.close()

# --- Viewer User Tests ---
# START OidcViewerClient
# Connect as OIDC viewer user
oidc_viewer_client = weaviate.connect_to_local(
    port=8580,
    grpc_port=50551,
    auth_credentials=Auth.bearer_token(viewer_token),
)
# END OidcViewerClient

# START GetCurrentUserRolesViewer
my_user = oidc_viewer_client.users.get_my_user()
current_roles_dict = my_user.roles if my_user else {}
role_names = list(current_roles_dict.keys())
print(f"Viewer user's current roles ({len(role_names)}): {role_names}")
# END GetCurrentUserRolesViewer
assert role_names == ["viewer"]

# Viewer should have limited permissions but can still see group names
try:
    viewer_groups = oidc_viewer_client.groups.oidc.get_known_group_names()
    print(f"Viewer can see groups: {viewer_groups}")
    assert set(viewer_groups) == {"/admin-group", "/viewer-group", "/my-test-group"}
except Exception as e:
    # This part should not be reached if permissions are set correctly
    assert False, f"Viewer user failed to access group operations: {e}"

oidc_viewer_client.close()

print(f"\nCLEANUP (Admin operations)")
print("-" * 40)

# START RevokeOidcGroupRoles
admin_client.groups.oidc.revoke_roles(
    group_id="/admin-group", role_names=["testRole", "viewer"]
)
# END RevokeOidcGroupRoles
admin_client.groups.oidc.revoke_roles(group_id="/viewer-group", role_names=["viewer"])
admin_client.groups.oidc.revoke_roles(
    group_id="/my-test-group", role_names=["groupViewerRole"]
)

# Verify cleanup
final_groups = admin_client.groups.oidc.get_known_group_names()
print(f"Remaining known groups after cleanup: {final_groups}")
assert len(final_groups) == 0

admin_client.close()

print("\n" + "=" * 60)
print("OIDC GROUP MANAGEMENT TESTING COMPLETE!")
print("=" * 60)
