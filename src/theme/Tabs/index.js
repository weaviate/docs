// src/theme/Tabs/index.js
// This overrides the default Docusaurus Tabs component

import React, {
  useState,
  useEffect,
  cloneElement,
  isValidElement,
  Children,
} from "react";
import OriginalTabs from "@theme-original/Tabs";
import clsx from "clsx";
import styles from "./styles.module.css";
import { DOC_SYSTEMS } from "../../components/Documentation/FilteredTextBlock";
import Tooltip from "/src/components/Tooltip";
import Link from "@docusaurus/Link";

// Language configuration
const LANGUAGE_CONFIG = {
  py: { label: "Python", icon: "/img/site/logo-py.svg" },
  python: { label: "Python", icon: "/img/site/logo-py.svg" },
  js: { label: "JS/TS", icon: "/img/site/logo-ts.svg" },
  ts: { label: "JS/TS", icon: "/img/site/logo-ts.svg" },
  typescript: { label: "JS/TS", icon: "/img/site/logo-ts.svg" },
  javascript: { label: "JS/TS", icon: "/img/site/logo-ts.svg" },
  go: { label: "Go", icon: "/img/site/logo-go.svg" },
  golang: { label: "Go", icon: "/img/site/logo-go.svg" },
  java: { label: "Java", icon: "/img/site/logo-java.svg" },
  curl: { label: "Curl", icon: null },
  bash: { label: "Bash", icon: null },
  shell: { label: "Shell", icon: null },
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
            <option key={opt.value} value={opt.value}>
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

// Code dropdown tabs component
const CodeDropdownTabs = ({
  children,
  className,
  groupId,
  defaultValue,
  values,
  ...props
}) => {
  // Get tab values and labels from children
  const tabValues =
    values ||
    Children.toArray(children)
      .filter((child) => isValidElement(child))
      .map((child) => ({
        value: child.props.value,
        label: child.props.label || child.props.value,
      }));

  // State for selected tab
  const [selectedValue, setSelectedValue] = useState(() => {
    // Check localStorage for this specific group or global code language
    if (typeof window !== "undefined") {
      const savedValue = localStorage.getItem(
        `docusaurus.tab.${groupId || "languages"}`
      );
      if (savedValue && tabValues.some((t) => t.value === savedValue)) {
        return savedValue;
      }
      // Fallback to global code language preference
      const globalLang = localStorage.getItem("selectedCodeLanguage");
      if (globalLang && tabValues.some((t) => t.value === globalLang)) {
        return globalLang;
      }
    }
    return defaultValue || tabValues[0]?.value;
  });

  // Listen for global language changes
  useEffect(() => {
    const handleLanguageChange = (event) => {
      const newLang = event.detail;
      if (tabValues.some((t) => t.value === newLang)) {
        setSelectedValue(newLang);
      }
    };

    window.addEventListener("codeLanguageChange", handleLanguageChange);
    return () =>
      window.removeEventListener("codeLanguageChange", handleLanguageChange);
  }, [tabValues]);

  // Handle language change
  const handleChange = (newValue) => {
    setSelectedValue(newValue);

    // Save to localStorage
    if (typeof window !== "undefined") {
      // Save to tab-specific storage
      if (groupId) {
        localStorage.setItem(`docusaurus.tab.${groupId}`, newValue);
      }
      // Also update global code language preference
      localStorage.setItem("selectedCodeLanguage", newValue);
      // Dispatch event to sync other dropdowns
      window.dispatchEvent(
        new CustomEvent("codeLanguageChange", { detail: newValue })
      );
    }
  };

  // Find the selected child
  const selectedChild = Children.toArray(children).find(
    (child) => isValidElement(child) && child.props.value === selectedValue
  );

  // Get the doc system for the selected language
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
          <span className={styles.languageLabel}>Select Language</span>
          <LanguageDropdown
            value={selectedValue}
            onChange={handleChange}
            options={tabValues}
          />
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
                      Code snippets in the documentation reflect the latest client
                      library and Weaviate Database version. Check the{" "}
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
        {selectedChild || <div>No code available for this language</div>}
      </div>
    </div>
  );
};

// Main Tabs component wrapper
export default function Tabs({ className, ...props }) {
  // Check if this should be rendered as a code dropdown
  const isCodeDropdown = className && className.includes("code");

  if (isCodeDropdown) {
    return <CodeDropdownTabs className={className} {...props} />;
  }

  // Otherwise, use the original Tabs component
  return <OriginalTabs className={className} {...props} />;
}
