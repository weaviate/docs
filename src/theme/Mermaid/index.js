import React from "react";
import Mermaid from "@theme-original/Mermaid";

/**
 * Renders the Mermaid diagram, plus its source for the Markdown export.
 *
 * Mermaid draws diagrams in the browser, so the built HTML has no trace of
 * them. The hidden <pre> puts the source into the HTML, where
 * src/plugins/markdown-export turns it into a `mermaid` fence. The attribute
 * names match MARKDOWN_SOURCE_ATTRIBUTE and MARKDOWN_CONTENT_ATTRIBUTE in
 * html-to-markdown.mjs; they are not imported because that module would pull
 * its Markdown dependencies into the browser bundle. The "Copy page" button
 * drops [hidden] elements, so its output is unchanged.
 *
 * The source is URI-encoded in an attribute rather than written as text: the
 * rspack HTML minifier unescapes `&amp;&lt;br>` in text to `&<br>`, which then
 * parses as a real <br> element.
 */
export default function MermaidWrapper(props) {
  return (
    <>
      <Mermaid {...props} />
      <pre hidden data-markdown-source="mermaid" data-markdown-content={encodeURIComponent(props.value)} />
    </>
  );
}
