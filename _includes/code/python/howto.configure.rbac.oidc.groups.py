#!/usr/bin/env python3
"""
OIDC Group Management Testing Script with Built-in Keycloak Setup Helper
Complete example of how to configure RBAC with OIDC groups in Weaviate
"""

import requests
import json
import sys
from typing import Dict, Any, Optional
import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.rbac import Permissions

def test_keycloak_connection(keycloak_ports: list = [8081]) -> Optional[str]:
    """Test if Keycloak is accessible on common ports"""
    # Try keycloak hostname first (requires /etc/hosts mapping), then localhost
    keycloak_configs = [
        ("keycloak", 8081),  # This should match Weaviate's expected issuer
        ("localhost", 8081)  # Fallback for initial testing
    ]
    
    for host, port in keycloak_configs:
        keycloak_url = f"http://{host}:{port}"
        try:
            # First check if Keycloak is responding at all
            response = requests.get(f"{keycloak_url}", timeout=5)
            if response.status_code == 200:
                print(f"✅ Keycloak server found at {keycloak_url}")
                
                # Check if master realm exists (always exists)
                master_response = requests.get(f"{keycloak_url}/realms/master", timeout=5)
                if master_response.status_code == 200:
                    print(f"✅ Keycloak realms accessible")
                    
                    # Check if our test realm exists
                    test_response = requests.get(f"{keycloak_url}/realms/weaviate-test", timeout=5)
                    if test_response.status_code == 200:
                        print(f"✅ weaviate-test realm found")
                        print(f"✅ weaviate-test realm accessible")
                        return keycloak_url
                    else:
                        print(f"⚠️  weaviate-test realm not found - you'll need to create it")
                        return keycloak_url
        except Exception as e:
            print(f"Testing {keycloak_url}: {e}")
            continue
    
    print(f"❌ Cannot connect to Keycloak")
    print("💡 Make sure you have '127.0.0.1 keycloak' in /etc/hosts")
    print("💡 Run: echo '127.0.0.1 keycloak' | sudo tee -a /etc/hosts")
    return None

def get_client_secret_instructions():
    """Print instructions for getting client secret"""
    print("\n" + "="*60)
    print("📋 KEYCLOAK SETUP INSTRUCTIONS")
    print("="*60)
    print("Your Keycloak is running! Now you need to set it up:")
    print("")
    print("1. 🌐 Go to http://keycloak:8081 (make sure you have keycloak in /etc/hosts)")
    print("2. 🔑 Login with username: admin, password: admin")
    print("3. 🏛️  CREATE REALM:")
    print("   - Click dropdown next to 'master' (top-left)")
    print("   - Click 'Create Realm'")
    print("   - Realm name: weaviate-test")
    print("   - Click 'Create'")
    print("")
    print("4. 📱 CREATE CLIENT:")
    print("   - Go to 'Clients' → 'Create client'")
    print("   - Client ID: weaviate")
    print("   - Client type: OpenID Connect")
    print("   - Click 'Next'")
    print("   - Enable 'Client authentication'")
    print("   - Enable 'Direct access grants'")
    print("   - Click 'Save'")
    print("")
    print("5. 🔐 GET CLIENT SECRET:")
    print("   - Go to 'Credentials' tab")
    print("   - Copy the 'Client secret' value")
    print("")
    print("6. 👥 CREATE GROUPS:")
    print("   - Go to 'Groups'")
    print("   - Create: /admin-group, /viewer-group, /my-test-group")
    print("")
    print("7. 👤 CREATE USERS:")
    print("   - Go to 'Users' → 'Create new user'")
    print("   - Username: test-admin, set password: password123")
    print("   - Add to groups: /admin-group, /my-test-group")
    print("   - Create test-viewer user, add to /viewer-group")
    print("")
    print("8. ⚙️  CONFIGURE GROUP CLAIMS:")
    print("   - Go to 'Client scopes' → 'weaviate-dedicated'")
    print("   - Add mapper → Group Membership")
    print("   - Name: groups, Token Claim Name: groups")
    print("   - Add to ID token: ON, Add to access token: ON")
    print("="*60)

