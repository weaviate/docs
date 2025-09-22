import React, { useState, useEffect } from "react";
import styles from "./styles.module.scss";

// This function now calls your internal Netlify function
const getCountryFromNetlify = async () => {
  try {
    const response = await fetch("/.netlify/functions/geolocation");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data.country;
  } catch (error) {
    return null;
  }
};

export default function FeedbackComponent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(() => {
    // Initialize from localStorage if available, default to true if not set
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("feedbackWidgetExpanded");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  // Save expanded state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("feedbackWidgetExpanded", isExpanded.toString());
    }
  }, [isExpanded]);

  useEffect(() => {
    // A sample list of countries to exclude.
    // ❗ IMPORTANT: This list is an example and should be reviewed and
    // customized for your specific needs.
    const excludedCountries = [
      "RU", // Russia
      "VN", // Vietnam
      "IN", // India
      "IR", // Iran
      "PK", // Pakistan
    ];

    const checkVisibility = async () => {
      const userCountry = await getCountryFromNetlify();
      // If the location lookup fails for any reason, default to showing the component.
      // This ensures that users with privacy tools aren't blocked.
      if (!userCountry) {
        setIsVisible(true);
        return;
      }
      // If the user's country is NOT in the exclusion list, show the component.
      if (!excludedCountries.includes(userCountry)) {
        setIsVisible(true);
      }
    };

    checkVisibility();
  }, []); // Empty array ensures this runs only once on mount

  const openGithubFeedback = () => {
    const currentUrl =
      typeof window !== "undefined" ? window.location.href : "";
    // Use the doc_feedback.yml template with pre-filled page URL
    const params = new URLSearchParams({
      template: "doc_feedback.yml",
      title: "[Documentation Feedback]: ",
      labels: "user-feedback",
      "page-url": currentUrl,
    });
    const githubUrl = `https://github.com/weaviate/docs/issues/new?${params.toString()}`;
    window.open(githubUrl, "_blank", "noopener,noreferrer");
  };

  // If not visible, render nothing.
  if (!isVisible) {
    return null;
  }

  // Render collapsed state - circular button with question mark
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
      <p className={styles.text}>Need help or you have feedback?</p>
      <div className={styles.buttonContainer}>
        <a
          className={`button button--primary button--sm ${styles.askAiButton}`}
          onClick={() => {
            if (window.Kapa && typeof window.Kapa.open === "function") {
              window.Kapa.open({
                mode: "ai",
                query: "",
                submit: false,
              });
            } else {
              console.warn("Kapa.ai is not available");
            }
          }}
        >
          Ask AI
        </a>
        <button
          onClick={openGithubFeedback}
          className={`button button--outline button--primary button--sm ${styles.feedbackButton}`}
          aria-label="Provide documentation feedback"
        >
          Feedback
        </button>
      </div>
    </div>
  );
}
