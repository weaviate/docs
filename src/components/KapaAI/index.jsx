import React from "react";
import styles from "./styles.module.scss";

export default function KapaAI({ children, query = "" }) {
  const handleClick = (e) => {
    e.preventDefault();
    window.Kapa.open({
      mode: "ai",
      query: query,
      submit: false,
    });
  };

  return (
    <button className={`${styles.kapaAiLink}`} onClick={handleClick}>
      {children}
    </button>
  );
}
