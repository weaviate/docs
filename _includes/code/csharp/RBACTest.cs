using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Weaviate.Client.Models;
using Xunit;

namespace Weaviate.Client.Tests.RBAC;

public class RBACTest : IAsyncLifetime
{
    private WeaviateClient client;
    private const string RootUserKey = "root-user-key";

    public async Task InitializeAsync()
    {
        // START AdminClient
        // Connect to Weaviate as root user
        client = await Connect.Local(
            restPort: 8580,
            grpcPort: 50551,
            credentials: RootUserKey
        );
        // END AdminClient

        await Cleanup();
    }

    public Task DisposeAsync()
    {
        // C# client manages resources automatically, but we can run cleanup
        return Cleanup();
    }

    private async Task Cleanup()
    {
        // Clean up all test roles
        var builtInRoles = new List<string> { "admin", "root", "viewer", "read-only" };
        var allRoles = await client.Roles.ListAll();

        foreach (var role in allRoles)
        {
            if (!builtInRoles.Contains(role.Name))
            {
                await client.Roles.Delete(role.Name);
            }
        }

        // Clean up all test users
        var allUsers = await client.Users.Db.List();
        foreach (var user in allUsers)
        {
            if (user.UserId != "root-user")
            {
                await client.Users.Db.Delete(user.UserId);
            }
        }
    }

