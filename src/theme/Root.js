import React, { useEffect } from "react";
import { useLocation } from "@docusaurus/router";

export default function Root({ children }) {
  const location = useLocation();

  useEffect(() => {
    // Function to manage Kapi Widget
    function manageKapiWidget() {
      const currentPath = location.pathname;

      // Load widget on all pages except /weaviate/api/rest
      const shouldLoadWidget = !currentPath.startsWith("/weaviate/api/rest");

      const existingScript = document.querySelector(
        'script[src="https://widget.kapa.ai/kapa-widget.bundle.js"]'
      );

      if (shouldLoadWidget && !existingScript) {
        const script = document.createElement("script");
        script.src = "https://widget.kapa.ai/kapa-widget.bundle.js";
        script.setAttribute(
          "data-website-id",
          "109019ee-418e-4434-b485-85a09533c865"
        );
        script.setAttribute("data-project-name", "Weaviate");
        script.setAttribute("data-project-color", "#130c49");
        script.setAttribute(
          "data-project-logo",
          "/img/site/weaviate-logo-w.png"
        );
        script.setAttribute("data-button-image-width", "35");
        script.setAttribute("data-button-image-height", "20");
        script.setAttribute("data-modal-image-width", "35");
        script.setAttribute("data-modal-image-height", "20");
        script.setAttribute("data-search-mode-enabled", "true");
        script.setAttribute("data-button-border", "1px solid white");
        script.setAttribute("data-button-border-radius", "8px");
        script.setAttribute("data-modal-title-color", "#130c49!important");
        script.setAttribute("data-modal-open-by-default", "false");
        script.setAttribute("data-modal-open-on-command-k", "true");
        script.setAttribute("data-modal-z-index", "9999");
        script.setAttribute("data-button-hide", "true");
        script.setAttribute("data-switch-border", "1px");
        script.setAttribute("data-switch-bg-color", "#efefef");
        script.setAttribute("data-font-size-xs", "0.85rem");
        script.setAttribute("data-font-size-sm", "1.1rem");
        script.setAttribute("data-font-size-md", "1.15rem");
        script.setAttribute("data-font-size-lg", "1.225rem");
        script.setAttribute("data-font-size-xl", "1.35rem");
        script.setAttribute(
          "data-modal-disclaimer",
          "This is a custom LLM for Weaviate with access to all developer docs, Cloud docs, academy lessons, contributor guides, GitHub issues, and forum questions."
        );
        script.setAttribute("data-modal-disclaimer-bg-color", "white");
        script.setAttribute("data-modal-disclaimer-text-color", "black");
        script.setAttribute("data-modal-disclaimer-font-size", "0.85rem");
        script.setAttribute(
          "data-modal-example-questions",
          "How do I run Weaviate?,What model providers work with Weaviate?,How do I perform a hybrid search?,How do I create objects with vectors?"
        );
        script.setAttribute(
          "data-modal-footer",
          "Powered by Weaviate and kapa.ai"
        );
        script.async = true;
        document.body.appendChild(script);
      } else if (!shouldLoadWidget && existingScript) {
        existingScript.remove();

        const widgetContainer = document.querySelector(
          ".kapa-widget-container"
        );
        if (widgetContainer) {
          widgetContainer.remove();
        }
      }
    }

    manageKapiWidget();
  }, [location]);

  return <>{children}</>;
}
