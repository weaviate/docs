import {
  faCode,
  faCloud,
  faGraduationCap,
  faPuzzlePiece,
} from "@fortawesome/free-solid-svg-icons";

const secondaryNavbarItems = {
  build: {
    title: "Build",
    icon: faCode,
    description: "Develop applications using Weaviate's APIs and tools.",
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
        label: "Tutorials & guides",
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
  cloud: {
    title: "Cloud",
    icon: faCloud,
    description: "Manage and scale Weaviate in the cloud.",
    links: [{ label: "Getting Started", link: "/wcs", sidebar: "wcsSidebar" }],
  },
  academy: {
    title: "Academy",
    icon: faGraduationCap,
    description:
      "Learn about vector search and Weaviate through structured courses.",
    links: [
      { label: "Getting Started", link: "/academy", sidebar: "academySidebar" },
    ],
  },
  integrations: {
    title: "Integrations",
    icon: faPuzzlePiece,
    description: "For hyperscalers, data platforms, LLM frameworks, etc.",
    links: [
      {
        label: "Getting Started",
        link: "/integrations",
        sidebar: "integrationsSidebar",
      },
    ],
  },
};

export default secondaryNavbarItems;
