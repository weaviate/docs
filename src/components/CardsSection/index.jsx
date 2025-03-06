import React from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.scss";

const CardsSection = ({ items, className = "" }) => {
  return (
    <div className={`${styles.cardsSection} ${className}`}>
      {Object.entries(items).map(([key, item]) => (
        <Link key={key} to={item.link} className={styles.card}>
          <div className={styles.cardHeader}>
            <i className={`${item.icon} ${styles.cardIcon}`} />
            <span className={styles.cardTitle}>{item.title}</span>
          </div>
          <p className={styles.cardDescription}>{item.description}</p>
        </Link>
      ))}
    </div>
  );
};

export default CardsSection;
