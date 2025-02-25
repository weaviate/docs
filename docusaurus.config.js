// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

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
  plugins: ["docusaurus-plugin-sass"],
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
          routeBasePath: "/", // route name – where to navigate for docs i.e. weaviate.io/<route-base-path>/...
          editUrl: "https://github.com/weaviate/weaviate-io/tree/main/",
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
    '/fonts/font-awesome/fontawesome.css',
    '/fonts/font-awesome/solid.css',
    '/fonts/font-awesome/regular.css',
    '/fonts/font-awesome/brands.css',
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
        },
        items: [
          /*
          {
            type: 'docSidebar',
            position: 'left',
            sidebarId: 'getStartedSidebar',
            label: 'Get Started',
          },
          {
            type: 'docSidebar',
            position: 'left',
            sidebarId: 'modelProvidersSidebar',
            label: 'Model Integrations',
          },
          {
            type: 'docSidebar',
            position: 'left',
            sidebarId: 'conceptsSidebar',
            label: 'Concepts',
          },
          {
            type: 'docSidebar',
            position: 'left',
            sidebarId: 'guidesSidebar',
            label: 'Tutorials & guides',
          },
          {
            type: 'docSidebar',
            position: 'left',
            sidebarId: 'referenceSidebar',
            label: 'Reference',
          },
          {
            type: 'docSidebar',
            position: 'left',
            sidebarId: 'releasesSidebar',
            label: 'Releases',
          },
          {
            type: 'docSidebar',
            position: 'left',
            sidebarId: 'othersSidebar',
            label: 'Others',
          },
          */
          {
            type: "dropdown",
            label: "Product",
            position: "right",
            items: [
              {
                type: "html",
                value:
                  '<div class="holder"><ul class="holdRightnoBorder"><li class="dropDownLabel">Overview</li><li><a class="dropdown__link" href="/platform">Vector Database</a></li><li><a class="dropdown__link" href="/workbench">Workbench</a></li><li><a class="dropdown__link" href="/product/integrations">Integrations</a></li></ul><div class="divider"></div><ul class="holdRightnoBorder"><li class="dropDownLabel" >Deployment</li><li><a class="dropdown__link" href="/deployment/serverless">Serverless Cloud</a></li><li><a class="dropdown__link" href="/deployment/enterprise-cloud">Enterprise Cloud</a></li><li><a class="dropdown__link" href="/deployment/byoc">Bring Your Own Cloud</a></li><li><a class="dropdown__link" href="/deployment/enablement">Enablement</a></li></ul></div><ul class="menu__list mobileNav"><li class="dropDownLabel mobDrop">Overview</li><li class="menu__list-item"><a class="menu__link" href="/platform">Vector Database</a></li><li class="menu__list-item"><a class="menu__link" href="/workbench">Workbench</a></li><li class="menu__list-item"><a class="menu__link" href="/product/integrations">Integrations</a></li><li class="dropDownLabel mobDrop">Deployment</li><li class="menu__list-item"><a class="menu__link" href="/deployment/serverless">Serverless Cloud</a></li><li class="menu__list-item"><a class="menu__link" href="/deployment/enterprise-cloud">Enterprise Cloud</a></li><li class="menu__list-item"><a class="menu__link" href="/deployment/byoc">Bring Your Own Cloud</a></li><li class="menu__list-item"><a class="menu__link" href="/deployment/enablement">Enablement</a></li></ul>',
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
                value:
                  '<div class="holder"><ul class="holdRightnoBorder"><li class="dropDownLabel">Use Cases</li><li><a class="dropdown__link" href="/rag">RAG</a></li><li><a class="dropdown__link" href="/hybrid-search">Hybrid Search</a></li><li><a class="dropdown__link" href="/gen-feedback-loops">Generative Feedback Loops</a></li><li><a class="dropdown__link" href="/cost-performance-optimization">Cost-Performance Optimization</a></li></ul><div class="divider"></div><ul class="holdRightnoBorder"><li class="dropDownLabel" >Examples</li><li><a class="dropdown__link" href="/case-studies">Case Studies</a></li><li><a class="dropdown__link" href="/community/demos">Demos</a></li></ul></div><ul class="menu__list mobileNav"><li class="dropDownLabel mobDrop">Use Cases</li><li class="menu__list-item"><a class="menu__link" href="/rag">RAG</a></li><li class="menu__list-item"><a class="menu__link" href="/hybrid-search">Hybrid Search</a></li><li class="menu__list-item"><a class="menu__link" href="/gen-feedback-loops">Generative Feedback Loops </a></li><li class="menu__list-item"><a class="menu__link" href="/deployment/enterprise-cloud">Infrastructure Optimization</a></li><li class="dropDownLabel mobDrop">Examples</li><li class="menu__list-item"><a class="menu__link" href="/case-studies">Case Studies</a></li><li class="menu__list-item"><a class="menu__link" href="/community/demos">Demos</a></li></ul>',
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
                value:
                  '<div class="holder"><ul class="holdRightnoBorder"><li class="dropDownLabel">Build</li><li><a class="dropdown__link" href="/weaviate">Documentation</a></li><li><a class="dropdown__link" href="/cloud">Weaviate Cloud Docs</a></li><li><a class="dropdown__link" href="/developers/integrations">Integrations Docs</a></li><li><a class="dropdown__link" href="https://github.com/weaviate/weaviate">GitHub</a></li></ul><div class="divider"></div><ul class="holdRightnoBorder"><li class="dropDownLabel" >Learn</li><li><a class="dropdown__link" href="/learn">Learning Center</a></li><li><a class="dropdown__link" href="https://weaviate.io/blog">Blog</a></li><li><a class="dropdown__link" href="/academy">Academy</a></li><li><a class="dropdown__link" href="/community/events">Workshops</a></li><li><a class="dropdown__link" href="/community/build-with-weaviate">Showcases</a></li><li><a class="dropdown__link" href="/learn/knowledgecards">Knowledge Cards</a></li><li><a class="dropdown__link" href="/javascript">JavaScript</a></li><li><a class="dropdown__link" href="/papers">Paper Reviews</a></li><li><a class="dropdown__link" href="https://weaviate.io/podcast">Podcasts</a></li></ul><div class="divider"></div><ul class="holdRightnoBorder"><li class="dropDownLabel" >Engage</li><li><a class="dropdown__link" href="/community/events">Events & Webinars</a></li><li><a class="dropdown__link" href="/community">Weaviate Hero Program</a></li><li><a class="dropdown__link" href="https://forum.weaviate.io/">Forum</a></li><li><a class="dropdown__link" href="https://weaviate.io/slack">Slack</a></li></ul></div><ul class="menu__list mobileNav"><li class="menu__list-item"><li class="dropDownLabel mobDrop">Build</li><a class="menu__link" href="/weaviate">Documentation</a></li><li class="menu__list-item"><a class="menu__link" href="/cloud">Weaviate Cloud Docs</a></li><li class="menu__list-item"><a class="menu__link" href="/cloud">Integrations Docs</a></li><li class="menu__list-item"><a class="menu__link" href="https://github.com/weaviate/weaviate">GitHub</a></li><li class="dropDownLabel mobDrop">Learn</li><li class="menu__list-item"><a class="menu__link" href="/learn">Learning Center</a></li><li class="menu__list-item"><a class="menu__link" href="/blog">Blog</a></li><li class="menu__list-item"><a class="menu__link" href="/academy">Academy</a></li><li class="menu__list-item"><a class="menu__link" href="/community/events">Workshops</a></li></li><li class="menu__list-item"><li class="menu__list-item"><a class="menu__link" href="/community/build-with-weaviate">Showcases</a></li><li class="menu__list-item"><a class="menu__link" href="/learn/knowledgecards">Knowledge Cards</a></li><li class="menu__list-item"><a class="menu__link" href="/papers">Paper Reviews</a></li><li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/podcast">Podcasts</a></li><li class="dropDownLabel mobDrop">Engage</li><li class="menu__list-item"><a class="menu__link" href="/community/events">Events & Webinars</a></li><li class="menu__list-item"><a class="menu__link" href="/community">Weaviate Hero Program</a></li><li class="menu__list-item"><a class="menu__link" href="https://forum.weaviate.io/">Forum</a></li><li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/slack">Slack</a></li></ul>',
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
                value:
                  '<div class="holder"><ul class="holdRightnoBorder"><li class="dropDownLabel">Partners</li><li><a class="dropdown__link" href="/partners">Overview</a></li><li><a class="dropdown__link" href="/partners/aws">AWS</a></li><li><a class="dropdown__link" href="/partners/gcp">Google</a></li><li><a class="dropdown__link" href="/partners/snowflake">Snowflake</a></li></ul><div class="divider"></div><ul class="holdRightnoBorder"><li class="dropDownLabel" >About</li><li><a class="dropdown__link" href="/company/about-us">Company</a></li><li><a class="dropdown__link" href="/company/careers">Careers</a></li><li><a class="dropdown__link" href="/company/remote">Remote</a></li><li><a class="dropdown__link" href="/company/playbook">Playbook</a></li><li><a class="dropdown__link" href="/company/investors">Investors</a></li><li><a class="dropdown__link" href="/contact">Contact Us</a></li></ul></div><ul class="menu__list mobileNav"><li class="dropDownLabel mobDrop">About</li><li class="menu__list-item"><a class="menu__link" href="/company/about-us">Company</a></li><li class="menu__list-item"><a class="menu__link" href="/company/careers">Careers</a></li><li class="menu__list-item"><a class="menu__link" href="/company/remote">Remote</a></li><li class="menu__list-item"><a class="menu__link" href="/company/playbook">Playbook</a></li><li class="menu__list-item"><a class="menu__link" href="/company/investors">Investors</a></li><li class="menu__list-item"><a class="menu__link" href="/contact">Contact Us</a></li><li class="dropDownLabel mobDrop">Partners</li><li class="menu__list-item"><a class="menu__link" href="/partners">Overview</a></li><li class="menu__list-item"><a class="menu__link" href="/partners/aws">AWS</a></li><li class="menu__list-item"><a class="menu__link" href="/partners/gcp">Google</a></li><li class="menu__list-item"><a class="menu__link" href="/partners/snowflake">Snowflake</a></li><li class="menu__list-item"></ul>',
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
            title: "Product",
            items: [
              {
                label: "Vector Database",
                to: "https://weaviate.io/platform",
              },

              {
                label: "Workbench",
                to: "https://weaviate.io/workbench",
              },
              {
                label: "Pricing",
                to: "https://weaviate.io/pricing",
              },
              {
                label: "Weaviate Cloud",
                to: "https://console.weaviate.cloud/",
              },
              {
                label: "Deployment",
                to: "#",
                className: "footer__title subtitle",
              },
              {
                label: "Serverless Cloud",
                to: "https://weaviate.io/deployment/serverless",
              },
              {
                label: "Enterprise Cloud",
                to: "https://weaviate.io/deployment/enterprise-cloud",
              },
              {
                label: "Bring Your Own Cloud",
                to: "https://weaviate.io/deployment/byoc",
              },
              {
                label: "Enablement",
                to: "https://weaviate.io/deployment/enablement",
              },
              {
                label: "Trust",
                to: "#",
                className: "footer__title subtitle",
              },
              {
                label: "Security",
                to: "https://weaviate.io/security",
              },
              {
                label: "Terms & Policies",
                to: "https://weaviate.io/service",
              },
            ],
          },
          {
            title: "Use Cases",
            items: [
              {
                label: "RAG",
                to: "https://weaviate.io/RAG",
              },
              {
                label: "Hybrid Search",
                to: "https://weaviate.io/hybrid-search",
              },
              {
                label: "Generative Feedback Loops",
                to: "https://weaviate.io/gen-feedback-loops",
              },
              {
                label: "Cost Performance Optimization",
                to: "https://weaviate.io/cost-performance-optimization",
              },
              {
                label: "Examples",
                to: "#",
                className: "footer__title subtitle",
              },
              {
                label: "Showcases",
                to: "https://weaviate.io/community/build-with-weaviate",
              },
              {
                label: "Demos",
                to: "https://weaviate.io/community/demos",
              },
            ],
          },
          {
            title: "Learn",
            items: [
              {
                label: "Learning Center",
                to: "https://weaviate.io/learn",
              },
              {
                label: "Blog",
                to: "https://weaviate.io/blog",
              },
              {
                label: "Academy",
                to: "/academy",
              },
              {
                label: "Workshops",
                to: "https://weaviate.io/community/events",
              },
              {
                label: "Knowledge Cards",
                to: "https://weaviate.io/learn/knowledgecards",
              },
              {
                label: "Paper Reviews",
                to: "https://weaviate.io/papers",
              },
              {
                label: "Podcasts",
                to: "https://weaviate.io/podcast",
              },

              {
                label: "Build",
                to: "#",
                className: "footer__title subtitle",
              },
              {
                label: "Documentation",
                to: "/",
              },
              {
                label: "Weaviate Cloud Docs",
                to: "/cloud",
              },
              {
                label: "GitHub",
                to: "https://github.com/weaviate/weaviate",
              },

              {
                label: "Engage",
                to: "#",
                className: "footer__title subtitle",
              },
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
            title: "About",
            items: [
              {
                label: "Company",
                to: "https://weaviate.io/company/about-us",
              },
              {
                label: "Careers",
                to: "https://weaviate.io/company/careers",
              },
              {
                label: "Remote",
                to: "https://weaviate.io/company/remote",
              },
              {
                label: "Playbook",
                to: "https://weaviate.io/company/playbook",
              },
              {
                label: "Investors",
                to: "https://weaviate.io/company/investors",
              },
              {
                label: "Contact Us",
                to: "https://weaviate.io/contact",
              },
              {
                label: "Partners",
                to: "#",
                className: "footer__title subtitle",
              },
              {
                label: "Overview",
                to: "https://weaviate.io/partners",
              },
              {
                label: "AWS",
                to: "https://weaviate.io/partners/aws",
              },
              {
                label: "Google Cloud",
                to: "https://weaviate.io/partners/gcp",
              },
              {
                label: "Snowflake",
                to: "https://weaviate.io/partners/snowflake",
              },
              {
                label: "Become a Partner",
                to: "https://weaviate.io/partners",
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
              {
                label: "Meetups",
                to: "#",
                className: "footer__title subtitle",
              },
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
