import React, {type ReactNode} from 'react';
import Link from '@theme-original/DocSidebarItem/Link';
import type LinkType from '@theme/DocSidebarItem/Link';
import type {WrapperProps} from '@docusaurus/types';
import CloudOnlyBadge from '@site/src/components/CloudOnlyBadge';
import styles from './styles.module.scss';

type Props = WrapperProps<typeof LinkType>;

export default function LinkWrapper(props: Props): ReactNode {
  // Check if this sidebar item has cloudOnly customProps
  const cloudOnly = props.item?.customProps?.cloudOnly;

  if (!cloudOnly) {
    // If no badge, just render the original Link without wrapper
    return <Link {...props} />;
  }

  return (
    <div className={styles.sidebarLinkWrapper}>
      <Link {...props} />
      <div className={styles.badgeContainer}>
        <CloudOnlyBadge iconOnly />
      </div>
    </div>
  );
}
