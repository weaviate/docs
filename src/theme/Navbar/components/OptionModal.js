import React from "react";

export default function OptionModal({
  isModalOpen,
  setModalOpen,
  styles,
  buttonStyles,
  secondaryNavOptions,
  handleOptionSelect,
  isApple,
}) {
  // Filter options into regular and small groups
  const regularItems = Object.entries(secondaryNavOptions).filter(
    ([, value]) => !value.isSmall
  );
  const smallItems = Object.entries(secondaryNavOptions).filter(
    ([, value]) => value.isSmall
  );

  return (
    <div
      className={`${styles.modalOverlay} ${isModalOpen ? styles.active : ""}`}
      onClick={() => setModalOpen(false)}
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <strong>Go to documentation:</strong>
          </div>
          <div className={styles.modalHeaderRight}>
            <div
              className={buttonStyles.modalHeaderButton}
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
              <span className={buttonStyles.buttonShortcut}>
                {isApple ? "⌘K" : "Ctrl+K"}
              </span>
              <div className={buttonStyles.verticalDivider}></div>
              <span className={buttonStyles.buttonText}>Ask AI</span>
              <img
                src="/img/site/weaviate-logo-w.png"
                alt="Weaviate Logo"
                className={buttonStyles.buttonIcon}
              />
            </div>
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
                className={styles.modalOption}
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
              </div>
            ))}
          </div>

          {/* Render small items at the bottom with a divider */}
          {smallItems.length > 0 && (
            <>
              <hr className={styles.modalDivider} />
              <div className={styles.modalSmallOptionsContainer}>
                {smallItems.map(([key, value]) => (
                  <div
                    key={key}
                    className={styles.modalSmallOption}
                    onClick={() => handleOptionSelect(key)}
                  >
                    <i
                      className={`${value.icon} ${styles.modalSmallIcon}`}
                      aria-hidden="true"
                    />
                    {value.title}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
