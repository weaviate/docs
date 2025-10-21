import React from "react";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router";
import styles from "./styles.module.scss";

const CardsSection = ({
  items,
  className = "",
  recipeCards = false,
  smallCards = false,
}) => {
  const location = useLocation();

  // Parse URL query parameters
  const searchParams = new URLSearchParams(location.search);

  // Get all query parameters to check against activeTab
  const getCurrentTab = (groupId) => {
    return searchParams.get(groupId);
  };

  return (
    <div
      className={`${styles.cardsSection} ${className} ${
        smallCards ? styles.smallCards : ""
      } ${recipeCards ? styles.recipeCards : ""}`}
    >
      {Object.entries(items).map(([key, item]) => {
        // Check if this card's activeTab matches the current URL parameter
        const currentTab = getCurrentTab(item.groupId);
        const isActive = item.activeTab && currentTab === item.activeTab;

        return (
          <Link
            key={key}
            to={item.link}
            className={`${styles.card} ${isActive ? styles.activeCard : ""}`}
          >
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
        );
      })}
    </div>
  );
};

export default CardsSection;
