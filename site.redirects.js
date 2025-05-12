const siteRedirects = {
  // fromExtensions: ['html', 'htm'],
  redirects: [
    {
      to: "/weaviate/release-notes",
      from: [
        "/weaviate/current/roadmap/index",
        "/weaviate/current/roadmap/architectural-roadmap",
        "/weaviate/current/roadmap/feature-roadmap",
      ],
    },
    {
      to: "/weaviate/concepts/data",
      from: "/weaviate/current/core-knowledge/basics",
    },
    {
      to: "/weaviate/concepts/vector-index",
      from: [
        "/weaviate/current/vector-index-plugins",
        "/weaviate/current/vector-index-plugins/hnsw",
      ],
    },
    {
      to: "/weaviate/client-libraries",
      from: "/weaviate/current/core-knowledge/clients",
    },
    {
      to: "/cloud/tools/query-tool",
      from: "/weaviate/current/core-knowledge/console",
    },
    {
      to: "/cloud/tools/query-tool",
      from: "/wcs/guides/console",
    },
    {
      to: "/cloud/manage-clusters/create",
      from: "/wcs/guides/create-instance",
    },
    {
      to: "/cloud/manage-clusters/connect",
      from: "/wcs/guides/authentication",
    },
    // Client library redirects
    {
      to: "/weaviate/client-libraries/typescript",
      from: "/weaviate/client-libraries/javascript",
    },

    // Config-refs redirects
    {
      to: "/weaviate/config-refs/datatypes",
      from: "/weaviate/configuration/datatypes",
    },
    {
      to: "/weaviate/config-refs/distances",
      from: "/weaviate/configuration/distances",
    },

    // Configuration redirects
    {
      to: "/weaviate/config-refs/datatypes",
      from: "/weaviate/current/schema/datatypes",
    },
    {
      to: "/weaviate/config-refs/distances",
      from: "/weaviate/current/vector-index-plugins/distances",
    },
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
    {
      to: "/weaviate/manage-collections",
      from: [
        "/weaviate/current/schema",
        "/weaviate/current/schema/schema-configuration",
      ],
    },

    // More-resources redirects
    {
      to: "/weaviate/more-resources/example-datasets",
      from: "/weaviate/current/tutorials/example-datasets",
    },
    {
      to: "/weaviate/more-resources/write-great-bug-reports",
      from: "/weaviate/current/tutorials/write-great-bug-reports",
    },
    {
      to: "/weaviate/",
      from: "/weaviate/current/more-resources/deprecation-messages",
    },
    {
      to: "/integrations/llm-agent-frameworks/dspy",
      from: "/weaviate/more-resources/dspy",
    },

    // Quickstart redirects
    {
      to: "/weaviate/starter-guides/managing-collections",
      from: "/weaviate/quickstart/schema",
    },
    {
      to: "/weaviate/tutorials/import",
      from: "/weaviate/quickstart/import",
    },
    {
      to: "/weaviate/tutorials/query",
      from: "/weaviate/quickstart/query",
    },
    {
      to: "/weaviate/tutorials/modules",
      from: "/weaviate/quickstart/modules",
    },
    {
      to: "/cloud/tools/query-tool",
      from: "/weaviate/quickstart/console",
    },

    // Old Quickstart redirects
    {
      to: "/weaviate/starter-guides/managing-collections",
      from: "/weaviate/current/quickstart/schema",
    },
    {
      to: "/weaviate/tutorials/import",
      from: "/weaviate/current/quickstart/import",
    },
    {
      to: "/weaviate/tutorials/query",
      from: "/weaviate/current/quickstart/query",
    },
    {
      to: "/weaviate/tutorials/modules",
      from: "/weaviate/current/quickstart/modules",
    },
    {
      to: "/cloud/tools/query-tool",
      from: "/weaviate/current/quickstart/console",
    },

    // WCD redirects
    {
      to: "/cloud/faq",
      from: "/wcs/troubleshooting",
    },
    {
      to: "/cloud/tools/query-tool",
      from: "/wcs/platform/ssconsole",
    },
    {
      to: "/cloud/manage-clusters/status",
      from: "/wcs/platform/cluster-status",
    },
    {
      to: "/cloud/tools/query-tool",
      from: "/wcs/console",
    },
    {
      to: "/cloud/manage-clusters/status",
      from: "/wcs/cluster-status",
    },
    {
      to: "/cloud/manage-clusters/connect",
      from: "/wcs/conect",
    },
    {
      to: "/cloud/manage-clusters/create",
      from: "/wcs/create-instance",
    },
    {
      to: "/cloud/manage-clusters/upgrade",
      from: "/wcs/upgrade",
    },
    // Tutorial redirects
    {
      to: "/weaviate/starter-guides/managing-collections",
      from: "/weaviate/current/tutorials/how-to-create-a-schema",
    },
    {
      to: "/weaviate/tutorials/query",
      from: "/weaviate/current/tutorials/how-to-query-data",
    },
    {
      to: "/weaviate/tutorials/query",
      from: "/weaviate/current/tutorials/how-to-perform-a-semantic-search",
    },
    {
      to: "/weaviate/tutorials/query",
      from: "/weaviate/current/tutorials/semantic-search-through-wikipedia",
    },
    {
      to: "/weaviate/tutorials",
      from: [
        "/weaviate/current/tutorials/how-to-do-classification",
        "/weaviate/current/tutorials/how-to-use-weaviate-without-modules",
        "/weaviate/current/tutorials/other-examples",
        "/weaviate/current/tutorials/quick-start-with-the-text2vec-contextionary-module",
      ],
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

    // REMOVE WHEN MODULE RENAMING IMPLEMENTED: Temp redirect.
    {
      to: "/weaviate/model-providers/google/generative",
      from: "/weaviate/modules/reader-generator-modules/generative-google",
    },
    {
      to: "/weaviate/model-providers/google/embeddings",
      from: "/weaviate/modules/retriever-vectorizer-modules/text2vec-google",
    },

    // =============================================================================================
    // 202409 Remove old module docs & redirect to model provider integration
    // =============================================================================================
    // API-based T2V modules
    {
      to: "/weaviate/model-providers/aws/embeddings",
      from: "/weaviate/modules/retriever-vectorizer-modules/text2vec-aws",
    },
    {
      to: "/weaviate/model-providers/cohere/embeddings",
      from: "/weaviate/modules/retriever-vectorizer-modules/text2vec-cohere",
    },
    {
      to: "/weaviate/model-providers/huggingface/embeddings",
      from: "/weaviate/modules/retriever-vectorizer-modules/text2vec-huggingface",
    },
    {
      to: "/weaviate/model-providers/jinaai/embeddings",
      from: "/weaviate/modules/retriever-vectorizer-modules/text2vec-jinaai",
    },
    {
      to: "/weaviate/model-providers/openai/embeddings",
      from: "/weaviate/modules/retriever-vectorizer-modules/text2vec-openai",
    },
    {
      to: "/weaviate/model-providers/google/embeddings",
      from: "/weaviate/modules/retriever-vectorizer-modules/text2vec-palm",
    },
    {
      to: "/weaviate/model-providers/voyageai/embeddings",
      from: "/weaviate/modules/retriever-vectorizer-modules/text2vec-voyageai",
    },
    // Local T2V modules
    {
      to: "/weaviate/model-providers/gpt4all/embeddings",
      from: "/weaviate/modules/retriever-vectorizer-modules/text2vec-gpt4all",
    },
    {
      to: "/weaviate/model-providers/ollama/embeddings",
      from: "/weaviate/modules/retriever-vectorizer-modules/text2vec-ollama",
    },
    {
      to: "/weaviate/model-providers/transformers/embeddings",
      from: "/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers",
    },
    // Other vectorizer modules
    {
      to: "/weaviate/model-providers/imagebind/embeddings-multimodal",
      from: "/weaviate/modules/retriever-vectorizer-modules/multi2vec-bind",
    },
    {
      to: "/weaviate/model-providers/transformers/embeddings-multimodal",
      from: "/weaviate/modules/retriever-vectorizer-modules/multi2vec-clip",
    },
    {
      to: "/weaviate/model-providers/google/embeddings-multimodal",
      from: "/weaviate/modules/retriever-vectorizer-modules/multi2vec-palm",
    },
    // Reranker modules
    {
      to: "/weaviate/model-providers/cohere/reranker",
      from: "/weaviate/modules/retriever-vectorizer-modules/reranker-cohere",
    },
    {
      to: "/weaviate/model-providers/voyageai/reranker",
      from: "/weaviate/modules/retriever-vectorizer-modules/reranker-voyageai",
    },
    {
      to: "/weaviate/model-providers/transformers/reranker",
      from: "/weaviate/modules/retriever-vectorizer-modules/reranker-transformers",
    },
    // Generative modules
    {
      to: "/weaviate/model-providers/anyscale/generative",
      from: "/weaviate/modules/reader-generator-modules/generative-anyscale",
    },
    {
      to: "/weaviate/model-providers/aws/generative",
      from: "/weaviate/modules/reader-generator-modules/generative-aws",
    },
    {
      to: "/weaviate/model-providers/cohere/generative",
      from: "/weaviate/modules/reader-generator-modules/generative-cohere",
    },
    {
      to: "/weaviate/model-providers/mistral/generative",
      from: "/weaviate/modules/reader-generator-modules/generative-mistral",
    },
    {
      to: "/weaviate/model-providers/ollama/generative",
      from: "/weaviate/modules/reader-generator-modules/generative-ollama",
    },
    {
      to: "/weaviate/model-providers/openai/generative",
      from: "/weaviate/modules/reader-generator-modules/generative-openai",
    },
    {
      to: "/weaviate/model-providers/google/generative",
      from: "/weaviate/modules/reader-generator-modules/generative-palm",
    },

    {
      to: "/weaviate/modules/custom-modules",
      from: "/weaviate/modules/other-modules/custom-modules",
    },
    {
      to: "/weaviate/modules/spellcheck",
      from: "/weaviate/modules/other-modules/spellcheck",
    },
    {
      to: "/weaviate/modules/ner-transformers",
      from: "/weaviate/modules/reader-generator-modules/ner-transformers",
    },
    {
      to: "/weaviate/modules/qna-transformers",
      from: "/weaviate/modules/reader-generator-modules/qna-transformers",
    },
    {
      to: "/weaviate/modules/sum-transformers",
      from: "/weaviate/modules/reader-generator-modules/sum-transformers",
    },
    {
      to: "/weaviate/modules/qna-openai",
      from: "/weaviate/modules/reader-generator-modules/qna-openai",
    },
    {
      to: "/weaviate/modules/img2vec-neural",
      from: "/weaviate/modules/retriever-vectorizer-modules/img2vec-neural",
    },
    {
      to: "/weaviate/modules/ref2vec-centroid",
      from: "/weaviate/modules/retriever-vectorizer-modules/ref2vec-centroid",
    },
    {
      to: "/weaviate/modules/text2vec-contextionary",
      from: "/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary",
    },

    // =============================================================================================
    // END - 202409 Remove old module docs & redirect to model provider integration
    // =============================================================================================

    // moved Quickstart installation to Quickstart
    {
      to: "/weaviate/quickstart",
      from: "/weaviate/quickstart/installation",
    },

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
      to: "/weaviate/installation",
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

    // Legacy REST API redirects
    {
      to: "/weaviate/api/rest/",
      from: [
        "/weaviate/api/rest/schema",
        "/weaviate/api/rest/objects",
        "/weaviate/api/rest/batch",
        "/weaviate/api/rest/backups",
        "/weaviate/api/rest/classification",
        "/weaviate/api/rest/meta",
        "/weaviate/api/rest/nodes",
        "/weaviate/api/rest/well-known",
        "/weaviate/api/rest_legacy/schema",
        "/weaviate/api/rest_legacy/objects",
        "/weaviate/api/rest_legacy/batch",
        "/weaviate/api/rest_legacy/backups",
        "/weaviate/api/rest_legacy/classification",
        "/weaviate/api/rest_legacy/meta",
        "/weaviate/api/rest_legacy/nodes",
        "/weaviate/api/rest_legacy/well-known",
      ],
    },
    {
      to: "/weaviate/model-providers",
      from: [
        "/weaviate/api/rest/modules",
        "/weaviate/api/rest_legacy/modules",
      ],
    },
    // Release notes
    {
      to: "/weaviate/release-notes",
      from: "/weaviate/release-notes/release_1_20",
    },
    {
      to: "/weaviate/release-notes",
      from: "/weaviate/release-notes/release_1_19",
    },
    {
      to: "/weaviate/release-notes",
      from: "/weaviate/release-notes/release_1_18",
    },
    {
      to: "/weaviate/release-notes",
      from: "/weaviate/release-notes/release_1_17",
    },
    {
      to: "/weaviate/release-notes",
      from: "/weaviate/release-notes/release_1_16",
    },
    // Integration Docs
    {
      to: "/integrations/llm-agent-frameworks",
      from: "/integrations/llm-frameworks",
    },
    {
      to: "/integrations/llm-agent-frameworks/composio",
      from: "/integrations/llm-frameworks/composio",
    },
    {
      to: "/integrations/llm-agent-frameworks/dspy",
      from: "/integrations/llm-frameworks/dspy",
    },
    {
      to: "/integrations/llm-agent-frameworks/haystack",
      from: "/integrations/llm-frameworks/haystack",
    },
    {
      to: "/integrations/llm-agent-frameworks/langchain",
      from: "/integrations/llm-frameworks/langchain",
    },
    {
      to: "/integrations/llm-agent-frameworks/llamaindex",
      from: "/integrations/llm-frameworks/llamaindex",
    },
    {
      to: "/integrations/llm-agent-frameworks/semantic-kernel",
      from: "/integrations/llm-frameworks/semantic-kernel",
    },
    {
      to: "/integrations/data-platforms/confluent",
      from: "/integrations/data-platforms/confluent-cloud",
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
  ],
  createRedirects(existingPath) {
    if (existingPath.includes("/weaviate/api/graphql")) {
      return [
        existingPath.replace(
          "/weaviate/api/graphql",
          "/weaviate/current/graphql-references"
        ),
      ];
    }
    if (
      existingPath.includes("/weaviate/modules/retriever-vectorizer-modules")
    ) {
      return [
        existingPath.replace(
          "/weaviate/modules/retriever-vectorizer-modules",
          "/weaviate/current/retriever-vectorizer-modules"
        ),
      ];
    }
    if (existingPath.includes("/weaviate/modules/reader-generator-modules")) {
      return [
        existingPath.replace(
          "/weaviate/modules/reader-generator-modules",
          "/weaviate/current/reader-generator-modules"
        ),
      ];
    }
    if (existingPath.includes("/weaviate/modules/other-modules")) {
      return [
        existingPath.replace(
          "/weaviate/modules/other-modules",
          "/weaviate/current/other-modules"
        ),
      ];
    }
    if (existingPath.includes("/weaviate/api/rest")) {
      return [
        existingPath.replace(
          "/weaviate/api/rest",
          "/weaviate/current/restful-api-references"
        ),
      ];
    }

    if (existingPath.includes("/weaviate/concepts/replication-architecture")) {
      return [
        existingPath.replace(
          "/weaviate/concepts/replication-architecture",
          "/weaviate/current/replication-architecture"
        ),
      ];
    }
    if (existingPath.includes("/weaviate/concepts")) {
      return [
        existingPath.replace(
          "/weaviate/concepts",
          "/weaviate/current/core-knowledge"
        ),
        existingPath.replace(
          "/weaviate/concepts",
          "/weaviate/current/architecture"
        ),
      ];
    }
    if (existingPath.includes("/weaviate/quickstart")) {
      return [
        existingPath.replace(
          "/weaviate/quickstart",
          "/weaviate/current/getting-started"
        ),
      ];
    }

    // Any remaining weaviate docs redirects
    if (existingPath.includes("/weaviate")) {
      return [existingPath.replace("/weaviate", "/weaviate/current")];
    }

    // Contributor Guide redirects
    if (existingPath.includes("/contributor-guide/weaviate-modules")) {
      return [
        existingPath.replace(
          "/contributor-guide/weaviate-modules",
          "/contributor-guide/current/weaviate-module-system"
        ),
      ];
    }
    if (existingPath.includes("/contributor-guide")) {
      return [
        existingPath.replace(
          "/contributor-guide",
          "/contributor-guide/current"
        ),
      ];
    }

    return undefined; // Return a falsy value: no redirect created
  },
};

module.exports = siteRedirects;
