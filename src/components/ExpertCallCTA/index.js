import React, { useState, useEffect } from "react";
import { getUserCountryCode } from "./geolocation";
import styles from "./styles.module.scss";

export default function ExpertCallCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // A sample list of countries to exclude.
    // ❗ IMPORTANT: This list is an example and should be reviewed and
    // customized for your specific needs.
    const excludedCountries = [
      "RU", // Russia
      "CN", // China
      "VN", // Vietnam
      "IN", // India
      "IR", // Iran
      "PK", // Pakistan
    ];

    const checkVisibility = async () => {
      const userCountry = await getUserCountryCode();

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

  // If visible, render the component.
  return (
    <div className={styles.container}>
      <p className={styles.text}>
        Ready for production? Book a call with a Weaviate expert to get help.
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
              console.warn("Kapa is not available");
            }
          }}
        >
          Ask AI
        </a>
      </div>
    </div>
  );
}
