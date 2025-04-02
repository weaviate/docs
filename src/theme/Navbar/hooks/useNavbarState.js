import { useState, useEffect, useMemo } from "react";
import { normalizePath, findPathInItems } from "../utils/navbarUtils";
import secondaryNavOptions from "/secondaryNavbar.js";

// Using the first key in secondaryNavOptions as the default option.
const DEFAULT_OPTION = Object.keys(secondaryNavOptions)[0];
const sidebars = require("/sidebars.js");
const routeBasePath = "/docs";

export default function useNavbarState(location) {
  // Compute the initial secondaryNavbar state based on the current location synchronously.
  const initialState = useMemo(() => {
    let currentPath = normalizePath(location.pathname, routeBasePath);
    if (!currentPath) {
      return {
        selectedOption: DEFAULT_OPTION,
        activeLink: secondaryNavOptions[DEFAULT_OPTION].links[0].sidebar,
      };
    }
    let foundSidebar = null;
    for (const [sidebarName, items] of Object.entries(sidebars)) {
      if (findPathInItems(items, currentPath)) {
        foundSidebar = sidebarName;
        break;
      }
    }
    // Use foundSidebar to determine the selected option.
    // Check which option has a link with a sidebar field that matches foundSidebar.
    const matchedOption = Object.entries(secondaryNavOptions).find(
      ([, value]) => value.links.some((link) => link.sidebar === foundSidebar)
    );
    const selectedOption = matchedOption ? matchedOption[0] : DEFAULT_OPTION;
    return { selectedOption, activeLink: foundSidebar };
  }, [location.pathname]);

  const [selectedOption, setSelectedOption] = useState(
    initialState.selectedOption
  );
  const [activeLink, setActiveLink] = useState(initialState.activeLink);

  const linksCount = secondaryNavOptions[selectedOption]?.links.length || 0;

  // Update state if location.pathname changes.
  useEffect(() => {
    let currentPath = normalizePath(location.pathname, routeBasePath);
    if (!currentPath) {
      setSelectedOption(DEFAULT_OPTION);
      setActiveLink(secondaryNavOptions[DEFAULT_OPTION].links[0].sidebar);
      return;
    }
    let foundSidebar = null;
    for (const [sidebarName, items] of Object.entries(sidebars)) {
      if (findPathInItems(items, currentPath)) {
        foundSidebar = sidebarName;
        break;
      }
    }
    // Use foundSidebar to determine the selected option.
    // Check which option has a link with a sidebar field that matches foundSidebar.
    const matchedOption = Object.entries(secondaryNavOptions).find(
      ([, value]) => value.links.some((link) => link.sidebar === foundSidebar)
    );
    setSelectedOption(matchedOption ? matchedOption[0] : DEFAULT_OPTION);
    setActiveLink(foundSidebar);
  }, [location.pathname]);

  return {
    selectedOption,
    setSelectedOption,
    activeLink,
    linksCount,
    secondaryNavOptions,
    DEFAULT_OPTION,
  };
}
