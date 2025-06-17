import React, { useState, useEffect } from "react";
import BaseModal from "../BaseModal";
import styles from "./styles.module.scss";

export default function FirstVisitModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log("FirstVisitModal useEffect running...");

    // Check for dev override in URL
    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.get("firstvisit") === "true";

    const hasVisited = localStorage.getItem("docs-has-visited");
    console.log("hasVisited:", hasVisited, "forceShow:", forceShow);

    if (!hasVisited || forceShow) {
      console.log("Showing modal...");
      const timer = setTimeout(() => {
        setIsModalOpen(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    console.log("Modal closing...");
    setIsModalOpen(false);

    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.get("firstvisit") === "true";

    if (!forceShow) {
      localStorage.setItem("docs-has-visited", "true");
    }
  };

  console.log("FirstVisitModal render - isModalOpen:", isModalOpen);

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={handleClose}
      className={styles.firstVisitModal}
      maxWidth="80vw"
    >
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Welcome to the Weaviate documentation</h2>
          <div className={styles.description}>
            <p>
              The Weaviate documentation is divided into the following four
              sections: <a href="/docs/weaviate">Core database</a>,{" "}
              <a href="/docs/deploy">Deployment</a>,{" "}
              <a href="/docs/cloud">Weaviate Cloud</a> and{" "}
              <a href="/docs/agents">Weaviate Agents</a> docs.
            </p>
          </div>
        </div>

        {/* Guideflow iframe */}
        <div className={styles.iframeContainer}>
          <div
            style={{
              position: "relative",
              paddingBottom: "calc(54.10879629629629% + 50px)",
              height: 0,
            }}
          >
            <iframe
              id="gky9oo0u4p"
              src="https://app.guideflow.com/embed/gky9oo0u4p"
              width="100%"
              height="100%"
              style={{
                overflow: "hidden",
                position: "absolute",
                border: "none",
              }}
              scrolling="no"
              allow="clipboard-read; clipboard-write"
              webKitAllowFullScreen
              mozAllowFullScreen
              allowFullScreen
              allowTransparency="true"
            />
            <script
              src="https://app.guideflow.com/assets/opt.js"
              data-iframe-id="gky9oo0u4p"
            ></script>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
