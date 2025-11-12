import React, {type ReactNode} from 'react';
import Link from '@theme-original/DocSidebarItem/Link';
import type LinkType from '@theme/DocSidebarItem/Link';
import type {WrapperProps} from '@docusaurus/types';
import CloudOnlyBadge from '@site/src/components/CloudOnlyBadge';

type Props = WrapperProps<typeof LinkType>;

export default function LinkWrapper(props: Props): ReactNode {
  // Check if this sidebar item has cloudOnly customProps
  const cloudOnly = props.item?.customProps?.cloudOnly;

  return (
    <>
      <Link {...props} />
      {cloudOnly && (
        <CloudOnlyBadge compact />
      )}
    </>
  );
}
