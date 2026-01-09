<div style="text-align: center;">
  <a href="https://docs.weaviate.io/weaviate">
    <img src="/static/img/github/weaviate-docs-banner.png" alt="Weaviate Docs Banner" />
  </a>
</div>

This repository contains the documentation for Weaviate (vector database), Weaviate Cloud, and Weaviate Agents. It's built with Docusaurus 3.

# Contributor QuickStart

If you want to contribute to the documentation, follow these steps to get your local development environment set up.

## Quick Setup

```bash
# Install Node.js 22 and yarn
nvm install 22 && nvm use 22
npm install --global yarn

# Install dependencies and start dev server
yarn install
yarn start  # Opens http://localhost:3000
```

## Making changes

To make any changes to the documentation, edit the files in the `/docs` directory. The documentation is written in MDX, which allows you to use React components within markdown files.

### Site Structure

Documentation lives in the `/docs` directory and maps directly to site URLs:

The docs are in the following directories:
- **`/docs/weaviate/`** → Main database documentation
- **`/docs/deploy/`** → Deployment documentation
- **`/docs/cloud/`** → Weaviate Cloud docs
- **`/docs/agents/`** → Weaviate Agents docs

They are rendered using the following mapping files:
- **`secondaryNavbar.js`** → Top navigation bar (add new sections here)
- **`sidebars.js`** → Navigation structure (add new pages here to appear in sidebar)

### Working with Code Snippets

Code examples use the `FilteredTextBlock` component to extract sections from full, runnable code files:

1. **Code files** live in `_includes/code/` or nested within doc directories (e.g., `docs/weaviate/tutorials/_includes/`)
2. **Mark sections** in code files with comments:
   ```python
   # START SectionName
   # Your code here
   # END SectionName
   ```
3. **Import and display** in MDX files:
   ```jsx
   import FilteredTextBlock from "@site/src/components/Documentation/FilteredTextBlock";
   import PyCode from "!!raw-loader!/_includes/code/example.py";

   <FilteredTextBlock
     text={PyCode}
     startMarker="# START SectionName"
     endMarker="# END SectionName"
     language="py"
   />
   ```

This keeps code DRY and ensures examples are tested as complete, runnable scripts.

### Pushing changes

To get your changes merged, create a PR against the `main` branch. The repo requires a review from at least one maintainer before merging.

The documentation site is automatically rebuilt and deployed on every push to `main` using GitHub Actions.

# Comprehensive Setup Guide

## How to build this website

