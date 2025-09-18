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

  return (
    <div className={styles.container}>
      <p className={styles.text}>Need help or want to improve this page?</p>

      <div className={styles.buttonContainer}>
        <a
          className={`button button--primary ${styles.askAiButton}`}
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
          className={`button button--outline button--primary ${styles.feedbackButton}`}
          aria-label="Provide documentation feedback"
        >
          Give Feedback
        </button>
      </div>
    </div>
  );
}
