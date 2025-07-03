import { useRef, useEffect } from "react";
import navbarStyles from "../styles/navbar.module.scss";

export default function useStickyNavbar(linksCount, pathname) {
  // Refs for secondary navbar sticky behavior.
  const defaultNavbarRef = useRef(null);
  const secondaryNavbarRef = useRef(null);
  const placeholderRef = useRef(null);

  useEffect(() => {
    // If there's no secondary navbar, remove any existing placeholder and do nothing.
    if (linksCount < 1) {
      if (placeholderRef.current) {
        placeholderRef.current.remove();
        placeholderRef.current = null;
      }
      return;
    }

    // Otherwise, attach the sticky behavior.
    defaultNavbarRef.current = document.querySelector(
      `.${navbarStyles.defaultNavbar}`
    );
    secondaryNavbarRef.current = document.querySelector(
      `.${navbarStyles.secondaryNavbar}`
    );

    // Create a placeholder after the secondary navbar if it doesn't exist.
    if (secondaryNavbarRef.current && !placeholderRef.current) {
      const placeholder = document.createElement("div");
      placeholder.classList.add(navbarStyles.secondaryNavbarPlaceholder);
      placeholderRef.current = placeholder;
      secondaryNavbarRef.current.insertAdjacentElement("afterend", placeholder);
    }

    const applySticky = () => {
      if (
        !defaultNavbarRef.current ||
        !secondaryNavbarRef.current ||
        !placeholderRef.current
      )
        return;

      // If the page has been scrolled beyond the height of the default navbar...
      if (window.scrollY > defaultNavbarRef.current.offsetHeight) {
        secondaryNavbarRef.current.classList.add(navbarStyles.fixOnTop);
        placeholderRef.current.style.display = "block";
      } else {
        secondaryNavbarRef.current.classList.remove(navbarStyles.fixOnTop);
        placeholderRef.current.style.display = "none";
      }
    };

    // Check initial scroll position (handles anchor links on page load)
    // Use setTimeout to ensure DOM is fully rendered and scroll position is set
    const checkInitialPosition = () => {
      applySticky();
    };

    // Multiple timeouts to handle different loading scenarios
    setTimeout(checkInitialPosition, 0);
    setTimeout(checkInitialPosition, 100);

    // Also check when the page fully loads
    if (document.readyState === "complete") {
      checkInitialPosition();
    } else {
      window.addEventListener("load", checkInitialPosition);
    }

    // Handle scroll events
    const handleScroll = () => {
      applySticky();
    };

    window.addEventListener("scroll", handleScroll);

    // Enhanced cleanup function
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("load", checkInitialPosition);

      // Remove the placeholder when unmounting or when pathname changes
      if (placeholderRef.current) {
        placeholderRef.current.remove();
        placeholderRef.current = null;
      }
    };
  }, [linksCount, pathname]);

  return { defaultNavbarRef, secondaryNavbarRef, placeholderRef };
}
