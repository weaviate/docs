import React, { useState, useEffect } from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.scss";

export default function FirstVisitModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check for dev override in URL
    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.get("firstvisit") === "true";

    const hasVisited = localStorage.getItem("docs-has-visited");
    console.log("hasVisited:", hasVisited, "forceShow:", forceShow);

    if (!hasVisited || forceShow) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      // Add escape key listener
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          handleClose();
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);

    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.get("firstvisit") === "true";

    if (!forceShow) {
      localStorage.setItem("docs-has-visited", "true");
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Weaviate documentation structure
          </h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={styles.modalContent}>
          {/* Description */}
          <div className={styles.description}>
            <p>
              The Weaviate documentation is divided into the following four
              sections:{" "}
              <Link to="/weaviate" onClick={handleClose}>
                core database
              </Link>
              ,{" "}
              <Link to="/deploy" onClick={handleClose}>
                deployment
              </Link>
              ,{" "}
              <Link to="/cloud" onClick={handleClose}>
                Weaviate Cloud
              </Link>{" "}
              and{" "}
              <Link to="/agents" onClick={handleClose}>
                Weaviate Agents
              </Link>{" "}
              docs.
            </p>
          </div>

          {/* Iframe */}
          <div className={styles.iframeContainer}>
            <div
              style={{
                position: "relative",
                paddingBottom: "calc(54.10879629629629% + 50px)",
                height: 0,
              }}
            >
              <iframe
                id="1pz2g4lamp"
                src="https://app.guideflow.com/embed/1pz2g4lamp"
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
                data-iframe-id="1pz2g4lamp"
              ></script>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