    [Fact]
    public async Task TestRolePermissionTypes()
    {
        // START AddManageRolesPermission
        var rolesPermissions = new PermissionScope[]
        {
            new Permissions.Roles("testRole*", RolesScope.Match) // Only allow role management with the current user's permission level
            {
                Create = true, // Allow creating roles
                Read = true,   // Allow reading roles
                Update = true, // Allow updating roles
                Delete = true  // Allow deleting roles
            }
        };

        await client.Roles.Create("testRole_ManageRoles", rolesPermissions);
        // END AddManageRolesPermission
        Assert.NotNull(await client.Roles.Get("testRole_ManageRoles"));


        // START AddManageUsersPermission
        var usersPermissions = new PermissionScope[]
        {
            new Permissions.Users("testUser*") // Applies to all users starting with "testUser"
            {
                Create = true, // Allow creating users
                Read = true,   // Allow reading user info
                Update = true, // Allow rotating user API key
                Delete = true, // Allow deleting users
                AssignAndRevoke = true // Allow assigning and revoking roles to and from users
            }
        };

        await client.Roles.Create("testRole_ManageUsers", usersPermissions);
        // END AddManageUsersPermission
        Assert.NotNull(await client.Roles.Get("testRole_ManageUsers"));


        // START AddCollectionsPermission
        var collectionsPermissions = new PermissionScope[]
        {
            new Permissions.Collections("TargetCollection*") // Applies to all collections starting with "TargetCollection"
            {
                Create = true, // Allow creating new collections
                Read = true,   // Allow reading collection info/metadata
                Update = true, // Allow updating collection configuration
                Delete = true  // Allow deleting collections
            }
        };

        await client.Roles.Create("testRole_ManageCollections", collectionsPermissions);
        // END AddCollectionsPermission
        Assert.NotNull(await client.Roles.Get("testRole_ManageCollections"));


        // START AddTenantPermission
        var tenantsPermissions = new PermissionScope[]
        {
            new Permissions.Tenants("TargetCollection*", "TargetTenant*") // Applies to specified collections/tenants
            {
                Create = true, // Allow creating new tenants
                Read = true,   // Allow reading tenant info/metadata
                Update = true, // Allow updating tenant states
                Delete = true  // Allow deleting tenants
            }
        };

        await client.Roles.Create("testRole_ManageTenants", tenantsPermissions);
        // END AddTenantPermission
        Assert.NotNull(await client.Roles.Get("testRole_ManageTenants"));


        // START AddDataObjectPermission
        var dataPermissions = new PermissionScope[]
        {
            new Permissions.Data("TargetCollection*", "TargetTenant*") // Applies to all collections starting with "TargetCollection"
            {
                Create = true, // Allow data inserts
                Read = true,   // Allow query and fetch operations
                Update = true, // Allow data updates
                Delete = true  // Allow data deletes
            }
        };

        await client.Roles.Create("testRole_ManageData", dataPermissions);
        // END AddDataObjectPermission
        Assert.NotNull(await client.Roles.Get("testRole_ManageData"));


        // START AddBackupPermission
        var backupPermissions = new PermissionScope[]
        {
            new Permissions.Backups("TargetCollection*") // Applies to all collections starting with "TargetCollection"
            {
                Manage = true // Allow managing backups
            }
        };

        await client.Roles.Create("testRole_ManageBackups", backupPermissions);
        // END AddBackupPermission
        Assert.NotNull(await client.Roles.Get("testRole_ManageBackups"));


        // START AddClusterPermission
        var clusterPermissions = new PermissionScope[]
        {
            new Permissions.Cluster { Read = true } // Allow reading cluster data
        };

        await client.Roles.Create("testRole_ReadCluster", clusterPermissions);
        // END AddClusterPermission
        Assert.NotNull(await client.Roles.Get("testRole_ReadCluster"));


        // START AddNodesPermission
        var verbosePermissions = new PermissionScope[]
        {
            new Permissions.Nodes("TargetCollection*", NodeVerbosity.Verbose) // Applies to all collections starting with "TargetCollection"
            {
                Read = true // Allow reading node metadata
            }
        };

        await client.Roles.Create("testRole_ReadNodes", verbosePermissions);
        // END AddNodesPermission
        Assert.NotNull(await client.Roles.Get("testRole_ReadNodes"));


        // START AddAliasPermission
        var aliasPermissions = new PermissionScope[]
        {
            new Permissions.Alias("TargetCollection*", "TargetAlias*")
            {
                Create = true, // Allow alias creation
                Read = true,   // Allow listing aliases
                Update = true  // Allow updating aliases
                // Delete is false by default
            }
        };

        await client.Roles.Create("testRole_ManageAliases", aliasPermissions);
        // END AddAliasPermission
        Assert.NotNull(await client.Roles.Get("testRole_ManageAliases"));


        // START AddReplicationsPermission
        var replicatePermissions = new PermissionScope[]
        {
            new Permissions.Replicate("TargetCollection*", "TargetShard*")
            {
                Create = true, // Allow replica movement operations
                Read = true,   // Allow retrieving replication status
                Update = true  // Allow cancelling replication operations
                // Delete is false by default
            }
        };

        await client.Roles.Create("testRole_ManageReplicas", replicatePermissions);
        // END AddReplicationsPermission
        Assert.NotNull(await client.Roles.Get("testRole_ManageReplicas"));


        // START AddGroupsPermission
        var groupsPermissions = new PermissionScope[]
        {
            new Permissions.Groups("TargetGroup*", RbacGroupType.Oidc)
            {
                Read = true, // Allow reading group information
                AssignAndRevoke = true // Allow assigning and revoking group memberships
            }
        };

        await client.Roles.Create("testRole_ManageGroups", groupsPermissions);
        // END AddGroupsPermission
        Assert.NotNull(await client.Roles.Get("testRole_ManageGroups"));
    }

