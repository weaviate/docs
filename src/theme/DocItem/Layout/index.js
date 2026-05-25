import React from "react";
import clsx from "clsx";
import Head from "@docusaurus/Head";
import { useWindowSize } from "@docusaurus/theme-common";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import DocItemPaginator from "@theme/DocItem/Paginator";
import DocVersionBanner from "@theme/DocVersionBanner";
import DocVersionBadge from "@theme/DocVersionBadge";
import DocItemFooter from "@theme/DocItem/Footer";
import DocItemTOCMobile from "@theme/DocItem/TOC/Mobile";
import DocItemTOCDesktop from "@theme/DocItem/TOC/Desktop";
import DocItemContent from "@theme/DocItem/Content";
import DocBreadcrumbs from "@theme/DocBreadcrumbs";
import ContentVisibility from "@theme/ContentVisibility";
import styles from "./styles.module.css";

/* ---- START: Customizations ---- */
import FeedbackComponent from "@site/src/components/Feedback";
import PageRatingWidget from "@site/src/components/PageRatingWidget";
import ContextualMenu from "@site/src/components/ContextualMenu";
/* ---- END: Customizations ---- */

// Emit a schema.org FAQPage JSON-LD block when the page's frontmatter declares
// a `faq:` list. Google reads this for entity understanding; rich-result FAQ
// snippets themselves are restricted post-2024 so don't expect a SERP card.
function FaqJsonLd({ faq }) {
  if (!Array.isArray(faq) || faq.length === 0) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq
      .filter((item) => item && item.question && item.answer)
      .map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
  };
  if (data.mainEntity.length === 0) return null;
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Head>
  );
}

/**
 * Decide if the toc should be rendered, on mobile or desktop viewports
 */
function useDocTOC() {
  const { frontMatter, toc } = useDoc();
  const windowSize = useWindowSize();
  const hidden = frontMatter.hide_table_of_contents;
  const canRender = !hidden && toc.length > 0;
  const mobile = canRender ? <DocItemTOCMobile /> : undefined;
  const desktop =
    canRender && (windowSize === "desktop" || windowSize === "ssr") ? (
      <DocItemTOCDesktop />
    ) : undefined;
  return {
    hidden,
    mobile,
    desktop,
  };
}

export default function DocItemLayout({ children }) {
  const docTOC = useDocTOC();
  const { frontMatter, metadata } = useDoc();
  const windowSize = useWindowSize();

  // Check if feedback widget should be shown
  // Default to true if not specified, false if explicitly set to false
  const feedbackEnabled = frontMatter.show_feedback_widget !== false;

  // Only show feedback if TOC is not hidden, has content, and is not disabled
  const showFeedback = !docTOC.hidden && docTOC.desktop && feedbackEnabled;
  const showMobileFeedback =
    !docTOC.hidden && !docTOC.desktop && docTOC.mobile && feedbackEnabled;

  return (
    <>
      <FaqJsonLd faq={frontMatter.faq} />
      <div className="row">
        <div className={clsx("col", !docTOC.hidden && styles.docItemCol)}>
          <ContentVisibility metadata={metadata} />
          <DocVersionBanner />
          <div className={styles.docItemContainer}>
            <article>
              <div className={styles.docHeader}>
                <div className={styles.docHeaderLeft}>
                  <DocBreadcrumbs />
                </div>
                <div className={styles.docHeaderRight}>
                  <ContextualMenu />
                </div>
              </div>
              <DocVersionBadge />
              {docTOC.mobile}
              <DocItemContent>{children}</DocItemContent>
              <DocItemFooter />
            </article>
            <DocItemPaginator />
          </div>
          {/* ---- REMOVED: Feedback component from main column ---- */}
        </div>
        {docTOC.desktop && (
          <div className="col col--3">
            {/* ---- START: Customizations ---- */}
            <div className={styles.customTocStickyContainer}>
              {docTOC.desktop}
              {/* TODO: Temporarily hidden while debugging env vars */}
              <PageRatingWidget />
            </div>
            {/* Feedback component back in TOC column */}
            {showFeedback && (
              <div className={styles.feedbackWrapper}>
                <FeedbackComponent />
              </div>
            )}
            {/* ---- END: Customizations ---- */}
          </div>
        )}
      </div>

      {/* ---- START: Mobile/Tablet Feedback Component ---- */}
      {/* Only show mobile feedback when TOC exists but isn't shown on desktop */}
      {showMobileFeedback && <FeedbackComponent />}
      {/* ---- END: Mobile/Tablet Feedback Component ---- */}
    </>
  );
}
