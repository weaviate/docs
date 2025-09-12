const secondaryNavbarItems = {
  build: {
    title: "Weaviate Database",
    icon: "fa fa-database",
    description: "Develop AI applications using Weaviate's APIs and tools",
    link: "/weaviate",
    links: [
      {
        label: "Get Started",
        link: "/weaviate",
        sidebar: "getStartedSidebar",
      },
      {
        label: "How-to manuals & Guides",
        link: "/weaviate/guides",
        sidebar: "guidesSidebar",
      },
      {
        label: "Model Integrations",
        link: "/weaviate/model-providers",
        sidebar: "modelProvidersSidebar",
      },
      {
        label: "Reference & APIs",
        link: "/weaviate/config-refs",
        sidebar: "referenceSidebar",
      },
      {
        label: "Concepts",
        link: "/weaviate/concepts",
        sidebar: "conceptsSidebar",
      },
      {
        label: "Recipes",
        link: "/weaviate/recipes",
        sidebar: "weaviateRecipesSidebar",
      },
      {
        label: "Other",
        link: "/weaviate/release-notes",
        sidebar: "othersSidebar",
        /*
        dropdown: [
          {
            label: "Benchmarks",
            link: "/weaviate/benchmarks",
            sidebar: "othersSidebar",
          },
          {
            label: "FAQ",
            link: "/weaviate/more-resources/faq",
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
    link: "/deploy",
    links: [
      { label: "Get Started", link: "/deploy", sidebar: "deploySidebar" },
      { label: "Configuration", link: "/deploy/configuration", sidebar: "deployConfigSidebar"},
      /*{ label: "Kubernetes", link: "/deploy/k8s", sidebar: "deployK8sSidebar" },*/
      { label: "Production Guides", link: "/deploy/production", sidebar: "deployProductionSidebar"},
      { label: "Tutorials", link: "/deploy/tutorials/rbac", sidebar: "deployTutorialSidebar"},
      { label: "AWS", link: "/deploy/aws", sidebar: "deployAwsSidebar" },
      /*{ label: "Scaling Strategies", link: "/deploy/scaling-strategies", sidebar: "deployScalingSidebar"},*/
      /*{ label: "Monitoring and Observability", link: "/deploy/monitoring-obs", sidebar: "deployObservabilitySidebar"},*/
      { label: "FAQs", link: "/deploy/faqs", sidebar: "deployFaqsSidebar"},
      { label: "Migration", link: "/deploy/migration", sidebar: "deployMigrationSidebar"},
    ]
  },

  agents: {
    title: "Weaviate Agents",
    icon: "fa fa-robot",
    description: "Build and deploy intelligent agents with Weaviate",
    link: "/agents",
    links: [
      { label: "Documentation", link: "/agents", sidebar: "agentsSidebar" },
      {
        label: "Recipes",
        link: "/agents/recipes",
        sidebar: "agentsRecipesSidebar",
      },
    ],
  },
  cloud: {
    title: "Weaviate Cloud",
    icon: "fa fa-cloud",
    description: "Manage and scale Weaviate in the cloud",
    link: "/cloud",
    links: [
      { label: "Get Started", link: "/cloud", sidebar: "cloudSidebar" },
      {
        label: "Weaviate Embeddings",
        link: "/cloud/embeddings",
        sidebar: "cloudWeaviateEmbeddings",
      },
      {
        label: "Account management",
        link: "/cloud/platform/billing",
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
    link: "/academy",
    links: [
      {
        label: "Get Started",
        link: "/academy",
        sidebar: "academySidebar",
      },
    ],
  },
  integrations: {
    title: "Integrations",
    icon: "fa fa-puzzle-piece",
    isSmall: true,
    description: "For hyperscalers, data platforms, LLM frameworks, etc.",
    link: "/integrations",
    links: [
      {
        label: "Documentation",
        link: "/integrations",
        sidebar: "integrationsSidebar",
      },
      {
        label: "Recipes",
        link: "/integrations/recipes",
        sidebar: "integrationsRecipesSidebar",
      },
    ],
  },
  contributor: {
    title: "Contributor guide",
    icon: "fa fa-edit",
    isSmall: true,
    description: "Learn how to contribute to Weaviate's open-source projects",
    link: "/contributor-guide",
    links: [
      {
        label: "Documentation",
        link: "/contributor-guide",
        sidebar: "contributorSidebar",
      },
    ],
  },
  events: {
    title: "Events & Workshops",
    icon: "fa fa-calendar-days",
    isSmall: true,
    description: "",
    href: "https://weaviate.io/community/events",
    links: [],
  },
};

export default secondaryNavbarItems;
