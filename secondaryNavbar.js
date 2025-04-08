const secondaryNavbarItems = {
  build: {
    title: "Weaviate Database",
    icon: "fa fa-database",
    description: "Develop AI applications using Weaviate's APIs and tools",
    link: "/docs/weaviate",
    links: [
      {
        label: "Get Started",
        link: "/docs/weaviate",
        sidebar: "getStartedSidebar",
      },
      {
        label: "How-to & Guides",
        link: "/docs/weaviate/guides",
        sidebar: "guidesSidebar",
      },
      {
        label: "Model Integrations",
        link: "/docs/weaviate/model-providers",
        sidebar: "modelProvidersSidebar",
      },
      {
        label: "References",
        link: "/docs/weaviate/api",
        sidebar: "referenceSidebar",
      },
      {
        label: "Concepts",
        link: "/docs/weaviate/concepts",
        sidebar: "conceptsSidebar",
      },
      {
        label: "Releases",
        link: "/docs/weaviate/release-notes",
        sidebar: "releasesSidebar",
      },
      {
        label: "Other",
        link: "/docs/weaviate/benchmarks",
        sidebar: "othersSidebar",
        /*
        dropdown: [
          {
            label: "Benchmarks",
            link: "/docs/weaviate/benchmarks",
            sidebar: "othersSidebar",
          },
          {
            label: "FAQ",
            link: "/docs/weaviate/more-resources/faq",
            sidebar: "othersSidebarFAQ",
          },
        ],
        */
      },
    ],
  },
  /*
  deploy: {
    title: "Deploy",
    icon: "fa fa-database",
    description: "Deploy, configure, and maintain Weaviate Database",
    link: "/docs/deploy",
    links: [
      { label: "Get Started", link: "/docs/deploy", sidebar: "deploySidebar" },
      { label: "AWS", link: "/docs/deploy/aws", sidebar: "deployAwsSidebar" },
    ],
  },
  */
  agents: {
    title: "Weaviate Agents",
    icon: "fa fa-robot",
    description: "Build and deploy intelligent agents with Weaviate",
    link: "/docs/agents",
    links: [
      { label: "Get Started", link: "/docs/agents", sidebar: "agentsSidebar" },
      { label: "Recipes", link: "/docs/agents/recipes", sidebar: "agentsRecipesSidebar" },
    ],
  },
  cloud: {
    title: "Weaviate Cloud",
    icon: "fa fa-cloud",
    description: "Manage and scale Weaviate in the cloud",
    link: "/docs/cloud",
    links: [
      { label: "Get Started", link: "/docs/cloud", sidebar: "cloudSidebar" },
      {
        label: "Weaviate Embeddings",
        link: "/docs/cloud/embeddings",
        sidebar: "cloudWeaviateEmbeddings",
      },
      {
        label: "Account management",
        link: "/docs/cloud/platform/billing",
        sidebar: "cloudAccountManagementSidebar",
      },
    ],
  },
  academy: {
    title: "Academy",
    icon: "fa fa-graduation-cap",
    isSmall: true,
    description:
      "Learn about vector search and Weaviate through structured courses",
    link: "/docs/academy",
    links: [
      {
        label: "Get Started",
        link: "/docs/academy",
        sidebar: "academySidebar",
      },
    ],
  },
  integrations: {
    title: "Integrations",
    icon: "fa fa-puzzle-piece",
    description: "For hyperscalers, data platforms, LLM frameworks, etc.",
    link: "/docs/integrations",
    links: [
      {
        label: "Get Started",
        link: "/docs/integrations",
        sidebar: "integrationsSidebar",
      },
    ],
  },
  contributor: {
    title: "Contributor guide",
    icon: "fa fa-edit",
    isSmall: true,
    description: "Learn how to contribute to Weaviate's open-source projects",
    link: "/docs/contributor-guide",
    links: [
      {
        label: "Get Started",
        link: "/docs/contributor-guide",
        sidebar: "contributorSidebar",
      },
      {
        label: "Weaviate Database",
        link: "/docs/contributor-guide/weaviate-core",
        sidebar: "contributorCoreSidebar",
      },
      {
        label: "Weaviate Modules",
        link: "/docs/contributor-guide/weaviate-modules",
        sidebar: "contributorModulesSidebar",
      },
      {
        label: "Weaviate Clients",
        link: "/docs/contributor-guide/weaviate-clients",
        sidebar: "contributorClientsSidebar",
      },
      {
        label: "Contextionary",
        link: "/docs/contributor-guide/contextionary",
        sidebar: "contributorContextionarySidebar",
      },
    ],
  },
};

export default secondaryNavbarItems;
