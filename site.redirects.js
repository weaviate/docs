const siteRedirects = {
  // fromExtensions: ['html', 'htm'],
  redirects: [
    {
      to: "/docs/weaviate/release-notes",
      from: [
        "/docs/weaviate/current/roadmap/index",
        "/docs/weaviate/current/roadmap/architectural-roadmap",
        "/docs/weaviate/current/roadmap/feature-roadmap",
      ],
    },
    {
      to: "/docs/weaviate/concepts/data",
      from: "/docs/weaviate/current/core-knowledge/basics",
    },
    {
      to: "/docs/weaviate/concepts/vector-index",
      from: [
        "/docs/weaviate/current/vector-index-plugins",
        "/docs/weaviate/current/vector-index-plugins/hnsw",
      ],
    },
    {
      to: "/docs/weaviate/client-libraries",
      from: "/docs/weaviate/current/core-knowledge/clients",
    },
    {
      to: "/docs/cloud/tools/query-tool",
      from: "/docs/weaviate/current/core-knowledge/console",
    },
    {
      to: "/docs/cloud/tools/query-tool",
      from: "/docs/wcs/guides/console",
    },
    {
      to: "/docs/cloud/manage-clusters/create",
      from: "/docs/wcs/guides/create-instance",
    },
    {
      to: "/docs/cloud/manage-clusters/connect",
      from: "/docs/wcs/guides/authentication",
    },
    // Client library redirects
    {
      to: "/docs/weaviate/client-libraries/typescript",
      from: "/docs/weaviate/client-libraries/javascript",
    },

    // Config-refs redirects
    {
      to: "/docs/weaviate/config-refs/datatypes",
      from: "/docs/weaviate/configuration/datatypes",
    },
    {
      to: "/docs/weaviate/config-refs/distances",
      from: "/docs/weaviate/configuration/distances",
    },

    // Configuration redirects
    {
      to: "/docs/weaviate/config-refs/datatypes",
      from: "/docs/weaviate/current/schema/datatypes",
    },
    {
      to: "/docs/weaviate/config-refs/distances",
      from: "/docs/weaviate/current/vector-index-plugins/distances",
    },
    {
      to: "/docs/weaviate/concepts/filtering",
      from: "/docs/weaviate/config-refs/schema/range-index",
    },
    {
      to: "/docs/weaviate/config-refs/schema/vector-index",
      from: "/docs/weaviate/configuration/indexes",
    },
    {
      to: "/docs/weaviate/config-refs/schema/vector-index",
      from: "/docs/weaviate/current/configuration/vector-index-type",
    },
    {
      to: "/docs/weaviate/manage-data/collections",
      from: [
        "/docs/weaviate/current/schema",
        "/docs/weaviate/current/schema/schema-configuration",
      ],
    },

    // More-resources redirects
    {
      to: "/docs/weaviate/more-resources/example-datasets",
      from: "/docs/weaviate/current/tutorials/example-datasets",
    },
    {
      to: "/docs/weaviate/more-resources/write-great-bug-reports",
      from: "/docs/weaviate/current/tutorials/write-great-bug-reports",
    },
    {
      to: "/docs/weaviate/",
      from: "/docs/weaviate/current/more-resources/deprecation-messages",
    },
    {
      to: "/docs/integrations/llm-agent-frameworks/dspy",
      from: "/docs/weaviate/more-resources/dspy",
    },

    // Quickstart redirects
    {
      to: "/docs/weaviate/starter-guides/managing-collections",
      from: "/docs/weaviate/quickstart/schema",
    },
    {
      to: "/docs/weaviate/tutorials/import",
      from: "/docs/weaviate/quickstart/import",
    },
    {
      to: "/docs/weaviate/tutorials/query",
      from: "/docs/weaviate/quickstart/query",
    },
    {
      to: "/docs/weaviate/tutorials/modules",
      from: "/docs/weaviate/quickstart/modules",
    },
    {
      to: "/docs/cloud/tools/query-tool",
      from: "/docs/weaviate/quickstart/console",
    },

    // Old Quickstart redirects
    {
      to: "/docs/weaviate/starter-guides/managing-collections",
      from: "/docs/weaviate/current/quickstart/schema",
    },
    {
      to: "/docs/weaviate/tutorials/import",
      from: "/docs/weaviate/current/quickstart/import",
    },
    {
      to: "/docs/weaviate/tutorials/query",
      from: "/docs/weaviate/current/quickstart/query",
    },
    {
      to: "/docs/weaviate/tutorials/modules",
      from: "/docs/weaviate/current/quickstart/modules",
    },
    {
      to: "/docs/cloud/tools/query-tool",
      from: "/docs/weaviate/current/quickstart/console",
    },

    // WCD redirects
    {
      to: "/docs/cloud/faq",
      from: "/docs/wcs/troubleshooting",
    },
    {
      to: "/docs/cloud/tools/query-tool",
      from: "/docs/wcs/platform/ssconsole",
    },
    {
      to: "/docs/cloud/manage-clusters/status",
      from: "/docs/wcs/platform/cluster-status",
    },
    {
      to: "/docs/cloud/tools/query-tool",
      from: "/docs/wcs/console",
    },
    {
      to: "/docs/cloud/manage-clusters/status",
      from: "/docs/wcs/cluster-status",
    },
    {
      to: "/docs/cloud/manage-clusters/connect",
      from: "/docs/wcs/conect",
    },
    {
      to: "/docs/cloud/manage-clusters/create",
      from: "/docs/wcs/create-instance",
    },
    {
      to: "/docs/cloud/manage-clusters/upgrade",
      from: "/docs/wcs/upgrade",
    },
    // Tutorial redirects
    {
      to: "/docs/weaviate/starter-guides/managing-collections",
      from: "/docs/weaviate/current/tutorials/how-to-create-a-schema",
    },
    {
      to: "/docs/weaviate/tutorials/query",
      from: "/docs/weaviate/current/tutorials/how-to-query-data",
    },
    {
      to: "/docs/weaviate/tutorials/query",
      from: "/docs/weaviate/current/tutorials/how-to-perform-a-semantic-search",
    },
    {
      to: "/docs/weaviate/tutorials/query",
      from: "/docs/weaviate/current/tutorials/semantic-search-through-wikipedia",
    },
    {
      to: "/docs/weaviate/tutorials",
      from: [
        "/docs/weaviate/current/tutorials/how-to-do-classification",
        "/docs/weaviate/current/tutorials/how-to-use-weaviate-without-modules",
        "/docs/weaviate/current/tutorials/other-examples",
        "/docs/weaviate/current/tutorials/quick-start-with-the-text2vec-contextionary-module",
      ],
    },

    // Howto redirects
    {
      to: "/docs/weaviate/manage-data/read-all-objects",
      from: "/docs/weaviate/manage-data/exhaustive-retrieval",
    },

    // Tutorial refresh 2024
    {
      to: "/docs/weaviate/starter-guides/managing-collections",
      from: "/docs/weaviate/tutorials/schema",
    },
    {
      to: "/docs/weaviate/connections",
      from: "/docs/weaviate/tutorials/connect",
    },
    {
      to: "/docs/weaviate/connections",
      from: "/docs/weaviate/starter-guides/connect",
    },

    // 2024.10 Rename "prefiltering" to "filtering"
    {
      to: "/docs/weaviate/concepts/filtering",
      from: "/docs/weaviate/concepts/prefiltering",
    },

    // Remove BPR page
    {
      to: "/docs/weaviate/concepts/vector-index",
      from: "/docs/weaviate/concepts/binary-passage-retrieval",
    },

    // REMOVE WHEN MODULE RENAMING IMPLEMENTED: Temp redirect.
    {
      to: "/docs/weaviate/model-providers/google/generative",
      from: "/docs/weaviate/modules/reader-generator-modules/generative-google",
    },
    {
      to: "/docs/weaviate/model-providers/google/embeddings",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/text2vec-google",
    },

    // =============================================================================================
    // 202409 Remove old module docs & redirect to model provider integration
    // =============================================================================================
    // API-based T2V modules
    {
      to: "/docs/weaviate/model-providers/aws/embeddings",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/text2vec-aws",
    },
    {
      to: "/docs/weaviate/model-providers/cohere/embeddings",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/text2vec-cohere",
    },
    {
      to: "/docs/weaviate/model-providers/huggingface/embeddings",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/text2vec-huggingface",
    },
    {
      to: "/docs/weaviate/model-providers/jinaai/embeddings",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/text2vec-jinaai",
    },
    {
      to: "/docs/weaviate/model-providers/openai/embeddings",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/text2vec-openai",
    },
    {
      to: "/docs/weaviate/model-providers/google/embeddings",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/text2vec-palm",
    },
    {
      to: "/docs/weaviate/model-providers/voyageai/embeddings",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/text2vec-voyageai",
    },
    // Local T2V modules
    {
      to: "/docs/weaviate/model-providers/gpt4all/embeddings",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/text2vec-gpt4all",
    },
    {
      to: "/docs/weaviate/model-providers/ollama/embeddings",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/text2vec-ollama",
    },
    {
      to: "/docs/weaviate/model-providers/transformers/embeddings",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers",
    },
    // Other vectorizer modules
    {
      to: "/docs/weaviate/model-providers/imagebind/embeddings-multimodal",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/multi2vec-bind",
    },
    {
      to: "/docs/weaviate/model-providers/transformers/embeddings-multimodal",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/multi2vec-clip",
    },
    {
      to: "/docs/weaviate/model-providers/google/embeddings-multimodal",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/multi2vec-palm",
    },
    // Reranker modules
    {
      to: "/docs/weaviate/model-providers/cohere/reranker",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/reranker-cohere",
    },
    {
      to: "/docs/weaviate/model-providers/voyageai/reranker",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/reranker-voyageai",
    },
    {
      to: "/docs/weaviate/model-providers/transformers/reranker",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/reranker-transformers",
    },
    // Generative modules
    {
      to: "/docs/weaviate/model-providers/anyscale/generative",
      from: "/docs/weaviate/modules/reader-generator-modules/generative-anyscale",
    },
    {
      to: "/docs/weaviate/model-providers/aws/generative",
      from: "/docs/weaviate/modules/reader-generator-modules/generative-aws",
    },
    {
      to: "/docs/weaviate/model-providers/cohere/generative",
      from: "/docs/weaviate/modules/reader-generator-modules/generative-cohere",
    },
    {
      to: "/docs/weaviate/model-providers/mistral/generative",
      from: "/docs/weaviate/modules/reader-generator-modules/generative-mistral",
    },
    {
      to: "/docs/weaviate/model-providers/ollama/generative",
      from: "/docs/weaviate/modules/reader-generator-modules/generative-ollama",
    },
    {
      to: "/docs/weaviate/model-providers/openai/generative",
      from: "/docs/weaviate/modules/reader-generator-modules/generative-openai",
    },
    {
      to: "/docs/weaviate/model-providers/google/generative",
      from: "/docs/weaviate/modules/reader-generator-modules/generative-palm",
    },

    {
      to: "/docs/weaviate/modules/custom-modules",
      from: "/docs/weaviate/modules/other-modules/custom-modules",
    },
    {
      to: "/docs/weaviate/modules/spellcheck",
      from: "/docs/weaviate/modules/other-modules/spellcheck",
    },
    {
      to: "/docs/weaviate/modules/ner-transformers",
      from: "/docs/weaviate/modules/reader-generator-modules/ner-transformers",
    },
    {
      to: "/docs/weaviate/modules/qna-transformers",
      from: "/docs/weaviate/modules/reader-generator-modules/qna-transformers",
    },
    {
      to: "/docs/weaviate/modules/sum-transformers",
      from: "/docs/weaviate/modules/reader-generator-modules/sum-transformers",
    },
    {
      to: "/docs/weaviate/modules/qna-openai",
      from: "/docs/weaviate/modules/reader-generator-modules/qna-openai",
    },
    {
      to: "/docs/weaviate/modules/img2vec-neural",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/img2vec-neural",
    },
    {
      to: "/docs/weaviate/modules/ref2vec-centroid",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/ref2vec-centroid",
    },
    {
      to: "/docs/weaviate/modules/text2vec-contextionary",
      from: "/docs/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary",
    },

    // =============================================================================================
    // END - 202409 Remove old module docs & redirect to model provider integration
    // =============================================================================================

    // moved Quickstart installation to Quickstart
    {
      to: "/docs/weaviate/quickstart/",
      from: "/docs/weaviate/quickstart/installation",
    },

    {
      to: "/docs/cloud/tools/query-tool",
      from: "/docs/weaviate/tutorials/console",
    },

    // References: API / GraphQL redirects
    {
      to: "/docs/weaviate/api/graphql/search-operators",
      from: "/docs/weaviate/api/graphql/vector-search-parameters",
    },

    // old link redirects
    {
      to: "/docs/weaviate/installation",
      from: "/docs/weaviate/current/getting-started/installation",
    },

    {
      to: "/docs/weaviate/configuration/compression/pq-compression",
      from: "/docs/weaviate/configuration/pq-compression",
    },

    {
      to: "/docs/weaviate/configuration/compression/bq-compression",
      from: "/docs/weaviate/configuration/bq-compression",
    },

    {
      to: "/docs/weaviate/manage-data/collections",
      from: "/docs/weaviate/manage-data/classes",
    },

    {
      to: "/docs/weaviate/manage-data/collections",
      from: "/docs/weaviate/configuration/schema-configuration",
    },

    // Legacy REST API redirects
    {
      to: "/docs/weaviate/api/rest/",
      from: [
        "/docs/weaviate/api/rest/schema",
        "/docs/weaviate/api/rest/objects",
        "/docs/weaviate/api/rest/batch",
        "/docs/weaviate/api/rest/backups",
        "/docs/weaviate/api/rest/classification",
        "/docs/weaviate/api/rest/meta",
        "/docs/weaviate/api/rest/nodes",
        "/docs/weaviate/api/rest/well-known",
        "/docs/weaviate/api/rest_legacy/schema",
        "/docs/weaviate/api/rest_legacy/objects",
        "/docs/weaviate/api/rest_legacy/batch",
        "/docs/weaviate/api/rest_legacy/backups",
        "/docs/weaviate/api/rest_legacy/classification",
        "/docs/weaviate/api/rest_legacy/meta",
        "/docs/weaviate/api/rest_legacy/nodes",
        "/docs/weaviate/api/rest_legacy/well-known",
      ],
    },
    {
      to: "/docs/weaviate/model-providers",
      from: [
        "/docs/weaviate/api/rest/modules",
        "/docs/weaviate/api/rest_legacy/modules",
      ],
    },
    // Release notes
    {
      to: "/docs/weaviate/release-notes/older-releases/release_1_20",
      from: "/docs/weaviate/release-notes/release_1_20",
    },
    {
      to: "/docs/weaviate/release-notes/older-releases/release_1_19",
      from: "/docs/weaviate/release-notes/release_1_19",
    },
    {
      to: "/docs/weaviate/release-notes/older-releases/release_1_18",
      from: "/docs/weaviate/release-notes/release_1_18",
    },
    {
      to: "/docs/weaviate/release-notes/older-releases/release_1_17",
      from: "/docs/weaviate/release-notes/release_1_17",
    },
    {
      to: "/docs/weaviate/release-notes/older-releases/release_1_16",
      from: "/docs/weaviate/release-notes/release_1_16",
    },
    // Integration Docs
    {
      to: "/docs/integrations/llm-agent-frameworks",
      from: "/docs/integrations/llm-frameworks",
    },
    {
      to: "/docs/integrations/llm-agent-frameworks/composio",
      from: "/docs/integrations/llm-frameworks/composio",
    },
    {
      to: "/docs/integrations/llm-agent-frameworks/dspy",
      from: "/docs/integrations/llm-frameworks/dspy",
    },
    {
      to: "/docs/integrations/llm-agent-frameworks/haystack",
      from: "/docs/integrations/llm-frameworks/haystack",
    },
    {
      to: "/docs/integrations/llm-agent-frameworks/langchain",
      from: "/docs/integrations/llm-frameworks/langchain",
    },
    {
      to: "/docs/integrations/llm-agent-frameworks/llamaindex",
      from: "/docs/integrations/llm-frameworks/llamaindex",
    },
    {
      to: "/docs/integrations/llm-agent-frameworks/semantic-kernel",
      from: "/docs/integrations/llm-frameworks/semantic-kernel",
    },

    // Restructured starter guides
    {
      to: "/docs/weaviate/starter-guides/managing-collections",
      from: "/docs/weaviate/starter-guides/schema",
    },

    // Redirects for Weaviate Database error messages
    //{
    //  to: "/docs/weaviate/starter-guides/schema/collections-scaling-limits",
    //  from: "/collections-count-limit",
    //},

    // Docs migration redirects
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
    if (existingPath.includes("/docs/weaviate")) {
      return [
        existingPath.replace("/docs/weaviate", "/docs/weaviate/current"),
      ];
    }

    // Contributor Guide redirects
    if (existingPath.includes("/contributor-guide/weaviate-modules")) {
      return [
        existingPath.replace(
          "/docs/contributor-guide/weaviate-modules",
          "/docs/contributor-guide/current/weaviate-module-system"
        ),
      ];
    }
    if (existingPath.includes("/contributor-guide")) {
      return [
        existingPath.replace(
          "/docs/contributor-guide",
          "/docs/contributor-guide/current"
        ),
      ];
    }

    return undefined; // Return a falsy value: no redirect created
  },
};

module.exports = siteRedirects;
