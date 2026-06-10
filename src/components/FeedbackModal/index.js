import React, { useState } from "react";
import { createPortal } from "react-dom";
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
  "Incomplete / outdated information",
];

export default function FeedbackModal({ voteType, onSubmit, onClose, isOpen }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [comment, setComment] = useState("");

  if (!isOpen) {
    return null;
  }

  const options =
    voteType === "up" ? positiveFeedbackOptions : negativeFeedbackOptions;
  const title = voteType === "up" ? "What helped?" : "What went wrong?";

  const handleOptionChange = (optionIndex) => {
    setSelectedOptions((prev) =>
      prev.includes(optionIndex)
        ? prev.filter((item) => item !== optionIndex)
        : [...prev, optionIndex]
    );
  };

  const handleSubmit = () => {
    onSubmit({
      options: selectedOptions,
      comment,
    });
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
        <h3>{title}</h3>
        <p>(optional - select all that apply)</p>
        <div className={styles.optionsContainer}>
          {options.map((option, index) => (
            <label key={option} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedOptions.includes(index)}
                onChange={() => handleOptionChange(index)}
              />
              {option}
            </label>
          ))}
        </div>
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
      </div>
    </div>
  );

  // Render modal at document root level using portal
  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