    [Fact]
    public async Task TestRoleLifecycle()
    {
        string testRole = "testRole";
        string testUser = "custom-user";

        var initialPermissions = new PermissionScope[]
        {
            new Permissions.Collections("TargetCollection*") { Read = true }
        };
        await client.Roles.Create(testRole, initialPermissions);

        // START AddRoles
        var additionalPermissions = new PermissionScope[]
        {
            new Permissions.Data("TargetCollection*", "TargetTenant*") { Create = true }
        };
        await client.Roles.AddPermissions(testRole, additionalPermissions);
        // END AddRoles

        // START CheckRoleExists
        // In C#, we check by attempting to get the role
        var retrievedRole = await client.Roles.Get(testRole);
        bool exists = retrievedRole != null;
        Console.WriteLine(exists);
        // END CheckRoleExists
        Assert.True(exists);

        // START InspectRole
        var testRoleData = await client.Roles.Get(testRole);
        Console.WriteLine(testRoleData);
        // END InspectRole
        Assert.NotNull(testRoleData);
        Assert.Equal(2, testRoleData.Permissions.Count());

        // Check for presence of specific permission types
        Assert.Contains(testRoleData.Permissions, p => p is Permissions.Collections { Read: true });
        Assert.Contains(testRoleData.Permissions, p => p is Permissions.Data { Create: true });

        await client.Users.Db.Create(testUser);
        await client.Users.Db.AssignRoles(testUser, new[] { testRole });

        // START AssignedUsers
        var assignedUsers = await client.Roles.GetUserAssignments(testRole);
        foreach (var assignment in assignedUsers)
        {
            Console.WriteLine(assignment.UserId);
        }
        // END AssignedUsers
        Assert.Contains(assignedUsers, a => a.UserId == testUser);

        // START ListAllRoles
        var allRoles = await client.Roles.ListAll();
        foreach (var role in allRoles)
        {
            Console.WriteLine($"{role.Name} {role}");
        }
        // END ListAllRoles
        Assert.Contains(allRoles, r => r.Name == testRole);

        // START RemovePermissions
        var permissionsToRemove = new PermissionScope[]
        {
            new Permissions.Collections("TargetCollection*") { Read = true },
            new Permissions.Data("TargetCollection*", "TargetTenant*") { Create = true }
        };
        await client.Roles.RemovePermissions(testRole, permissionsToRemove);
        // END RemovePermissions

        var roleAfterRemove = await client.Roles.Get(testRole);
        Assert.Empty(roleAfterRemove.Permissions);

        // START DeleteRole
        await client.Roles.Delete(testRole);
        // END DeleteRole

        // Assert role is gone (Get throws NotFound or returns null depending on implementation, assuming similar to Exists check)
        // Based on provided Integration tests, Get throws NotFound when deleted if wrapped, or we check List
        await Assert.ThrowsAsync<WeaviateNotFoundException>(async () => await client.Roles.Get(testRole));
    }

    [Fact]
    public async Task TestRoleExamples()
    {
        string testUser = "custom-user";
        await client.Users.Db.Create(testUser);

        // START ReadWritePermissionDefinition
        // Define permissions (example confers read+write rights to collections starting with "TargetCollection")
        var rwPermissions = new PermissionScope[]
        {
            // Collection level permissions
            new Permissions.Collections("TargetCollection*")
            {
                Create = true, // Allow creating new collections
                Read = true,   // Allow reading collection info/metadata
                Update = true, // Allow updating collection configuration
                Delete = true  // Allow deleting collections
            },
            // Collection data level permissions
            new Permissions.Data("TargetCollection*", "TargetTenant*")
            {
                Create = true, // Allow data inserts
                Read = true,   // Allow query and fetch operations
                Update = true, // Allow data updates
                Delete = true  // Allow data deletes
            },
            new Permissions.Backups("TargetCollection*") { Manage = true },
            new Permissions.Nodes("TargetCollection*", NodeVerbosity.Verbose) { Read = true },
            new Permissions.Cluster { Read = true }
        };

        // Create a new role
        await client.Roles.Create("rw_role", rwPermissions);
        // END ReadWritePermissionDefinition

        // START ReadWritePermissionAssignment
        // Assign the role to a user
        await client.Users.Db.AssignRoles(testUser, new[] { "rw_role" });
        // END ReadWritePermissionAssignment

        var userRoles = await client.Users.Db.GetRoles(testUser);
        Assert.Contains(userRoles, r => r.Name == "rw_role");
        await client.Users.Db.RevokeRoles(testUser, new[] { "rw_role" });

        // START ViewerPermissionDefinition
        // Define permissions (example confers viewer rights to collections starting with "TargetCollection")
        var viewerPermissions = new PermissionScope[]
        {
            new Permissions.Collections("TargetCollection*") { Read = true },
            new Permissions.Data("TargetCollection*", "TargetTenant*") { Read = true }
        };

        // Create a new role
        await client.Roles.Create("viewer_role", viewerPermissions);
        // END ViewerPermissionDefinition

        // START ViewerPermissionAssignment
        // Assign the role to a user
        await client.Users.Db.AssignRoles(testUser, new[] { "viewer_role" });
        // END ViewerPermissionAssignment

        userRoles = await client.Users.Db.GetRoles(testUser);
        Assert.Contains(userRoles, r => r.Name == "viewer_role");
        await client.Users.Db.RevokeRoles(testUser, new[] { "viewer_role" });

        // START MTPermissionsExample
        var mtPermissions = new PermissionScope[]
        {
            new Permissions.Tenants("TargetCollection*", "TargetTenant*")
            {
                Create = true, // Allow creating new tenants
                Read = true,   // Allow reading tenant info/metadata
                Update = true, // Allow updating tenant states
                Delete = true  // Allow deleting tenants
            },
            new Permissions.Data("TargetCollection*", "TargetTenant*")
            {
                Create = true, // Allow data inserts
                Read = true,   // Allow query and fetch operations
                Update = true, // Allow data updates
                Delete = true  // Allow data deletes
            }
        };

        // Create a new role
        await client.Roles.Create("tenant_manager", mtPermissions);
        // END MTPermissionsExample

        // START MTPermissionsAssignment
        // Assign the role to a user
        await client.Users.Db.AssignRoles(testUser, new[] { "tenant_manager" });
        // END MTPermissionsAssignment

        userRoles = await client.Users.Db.GetRoles(testUser);
        Assert.Contains(userRoles, r => r.Name == "tenant_manager");
    }

