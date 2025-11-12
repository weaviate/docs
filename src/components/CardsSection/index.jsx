import React from "react";
import Link from "@docusaurus/Link";
import CloudOnlyBadge from "@site/src/components/CloudOnlyBadge";
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
    const param = searchParams.get(groupId);
    // Default to "vectorization" if no parameter is set
    return param || "vectorization";
  };

  return (
    <div
      className={`${styles.cardsSection} ${className} ${
        smallCards ? styles.smallCards : ""
      } ${recipeCards ? styles.recipeCards : ""}`}
    >
      {Object.entries(items).map(([key, item]) => {
        // Only check activeTab logic if both groupId and activeTab exist
        const isActive =
          item.groupId && item.activeTab
            ? getCurrentTab(item.groupId) === item.activeTab
            : false;

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
                {item.cloudOnly && (
                  <div className={styles.cardBadge}>
                    <CloudOnlyBadge />
                  </div>
                )}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default CardsSection;
