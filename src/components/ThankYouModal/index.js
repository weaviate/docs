import React from "react";
import { createPortal } from "react-dom";
import styles from "./styles.module.scss";

const negativeFeedbackOptions = [
  "Content is hard to understand",
  "Code example or procedure doesn't work",
  "Couldn't find what I need",
  "Incomplete / outdated information",
];

export default function ThankYouModal({ isOpen, onClose, selectedOptions, pageUrl }) {
  if (!isOpen) {
    return null;
  }

  const openGithubIssue = () => {
    const currentUrl = pageUrl || (typeof window !== "undefined" ? window.location.href : "");

    // Build the issue body with selected feedback options
    let issueBody = "";
    if (selectedOptions && selectedOptions.length > 0) {
      issueBody = "**Selected feedback:**\n";
      selectedOptions.forEach((optionIndex) => {
        if (negativeFeedbackOptions[optionIndex]) {
          issueBody += `- ${negativeFeedbackOptions[optionIndex]}\n`;
        }
      });
      issueBody += "\n**Additional details:**\n";
    }

    const params = new URLSearchParams({
      template: "doc_feedback.yml",
      title: "[Documentation Feedback]: ",
      labels: "user-feedback",
      "page-url": currentUrl,
    });

    // If we have selected options, add them to the URL
    if (issueBody) {
      params.append("body", issueBody);
    }

    const githubUrl = `https://github.com/weaviate/docs/issues/new?${params.toString()}`;
    window.open(githubUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        <h3>Thanks for your feedback!</h3>
        <p>Want to provide more detail? Create a GitHub issue to help us improve this page.</p>
        <div className={styles.buttonContainer}>
          <button
            className={`button button--primary ${styles.createIssueButton}`}
            onClick={openGithubIssue}
          >
            Create GitHub Issue
          </button>
          <button
            className={`button button--secondary ${styles.skipButton}`}
            onClick={onClose}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );

  // Render modal at document root level using portal
  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
