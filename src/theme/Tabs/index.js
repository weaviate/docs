// src/theme/Tabs/index.js
// This overrides the default Docusaurus Tabs component with in-browser code
// execution: Python snippets run via Pyodide (WebAssembly) in the user's browser

import React, {
  useState,
  useEffect,
  isValidElement,
  Children,
  useRef,
} from "react";
import OriginalTabs from "@theme-original/Tabs";
import CodeBlock from "@theme/CodeBlock"; // Import CodeBlock
import clsx from "clsx";
import styles from "./styles.module.css";
import { DOC_SYSTEMS } from "../../components/Documentation/FilteredTextBlock";
import Tooltip from "/src/components/Tooltip";
import Link from "@docusaurus/Link";
import { runPythonCode } from "./pyodideRunner";
import { runTypeScriptCode } from "./tsRunner";
import {
  CREDENTIALS_CHANGE_EVENT,
  loadCredentials,
  saveCredentials,
  clearCredentials,
  normalizeClusterUrl,
  hasCredentials,
  isLocalOptIn,
  setLocalOptIn,
} from "./playgroundCredentials";

// Language configuration
const LANGUAGE_CONFIG = {
  py: {
    label: "Python",
    icon: "/img/site/logo-py.svg",
  },
  py_agents: {
    label: "Python (Agents)",
    icon: "/img/site/logo-py.svg",
  },
  py_engram: {
    label: "Python",
    icon: "/img/site/logo-py.svg",
  },
  py_engram_async: {
    label: "Python (Async)",
    icon: "/img/site/logo-py.svg",
  },
  ts: {
    label: "JavaScript/TypeScript",
    icon: "/img/site/logo-ts.svg",
  },
  ts_agents: {
    label: "JavaScript/TypeScript (Agents)",
    icon: "/img/site/logo-ts.svg",
  },
  go: {
    label: "Go",
    icon: "/img/site/logo-go.svg",
  },
  java: {
    label: "Java",
    icon: "/img/site/logo-java.svg",
  },
  csharp: {
    label: "C#",
    icon: "/img/site/logo-csharp.svg",
  },
  curl: {
    label: "Curl",
    icon: "/img/site/logo-curl.svg",
  },
  bash: {
    label: "Bash",
    icon: null,
  },
  shell: {
    label: "Shell",
    icon: null,
  },
};

// Configuration for in-browser code execution.
// Python runs on Pyodide, TypeScript via in-browser transpilation against the
// grpc-web client bundle. Java, C# and Go cannot run in the browser.
const BROWSER_EXECUTION_CONFIG = {
  SUPPORTED_LANGUAGES: ["py", "ts"],
};

// Predefined docs URL overrides by product name
const DOCS_URL_PRESETS = {
  // API docs link for Engram Python is intentionally omitted for now.
  // engram: {
  //   py_engram: "https://github.com/weaviate/engram-python-sdk",
  //   py_engram_async: "https://github.com/weaviate/engram-python-sdk",
  // },
};

// Context for sharing selected language across all code dropdowns
const CodeLanguageContext = React.createContext();
export const CodeLanguageProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedCodeLanguage") || "py";
    }
    return "py";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCodeLanguage", selectedLanguage);
      // Dispatch event so other dropdowns can update
      window.dispatchEvent(
        new CustomEvent("codeLanguageChange", { detail: selectedLanguage })
      );
    }
  }, [selectedLanguage]);

  return (
    <CodeLanguageContext.Provider
      value={{ selectedLanguage, setSelectedLanguage }}
    >
      {children}
    </CodeLanguageContext.Provider>
  );
};

// Language selector dropdown component
const LanguageDropdown = ({ value, onChange, options }) => {
  const config = LANGUAGE_CONFIG[value] || { label: value, icon: null };

  return (
    <div className={styles.languageSelector}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.languageDropdown}
      >
        {options.map((opt) => {
          const optConfig = LANGUAGE_CONFIG[opt.value] || {
            label: opt.label,
            icon: null,
          };
          return (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {optConfig.label}
            </option>
          );
        })}
      </select>

      {config.icon && (
        <img src={config.icon} alt="" className={styles.languageIcon} />
      )}

      <svg
        className={styles.dropdownArrow}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
};

