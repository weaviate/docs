const siteRedirects = {
  // fromExtensions: ['html', 'htm'],
  redirects: [
    {
      to: "/docs/weaviate/roadmap",
      from: [
        "/developers/weaviate/current/roadmap/index",
        "/developers/weaviate/current/roadmap/architectural-roadmap",
        "/developers/weaviate/current/roadmap/feature-roadmap",
      ],
    },
    {
      to: "/docs/weaviate/concepts/data",
      from: "/developers/weaviate/current/core-knowledge/basics",
    },
    {
      to: "/docs/weaviate/concepts/vector-index",
      from: [
        "/developers/weaviate/current/vector-index-plugins",
        "/developers/weaviate/current/vector-index-plugins/hnsw",
      ],
    },
    {
      to: "/docs/weaviate/client-libraries",
      from: "/developers/weaviate/current/core-knowledge/clients",
    },
    {
      to: "/docs/cloud/tools/query-tool",
      from: "/developers/weaviate/current/core-knowledge/console",
    },
    {
      to: "/docs/cloud/tools/query-tool",
      from: "/developers/wcs/guides/console",
    },
    {
      to: "/docs/cloud/manage-clusters/create",
      from: "/developers/wcs/guides/create-instance",
    },
    {
      to: "/docs/cloud/manage-clusters/connect",
      from: "/developers/wcs/guides/authentication",
    },
    // Client library redirects
    {
      to: "/docs/weaviate/client-libraries/typescript",
      from: "/developers/weaviate/client-libraries/javascript",
    },

    // Config-refs redirects
    {
      to: "/docs/weaviate/config-refs/datatypes",
      from: "/developers/weaviate/configuration/datatypes",
    },
    {
      to: "/docs/weaviate/config-refs/distances",
      from: "/developers/weaviate/configuration/distances",
    },

    // Configuration redirects
    {
      to: "/docs/weaviate/config-refs/datatypes",
      from: "/developers/weaviate/current/schema/datatypes",
    },
    {
      to: "/docs/weaviate/config-refs/distances",
      from: "/developers/weaviate/current/vector-index-plugins/distances",
    },
    {
      to: "/docs/weaviate/concepts/filtering",
      from: "/developers/weaviate/config-refs/schema/range-index",
    },
    {
      to: "/docs/weaviate/config-refs/schema/vector-index",
      from: "/developers/weaviate/configuration/indexes",
    },
    {
      to: "/docs/weaviate/config-refs/schema/vector-index",
      from: "/developers/weaviate/current/configuration/vector-index-type",
    },
    {
      to: "/docs/weaviate/manage-data/collections",
      from: [
        "/developers/weaviate/current/schema",
        "/developers/weaviate/current/schema/schema-configuration",
      ],
    },

    // More-resources redirects
    {
      to: "/docs/weaviate/more-resources/example-datasets",
      from: "/developers/weaviate/current/tutorials/example-datasets",
    },
    {
      to: "/docs/weaviate/more-resources/write-great-bug-reports",
      from: "/developers/weaviate/current/tutorials/write-great-bug-reports",
    },
    {
      to: "/docs/weaviate/",
      from: "/developers/weaviate/current/more-resources/deprecation-messages",
    },
    {
      to: "/docs/integrations/llm-frameworks/dspy",
      from: "/developers/weaviate/more-resources/dspy",
    },

    // Quickstart redirects
    {
      to: "/docs/weaviate/starter-guides/schema",
      from: "/developers/weaviate/quickstart/schema",
    },
    {
      to: "/docs/weaviate/tutorials/import",
      from: "/developers/weaviate/quickstart/import",
    },
    {
      to: "/docs/weaviate/tutorials/query",
      from: "/developers/weaviate/quickstart/query",
    },
    {
      to: "/docs/weaviate/tutorials/modules",
      from: "/developers/weaviate/quickstart/modules",
    },
    {
      to: "/docs/cloud/tools/query-tool",
      from: "/developers/weaviate/quickstart/console",
    },

    // Old Quickstart redirects
    {
      to: "/docs/weaviate/starter-guides/schema",
      from: "/developers/weaviate/current/quickstart/schema",
    },
    {
      to: "/docs/weaviate/tutorials/import",
      from: "/developers/weaviate/current/quickstart/import",
    },
    {
      to: "/docs/weaviate/tutorials/query",
      from: "/developers/weaviate/current/quickstart/query",
    },
    {
      to: "/docs/weaviate/tutorials/modules",
      from: "/developers/weaviate/current/quickstart/modules",
    },
    {
      to: "/docs/cloud/tools/query-tool",
      from: "/developers/weaviate/current/quickstart/console",
    },

    // WCD redirects
    {
      to: "/docs/cloud/faq",
      from: "/developers/wcs/troubleshooting",
    },
    {
      to: "/docs/cloud/tools/query-tool",
      from: "/developers/wcs/platform/ssconsole",
    },
    {
      to: "/docs/cloud/manage-clusters/status",
      from: "/developers/wcs/platform/cluster-status",
    },
    {
      to: "/docs/cloud/tools/query-tool",
      from: "/developers/wcs/console",
    },
    {
      to: "/docs/cloud/manage-clusters/status",
      from: "/developers/wcs/cluster-status",
    },
    {
      to: "/docs/cloud/manage-clusters/connect",
      from: "/developers/wcs/conect",
    },
    {
      to: "/docs/cloud/manage-clusters/create",
      from: "/developers/wcs/create-instance",
    },
    {
      to: "/docs/cloud/manage-clusters/upgrade",
      from: "/developers/wcs/upgrade",
    },
    // Tutorial redirects
    {
      to: "/docs/weaviate/starter-guides/schema",
      from: "/developers/weaviate/current/tutorials/how-to-create-a-schema",
    },
    {
      to: "/docs/weaviate/tutorials/query",
      from: "/developers/weaviate/current/tutorials/how-to-query-data",
    },
    {
      to: "/docs/weaviate/tutorials/query",
      from: "/developers/weaviate/current/tutorials/how-to-perform-a-semantic-search",
    },
    {
      to: "/docs/weaviate/tutorials/query",
      from: "/developers/weaviate/current/tutorials/semantic-search-through-wikipedia",
    },
    {
      to: "/docs/weaviate/tutorials",
      from: [
        "/developers/weaviate/current/tutorials/how-to-do-classification",
        "/developers/weaviate/current/tutorials/how-to-use-weaviate-without-modules",
        "/developers/weaviate/current/tutorials/other-examples",
        "/developers/weaviate/current/tutorials/quick-start-with-the-text2vec-contextionary-module",
      ],
    },

    // Howto redirects
    {
      to: "/docs/weaviate/manage-data/read-all-objects",
      from: "/developers/weaviate/manage-data/exhaustive-retrieval",
    },

    // Tutorial refresh 2024
    {
      to: "/docs/weaviate/starter-guides/schema",
      from: "/developers/weaviate/tutorials/schema",
    },
    {
      to: "/docs/weaviate/connections",
      from: "/developers/weaviate/tutorials/connect",
    },
    {
      to: "/docs/weaviate/connections",
      from: "/developers/weaviate/starter-guides/connect",
    },

    // 2024.10 Rename "prefiltering" to "filtering"
    {
      to: "/docs/weaviate/concepts/filtering",
      from: "/developers/weaviate/concepts/prefiltering",
    },

    // Remove BPR page
    {
      to: "/docs/weaviate/concepts/vector-index",
      from: "/developers/weaviate/concepts/binary-passage-retrieval",
    },

    // REMOVE WHEN MODULE RENAMING IMPLEMENTED: Temp redirect.
    {
      to: "/docs/weaviate/model-providers/google/generative",
      from: "/developers/weaviate/modules/reader-generator-modules/generative-google",
    },
    {
      to: "/docs/weaviate/model-providers/google/embeddings",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-google",
    },

    // =============================================================================================
    // 202409 Remove old module docs & redirect to model provider integration
    // =============================================================================================
    // API-based T2V modules
    {
      to: "/docs/weaviate/model-providers/aws/embeddings",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-aws",
    },
    {
      to: "/docs/weaviate/model-providers/cohere/embeddings",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-cohere",
    },
    {
      to: "/docs/weaviate/model-providers/huggingface/embeddings",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-huggingface",
    },
    {
      to: "/docs/weaviate/model-providers/jinaai/embeddings",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-jinaai",
    },
    {
      to: "/docs/weaviate/model-providers/openai/embeddings",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-openai",
    },
    {
      to: "/docs/weaviate/model-providers/google/embeddings",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-palm",
    },
    {
      to: "/docs/weaviate/model-providers/voyageai/embeddings",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-voyageai",
    },
    // Local T2V modules
    {
      to: "/docs/weaviate/model-providers/gpt4all/embeddings",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-gpt4all",
    },
    {
      to: "/docs/weaviate/model-providers/ollama/embeddings",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-ollama",
    },
    {
      to: "/docs/weaviate/model-providers/transformers/embeddings",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers",
    },
    // Other vectorizer modules
    {
      to: "/docs/weaviate/model-providers/imagebind/embeddings-multimodal",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-bind",
    },
    {
      to: "/docs/weaviate/model-providers/transformers/embeddings-multimodal",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-clip",
    },
    {
      to: "/docs/weaviate/model-providers/google/embeddings-multimodal",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-palm",
    },
    // Reranker modules
    {
      to: "/docs/weaviate/model-providers/cohere/reranker",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/reranker-cohere",
    },
    {
      to: "/docs/weaviate/model-providers/voyageai/reranker",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/reranker-voyageai",
    },
    {
      to: "/docs/weaviate/model-providers/transformers/reranker",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/reranker-transformers",
    },
    // Generative modules
    {
      to: "/docs/weaviate/model-providers/anyscale/generative",
      from: "/developers/weaviate/modules/reader-generator-modules/generative-anyscale",
    },
    {
      to: "/docs/weaviate/model-providers/aws/generative",
      from: "/developers/weaviate/modules/reader-generator-modules/generative-aws",
    },
    {
      to: "/docs/weaviate/model-providers/cohere/generative",
      from: "/developers/weaviate/modules/reader-generator-modules/generative-cohere",
    },
    {
      to: "/docs/weaviate/model-providers/mistral/generative",
      from: "/developers/weaviate/modules/reader-generator-modules/generative-mistral",
    },
    {
      to: "/docs/weaviate/model-providers/ollama/generative",
      from: "/developers/weaviate/modules/reader-generator-modules/generative-ollama",
    },
    {
      to: "/docs/weaviate/model-providers/openai/generative",
      from: "/developers/weaviate/modules/reader-generator-modules/generative-openai",
    },
    {
      to: "/docs/weaviate/model-providers/google/generative",
      from: "/developers/weaviate/modules/reader-generator-modules/generative-palm",
    },

    {
      to: "/docs/weaviate/modules/custom-modules",
      from: "/developers/weaviate/modules/other-modules/custom-modules",
    },
    {
      to: "/docs/weaviate/modules/spellcheck",
      from: "/developers/weaviate/modules/other-modules/spellcheck",
    },
    {
      to: "/docs/weaviate/modules/ner-transformers",
      from: "/developers/weaviate/modules/reader-generator-modules/ner-transformers",
    },
    {
      to: "/docs/weaviate/modules/qna-transformers",
      from: "/developers/weaviate/modules/reader-generator-modules/qna-transformers",
    },
    {
      to: "/docs/weaviate/modules/sum-transformers",
      from: "/developers/weaviate/modules/reader-generator-modules/sum-transformers",
    },
    {
      to: "/docs/weaviate/modules/qna-openai",
      from: "/developers/weaviate/modules/reader-generator-modules/qna-openai",
    },
    {
      to: "/docs/weaviate/modules/img2vec-neural",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/img2vec-neural",
    },
    {
      to: "/docs/weaviate/modules/ref2vec-centroid",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/ref2vec-centroid",
    },
    {
      to: "/docs/weaviate/modules/text2vec-contextionary",
      from: "/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary",
    },

    // =============================================================================================
    // END - 202409 Remove old module docs & redirect to model provider integration
    // =============================================================================================

    // moved Quickstart installation to Quickstart
    {
      to: "/docs/weaviate/quickstart/",
      from: "/developers/weaviate/quickstart/installation",
    },

    {
      to: "/docs/cloud/tools/query-tool",
      from: "/developers/weaviate/tutorials/console",
    },

    // References: API / GraphQL redirects
    {
      to: "/docs/weaviate/api/graphql/search-operators",
      from: "/developers/weaviate/api/graphql/vector-search-parameters",
    },

    // old link redirects
    {
      to: "/docs/weaviate/installation",
      from: "/developers/weaviate/current/getting-started/installation",
    },

    {
      to: "/docs/weaviate/configuration/compression/pq-compression",
      from: "/developers/weaviate/configuration/pq-compression",
    },

    {
      to: "/docs/weaviate/configuration/compression/bq-compression",
      from: "/developers/weaviate/configuration/bq-compression",
    },

    {
      to: "/docs/weaviate/manage-data/collections",
      from: "/developers/weaviate/manage-data/classes",
    },

    {
      to: "/docs/weaviate/manage-data/collections",
      from: "/developers/weaviate/configuration/schema-configuration",
    },

    // Legacy REST API redirects
    {
      to: "/docs/weaviate/api/rest/",
      from: [
        "/developers/weaviate/api/rest/schema",
        "/developers/weaviate/api/rest/objects",
        "/developers/weaviate/api/rest/batch",
        "/developers/weaviate/api/rest/backups",
        "/developers/weaviate/api/rest/classification",
        "/developers/weaviate/api/rest/meta",
        "/developers/weaviate/api/rest/nodes",
        "/developers/weaviate/api/rest/well-known",
        "/developers/weaviate/api/rest_legacy/schema",
        "/developers/weaviate/api/rest_legacy/objects",
        "/developers/weaviate/api/rest_legacy/batch",
        "/developers/weaviate/api/rest_legacy/backups",
        "/developers/weaviate/api/rest_legacy/classification",
        "/developers/weaviate/api/rest_legacy/meta",
        "/developers/weaviate/api/rest_legacy/nodes",
        "/developers/weaviate/api/rest_legacy/well-known",
      ],
    },
    {
      to: "/docs/weaviate/model-providers",
      from: [
        "/docs/weaviate/api/rest/modules",
        "/developers/weaviate/api/rest_legacy/modules",
      ],
    },
    // Release notes
    {
      to: "/docs/weaviate/release-notes/older-releases/release_1_20",
      from: "/developers/weaviate/release-notes/release_1_20",
    },
    {
      to: "/docs/weaviate/release-notes/older-releases/release_1_19",
      from: "/developers/weaviate/release-notes/release_1_19",
    },
    {
      to: "/docs/weaviate/release-notes/older-releases/release_1_18",
      from: "/developers/weaviate/release-notes/release_1_18",
    },
    {
      to: "/docs/weaviate/release-notes/older-releases/release_1_17",
      from: "/developers/weaviate/release-notes/release_1_17",
    },
    {
      to: "/docs/weaviate/release-notes/older-releases/release_1_16",
      from: "/developers/weaviate/release-notes/release_1_16",
    },
    // Integration Docs
    {
      to: "/docs/integrations/llm-frameworks",
      from: "/developers/integrations/llm-frameworks",
    },
    {
      to: "/docs/integrations/llm-frameworks/composio",
      from: "/developers/integrations/llm-frameworks/composio",
    },
    {
      to: "/docs/integrations/llm-frameworks/dspy",
      from: "/developers/integrations/llm-frameworks/dspy",
    },
    {
      to: "/docs/integrations/llm-frameworks/haystack",
      from: "/developers/integrations/llm-frameworks/haystack",
    },
    {
      to: "/docs/integrations/llm-frameworks/langchain",
      from: "/developers/integrations/llm-frameworks/langchain",
    },
    {
      to: "/docs/integrations/llm-frameworks/llamaindex",
      from: "/developers/integrations/llm-frameworks/llamaindex",
    },
    {
      to: "/docs/integrations/llm-frameworks/semantic-kernel",
      from: "/developers/integrations/llm-frameworks/semantic-kernel",
    },

    // Restructured starter guides
    {
      to: "/docs/weaviate/starter-guides/schema",
      from: "/developers/weaviate/starter-guides/schema",
    },

    // Redirects for Weaviate Core error messages
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
    if (existingPath.includes("/developers/weaviate")) {
      return [
        existingPath.replace("/docs/weaviate", "/developers/weaviate/current"),
      ];
    }

    // Contributor Guide redirects
    if (existingPath.includes("/contributor-guide/weaviate-modules")) {
      return [
        existingPath.replace(
          "/docs/contributor-guide/weaviate-modules",
          "/developers/contributor-guide/current/weaviate-module-system"
        ),
      ];
    }
    if (existingPath.includes("/contributor-guide")) {
      return [
        existingPath.replace(
          "/docs/contributor-guide",
          "/developers/contributor-guide/current"
        ),
      ];
    }

    return undefined; // Return a falsy value: no redirect created
  },
};

module.exports = siteRedirects;
