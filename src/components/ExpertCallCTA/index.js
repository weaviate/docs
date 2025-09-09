import React from "react";
import styles from "./styles.module.css";

export default function ExpertCallCTA() {
  return (
    <div className={styles.container}>
      <p className={styles.text}>
        Need help with configuring Weaviate for production? Book a call with one
        of our expert engineers.
      </p>
      {/* Replace "#" with your actual booking link */}
      <a
        href="https://calendly.com/your-company/expert-call"
        target="_blank"
        rel="noopener noreferrer"
        className="button button--primary button--block"
      >
        Book call
      </a>
    </div>
  );
}
