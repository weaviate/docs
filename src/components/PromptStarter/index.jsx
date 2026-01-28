import React, { useState, useCallback, useRef, useEffect } from "react";
import styles from "./styles.module.scss";
import { getPromptsForPage, CURSOR_CHAR_LIMIT } from "./prompts";

/**
 * PromptStarter - A banner component that provides AI-ready prompts for documentation pages
 *
 * @param {string} page - The page identifier to load prompts for (e.g., "quickstart")
 * @param {string} defaultLanguage - Initial language selection ("python" or "typescript")
 * @param {string} description - Custom description text for the banner
 */
const PromptStarter = ({
  page = "quickstart",
  defaultLanguage = "python",
  description = "Use this pre-built prompt with your AI assistant"
}) => {
  const [language, setLanguage] = useState(defaultLanguage);
  const [copied, setCopied] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const languageRef = useRef(null);
  const actionsRef = useRef(null);

  // Get prompts for the specified page
  const pagePrompts = getPromptsForPage(page);

  // If no prompts found for this page, don't render anything
  if (!pagePrompts) {
    return null;
  }

  const { prompt: prompts } = pagePrompts;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setIsActionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyPrompt = useCallback(async () => {
    const prompt = prompts[language];

    if (!prompt) {
      console.warn(`No full prompt found for language: ${language}`);
      return;
    }

    try {
      // Extract URL from prompt (format: "Open this site and follow the instructions: URL")
      const urlMatch = prompt.match(/https:\/\/[^\s]+/);
      if (!urlMatch) {
        console.error("Could not extract URL from prompt");
        return;
      }

      const markdownUrl = urlMatch[0];

      // Fetch the markdown file content
      const response = await fetch(markdownUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch markdown: ${response.statusText}`);
      }

      const markdownContent = await response.text();

      // Copy the full markdown content to clipboard
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);

      // Reset copied state after 1.5 seconds
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to copy prompt:", err);

      // Fallback: copy the short URL instruction if fetch fails
      try {
        await navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 1500);
      } catch (fallbackErr) {
        console.error("Failed to copy fallback prompt:", fallbackErr);
      }
    }
  }, [language, prompts]);

  const handleOpenInClaude = useCallback(() => {
    const prompt = prompts[language];
    if (!prompt) return;

    const encodedPrompt = encodeURIComponent(prompt);
    window.open(`https://claude.ai/new?q=${encodedPrompt}`, "_blank");
    setIsActionsOpen(false);
  }, [language, prompts]);

  const handleOpenInChatGPT = useCallback(() => {
    const prompt = prompts[language];
    if (!prompt) return;

    const encodedPrompt = encodeURIComponent(prompt);
    window.open(`https://chat.openai.com/?q=${encodedPrompt}`, "_blank");
    setIsActionsOpen(false);
  }, [language, prompts]);

  const handleOpenInCursor = useCallback(() => {
    const prompt = prompts[language];

    if (!prompt) {
      console.warn(`No prompt found for language: ${language}`);
      return;
    }

    const url = new URL("https://cursor.com/link/prompt");
    url.searchParams.set("text", prompt);

    const urlString = url.toString();
    if (urlString.length > CURSOR_CHAR_LIMIT) {
      console.warn(
        `URL length (${urlString.length}) exceeds Cursor limit (${CURSOR_CHAR_LIMIT}).`
      );
    }

    window.open(urlString, "_blank");
    setIsActionsOpen(false);
  }, [language, prompts]);

  // Check which languages are available for this page
  const hasPython = Boolean(prompts?.python);
  const hasTypeScript = Boolean(prompts?.typescript);
  const hasGo = Boolean(prompts?.go);
  const hasJava = Boolean(prompts?.java);
  const hasCSharp = Boolean(prompts?.csharp);
  const showLanguageSelector = [hasPython, hasTypeScript, hasGo, hasJava, hasCSharp].filter(Boolean).length > 1;

  const languageLabels = {
    python: "Python",
    typescript: "TypeScript",
    go: "Go",
    java: "Java",
    csharp: "C#",
  };

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
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className={styles.textContent}>
            <p className={styles.title}>Get started faster with AI</p>
            <p className={styles.description}>
              {description}
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          {showLanguageSelector && (
            <div className={styles.languageDropdown} ref={languageRef}>
              <button
                type="button"
                className={styles.languageButton}
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                aria-expanded={isLanguageOpen}
                aria-label="Select programming language"
              >
                <span>{languageLabels[language]}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`${styles.chevron} ${
                    isLanguageOpen ? styles.chevronOpen : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isLanguageOpen && (
                <div className={styles.languageMenu}>
                  {Object.keys(languageLabels).map((lang) => {
                    if (!prompts[lang]) return null;
                    return (
                      <button
                        key={lang}
                        type="button"
                        className={`${styles.languageOption} ${
                          language === lang ? styles.active : ""
                        }`}
                        onClick={() => {
                          setLanguage(lang);
                          setIsLanguageOpen(false);
                        }}
                      >
                        {languageLabels[lang]}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className={styles.actionsButton} ref={actionsRef}>
            <div className={styles.splitButtonContainer}>
              <button
                type="button"
                className={styles.mainButton}
                onClick={handleCopyPrompt}
                disabled={copied}
                aria-label="Copy prompt to clipboard"
              >
                {copied ? (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copy prompt</span>
                  </>
                )}
              </button>

              <div className={styles.separator}></div>

              <button
                type="button"
                className={styles.dropdownButton}
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                aria-expanded={isActionsOpen}
                aria-label="More options"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`${styles.chevron} ${
                    isActionsOpen ? styles.chevronOpen : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            {isActionsOpen && (
              <div className={styles.actionsMenu}>
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={handleOpenInClaude}
                >
                  <div className={styles.menuItemIcon}>
                    <img
                      src="/img/site/logo-claude.svg"
                      alt="Claude"
                      className={styles.logoImage}
                    />
                  </div>
                  <span>Open in Claude</span>
                </button>

                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={handleOpenInChatGPT}
                >
                  <div className={styles.menuItemIcon}>
                    <img
                      src="/img/site/logo-chatgpt.png"
                      alt="ChatGPT"
                      className={styles.logoImage}
                    />
                  </div>
                  <span>Open in ChatGPT</span>
                </button>

                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={handleOpenInCursor}
                >
                  <div className={styles.menuItemIcon}>
                    <img
                      src="/img/site/logo-cursor.svg"
                      alt="Cursor"
                      className={styles.logoImage}
                    />
                  </div>
                  <span>Open in Cursor</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptStarter;
