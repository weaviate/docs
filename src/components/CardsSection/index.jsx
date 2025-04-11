import React from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.scss";

const CardsSection = ({
  items,
  className = "",
  recipeCards = false,
  smallCards = false,
}) => {
  return (
    <div
      className={`${styles.cardsSection} ${className} ${
        smallCards ? styles.smallCards : ""
      } ${recipeCards ? styles.recipeCards : ""}`}
    >
      {Object.entries(items).map(([key, item]) => (
        <Link key={key} to={item.link} className={styles.card}>
          <div
            className={`${styles.cardHeader} ${
              recipeCards ? styles.recipeCardHeader : ""
            }`}
          >
            {!recipeCards && (
              <i className={`${item.icon} ${styles.cardIcon}`} />
            )}
            <span className={styles.cardTitle}>{item.title}</span>
          </div>
          <p className={styles.cardDescription}>{item.description}</p>
          {recipeCards && item.tags && (
            <div className={styles.cardTags}>
              {item.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};

export default CardsSection;
