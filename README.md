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

### Learn More

See [CLAUDE.md](./CLAUDE.md) for comprehensive guidance on architecture, testing, custom components, and deployment.

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
