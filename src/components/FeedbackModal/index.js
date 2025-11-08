import React, { useState } from "react";
import styles from "./styles.module.scss";

const positiveFeedbackOptions = [
  "Accomplished my task",
  "Clear explanation",
  "Good code examples",
  "Learned something new",
];

const negativeFeedbackOptions = [
  "Content is hard to understand",
  "Code example or procedure doesn't work",
  "Couldn't find what I need",
  "Missing / outdated information",
];

export default function FeedbackModal({
  voteType,
  onSubmit,
  onClose,
  isOpen,
}) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [comment, setComment] = useState("");

  if (!isOpen) {
    return null;
  }

  const openGithubFeedback = () => {
    const currentUrl =
      typeof window !== "undefined" ? window.location.href : "";
    const params = new URLSearchParams({
      template: "doc_feedback.yml",
      title: "[Documentation Feedback]: ",
      labels: "user-feedback",
      "page-url": currentUrl,
    });
    const githubUrl = `https://github.com/weaviate/docs/issues/new?${params.toString()}`;
    window.open(githubUrl, "_blank", "noopener,noreferrer");
  };

  const options =
    voteType === "up" ? positiveFeedbackOptions : negativeFeedbackOptions;
  const title = voteType === "up" ? "What helped?" : "What went wrong?";

  const handleOptionChange = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = () => {
    onSubmit({
      options: selectedOptions,
      comment,
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
          &times;
        </button>
        <h3>{title}</h3>
        <p>(optional - select all that apply)</p>
        <div className={styles.optionsContainer}>
          {options.map((option) => (
            <label key={option} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={() => handleOptionChange(option)}
              />
              {option}
            </label>
          ))}
        </div>
        {/* <label className={styles.commentLabel}>
          Tell us more (optional)
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Please tell us more so we can improve."
            rows="4"
          />
        </label> */}
        <div className={styles.buttonContainer}>
          <button
            className={`button button--primary ${styles.submitButton}`}
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button
            className={`button button--secondary ${styles.cancelButton}`}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
        <div className={styles.githubContainer}>
          <button
            className={`button button--secondary ${styles.githubButton}`}
            onClick={openGithubFeedback}
          >
            Other - create issue
          </button>
        </div>
      </div>
    </div>
  );
}
