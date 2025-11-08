import React, { useState, useEffect } from "react";
import { useLocation } from "@docusaurus/router";
import styles from "./styles.module.scss";
import FeedbackModal from "../FeedbackModal";
import ThumbsUp from "../Icons/ThumbsUp";
import ThumbsDown from "../Icons/ThumbsDown";

export default function PageRatingWidget() {
  const [vote, setVote] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalHasOpened, setModalHasOpened] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Reset state on page change
    setVote(null);
    setModalOpen(false);
    setModalHasOpened(false);

    // Hide on homepage, show everywhere else immediately
    const pageUrl = location.pathname;
    setIsVisible(!(pageUrl === "/" || pageUrl === "/weaviate/"));
  }, [location.pathname]);

  const submitFeedback = async (payload) => {
    try {
      const response = await fetch('/.netlify/functions/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Log the error response text for debugging
        const errorText = await response.text();
        console.error('Feedback submission failed:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Feedback submitted successfully.');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleVote = (newVote) => {
    setVote(newVote);

    const feedbackPayload = {
      page: location.pathname,
      vote: newVote,
    };
    submitFeedback(feedbackPayload);

    if (!modalHasOpened) {
      setModalOpen(true);
      setModalHasOpened(true);
    }
  };

  const handleModalSubmit = (feedback) => {
    const feedbackPayload = {
      page: location.pathname,
      vote: vote,
      ...feedback,
    };
    submitFeedback(feedbackPayload);
    setModalOpen(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className={styles.container}>
        <p className={styles.text}>Was this page helpful?</p>
        <div className={styles.buttonContainer}>
          <button
            className={`${styles.voteButton} ${styles.voteButtonYes} ${
              vote === 'up' ? styles.selected : ''
            }`}
            onClick={() => handleVote('up')}
            aria-label="Vote up"
          >
            <ThumbsUp />
            Yes
          </button>
          <button
            className={`${styles.voteButton} ${styles.voteButtonNo} ${
              vote === 'down' ? styles.selected : ''
            }`}
            onClick={() => handleVote('down')}
            aria-label="Vote down"
          >
            <ThumbsDown />
            No
          </button>
        </div>
      </div>
      <FeedbackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        voteType={vote}
      />
    </>
  );
}
