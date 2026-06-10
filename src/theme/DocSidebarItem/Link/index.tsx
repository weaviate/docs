import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {isActiveSidebarItem} from '@docusaurus/plugin-content-docs/client';
import DocusaurusLink from '@docusaurus/Link';
import Link from '@theme-original/DocSidebarItem/Link';
import type LinkType from '@theme/DocSidebarItem/Link';
import type {WrapperProps} from '@docusaurus/types';
import CloudOnlyBadge from '@site/src/components/CloudOnlyBadge';
import AcademyBadge from '@site/src/components/AcademyBadge';
import styles from './styles.module.scss';

type Props = WrapperProps<typeof LinkType>;

function IconOpenInNewTab({width = 12, height = 12}: {width?: number; height?: number}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.iconNewTab}
      aria-label="(opens in new tab)">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default function LinkWrapper(props: Props): ReactNode {
  const {item, activePath, level, onItemClick, ...rest} = props;
  const openInNewTab = item?.customProps?.openInNewTab;
  const cloudOnly = item?.customProps?.cloudOnly;
  const academyOnly = item?.customProps?.academyOnly;

  // Render a custom link that opens in a new tab
  if (openInNewTab && 'href' in item) {
    const isActive = isActiveSidebarItem(item, activePath);
    return (
      <li
        className={clsx(
          ThemeClassNames.docs.docSidebarItemLink,
          ThemeClassNames.docs.docSidebarItemLinkLevel(level),
          'menu__list-item',
          item.className,
        )}
        key={item.label}>
        <DocusaurusLink
          className={clsx('menu__link', {'menu__link--active': isActive})}
          aria-current={isActive ? 'page' : undefined}
          to={item.href}
          target="_blank"
          rel="noopener noreferrer"
          {...rest}>
          <span title={item.label} className={styles.linkLabel}>
            {item.label}
          </span>
          <IconOpenInNewTab />
        </DocusaurusLink>
      </li>
    );
  }

  if (!cloudOnly && !academyOnly) {
    // If no badge, just render the original Link without wrapper
    return <Link {...props} />;
  }

  // Check if this is an external link (has href) vs internal doc link (has id)
  const isExternalLink = 'href' in item;

  return (
    <div className={styles.sidebarLinkWrapper}>
      <Link {...props} />
      <div className={`${styles.badgeContainer} ${isExternalLink ? styles.externalLink : ''}`}>
        {cloudOnly && <CloudOnlyBadge iconOnly />}
        {academyOnly && <AcademyBadge iconOnly />}
      </div>
    </div>
  );
}
