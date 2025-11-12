# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Weaviate documentation repository, built with Docusaurus 3. It contains comprehensive documentation for the Weaviate vector database, Weaviate Cloud Services, AI agents framework, and integrations.

## Development Commands

### Setup
```bash
# Install Node.js (use version 22)
nvm install 22
nvm use 22

# Install yarn globally
npm install --global yarn

# Install dependencies
yarn install
```

### Local Development
```bash
# Start dev server (http://localhost:3000)
yarn start

# Build production site
yarn build

# Build dev site (with trailing slashes for link validation)
yarn build-dev

# Serve built site locally
yarn serve

# Clear Docusaurus cache
yarn clear
```

### Testing Code Examples

Code examples are validated via automated tests. See README-tests.md for full details.

#### Python Tests
```bash
# Setup Python environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r tests/requirements.txt

# Run all tests
pytest

# Run specific test file
pytest tests/test_quickstart.py

# Start/stop Weaviate test instances
tests/start-weaviate.sh
tests/stop-weaviate.sh
```

#### Java Tests
```bash
cd _includes/code/howto/java
mvn clean install
mvn test                      # Run all
mvn test -Dgroups="crud"      # Run specific tag
mvn test -Dtest=ManageDataCreateTest  # Run specific class
```

#### Go Tests
```bash
cd _includes/code/howto/go/docs
go mod tidy
go test                       # Run all
go test <file_path> -v        # Run specific file
```

### Link Validation
```bash
# Validate links in PR build
yarn validate-links-dev
```

## Architecture

### Directory Structure

- **`/docs`** - Main documentation content (MDX files)
  - `weaviate/` - Database documentation (26 subdirectories: API, concepts, guides, search, etc.)
  - `cloud/` - Weaviate Cloud Services docs
  - `agents/` - AI agents framework docs
  - `integrations/` - Integration guides

- **`/_includes`** - Reusable content fragments (code snippets, configurations, images)
  - Used via imports in MDX files to avoid duplication
  - Contains multi-language code examples

- **`/src`** - Custom React components and theme customizations
  - `components/` - 16 custom components (Feedback, InPageAskAI, APITable, etc.)
  - `theme/` - Docusaurus swizzled components (Navbar, Footer, SearchBar, etc.)
  - `css/` - SCSS stylesheets
  - `remark/` - Custom remark plugins for markdown processing

- **`/_build_scripts`** - Build automation and validation
  - `update-config-versions.js` - Fetches latest versions from GitHub
  - `validate-links-*.js` - Link validation for PRs
  - `publish-*.sh` - Netlify deployment scripts
  - `slack-*.sh` - Slack notification scripts

- **`/tests`** - Python test suite with Docker Compose configs
- **`/tools`** - Python utilities for content validation and transformation
- **`/static`** - Static assets (images, fonts, JS)

### Key Configuration Files

- **`docusaurus.config.js`** - Main Docusaurus configuration
- **`docusaurus.dev.config.js`** - Dev config (removes redirects, adds trailing slashes)
- **`sidebars.js`** - Sidebar navigation (~1000 lines defining doc structure)
- **`secondaryNavbar.js`** - Multi-level secondary navigation configuration
- **`versions-config.json`** - Dynamic version references for Weaviate ecosystem
- **`netlify.toml`** - Deployment config with 100+ URL redirects

### Dynamic Version Management

Version numbers are maintained in `versions-config.json` and auto-updated at build time via `_build_scripts/update-config-versions.js` (fetches from GitHub releases).

Use variables in MDX files:
```markdown
Install version ||site.weaviate_version||
```

This prevents hardcoding versions across documentation.

### Navigation System

The repository uses a multi-sidebar navigation architecture:

1. **Primary Navigation** - Top navbar with sections (Build/Database, Cloud, Agents, Integrations)
2. **Secondary Navigation** (`secondaryNavbar.js`) - Dropdown menus that swap active sidebar
3. **Sidebars** (`sidebars.js`) - Multiple named sidebars for different doc sections

