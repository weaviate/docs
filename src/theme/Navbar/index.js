import React, { useState, useEffect, useRef, useMemo } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import Link from "@docusaurus/Link";
import OriginalNavbar from "@theme-original/Navbar";
import styles from "./styles.module.scss";
import secondaryNavOptions from "/secondaryNavbar.js";
import { normalizePath, findPathInItems } from "./navbarUtils";
//import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

const DEFAULT_OPTION = Object.keys(secondaryNavOptions)[0]; // Using the first key in secondaryNavOptions as the default option.
const sidebars = require("/sidebars.js");

export default function NavbarWrapper(props) {
  const history = useHistory();
  const location = useLocation();
  //const { siteConfig } = useDocusaurusContext();
  const routeBasePath = "/docs";
  // Compute the initial secondaryNavbar state based on the current location synchronously.
  const initialState = useMemo(() => {
    let currentPath = normalizePath(location.pathname, routeBasePath);
    if (!currentPath) {
      return {
        selectedOption: DEFAULT_OPTION,
        activeLink: secondaryNavOptions[DEFAULT_OPTION].links[0].sidebar,
      };
    }

    let foundSidebar = null;
    for (const [sidebarName, items] of Object.entries(sidebars)) {
      if (findPathInItems(items, currentPath)) {
        foundSidebar = sidebarName;
        break;
      }
    }

    // Use foundSidebar to determine the selected option.
    // Check which option has a link with a sidebar field that matches foundSidebar.
    const matchedOption = Object.entries(secondaryNavOptions).find(
      ([, value]) => value.links.some((link) => link.sidebar === foundSidebar)
    );
    const selectedOption = matchedOption ? matchedOption[0] : DEFAULT_OPTION;

    return { selectedOption, activeLink: foundSidebar };
  }, [location.pathname]);

  const [selectedOption, setSelectedOption] = useState(
    initialState.selectedOption
  );
  const [activeLink, setActiveLink] = useState(initialState.activeLink);
  const [isModalOpen, setModalOpen] = useState(false);

  // Use refs for DOM elements.
  const defaultNavbarRef = useRef(null);
  const secondaryNavbarRef = useRef(null);
  const placeholderRef = useRef(null);

  useEffect(() => {
    // Get references to navbar elements.
    defaultNavbarRef.current = document.querySelector(
      `.${styles.defaultNavbar}`
    );
    secondaryNavbarRef.current = document.querySelector(
      `.${styles.secondaryNavbar}`
    );

    // Create a placeholder after the secondary navbar if it doesn't exist.
    if (secondaryNavbarRef.current && !placeholderRef.current) {
      const placeholder = document.createElement("div");
      placeholder.classList.add(styles.secondaryNavbarPlaceholder);
      placeholderRef.current = placeholder;
      secondaryNavbarRef.current.insertAdjacentElement("afterend", placeholder);
    }

    const handleScroll = () => {
      if (
        !defaultNavbarRef.current ||
        !secondaryNavbarRef.current ||
        !placeholderRef.current
      )
        return;

      // If the page has been scrolled beyond the height of the default navbar...
      if (window.scrollY > defaultNavbarRef.current.offsetHeight) {
        secondaryNavbarRef.current.classList.add(styles.fixOnTop);
        placeholderRef.current.style.display = "block";
      } else {
        secondaryNavbarRef.current.classList.remove(styles.fixOnTop);
        placeholderRef.current.style.display = "none";
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update state if location.pathname changes.
  useEffect(() => {
    let currentPath = normalizePath(location.pathname, routeBasePath);
    if (!currentPath) {
      setSelectedOption(DEFAULT_OPTION);
      setActiveLink(secondaryNavOptions[DEFAULT_OPTION].links[0].sidebar);
      return;
    }

    let foundSidebar = null;
    for (const [sidebarName, items] of Object.entries(sidebars)) {
      if (findPathInItems(items, currentPath)) {
        foundSidebar = sidebarName;
        break;
      }
    }

    // Use foundSidebar to determine the selected option.
    // Check which option has a link with a sidebar field that matches foundSidebar.
    const matchedOption = Object.entries(secondaryNavOptions).find(
      ([, value]) => value.links.some((link) => link.sidebar === foundSidebar)
    );
    setSelectedOption(matchedOption ? matchedOption[0] : DEFAULT_OPTION);
    setActiveLink(foundSidebar);
  }, [location.pathname]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setModalOpen(false);
    // Use the top-level link field to navigate
    history.push(secondaryNavOptions[option].link);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for Ctrl+l (you can change this combination)
      if (event.metaKey && event.key.toLowerCase() === "u") {
        setModalOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [isApple, setIsApple] = useState(true);

  useEffect(() => {
    // Detect if the platform is Apple (if needed)
    if (navigator.appVersion.indexOf("Apple") !== -1) {
      setIsApple(true);
    }
  }, []);

  // Determine the number of links for the selected option
  const linksCount = secondaryNavOptions[selectedOption]?.links.length || 0;

  return (
    <>
      {/* Default Navbar */}
      <div className={styles.defaultNavbar}>
        <OriginalNavbar {...props} />
      </div>

      {/* Secondary Navbar */}
      <div className={styles.secondaryNavbar}>
        <button
          className={styles.modalButton}
          onClick={() => setModalOpen(true)}
        >
          <i
            className={`${secondaryNavOptions[selectedOption]?.icon} ${styles.optionIcon}`}
            aria-hidden="true"
          />
          {secondaryNavOptions[selectedOption]?.title}
          <i
            className={`fa fa-chevron-down ${styles.arrowIcon}`}
            aria-hidden="true"
          />
        </button>
        <nav className={styles.secondaryNavLinks}>
          {/* Render secondary navbar only if there's more than one link */}
          {linksCount > 1 &&
            secondaryNavOptions[selectedOption]?.links.map((item, index) => {
              const isActive = activeLink && item.sidebar === activeLink;
              return (
                <Link
                  key={index}
                  to={item.link}
                  className={
                    isActive
                      ? `${styles.navLink} ${styles.activeNavLink}`
                      : styles.navLink
                  }
                >
                  {item.label}
                </Link>
              );
            })}
        </nav>
      </div>

      <div
        className={`${styles.modalOverlay} ${isModalOpen ? styles.active : ""}`}
        onClick={() => setModalOpen(false)}
      >
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className={styles.modalHeader}>
            <div className={styles.modalHeaderLeft}>
              <strong>Go to documentation:</strong>
            </div>
            <div className={styles.modalHeaderRight}>
              {/* New Ask AI button */}
              <div
                className={styles.modalHeaderButton}
                onClick={() => {
                  if (window.Kapa && typeof window.Kapa.open === "function") {
                    window.Kapa.open({
                      mode: "ai",
                      query: "",
                      submit: false,
                    });
                  } else {
                    console.warn("Kapa is not available");
                  }
                }}
              >
                <span className={styles.buttonShortcut}>
                  {isApple ? "⌘K" : "Ctrl+K"}
                </span>
                <div className={styles.verticalDivider}></div>
                <span className={styles.buttonText}>Ask AI</span>
                <img
                  src="/img/site/weaviate-logo-w.png"
                  alt="Weaviate Logo"
                  className={styles.buttonIcon}
                />
              </div>
              {/* Existing header controls */}
              <div
                className={styles.modalHeaderButton}
                onClick={() => {
                  setModalOpen(false);
                }}
              >
                <span className={styles.buttonShortcut}>
                  {isApple ? "⌘U" : "Ctrl+U"}
                </span>
                <div className={styles.verticalDivider}></div>
                <button className={styles.headerCloseIcon}>✕</button>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className={styles.modalBody}>
            <div className={styles.modalOptionsContainer}>
              {Object.entries(secondaryNavOptions).map(([key, value]) => (
                <div
                  key={key}
                  className={styles.modalOption}
                  onClick={() => handleOptionSelect(key)}
                >
                  <i
                    className={`${value.icon} ${styles.modalIcon}`}
                    aria-hidden="true"
                  />
                  <div className={styles.modalText}>
                    <strong>{value.title}</strong>
                    <p>{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
