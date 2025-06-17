import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import navbarStyles from "./styles/navbar.module.scss";
import buttonStyles from "./styles/button.module.scss";
import DefaultNavbar from "./components/DefaultNavbar";
import SecondaryNavbar from "./components/SecondaryNavbar";
import NavigationModal from "./components/NavigationModal"; // Renamed from OptionModal
import useNavbarState from "./hooks/useNavbarState";
import useStickyNavbar from "./hooks/useStickyNavbar";
import useKeyboardShortcut from "./hooks/useKeyboardShortcut";
import { useNavbarButton } from "./utils/buttonUtils";

export default function NavbarWrapper(props) {
  const history = useHistory();
  const location = useLocation();

  // Custom hooks for state management
  const {
    selectedOption,
    setSelectedOption,
    activeLink,
    linksCount,
    secondaryNavOptions,
    DEFAULT_OPTION,
  } = useNavbarState(location);

  const [isModalOpen, setModalOpen] = useState(false);
  const [isApple, setIsApple] = useState(true);

  // Handle platform detection
  useEffect(() => {
    if (navigator.appVersion.indexOf("Apple") !== -1) {
      setIsApple(true);
    } else {
      setIsApple(false);
    }
  }, []);

  // Button management
  useNavbarButton(selectedOption, secondaryNavOptions, setModalOpen);

  // Sticky navbar behavior
  const { defaultNavbarRef, secondaryNavbarRef, placeholderRef } =
    useStickyNavbar(linksCount, location.pathname);

  // Keyboard shortcuts
  useKeyboardShortcut("u", () => setModalOpen((prev) => !prev));

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setModalOpen(false);
    history.push(secondaryNavOptions[option].link);
  };

  return (
    <>
      <DefaultNavbar
        defaultNavbarRef={defaultNavbarRef}
        linksCount={linksCount}
        props={props}
        styles={navbarStyles}
      />

      {linksCount > 1 && (
        <SecondaryNavbar
          secondaryNavbarRef={secondaryNavbarRef}
          styles={navbarStyles}
          selectedOption={selectedOption}
          secondaryNavOptions={secondaryNavOptions}
          activeLink={activeLink}
        />
      )}

      <NavigationModal
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        buttonStyles={buttonStyles} // Still needed for header button styles
        secondaryNavOptions={secondaryNavOptions}
        handleOptionSelect={handleOptionSelect}
        isApple={isApple}
        activeLink={activeLink}
        selectedOption={selectedOption}
      />
    </>
  );
}