    [Fact]
    public async Task TestUserLifecycle()
    {
        string testUser = "custom-user";
        string testRole = "testRole";

        try
        {
            await client.Users.Db.Delete(testUser);
        }
        catch { /* ignore if not exists */ }

        // START CreateUser
        string userApiKey = await client.Users.Db.Create(testUser);
        Console.WriteLine(userApiKey);
        // END CreateUser
        Assert.False(string.IsNullOrEmpty(userApiKey));

        // START RotateApiKey
        string newApiKey = await client.Users.Db.RotateApiKey(testUser);
        Console.WriteLine(newApiKey);
        // END RotateApiKey
        Assert.False(string.IsNullOrEmpty(newApiKey));
        Assert.NotEqual(userApiKey, newApiKey);

        var permissions = new PermissionScope[]
        {
            new Permissions.Collections("TargetCollection*") { Read = true }
        };
        await client.Roles.Create(testRole, permissions);

        // START AssignRole
        await client.Users.Db.AssignRoles(testUser, new[] { testRole, "viewer" });
        // END AssignRole

        var roles = await client.Users.Db.GetRoles(testUser);
        var roleNames = roles.Select(r => r.Name).ToList();
        Assert.Contains(testRole, roleNames);
        Assert.Contains("viewer", roleNames);

        // START ListAllUsers
        var allUsers = await client.Users.Db.List();
        Console.WriteLine(string.Join(", ", allUsers.Select(u => u.UserId)));
        // END ListAllUsers
        Assert.Contains(allUsers, u => u.UserId == testUser);

        // START ListUserRoles
        var userRoles = await client.Users.Db.GetRoles(testUser);
        foreach (var role in userRoles)
        {
            Console.WriteLine(role.Name);
        }
        // END ListUserRoles
        var userRoleNames = userRoles.Select(r => r.Name).ToList();
        Assert.Contains(testRole, userRoleNames);
        Assert.Contains("viewer", userRoleNames);

        // START RevokeRoles
        await client.Users.Db.RevokeRoles(testUser, new[] { testRole });
        // END RevokeRoles

        roles = await client.Users.Db.GetRoles(testUser);
        roleNames = roles.Select(r => r.Name).ToList();
        Assert.DoesNotContain(testRole, roleNames);
        Assert.Contains("viewer", roleNames);

        // START DeleteUser
        await client.Users.Db.Delete(testUser);
        // END DeleteUser

        var usersAfterDelete = await client.Users.Db.List();
        Assert.DoesNotContain(usersAfterDelete, u => u.UserId == testUser);
    }
}