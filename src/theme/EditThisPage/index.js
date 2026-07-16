import React from "react";
import Link from "@docusaurus/Link";
import { ThemeClassNames } from "@docusaurus/theme-common";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useLocation } from "@docusaurus/router";

// Replaces the default "Edit this page" link with a documentation feedback
// link that opens the same prefilled GitHub issue as the feedback widget
// (src/components/Feedback).
export default function EditThisPage() {
  const { siteConfig } = useDocusaurusContext();
  const location = useLocation();
  const params = new URLSearchParams({
    template: "doc_feedback.yml",
    title: "[Documentation Feedback]: ",
    labels: "user-feedback",
    "page-url": `${siteConfig.url}${location.pathname}`,
  });
  return (
    <Link
      to={`https://github.com/weaviate/docs/issues/new?${params.toString()}`}
      className={ThemeClassNames.common.editThisPage}
    >
      <i className="fas fa-comment-dots" aria-hidden="true" /> Documentation
      Feedback
    </Link>
  );
}