def get_oidc_token(
    keycloak_url: str = "http://keycloak:8081",  # Changed default to keycloak hostname
    realm: str = "weaviate-test", 
    client_id: str = "weaviate",
    client_secret: str = "",
    username: str = "test-admin",
    password: str = "password123"
) -> Optional[str]:
    """Get OIDC token from Keycloak for a user"""
    token_url = f"{keycloak_url}/realms/{realm}/protocol/openid-connect/token"
    
    data = {
        "grant_type": "password",
        "client_id": client_id,
        "client_secret": client_secret,
        "username": username,
        "password": password
    }
    
    try:
        response = requests.post(token_url, data=data, timeout=10)
        
        if response.status_code == 200:
            token_data = response.json()
            print(f"✅ Successfully got token for user: {username}")
            return token_data["access_token"]
        else:
            print(f"❌ Failed to get token for {username}: {response.status_code}")
            if response.status_code == 401:
                print("   → Check username/password or client secret")
            elif response.status_code == 400:
                print("   → Check client configuration (Direct Access Grants enabled?)")
            print(f"   → Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error getting token for {username}: {e}")
        return None

def decode_token_groups(token: str) -> Dict[str, Any]:
    """Decode JWT token to see groups (for debugging)"""
    try:
        import jwt
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded
    except ImportError:
        print("⚠️  Install PyJWT to see token details: pip install PyJWT")
        return {}
    except Exception as e:
        print(f"⚠️  Error decoding token: {e}")
        return {}

def show_token_info(token: str, username: str):
    """Display token information"""
    decoded = decode_token_groups(token)
    if decoded:
        print(f"   → Username: {decoded.get('preferred_username', 'N/A')}")
        print(f"   → Groups: {decoded.get('groups', [])}")
        print(f"   → Issuer: {decoded.get('iss', 'N/A')}")
        print(f"   → Realm roles: {decoded.get('realm_access', {}).get('roles', [])}")

def run_automated_setup(keycloak_url: str) -> Optional[str]:
    """Run automated Keycloak setup using Admin API"""
    try:
        # Import the automated setup class inline
        import requests
        from typing import Optional, Dict

        class KeycloakSetup:
            def __init__(self, keycloak_url: str = "http://keycloak:8081", admin_user: str = "admin", admin_pass: str = "admin"):
                self.keycloak_url = keycloak_url.rstrip("/")
                self.admin_user = admin_user
                self.admin_pass = admin_pass
                self.admin_token = None
                self.realm_name = "weaviate-test"
                self.client_id = "weaviate"

            def get_admin_token(self) -> Optional[str]:
                token_url = f"{self.keycloak_url}/realms/master/protocol/openid-connect/token"
                data = {
                    "grant_type": "password",
                    "client_id": "admin-cli",
                    "username": self.admin_user,
                    "password": self.admin_pass,
                }
                try:
                    response = requests.post(token_url, data=data, timeout=10)
                    if response.status_code == 200:
                        self.admin_token = response.json()["access_token"]
                        return self.admin_token
                    return None
                except Exception:
                    return None

            def make_admin_request(self, method: str, endpoint: str, json_data: Dict = None) -> requests.Response:
                headers = {
                    "Authorization": f"Bearer {self.admin_token}",
                    "Content-Type": "application/json",
                }
                url = f"{self.keycloak_url}/admin/realms{endpoint}"
                if method.upper() == "GET":
                    return requests.get(url, headers=headers, timeout=10)
                elif method.upper() == "POST":
                    return requests.post(url, headers=headers, json=json_data, timeout=10)

            def create_realm(self) -> bool:
                response = self.make_admin_request("GET", f"/{self.realm_name}")
                if response.status_code == 200:
                    return True
                realm_config = {"realm": self.realm_name, "enabled": True}
                response = self.make_admin_request("POST", "", realm_config)
                return response.status_code == 201

            def create_client(self) -> Optional[str]:
                client_config = {
                    "clientId": self.client_id,
                    "enabled": True,
                    "clientAuthenticatorType": "client-secret", 
                    "secret": "weaviate-client-secret-123",
                    "redirectUris": ["*"],
                    "standardFlowEnabled": True,
                    "directAccessGrantsEnabled": True,
                    "publicClient": False,
                }
                response = self.make_admin_request("POST", f"/{self.realm_name}/clients", client_config)
                if response.status_code == 201:
                    return "weaviate-client-secret-123"
                return None

            def setup_all(self) -> Optional[str]:
                if not self.get_admin_token():
                    return None
                if not self.create_realm():
                    return None
                return self.create_client()

        print("🤖 Running automated Keycloak setup...")
        setup = KeycloakSetup(keycloak_url)
        client_secret = setup.setup_all()
        
        if client_secret:
            print(f"\n🎉 Automated setup completed successfully!")
            return client_secret
        else:
            print("❌ Automated setup failed")
            return None
    except Exception as e:
        print(f"❌ Automated setup error: {e}")
        return None

