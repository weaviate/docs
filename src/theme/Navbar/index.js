import React, { useState, useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { useHistory, useLocation } from "@docusaurus/router";
import Link from "@docusaurus/Link";
import OriginalNavbar from "@theme-original/Navbar";
import styles from "./styles.module.scss";
import secondaryNavOptions from "/secondaryNavbar.js";
import { normalizePath, findPathInItems } from "./navbarUtils";
//import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

// Using the first key in secondaryNavOptions as the default option.
const DEFAULT_OPTION = Object.keys(secondaryNavOptions)[0];
const sidebars = require("/sidebars.js");

export default function NavbarWrapper(props) {
  const history = useHistory();
  const location = useLocation();
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
  
  // Refs for secondary navbar sticky behavior.
  const defaultNavbarRef = useRef(null);
  const secondaryNavbarRef = useRef(null);
  const placeholderRef = useRef(null);
  // Store a reference to the button - we'll just render it directly in the navbar
  const buttonRef = useRef(null);

  const linksCount = secondaryNavOptions[selectedOption]?.links.length || 0;

  // Update button content when selected option changes
  useEffect(() => {
    if (buttonRef.current) {
      // Update the button text and icon
      const iconElement = buttonRef.current.querySelector(`.${styles.optionIcon}`);
      if (iconElement) {
        // Remove old icon classes
        iconElement.className = `${secondaryNavOptions[selectedOption]?.icon} ${styles.optionIcon}`;
      }
      
      // Update text content (the text node is the second child, after the icon)
      const textNode = Array.from(buttonRef.current.childNodes).find(
        node => node.nodeType === Node.TEXT_NODE
      );
      
      if (textNode) {
        textNode.nodeValue = secondaryNavOptions[selectedOption]?.title;
      }
    }
  }, [selectedOption]);

  // Create the button element once on initial render
  useEffect(() => {
    // Create the button element that will be inserted into the navbar
    if (!buttonRef.current) {
      const button = document.createElement('button');
      button.className = styles.modalButton;
      button.onclick = () => setModalOpen(true);
      
      // Create icon element
      const icon = document.createElement('i');
      icon.className = `${secondaryNavOptions[selectedOption]?.icon} ${styles.optionIcon}`;
      icon.setAttribute('aria-hidden', 'true');
      button.appendChild(icon);
      
      // Add the title text
      button.appendChild(document.createTextNode(secondaryNavOptions[selectedOption]?.title));
      
      // Create arrow icon
      const arrowIcon = document.createElement('i');
      arrowIcon.className = 'fa fa-chevron-down arrow-icon';
      arrowIcon.setAttribute('aria-hidden', 'true');
      button.appendChild(arrowIcon);
      
      buttonRef.current = button;
    }
    
    // Function to insert the button in the navbar
    const insertButtonInNavbar = () => {
      if (!buttonRef.current) return;
      
      // Find the navbar__items container
      const navbarItems = document.querySelector('.navbar__items');
      if (!navbarItems) return;
      
      // Check if button is already in the DOM
      if (!document.body.contains(buttonRef.current)) {
        // Insert the button in the navbar
        navbarItems.appendChild(buttonRef.current);
      }
    };
    
    // Insert button immediately
    insertButtonInNavbar();
    
    // Also set up a MutationObserver to handle cases where the navbar might be recreated
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          insertButtonInNavbar();
        }
      }
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      // Clean up on unmount
      observer.disconnect();
      if (buttonRef.current && document.body.contains(buttonRef.current)) {
        buttonRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    // If there's no secondary navbar, remove any existing placeholder and do nothing.
    if (linksCount < 1) {
      if (placeholderRef.current) {
        placeholderRef.current.remove();
        placeholderRef.current = null;
      }
      return;
    }

    // Otherwise, attach the sticky behavior.
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
  }, [linksCount, location.pathname]);

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

  // Toggle modal with Cmd+U or Ctrl+U.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "u") {
        setModalOpen((prev) => !prev);
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [isApple, setIsApple] = useState(true);
  // Detect if the platform is Apple (if needed)
  useEffect(() => {
    if (navigator.appVersion.indexOf("Apple") !== -1) {
      setIsApple(true);
    } else {
      setIsApple(false);
    }
  }, []);

  // Filter options into regular and small groups
  const regularItems = Object.entries(secondaryNavOptions).filter(
    ([, value]) => !value.isSmall
  );
  const smallItems = Object.entries(secondaryNavOptions).filter(
    ([, value]) => value.isSmall
  );

  return (
    <>
      {/* Primary Navbar as provided by the theme */}
      <div
        className={styles.defaultNavbar}
        style={linksCount === 1 ? { top: 0 } : {}}
      >
        <OriginalNavbar {...props} />
      </div>

      {/* Secondary Navbar */}
      {linksCount > 1 && (
        <div className={styles.secondaryNavbar}>
          <nav className={styles.secondaryNavLinks}>
            {secondaryNavOptions[selectedOption]?.links.map((item, index) => {
              if (item.dropdown) {
                return (
                  <div key={index} className={styles.navDropdown}>
                    <span className={styles.navLinkWithArrow}>
                      {item.label}
                      <i className="fa fa-chevron-down" aria-hidden="true" />
                    </span>
                    <div className={styles.dropdownContent}>
                      {item.dropdown.map((subItem, subIndex) => (
                        <React.Fragment key={subIndex}>
                          <Link
                            to={subItem.link}
                            className={styles.dropdownItem}
                          >
                            {subItem.label}
                          </Link>
                          {subIndex !== item.dropdown.length - 1 && (
                            <div className={styles.dropdownDivider} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                );
              } else {
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
              }
            })}
          </nav>
        </div>
      )}

      {/* Modal Overlay */}
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
              <div
                className={styles.modalHeaderButton}
                onClick={() => setModalOpen(false)}
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
            {/* Render regular items as cards */}
            <div className={styles.modalOptionsContainer}>
              {regularItems.map(([key, value]) => (
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

            {/* Render small items at the bottom with a divider */}
            {smallItems.length > 0 && (
              <>
                <hr className={styles.modalDivider} />
                <div className={styles.modalSmallOptionsContainer}>
                  {smallItems.map(([key, value]) => (
                    <div
                      key={key}
                      className={styles.modalSmallOption}
                      onClick={() => handleOptionSelect(key)}
                    >
                      <i
                        className={`${value.icon} ${styles.modalSmallIcon}`}
                        aria-hidden="true"
                      />
                      {value.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}