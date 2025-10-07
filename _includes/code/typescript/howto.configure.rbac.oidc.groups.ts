import assert from "assert";
/**
 * OIDC Group Management Testing Script with Built-in Keycloak Setup Helper
 * Complete example of how to configure RBAC with OIDC groups in Weaviate
 */

import weaviate, { type WeaviateClient } from "weaviate-client";

const { permissions } = weaviate;

async function testKeycloakConnection(keycloakPorts = [8081]) {
    // Try keycloak hostname first (requires /etc/hosts mapping), then localhost
    const keycloakConfigs = [
        ['keycloak', 8081],  // This should match Weaviate's expected issuer
        ['localhost', 8081],  // Fallback for initial testing
    ];

    for (const [host, port] of keycloakConfigs) {
        const keycloakUrl = `http://${host}:${port}`;
        try {
            // First check if Keycloak is responding at all
            const response = await fetch(keycloakUrl, { 
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok) {
                console.log(`OK: Keycloak server found at ${keycloakUrl}`);

                // Check if master realm exists (always exists)
                const masterResponse = await fetch(
                    `${keycloakUrl}/realms/master`,
                    { signal: AbortSignal.timeout(5000) }
                );
                
                if (masterResponse.ok) {
                    console.log(`OK: Keycloak realms accessible`);

                    // Check if our test realm exists
                    const testResponse = await fetch(
                        `${keycloakUrl}/realms/weaviate-test`,
                        { signal: AbortSignal.timeout(5000) }
                    );
                    
                    if (testResponse.ok) {
                        console.log(`OK: weaviate-test realm found`);
                        console.log(`OK: weaviate-test realm accessible`);
                        return keycloakUrl;
                    } else {
                        console.log(
                            `Warning: weaviate-test realm not found - you'll need to create it`
                        );
                        return keycloakUrl;
                    }
                }
            }
        } catch (e) {
            console.log(`Testing ${keycloakUrl}: ${e.message}`);
            continue;
        }
    }

    console.log(`Error: Cannot connect to Keycloak`);
    console.log("Hint: Make sure you have '127.0.0.1 keycloak' in /etc/hosts");
    console.log("Hint: Run: echo '127.0.0.1 keycloak' | sudo tee -a /etc/hosts");
    return null;
}

/**
 * Get OIDC token from Keycloak for a user
 * @param {Object} params - Token request parameters
 * @returns {Promise<string|null>} Access token if successful, null otherwise
 */
async function getOidcToken({
    keycloakUrl,
    clientSecret,
    username,
    password = 'password123',
    realm = 'weaviate-test',
    clientId = 'weaviate'
}) {
    const tokenUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;

    const data = new URLSearchParams({
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username: username,
        password: password,
    });

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data,
            signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
            const tokenData = await response.json();
            console.log(`OK: Successfully got token for user: ${username}`);
            return tokenData.access_token;
        } else {
            const responseText = await response.text();
            console.log(`Error: Failed to get token for ${username}: ${response.status}`);
            
            if (response.status === 401) {
                console.log('   → Check username/password or client secret');
            } else if (response.status === 400) {
                console.log('   → Check client configuration (Direct Access Grants enabled?)');
            }
            console.log(`   → Response: ${responseText}`);
            return null;
        }
    } catch (e) {
        console.log(`Error: Error getting token for ${username}: ${e.message}`);
        return null;
    }
}

/**
 * Setup and validate OIDC connection
 * @returns {Promise<{clientSecret: string|null, keycloakUrl: string|null}>}
 */
