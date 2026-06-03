import React, { useState, useEffect, useCallback } from "react";
import styles from "./styles.module.scss";

// Reuse the original first-visit key so existing visitors never see this pointer.
const STORAGE_KEY = "docs-has-visited";
const SWITCHER_SELECTOR = "[data-nav-switcher]";

/**
 * NavDocsPointer
 *
 * A small first-visit pointer anchored to the navbar product switcher, letting
 * new readers know they can browse the other Weaviate docs sections
 * (Deployment, Weaviate Cloud, Query Agent, Engram, and more).
 *
 * Replaces the old full-screen first-visit modal.
 */
export default function NavDocsPointer() {
  const [pos, setPos] = useState(null);
  const [visible, setVisible] = useState(false);

  const updatePosition = useCallback(() => {
    const btn = document.querySelector(SWITCHER_SELECTOR);
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setPos({ top: rect.bottom + 14, left: rect.left });
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch (e) {
      // ignore storage errors (e.g. privacy mode)
    }
    setVisible(false);
  }, []);

  // Show on first visit, once the switcher button has been injected.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch (e) {
      return;
    }

    let tries = 0;
    const timer = setInterval(() => {
      const btn = document.querySelector(SWITCHER_SELECTOR);
      if (btn) {
        clearInterval(timer);
        updatePosition();
        setVisible(true);
      } else if (++tries > 50) {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [updatePosition]);

  // Keep the bubble anchored, and dismiss once the reader opens the switcher.
  useEffect(() => {
    if (!visible) return;

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const btn = document.querySelector(SWITCHER_SELECTOR);
    btn?.addEventListener("click", dismiss);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      btn?.removeEventListener("click", dismiss);
    };
  }, [visible, updatePosition, dismiss]);

  if (!visible || !pos) return null;

  return (
    <div
      className={styles.pointer}
      style={{ top: pos.top, left: pos.left }}
      role="dialog"
      aria-label="Browse other Weaviate docs"
    >
      <span className={styles.arrow} aria-hidden="true" />

      <button
        className={styles.close}
        onClick={dismiss}
        aria-label="Dismiss"
        type="button"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </button>

      <div className={styles.body}>
        <span className={styles.iconWrap} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <rect x="3" y="3" width="7" height="7" rx="1.6" fill="currentColor" />
            <rect x="14" y="3" width="7" height="7" rx="1.6" fill="currentColor" opacity="0.6" />
            <rect x="3" y="14" width="7" height="7" rx="1.6" fill="currentColor" opacity="0.6" />
            <rect x="14" y="14" width="7" height="7" rx="1.6" fill="currentColor" />
          </svg>
        </span>

        <div className={styles.content}>
          <p className={styles.title}>Find the right docs</p>
          <p className={styles.text}>
            Switch between Database, Deployment, Cloud, Query Agent, Engram, and more from here.
          </p>
          <button className={styles.cta} onClick={dismiss} type="button">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
