import React, { useState, useEffect } from "react";
import styles from "./styles.module.scss";
import ContextualMenu from "@site/src/components/ContextualMenu";
import { getPromptDetails } from "./prompts";
import { urls } from "../config";
import { analytics } from "@site/src/utils/analytics";

/**
 * PromptStarter - A banner component that provides AI-ready prompts for documentation pages
 *
 * @param {string} page - The page identifier (used as promptName, e.g., "quickstart")
 * @param {array} languages - Available languages for prompts (e.g., ["python", "typescript", "go", "java", "csharp"])
 * @param {string} promptDetails - The key for prompt details to display (e.g., "quickstart_prompt")
 */
const PromptStarter = ({
  page = "quickstart",
  languages = ["python", "typescript", "go", "java", "csharp"],
  promptDetails = null,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get prompt details if provided
  const details = promptDetails ? getPromptDetails(promptDetails) : null;
  const description =
    details?.description ||
    "Build a working movie search app with vector search and RAG in 4 steps";

  // Track component view on mount
  useEffect(() => {
    analytics.promptStarter.view(page, languages, promptDetails);
  }, [page, languages, promptDetails]);

  return (
    <div className={styles.promptStarterWrapper}>
      <div className={styles.promptStarter}>
        <div className={styles.iconColumn}>
          <div className={styles.icon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.topRow}>
            <div className={styles.textContent}>
              <div className={styles.title}>Get started faster with AI</div>
              <p className={styles.description}>{description}</p>
            </div>
          </div>

          <div className={styles.bottomRow}>
            {details && (
              <button
                className={styles.previewToggle}
                onClick={() => {
                  const newState = !isExpanded;
                  setIsExpanded(newState);

                  // Track expand/collapse
                  analytics.promptStarter.toggleDetails(newState, page, promptDetails);
                }}
                aria-expanded={isExpanded}
              >
                {isExpanded ? "Hide prompt details" : "Show prompt details"}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`${styles.chevron} ${
                    isExpanded ? styles.chevronOpen : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}

            <div className={styles.actions}>
              <ContextualMenu
                variant="prompts"
                languages={languages}
                promptUrl={urls.promptStarter}
                promptName={page}
              />
            </div>
          </div>

          {details && isExpanded && details.features && (
            <div className={styles.previewContent}>
              <p className={styles.previewDescription}>{details.short}</p>
              <ul className={styles.featureList}>
                {details.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptStarter;
