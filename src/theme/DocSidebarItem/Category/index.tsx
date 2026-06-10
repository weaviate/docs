import React, {type ReactNode, useRef, useEffect, useState} from 'react';
import Category from '@theme-original/DocSidebarItem/Category';
import type CategoryType from '@theme/DocSidebarItem/Category';
import type {WrapperProps} from '@docusaurus/types';
import CloudOnlyBadge from '@site/src/components/CloudOnlyBadge';
import AcademyBadge from '@site/src/components/AcademyBadge';

type Props = WrapperProps<typeof CategoryType>;

export default function CategoryWrapper(props: Props): ReactNode {
  // Check if this sidebar item has cloudOnly or academyOnly customProps
  const cloudOnly = props.item?.customProps?.cloudOnly;
  const academyOnly = props.item?.customProps?.academyOnly;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [badgeStyle, setBadgeStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if ((cloudOnly || academyOnly) && wrapperRef.current) {
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
  }, [cloudOnly, academyOnly]);

  if (!cloudOnly && !academyOnly) {
    // If no badge, just render the original Category without wrapper
    return <Category {...props} />;
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <Category {...props} />
      {badgeStyle.top && (
        <div style={badgeStyle}>
          {cloudOnly && <CloudOnlyBadge iconOnly />}
          {academyOnly && <AcademyBadge iconOnly />}
        </div>
      )}
    </div>
  );
}
