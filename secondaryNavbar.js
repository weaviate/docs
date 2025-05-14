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
        label: "How-to manuals & Guides",
        link: "/docs/weaviate/guides",
        sidebar: "guidesSidebar",
      },
      {
        label: "Model Integrations",
        link: "/docs/weaviate/model-providers",
        sidebar: "modelProvidersSidebar",
      },
      {
        label: "Reference & APIs",
        link: "/docs/weaviate/config-refs",
        sidebar: "referenceSidebar",
      },
      {
        label: "Concepts",
        link: "/docs/weaviate/concepts",
        sidebar: "conceptsSidebar",
      },
      {
        label: "Recipes",
        link: "/docs/weaviate/recipes",
        sidebar: "weaviateRecipesSidebar",
      },
      {
        label: "Other",
        link: "/docs/weaviate/release-notes",
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

  deploy: {
    title: "Deploy",
    icon: "fa fa-database",
    description: "Deploy, configure, and maintain Weaviate Database",
    link: "/docs/deploy",
    links: [
      { label: "Get Started", link: "/docs/deploy", sidebar: "deploySidebar" },
      { label: "Configuration Guides", link: "/docs/deploy/config-guides", sidebar: "deployConfigSidebar"},
      /*{ label: "Kubernetes", link: "/docs/deploy/k8s", sidebar: "deployK8sSidebar" },*/
      { label: "Production Guides", link: "/docs/deploy/production", sidebar: "deployProductionSidebar"},
      { label: "Tutorials", link: "/docs/deploy/tutorials", sidebar: "deployTutorialSidebar"},
      /*{ label: "AWS", link: "/docs/deploy/aws", sidebar: "deployAwsSidebar" },*/
      /*{ label: "Scaling Strategies", link: "/docs/deploy/scaling-strategies", sidebar: "deployScalingSidebar"},*/
      /*{ label: "Monitoring and Observability", link: "/docs/deploy/monitoring-obs", sidebar: "deployObservabilitySidebar"},*/
      { label: "FAQs", link: "/docs/deploy/faqs", sidebar: "deployFaqsSidebar"},
      { label: "Migration", link: "/docs/deploy/migration", sidebar: "deployMigrationSidebar"},
    ]
  },

  agents: {
    title: "Weaviate Agents",
    icon: "fa fa-robot",
    description: "Build and deploy intelligent agents with Weaviate",
    link: "/docs/agents",
    links: [
      { label: "Documentation", link: "/docs/agents", sidebar: "agentsSidebar" },
      {
        label: "Recipes",
        link: "/docs/agents/recipes",
        sidebar: "agentsRecipesSidebar",
      },
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
    isSmall: true,
    description: "For hyperscalers, data platforms, LLM frameworks, etc.",
    link: "/docs/integrations",
    links: [
      {
        label: "Documentation",
        link: "/docs/integrations",
        sidebar: "integrationsSidebar",
      },
      {
        label: "Recipes",
        link: "/docs/integrations/recipes",
        sidebar: "integrationsRecipesSidebar",
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
