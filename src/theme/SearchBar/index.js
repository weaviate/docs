import React, { useEffect, useState } from "react";
import "./styles.model.scss";

export default function SearchBarWrapper(props) {
  const [isApple, setIsApple] = useState(true);

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
          <span className="searchPlaceholderText">Search or ask AI</span>
        </span>
        <div className="commandIconContainer">
          <span className="commandIcon">{isApple ? "⌘K" : "Ctrl + K"}</span>
        </div>
      </button>
    </div>
  );
}