def setup_and_validate_oidc() -> tuple[Optional[str], Optional[str]]:
    """Setup and validate OIDC connection, return (client_secret, keycloak_url) if successful"""
    print("🧪 KEYCLOAK OIDC SETUP VALIDATOR")
    print("=" * 50)
    
    # Test Keycloak connection
    print("Testing Keycloak connection...")
    keycloak_url = test_keycloak_connection([8081])
    if not keycloak_url:
        print("❌ Keycloak not accessible!")
        print("\nTroubleshooting:")
        print("1. Add keycloak to /etc/hosts: echo '127.0.0.1 keycloak' | sudo tee -a /etc/hosts")
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
        print(f"\n⚠️  The 'weaviate-test' realm doesn't exist yet.")
        print("Choose your setup method:")
        print("1. 🤖 Automated setup (recommended)")
        print("2. 📋 Manual setup instructions")
        
        choice = input("\nEnter choice (1 or 2): ").strip()
        
        if choice == "1":
            client_secret = run_automated_setup(keycloak_url)
            if not client_secret:
                return None, None
        else:
            get_client_secret_instructions()
            setup_choice = input("\nHave you completed the manual setup? (y/n): ").strip().lower()
            if setup_choice != 'y':
                print("Please complete the Keycloak setup first, then run this script again.")
                return None, None
            client_secret = input("Enter Keycloak client secret: ").strip()
            if not client_secret:
                print("❌ Client secret required.")
                return None, None
    else:
        print(f"✅ weaviate-test realm accessible")
        print("\n" + "-"*30)
        client_secret = input("Enter Keycloak client secret (or 'auto' for automated setup): ").strip()
        
        if client_secret.lower() == 'auto':
            client_secret = run_automated_setup(keycloak_url)
            if not client_secret:
                return None, None
        elif not client_secret:
            print("❌ Client secret required.")
            return None, None
    
    # Test tokens with the keycloak_url (which should be http://keycloak:8081)
    print(f"\n🔑 Testing OIDC tokens...")
    admin_token = get_oidc_token(keycloak_url=keycloak_url, client_secret=client_secret, username="test-admin")
    
    if not admin_token:
        print("\n❌ Cannot get admin token. Please verify:")
        print("- User 'test-admin' exists with password 'password123'")
        print("- User is in groups like '/admin-group'")
        print("- Client 'weaviate' has 'Direct access grants' enabled")
        print("- Client secret is correct")
        return None, None
    
    show_token_info(admin_token, "test-admin")
    
    viewer_token = get_oidc_token(keycloak_url=keycloak_url, client_secret=client_secret, username="test-viewer")
    if viewer_token:
        show_token_info(viewer_token, "test-viewer")
    else:
        print("⚠️  Viewer token failed, but continuing with admin token")
    
    print("\n✅ OIDC setup validated successfully!")
    return client_secret, keycloak_url

