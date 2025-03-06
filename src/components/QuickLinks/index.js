import React from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.scss";

const QuickLinks = ({ items, className = "" }) => {
  return (
    <div className={`${styles.quickLinks} ${className}`}>
      {items.map((item, index) => (
        <Link key={index} to={item.link} className={styles.quickLink}>
          <i className={`${item.icon} ${styles.quickLinkIcon}`} />
          <span className={styles.quickLinkTitle}>{item.title}</span>
        </Link>
      ))}
    </div>
  );
};

export default QuickLinks;
