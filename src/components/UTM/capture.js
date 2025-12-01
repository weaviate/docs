import React, { useEffect } from "react";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "msclkid",
];

function getUtmsFromUrl() {
  if (typeof window === "undefined") return {};
  const q = new URLSearchParams(window.location.search);
  const out = {};
  UTM_KEYS.forEach((k) => {
    const v = q.get(k);
    if (v) out[k] = v;
  });
  return out;
}

function getUtmsFromStorage() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("first_touch_utms");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function buildConsoleUrl(utms) {
  const url = new URL("https://console.weaviate.cloud/signin");
  Object.entries(utms || {}).forEach(([k, v]) => {
    if (v != null && v !== "") url.searchParams.set(k, v);
  });
  return url.toString();
}

export default function GoConsole() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlUtms = getUtmsFromUrl();        
    const storedUtms = getUtmsFromStorage(); 

    
    const mergedUtms = {
      ...(storedUtms || {}),
      ...(urlUtms || {}),
    };

    const target = buildConsoleUrl(mergedUtms);
    window.location.replace(target);
  }, []);

  return React.createElement(
    "noscript",
    null,
    "Redirecting to Weaviate Console… ",
    React.createElement("a", { href: "https://console.weaviate.cloud/" }, "Continue")
  );
}
