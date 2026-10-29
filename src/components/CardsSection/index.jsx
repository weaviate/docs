import React, { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import CloudOnlyBadge from "@site/src/components/CloudOnlyBadge";
import { readClusterId } from "./clusterId";
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

  // A card with `clusterIdParam` gets the cluster id from the page link added
  // to its own link under that parameter name. Read after mount so the first
  // client render matches the server HTML.
  const [clusterId, setClusterId] = useState(null);
  useEffect(() => {
    setClusterId(readClusterId(location.search));
  }, [location.search]);

  const cardLink = (item) => {
    if (!item.clusterIdParam || !clusterId) return item.link;
    try {
      const url = new URL(item.link);
      url.searchParams.set(item.clusterIdParam, clusterId);
      return url.toString();
    } catch {
      return item.link;
    }
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
            to={cardLink(item)}
            className={`${styles.card} ${isActive ? styles.activeCard : ""}${
              item.tag ? ` ${styles.cardTagged}` : ""
            }`}
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
            {item.tag && <span className={styles.cornerTag}>{item.tag}</span>}
            <p className={styles.cardDescription}>{item.description}</p>
            {recipeCards && (item.tags || item.cloudOnly) && (
              <div className={styles.cardTags}>
                {item.tags && item.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                  </span>
                ))}
                {item.cloudOnly && (
                  <div className={styles.cardBadge}>
                    <CloudOnlyBadge compact />
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
