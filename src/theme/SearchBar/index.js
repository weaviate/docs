import React, { useEffect, useState } from "react";
import "./styles.model.scss";

export default function SearchBarWrapper(props) {
  const [isApple, setIsApple] = useState(true);

  useEffect(() => {
    // This is a hack to reset the widget when closing it.
    // The search bar should open the search tab, and the Ask AI widget the Ask AI tab.
    // Without this hack, when opening from the search bar the search tab would be default.
    if (window.Kapa && typeof window.Kapa === "function") {
      window.Kapa("onModalClose", function ({ mode }) {
        window.Kapa.unmount();
        window.Kapa.render({
          onRender: () => {},
        });
      });
    }
  }, []);

  useEffect(() => {
    // Detect if the platform is Apple (if needed)
    if (navigator.appVersion.indexOf("Apple") !== -1) {
      setIsApple(true);
    }
  }, []);

  const handleSearchClick = () => {
    // Render the widget and open it when ready
    window.Kapa.open({
      mode: "search",
      query: "",
      submit: false,
    });
  };

  return (
    <div className="searchBox">
      <button className="searchButton" onClick={handleSearchClick}>
        <span className="searchPlaceholder">
          <i className="searchIcon fas fa-magnifying-glass" />
          <span className="searchPlaceholderText">Search</span>
        </span>
        <div className="commandIconContainer">
          <span className="commandIcon">{isApple ? "⌘K" : "Ctrl + K"}</span>
        </div>
      </button>
    </div>
  );
}
