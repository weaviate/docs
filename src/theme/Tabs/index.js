// src/theme/Tabs/index.js
// This overrides the default Docusaurus Tabs component with remote code execution

import React, {
  useState,
  useEffect,
  isValidElement,
  Children,
  useRef,
} from "react";
import OriginalTabs from "@theme-original/Tabs";
import clsx from "clsx";
import styles from "./styles.module.css";
import { DOC_SYSTEMS } from "../../components/Documentation/FilteredTextBlock";
import Tooltip from "/src/components/Tooltip";
import Link from "@docusaurus/Link";

// Language configuration
const LANGUAGE_CONFIG = {
  py: {
    label: "Python",
    icon: "/img/site/logo-py.svg",
    runtime: "python3",
    fileExtension: ".py",
  },
  py_agents: {
    label: "Python (Agents)",
    icon: "/img/site/logo-py.svg",
    runtime: "python3",
    fileExtension: ".py",
  },
  ts: {
    label: "JavaScript/TypeScript",
    icon: "/img/site/logo-ts.svg",
    runtime: "typescript",
    fileExtension: ".ts",
  },
  ts_agents: {
    label: "JavaScript/TypeScript (Agents)",
    icon: "/img/site/logo-ts.svg",
    runtime: "typescript",
    fileExtension: ".ts",
  },
  go: {
    label: "Go",
    icon: "/img/site/logo-go.svg",
    runtime: "go",
    fileExtension: ".go",
  },
  java: {
    label: "Java",
    icon: "/img/site/logo-java.svg",
    runtime: "java",
    fileExtension: ".java",
  },
  curl: {
    label: "Curl",
    icon: null,
    runtime: "bash",
    fileExtension: ".sh",
  },
  bash: {
    label: "Bash",
    icon: null,
    runtime: "bash",
    fileExtension: ".sh",
  },
  shell: {
    label: "Shell",
    icon: null,
    runtime: "bash",
    fileExtension: ".sh",
  },
};

