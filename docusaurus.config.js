// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";
const {
  productDropdownHtml,
  solutionsDropdownHtml,
  developersDropdownHtml,
  companyDropdownHtml,
} = require("./src/components/dropdownConstants");

const remarkReplace = require("./src/remark/remark-replace");
// Math equation plugins
const math = require("remark-math");
const katex = require("rehype-katex");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Weaviate Documentation",
  tagline:
    "Weaviate empowers developers to deliver, scalable vector search-powered apps painlessly",
  favicon: "img/favicon.ico",
  staticDirectories: ["static"],
  // Set the production url of your site here
  url: "https://your-docusaurus-site.example.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "weaviate", // Usually your GitHub org/user name.
  projectName: "docs", // Usually your repo name.

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  plugins: [
    "docusaurus-plugin-sass",
    [
      "@scalar/docusaurus",
      {
        label: "",
        route: "/docs/weaviate/api/rest",
        configuration: {
          spec: {
            // Last updated: 2025-02-15 TODO[g-despot] Update to correct openapi_docs branch
            url: "https://raw.githubusercontent.com/weaviate/weaviate/openapi_docs_v1-29/openapi-specs/schema.json",
          },
          hideModels: true,
          // This feature currently broken - potentially fixed in: https://github.com/scalar/scalar/pull/1387
          // hiddenClients: [...],
        },
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
          path: "docs", // folder name – where the docs are
          routeBasePath: "docs", // route name – where to navigate for docs i.e. weaviate.io/<route-base-path>/...
          editUrl: "https://github.com/weaviate/weaviate-io/tree/main/",
          remarkPlugins: [remarkReplace, math],
          rehypePlugins: [katex],
        },
        /**
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },*/
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
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      navbar: {
        title: "",
        // hideOnScroll: true,
        logo: {
          alt: "Weaviate",
          src: "/img/site/weaviate-logo-horizontal-light-1.svg",
          srcDark: "/img/site/weaviate-logo-horizontal-dark-1.svg",
          href: "/docs/weaviate",
        },
        items: [
          {
            type: "dropdown",
            label: "Product",
            position: "right",
            items: [
              {
                type: "html",
                value: productDropdownHtml,
                className: "dropDownContainer2",
              },
            ],
          },
          {
            type: "dropdown",
            label: "Solutions",
            position: "right",
            items: [
              {
                type: "html",
                value: solutionsDropdownHtml,
                className: "dropDownContainer2",
              },
            ],
          },

          {
            type: "dropdown",
            label: "Developers",
            position: "right",
            items: [
              {
                type: "html",
                value: developersDropdownHtml,
                className: "dropDownContainer2",
              },
            ],
          },
          {
            type: "dropdown",
            label: "Company",
            position: "right",
            items: [
              {
                type: "html",
                value: companyDropdownHtml,
                className: "dropDownContainer2",
              },
            ],
          },
          {
            label: "Pricing",
            position: "right",
            href: "https://weaviate.io/pricing",
          },
          {
            html: `<svg class="githubStars" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
            to: "https://github.com/weaviate/weaviate",
            position: "right",
          },
          {
            label: "Try Now",
            className: "tryNow",
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
      footer: {
        style: "dark",
        links: [
          {
            title: "Build",
            items: [
              {
                label: "Documentation",
                to: "/docs/weaviate",
              },
              {
                label: "Weaviate Cloud Docs",
                to: "/docs/cloud",
              },
              {
                label: "GitHub",
                to: "https://github.com/weaviate/weaviate",
              },
            ],
          },
          {
            title: "Support",
            items: [
              {
                label: "Events & Webinars",
                to: "https://weaviate.io/community/events",
              },
              {
                label: "Weaviate Hero Program",
                href: "https://weaviate.io/community",
              },

              {
                label: "Forum",
                to: "https://forum.weaviate.io/",
              },
              {
                label: "Slack",
                to: "https://weaviate.io/slack",
              },
            ],
          },

          {
            title: "Follow Us",
            items: [
              {
                label: "GitHub",
                to: "https://github.com/weaviate/weaviate",
              },
              {
                label: "Slack",
                to: "https://weaviate.io/slack",
              },
              {
                label: "X",
                to: "https://x.com/weaviate_io",
              },
              {
                label: "Instagram",
                to: "https://instagram.com/weaviate.io",
              },
              {
                label: "YouTube",
                to: "https://youtube.com/@Weaviate",
              },
              {
                label: "LinkedIn",
                to: "https://www.linkedin.com/company/weaviate-io",
              },
            ],
          },

          {
            title: "Meetups",
            items: [
              {
                label: "Amsterdam",
                to: "https://www.meetup.com/weaviate-amsterdam",
              },
              {
                label: "Boston",
                to: "https://www.meetup.com/weaviate-boston",
              },
              {
                label: "New York",
                to: "https://www.meetup.com/weaviate-NYC",
              },
              {
                label: "San Francisco",
                to: "https://www.meetup.com/weaviate-san-francisco",
              },
              {
                label: "Toronto",
                to: "https://www.meetup.com/weaviate-toronto",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Weaviate, B.V. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      docs: {
        sidebar: {
          hideable: true,
        },
      },
    }),
};

export default config;
