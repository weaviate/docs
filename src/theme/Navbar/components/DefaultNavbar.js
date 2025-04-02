import React from "react";
import OriginalNavbar from "@theme-original/Navbar";

export default function DefaultNavbar({
  defaultNavbarRef,
  linksCount,
  props,
  styles,
}) {
  return (
    <div
      className={styles.defaultNavbar}
      ref={defaultNavbarRef}
      style={linksCount === 1 ? { top: 0 } : {}}
    >
      <OriginalNavbar {...props} />
    </div>
  );
}
