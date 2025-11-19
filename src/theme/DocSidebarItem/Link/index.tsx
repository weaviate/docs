import React, {type ReactNode} from 'react';
import Link from '@theme-original/DocSidebarItem/Link';
import type LinkType from '@theme/DocSidebarItem/Link';
import type {WrapperProps} from '@docusaurus/types';
import CloudOnlyBadge from '@site/src/components/CloudOnlyBadge';
import AcademyBadge from '@site/src/components/AcademyBadge';
import styles from './styles.module.scss';

type Props = WrapperProps<typeof LinkType>;

export default function LinkWrapper(props: Props): ReactNode {
  // Check if this sidebar item has cloudOnly or academyOnly customProps
  const cloudOnly = props.item?.customProps?.cloudOnly;
  const academyOnly = props.item?.customProps?.academyOnly;

  if (!cloudOnly && !academyOnly) {
    // If no badge, just render the original Link without wrapper
    return <Link {...props} />;
  }

  // Check if this is an external link (has href) vs internal doc link (has id)
  const isExternalLink = 'href' in props.item;

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
