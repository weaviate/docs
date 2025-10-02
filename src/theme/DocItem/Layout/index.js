import React from "react";
import clsx from "clsx";
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
/* ---- END: Customizations ---- */

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
      <div className="row">
        <div className={clsx("col", !docTOC.hidden && styles.docItemCol)}>
          <ContentVisibility metadata={metadata} />
          <DocVersionBanner />
          <div className={styles.docItemContainer}>
            <article>
              <DocBreadcrumbs />
              <DocVersionBadge />
              {docTOC.mobile}
              <DocItemContent>{children}</DocItemContent>
              <DocItemFooter />
            </article>
            <DocItemPaginator />
          </div>
        </div>
        {docTOC.desktop && (
          <div className="col col--3">
            {/* ---- START: Customizations ---- */}
            {/* TOC in sticky container */}
            <div className={styles.tocStickyContainer}>{docTOC.desktop}</div>
            {/* Feedback component aligned with TOC column */}
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
