import React, { useState, useEffect } from "react";
import styles from "./styles.module.scss";

export default function FeedbackComponent() {
  const [isVisible, setIsVisible] = useState(() => {
    // 1. Initialize state synchronously from localStorage to prevent flicker.
    if (typeof window === "undefined") {
      return false;
    }
    const saved = localStorage.getItem("feedbackWidgetVisible");
    // Default to visible unless explicitly set to 'false'.
    return saved !== "false";
  });

  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("feedbackWidgetExpanded");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  // This effect now only saves the expanded/collapsed state.
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("feedbackWidgetExpanded", isExpanded.toString());
    }
  }, [isExpanded]);

  const openGithubFeedback = () => {
    const currentUrl =
      typeof window !== "undefined" ? window.location.href : "";
    const params = new URLSearchParams({
      template: "doc_feedback.yml",
      title: "[Documentation Feedback]: ",
      labels: "user-feedback",
      "page-url": currentUrl,
    });
    const githubUrl = `https://github.com/weaviate/docs/issues/new?${params.toString()}`;
    window.open(githubUrl, "_blank", "noopener,noreferrer");
  };

  // If not visible (based on localStorage), render nothing.
  if (!isVisible) {
    return null;
  }

  // Render collapsed state
  if (!isExpanded) {
    return (
      <button
        className={styles.collapsedButton}
        onClick={() => setIsExpanded(true)}
        aria-label="Open help and feedback"
        title="Need help or feedback?"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>
    );
  }

  // Render expanded state
  return (
    <div className={styles.container}>
      <button
        className={styles.closeButton}
        onClick={() => setIsExpanded(false)}
        aria-label="Close feedback widget"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <p className={styles.text}>Need help? Ask AI:</p>
      <div className={styles.buttonContainer}>
        <a
          className={`button button--primary button--sm ${styles.askAiButton}`}
          onClick={() => {
            if (window.Kapa && typeof window.Kapa.open === "function") {
              window.Kapa.open({ mode: "ai", query: "", submit: false });
            } else {
              console.warn("Kapa.ai is not available");
            }
          }}
        >
          Ask AI
        </a>
        {/* <button
          onClick={openGithubFeedback}
          className={`button button--outline button--primary button--sm ${styles.feedbackButton}`}
          aria-label="Provide documentation feedback"
        >
          Feedback
        </button> */}
      </div>
    </div>
  );
}