// Extract code from child components
const extractCodeFromChild = (child) => {
  if (!isValidElement(child)) return null;

  // Check if it's a FilteredTextBlock
  if (child.props && child.props.text) {
    // Extract the filtered text based on markers
    const {
      text,
      startMarker,
      endMarker,
      includeStartMarker = "false",
    } = child.props;
    const lines = text.split("\n");
    let withinMarkers = false;
    const universalStartMarker = "START-ANY";
    const universalEndMarker = "END-ANY";

    const filteredLines = lines.filter((line) => {
      if (line.includes(startMarker) || line.includes(universalStartMarker)) {
        withinMarkers = true;
        return includeStartMarker === "true";
      }
      if (line.includes(endMarker) || line.includes(universalEndMarker)) {
        withinMarkers = false;
        return false;
      }
      return withinMarkers;
    });

    return filteredLines.join("\n");
  }

  // Check for code blocks in markdown
  if (child.props && child.props.children) {
    const content = child.props.children;
    if (typeof content === "string") {
      // Look for code blocks
      const codeBlockMatch = content.match(/```[\w]*\n([\s\S]*?)```/);
      if (codeBlockMatch) {
        return codeBlockMatch[1];
      }
      return content;
    }

    // Recursively search for code in nested children
    return Children.toArray(content)
      .map((c) => extractCodeFromChild(c))
      .filter(Boolean)
      .join("\n");
  }

  return null;
};

// In-browser code execution component (Python via Pyodide, TypeScript via
// in-browser transpilation)
const CodeExecutor = ({ code, language, onExecute, isExecuting }) => {
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [statusText, setStatusText] = useState("Running code…");

  const executeCode = async () => {
    if (!code) {
      setError("No code to execute");
      return;
    }

    setIsRunning(true);
    setOutput(null);
    setError(null);
    setStatusText("Running code…");

    const runCode = language === "ts" ? runTypeScriptCode : runPythonCode;
    try {
      // Never rejects: resolves to { output, error }
      const result = await runCode(code, { onStatus: setStatusText });
      setOutput(result.output);
      setError(result.error);
    } finally {
      setIsRunning(false);
      if (onExecute) {
        onExecute(false);
      }
    }
  };

  useEffect(() => {
    if (isExecuting) {
      executeCode();
    }
  }, [isExecuting]);

  if (!output && !error && !isRunning) {
    return null;
  }

  return (
    <div className={styles.executionOutput}>
      {isRunning && (
        <div className={styles.executionLoading}>
          <div className={styles.spinner}></div>
          <span>{statusText}</span>
        </div>
      )}

      {output && (
        <div className={styles.outputContainer}>
          <div className={styles.outputHeader}>
            <svg
              className={styles.outputIcon}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Output
          </div>
          <pre className={styles.outputContent}>{output}</pre>
        </div>
      )}

      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorHeader}>
            <svg
              className={styles.errorIcon}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Error
          </div>
          <pre className={styles.errorContent}>{error}</pre>
        </div>
      )}
    </div>
  );
};

