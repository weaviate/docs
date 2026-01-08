#!/usr/bin/env python3
"""
Automated Keycloak Setup Script
Creates realm, client, users, groups, and configures everything needed for OIDC testing
"""

import requests
import json
import time
from typing import Optional, Dict, Any


class KeycloakSetup:
    def __init__(
        self,
        keycloak_url: str = "http://localhost:8081",
        admin_user: str = "admin",
        admin_pass: str = "admin",
    ):
        self.keycloak_url = keycloak_url.rstrip("/")
        self.admin_user = admin_user
        self.admin_pass = admin_pass
        self.admin_token = None
        self.realm_name = "weaviate-test"
        self.client_id = "weaviate"

    def get_admin_token(self) -> Optional[str]:
        """Get admin token from master realm"""
        print("🔑 Getting admin token...")

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
                print("✅ Got admin token")
                return self.admin_token
            else:
                print(f"❌ Failed to get admin token: {response.status_code}")
                print(f"Response: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error getting admin token: {e}")
            return None

    def make_admin_request(
        self, method: str, endpoint: str, json_data: Dict = None
    ) -> requests.Response:
        """Make authenticated request to Keycloak Admin API"""
        if not self.admin_token:
            raise Exception("No admin token available")

        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json",
        }

        url = f"{self.keycloak_url}/admin/realms{endpoint}"

        if method.upper() == "GET":
            return requests.get(url, headers=headers, timeout=10)
        elif method.upper() == "POST":
            return requests.post(url, headers=headers, json=json_data, timeout=10)
        elif method.upper() == "PUT":
            return requests.put(url, headers=headers, json=json_data, timeout=10)
        elif method.upper() == "DELETE":
            return requests.delete(url, headers=headers, timeout=10)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")

    def create_realm(self) -> bool:
        """Create the weaviate-test realm"""
        print(f"🏛️  Creating realm '{self.realm_name}'...")

        # Check if realm already exists
        response = self.make_admin_request("GET", f"/{self.realm_name}")
        if response.status_code == 200:
            print(f"✅ Realm '{self.realm_name}' already exists")
            return True

        # Create realm
        realm_config = {
            "realm": self.realm_name,
            "enabled": True,
            "displayName": "Weaviate Test Realm",
            "sslRequired": "none",  # ADD THIS LINE - allows HTTP
            "registrationAllowed": False,
            "loginWithEmailAllowed": True,
            "duplicateEmailsAllowed": False,
            "rememberMe": True,
            "verifyEmail": False,
            "loginTheme": None,
            "accountTheme": None,
            "adminTheme": None,
            "emailTheme": None,
        }

        response = self.make_admin_request("POST", "", realm_config)
        if response.status_code == 201:
            print(f"✅ Created realm '{self.realm_name}'")
            return True
        else:
            print(f"❌ Failed to create realm: {response.status_code}")
            print(f"Response: {response.text}")
            return False

    def create_client(self) -> Optional[str]:
        """Create the weaviate client and return client secret"""
        print(f"📱 Creating client '{self.client_id}'...")

        # Check if client already exists
        response = self.make_admin_request("GET", f"/{self.realm_name}/clients")
        if response.status_code == 200:
            clients = response.json()
            for client in clients:
                if client.get("clientId") == self.client_id:
                    print(f"✅ Client '{self.client_id}' already exists")
                    client_uuid = client["id"]
                    return self.get_client_secret(client_uuid)

        # Create client
        client_config = {
            "clientId": self.client_id,
            "name": "Weaviate OIDC Client",
            "enabled": True,
            "clientAuthenticatorType": "client-secret",
            "secret": "weaviate-client-secret-123",  # Fixed secret for easier testing
            "redirectUris": ["*"],
            "webOrigins": ["*"],
            "standardFlowEnabled": True,
            "directAccessGrantsEnabled": True,  # Enable Direct Access Grants
            "serviceAccountsEnabled": True,
            "publicClient": False,
            "protocol": "openid-connect",
            "attributes": {
                "saml.assertion.signature": "false",
                "saml.force.post.binding": "false",
                "saml.multivalued.roles": "false",
                "saml.encrypt": "false",
                "saml.server.signature": "false",
                "saml.server.signature.keyinfo.ext": "false",
                "exclude.session.state.from.auth.response": "false",
                "saml_force_name_id_format": "false",
                "saml.client.signature": "false",
                "tls.client.certificate.bound.access.tokens": "false",
                "saml.authnstatement": "false",
                "display.on.consent.screen": "false",
                "saml.onetimeuse.condition": "false",
            },
        }

        response = self.make_admin_request(
            "POST", f"/{self.realm_name}/clients", client_config
        )
        if response.status_code == 201:
            print(f"✅ Created client '{self.client_id}'")

            # Get the client UUID
            response = self.make_admin_request("GET", f"/{self.realm_name}/clients")
            clients = response.json()
            for client in clients:
                if client.get("clientId") == self.client_id:
                    client_uuid = client["id"]
                    return self.get_client_secret(client_uuid)
        else:
            print(f"❌ Failed to create client: {response.status_code}")
            print(f"Response: {response.text}")
            return None

    def get_client_secret(self, client_uuid: str) -> Optional[str]:
        """Get client secret"""
        response = self.make_admin_request(
            "GET", f"/{self.realm_name}/clients/{client_uuid}/client-secret"
        )
        if response.status_code == 200:
            secret = response.json().get("value")
            print(f"🔐 Client secret: {secret}")
            return secret
        return None

    def create_groups(self) -> bool:
        """Create test groups"""
        print("👥 Creating groups...")

        groups_to_create = [
            {"name": "admin-group", "path": "/admin-group"},
            {"name": "viewer-group", "path": "/viewer-group"},
            {"name": "my-test-group", "path": "/my-test-group"},
            {"name": "another-test-group", "path": "/another-test-group"},
        ]

        for group_config in groups_to_create:
            # Check if group exists
            response = self.make_admin_request("GET", f"/{self.realm_name}/groups")
            if response.status_code == 200:
                existing_groups = response.json()
                group_exists = any(
                    g.get("path") == group_config["path"] for g in existing_groups
                )

                if group_exists:
                    print(f"✅ Group '{group_config['path']}' already exists")
                    continue

            # Create group
            response = self.make_admin_request(
                "POST", f"/{self.realm_name}/groups", group_config
            )
            if response.status_code == 201:
                print(f"✅ Created group '{group_config['path']}'")
            else:
                print(
                    f"❌ Failed to create group '{group_config['path']}': {response.status_code}"
                )
                return False

        return True

    def create_users(self) -> bool:
        """Create test users"""
        print("👤 Creating users...")

        users_to_create = [
            {
                "username": "test-admin",
                "email": "admin@test.com",
                "firstName": "Test",
                "lastName": "Admin",
                "password": "password123",
                "groups": ["/admin-group", "/my-test-group"],
            },
            {
                "username": "test-viewer",
                "email": "viewer@test.com",
                "firstName": "Test",
                "lastName": "Viewer",
                "password": "password123",
                "groups": ["/viewer-group"],
            },
        ]

        for user_config in users_to_create:
            # Check if user exists
            response = self.make_admin_request(
                "GET", f"/{self.realm_name}/users?username={user_config['username']}"
            )
            if response.status_code == 200 and response.json():
                print(f"✅ User '{user_config['username']}' already exists")
                continue

            # Create user
            user_data = {
                "username": user_config["username"],
                "email": user_config["email"],
                "firstName": user_config["firstName"],
                "lastName": user_config["lastName"],
                "enabled": True,
                "emailVerified": True,
            }

            response = self.make_admin_request(
                "POST", f"/{self.realm_name}/users", user_data
            )
            if response.status_code == 201:
                print(f"✅ Created user '{user_config['username']}'")

                # Get user ID from location header
                user_id = response.headers["Location"].split("/")[-1]

                # Set password
                password_data = {
                    "type": "password",
                    "value": user_config["password"],
                    "temporary": False,
                }

                pwd_response = self.make_admin_request(
                    "PUT",
                    f"/{self.realm_name}/users/{user_id}/reset-password",
                    password_data,
                )
                if pwd_response.status_code == 204:
                    print(f"✅ Set password for '{user_config['username']}'")

                # Add user to groups
                self.add_user_to_groups(user_id, user_config["groups"])

            else:
                print(
                    f"❌ Failed to create user '{user_config['username']}': {response.status_code}"
                )
                return False

        return True

    def add_user_to_groups(self, user_id: str, group_paths: list):
        """Add user to specified groups"""
        # Get all groups
        response = self.make_admin_request("GET", f"/{self.realm_name}/groups")
        if response.status_code != 200:
            print("❌ Failed to get groups")
            return

        all_groups = response.json()

        for group_path in group_paths:
            # Find group by path
            group_id = None
            for group in all_groups:
                if group.get("path") == group_path:
                    group_id = group["id"]
                    break

            if group_id:
                # Add user to group
                response = self.make_admin_request(
                    "PUT", f"/{self.realm_name}/users/{user_id}/groups/{group_id}", {}
                )
                if response.status_code == 204:
                    print(f"✅ Added user to group '{group_path}'")
                else:
                    print(
                        f"❌ Failed to add user to group '{group_path}': {response.status_code}"
                    )
            else:
                print(f"❌ Group '{group_path}' not found")

    def configure_group_mapper(self, client_uuid: str) -> bool:
        """Configure group membership mapper directly on the client."""
        print("⚙️  Configuring group mapper...")

        mapper_config = {
            "name": "groups",
            "protocol": "openid-connect",
            "protocolMapper": "oidc-group-membership-mapper",
            "consentRequired": False,
            "config": {
                "full.path": "true", # Use true for full path like /admin-group
                "id.token.claim": "true",
                "access.token.claim": "true",
                "claim.name": "groups",
                "userinfo.token.claim": "true",
            },
        }

        # The endpoint is now directly on the client
        response = self.make_admin_request(
            "POST",
            f"/{self.realm_name}/clients/{client_uuid}/protocol-mappers/models",
            mapper_config,
        )

        if response.status_code == 201:
            print("✅ Configured group membership mapper")
            return True
        elif response.status_code == 409: # 409 Conflict means it already exists
            print("✅ Group membership mapper already exists")
            return True
        else:
            print(f"❌ Failed to configure group mapper: {response.status_code}")
            print(f"Response: {response.text}")
            return False

    def configure_audience_mapper(self, client_uuid: str) -> bool:
        """Configure audience mapper directly on the client."""
        print("⚙️  Configuring audience mapper...")

        mapper_config = {
            "name": "weaviate-audience",
            "protocol": "openid-connect",
            "protocolMapper": "oidc-audience-mapper",
            "config": {
                "id.token.claim": "false",
                "access.token.claim": "true",
                "included.client.audience": self.client_id,
            },
        }

        # The endpoint is now directly on the client
        response = self.make_admin_request(
            "POST",
            f"/{self.realm_name}/clients/{client_uuid}/protocol-mappers/models",
            mapper_config,
        )

        if response.status_code == 201:
            print("✅ Configured audience mapper")
            return True
        elif response.status_code == 409: # 409 Conflict means it already exists
            print("✅ Audience mapper already exists")
            return True
        else:
            print(f"❌ Failed to configure audience mapper: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
    def setup_all(self) -> Optional[str]:
        """Run complete setup process"""
        print("🚀 AUTOMATED KEYCLOAK SETUP")
        print("=" * 50)

        # Get admin token
        if not self.get_admin_token():
            return None

        # Create realm
        if not self.create_realm():
            return None

        # Create client and get secret
        client_secret = self.create_client()
        if not client_secret:
            return None

        # Create groups
        if not self.create_groups():
            return None

        # Create users
        if not self.create_users():
            return None

        # Get client UUID for mapper configuration
        response = self.make_admin_request("GET", f"/{self.realm_name}/clients")
        client_uuid = None
        if response.status_code == 200:
            clients = response.json()
            for client in clients:
                if client.get("clientId") == self.client_id:
                    client_uuid = client["id"]
                    break

        if client_uuid:
            self.configure_group_mapper(client_uuid)
            self.configure_audience_mapper(client_uuid)

        print("\n🎉 KEYCLOAK SETUP COMPLETE!")
        print("=" * 50)
        print(f"🌐 Keycloak URL: {self.keycloak_url}")
        print(f"🏛️  Realm: {self.realm_name}")
        print(f"📱 Client ID: {self.client_id}")
        print(f"🔐 Client Secret: {client_secret}")
        print("\n👤 Test Users:")
        print("  - Username: test-admin, Password: password123")
        print("    Groups: /admin-group, /my-test-group")
        print("  - Username: test-viewer, Password: password123")
        print("    Groups: /viewer-group")

        return client_secret


def main():
    """Main function to run automated setup"""

    # Test multiple ports
    for port in [8081, 8082]:
        keycloak_url = f"http://localhost:{port}"
        print(f"Testing Keycloak at {keycloak_url}...")

        try:
            response = requests.get(keycloak_url, timeout=5)
            if response.status_code == 200:
                print(f"✅ Found Keycloak at {keycloak_url}")

                # Run automated setup
                setup = KeycloakSetup(keycloak_url)
                client_secret = setup.setup_all()

                if client_secret:
                    print(f"\n🔧 Your client secret for the Python script:")
                    print(f"   {client_secret}")
                    print(f"\n▶️  Now run your OIDC Python script!")
                    return
                else:
                    print("❌ Setup failed")
                    return

        except Exception as e:
            print(f"Cannot connect to {keycloak_url}: {e}")
            continue

    print("❌ Keycloak not found on ports 8081 or 8082")
    print("Make sure docker-compose is running!")


if __name__ == "__main__":
    main()
