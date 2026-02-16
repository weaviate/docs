import React, { useState, useRef, useEffect } from "react";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import styles from "./styles.module.scss";
import { urls, getPlatformFromUrl } from "../config";
import { analytics } from "@site/src/utils/analytics";

export default function ContextualMenu({
  variant = "docs",
  languages = [],
  promptUrl = "",
  promptName = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("idle"); // idle, copying, success
  const [selectedLanguage, setSelectedLanguage] = useState(
    languages[0] || "python",
  );
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const menuRef = useRef(null);
  const languageRef = useRef(null);
  const docContext = useDoc();
  const { metadata = {}, frontMatter = {} } = docContext || {};

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCurrentPageUrl = () => {
    return typeof window !== "undefined" ? window.location.href : "";
  };

  const copyPageAsMarkdown = async () => {
    setCopyStatus("copying");
    try {
      // Get the main article content
      const articleElement = document.querySelector("article");
      if (!articleElement) {
        throw new Error("Article content not found");
      }

      // Get page title and metadata
      const title = metadata.title || frontMatter.title || "Untitled";
      const pageUrl = getCurrentPageUrl();

      // Extract text content from the article
      const content = articleElement.innerText;

      // Format as markdown with metadata
      const markdown = `# ${title}

Source: ${pageUrl}

---

${content}`;

      await navigator.clipboard.writeText(markdown);

      // Track successful copy
      analytics.contextualMenu.copyPage(pageUrl, title);

      setCopyStatus("success");
      setTimeout(() => {
        setCopyStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("Failed to copy page:", error);
      setCopyStatus("idle");
    }
  };

  const handleOpenInLLM = (llmUrl) => {
    // Get platform name from URL using config
    const platform = getPlatformFromUrl(llmUrl);

    // Prepare additional tracking params
    const additionalParams = variant === 'prompts'
      ? { language: selectedLanguage, prompt_name: promptName }
      : { page_url: getCurrentPageUrl() };

    // Track LLM open
    analytics.contextualMenu.openLLM(platform, variant, additionalParams);

    let prompt = "";
    if (variant === "docs") {
      const pageUrl = getCurrentPageUrl();
      prompt = encodeURIComponent(
        `I have a question about this documentation page: ${pageUrl}`,
      );
    } else {
      const fullUrl = `${promptUrl}${promptName}-${selectedLanguage}.md`;
      prompt = `Open this site and follow the instructions: ${fullUrl}`;
    }
    window.open(`${llmUrl}?q=${prompt}`, "_blank");
    setIsOpen(false);
  };


  const handleConnectToCursor = () => {
    // Track MCP connection
    analytics.contextualMenu.connectMCP('cursor');

    const config = {
      name: "Weaviate Docs",
      url: "https://weaviate-docs.mcp.kapa.ai",
    };
    const encodedConfig = btoa(JSON.stringify(config));
    window.location.href = `${urls.cursorDeepLink}name=Weaviate%20Docs&config=${encodedConfig}`;
    setIsOpen(false);
  };

  const handleConnectToVSCode = () => {
    // Track MCP connection
    analytics.contextualMenu.connectMCP('vscode');

    const config = {
      name: "Weaviate Docs",
      url: "https://weaviate.mcp.kapa.ai",
    };
    const params = encodeURIComponent(JSON.stringify(config));
    window.location.href = `${urls.vsCode}${params}`;
    setIsOpen(false);
  };

  const handleLearnAboutMCP = () => {
    // Track MCP learn more
    analytics.contextualMenu.connectMCP('learn_more');

    window.open(urls.weaviateDocsMcp, "_blank");
    setIsOpen(false);
  };

  const handleViewAsMarkdown = () => {
    // Prepare tracking params
    const additionalParams = variant === 'prompts'
      ? { language: selectedLanguage, prompt_name: promptName }
      : { page_url: getCurrentPageUrl() };

    // Track view markdown
    analytics.contextualMenu.viewMarkdown(variant, additionalParams);

    if (variant === "prompts") {
      const fullUrl = `${promptUrl}${promptName}-${selectedLanguage}.md`;
      window.open(fullUrl, "_blank");
    } else {
      const sourcePath = metadata.source || "";
      const githubPath = sourcePath.replace("@site/", "");
      const githubUrl = `${urls.github}${githubPath}`;
      window.open(githubUrl, "_blank");
    }
    setIsOpen(false);
  };

  // Prompts variant: Copy prompt from markdown file
  const copyPromptFromFile = async () => {
    setCopyStatus("copying");
    try {
      const fullUrl = `${promptUrl}${promptName}-${selectedLanguage}.md`;
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch markdown: ${response.statusText}`);
      }
      const markdownContent = await response.text();
      await navigator.clipboard.writeText(markdownContent);

      // Track successful copy
      analytics.contextualMenu.copyPrompt(
        promptName,
        selectedLanguage,
        `${promptName}-${selectedLanguage}`
      );

      setCopyStatus("success");
      setTimeout(() => {
        setCopyStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("Failed to copy prompt:", error);
      setCopyStatus("idle");
    }
  };

  const languageLabels = {
    python: "Python",
    typescript: "TypeScript",
    go: "Go",
    java: "Java",
    csharp: "C#",
  };

  const showLanguageSelector = variant === "prompts" && languages.length > 1;
  const mainButtonLabel =
    variant === "prompts"
      ? copyStatus === "success"
        ? "Copied!"
        : "Copy prompt"
      : copyStatus === "success"
        ? "Copied!"
        : "Copy page";
  const mainButtonHandler =
    variant === "prompts" ? copyPromptFromFile : copyPageAsMarkdown;

  return (
    <div
      className={`${styles.contextualMenu} ${
        variant === "prompts" ? styles.prompts : ""
      }`}
      ref={menuRef}
    >
      {showLanguageSelector && (
        <div className={styles.languageDropdown} ref={languageRef}>
          <button
            type="button"
            className={styles.languageButton}
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            aria-expanded={isLanguageOpen}
            aria-label="Select programming language"
          >
            <span>{languageLabels[selectedLanguage]}</span>
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
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={`${styles.languageOption} ${
                    selectedLanguage === lang ? styles.active : ""
                  }`}
                  onClick={() => {
                    const previousLanguage = selectedLanguage;
                    setSelectedLanguage(lang);
                    setIsLanguageOpen(false);

                    // Track language selection
                    analytics.contextualMenu.selectLanguage(
                      previousLanguage,
                      lang,
                      promptName
                    );
                  }}
                >
                  {languageLabels[lang]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.triggerButton}>
        <button
          className={styles.mainButton}
          onClick={mainButtonHandler}
          disabled={copyStatus === "copying"}
          aria-label={
            variant === "prompts" ? "Copy prompt" : "Copy page as markdown"
          }
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.icon}
          >
            {copyStatus === "success" ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </>
            )}
          </svg>
          <span>{mainButtonLabel}</span>
        </button>
        <div className={styles.separator}></div>
        <button
          className={styles.dropdownButton}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="More page actions"
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
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {variant === "prompts" ? (
            // Prompts variant menu items
            <>
              <button className={styles.menuItem} onClick={handleViewAsMarkdown}>
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-markdown.svg"
                    alt="Markdown"
                    className={styles.markdownLogo}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    View as markdown
                  </div>
                  <div className={styles.menuItemDescription}>
                    Open prompt in markdown format
                  </div>
                </div>
              </button>

              <button
                className={styles.menuItem}
                onClick={() => handleOpenInLLM(urls.claude)}
              >
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-claude.svg"
                    alt="Claude"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    Claude
                  </div>
                  <div className={styles.menuItemDescription}>
                    Start with pre-filled prompt
                  </div>
                </div>
              </button>

              <button
                className={styles.menuItem}
                onClick={() => handleOpenInLLM(urls.chatGpt)}
              >
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-chatgpt.png"
                    alt="ChatGPT"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    ChatGPT
                  </div>
                  <div className={styles.menuItemDescription}>
                    Start with pre-filled prompt
                  </div>
                </div>
              </button>

              {/* <button
                className={styles.menuItem}
                onClick={() => handleOpenInLLM(urls.gemini)}
              >
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-gemini.svg"
                    alt="Gemini"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    Gemini
                  </div>
                  <div className={styles.menuItemDescription}>
                    Start with pre-filled prompt
                  </div>
                </div>
              </button> */}

              <button
                className={styles.menuItem}
                onClick={() => {
                  // Track Cursor open
                  analytics.contextualMenu.openLLM('cursor', 'prompts', {
                    language: selectedLanguage,
                    prompt_name: promptName,
                  });

                  const fullUrl = `${promptUrl}${promptName}-${selectedLanguage}.md`;
                  const prompt = `Open this site and follow the instructions: ${fullUrl}`;
                  const url = new URL(urls.cursor);
                  url.searchParams.set("text", prompt);
                  window.open(url.toString(), "_blank");
                  setIsOpen(false);
                }}
              >
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-cursor.svg"
                    alt="Cursor"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    Cursor
                  </div>
                  <div className={styles.menuItemDescription}>
                    Start with pre-filled prompt
                  </div>
                </div>
              </button>
            </>
          ) : (
            // Docs variant menu items
            <>
              <button
                className={styles.menuItem}
                onClick={handleViewAsMarkdown}
              >
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-markdown.svg"
                    alt="Markdown"
                    className={styles.markdownLogo}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    View as markdown
                  </div>
                  <div className={styles.menuItemDescription}>
                    Open source file on GitHub
                  </div>
                </div>
              </button>
              <button
                className={styles.menuItem}
                onClick={() => handleOpenInLLM(urls.chatGpt)}
              >
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-chatgpt.png"
                    alt="ChatGPT"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    ChatGPT
                  </div>
                  <div className={styles.menuItemDescription}>
                    Ask questions about this page
                  </div>
                </div>
              </button>

              <button
                className={styles.menuItem}
                onClick={() => handleOpenInLLM(urls.claude)}
              >
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-claude.svg"
                    alt="Claude"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    Claude
                  </div>
                  <div className={styles.menuItemDescription}>
                    Ask questions about this page
                  </div>
                </div>
              </button>

              {/* <button
                className={styles.menuItem}
                onClick={() => handleOpenInLLM(urls.gemini)}
              >
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-gemini.svg"
                    alt="Gemini"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    Gemini
                  </div>
                  <div className={styles.menuItemDescription}>
                    Ask questions about this page
                  </div>
                </div>
              </button> */}

              <div className={styles.menuDivider}></div>

              <button
                className={styles.menuItem}
                onClick={handleConnectToCursor}
              >
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-cursor.svg"
                    alt="Cursor"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    Cursor
                  </div>
                  <div className={styles.menuItemDescription}>
                    Add Docs MCP Server to Cursor
                  </div>
                </div>
              </button>

              <button
                className={styles.menuItem}
                onClick={handleConnectToVSCode}
              >
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-vscode.png"
                    alt="VS Code"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    VS Code
                  </div>
                  <div className={styles.menuItemDescription}>
                    Add Docs MCP Server to VS Code
                  </div>
                </div>
              </button>

              <button
                className={styles.menuItem}
                onClick={handleLearnAboutMCP}
              >
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/weaviate-logo-w.png"
                    alt="Weaviate"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    Weaviate Docs MCP
                  </div>
                  <div className={styles.menuItemDescription}>
                    Learn more about our Docs MCP server
                  </div>
                </div>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
