// src/theme/Tabs/playgroundCredentials.js
// Stores the reader's Weaviate Cloud cluster URL and API key in localStorage
// so the in-browser playground (pyodideRunner.js) can inject them as
// WEAVIATE_URL / WEAVIATE_API_KEY environment variables before each run.
//
// SSR-safe: window/localStorage are only touched inside functions.

const URL_STORAGE_KEY = "weaviatePlayground.wcdUrl";
const API_KEY_STORAGE_KEY = "weaviatePlayground.wcdApiKey";

// Other CodeDropdownTabs instances on the page listen for this to keep their
// "Connect" button state in sync (same pattern as codeLanguageChange).
export const CREDENTIALS_CHANGE_EVENT = "wcdCredentialsChange";

// Reduce whatever the user pasted (https://abc.weaviate.cloud/, host:port,
// URL with path or query, …) to a bare hostname, which is what
// use_async_with_custom() expects.
export function normalizeClusterUrl(raw) {
  if (!raw) return "";
  const stripped = raw.trim().replace(/^https?:\/\//, "");
  try {
    return new URL(`https://${stripped}`).hostname;
  } catch {
    return stripped.replace(/[/?#].*$/, "").replace(/:\d+$/, "");
  }
}

export function loadCredentials() {
  if (typeof window === "undefined") {
    return { url: "", apiKey: "" };
  }
  return {
    url: localStorage.getItem(URL_STORAGE_KEY) || "",
    apiKey: localStorage.getItem(API_KEY_STORAGE_KEY) || "",
  };
}

export function saveCredentials({ url, apiKey }) {
  if (typeof window === "undefined") return;
  const normalizedUrl = normalizeClusterUrl(url);
  if (normalizedUrl) {
    localStorage.setItem(URL_STORAGE_KEY, normalizedUrl);
  } else {
    localStorage.removeItem(URL_STORAGE_KEY);
  }
  if (apiKey) {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
  window.dispatchEvent(new CustomEvent(CREDENTIALS_CHANGE_EVENT));
}

export function clearCredentials() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(URL_STORAGE_KEY);
  localStorage.removeItem(API_KEY_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CREDENTIALS_CHANGE_EVENT));
}

export function hasCredentials() {
  const { url, apiKey } = loadCredentials();
  return Boolean(url || apiKey);
}