// Configuration for the remote execution service
const EXECUTION_CONFIG = {
  // Replace with your actual GCP Cloud Run service URL
  //API_ENDPOINT: "http://localhost:8088", //local dev
  API_ENDPOINT: "https://code-executor-orchestrator-something.a.run.app",
  //API_KEY: "local-dev-api-key-123",
  API_KEY: "api-key",
  USE_GOOGLE_AUTH: false,
  MAX_EXECUTION_TIME: 30000, // 30 seconds
  SUPPORTED_LANGUAGES: ["py", "ts", "go", "java"],
  DEVELOPMENT_MODE: true,
  // py: { label: "Python", icon: "/img/site/logo-py.svg" },
  // py_agents: { label: "Python (Agents)", icon: "/img/site/logo-py.svg" },
  // ts: { label: "JavaScript/TypeScript", icon: "/img/site/logo-ts.svg" },
  // ts_agents: {
  //   label: "JavaScript/TypeScript (Agents)",
  //   icon: "/img/site/logo-ts.svg",
  // },
  // go: { label: "Go", icon: "/img/site/logo-go.svg" },
  // java: { label: "Java", icon: "/img/site/logo-java.svg" },
  // curl: { label: "Curl", icon: null },
  // bash: { label: "Bash", icon: null },
  // shell: { label: "Shell", icon: null },
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

// Get Google Auth Token (for authenticated Cloud Run)
const getGoogleAuthToken = async () => {
  // This requires the user to be logged in with Google
  // You can use Firebase Auth or Google Identity Services
  if (typeof window !== "undefined" && window.gapi && window.gapi.auth2) {
    try {
      const auth2 = window.gapi.auth2.getAuthInstance();
      const user = auth2.currentUser.get();
      const authResponse = user.getAuthResponse();
      return authResponse.id_token;
    } catch (err) {
      console.error("Failed to get Google auth token:", err);
      return null;
    }
  }
  return null;
};

// Remote code execution component
const CodeExecutor = ({ code, language, onExecute, isExecuting }) => {
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [authError, setAuthError] = useState(false);

  const executeCode = async () => {
    if (!code) {
      setError("No code to execute");
      return;
    }

    setIsRunning(true);
    setOutput(null);
    setError(null);
    setAuthError(false);

    const langConfig = LANGUAGE_CONFIG[language];
    if (!langConfig) {
      setError("Language not supported for execution");
      setIsRunning(false);
      return;
    }

    try {
      // Prepare headers
      const headers = {
        "Content-Type": "application/json",
      };

      // Add authentication based on configuration
      if (EXECUTION_CONFIG.USE_GOOGLE_AUTH) {
        const token = await getGoogleAuthToken();
        if (!token) {
          setAuthError(true);
          setError(
            "Authentication required. Please sign in with Google to run code."
          );
          setIsRunning(false);
          return;
        }
        headers["Authorization"] = `Bearer ${token}`;
      } else if (EXECUTION_CONFIG.API_KEY) {
        console.log("Using API Key for authentication");
        headers["X-API-Key"] = EXECUTION_CONFIG.API_KEY;
      }

      const response = await fetch(`${EXECUTION_CONFIG.API_ENDPOINT}/execute`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          code: code,
          language: langConfig.runtime,
          fileExtension: langConfig.fileExtension,
          timeout: EXECUTION_CONFIG.MAX_EXECUTION_TIME / 1000,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        setAuthError(true);
        setError("Authentication failed. Please check your credentials.");
        setIsRunning(false);
        return;
      }

      const result = await response.json();

      if (response.ok) {
        setOutput(result.output);
        if (result.error) {
          setError(result.error);
        }
      } else {
        setError(result.error || "Execution failed");
      }
    } catch (err) {
      setError(`Failed to connect to execution service: ${err.message}`);
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
          <span>Executing code...</span>
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

// Code dropdown tabs component with execution
const CodeDropdownTabs = ({
  children,
  className,
  groupId,
  defaultValue,
  values,
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

      if (availableLangs.includes(targetLang)) {
        return targetLang;
      }

      if (targetLang === "py" && availableLangs.includes("py_agents")) {
        return "py_agents";
      }
      if (targetLang === "py_agents" && availableLangs.includes("py")) {
        return "py";
      }

      if (targetLang === "ts" && availableLangs.includes("ts_agents")) {
        return "ts_agents";
      }
      if (targetLang === "ts_agents" && availableLangs.includes("ts")) {
        return "ts";
      }

      return targetLang;
    }

    return defaultValue || tabValues[0]?.value;
  });

  const [isExecuting, setIsExecuting] = useState(false);

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
        if (newGlobalLang === "py" && availableLangs.includes("py_agents")) {
          valueToSet = "py_agents";
        } else if (
          newGlobalLang === "py_agents" &&
          availableLangs.includes("py")
        ) {
          valueToSet = "py";
        } else if (
          newGlobalLang === "ts" &&
          availableLangs.includes("ts_agents")
        ) {
          valueToSet = "ts_agents";
        } else if (
          newGlobalLang === "ts_agents" &&
          availableLangs.includes("ts")
        ) {
          valueToSet = "ts";
        }
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

  const handleExecute = () => {
    setIsExecuting(true);
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

  const selectedChild = isLanguageAvailable
    ? Children.toArray(children).find(
        (child) => isValidElement(child) && child.props.value === selectedValue
      )
    : null;

  const codeToExecute = selectedChild
    ? extractCodeFromChild(selectedChild)
    : null;
  const canExecute =
    EXECUTION_CONFIG.SUPPORTED_LANGUAGES.includes(selectedValue) &&
    codeToExecute;

  const docSystem = DOC_SYSTEMS[selectedValue];
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
        </div>

        {docSystem?.baseUrl && (
          <div className={styles.rightSection}>
            <a
              href={docSystem.baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.apiDocsLink}
              title="View API documentation"
            >
              {docSystem.icon ? (
                <img
                  src={docSystem.icon}
                  alt={`${selectedValue} docs`}
                  height="18"
                  width="18"
                  style={{ verticalAlign: "middle" }}
                />
              ) : (
                <svg
                  height="18"
                  width="18"
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
              <span className={styles.versionLabel}>
                More info
                <Tooltip
                  content={
                    <>
                      Code snippets in the documentation reflect the latest
                      client library and Weaviate Database version. Check the{" "}
                      <Link href="/weaviate/release-notes">Release notes</Link>{" "}
                      for specific versions.
                      <br />
                      <br />
                      If a snippet doesn't work or you have feedback, please
                      open a{" "}
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
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={styles.infoIcon}
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                </Tooltip>
              </span>
            </div>
          </div>
        )}
      </div>
      <div className={styles.codeContent}>
        {isLanguageAvailable ? (
          // Render ALL children, but hide non-selected ones with CSS
          Children.map(children, (child) => {
            if (!isValidElement(child)) return null;

            const isSelected = child.props.value === selectedValue;

            return (
              <div
                key={child.props.value}
                className={clsx(styles.tabPanel, {
                  [styles.tabPanelHidden]: !isSelected,
                })}
                style={{ display: isSelected ? "block" : "none" }}
                aria-hidden={!isSelected}
              >
                {child}
                {canExecute && (
                  <CodeExecutor
                    code={codeToExecute}
                    language={selectedValue}
                    onExecute={setIsExecuting}
                    isExecuting={isExecuting}
                  />
                )}
              </div>
            );
          })
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
