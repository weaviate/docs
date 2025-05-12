import React from "react";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router"; // To get location for the hook
import { Collapsible, useCollapsible } from "@docusaurus/theme-common";
import { useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";

// Adjust the import path based on where you placed useNavbarState.js
// Assuming NavbarMobilePrimaryMenu is in src/theme/Navbar/MobileSidebar/PrimaryMenu/
// and useNavbarState is in src/theme/Navbar/hooks/
import useNavbarState from "../../hooks/useNavbarState"; // Adjusted path: up one level from PrimaryMenu, then into hooks

// MobileDropdown helper component (ensure this is defined or imported correctly)
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
        style={{ cursor: "pointer" }}
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
          style={{
            marginLeft: "8px",
            display: "inline-block",
            transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
          }}
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
  const location = useLocation(); // Get location for useNavbarState
  const mobileSidebar = useNavbarMobileSidebar();
  const onClose = mobileSidebar.toggle;

  // Use your custom hook to get the calculated state
  const {
    selectedOption, // This is the key for secondaryNavOptions (e.g., 'build')
    activeLink, // This is the active sidebar name (e.g., 'getStartedSidebar')
    secondaryNavOptions, // The full secondaryNavOptions object
  } = useNavbarState(location); // Pass the current location to the hook

  // Get the links for the currently selected option/section
  const currentSecondaryNav = secondaryNavOptions[selectedOption];
  const secondaryNavLinksToDisplay = currentSecondaryNav?.links || [];

  return (
    <ul className="menu__list">
      {secondaryNavLinksToDisplay.length > 0 ? (
        <>
          {currentSecondaryNav?.title && (
            <li className="menu__list-item menu__list-item--sublist">
              <span
                className="menu__link menu__link--sublist"
                style={{
                  fontWeight: "bold",
                  color: "var(--ifm-color-emphasis-700)",
                  display: "block",
                  padding:
                    "var(--ifm-menu-link-padding-vertical) var(--ifm-menu-link-padding-horizontal)",
                }}
              >
                {currentSecondaryNav.title}
              </span>
            </li>
          )}

          {secondaryNavLinksToDisplay.map((navItem, index) => {
            // Skip items that don't have a link property, unless they are dropdown containers
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
              // ACTIVE STATE LOGIC: Compare navItem.sidebar with activeLink from the hook
              const isActive = navItem.sidebar === activeLink;
              const linkClassName = `menu__link ${
                isActive ? "menu__link--active" : ""
              }`;

              return (
                <li key={navItem.link || index} className="menu__list-item">
                  <Link
                    className={linkClassName}
                    to={navItem.link} // Ensure navItem.link exists for non-dropdown items
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
          <span
            className="menu__link"
            style={{
              fontStyle: "italic",
              color: "var(--ifm-color-emphasis-600)",
            }}
          >
            Main Menu
          </span>
        </li>
      )}
    </ul>
  );
}