def main():
    """Main function to run OIDC group management tests"""
    
    # Setup and validate OIDC first
    client_secret, keycloak_url = setup_and_validate_oidc()
    if not client_secret or not keycloak_url:
        sys.exit(1)
        
    print("\n" + "="*60)
    print("🚀 STARTING OIDC GROUP MANAGEMENT TESTS")
    print("="*60)

    # START AdminClient
    # Connect to Weaviate as root user (for admin operations)
    admin_client = weaviate.connect_to_local(
        port=8580,
        grpc_port=50551,
        auth_credentials=Auth.api_key("root-user-key"),
    )
    # END AdminClient

    # Create test roles for group management
    print("\n📋 Setting up test roles...")
    permissions = [
        Permissions.collections(
            collection="TargetCollection*", read_config=True, create_collection=True
        ),
        Permissions.data(collection="TargetCollection*", read=True, create=True),
    ]

    admin_client.roles.delete(role_name="testRole")
    admin_client.roles.create(role_name="testRole", permissions=permissions)

    admin_client.roles.delete(role_name="groupViewerRole")
    admin_client.roles.create(role_name="groupViewerRole", permissions=[
        Permissions.data(collection="*", read=True)
    ])

    print("\n🔧 ADMIN OPERATIONS (Using API Key)")
    print("-" * 40)

    # START AssignOidcGroupRoles
    admin_client.groups.oidc.assign_roles(group_id="/admin-group", role_names=["testRole", "viewer"])
    admin_client.groups.oidc.assign_roles(group_id="/viewer-group", role_names=["viewer"])
    admin_client.groups.oidc.assign_roles(group_id="/my-test-group", role_names=["groupViewerRole"])
    print("✅ Assigned roles to OIDC groups")
    # END AssignOidcGroupRoles

    # START GetKnownOidcGroups
    known_groups = admin_client.groups.oidc.get_known_group_names()
    print(f"📁 Known OIDC groups ({len(known_groups)}):")
    for group in known_groups:
        print(f"  - {group}")
    # END GetKnownOidcGroups

    # START GetGroupAssignments
    group_assignments = admin_client.roles.get_group_assignments(role_name="testRole")
    print(f"👥 Groups assigned to role 'testRole':")
    for group in group_assignments:
        print(f"  - Group ID: {group.group_id}")
        print(f"    Group Type: {group.group_type}")
    # END GetGroupAssignments

    admin_client.close()

    print(f"\n👤 OIDC USER OPERATIONS")
    print("-" * 40)

    # Get tokens for different users using keycloak_url
    # START GetOidcToken
    admin_token = get_oidc_token(keycloak_url=keycloak_url, client_secret=client_secret, username="test-admin")
    viewer_token = get_oidc_token(keycloak_url=keycloak_url, client_secret=client_secret, username="test-viewer")
    # END GetOidcToken

    if admin_token:
        # START OidcAdminClient
        # Connect as OIDC admin user
        oidc_admin_client = weaviate.connect_to_local(
            port=8580,
            grpc_port=50551,
            auth_credentials=Auth.bearer_token(admin_token),
        )
        # END OidcAdminClient
        
        try:
            # START GetCurrentUserRoles
            my_user = oidc_admin_client.users.get_my_user()
            current_roles = my_user.roles if my_user else []
            print(f"🔑 Admin user's current roles ({len(current_roles)}):")
            for role in current_roles:
                print(f"  - {role}")
            # END GetCurrentUserRoles
            
            # Test admin can see group assignments (if they have permissions)
            try:
                # START GetOidcGroupRoles
                group_roles = oidc_admin_client.groups.oidc.get_assigned_roles(
                    group_id="/admin-group",
                    include_permissions=True
                )
                print(f"👑 Admin group roles:")
                for role_name, role_obj in group_roles.items():
                    print(f"  - {role_name}")
                # END GetOidcGroupRoles
            except Exception as e:
                print(f"⚠️  Admin user cannot access group details: {e}")
                
        except Exception as e:
            print(f"❌ Error with admin OIDC operations: {e}")
        finally:
            oidc_admin_client.close()

    if viewer_token:
        # START OidcViewerClient
        # Connect as OIDC viewer user  
        oidc_viewer_client = weaviate.connect_to_local(
            port=8580,
            grpc_port=50551,
            auth_credentials=Auth.bearer_token(viewer_token),
        )
        # END OidcViewerClient
        
        try:
            # START GetCurrentUserRolesViewer
            my_user = oidc_viewer_client.users.get_my_user()
            current_roles = my_user.roles if my_user else []
            print(f"👀 Viewer user's current roles ({len(current_roles)}):")
            for role in current_roles:
                print(f"  - {role}")
            # END GetCurrentUserRolesViewer
            
            # Viewer should have limited permissions
            try:
                viewer_groups = oidc_viewer_client.groups.oidc.get_known_group_names()
                print(f"👀 Viewer can see groups: {viewer_groups}")
            except Exception as e:
                print(f"⚠️  Viewer user cannot access group operations: {e}")
                
        except Exception as e:
            print(f"❌ Error with viewer OIDC operations: {e}")
        finally:
            oidc_viewer_client.close()

    print(f"\n🧹 CLEANUP (Admin operations)")
    print("-" * 40)

    # Reconnect as admin for cleanup
    admin_client = weaviate.connect_to_local(
        port=8580,
        grpc_port=50551,
        auth_credentials=Auth.api_key("root-user-key"),
    )

    # START RevokeOidcGroupRoles
    admin_client.groups.oidc.revoke_roles(group_id="/admin-group", role_names=["testRole", "viewer"])
    admin_client.groups.oidc.revoke_roles(group_id="/viewer-group", role_names=["viewer"])
    admin_client.groups.oidc.revoke_roles(group_id="/my-test-group", role_names=["groupViewerRole"])
    print("✅ Revoked all assigned group roles")
    # END RevokeOidcGroupRoles

    # Verify cleanup
    final_groups = admin_client.groups.oidc.get_known_group_names()
    print(f"📁 Remaining known groups after cleanup: {final_groups}")

    admin_client.close()

    print(f"\n🎉 OIDC GROUP MANAGEMENT TESTING COMPLETE!")
    print("="*60)

if __name__ == "__main__":
    main()