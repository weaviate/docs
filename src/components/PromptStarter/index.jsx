import React from "react";
import styles from "./styles.module.scss";
import ContextualMenu from "@site/src/components/ContextualMenu";

/**
 * PromptStarter - A banner component that provides AI-ready prompts for documentation pages
 *
 * @param {string} page - The page identifier (used as promptName, e.g., "quickstart")
 * @param {array} languages - Available languages for prompts (e.g., ["python", "typescript", "go", "java", "csharp"])
 * @param {string} description - Custom description text for the banner
 */
const PromptStarter = ({
  page = "quickstart",
  languages = ["python", "typescript", "go", "java", "csharp"],
  description = "Use this pre-built prompt with your AI assistant"
}) => {

  return (
    <div className={styles.promptStarterWrapper}>
      <div className={styles.promptStarter}>
        <div className={styles.content}>
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
          <div className={styles.textContent}>
            <div className={styles.title}><strong>Get started faster with AI</strong></div>
            <p className={styles.description}>
              {description}
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <ContextualMenu
            variant="prompts"
            languages={languages}
            promptUrl="https://prompt-starter--docs-weaviate-io.netlify.app/prompts/"
            promptName={page}
          />
        </div>
      </div>
    </div>
  );
};

export default PromptStarter;