// Button + panel for storing the reader's Weaviate Cloud URL and API key.
// They are kept in localStorage and injected as WEAVIATE_URL /
// WEAVIATE_API_KEY environment variables before each in-browser run.
//
// When `promptOpen` is true (the reader hit Run without connection details),
// the panel opens in prompt mode: it explains why the details are needed,
// links to creating a free cluster, and offers "Save and run" plus a
// "Use local instance" escape hatch. `onConnected` starts the pending run.
const CredentialsButton = ({
  promptOpen = false,
  onPromptDismiss,
  onConnected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const wrapperRef = useRef(null);

  const panelOpen = isOpen || promptOpen;

  const closePanel = () => {
    setIsOpen(false);
    if (promptOpen && onPromptDismiss) {
      onPromptDismiss();
    }
  };

  // Sync state from storage, including when another instance on the page
  // saves or clears credentials.
  useEffect(() => {
    const sync = () => {
      const creds = loadCredentials();
      setUrl(creds.url);
      setApiKey(creds.apiKey);
      setIsSaved(Boolean(creds.url || creds.apiKey));
    };
    sync();
    window.addEventListener(CREDENTIALS_CHANGE_EVENT, sync);
    return () => window.removeEventListener(CREDENTIALS_CHANGE_EVENT, sync);
  }, []);

  // When Run opens the prompt, discard any unsaved draft so the fields show
  // what a run would actually use.
  useEffect(() => {
    if (promptOpen) {
      const creds = loadCredentials();
      setUrl(creds.url);
      setApiKey(creds.apiKey);
    }
  }, [promptOpen]);

  // Close the panel on outside clicks
  useEffect(() => {
    if (!panelOpen) return undefined;
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        closePanel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [panelOpen, promptOpen]);

  const handleSave = () => {
    saveCredentials({ url, apiKey });
    const savedUrl = Boolean(normalizeClusterUrl(url));
    closePanel();
    // In prompt mode, saving a cluster URL starts the run the reader asked for
    if (promptOpen && savedUrl && onConnected) {
      onConnected();
    }
  };

  const handleClear = () => {
    clearCredentials();
  };

  const handleUseLocal = () => {
    setLocalOptIn(true);
    closePanel();
    if (onConnected) {
      onConnected();
    }
  };

  return (
    <div className={styles.credentialsWrapper} ref={wrapperRef}>
      <button
        className={clsx(styles.editButton, styles.credentialsButton)}
        onClick={() => {
          if (panelOpen) {
            closePanel();
            return;
          }
          // Discard any unsaved draft from a previous open, so the fields
          // always show what Run will actually use
          const creds = loadCredentials();
          setUrl(creds.url);
          setApiKey(creds.apiKey);
          setIsOpen(true);
        }}
        title="Set your Weaviate Cloud URL and API key"
      >
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span>Connect</span>
        {isSaved && <span className={styles.connectedDot} />}
      </button>

      {panelOpen && (
        <div className={styles.credentialsPanel}>
          {promptOpen && (
            <div className={styles.credentialsPromptIntro}>
              <strong>Connect to Weaviate to run this snippet</strong>
              <p>
                The code runs in your browser against your own Weaviate Cloud
                cluster. Enter its connection details below — or{" "}
                <a
                  href="https://console.weaviate.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  create a free cluster
                </a>{" "}
                first.
              </p>
            </div>
          )}
          <label className={styles.credentialsField}>
            <span>Cluster URL</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="your-cluster.weaviate.cloud"
              spellCheck="false"
              autoFocus={promptOpen}
            />
          </label>
          <label className={styles.credentialsField}>
            <span>API key</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your Weaviate Cloud API key"
              spellCheck="false"
            />
          </label>
          <div className={styles.credentialsHint}>
            Stored only in your browser. Available to snippets as{" "}
            <code>WEAVIATE_URL</code> and <code>WEAVIATE_API_KEY</code>.
          </div>
          <div className={styles.credentialsActions}>
            <button
              className={styles.credentialsSave}
              onClick={handleSave}
              disabled={promptOpen && !url.trim()}
            >
              {promptOpen ? "Save and run" : "Save"}
            </button>
            {promptOpen ? (
              <button
                className={styles.credentialsClear}
                onClick={handleUseLocal}
                title="Run against a local Weaviate instance on localhost:8080"
              >
                Use local instance
              </button>
            ) : (
              <button
                className={styles.credentialsClear}
                onClick={handleClear}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Code dropdown tabs component with execution
const CodeDropdownTabs = ({
  children,
  className,
  groupId,
  defaultValue,
  values,
  docsUrl,
  ...props
}) => {
  const tabValues =
    values ||
    Children.toArray(children)
      .filter((child) => isValidElement(child))
      .map((child) => ({
        value: child.props.value,
        label: child.props.label || child.props.value,
      }));

  // State for selected tab
  const isInternalChange = useRef(false);

  const [selectedValue, setSelectedValue] = useState(() => {
    if (typeof window === "undefined") {
      return defaultValue || tabValues[0]?.value;
    }

    const groupValue = localStorage.getItem(
      `docusaurus.tab.${groupId || "languages"}`
    );
    const globalValue = localStorage.getItem("selectedCodeLanguage");
    const targetLang = groupValue || globalValue;
    if (targetLang) {
      const availableLangs = tabValues.map((t) => t.value);
      if (availableLangs.includes(targetLang)) return targetLang;
      if (targetLang === "py" && availableLangs.includes("py_agents"))
        return "py_agents";
      if (targetLang === "py_agents" && availableLangs.includes("py"))
        return "py";
      if (targetLang === "py" && availableLangs.includes("py_engram"))
        return "py_engram";
      if (targetLang === "py_engram" && availableLangs.includes("py"))
        return "py";
      if (targetLang === "py_agents" && availableLangs.includes("py_engram"))
        return "py_engram";
      if (targetLang === "py_engram" && availableLangs.includes("py_agents"))
        return "py_agents";
      if (
        targetLang === "py_engram_async" &&
        availableLangs.includes("py_engram")
      )
        return "py_engram";
      if (targetLang === "py_engram_async" && availableLangs.includes("py"))
        return "py";
      if (
        targetLang === "py_engram_async" &&
        availableLangs.includes("py_agents")
      )
        return "py_agents";
      if (targetLang === "ts" && availableLangs.includes("ts_agents"))
        return "ts_agents";
      if (targetLang === "ts_agents" && availableLangs.includes("ts"))
        return "ts";
      return targetLang;
    }
    return defaultValue || tabValues[0]?.value;
  });

  const [isExecuting, setIsExecuting] = useState(false);
  // When the reader hits Run without stored connection details, the Connect
  // panel opens in prompt mode instead of executing against the localhost
  // fallback (which most readers do not have running).
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(null);
  const [editorRows, setEditorRows] = useState(10);

  const selectedChild = Children.toArray(children).find(
    (child) => isValidElement(child) && child.props.value === selectedValue
  );

  const originalCode = selectedChild
    ? extractCodeFromChild(selectedChild)
    : null;
  const codeToUse = editedCode ?? originalCode;

  // Get the actual content block (e.g., FilteredTextBlock) inside the selected
  // TabItem. A TabItem may contain several children (prose around the code
  // block) — only a lone content block can carry executable/editable props.
  const tabItemChildren = selectedChild
    ? Children.toArray(selectedChild.props.children).filter(isValidElement)
    : [];
  const contentBlock = tabItemChildren.length === 1 ? tabItemChildren[0] : null;

  // Check the props of the content block to see if it's executable or editable
  const isExecutable = contentBlock?.props?.executable === true;
  const isEditable = contentBlock?.props?.editable === true;

  // Reset editing state when language changes
  useEffect(() => {
    setIsEditing(false);
    setEditedCode(null);
  }, [selectedValue]);

  useEffect(() => {
    const handleLanguageChange = (event) => {
      if (isInternalChange.current) {
        isInternalChange.current = false;
        return;
      }
      const newGlobalLang = event.detail;
      const availableLangs = tabValues.map((t) => t.value);
      let valueToSet = newGlobalLang;
      if (!availableLangs.includes(newGlobalLang)) {
        if (newGlobalLang === "py" && availableLangs.includes("py_agents"))
          valueToSet = "py_agents";
        else if (newGlobalLang === "py_agents" && availableLangs.includes("py"))
          valueToSet = "py";
        else if (
          newGlobalLang === "py" &&
          availableLangs.includes("py_engram")
        )
          valueToSet = "py_engram";
        else if (
          newGlobalLang === "py_engram" &&
          availableLangs.includes("py")
        )
          valueToSet = "py";
        else if (
          newGlobalLang === "py_agents" &&
          availableLangs.includes("py_engram")
        )
          valueToSet = "py_engram";
        else if (
          newGlobalLang === "py_engram" &&
          availableLangs.includes("py_agents")
        )
          valueToSet = "py_agents";
        else if (
          newGlobalLang === "py_engram_async" &&
          availableLangs.includes("py_engram")
        )
          valueToSet = "py_engram";
        else if (
          newGlobalLang === "py_engram_async" &&
          availableLangs.includes("py")
        )
          valueToSet = "py";
        else if (
          newGlobalLang === "py_engram_async" &&
          availableLangs.includes("py_agents")
        )
          valueToSet = "py_agents";
        else if (newGlobalLang === "ts" && availableLangs.includes("ts_agents"))
          valueToSet = "ts_agents";
        else if (newGlobalLang === "ts_agents" && availableLangs.includes("ts"))
          valueToSet = "ts";
      }
      setSelectedValue(valueToSet);
    };
    window.addEventListener("codeLanguageChange", handleLanguageChange);
    return () =>
      window.removeEventListener("codeLanguageChange", handleLanguageChange);
  }, [tabValues]);

  const handleChange = (newValue) => {
    isInternalChange.current = true;
    setSelectedValue(newValue);
    setIsExecuting(false); // Reset execution state when changing language
    setShowConnectPrompt(false);
    if (typeof window !== "undefined") {
      if (groupId) {
        localStorage.setItem(`docusaurus.tab.${groupId}`, newValue);
      }
      localStorage.setItem("selectedCodeLanguage", newValue);
      window.dispatchEvent(
        new CustomEvent("codeLanguageChange", { detail: newValue })
      );
    }
  };

  // Save code if editing, then run
  const startRun = () => {
    if (isEditing) {
      setIsEditing(false);
    }
    setIsExecuting(true);
  };

  // Run gate: without stored credentials (and no explicit local-instance
  // choice), prompt for connection details instead of running.
  const handleExecute = () => {
    if (!hasCredentials() && !isLocalOptIn()) {
      setShowConnectPrompt(true);
      return;
    }
    startRun();
  };

  // This handler now calculates and sets the editor's height
  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false); // Save changes
    } else {
      const currentCode = codeToUse || "";
      const numLines = currentCode.split("\n").length;
      // Set editor height based on code lines, with a minimum of 10
      setEditorRows(Math.max(10, numLines));
      setEditedCode(currentCode);
      setIsEditing(true);
    }
  };

  const isLanguageAvailable = tabValues.some(
    (tab) => tab.value === selectedValue
  );

  let dropdownOptions = tabValues;
  if (!isLanguageAvailable) {
    dropdownOptions = [
      {
        value: selectedValue,
        label: LANGUAGE_CONFIG[selectedValue]?.label || selectedValue,
        disabled: true,
      },
      ...tabValues,
    ];
  }

  const canExecute =
    isExecutable &&
    BROWSER_EXECUTION_CONFIG.SUPPORTED_LANGUAGES.includes(selectedValue) &&
    codeToUse;
  const canEdit = isEditable && originalCode !== null;

  const docSystem = DOC_SYSTEMS[selectedValue];
  const resolvedDocsUrl = typeof docsUrl === "string" ? DOCS_URL_PRESETS[docsUrl] : docsUrl;
  const overrideDocsUrl = resolvedDocsUrl && resolvedDocsUrl[selectedValue];
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const params = new URLSearchParams({
    template: "doc_feedback.yml",
    title: "[Documentation Feedback]: ",
    labels: "user-feedback",
    "page-url": currentUrl,
  });

  return (
    <div className={clsx(styles.codeDropdownContainer, className)}>
      <div className={styles.codeDropdownHeader}>
        <div className={styles.leftSection}>
          <span className={styles.languageLabel}></span>
          <LanguageDropdown
            value={selectedValue}
            onChange={handleChange}
            options={dropdownOptions}
          />

          {canExecute && (
            <button
              className={styles.playButton}
              onClick={handleExecute}
              disabled={isExecuting}
              title="Run this code"
            >
              {isExecuting ? (
                <svg className={styles.playButtonSpinner} viewBox="0 0 24 24">
                  <circle
                    className={styles.spinnerPath}
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    strokeWidth="3"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              )}
              <span>Run</span>
            </button>
          )}

          {/* ++ Edit/Save Button */}
          {canEdit && (
            <button
              className={styles.editButton}
              onClick={handleEditToggle}
              title={isEditing ? "Save code" : "Edit this code snippet"}
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                {isEditing ? (
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                ) : (
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 14H3a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1z" />
                )}
              </svg>
              <span>{isEditing ? "Save" : "Edit"}</span>
            </button>
          )}

          {canExecute && (
            <CredentialsButton
              promptOpen={showConnectPrompt}
              onPromptDismiss={() => setShowConnectPrompt(false)}
              onConnected={startRun}
            />
          )}
        </div>

        {(overrideDocsUrl || docSystem?.baseUrl) && (
          <div className={styles.rightSection}>
            <a
              href={overrideDocsUrl || docSystem.baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.apiDocsLink}
              title="View API documentation"
            >
              {docSystem?.icon ? (
                <img
                  src={docSystem.icon}
                  alt={`${selectedValue} docs`}
                  height="12"
                  width="12"
                  style={{ verticalAlign: "middle" }}
                />
              ) : (
                <svg
                  height="12"
                  width="12"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ verticalAlign: "middle" }}
                >
                  <path d="M6.5 2h11c.7 0 1.3.6 1.3 1.3v17.4c0 .7-.6 1.3-1.3 1.3h-11c-.7 0-1.3-.6-1.3-1.3V3.3C5.2 2.6 5.8 2 6.5 2zm1 2v16h9V4h-9zm2 3h5v1h-5V7zm0 3h5v1h-5v-1zm0 3h3v1h-3v-1z" />
                </svg>
              )}
              <span style={{ verticalAlign: "middle" }}>
                &nbsp;&nbsp;API docs
              </span>
            </a>

            <div className={styles.versionInfo}>
              {/* The Tooltip now wraps the text and the icon */}
              <Tooltip
                content={
                  <>
                    Code snippets in the documentation reflect the latest client
                    library and Weaviate Database version. Check the{" "}
                    <Link href="/weaviate/release-notes">Release notes</Link>{" "}
                    for specific versions.
                    <br />
                    <br />
                    If a snippet doesn't work or you have feedback, please open
                    a{" "}
                    <Link
                      href={`https://github.com/weaviate/docs/issues/new?${params.toString()}`}
                    >
                      GitHub issue
                    </Link>
                    .
                  </>
                }
                position="left"
              >
                <span className={styles.versionLabel}>
                  More info
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={styles.infoIcon}
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                </span>
              </Tooltip>
            </div>
          </div>
        )}
      </div>

      {/* Conditionally render editor, saved code, or original content */}
      <div className={styles.codeContent}>
        {isLanguageAvailable ? (
          // Render ALL children, but hide non-selected ones with CSS
          isEditing ? (
            // In edit mode, show a textarea and the executor
            <>
              <textarea
                className={styles.codeEditor}
                value={editedCode}
                onChange={(e) => setEditedCode(e.target.value)}
                spellCheck="false"
                rows={editorRows}
              />
              {canExecute && (
                <CodeExecutor
                  code={codeToUse}
                  language={selectedValue}
                  onExecute={setIsExecuting}
                  isExecuting={isExecuting}
                />
              )}
            </>
          ) : (
            // Not editing: map over children and show the correct one
            Children.map(children, (child) => {
              if (!isValidElement(child)) return null;

              const isSelected = child.props.value === selectedValue;

              // Normalize language for CodeBlock display
              let langClass = selectedValue.replace(/_agents|_v\d+/, "");

              return (
                <div
                  key={child.props.value}
                  className={clsx(styles.tabPanel, {
                    [styles.tabPanelHidden]: !isSelected,
                  })}
                  style={{ display: isSelected ? "block" : "none" }}
                  aria-hidden={!isSelected}
                >
                  {isSelected && editedCode !== null ? (
                    // If saved, show a simple CodeBlock with the edited code
                    <CodeBlock className={`language-${langClass}`}>
                      {editedCode}
                    </CodeBlock>
                  ) : (
                    // Otherwise, show the original child content
                    child
                  )}

                  {isSelected && canExecute && (
                    <CodeExecutor
                      code={codeToUse}
                      language={selectedValue}
                      onExecute={setIsExecuting}
                      isExecuting={isExecuting}
                    />
                  )}
                </div>
              );
            })
          )
        ) : (
          <div className={styles.comingSoon}>
            <p>
              A code snippet for{" "}
              <strong>
                {LANGUAGE_CONFIG[selectedValue]?.label || selectedValue}
              </strong>{" "}
              is not yet available here.
            </p>
            <span>
              Please open a{" "}
              <Link
                href={`https://github.com/weaviate/docs/issues/new?${params.toString()}`}
              >
                GitHub issue
              </Link>{" "}
              so we can prioritize adding support for this language.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Tabs component wrapper
export default function Tabs({ className, ...props }) {
  const isCodeDropdown = className && className.includes("code");

  if (isCodeDropdown) {
    return <CodeDropdownTabs className={className} {...props} />;
  }

  return <OriginalTabs className={className} {...props} />;
}
