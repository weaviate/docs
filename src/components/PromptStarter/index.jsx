import React, { useState, useCallback } from "react";
import styles from "./styles.module.scss";
import { getPromptsForPage, CURSOR_CHAR_LIMIT } from "./prompts";

/**
 * PromptStarter - A banner component that provides AI-ready prompts for documentation pages
 *
 * @param {string} page - The page identifier to load prompts for (e.g., "quickstart")
 * @param {string} defaultLanguage - Initial language selection ("python" or "typescript")
 */
const PromptStarter = ({ page = "quickstart", defaultLanguage = "python" }) => {
  const [language, setLanguage] = useState(defaultLanguage);
  const [copied, setCopied] = useState(false);

  // Get prompts for the specified page
  const pagePrompts = getPromptsForPage(page);

  // If no prompts found for this page, don't render anything
  if (!pagePrompts) {
    return null;
  }

  const { fullPrompt, condensedPrompt } = pagePrompts;

  const handleOpenInCursor = useCallback(() => {
    const prompt = condensedPrompt[language];

    if (!prompt) {
      console.warn(`No condensed prompt found for language: ${language}`);
      return;
    }

    // Use the URL API for proper encoding (as recommended by Cursor docs)
    // Using web link format which is more reliable than cursor:// protocol
    const url = new URL("https://cursor.com/link/prompt");
    url.searchParams.set("text", prompt);

    // Check total URL length (8000 char limit for deeplinks)
    const urlString = url.toString();
    if (urlString.length > CURSOR_CHAR_LIMIT) {
      console.warn(
        `URL length (${urlString.length}) exceeds Cursor limit (${CURSOR_CHAR_LIMIT}).`
      );
    }

    window.open(urlString, "_blank");
  }, [language, condensedPrompt]);

  const handleCopyPrompt = useCallback(async () => {
    const prompt = fullPrompt[language];

    if (!prompt) {
      console.warn(`No full prompt found for language: ${language}`);
      return;
    }

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = prompt;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (fallbackErr) {
        console.error("Failed to copy prompt:", fallbackErr);
      }

      document.body.removeChild(textArea);
    }
  }, [language, fullPrompt]);

  // Check which languages are available for this page
  const hasPython = Boolean(fullPrompt?.python);
  const hasTypeScript = Boolean(fullPrompt?.typescript);
  const showLanguageSelector = hasPython && hasTypeScript;

  return (
    <div className={styles.promptStarterWrapper}>
      <div className={styles.promptStarter}>
        <div className={styles.content}>
          <div className={styles.icon}>
            <i className="fas fa-wand-magic-sparkles" aria-hidden="true" />
          </div>
          <div className={styles.textContent}>
            <p className={styles.title}>Get started faster with AI</p>
            <p className={styles.description}>
              Use this pre-built prompt with your AI assistant
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          {showLanguageSelector && (
            <div
              className={styles.languageSelector}
              role="radiogroup"
              aria-label="Select programming language"
            >
              <button
                type="button"
                className={`${styles.languageButton} ${
                  language === "python" ? styles.active : ""
                }`}
                onClick={() => setLanguage("python")}
                role="radio"
                aria-checked={language === "python"}
              >
                Python
              </button>
              <button
                type="button"
                className={`${styles.languageButton} ${
                  language === "typescript" ? styles.active : ""
                }`}
                onClick={() => setLanguage("typescript")}
                role="radio"
                aria-checked={language === "typescript"}
              >
                TypeScript
              </button>
            </div>
          )}

          <button
            type="button"
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={handleOpenInCursor}
            aria-label="Open prompt in Cursor editor"
          >
            <i className="fas fa-external-link-alt" aria-hidden="true" />
            Open in Cursor
          </button>

          <button
            type="button"
            className={`${styles.button} ${
              copied ? styles.copiedButton : styles.secondaryButton
            }`}
            onClick={handleCopyPrompt}
            aria-label={copied ? "Prompt copied to clipboard" : "Copy prompt to clipboard"}
          >
            {copied ? (
              <>
                <i
                  className={`fas fa-check ${styles.copiedIcon}`}
                  aria-hidden="true"
                />
                Copied!
              </>
            ) : (
              <>
                <i className="fas fa-copy" aria-hidden="true" />
                Copy prompt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptStarter;
