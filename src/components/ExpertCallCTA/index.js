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

export default function ExpertCallCTA() {
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

  // If not visible, render nothing.
  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.container}>
      <p className={styles.text}>
        Ready for production?<br/>
        Book a free call with a Weaviate expert.
      </p>

      <div className={styles.buttonContainer}>
        <a
          href="https://calendly.com/your-company/expert-call"
          target="_blank"
          rel="noopener noreferrer"
          className={`button button--primary ${styles.ctaButton}`}
        >
          Book call
        </a>
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
      </div>
    </div>
  );
}
