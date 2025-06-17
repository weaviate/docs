import React, { useEffect } from "react";
import styles from "./styles.module.scss";

export default function BaseModal({
  isOpen,
  onClose,
  children,
  className = "",
  closeOnOverlayClick = true,
  showCloseButton = true,
  maxWidth = "750px",
}) {
  console.log("BaseModal render - isOpen:", isOpen, "className:", className);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      console.log("BaseModal: Adding event listeners and preventing scroll");
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    console.log("BaseModal: Overlay clicked");
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.modalOverlay} ${isOpen ? styles.active : ""}`}
      onClick={handleOverlayClick}
    >
      <div
        className={`${styles.modalContent} ${className}`}
        style={{ maxWidth }} // Apply maxWidth to content, not overlay
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
