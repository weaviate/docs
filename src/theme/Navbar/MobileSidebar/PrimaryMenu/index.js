import React from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { Collapsible, useCollapsible,isRegexpStringMatch } from '@docusaurus/theme-common'; // Added isRegexpStringMatch
import { useNavbarMobileSidebar, useThemeConfig } from '@docusaurus/theme-common/internal';

// Make sure this path is correct
import secondaryNavbarItemsData from '/secondaryNavbar';

// MobileDropdown helper component (can be used for both primary and secondary nav dropdowns)
function MobileDropdown({ item, onClose, isPrimaryNavItem = false }) {
  const { collapsed, toggleCollapsed, setCollapsed } = useCollapsible({
    initialState: true,
  });

  // For primary nav dropdowns from themeConfig, sub-items are in 'item.items'
  // For your secondary nav, sub-items are in 'item.dropdown'
  const subItems = isPrimaryNavItem ? item.items : item.dropdown;
  const parentLabel = item.label;


  return (
    <li className="menu__list-item">
      <span
        className={`menu__link menu__link--sublist ${!collapsed ? 'menu__link--active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          toggleCollapsed();
        }}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleCollapsed();
          }
        }}
      >
        {parentLabel}
        <span style={{ marginLeft: '8px', display: 'inline-block', transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>▼</span>
      </span>
      <Collapsible lazy as="ul" className="menu__list" collapsed={collapsed}>
        {subItems.map((subItem, subIndex) => (
          <li key={subItem.to || subItem.href || subItem.link || subIndex} className="menu__list-item">
            <Link
              className="menu__link"
              to={subItem.to || subItem.link} // .link for your secondaryNav, .to for themeConfig items
              href={subItem.href} // .href for themeConfig items
              onClick={() => {
                setCollapsed(true);
                onClose();
              }}
              target={subItem.target} // Support target for themeConfig items
              rel={subItem.rel}       // Support rel for themeConfig items
            >
              {subItem.html ? <span dangerouslySetInnerHTML={{__html: subItem.html}} /> : subItem.label}
            </Link>
          </li>
        ))}
      </Collapsible>
    </li>
  );
}

export default function NavbarMobilePrimaryMenu() {
  const mobileSidebar = useNavbarMobileSidebar();
  const { pathname } = useLocation();
  const themeConfig = useThemeConfig();
  const primaryNavItems = themeConfig.navbar.items;

  const onClose = mobileSidebar.toggle;

  const filteredPrimaryNavItems = primaryNavItems.filter(
    (item) => item.type !== 'search', // Algolia search has its own modal
  );

  let selectedKey = null;
  if (pathname.startsWith('/docs/weaviate')) {
    selectedKey = 'build';
  } else if (pathname.startsWith('/docs/agents')) {
    selectedKey = 'agents';
  } else if (pathname.startsWith('/docs/cloud')) {
    selectedKey = 'cloud';
  } else if (pathname.startsWith('/docs/academy')) {
    selectedKey = 'academy';
  } else if (pathname.startsWith('/docs/integrations')) {
    selectedKey = 'integrations';
  } else if (pathname.startsWith('/docs/contributor-guide')) {
    selectedKey = 'contributor';
  }

  const currentSecondaryNav = selectedKey ? secondaryNavbarItemsData[selectedKey] : null;
  const secondaryNavLinksToDisplay = currentSecondaryNav?.links || [];

  return (
    <ul className="menu__list">
      {/* Render the original primary menu items manually */}
      {filteredPrimaryNavItems.map((item, i) => {
        const commonProps = {
          onClick: onClose,
          // For active class, Docusaurus uses 'menu__link--active'.
          // We need to replicate the active check logic.
          // 'activeBaseRegex' or 'activeBasePath' can be used.
          // 'exact: true' can also be a factor for `to` links.
        };
        
        // Check for active state (simplified, Docusaurus has more sophisticated logic)
        let isActive = false;
        if (item.activeBasePath) {
          isActive = pathname.startsWith(item.activeBasePath);
        } else if (item.activeBaseRegex) {
          isActive = isRegexpStringMatch(item.activeBaseRegex, pathname);
        } else if (item.to && item.exact !== false) { // `exact` defaults to true for `to`
            isActive = item.to === pathname;
        }


        const linkClassName = `menu__link ${isActive ? 'menu__link--active' : ''}`;

        if (item.type === 'html') {
          return (
            <li
              key={i}
              className="menu__list-item"
              dangerouslySetInnerHTML={{ __html: item.html }}
            />
          );
        }

        if (item.type === 'dropdown' && item.items && item.items.length > 0) {
          return <MobileDropdown key={`primary-dropdown-${item.label || i}`} item={item} onClose={onClose} isPrimaryNavItem={true} />;
        }

        const targetLink = item.to || item.href;
        const label = item.label || (item.position === 'right' ? null : 'Link'); // Some right-aligned items might be icons without labels

        if (targetLink && label) { // Ensure there's a link and a label
          return (
            <li key={i} className="menu__list-item">
              <Link
                className={linkClassName}
                {...(item.to ? { to: item.to } : {})}
                {...(item.href ? { href: item.href } : {})}
                target={item.target}
                rel={item.rel}
                aria-label={item.label}
                {...commonProps}
              >
                {item.label}
              </Link>
            </li>
          );
        } else if (label) { // Item might be non-interactive but have a label (e.g. a section header, though rare here)
            return (
                <li key={i} className="menu__list-item">
                    <span className={linkClassName} {...commonProps}>{item.label}</span>
                </li>
            );
        }


        // console.warn('Unhandled primary navbar item in MobilePrimaryMenu:', item);
        return null; // Skip items that cannot be rendered as links or known types
      })}

      {/* Add your contextual secondary navigation items */}
      {secondaryNavLinksToDisplay.length > 0 && (
        <>
          <div className="menu__divider" />
          {currentSecondaryNav?.title && (
            <li className="menu__list-item menu__list-item--sublist">
              <span className="menu__link menu__link--sublist" style={{ fontWeight: 'bold', color: 'var(--ifm-color-emphasis-700)' }}>
                {currentSecondaryNav.title}
              </span>
            </li>
          )}
          {secondaryNavLinksToDisplay.map((navItem, index) => {
            if (navItem.dropdown && navItem.dropdown.length > 0) {
              return <MobileDropdown key={`secondary-dropdown-${navItem.label || index}`} item={navItem} onClose={onClose} />;
            } else {
              return (
                <li key={navItem.link || index} className="menu__list-item">
                  <Link
                    className="menu__link" // Add active class logic here too if needed for secondary nav
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
      )}
    </ul>
  );
}