async function setupAndValidateOidc() {
    console.log('KEYCLOAK OIDC SETUP VALIDATOR');
    console.log('='.repeat(50));

    // Test Keycloak connection
    console.log('Testing Keycloak connection...');
    const keycloakUrl = await testKeycloakConnection([8081]);
    
    if (!keycloakUrl) {
        console.log('Error: Keycloak not accessible!');
        console.log('\nTroubleshooting:');
        console.log(
            "1. Add keycloak to /etc/hosts: echo '127.0.0.1 keycloak' | sudo tee -a /etc/hosts"
        );
        console.log('2. Check if docker-compose is running: docker-compose ps');
        console.log('3. Check Keycloak logs: docker-compose logs keycloak');
        return { clientSecret: null, keycloakUrl: null };
    }

    // Check if weaviate-test realm exists
    let realmExists = false;
    try {
        const realmResponse = await fetch(
            `${keycloakUrl}/realms/weaviate-test`,
            { signal: AbortSignal.timeout(5000) }
        );
        realmExists = realmResponse.ok;
    } catch (e) {
        realmExists = false;
    }

    if (!realmExists) {
        console.log(`\nWarning: The 'weaviate-test' realm doesn't exist yet.`);
        console.log(
            'Please complete the Keycloak setup first with keycloak_helper_script.py, then run this script again.'
        );
        return { clientSecret: null, keycloakUrl: null };
    } else {
        console.log(`OK: weaviate-test realm accessible`);
        console.log('\n' + '-'.repeat(30));
        // Using a fixed secret for automated testing
        const clientSecret = 'weaviate-client-secret-123';
        console.log(`Using client secret: ${clientSecret}`);

        // Test tokens with the keycloak_url (which should be http://keycloak:8081)
        console.log(`\nTesting OIDC tokens...`);
        const adminToken = await getOidcToken({
            keycloakUrl,
            clientSecret,
            username: 'test-admin'
        });

        if (!adminToken) {
            console.log('\nError: Cannot get admin token. Please verify:');
            console.log("- User 'test-admin' exists with password 'password123'");
            console.log("- User is in groups like '/admin-group'");
            console.log("- Client 'weaviate' has 'Direct access grants' enabled");
            console.log('- Client secret is correct');
            return { clientSecret: null, keycloakUrl: null };
        }

        const viewerToken = await getOidcToken({
            keycloakUrl,
            clientSecret,
            username: 'test-viewer'
        });
        
        if (!viewerToken) {
            console.log('Warning: Viewer token failed, but continuing with admin token');
        }

        console.log('\nOK: OIDC setup validated successfully!');
        return { clientSecret, keycloakUrl };
    }
}

// Setup and validate OIDC first
const { clientSecret, keycloakUrl } = await setupAndValidateOidc();
    
