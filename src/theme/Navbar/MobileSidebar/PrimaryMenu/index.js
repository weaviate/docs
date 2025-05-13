import React from "react";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router";
import { Collapsible, useCollapsible } from "@docusaurus/theme-common";
import { useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";

import useNavbarState from "../../hooks/useNavbarState";
import styles from "../../styles/sidebar.module.scss";

// MobileDropdown helper component
function MobileDropdown({ item, onClose, isPrimaryNavItem = false }) {
  const { collapsed, toggleCollapsed, setCollapsed } = useCollapsible({
    initialState: true,
  });
  const subItems = isPrimaryNavItem ? item.items : item.dropdown;
  const parentLabel = item.label;

  return (
    <li className="menu__list-item">
      <span
        className={`menu__link menu__link--sublist ${
          !collapsed ? "menu__link--active" : ""
        }`}
        onClick={(e) => {
          e.preventDefault();
          toggleCollapsed();
        }}
        style={{ cursor: "pointer" }} // Keep cursor pointer for clarity, or move to a general clickable class
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleCollapsed();
          }
        }}
      >
        {parentLabel}
        <span
          className={`${styles.dropdownArrow} ${
            !collapsed ? styles.dropdownArrowOpen : ""
          }`}
        >
          ▼
        </span>
      </span>
      <Collapsible lazy as="ul" className="menu__list" collapsed={collapsed}>
        {subItems.map((subItem, subIndex) => (
          <li
            key={subItem.to || subItem.href || subItem.link || subIndex}
            className="menu__list-item"
          >
            <Link
              className="menu__link"
              to={subItem.link || subItem.to}
              href={subItem.href}
              onClick={() => {
                setCollapsed(true);
                onClose();
              }}
              target={subItem.target}
              rel={subItem.rel}
            >
              {subItem.html ? (
                <span dangerouslySetInnerHTML={{ __html: subItem.html }} />
              ) : (
                subItem.label
              )}
            </Link>
          </li>
        ))}
      </Collapsible>
    </li>
  );
}

export default function NavbarMobilePrimaryMenu() {
  const location = useLocation();
  const mobileSidebar = useNavbarMobileSidebar();
  const onClose = mobileSidebar.toggle;

  const { selectedOption, activeLink, secondaryNavOptions } =
    useNavbarState(location);

  const currentSecondaryNav = secondaryNavOptions[selectedOption];
  const secondaryNavLinksToDisplay = currentSecondaryNav?.links || [];

  return (
    <ul className="menu__list">
      {" "}
      {/* Base Infima class for the list */}
      {secondaryNavLinksToDisplay.length > 0 ? (
        <>
          {currentSecondaryNav?.title && (
            <li className="menu__list-item menu__list-item--sublist">
              {" "}
              {/* Base Infima classes */}
              <span
                // Using menu__link for consistent padding/display, and our module for text styling
                className={`menu__link menu__link--sublist ${styles.sectionTitle}`}
              >
                {currentSecondaryNav.title}
              </span>
            </li>
          )}

          {secondaryNavLinksToDisplay.map((navItem, index) => {
            if (
              !navItem.link &&
              !(navItem.dropdown && navItem.dropdown.length > 0)
            ) {
              return null;
            }

            if (navItem.dropdown && navItem.dropdown.length > 0) {
              return (
                <MobileDropdown
                  key={`secondary-dropdown-${navItem.label || index}`}
                  item={navItem}
                  onClose={onClose}
                />
              );
            } else {
              const isActive = navItem.sidebar === activeLink;
              // Base Infima classes + active state class
              const linkClassName = `menu__link ${
                isActive ? "menu__link--active" : ""
              }`;

              return (
                <li key={navItem.link || index} className="menu__list-item">
                  {" "}
                  {/* Base Infima class */}
                  <Link
                    className={linkClassName}
                    to={navItem.link}
                    onClick={onClose}
                  >
                    {navItem.label}
                  </Link>
                </li>
              );
            }
          })}
        </>
      ) : (
        <li className="menu__list-item">
          {" "}
          {/* Base Infima class */}
          <span
            // Using menu__link for consistent padding/display, and our module for text styling
            className={`menu__link ${styles.emptyMenuText}`}
          >
            Main Menu
          </span>
        </li>
      )}
    </ul>
  );
}
