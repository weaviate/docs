import React from "react";
import Admonition from "@theme/Admonition";

export default function ArchiveNotice() {
  return (
    <Admonition type="danger" title="Weaviate Documentation Archive">
      <p>
        This is the <strong>Weaviate Documentation Archive</strong>. It contains
        info and code snippets for the deprecated Python v3 and TypeScript v2
        clients.
        <br />
        The official and up-to-date documentation is available at{" "}
        <strong>
          <a href="https://docs.weaviate.io/">docs.weaviate.io</a>
        </strong>
        .
      </p>
    </Admonition>
  );
}