if (!clientSecret || !keycloakUrl) {
    process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('STARTING OIDC GROUP MANAGEMENT TESTS');
console.log('='.repeat(60));

// The adminClient is used for setup and cleanup that requires root privileges
let adminClient: WeaviateClient;

// START AdminClient
// Connect to Weaviate as root user (for admin operations)
adminClient = await weaviate.connectToLocal({
    port: 8580,
    grpcPort: 50551,
    authCredentials: new weaviate.ApiKey("root-user-key"),
});
// END AdminClient

// Create test roles for group management
console.log("\nSetting up test roles...");
const groupPermissions = [
    permissions.collections({
        collection: "TargetCollection*", 
        read_config: true, 
        create_collection: true
    }),
    permissions.data({
        collection: "TargetCollection*", 
        read: true, 
        create: true
    }),
];

await adminClient.roles.delete("testRole");
await adminClient.roles.create("testRole", groupPermissions);

await adminClient.roles.delete("groupViewerRole");
await adminClient.roles.create(
    "groupViewerRole",
    permissions.data({ collection: "*", read: true })
);

console.log("\nADMIN OPERATIONS (Using API Key)");
console.log('-'.repeat(40));

// START AssignOidcGroupRoles
await adminClient.groups.oidc.assignRoles(
    "/admin-group", ["testRole", "viewer"]
);
// END AssignOidcGroupRoles
await adminClient.groups.oidc.assignRoles("/viewer-group", ["viewer"]);
await adminClient.groups.oidc.assignRoles(
    "/my-test-group", ["groupViewerRole"]
);

// START GetKnownOidcGroups
const knownGroups = await adminClient.groups.oidc.getKnownGroupNames();
console.log(`Known OIDC groups (${knownGroups.length}): ${knownGroups}`);
// END GetKnownOidcGroups
assert.strictEqual(knownGroups.length, 3, 'Expected 3 known groups');
assert.deepStrictEqual(
    new Set(knownGroups), 
    new Set(["/admin-group", "/viewer-group", "/my-test-group"]),
    'Known groups should match expected groups'
);

// START GetGroupAssignments
const groupAssignments = await adminClient.roles.getGroupAssignments("testRole");
console.log("Groups assigned to role 'testRole':");
for (const group of groupAssignments) {
    console.log(`  - Group ID: ${group.groupID}, Type: ${group.groupType}`);
}
// END GetGroupAssignments
assert.strictEqual(groupAssignments.length, 1, 'Expected 1 group assignment');
assert.strictEqual(groupAssignments[0].groupID, "/admin-group", 'Group ID should be /admin-group');

console.log(`\nOIDC USER OPERATIONS`);
console.log('='.repeat(60));

// Get tokens for different users using keycloak_url
// START GetOidcToken
const adminToken = await getOidcToken({
    keycloakUrl: keycloakUrl, 
    clientSecret: clientSecret, 
    username: "test-admin"
});
const viewerToken = await getOidcToken({
    keycloakUrl: keycloakUrl, 
    clientSecret: clientSecret, 
    username: "test-viewer"
});
// END GetOidcToken
assert.notStrictEqual(adminToken, null, 'Admin token should not be null');
assert.notStrictEqual(viewerToken, null, 'Viewer token should not be null');

// --- Admin User Tests ---
// START OidcAdminClient
// Connect as OIDC admin user
const oidcAdminClient = await weaviate.connectToLocal({
    port: 8580,
    grpcPort: 50551,
    authCredentials: new weaviate.AuthAccessTokenCredentials({
        accessToken: adminToken,
        expiresIn: 1000
    }) 
});
// END OidcAdminClient

// START GetCurrentUserRoles
const myUser = await oidcAdminClient.users.getMyUser();
const currentRolesList = myUser ? myUser.roles : [];
const roleNames = currentRolesList?.map(role => role.name);
console.log(`Admin user's current roles (${roleNames?.length}): ${roleNames}`);
// END GetCurrentUserRoles
assert.deepStrictEqual(
    new Set(roleNames), 
    new Set(["viewer", "testRole", "groupViewerRole"]),
    'Admin user should have expected roles'
);

// START GetOidcGroupRoles
const groupRoles = await oidcAdminClient.groups.oidc.getAssignedRoles(
    "/admin-group", true
);
console.log(`Roles assigned to '/admin-group': ${Object.keys(groupRoles)}`);
// END GetOidcGroupRoles
assert.deepStrictEqual(
    new Set(Object.keys(groupRoles)), 
    new Set(["testRole", "viewer"]),
    'Admin group should have expected roles'
);
await oidcAdminClient.close();

// --- Viewer User Tests ---
// START OidcViewerClient
// Connect as OIDC viewer user
const oidcViewerClient = await weaviate.connectToLocal({
    port: 8580,
    grpcPort: 50551,
    authCredentials: new weaviate.AuthAccessTokenCredentials({
        accessToken: viewerToken,
        expiresIn: 1000
    }),
});
// END OidcViewerClient

// START GetCurrentUserRolesViewer
const myNewUser = await oidcViewerClient.users.getMyUser();
const currentRolesList2 = myNewUser ? myNewUser.roles : [];
const roleNames2 = currentRolesList2?.map(role => role.name);
console.log(`Viewer user's current roles (${roleNames2?.length}): ${roleNames2}`);
// END GetCurrentUserRolesViewer
assert.strictEqual(roleNames2?.length, 1, 'Viewer should have 1 role');
assert.strictEqual(roleNames2[0], "viewer", 'Viewer should have viewer role');

// Viewer should have limited permissions but can still see group names
try {
    const viewerGroups = await oidcViewerClient.groups.oidc.getKnownGroupNames();
    console.log("Viewer can see groups:", viewerGroups);
    assert.deepStrictEqual(
        new Set(viewerGroups), 
        new Set(["/admin-group", "/viewer-group", "/my-test-group"]),
        'Viewer should see all groups'
    );
} catch (e) {
    // This part should not be reached if permissions are set correctly
    assert.fail(`Viewer user failed to access group operations: ${e}`);
}

await oidcViewerClient.close();

console.log("\nCLEANUP (Admin operations)");
console.log('-'.repeat(40));

// START RevokeOidcGroupRoles
await adminClient.groups.oidc.revokeRoles(
    "/admin-group", ["testRole", "viewer"]
);
// END RevokeOidcGroupRoles
await adminClient.groups.oidc.revokeRoles("/viewer-group", ["viewer"]);
await adminClient.groups.oidc.revokeRoles(
    "/my-test-group", ["groupViewerRole"]
);

// Verify cleanup
const finalGroups = await adminClient.groups.oidc.getKnownGroupNames();
console.log("Remaining known groups after cleanup:", finalGroups);
assert.strictEqual(finalGroups.length, 0, 'All groups should be cleaned up');

await adminClient.close();

console.log("\n" + '='.repeat(60));
console.log("OIDC GROUP MANAGEMENT TESTING COMPLETE!");
console.log('='.repeat(60));