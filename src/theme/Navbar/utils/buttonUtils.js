import { useRef, useEffect } from "react";
import buttonStyles from "../styles/button.module.scss";

export function useNavbarButton(
  selectedOption,
  secondaryNavOptions,
  setModalOpen
) {
  // Store a reference to the button
  const buttonRef = useRef(null);

  // Update button content when selected option changes
  useEffect(() => {
    if (buttonRef.current) {
      // Update the button text and icon
      const iconElement = buttonRef.current.querySelector(
        `.${buttonStyles.optionIcon}`
      );
      if (iconElement) {
        // Remove old icon classes
        iconElement.className = `${secondaryNavOptions[selectedOption]?.icon} ${buttonStyles.optionIcon}`;
      }

      // Update text content (the text node is the second child, after the icon)
      const textNode = Array.from(buttonRef.current.childNodes).find(
        (node) => node.nodeType === Node.TEXT_NODE
      );

      if (textNode) {
        textNode.nodeValue = secondaryNavOptions[selectedOption]?.title;
      }
    }
  }, [selectedOption, secondaryNavOptions]);

  // Create the button element once on initial render
  useEffect(() => {
    // Create the button element that will be inserted into the navbar
    if (!buttonRef.current) {
      const button = document.createElement("button");
      button.className = buttonStyles.modalButton;
      button.onclick = () => setModalOpen(true);

      // Create icon element
      const icon = document.createElement("i");
      icon.className = `${secondaryNavOptions[selectedOption]?.icon} ${buttonStyles.optionIcon}`;
      icon.setAttribute("aria-hidden", "true");
      button.appendChild(icon);

      // Add the title text
      button.appendChild(
        document.createTextNode(secondaryNavOptions[selectedOption]?.title)
      );

      // Create arrow icon
      const arrowIcon = document.createElement("i");
      arrowIcon.className = `fa fa-chevron-down ${buttonStyles.arrowIcon}`;
      arrowIcon.setAttribute("aria-hidden", "true");
      button.appendChild(arrowIcon);

      buttonRef.current = button;
    }

    // Function to insert the button in the navbar
    const insertButtonInNavbar = () => {
      if (!buttonRef.current) return;

      // Find the navbar__items container
      const navbarItems = document.querySelector(".navbar__items");
      if (!navbarItems) return;

      // Check if button is already in the DOM
      if (!document.body.contains(buttonRef.current)) {
        // Insert the button in the navbar
        navbarItems.appendChild(buttonRef.current);
      }
    };

    // Insert button immediately
    insertButtonInNavbar();

    // Also set up a MutationObserver to handle cases where the navbar might be recreated
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          insertButtonInNavbar();
        }
      }
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      // Clean up on unmount
      observer.disconnect();
      if (buttonRef.current && document.body.contains(buttonRef.current)) {
        buttonRef.current.remove();
      }
    };
  }, [selectedOption, secondaryNavOptions, setModalOpen]);

  return buttonRef;
}
