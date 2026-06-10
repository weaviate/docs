# Contextual Menu Component

A dropdown menu component that appears in the top right corner of documentation pages, providing quick actions for page content.

## Features

- **Copy page as Markdown**: Copies the current page content as markdown formatted for LLMs
- **Open in ChatGPT**: Opens ChatGPT with a prompt about the current page
- **Open in Claude**: Opens Claude with a prompt about the current page (highlighted option)
- **Connect to Cursor**: Links to Cursor MCP server installation
- **Connect to VS Code**: Links to VS Code MCP extension

## Usage

The component is automatically included in all documentation pages via the DocItem Layout component.

## Styling

Styles are defined in `styles.module.scss` and support both light and dark themes. The component uses Docusaurus CSS variables for consistent theming.

## Customization

To modify the menu options, edit the `index.js` file and update:
- Menu item handlers (e.g., `handleOpenInClaude`)
- Menu item JSX in the dropdown
- Icons and descriptions

## Technical Details

- Uses React hooks (`useState`, `useRef`, `useEffect`) for state management
- Closes on outside clicks using event listeners
- Accesses page metadata via `useDoc()` hook from Docusaurus
- Responsive design with mobile-specific styles
