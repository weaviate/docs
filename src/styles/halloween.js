// src/styles/halloween.js

const htmlEl = document.documentElement;
let observer = null;
let isInternalThemeChange = false;

// --- 1. The Observer ---
const mutationCallback = (mutations) => {
  for (const mutation of mutations) {
    if (
      mutation.type === "attributes" &&
      mutation.attributeName === "data-theme"
    ) {
      const currentTheme = htmlEl.dataset.theme;
      const isHalloweenMode = htmlEl.classList.contains("halloween-mode");

      console.log(
        "Theme changed to:",
        currentTheme,
        "Halloween mode:",
        isHalloweenMode,
        "Internal:",
        isInternalThemeChange
      );

      // If this is an internal change we made, ignore it
      if (isInternalThemeChange) {
        return;
      }

      if (isHalloweenMode) {
        if (currentTheme === "light") {
          // External change to light mode detected - user clicked Docusaurus toggle
          console.log(
            "External change to light detected - disabling Halloween"
          );
          disableSpooky(true);
        } else if (currentTheme === "dark") {
          // External change to dark - this is fine, do nothing
          console.log("External change to dark - keeping Halloween mode");
        }
      }
    }
  }
};

// --- 2. The Toggles ---

function enableSpooky() {
  console.log("Enabling Halloween mode");

  isInternalThemeChange = true;

  htmlEl.classList.add("halloween-mode");
  localStorage.setItem("halloween-mode", "enabled");

  // Set theme to dark and sync with Docusaurus
  htmlEl.setAttribute("data-theme", "dark");
  localStorage.setItem("theme", "dark");

  // Start the observer if it's not already running
  if (!observer) {
    observer = new MutationObserver(mutationCallback);
    observer.observe(htmlEl, { attributes: true });
  }

  setTimeout(() => {
    isInternalThemeChange = false;
  }, 100);
}

function disableSpooky(fromObserver = false) {
  console.log("Disabling Halloween mode, fromObserver:", fromObserver);

  isInternalThemeChange = true;

  // Stop the observer
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  htmlEl.classList.remove("halloween-mode");
  localStorage.setItem("halloween-mode", "disabled");

  if (!fromObserver) {
    // Manually toggled off - switch to light
    htmlEl.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  }

  setTimeout(() => {
    isInternalThemeChange = false;
  }, 100);
}

// --- 3. The Initializer (runs once) ---

function initializeHalloween() {
  // Check seasonal status
  const today = new Date();
  const month = today.getMonth();
  let isSpookySeason = month === 9;

  // To test the theme at any time, uncomment the line below:
  isSpookySeason = true;

  const storedPref = localStorage.getItem("halloween-mode");

  if (!isSpookySeason) {
    const style = document.createElement("style");
    style.innerHTML = "#halloween-toggle-button { display: none; }";
    document.head.appendChild(style);
    disableSpooky();
    return;
  }

  // It IS spooky season
  if (storedPref === "enabled") {
    enableSpooky();
  } else if (storedPref === "disabled") {
    disableSpooky();
  } else {
    // Default: enabled
    enableSpooky();
  }

  // --- 4. Pumpkin button click handler ---
  document.addEventListener("click", (event) => {
    const pumpkinButton = event.target.closest("#halloween-toggle-button");
    if (pumpkinButton) {
      console.log("Pumpkin clicked!");
      event.preventDefault();
      event.stopPropagation();

      const isEnabled = htmlEl.classList.contains("halloween-mode");
      console.log("Halloween currently enabled:", isEnabled);

      if (isEnabled) {
        disableSpooky();
      } else {
        enableSpooky();
      }
    }
  });
}

window.addEventListener("load", initializeHalloween);
