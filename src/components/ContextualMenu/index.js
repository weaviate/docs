import React, { useState, useRef, useEffect } from "react";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import styles from "./styles.module.scss";

export default function ContextualMenu({
  variant = "docs",
  languages = [],
  promptUrl = "",
  promptName = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("idle"); // idle, copying, success
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0] || "python");
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
      setCopyStatus("success");
      setTimeout(() => {
        setCopyStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("Failed to copy page:", error);
      setCopyStatus("idle");
    }
  };

  const handleOpenInChatGPT = () => {
    const pageUrl = getCurrentPageUrl();
    const title = metadata.title || frontMatter.title || "Documentation Page";
    const prompt = encodeURIComponent(
      `I have a question about this documentation page: ${pageUrl}`,
    );
    window.open(`https://chat.openai.com/?q=${prompt}`, "_blank");
    setIsOpen(false);
  };

  const handleOpenInClaude = () => {
    const pageUrl = getCurrentPageUrl();
    const title = metadata.title || frontMatter.title || "Documentation Page";
    const prompt = encodeURIComponent(
      `I have a question about this documentation page: ${pageUrl}`,
    );
    window.open(`https://claude.ai/new?q=${prompt}`, "_blank");
    setIsOpen(false);
  };

  const handleOpenInGemini = () => {
    const pageUrl = getCurrentPageUrl();
    const title = metadata.title || frontMatter.title || "Documentation Page";
    const prompt = `I have a question about this documentation page: ${pageUrl}`;
    // Gemini uses a different URL structure - open to app and user can paste prompt
    window.open(`https://gemini.google.com/app`, "_blank");
    // Copy prompt to clipboard so user can paste it
    navigator.clipboard.writeText(prompt);
    setIsOpen(false);
  };

  const handleConnectToCursor = () => {
    // Simplified config for deep link - Cursor will format it properly
    const config = {
      name: "Weaviate Docs",
      url: "https://weaviate-docs.mcp.kapa.ai",
    };
    // Base64 encode the configuration
    const encodedConfig = btoa(JSON.stringify(config));
    window.location.href = `cursor://anysphere.cursor-deeplink/mcp/install?name=Weaviate%20Docs&config=${encodedConfig}`;
    setIsOpen(false);
  };

  const handleConnectToVSCode = () => {
    // Simplified config for deep link - VS Code will format it properly
    const config = {
      name: "Weaviate Docs",
      url: "https://weaviate.mcp.kapa.ai",
    };
    // URL encode the configuration
    const params = encodeURIComponent(JSON.stringify(config));
    window.location.href = `vscode:mcp/install?${params}`;
    setIsOpen(false);
  };

  const handleLearnAboutMCP = () => {
    window.open("/weaviate/mcp/docs-mcp-server", "_blank");
    setIsOpen(false);
  };

  const handleViewAsMarkdown = () => {
    if (variant === "prompts") {
      // For prompts variant, open the prompt markdown file
      const fullUrl = `${promptUrl}${promptName}-${selectedLanguage}.md`;
      window.open(fullUrl, "_blank");
    } else {
      // For docs variant, open raw GitHub markdown
      const sourcePath = metadata.source || "";
      const githubPath = sourcePath.replace("@site/", "");
      const githubUrl = `https://raw.githubusercontent.com/weaviate/docs/refs/heads/main/${githubPath}`;
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
      setCopyStatus("success");
      setTimeout(() => {
        setCopyStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("Failed to copy prompt:", error);
      setCopyStatus("idle");
    }
  };

  // Prompts variant: Open in LLM with URL instruction
  const handleOpenInLLM = (llmUrl) => {
    const fullUrl = `${promptUrl}${promptName}-${selectedLanguage}.md`;
    const prompt = `Open this site and follow the instructions: ${fullUrl}`;
    const encodedPrompt = encodeURIComponent(prompt);
    window.open(`${llmUrl}?q=${encodedPrompt}`, "_blank");
    setIsOpen(false);
  };

  const languageLabels = {
    python: "Python",
    typescript: "TypeScript",
    go: "Go",
    java: "Java",
    csharp: "C#",
  };

  const showLanguageSelector = variant === "prompts" && languages.length > 1;
  const mainButtonLabel = variant === "prompts"
    ? (copyStatus === "success" ? "Copied!" : "Copy prompt")
    : (copyStatus === "success" ? "Copied!" : "Copy page");
  const mainButtonHandler = variant === "prompts" ? copyPromptFromFile : copyPageAsMarkdown;

  return (
    <div className={`${styles.contextualMenu} ${variant === "prompts" ? styles.prompts : ""}`} ref={menuRef}>
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
              className={`${styles.chevron} ${isLanguageOpen ? styles.chevronOpen : ""}`}
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
                  className={`${styles.languageOption} ${selectedLanguage === lang ? styles.active : ""}`}
                  onClick={() => {
                    setSelectedLanguage(lang);
                    setIsLanguageOpen(false);
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
          aria-label={variant === "prompts" ? "Copy prompt" : "Copy page as markdown"}
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
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.externalIcon}
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                  <div className={styles.menuItemDescription}>
                    Open prompt in markdown format
                  </div>
                </div>
              </button>

              <button className={styles.menuItem} onClick={() => handleOpenInLLM("https://claude.ai/new")}>
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-claude.svg"
                    alt="Claude"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    Open in Claude
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.externalIcon}
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                  <div className={styles.menuItemDescription}>
                    Start with pre-filled prompt
                  </div>
                </div>
              </button>

              <button className={styles.menuItem} onClick={() => handleOpenInLLM("https://chat.openai.com/")}>
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-chatgpt.png"
                    alt="ChatGPT"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    Open in ChatGPT
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.externalIcon}
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                  <div className={styles.menuItemDescription}>
                    Start with pre-filled prompt
                  </div>
                </div>
              </button>

              <button className={styles.menuItem} onClick={() => {
                const fullUrl = `${promptUrl}${promptName}-${selectedLanguage}.md`;
                const prompt = `Open this site and follow the instructions: ${fullUrl}`;
                const url = new URL("https://cursor.com/link/prompt");
                url.searchParams.set("text", prompt);
                window.open(url.toString(), "_blank");
                setIsOpen(false);
              }}>
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-cursor.svg"
                    alt="Cursor"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    Open in Cursor
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.externalIcon}
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
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
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.externalIcon}
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                  <div className={styles.menuItemDescription}>
                    Open source file on GitHub
                  </div>
                </div>
              </button>

              <button className={styles.menuItem} onClick={handleOpenInChatGPT}>
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-chatgpt.png"
                    alt="ChatGPT"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    Open in ChatGPT
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.externalIcon}
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                  <div className={styles.menuItemDescription}>
                    Ask questions about this page
                  </div>
                </div>
              </button>

              <button className={styles.menuItem} onClick={handleOpenInClaude}>
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-claude.svg"
                    alt="Claude"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    Open in Claude
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.externalIcon}
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                  <div className={styles.menuItemDescription}>
                    Ask questions about this page
                  </div>
                </div>
              </button>

              <button className={styles.menuItem} onClick={handleConnectToCursor}>
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-cursor.svg"
                    alt="Cursor"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    Connect to Cursor
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.externalIcon}
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                  <div className={styles.menuItemDescription}>
                    Add Docs MCP Server to Cursor
                  </div>
                </div>
              </button>

              <button className={styles.menuItem} onClick={handleConnectToVSCode}>
                <div className={styles.menuItemIcon}>
                  <img
                    src="/img/site/logo-vscode.png"
                    alt="VS Code"
                    className={styles.logoImage}
                  />
                </div>
                <div className={styles.menuItemContent}>
                  <div className={styles.menuItemTitle}>
                    Connect to VS Code
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.externalIcon}
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                  <div className={styles.menuItemDescription}>
                    Add Docs MCP Server to VS Code
                  </div>
                </div>
              </button>

              <button className={styles.menuItem} onClick={handleLearnAboutMCP}>
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
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.externalIcon}
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
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
