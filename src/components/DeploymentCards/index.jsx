import React from 'react';
import Link from '@docusaurus/Link';
import {useColorMode} from '@docusaurus/theme-common';
import styles from './styles.module.scss';

const DeployCardsSection = ({ items }) => {
  const { colorMode } = useColorMode();

  return (
    <div className={styles.deploySection}>
      {items.map((item, idx) => (
        <Link key={idx} to={item.button.link} className={styles.deployBox}>
          <div className={styles.tabContainer}>
            {item.tabs.map((tab, index) => (
              <span
                key={index}
                className={`${styles.deployTab} ${!tab.active ? styles.inactive : ''}`}
              >
                {tab.label}
              </span>
            ))}
          </div>
          <div className={styles.deployContent}>
            <div className={styles.deployHeader}>
              <div
                className={styles.headerIcon}
                style={{
                  backgroundImage: `url(${
                    colorMode === 'dark' ? item.bgImage : item.bgImageLight
                  })`,
                }}
              />
              <span>{item.header}</span>
            </div>
            <ul className={styles.deployList}>
              {item.listItems.map((li, i) => (
                <li key={i}>{li}</li>
              ))}
            </ul>
            <button className={styles.deployButton}>
              {item.button.text}
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default DeployCardsSection;
