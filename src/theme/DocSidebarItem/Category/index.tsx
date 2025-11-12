import React, {type ReactNode, useRef, useEffect, useState} from 'react';
import Category from '@theme-original/DocSidebarItem/Category';
import type CategoryType from '@theme/DocSidebarItem/Category';
import type {WrapperProps} from '@docusaurus/types';
import CloudOnlyBadge from '@site/src/components/CloudOnlyBadge';

type Props = WrapperProps<typeof CategoryType>;

export default function CategoryWrapper(props: Props): ReactNode {
  // Check if this sidebar item has cloudOnly customProps
  const cloudOnly = props.item?.customProps?.cloudOnly;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [badgeStyle, setBadgeStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (cloudOnly && wrapperRef.current) {
      // Find the clickable label (menu__link) inside the category
      const menuLink = wrapperRef.current.querySelector('.menu__link');
      if (menuLink) {
        // Position badge relative to the menu link
        setBadgeStyle({
          position: 'absolute',
          right: '35px',
          top: `${menuLink.getBoundingClientRect().top - wrapperRef.current.getBoundingClientRect().top}px`,
          height: `${menuLink.getBoundingClientRect().height}px`,
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 10,
        });
      }
    }
  }, [cloudOnly]);

  if (!cloudOnly) {
    // If no badge, just render the original Category without wrapper
    return <Category {...props} />;
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <Category {...props} />
      {badgeStyle.top && (
        <div style={badgeStyle}>
          <CloudOnlyBadge iconOnly />
        </div>
      )}
    </div>
  );
}
