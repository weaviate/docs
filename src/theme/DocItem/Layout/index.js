import React from "react";
import Layout from "@theme-original/DocItem/Layout";
import ArchiveNotice from "@site/src/components/Documentation/ArchiveNotice";

export default function LayoutWrapper(props) {
  return (
    <>
      <ArchiveNotice />
      <Layout {...props} />
    </>
  );
}