The custom navbar (`src/theme/Navbar/NavbarWrapper.js`) manages:
- Sticky positioning
- Modal navigation for quick section switching
- Keyboard shortcuts (Cmd+U on Mac)
- State management via custom hooks

### Custom React Components

Located in `src/components/`:
- **Feedback** - Expandable feedback widget linking to GitHub issues
- **InPageAskAI** - LLM-powered question component
- **APITable** - Structured API parameter tables
- **DockerConfigGen** - Interactive Docker configuration generator
- **Tooltip**, **CardsSection**, **QuickLinks** - UI components
- **DocsImage** - Enhanced image component with validation
- **SkipValidationLink** - Links exempt from validation

Register new MDX components in `src/theme/MDXComponents.js`.

### Theme Customizations

Swizzled Docusaurus components in `src/theme/`:
- `Root.js` - App-level wrapper (manages Kapa.ai widget, first-visit modal)
- `Navbar/` - Custom navbar with secondary nav and modal
- `DocItem/` - Document page customizations
- `SearchBar/` - Custom search implementation

Styling in `src/css/`:
- `custom.scss` - Main styles (~2,900 lines)
- Theme variables, dark/light mode, component-specific styles

### Build Scripts

- **`update-config-versions.js`** - Fetches latest releases for Weaviate core, clients, Helm charts, etc. Updates `versions-config.json`.
- **`validate-links-*.js`** - Uses Linkinator to check internal links before deployment
- **Slack integration scripts** - Notify build status and deployments
- **Python validation tools** - Validate code blocks, find unused assets, manage language versions

### Testing Infrastructure

Code examples in `_includes/code/` are tested via:
- **Python pytest suite** - Tests quickstart, client APIs, search, compression, etc.
- **Docker Compose configs** - Spin up Weaviate instances with various configurations (anon access, RBAC, multi-node, etc.)
- **Java Maven tests** - Test Java code examples
- **Go tests** - Test Go code examples

Tests ensure documentation code examples work against live Weaviate instances.

## Working with Documentation

### Adding New Documentation

1. Create MDX files in appropriate `/docs` subdirectory
2. Update `sidebars.js` to add to navigation
3. Use dynamic version variables: `||site.variable_name||`
4. Import reusable content from `_includes/` when applicable
5. Add custom components via imports: `import ComponentName from '@site/src/components/ComponentName';`

### Code Examples Best Practices

- Place reusable code in `_includes/code/` (organized by language)
- Add tests in `/tests` for Python examples
- Ensure examples are self-contained and runnable
- Use inline assertions in examples for validation
- Set required API keys as environment variables (OPENAI_APIKEY, COHERE_APIKEY, etc.)

### Link Validation

Before PR merge:
1. Build dev site: `yarn build-dev`
2. Run link validator: `yarn validate-links-dev`
3. Fix broken internal links
4. Use `<SkipValidationLink>` component for intentionally external/placeholder links

### Styling and Theming

- SCSS variables in `src/css/variables.scss`
- Light/dark theme styles in `src/css/custom.scss`
- Component-specific styles colocated with components or in custom.scss
- Use Infima CSS variables for consistency

## Deployment

- **Production**: Deployed to docs.weaviate.io via Netlify
- **PR Previews**: Automatic preview builds for pull requests
- **Redirects**: Managed in `netlify.toml` (100+ legacy URL mappings)

## Plugins and Integrations

- **Kapa.ai** - AI chatbot widget (configured in `Root.js`)
- **Scalar** - Interactive REST API documentation at `/weaviate/api/rest`
- **Algolia** - Search functionality
- **Google Tag Manager** - Analytics
- **LLMs.txt plugin** - Generates LLM-friendly content dump
- **Mermaid** - Diagram support in markdown

## Environment Requirements

- Node.js 18+ (preferably v22)
- Python 3.8+ (for tests)
- Docker (for running Weaviate test instances)
- Java 8+ and Maven (for Java tests)
- Go (for Go tests)
