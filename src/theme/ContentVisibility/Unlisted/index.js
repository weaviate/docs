import React from "react";
import { UnlistedMetadata } from "@docusaurus/theme-common";

/**
 * Swizzled from @docusaurus/theme-classic.
 *
 * The upstream component renders two things for an `unlisted: true` page:
 * <UnlistedMetadata /> (the `noindex, nofollow` robots meta) and a caution
 * banner reading "This page is unlisted."
 *
 * We keep the metadata and drop the banner. Unlisted pages in this repo are
 * finished, hand-distributed pages rather than drafts, so the banner would tell
 * a reader who was given the link that the page is provisional. The metadata is
 * load-bearing and must stay: besides the robots meta itself, the sitemap
 * plugin decides what to exclude by reading the emitted `noindex` meta
 * (@docusaurus/plugin-sitemap `isNoIndexMetaRoute`), so removing it would put
 * unlisted pages back into sitemap.xml.
 */
export default function Unlisted() {
  return <UnlistedMetadata />;
}
