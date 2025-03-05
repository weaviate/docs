import React from "react";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import DocPaginator from "@theme/DocPaginator";

export default function DocItemPaginator() {
  const { metadata } = useDoc();
  const { pagination_next, pagination_prev } = metadata.frontMatter;

  // Only show the paginator if either pagination_next or pagination_prev are defined
  if (!pagination_next && !pagination_prev) {
    console.log(pagination_next);
    return null;
  }
  return <DocPaginator previous={metadata.prev} next={metadata.next} />;
}
