import React, { useState, useEffect } from "react";
import BaseModal from "../BaseModal"; // Assuming BaseModal is in the parent directory
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
      showCloseButton={false} // We'll use custom header
    >
      {/* Changed className from styles.modalContent to styles.firstVisitModalInnerContent */}
      <div className={styles.firstVisitModalInnerContent}>
        {/* Custom Header with title aligned to close button */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Explore Weaviate docs</h2>
          <button
            className={styles.customCloseButton}
            onClick={handleClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content Container */}
        <div className={styles.contentContainer}>
          <div className={styles.content}>
            <div className={styles.description}>
              <p>
                The Weaviate documentation is divided into the following four
                sections: Core database, Deployment, Weaviate Cloud and Weaviate
                Agents docs.
              </p>
            </div>

            {/* Guideflow iframe for overview */}
            <div className={styles.iframeContainer}>
              <div>
                <iframe
                  id="er5mn6lu6k"
                  src="https://app.guideflow.com/embed/er5mn6lu6k"
                  width="100%"
                  height="100%"
                  style={{
                    overflow: "hidden",
                    border: "none",
                  }}
                  allow="clipboard-read; clipboard-write"
                  webKitAllowFullScreen
                  mozAllowFullScreen
                  allowFullScreen
                  allowTransparency="true"
                />
                <script
                  src="https://app.guideflow.com/assets/opt.js"
                  data-iframe-id="er5mn6lu6k"
                ></script>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
