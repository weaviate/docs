const { visit } = require('unist-util-visit');

// Marks the "## Questions and feedback" heading with data-copy-exclude.
//
// About 330 pages end with that heading followed by <DocsFeedback />, whose
// content (_includes/docs-feedback.mdx) is already marked data-copy-exclude.
// A Markdown heading cannot carry attributes, and a JSX <h2> would drop out of
// the table of contents, so the marker is added here. Without it, the "Copy
// page" output and the build's Markdown export (src/plugins/markdown-export)
// end with an empty heading.
const HEADING_TEXT = 'Questions and feedback';

const plugin = () => (ast) => {
  visit(ast, 'heading', (node) => {
    const [child] = node.children;
    if (node.depth !== 2 || node.children.length !== 1 || child.type !== 'text' || child.value.trim() !== HEADING_TEXT) return;
    node.data = { ...node.data, hProperties: { ...node.data?.hProperties, 'data-copy-exclude': '' } };
  });
};

module.exports = plugin;
