// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";
import commonRoomScript from "./src/scripts/commonroom.js";
import hubspotScript from "./src/scripts/hubspot.js";

const remarkReplace = require("./src/remark/remark-replace");
// Math equation plugins
const math = require("remark-math");
const katex = require("rehype-katex");
const siteRedirects = require("./site.redirects");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Weaviate Documentation",
  tagline:
    "Weaviate empowers developers to deliver, scalable vector search-powered apps painlessly",
  favicon: "img/favicon.ico",
  staticDirectories: ["static"],
  // url: "https://weaviate.io",
  url: "https://docs.weaviate.io",
  baseUrl: "/",
  trailingSlash: false,
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  headTags: [commonRoomScript, hubspotScript],

  plugins: [
    "docusaurus-plugin-sass",
    ["@docusaurus/plugin-client-redirects", siteRedirects],
    [
      "@scalar/docusaurus",
      {
        label: "",
        route: "/weaviate/api/rest",
        configuration: {
          spec: {
            // Last updated: 2025-02-15 TODO[g-despot] Update to correct openapi_docs branch
            url: "https://raw.githubusercontent.com/weaviate/weaviate/openapi_docs_v1-30/openapi-specs/schema.json",
          },
          hideModels: true,
          // This feature currently broken - potentially fixed in: https://github.com/scalar/scalar/pull/1387
          // hiddenClients: [...],
        },
      },
    ],
    [
      "@signalwire/docusaurus-plugin-llms-txt",
      {
        siteTitle: "Weaviate Documentation",
        siteDescription:
          "Comprehensive guides and references for Weaviate, the open-source vector database.",
        depth: 3,
        content: {
          //excludeRoutes: ["/academy/**", "/contributor-guide/**"], // Throwing an error in GitHub Actions
          enableMarkdownFiles: false,
        },
        //logLevel: 3, // Uncomment to enable debug logging
      },
    ],
    [
      "@docusaurus/plugin-google-tag-manager",
      {
        containerId: process.env.GOOGLE_CONTAINER_ID || "None",
      },
    ],
  ],
  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid"],
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          path: "docs",
          routeBasePath: "/",
          editUrl: "https://github.com/weaviate/docs/tree/main/",
          remarkPlugins: [remarkReplace, math],
          rehypePlugins: [katex],
        },
        theme: {
          customCss: [
            require.resolve("./src/css/custom.scss"),
            require.resolve("./src/css/blog-and-docs.scss"),
          ],
        },
      }),
    ],
  ],
  stylesheets: [
    // Add Font Awesome stylesheets
    "/fonts/font-awesome/fontawesome.css",
    "/fonts/font-awesome/solid.css",
    "/fonts/font-awesome/regular.css",
    "/fonts/font-awesome/brands.css",
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: "og/default.jpg",
      announcementBar: {
        id: "announcement-bar-september-2025",
        content: `<a href="https://docs.weaviate.io/agents/query">Product update: The Weaviate Query Agent has been released!</a>`,
        backgroundColor: "#1C1468",
        textColor: "#F5F5F5",
        isCloseable: true,
      },
      navbar: {
        title: "",
        logo: {
          alt: "Weaviate",
          src: "/img/site/weaviate-logo-horizontal-light-1.svg",
          srcDark: "/img/site/weaviate-logo-horizontal-dark-1.svg",
          href: "https://weaviate.io",
        },
        items: [
          {
            html: `<svg class="githubStars" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
            to: "https://github.com/weaviate/weaviate",
            position: "right",
          },
          {
            label: "Weaviate Cloud",
            className: "modern-button",
            to: "https://console.weaviate.cloud",
            position: "right",
          },
          {
            type: "search",
            position: "right",
            className: "hiddenSearch",
          },
        ],
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ["java"],
      },
      docs: {
        sidebar: {
          hideable: true,
        },
      },
    }),
};

export default config;
