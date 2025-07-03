const siteRedirects = {
  redirects: [
    // Client library redirects
    {
      to: "/weaviate/client-libraries/typescript",
      from: "/weaviate/client-libraries/javascript",
    },

    // Configuration redirects
    {
      to: "/weaviate/concepts/filtering",
      from: "/weaviate/config-refs/schema/range-index",
    },
    {
      to: "/weaviate/config-refs/schema/vector-index",
      from: "/weaviate/configuration/indexes",
    },
    {
      to: "/weaviate/config-refs/schema/vector-index",
      from: "/weaviate/current/configuration/vector-index-type",
    },
    // Deployment redirects- Installation
    {
      to: "/deploy/installation-guides/docker-installation",
      from: "/weaviate/installation/docker-compose",
    },
    {
      to: "/deploy/installation-guides/k8s-installation",
      from: "/weaviate/installation/kubernetes",
    },
    // Deployment redirects- Configuration
    {
      to: "/deploy/configuration/configuring-rbac",
      from: "/weaviate/configuration/rbac/configuration",
    },
    {
      to: "/deploy/configuration/backups",
      from: "/weaviate/configuration/backups",
    },
    {
      to: "/deploy/configuration/authentication",
      from: "/weaviate/configuration/authentication",
    },
    {
      to: "/deploy/configuration/authorization",
      from: "/weaviate/configuration/authorization",
    },
    {
      to: "/deploy/configuration/persistence",
      from: "/weaviate/configuration/persistence",
    },
    {
      to: "/deploy/configuration/monitoring",
      from: "/weaviate/configuration/monitoring",
    },
    {
      to: "/deploy/configuration/replication",
      from: "/weaviate/configuration/replication",
    },
    {
      to: "/deploy/configuration/nodes",
      from: "/weaviate/config-refs/nodes",
    },
    {
      to: "/deploy/configuration/meta",
      from: "/weaviate/config-refs/meta",
    },
    {
      to: "/deploy/configuration/oidc",
      from: "/weaviate/config-refs/oidc",
    },
    {
      to: "/deploy/configuration/telemetry ",
      from: "/weaviate/config-refs/telemetry",
    },
    {
      to: "/deploy/configuration/status",
      from: "/weaviate/config-refs/status",
    },

    // Howto redirects
    {
      to: "/weaviate/manage-objects/read-all-objects",
      from: "/weaviate/manage-data/exhaustive-retrieval",
    },

    // Tutorial refresh 2024
    {
      to: "/weaviate/starter-guides/managing-collections",
      from: "/weaviate/tutorials/schema",
    },
    {
      to: "/weaviate/connections",
      from: "/weaviate/tutorials/connect",
    },
    {
      to: "/weaviate/connections",
      from: "/weaviate/starter-guides/connect",
    },

    // 2024.10 Rename "prefiltering" to "filtering"
    {
      to: "/weaviate/concepts/filtering",
      from: "/weaviate/concepts/prefiltering",
    },

    // Remove BPR page
    {
      to: "/weaviate/concepts/vector-index",
      from: "/weaviate/concepts/binary-passage-retrieval",
    },

    // =============================================================================================
    // END - 202409 Remove old module docs & redirect to model provider integration
    // =============================================================================================

    {
      to: "/cloud/tools/query-tool",
      from: "/weaviate/tutorials/console",
    },

    // References: API / GraphQL redirects
    {
      to: "/weaviate/api/graphql/search-operators",
      from: "/weaviate/api/graphql/vector-search-parameters",
    },

    // old link redirects
    {
      to: "/deploy/installation-guides",
      from: "/weaviate/current/getting-started/installation",
    },

    {
      to: "/weaviate/configuration/compression/pq-compression",
      from: "/weaviate/configuration/pq-compression",
    },

    {
      to: "/weaviate/configuration/compression/bq-compression",
      from: "/weaviate/configuration/bq-compression",
    },

    {
      to: "/weaviate/manage-collections",
      from: "/weaviate/manage-data/classes",
    },

    {
      to: "/weaviate/manage-collections",
      from: "/weaviate/configuration/schema-configuration",
    },

    // Restructured starter guides
    {
      to: "/weaviate/starter-guides/managing-collections",
      from: "/weaviate/starter-guides/schema",
    },

    // Redirects for Weaviate Core error messages
    {
      to: "/weaviate/starter-guides/managing-collections/collections-scaling-limits",
      from: "/collections-count-limit",
    },

    // Redirects for dynamic user support
    {
      to: "/weaviate/configuration/rbac/manage-roles",
      from: "/weaviate/configuration/rbac/manage-roles-users",
    },

    // Redirect for manage API keys page
    {
      to: "/cloud/manage-clusters/authentication",
      from: "/cloud/platform/manage-api-keys",
    },
  ],
};

module.exports = siteRedirects;
