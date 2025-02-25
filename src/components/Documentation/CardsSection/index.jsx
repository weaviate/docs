import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './styles.module.scss';

const CardsSection = ({ items }) => {
  return (
    <div className={styles.cardsSection}>
      {Object.entries(items).map(([key, item]) => {
        // Use the first link from the links array (fallback to "#" if no link exists)
        return (
          <a key={key} href={item.link} className={styles.card}>
            <div className={styles.cardHeader}>
              <FontAwesomeIcon icon={item.icon} className={styles.cardIcon} />
              <span className={styles.cardTitle}>{item.title}</span>
            </div>
            <p className={styles.cardDescription}>{item.description}</p>
          </a>
        );
      })}
    </div>
  );
};

export default CardsSection;