Weaviate uses [Docusaurus 3](https://docusaurus.io/) to build our
documentation. Docusaurus is a static website generator that runs under
[Node.js](https://nodejs.org/). We use a Node.js project management tool called
[yarn](https://yarnpkg.com/) to install Docusaurus and to manage project
dependencies.

If you do not have Node.js and `yarn` installed on your system, install them
first.

### Install Node.js

Use the [nvm](https://github.com/nvm-sh/nvm) package manager to install Node.js.
The `nvm` project page provides an [installation script](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating).

After you install `nvm` use it to install Node.js.

```
nvm install
```

By default, `nvm` installs the most recent version of Node.js. Also install the version of Node.js that is specified in `.github/workflows/pull_requests.yaml`. At the time of writing it is version `v22.12.0`.

```
nvm install 22
nvm use 22
```

### Install yarn

Node.js includes the [npm](https://www.npmjs.com/) package manager. Use `npm`
to install `yarn`.

```
npm install --global yarn
```

### Update Dependencies

Once you have a local copy of the repository, you need to install Docusaurus and
the other project dependencies.

Switch to the project directory, then use yarn to update the dependencies.

```
yarn install
```

You may see some warnings during the installation.

### Local Development

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

```
yarn start
```

Open http://localhost:3000/ showing the local build. If you close the terminal, the server will stop. Or press `Ctrl+C`/`Cmd+C` to stop the server.

### Build the Web Site

This command generates static content into the `build` directory. You can use
a hosting service to serve the static content.

```
yarn build
```

The `build` command is useful when you are finished editing. If you ran
`yarn start` to start a local web server, you do not need to use `yarn build` to
see you changes while you are editing.

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Site Architecture & Directory Structure

Understanding the repository structure will help you navigate and contribute effectively:

### Core Directories

- **`/docs`** - Main documentation content (MDX files)
  - `weaviate/` - Database documentation with 26+ subdirectories (API, concepts, guides, search, etc.)
  - `cloud/` - Weaviate Cloud Services documentation
  - `agents/` - AI agents framework documentation
  - `deploy/` - Deployment guides
  - Note: `/integrations` was removed in Dec 2025; integration pages now live on the main Weaviate site

- **`/_includes`** - Reusable content fragments
  - Code snippets organized by language
  - Configuration files
  - Images and other shared assets
  - Used via imports in MDX files to avoid duplication

- **`/src`** - Custom React components and theme customizations
  - `components/` - 16+ custom components (Feedback, InPageAskAI, APITable, FilteredTextBlock, etc.)
  - `theme/` - Docusaurus swizzled components (Navbar, Footer, SearchBar, etc.)
  - `css/` - SCSS stylesheets (~2,900 lines in custom.scss)
  - `remark/` - Custom remark plugins for markdown processing

- **`/_build_scripts`** - Build automation and validation
  - `update-config-versions.js` - Fetches latest versions from GitHub
  - `validate-links-*.js` - Link validation for PRs
  - `publish-*.sh` - Netlify deployment scripts
  - `slack-*.sh` - Slack notification scripts

- **`/tests`** - Python test suite with Docker Compose configs
- **`/tools`** - Python utilities for content validation and transformation
- **`/static`** - Static assets (images, fonts, JavaScript files)

### Key Configuration Files

- **`docusaurus.config.js`** - Main Docusaurus configuration
- **`docusaurus.dev.config.js`** - Dev config (removes redirects, adds trailing slashes for link validation)
- **`sidebars.js`** - Sidebar navigation structure (~1000 lines defining doc hierarchy)
- **`secondaryNavbar.js`** - Multi-level secondary navigation configuration
- **`versions-config.json`** - Dynamic version references for Weaviate ecosystem
- **`netlify.toml`** - Deployment config with 100+ URL redirects

## Navigation System

The site uses a multi-level navigation architecture:

1. **Primary Navigation** - Top navbar with main sections (Build/Database, Cloud, Agents, Integrations)
2. **Secondary Navigation** (`secondaryNavbar.js`) - Dropdown menus that swap the active sidebar
3. **Sidebars** (`sidebars.js`) - Multiple named sidebars for different documentation sections

The custom navbar (`src/theme/Navbar/NavbarWrapper.js`) provides:
- Sticky positioning
- Modal navigation for quick section switching
- Keyboard shortcuts (Cmd+U on Mac)
- State management via custom hooks

To add new pages to navigation:
1. Add the page to the appropriate sidebar in `sidebars.js`
2. If creating a new section, update `secondaryNavbar.js`

## Dynamic Version Management

Version numbers are maintained in `versions-config.json` and automatically updated at build time via `_build_scripts/update-config-versions.js` (fetches from GitHub releases).

Use version variables in MDX files instead of hardcoding:
```markdown
Install version ||site.weaviate_version||
```

This prevents version numbers from becoming stale across the documentation.

## Custom React Components

Custom components are located in `src/components/`. Key components include:

- **FilteredTextBlock** - Extracts and displays sections from code files (most commonly used)
- **Feedback** - Expandable feedback widget linking to GitHub issues
- **InPageAskAI** - LLM-powered question component
- **APITable** - Structured API parameter tables
- **DockerConfigGen** - Interactive Docker configuration generator
- **DocsImage** - Enhanced image component with validation
- **SkipValidationLink** - Links exempt from validation

To use a component in MDX:
```jsx
import FilteredTextBlock from "@site/src/components/Documentation/FilteredTextBlock";
import PyCode from "!!raw-loader!/_includes/code/example.py";

<FilteredTextBlock
  text={PyCode}
  startMarker="# START SectionName"
  endMarker="# END SectionName"
  language="py"
/>
```

Register new MDX components in `src/theme/MDXComponents.js`.

## Testing Code Examples

Code examples in `_includes/code/` are validated via automated tests to ensure they work correctly. This includes:

- **Python tests** via pytest
- **Java tests** via Maven
- **Go tests** via go test
- **Docker Compose configs** for spinning up Weaviate test instances

For complete testing documentation, see [README-tests.md](README-tests.md).

### Quick Testing Commands

```bash
# Python tests
pytest
pytest tests/test_quickstart.py  # Specific file

# Start/stop Weaviate test instances
tests/start-weaviate.sh
tests/stop-weaviate.sh
```

## Link Validation

Before PRs are merged, internal links are validated to prevent broken links:

```bash
# Build dev site (with trailing slashes for validation)
yarn build-dev

# Validate links
yarn validate-links-dev
```

Use the `<SkipValidationLink>` component for intentionally external or placeholder links.

## Deployment

- **Production**: Deployed to docs.weaviate.io via Netlify
- **PR Previews**: Automatic preview builds for all pull requests
- **Redirects**: Managed in `netlify.toml` (100+ legacy URL mappings)
- **Auto-deployment**: Site automatically rebuilds and deploys on every push to `main`

## Plugins and Integrations

The site uses several plugins and integrations:

- **Kapa.ai** - AI chatbot widget (configured in `Root.js`)
- **Scalar** - Interactive REST API documentation at `/weaviate/api/rest`
- **Algolia** - Search functionality
- **Google Tag Manager** - Analytics
- **LLMs.txt plugin** - Generates LLM-friendly content dump
- **Mermaid** - Diagram support in markdown

## Theme Customizations

Swizzled Docusaurus components in `src/theme/`:
- `Root.js` - App-level wrapper (manages Kapa.ai widget, first-visit modal)
- `Navbar/` - Custom navbar with secondary nav and modal
- `DocItem/` - Document page customizations
- `SearchBar/` - Custom search implementation

Styling in `src/css/`:
- `custom.scss` - Main styles (~2,900 lines)
- Theme variables for light/dark mode
- Component-specific styles
