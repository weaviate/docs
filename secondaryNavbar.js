import {
  faCode,
  faCloud,
  faDatabase,
  faGraduationCap,
  faPuzzlePiece,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";

const secondaryNavbarItems = {
  build: {
    title: "Build",
    icon: faCode,
    description: "Develop AI applications using Weaviate's APIs and tools",
    link: "/",
    links: [
      { label: "Get Started", link: "/", sidebar: "getStartedSidebar" },
      {
        label: "Model Integrations",
        link: "/weaviate/model-providers",
        sidebar: "modelProvidersSidebar",
      },
      {
        label: "Concepts",
        link: "/weaviate/concepts",
        sidebar: "conceptsSidebar",
      },
      {
        label: "Tutorials & Guides",
        link: "/weaviate/configuration",
        sidebar: "guidesSidebar",
      },
      {
        label: "Reference",
        link: "/weaviate/api",
        sidebar: "referenceSidebar",
      },
      {
        label: "Releases",
        link: "/weaviate/release-notes",
        sidebar: "releasesSidebar",
      },
      {
        label: "Other",
        link: "/weaviate/benchmarks",
        sidebar: "othersSidebar",
      },
    ],
  },
  deploy: {
    title: "Deploy",
    icon: faDatabase,
    description: "Deploy, configure, and maintain Weaviate Core",
    link: "/deploy",
    links: [
      { label: "Get Started", link: "/deploy", sidebar: "deploySidebar" },
      { label: "AWS", link: "/deploy/aws", sidebar: "deployAwsSidebar" },
    ],
  },
  cloud: {
    title: "Weaviate Cloud",
    icon: faCloud,
    description: "Manage and scale Weaviate in the cloud",
    link: "/cloud",
    links: [
      { label: "Get Started", link: "/cloud", sidebar: "cloudSidebar" },
      { label: "Administration", link: "/cloud/create-instance", sidebar: "cloudAdministrationSidebar" },
    ],
  },
  academy: {
    title: "Academy",
    icon: faGraduationCap,
    description:
      "Learn about vector search and Weaviate through structured courses",
    link: "/academy",
    links: [
      { label: "Get Started", link: "/academy", sidebar: "academySidebar" },
    ],
  },
  integrations: {
    title: "Integrations",
    icon: faPuzzlePiece,
    description: "For hyperscalers, data platforms, LLM frameworks, etc.",
    link: "/integrations",
    links: [
      {
        label: "Get Started",
        link: "/integrations",
        sidebar: "integrationsSidebar",
      },
    ],
  },
  contributor: {
    title: "Contributor guide",
    icon: faEdit,
    description: "Learn how to contribute to Weaviate's open-source projects",
    link: "/contributor-guide",
    links: [
      {
        label: "Get Started",
        link: "/contributor-guide",
        sidebar: "contributorSidebar",
      },
      {
        label: "Weaviate Core",
        link: "/contributor-guide/weaviate-core",
        sidebar: "contributorCoreSidebar",
      },
      {
        label: "Weaviate Modules",
        link: "/contributor-guide/weaviate-modules",
        sidebar: "contributorModulesSidebar",
      },
      {
        label: "Weaviate Clients",
        link: "/contributor-guide/weaviate-clients",
        sidebar: "contributorClientsSidebar",
      },
      {
        label: "Contextionary",
        link: "/contributor-guide/contextionary",
        sidebar: "contributorContextionarySidebar",
      },
    ],
  },
};

export default secondaryNavbarItems;
