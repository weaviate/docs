import React from "react";

export default function OptionModal({
  isModalOpen,
  setModalOpen,
  styles,
  buttonStyles,
  secondaryNavOptions,
  handleOptionSelect,
  isApple,
  activeLink, // Add activeLink prop to know which item is currently active
  selectedOption, // Add selectedOption prop to know which category is selected
}) {
  // Filter options into regular and small groups
  const regularItems = Object.entries(secondaryNavOptions).filter(
    ([, value]) => !value.isSmall
  );
  const smallItems = Object.entries(secondaryNavOptions).filter(
    ([, value]) => value.isSmall
  );

  // Helper function to determine if an option is active
  const isOptionActive = (key) => {
    const option = secondaryNavOptions[key];
    // Check if this option contains the active link
    return (
      option.links && option.links.some((link) => link.sidebar === activeLink)
    );
  };

  return (
    <div
      className={`${styles.modalOverlay} ${isModalOpen ? styles.active : ""}`}
      onClick={() => setModalOpen(false)}
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header - Simplified */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <strong>Go to documentation:</strong>
          </div>
          <div className={styles.modalHeaderRight}>
            <div
              className={buttonStyles.modalHeaderButton}
              onClick={() => setModalOpen(false)}
            >
              <span className={buttonStyles.buttonShortcut}>
                {isApple ? "⌘U" : "Ctrl+U"}
              </span>
              <div className={buttonStyles.verticalDivider}></div>
              <button className={buttonStyles.headerCloseIcon}>✕</button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {/* Render regular items as cards */}
          <div className={styles.modalOptionsContainer}>
            {regularItems.map(([key, value]) => (
              <div
                key={key}
                className={`${styles.modalOption} ${
                  isOptionActive(key) ? styles.activeOption : ""
                }`}
                onClick={() => handleOptionSelect(key)}
              >
                <i
                  className={`${value.icon} ${styles.modalIcon}`}
                  aria-hidden="true"
                />
                <div className={styles.modalText}>
                  <strong>{value.title}</strong>
                  <p>{value.description}</p>
                </div>
                {isOptionActive(key) && (
                  <div className={styles.activeIndicator}></div>
                )}
              </div>
            ))}
          </div>

          {/* Resources Section */}
          {smallItems.length > 0 && (
            <div className={styles.resourcesSection}>
              <h4 className={styles.sectionTitle}>Additional resources</h4>
              <div className={styles.resourcesGrid}>
                {smallItems.map(([key, value]) => (
                  <div
                    key={key}
                    className={`${styles.resourceCard} ${
                      isOptionActive(key) ? styles.activeResource : ""
                    }`}
                    onClick={() => handleOptionSelect(key)}
                  >
                    <i
                      className={`${value.icon} ${styles.resourceIcon}`}
                      aria-hidden="true"
                    />
                    <span className={styles.resourceTitle}>{value.title}</span>
                    {isOptionActive(key) && (
                      <div className={styles.activeResourceIndicator}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Assistant Section */}
          <div className={styles.aiAssistantSection}>
            <h4 className={styles.sectionTitle}>Need help?</h4>
            <div className={styles.resourcesGrid}>
              <div
                className={styles.askAiButton}
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
                <img
                  src="/docs/img/site/weaviate-logo-w.png"
                  alt="Weaviate Logo"
                  className={styles.askAiIcon}
                />
                <span className={styles.askAiText}>Ask AI Assistant</span>
                <span className={styles.askAiShortcut}>
                  {isApple ? "⌘K" : "Ctrl+K"}
                </span>
              </div>

              {/* New Forum Card - styled like the resource cards */}
              <div
                className={styles.resourceCard}
                onClick={() =>
                  window.open("https://forum.weaviate.io", "_blank")
                }
              >
                <i
                  className="fa fa-comments styles.resourceIcon"
                  aria-hidden="true"
                />
                <span className={styles.resourceTitle}>Community Forum</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
