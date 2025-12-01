// src/theme/Tabs/index.js
// This overrides the default Docusaurus Tabs component

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
  py: { label: "Python", icon: "/img/site/logo-py.svg" },
  py_agents: { label: "Python (Agents)", icon: "/img/site/logo-py.svg" },
  ts: { label: "JavaScript/TypeScript", icon: "/img/site/logo-ts.svg" },
  ts_agents: {
    label: "JavaScript/TypeScript (Agents)",
    icon: "/img/site/logo-ts.svg",
  },
  go: { label: "Go", icon: "/img/site/logo-go.svg" },
  java6: { label: "Java v6", icon: "/img/site/logo-java.svg" },
  java: { label: "Java v5 (Deprecated)", icon: "/img/site/logo-java.svg" },
  csharp: { label: "C# (Beta)", icon: "/img/site/logo-csharp.svg" },
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
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled} // Handle disabled state for unavailable options
            >
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

  // Listen for global language changes
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

  // Handle language change
  const handleChange = (newValue) => {
    isInternalChange.current = true;
    setSelectedValue(newValue);
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

  const isLanguageAvailable = tabValues.some(
    (tab) => tab.value === selectedValue
  );

  // If the selected language isn't available, add it to the dropdown list as a disabled option
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
            value={selectedValue} // Always show the globally selected value
            onChange={handleChange}
            options={dropdownOptions} // Pass the potentially modified list of options
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
                    width="11"
                    height="11"
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
  // Check if this should be rendered as a code dropdown
  const isCodeDropdown = className && className.includes("code");

  if (isCodeDropdown) {
    return <CodeDropdownTabs className={className} {...props} />;
  }

  // Otherwise, use the original Tabs component
  return <OriginalTabs className={className} {...props} />;
}
