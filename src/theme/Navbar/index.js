import OriginalNavbar from "@theme-original/Navbar";
import styles from "./styles.module.css";
import React, { useState } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import Link from "@docusaurus/Link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faCloud, faGraduationCap, faChevronDown } from "@fortawesome/free-solid-svg-icons";


const secondaryNavOptions = {
  build: {
    title: "Build",
    icon: faCode,
    description: "Develop applications using Weaviate's APIs and tools.",
    links: [
      { label: "Get Started", link: "/" },
      { label: "Model Integrations", link: "/weaviate/model-providers" },
      { label: "Concepts", link: "/weaviate/concepts" },
      { label: "Tutorials & guides", link: "/weaviate/configuration" },
      { label: "Reference", link: "/weaviate/api" },
      { label: "Releases", link: "/weaviate/release-notes" },
      { label: "Other", link: "/weaviate/benchmarks" },
    ],
  },
  cloud: {
    title: "Cloud",
    icon: faCloud,
    description: "Manage and scale Weaviate in the cloud.",
    links: [
      { label: "Getting Started", link: "/wcs" },
      { label: "Administration", link: "/docs/page-y" },
    ],
  },
  academy: {
    title: "Academy",
    icon: faGraduationCap,
    description: "Learn about vector search and Weaviate through structured courses.",
    links: [
      { label: "Getting Started", link: "/academy" },
    ],
  },
};

export default function NavbarWrapper(props) {
  const history = useHistory();
  const location = useLocation();
  const [selectedOption, setSelectedOption] = useState("build");
  const [isModalOpen, setModalOpen] = useState(false);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setModalOpen(false);

    // Navigate to the first item in the selected category
    const firstItem = secondaryNavOptions[option]?.links[0];
    if (firstItem) {
      history.push(firstItem.link);
    }
  };

  return (
    <>
      {/* Default Docusaurus Navbar */}
      <OriginalNavbar {...props} />

      {/* Secondary Navbar */}
      <div className={styles.secondaryNavbar}>
      <button className={styles.modalButton} onClick={() => setModalOpen(true)}>
      <FontAwesomeIcon icon={secondaryNavOptions[selectedOption]?.icon} className={styles.optionIcon} />
      {secondaryNavOptions[selectedOption]?.title}
        <FontAwesomeIcon icon={faChevronDown} className={styles.arrowIcon} />
      </button>

        <nav className={styles.secondaryNavLinks}>
          {secondaryNavOptions[selectedOption]?.links.map((item, index) => (
            <Link
            key={index}
            to={item.link}
            className={
              location.pathname === item.link
                ? `${styles.navLink} ${styles.activeNavLink}` 
                : styles.navLink
            }
          >
            {item.label}
          </Link>
          ))}
        </nav>
      </div>

      {/* Modal for Category Selection */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Select a Category</h3>
            {Object.entries(secondaryNavOptions).map(([key, value]) => (
              <div
                key={key}
                className={styles.modalOption}
                onClick={() => handleOptionSelect(key)}
              >
                <strong>{value.title}</strong>
                <p>{value.description}</p>
              </div>
            ))}
            <button className={styles.closeButton} onClick={() => setModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
