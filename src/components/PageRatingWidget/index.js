import React, { useState, useEffect } from "react";
import { useLocation } from "@docusaurus/router";
import styles from "./styles.module.scss";
import FeedbackModal from "../FeedbackModal";

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

  const handleVote = (newVote) => {
    setVote(newVote);

    console.log({
      page: location.pathname,
      helpful: newVote === "up",
    });

    if (!modalHasOpened) {
      setModalOpen(true);
      setModalHasOpened(true);
    }
  };

  const handleModalSubmit = (feedback) => {
    console.log({
      page: location.pathname,
      vote: vote,
      ...feedback,
    });
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
            className={`${styles.voteButton} ${
              vote === "up" ? styles.selected : ""
            }`}
            onClick={() => handleVote("up")}
            aria-label="Vote up"
          >
            Yes
          </button>
          <button
            className={`${styles.voteButton} ${
              vote === "down" ? styles.selected : ""
            }`}
            onClick={() => handleVote("down")}
            aria-label="Vote down"
          >
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
