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
  const [copyStatus, setCopyStatus] = useState("idle"); // idle, copying, success, error
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
      // turndown touches the DOM, and Docusaurus server-renders this component
      // at build time, so it must never be imported at module scope. Load it
      // lazily inside this browser-only async handler instead.
      const { default: TurndownService } = await import("turndown");
      const { gfm } = await import("turndown-plugin-gfm");

      // Scope to the rendered MDX body only. `.theme-doc-markdown` is the inner
      // wrapper from @theme/DocItem/Content; the breadcrumbs, the ContextualMenu
      // button, the version badge, the mobile TOC and the footer are all
      // siblings OUTSIDE it (see src/theme/DocItem/Layout/index.js), so scoping
      // here drops all the page chrome. Fall back to <article> for safety.
      const contentRoot =
        document.querySelector(".theme-doc-markdown") ||
        document.querySelector("article");
      if (!contentRoot) {
        throw new Error("Article content not found");
      }

      // Get page title and metadata
      const title = metadata.title || frontMatter.title || "Untitled";
      const pageUrl = getCurrentPageUrl();

      // Work on a clone so the live page is never mutated.
      const clone = contentRoot.cloneNode(true);

      // Strip non-prose chrome from the clone before converting. Only stable
      // (non-CSS-module-hashed) selectors are used here.
      //   [aria-hidden="true"] - our custom code Tabs (src/theme/Tabs/index.js)
      //     render EVERY language panel and hide the non-selected ones with
      //     display:none + aria-hidden="true"; removing them leaves only the
      //     selected language. (Also drops decorative aria-hidden icons.)
      //   [role="tablist"]     - the clickable label strip of DEFAULT Docusaurus
      //     <Tabs> (used for non-code content, e.g. Docker/Kubernetes steps),
      //     which would otherwise leak as a bullet list of tab labels.
      //   [hidden]             - inactive DEFAULT-tab panels mark themselves with
      //     the `hidden` attribute (not aria-hidden); removing them gives the
      //     same selected-only behavior for non-code tabs. (Custom code tabs use
      //     style+aria-hidden, never `hidden`/role=tablist, so no code regression.)
      //   select               - the per-tab language dropdown.
      //   .badge               - FilteredTextBlock's badge row (stable Infima
      //     class, see FilteredTextBlock.js:198,222).
      //   nav                  - stray navigation controls.
      //   img[alt=""]          - decorative empty-alt icons (e.g. logo-py.svg);
      //     real content images keep their meaningful alt and survive.
      //   .hash-link           - Docusaurus heading anchor (<a class="hash-link"
      //     aria-label="Direct link to ..."> holding a zero-width char); it uses
      //     aria-label (not aria-hidden), so it must be named explicitly or it
      //     leaks as `[](#... "Direct link to ...")` on every heading.
      //   [data-copy-exclude]  - explicit opt-out marker on shared components
      //     whose chrome leaks but isn't otherwise stably targetable (badges,
      //     the docs-feedback partial, the Tooltip popup, the PromptStarter CTA).
      // NB: we do NOT strip <button> wholesale — inline content buttons are
      // legitimate prose (e.g. the KapaAI "Ask AI" trigger rendered mid-sentence,
      // src/components/KapaAI/index.jsx). Code-block chrome buttons are handled
      // by a targeted strip just below.
      clone
        .querySelectorAll(
          '[aria-hidden="true"], [role="tablist"], [hidden], select, .badge, nav, img[alt=""], .hash-link, [data-copy-exclude]',
        )
        .forEach((node) => node.remove());

      // Strip ONLY the code-block chrome buttons (the Docusaurus "Copy" button and
      // the word-wrap toggle). These hydrate client-side (not present in the static
      // build HTML) and carry a stable Copy/word-wrap aria-label or title; the
      // KapaAI inline button carries neither, so it survives. This runs AFTER the
      // strip above so any data-copy-exclude subtree (e.g. the PromptStarter CTA,
      // whose nested menu has a "Copy prompt" button) is already gone.
      clone
        .querySelectorAll(
          'button[aria-label*="copy" i], button[title*="copy" i], button[aria-label*="wrap" i], button[title*="wrap" i]',
        )
        .forEach((node) => node.remove());

      // Drop the code-tab HEADER chrome (language dropdown, the "API docs" link
      // + icon, the "More info" tooltip) while KEEPING the code content. Our
      // code blocks are authored as <Tabs className="code"> (src/theme/Tabs/
      // index.js:464-474), which renders a container carrying the literal,
      // stable `code` class whose FIRST child is the header and second is the
      // code content (Tabs/index.js:333-460). The bare `code` class is used
      // ONLY for these containers (verified: no other component or global CSS
      // uses it), so removing each container's first element child strips the
      // header without ever touching the code.
      clone
        .querySelectorAll(".code")
        .forEach((container) => container.firstElementChild?.remove());

      // Content cards (CardsSection, src/components/CardsSection/index.jsx) render
      // each card as an <a> wrapping BLOCK markup (<div> header + <span> title,
      // <p> description). Rewrite each into a flat <p><a>title</a> — desc</p> so
      // turndown's DEFAULT (inline) link rule produces a clean single line. This
      // is done as DOM pre-processing rather than a turndown <a> rule on purpose:
      // an <a> rule whose replacement emits blank lines makes turndown
      // block-separate EVERY inline link (orphaning surrounding bold/text). The
      // querySelector guard means plain inline links (<a> wrapping only
      // text/inline) are skipped and keep turndown's default inline rendering.
      clone.querySelectorAll("a[href]").forEach((a) => {
        if (!a.querySelector("div, p, h1, h2, h3, h4, h5, h6")) return; // card-links only
        // <br> -> space so e.g. "import" + "(recommended)" don't run together.
        a.querySelectorAll("br").forEach((br) =>
          br.replaceWith(document.createTextNode(" ")),
        );
        const collapse = (s) => (s || "").replace(/\s+/g, " ").trim();
        const titleEl =
          a.querySelector('[class*="cardTitle"]') ||
          a.querySelector("h1, h2, h3, h4, h5, h6");
        const descEl =
          a.querySelector('[class*="cardDescription"]') || a.querySelector("p");
        const title =
          collapse(titleEl && titleEl.textContent) || collapse(a.textContent);
        const desc = collapse(descEl && descEl.textContent);
        const href = a.getAttribute("href");
        if (!title) return;
        const p = document.createElement("p");
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = title;
        p.appendChild(link);
        if (desc && desc !== title) {
          p.appendChild(document.createTextNode(" — " + desc));
        }
        a.replaceWith(p);
      });

      const turndownService = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        bulletListMarker: "-",
      });
      turndownService.use(gfm);
      // Note: "button" is intentionally absent — inline content buttons (KapaAI's
      // "Ask AI") must survive; code-block chrome buttons are stripped from the
      // clone above.
      turndownService.remove(["select", "nav", "script", "style"]);

      // Docusaurus/Prism renders code as <pre class="language-xxx"> with a
      // <code> child whose lines are <span class="token-line"> separated by
      // <br>. turndown's default fenced-code rule reads the language off <code>
      // (Docusaurus puts it on <pre>) and drops the <br> line breaks, so emit
      // our own fenced block: language from the language-xxx class, content
      // rebuilt from the token-line spans (falling back to textContent).
      turndownService.addRule("docusaurusCodeBlock", {
        filter: (node) =>
          node.nodeName === "PRE" &&
          (node.querySelector("code") !== null ||
            node.classList.contains("prism-code")),
        replacement: (_content, node) => {
          const code = node.querySelector("code") || node;
          const classAttr = `${node.className} ${code.className}`;
          const langMatch = classAttr.match(/language-([\w-]+)/);
          const language = langMatch ? langMatch[1] : "";
          const lines = code.querySelectorAll(".token-line");
          const text = (
            lines.length
              ? Array.from(lines)
                  .map((line) => line.textContent)
                  .join("\n")
              : code.textContent
          ).replace(/\n+$/, "");
          return `\n\n\`\`\`${language}\n${text}\n\`\`\`\n\n`;
        },
      });

      const markdown = turndownService.turndown(clone);

      // No synthetic `# title` — the page H1 already lives inside
      // .theme-doc-markdown, so prepending one would duplicate it. Keep the
      // Source line for LLM context.
      const output = `Source: ${pageUrl}\n\n---\n\n${markdown}`;

      // Guard against insecure contexts where the Clipboard API is missing,
      // rather than throwing an opaque error into the catch.
      if (!navigator.clipboard?.writeText) {
        throw new Error(
          "Clipboard API is unavailable (a secure context is required)",
        );
      }
      await navigator.clipboard.writeText(output);

      // Track successful copy
      analytics.contextualMenu.copyPage(pageUrl, title);

      setCopyStatus("success");
      setTimeout(() => {
        setCopyStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("Failed to copy page:", error);
      setCopyStatus("error");
      setTimeout(() => {
        setCopyStatus("idle");
      }, 2000);
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
    copyStatus === "error"
      ? "Copy failed"
      : variant === "prompts"
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
          <span aria-live="polite">{mainButtonLabel}</span>
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
