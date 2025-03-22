import React from "react";
import Link from "@docusaurus/Link";

export default function SecondaryNavbar({
  secondaryNavbarRef,
  styles,
  selectedOption,
  secondaryNavOptions,
  activeLink,
}) {
  return (
    <div className={styles.secondaryNavbar} ref={secondaryNavbarRef}>
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
                      <Link to={subItem.link} className={styles.dropdownItem}>
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
  );
}
