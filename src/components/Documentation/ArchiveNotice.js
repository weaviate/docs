import React from "react";
import Admonition from "@theme/Admonition";
import Link from "@docusaurus/Link";

export default function ArchiveNotice() {
  return (
    <Admonition type="danger" title="Weaviate Documentation Archive">
      <p>
        This is the <strong>Weaviate Documentation Archive</strong>. It contains
        info and code snippets for the deprecated{" "}
        <Link href="/weaviate/client-libraries/python/python_v3">
          Python v3
        </Link>{" "}
        and{" "}
        <Link href="/weaviate/client-libraries/typescript/typescript-v2">
          TypeScript v2
        </Link>{" "}
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
