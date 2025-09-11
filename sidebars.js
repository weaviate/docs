// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  getStartedSidebar: [
    {
      type: "doc",
      id: "weaviate/index",
      label: "Introduction",
    },
    {
      type: "category",
      label: "Quickstart",
      link: {
        type: "doc",
        id: "weaviate/quickstart/index",
      },
      items: ["weaviate/quickstart/local"],
    },
    {
      type: "link",
      label: "Installation",
      href: "https://docs.weaviate.io/deploy",
    },
    {
      type: "category",
      label: "Connect to Weaviate",
      link: {
        type: "doc",
        id: "weaviate/connections/index",
      },
      items: [
        "weaviate/connections/connect-cloud",
        "weaviate/connections/connect-local",
        "weaviate/connections/connect-custom",
        "weaviate/connections/connect-embedded",
        "weaviate/connections/connect-query",
      ],
    },
    {
      type: "category",
      label: "Starter guides",
      link: {
        type: "doc",
        id: "weaviate/starter-guides/index",
      },
      items: [
        "weaviate/starter-guides/which-weaviate",
        "weaviate/starter-guides/custom-vectors",
        "weaviate/starter-guides/generative",
        {
          type: "category",
          label: "Managing collections",
          link: {
            type: "doc",
            id: "weaviate/starter-guides/managing-collections/index",
          },
          items: [
            "weaviate/starter-guides/managing-collections/collections-scaling-limits",
          ],
        },
        {
          type: "category",
          label: "Managing resources (hot, warm, cold)",
          link: {
            type: "doc",
            id: "weaviate/starter-guides/managing-resources/index",
          },
          items: [
            "weaviate/starter-guides/managing-resources/compression",
            "weaviate/starter-guides/managing-resources/indexing",
            "weaviate/starter-guides/managing-resources/tenant-states",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Best practices",
      link: {
        type: "doc",
        id: "weaviate/best-practices/index",
      },
      items: []
    },
    {
      type: "category",
      label: "AI-based code generation",
      link: {
        type: "doc",
        id: "weaviate/best-practices/code-generation",
      },
      items: []
    }
  ],
  modelProvidersSidebar: [
    {
      type: "doc",
      id: "weaviate/model-providers/index",
      label: "Model provider integrations",
      //className: "sidebar-main-category",
    },
    {
      type: "category",
      label: "API-based",
      collapsed: false,
      collapsible: false,
      className: "sidebar-item",
      items: [
        {
          type: "category",
          label: "Weaviate",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/weaviate/index",
          },
          items: ["weaviate/model-providers/weaviate/embeddings"],
        },
        {
          type: "category",
          label: "Anthropic",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/anthropic/index",
          },
          items: ["weaviate/model-providers/anthropic/generative"],
        },
        {
          type: "category",
          label: "Anyscale",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/anyscale/index",
          },
          items: ["weaviate/model-providers/anyscale/generative"],
        },
        {
          type: "category",
          label: "AWS",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/aws/index",
          },
          items: [
            "weaviate/model-providers/aws/embeddings",
            "weaviate/model-providers/aws/generative",
          ],
        },
        {
          type: "category",
          label: "Cohere",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/cohere/index",
          },
          items: [
            "weaviate/model-providers/cohere/embeddings",
            "weaviate/model-providers/cohere/embeddings-multimodal",
            "weaviate/model-providers/cohere/generative",
            "weaviate/model-providers/cohere/reranker",
          ],
        },
        {
          type: "category",
          label: "Databricks",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/databricks/index",
          },
          items: [
            "weaviate/model-providers/databricks/embeddings",
            "weaviate/model-providers/databricks/generative",
          ],
        },
        {
          type: "category",
          label: "FriendliAI",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/friendliai/index",
          },
          items: ["weaviate/model-providers/friendliai/generative"],
        },
        {
          type: "category",
          label: "Google",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/google/index",
          },
          items: [
            "weaviate/model-providers/google/embeddings",
            "weaviate/model-providers/google/embeddings-multimodal",
            "weaviate/model-providers/google/generative",
          ],
        },
        {
          type: "category",
          label: "Hugging Face",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/huggingface/index",
          },
          items: ["weaviate/model-providers/huggingface/embeddings"],
        },
        {
          type: "category",
          label: "JinaAI",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/jinaai/index",
          },
          items: [
            "weaviate/model-providers/jinaai/embeddings",
            "weaviate/model-providers/jinaai/embeddings-colbert",
            "weaviate/model-providers/jinaai/embeddings-multimodal",
            "weaviate/model-providers/jinaai/reranker",
          ],
        },
        {
          type: "category",
          label: "Mistral",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/mistral/index",
          },
          items: [
            "weaviate/model-providers/mistral/embeddings",
            "weaviate/model-providers/mistral/generative",
          ],
        },
        {
          type: "category",
          label: "NVIDIA",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/nvidia/index",
          },
          items: [
            "weaviate/model-providers/nvidia/embeddings",
            "weaviate/model-providers/nvidia/embeddings-multimodal",
            "weaviate/model-providers/nvidia/generative",
            "weaviate/model-providers/nvidia/reranker",
          ],
        },
        {
          type: "category",
          label: "OctoAI (deprecated)",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/octoai/index",
          },
          items: [
            "weaviate/model-providers/octoai/embeddings",
            "weaviate/model-providers/octoai/generative",
          ],
        },
        {
          type: "category",
          label: "OpenAI",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/openai/index",
          },
          items: [
            "weaviate/model-providers/openai/embeddings",
            "weaviate/model-providers/openai/generative",
          ],
        },
        {
          type: "category",
          label: "OpenAI Azure",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/openai-azure/index",
          },
          items: [
            "weaviate/model-providers/openai-azure/embeddings",
            "weaviate/model-providers/openai-azure/generative",
          ],
        },
        {
          type: "category",
          label: "VoyageAI",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/voyageai/index",
          },
          items: [
            "weaviate/model-providers/voyageai/embeddings",
            "weaviate/model-providers/voyageai/embeddings-multimodal",
            "weaviate/model-providers/voyageai/reranker",
          ],
        },
        {
          type: "category",
          label: "xAI",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/xai/index",
          },
          items: ["weaviate/model-providers/xai/generative"],
        },
      ],
    },
    {
      type: "category",
      label: "Locally hosted",
      collapsed: false,
      collapsible: false,
      className: "sidebar-item",
      items: [
        {
          type: "category",
          label: "GPT4All",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/gpt4all/index",
          },
          items: ["weaviate/model-providers/gpt4all/embeddings"],
        },
        {
          type: "category",
          label: "Hugging Face",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/transformers/index",
          },
          items: [
            "weaviate/model-providers/transformers/embeddings",
            "weaviate/model-providers/transformers/embeddings-custom-image",
            "weaviate/model-providers/transformers/embeddings-multimodal",
            "weaviate/model-providers/transformers/embeddings-multimodal-custom-image",
            "weaviate/model-providers/transformers/reranker",
          ],
        },
        {
          type: "category",
          label: "KubeAI",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/kubeai/index",
          },
          items: [
            "weaviate/model-providers/kubeai/embeddings",
            "weaviate/model-providers/kubeai/generative",
          ],
        },
        {
          type: "category",
          label: "Meta ImageBind",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/imagebind/index",
          },
          items: ["weaviate/model-providers/imagebind/embeddings-multimodal"],
        },
        {
          type: "category",
          label: "Model2Vec",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/model2vec/index",
          },
          items: ["weaviate/model-providers/model2vec/embeddings"],
        },
        {
          type: "category",
          label: "Ollama",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/model-providers/ollama/index",
          },
          items: [
            "weaviate/model-providers/ollama/embeddings",
            "weaviate/model-providers/ollama/generative",
          ],
        },
      ],
    },
  ],
  conceptsSidebar: [
    {
      type: "autogenerated",
      dirName: "weaviate/concepts",
    },
  ],
  guidesSidebar: [
    {
      type: "doc",
      id: "weaviate/guides",
      label: "Overview",
    },
    {
      type: "category",
      label: "How-to: Configure Weaviate",
      link: {
        type: "doc",
        id: "weaviate/configuration/index",
      },
      items: [
        "weaviate/configuration/authz-authn",
        {
          type: "category",
          label: "Compression",
          link: {
            type: "doc",
            id: "weaviate/configuration/compression/index",
          },
          items: [
            "weaviate/configuration/compression/pq-compression",
            "weaviate/configuration/compression/bq-compression",
            "weaviate/configuration/compression/rq-compression",
            "weaviate/configuration/compression/sq-compression",
            "weaviate/configuration/compression/multi-vectors",
          ],
        },
        "weaviate/configuration/hnsw-snapshots",
        "weaviate/configuration/modules",
        {
          type: "category",
          label: "RBAC",
          link: {
            type: "doc",
            id: "weaviate/configuration/rbac/index",
          },
          items: [
            "weaviate/configuration/rbac/manage-roles",
            "weaviate/configuration/rbac/manage-users",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "How-to: Manage collections",
      link: {
        type: "doc",
        id: "weaviate/manage-collections/index",
      },
      items: [
        "weaviate/manage-collections/collection-operations",
        "weaviate/manage-collections/vector-config",
        "weaviate/manage-collections/generative-reranker-models",
        {
          type: "category",
          label: "Multi-tenancy",
          link: {
            type: "doc",
            id: "weaviate/manage-collections/multi-tenancy",
          },
          items: ["weaviate/manage-collections/tenant-states"],
        },
        "weaviate/manage-collections/collection-aliases",
        "weaviate/manage-collections/multi-node-setup",
        "weaviate/manage-collections/migrate",
        "weaviate/manage-collections/cross-references",
      ],
    },
    {
      type: "category",
      label: "How-to: Manage objects",
      link: {
        type: "doc",
        id: "weaviate/manage-objects/index",
      },
      items: [
        "weaviate/manage-objects/create",
        "weaviate/manage-objects/import",
        "weaviate/manage-objects/read",
        "weaviate/manage-objects/read-all-objects",
        "weaviate/manage-objects/update",
        "weaviate/manage-objects/delete",
      ],
    },
    {
      type: "category",
      label: "How-to: Query & Search",
      link: {
        type: "doc",
        id: "weaviate/search/index",
      },
      items: [
        "weaviate/search/basics",
        "weaviate/search/similarity",
        "weaviate/search/bm25",
        "weaviate/search/hybrid",
        "weaviate/search/image",
        "weaviate/search/multi-vector",
        "weaviate/search/generative",
        "weaviate/search/rerank",
        "weaviate/search/aggregate",
        "weaviate/search/filters",
      ],
    },
    {
      type: "category",
      label: "Tutorials",
      link: {
        type: "doc",
        id: "weaviate/tutorials/index",
      },
      items: [
        "weaviate/tutorials/multi-vector-embeddings",
        //"weaviate/tutorials/import",
        "weaviate/tutorials/cross-references",
        //"weaviate/tutorials/vector-provision-options",
        //"weaviate/tutorials/query",
        //"weaviate/tutorials/wikipedia",
        "weaviate/tutorials/spark-connector",
        //"weaviate/tutorials/modules",
      ],
    },
  ],
  referenceSidebar: [
    {
      type: "category",
      label: "Configuration",
      className: "sidebar-main-category",
      collapsible: false,
      link: {
        type: "doc",
        id: "weaviate/config-refs/index",
      },
      items: [
        {
          type: "category",
          label: "Collection definition",
          className: "sidebar-item",
          collapsed: false,
          link: {
            type: "doc",
            id: "weaviate/config-refs/collections",
          },
          items: [
            {
              type: "doc",
              id: "weaviate/config-refs/indexing/vector-index",
              className: "sidebar-item",
            },
            {
              type: "doc",
              id: "weaviate/config-refs/indexing/inverted-index",
              className: "sidebar-item",
            },
          ],
        },
        {
          type: "doc",
          id: "weaviate/config-refs/datatypes",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "weaviate/config-refs/distances",
          className: "sidebar-item",
        },
        {
          type: "link",
          label: "Environment variables",
          href: "https://docs.weaviate.io/deploy/configuration/env-vars",
          className: "sidebar-item",
        },
      ],
    },
    {
      type: "html",
      value: "<hr class='sidebar-divider' />",
    },
    {
      type: "category",
      label: "Client libraries",
      collapsible: false,
      className: "sidebar-main-category",
      link: {
        type: "doc",
        id: "weaviate/client-libraries/index",
      },
      items: [
        {
          type: "category",
          label: "Python",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/client-libraries/python/index",
          },
          items: [
            "weaviate/client-libraries/python/async",
            "weaviate/client-libraries/python/notes-best-practices",
            {
              type: "link",
              label: "Reference manual",
              href: "https://weaviate-python-client.readthedocs.io/en/stable/index.html",
            },
          ],
        },
        {
          type: "category",
          label: "JavaScript/TypeScript",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/client-libraries/typescript/index",
          },
          items: [
            "weaviate/client-libraries/typescript/notes-best-practices",
            {
              type: "link",
              label: "Reference manual",
              href: "https://weaviate.github.io/typescript-client/index.html",
            },
          ],
        },
        {
          type: "doc",
          id: "weaviate/client-libraries/java",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "weaviate/client-libraries/go",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "weaviate/client-libraries/community",
          className: "sidebar-item",
        },
      ],
    },
    // API section with divider
    {
      type: "html",
      value: "<hr class='sidebar-divider' />",
    },
    {
      type: "category",
      label: "APIs",
      className: "sidebar-main-category",
      link: {
        type: "doc",
        id: "weaviate/api/index",
      },
      collapsible: false,
      items: [
        {
          type: "doc",
          id: "weaviate/api/rest",
          label: "RESTful API",
          className: "sidebar-item",
        },
        {
          type: "category",
          label: "Search API - GraphQL/gRPC",
          className: "sidebar-item",
          link: {
            type: "doc",
            id: "weaviate/api/graphql/index",
          },
          items: [
            "weaviate/api/graphql/get",
            "weaviate/api/graphql/aggregate",
            "weaviate/api/graphql/search-operators",
            "weaviate/api/graphql/filters",
            "weaviate/api/graphql/additional-operators",
            "weaviate/api/graphql/additional-properties",
            "weaviate/api/graphql/explore",
          ],
        },
        {
          type: "doc",
          id: "weaviate/api/grpc",
          label: "gRPC",
          className: "sidebar-item",
        },
      ],
    },
  ],
  weaviateRecipesSidebar: [
    {
      type: "category",
      label: "Recipes",
      link: {
        type: "doc",
        id: "weaviate/recipes",
      },
      items: [
        {
          type: "autogenerated",
          dirName: "weaviate/recipes", // Scans the folder docs/weaviate/recipes/
        },
      ],
    },
  ],
  othersSidebar: [
    {
      type: "category",
      label: "Releases",
      link: {
        type: "doc",
        id: "weaviate/release-notes/index",
      },
      items: [],
    },
    {
      type: "category",
      label: "Benchmarks",
      link: {
        type: "doc",
        id: "weaviate/benchmarks/index",
      },
      items: ["weaviate/benchmarks/ann"],
    },
    {
      type: "category",
      label: "Modules",
      link: {
        type: "doc",
        id: "weaviate/modules/index",
      },
      items: [
        "weaviate/modules/text2vec-contextionary",
        "weaviate/modules/ref2vec-centroid",
        "weaviate/modules/qna-transformers",
        "weaviate/modules/qna-openai",
        "weaviate/modules/ner-transformers",
        "weaviate/modules/spellcheck",
        "weaviate/modules/sum-transformers",
        "weaviate/modules/custom-modules",
        "weaviate/modules/usage-modules",
      ],
    },
    "weaviate/more-resources/faq",
    "weaviate/more-resources/glossary",
    "weaviate/more-resources/example-datasets",
  ],
  deploySidebar: [
    {
      type: "category",
      label: "Installation",
      className: "sidebar-main-category",
      collapsible: false,
      collapsed: false,
      link: {
        type: "doc",
        id: "deploy/index",
      },
      items: [
        {
          type: "doc",
          id: "deploy/installation-guides/weaviate-cloud",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/installation-guides/docker-installation",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/installation-guides/k8s-installation",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/installation-guides/embedded",
          className: "sidebar-item",
        },
        {
          type: "html",
          value: "<hr class='sidebar-divider' />",
        },
      ],
    },
    {
      type: "category",
      label: "AWS",
      className: "sidebar-main-category",
      collapsible: true,
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "deploy/installation-guides/aws-marketplace",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/installation-guides/eks-marketplace",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/installation-guides/ecs-marketplace",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/installation-guides/eks",
          className: "sidebar-item",
        },
      ],
    },
    {
      type: "html",
      value: "<hr class='sidebar-divider' />",
    },
    {
      type: "category",
      label: "GCP",
      className: "sidebar-main-category",
      collapsible: true,
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "deploy/installation-guides/gcp-marketplace",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/installation-guides/gke-marketplace",
          className: "sidebar-item",
        },
      ],
    },
  ],
  deployConfigSidebar: [
    {
      type: "category",
      label: "Configuration Guides",
      className: "sidebar-main-category",
      collapsible: false,
      link: {
        type: "doc",
        id: "deploy/configuration/index",
      },
      items: [
        {
          type: "doc",
          id: "deploy/configuration/backups",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/configuration/horizontal-scaling",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/configuration/monitoring",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/configuration/persistence",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/configuration/status",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/configuration/telemetry",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/configuration/tenant-offloading",
          className: "sidebar-item",
        },
      ],
    },
    {
      type: "html",
      value: "<hr class='sidebar-divider' />",
    },
    {
      type: "category",
      label: "Authorization and authentication",
      className: "sidebar-main-category",
      items: [
        {
          type: "doc",
          id: "deploy/configuration/authentication",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/configuration/authorization",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/configuration/oidc",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/configuration/configuring-rbac",
          className: "sidebar-item",
        },
      ],
    },
    {
      type: "html",
      value: "<hr class='sidebar-divider' />",
    },
    {
      type: "category",
      label: "Replication",
      className: "sidebar-main-category",
      items: [
        {
          type: "doc",
          id: "deploy/configuration/replication",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/configuration/async-rep",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/configuration/replica-movement",
          className: "sidebar-item",
        },
      ],
    },
    {
      type: "html",
      value: "<hr class='sidebar-divider' />",
    },
    {
      type: "category",
      label: "Environment variables",
      className: "sidebar-main-category",
      items: [
        {
          type: "doc",
          id: "deploy/configuration/env-vars/index",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/configuration/env-vars/runtime-config",
          className: "sidebar-item",
        },
      ],
    },
    {
      type: "html",
      value: "<hr class='sidebar-divider' />",
    },
    {
      type: "category",
      label: "Cluster information",
      className: "sidebar-main-category",
      items: [
        {
          type: "doc",
          id: "deploy/configuration/meta",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "deploy/configuration/nodes",
          className: "sidebar-item",
        },
      ],
    },
  ],
  deployProductionSidebar: [
    {
      type: "autogenerated",
      dirName: "deploy/production",
    },
  ],
  deployTutorialSidebar: [
    {
      type: "doc",
      label: "RBAC",
      id: "deploy/tutorials/rbac",
    },
  ],
  deployFaqsSidebar: [
    {
      type: "autogenerated",
      dirName: "deploy/faqs",
    },
  ],
  deployMigrationSidebar: [
    {
      type: "autogenerated",
      dirName: "deploy/migration",
    },
  ],
  agentsSidebar: [
    {
      type: "doc",
      id: "agents/index",
    },
    {
      type: "html",
      value: "<hr class='sidebar-divider' />",
    },
    {
      type: "category",
      label: "Query Agent",
      className: "sidebar-main-category",
      collapsible: false,
      collapsed: false,
      link: {
        type: "doc",
        id: "agents/query/index",
      },
      items: [
        {
          type: "doc",
          id: "agents/query/usage",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "agents/query/tutorial-ecommerce",
          className: "sidebar-item",
        },
      ],
    },
    {
      type: "html",
      value: "<hr class='sidebar-divider' />",
    },
    {
      type: "category",
      label: "Transformation Agent",
      className: "sidebar-main-category",
      collapsible: false,
      collapsed: false,
      link: {
        type: "doc",
        id: "agents/transformation/index",
      },
      items: [
        {
          type: "doc",
          id: "agents/transformation/usage",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "agents/transformation/tutorial-enrich-dataset",
          className: "sidebar-item",
        },
      ],
    },
    {
      type: "html",
      value: "<hr class='sidebar-divider' />",
    },
    {
      type: "category",
      label: "Personalization Agent",
      className: "sidebar-main-category",
      collapsible: false,
      collapsed: false,
      link: {
        type: "doc",
        id: "agents/personalization/index",
      },
      items: [
        {
          type: "doc",
          id: "agents/personalization/usage",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "agents/personalization/tutorial-recipe-recommender",
          className: "sidebar-item",
        },
      ],
    },
  ],
  agentsRecipesSidebar: [
    {
      type: "category",
      label: "Recipes",
      collapsed: false,
      collapsible: false,
      link: {
        type: "doc",
        id: "agents/recipes",
      },
      items: [
        {
          type: "autogenerated",
          dirName: "agents/recipes", // Scans the folder docs/weaviate/recipes/
        },
      ],
    },
  ],
  academySidebar: [
    {
      type: "autogenerated",
      dirName: "academy",
    },
  ],
  contributorSidebar: [
    {
      type: "category",
      label: "Contributor guide",
      link: {
        type: "doc",
        id: "contributor-guide/index",
      },
      collapsed: false,
      items: [
        "contributor-guide/getting-started/suggesting-enhancements",
        "contributor-guide/getting-started/reporting-bugs",
      ],
    },
    {
      type: "html",
      value: "<hr class='sidebar-divider' />",
    },
    {
      type: "category",
      label: "Weaviate Database",
      link: {
        type: "doc",
        id: "contributor-guide/weaviate-core/index",
      },
      items: [
        "contributor-guide/weaviate-core/structure",
        "contributor-guide/weaviate-core/cicd",
        "contributor-guide/weaviate-core/tests",
        "contributor-guide/weaviate-core/setup",
        "contributor-guide/weaviate-core/parsing-cross-refs",
        "contributor-guide/weaviate-core/support-new-runtime-configs",
      ],
    },
    {
      type: "category",
      label: "Weaviate Docs",
      link: {
        type: "doc",
        id: "contributor-guide/weaviate-docs/index",
      },
      items: [
        "contributor-guide/weaviate-docs/development",
        "contributor-guide/weaviate-docs/style-guide",
        "contributor-guide/weaviate-docs/llms",
      ],
    },
    {
      type: "doc",
      id: "contributor-guide/weaviate-clients/index",
      label: "Weaviate Clients",
    },
    {
      type: "category",
      label: "Weaviate Modules",
      link: {
        type: "doc",
        id: "contributor-guide/weaviate-modules/index",
      },
      items: [
        "contributor-guide/weaviate-modules/architecture",
        "contributor-guide/weaviate-modules/how-to-build-a-new-module",
      ],
    },
  ],
  cloudSidebar: [
    {
      type: "doc",
      id: "cloud/index",
      label: "Overview",
    },
    {
      type: "doc",
      id: "cloud/quickstart",
      label: "Quickstart",
    },
    {
      type: "html",
      value: "<hr class='sidebar-divider' />",
    },
    {
      type: "category",
      label: "Manage a cluster",
      className: "sidebar-main-category",
      collapsible: false,
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "cloud/manage-clusters/connect",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "cloud/manage-clusters/create",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "cloud/manage-clusters/status",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "cloud/manage-clusters/upgrade",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "cloud/manage-clusters/authentication",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "cloud/manage-clusters/authorization",
          className: "sidebar-item",
        },
      ],
    },
    {
      type: "html",
      value: "<hr class='sidebar-divider' />",
    },
    {
      type: "category",
      label: "Agents",
      className: "sidebar-main-category",
      collapsible: false,
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "cloud/tools/query-agent",
          className: "sidebar-item",
        },
      ],
    },
    {
      type: "html",
      value: "<hr class='sidebar-divider' />",
    },
    {
      type: "category",
      label: "Tools",
      className: "sidebar-main-category",
      collapsible: false,
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "cloud/tools/import-tool",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "cloud/tools/collections-tool",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "cloud/tools/explorer-tool",
          className: "sidebar-item",
        },
        {
          type: "doc",
          id: "cloud/tools/query-tool",
          className: "sidebar-item",
        },
      ],
    },
    {
      type: "html",
      value: "<hr class='sidebar-divider' />",
    },
    {
      type: "doc",
      id: "cloud/faq",
      label: "FAQ",
    },
  ],
  cloudWeaviateEmbeddings: [
    "cloud/embeddings/index",
    "cloud/embeddings/quickstart",
    "cloud/embeddings/models",
    "cloud/embeddings/administration",
  ],
  cloudAccountManagementSidebar: [
    "cloud/platform/billing",
    "cloud/platform/support-levels",
    "cloud/platform/version",
    "cloud/platform/create-account",
    "cloud/platform/multi-factor-auth",
    "cloud/platform/users-and-organizations",
  ],
  integrationsSidebar: [
    "integrations/index",
    {
      type: "category",
      label: "Cloud Hyperscalers",
      link: {
        type: "doc",
        id: "integrations/cloud-hyperscalers/index",
      },
      items: [
        "integrations/cloud-hyperscalers/aws/index",
        "integrations/cloud-hyperscalers/google/index",
      ],
    },
    {
      type: "category",
      label: "Compute Infrastructure",
      link: {
        type: "doc",
        id: "integrations/compute-infrastructure/index",
      },
      items: [
        "integrations/compute-infrastructure/modal/index",
        "integrations/compute-infrastructure/replicate/index",
        "integrations/compute-infrastructure/replicated/index"
      ],
    },
    {
      type: "category",
      label: "Data Platforms",
      link: {
        type: "doc",
        id: "integrations/data-platforms/index",
      },
      items: [
        "integrations/data-platforms/airbyte/index",
        "integrations/data-platforms/aryn/index",
        "integrations/data-platforms/astronomer/index",
        "integrations/data-platforms/boomi/index",
        "integrations/data-platforms/box/index",
        "integrations/data-platforms/confluent/index",
        "integrations/data-platforms/context-data/index",
        "integrations/data-platforms/databricks/index",
        "integrations/data-platforms/firecrawl/index",
        "integrations/data-platforms/ibm/index",
        "integrations/data-platforms/unstructured/index",
      ],
    },
    {
      type: "category",
      label: "LLM and Agent Frameworks",
      link: {
        type: "doc",
        id: "integrations/llm-agent-frameworks/index",
      },
      items: [
        "integrations/llm-agent-frameworks/agno/index",
        "integrations/llm-agent-frameworks/composio/index",
        "integrations/llm-agent-frameworks/crewai/index",
        "integrations/llm-agent-frameworks/dspy/index",
        "integrations/llm-agent-frameworks/dynamiq/index",
        "integrations/llm-agent-frameworks/haystack/index",
        "integrations/llm-agent-frameworks/langchain/index",
        "integrations/llm-agent-frameworks/llamaindex/index",
        "integrations/llm-agent-frameworks/n8n/index",
        "integrations/llm-agent-frameworks/semantic-kernel/index",
      ],
    },
    {
      type: "category",
      label: "Operations",
      link: {
        type: "doc",
        id: "integrations/operations/index",
      },
      items: [
        "integrations/operations/arize/index",
        "integrations/operations/deepeval/index",
        "integrations/operations/langtrace/index",
        "integrations/operations/langwatch/index",
        "integrations/operations/nomic/index",
        "integrations/operations/ragas/index",
        "integrations/operations/wandb/index",
      ],
    },
  ],
  integrationsRecipesSidebar: [
    {
      type: "category",
      label: "Recipes",
      link: {
        type: "doc",
        id: "integrations/recipes",
      },
      items: [
        {
          type: "autogenerated",
          dirName: "integrations/recipes",
        },
      ],
    },
  ],
};

module.exports = sidebars;
