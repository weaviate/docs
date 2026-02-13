---
title: Weaviate Database
image: og/contributor-guide/weaviate-core.jpg
# tags: ['build, run, test']
---

Here you can find guides on how to work with the Weaviate Database [source code](https://github.com/weaviate/weaviate).

import CardsSection from "/src/components/CardsSection";

export const weaviateCoreGuidesData = [
{
id: "structure",
title: "Code structure and style",
description: "Learn Weaviate's codebase organization, coding standards, and style guidelines for consistent development.",
link: "/contributor-guide/weaviate-core/structure",
icon: "fas fa-code",
},
{
id: "cicd",
title: "CI/CD philosophy",
description: "Understand our continuous integration and deployment approach, including automated testing and release processes.",
link: "/contributor-guide/weaviate-core/cicd",
icon: "fas fa-sync-alt",
},
{
id: "tests",
title: "Tests",
description: "Explore Weaviate's testing strategy, including unit tests, integration tests, and quality assurance practices.",
link: "/contributor-guide/weaviate-core/tests",
icon: "fas fa-vial",
},
{
id: "setup",
title: "Development setup",
description: "Set up your local Weaviate development environment with all necessary tools and dependencies.",
link: "/contributor-guide/weaviate-core/setup",
icon: "fas fa-cogs",
},
{
id: "parsing",
title: "Parsing objects & resolving references",
description: "Deep dive into how Weaviate parses objects and resolves cross-references internally.",
link: "/contributor-guide/weaviate-core/parsing-cross-refs",
icon: "fas fa-project-diagram",
},
{
id: "runtime-config",
title: "Runtime configurations",
description: "Learn how to add new runtime configuration options to Weaviate's configuration system.",
link: "/contributor-guide/weaviate-core/support-new-runtime-configs",
icon: "fas fa-sliders-h",
},
];

<CardsSection items={weaviateCoreGuidesData} />
