// src/components/AcademyAdmonition/index.jsx
import React from "react";
import styles from "./styles.module.scss";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";
import courses from "./courses.json";

const AcademyAdmonition = ({
  courseId,
  buttonText = "Open Academy Course",
  // Allow optional overrides
  customTitle,
  customDescription,
  customUrl,
}) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";

  // Find course by ID
  const course = courses.find((c) => c.id === courseId);

  // If course not found, show error in development
  if (!course && !customUrl) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div
          className={styles.academyAdmonition}
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            borderColor: "rgba(239, 68, 68, 0.3)",
          }}
        >
          <p style={{ color: "#dc2626", margin: 0 }}>
            ⚠️ Academy course not found: <code>{courseId}</code>
          </p>
          <p
            style={{
              color: "#7f1d1d",
              fontSize: "0.875rem",
              marginTop: "0.5rem",
              marginBottom: 0,
            }}
          >
            Available IDs: {courses.map((c) => c.id).join(", ")}
          </p>
        </div>
      );
    }
    // In production, return null to not render anything
    return null;
  }

  // Use course data or custom overrides
  const title = customTitle || course?.title;
  const description = customDescription || course?.description;
  const url = customUrl || course?.url;

  // If still no URL, don't render
  if (!url) return null;

  // Switch logo based on theme
  const logoPath = isDarkMode
    ? "/img/docs/weaviate-academy-white.png"
    : "/img/docs/weaviate-academy-purple.png";

  const academyLogoUrl = useBaseUrl(logoPath);

  return (
    <div className={styles.academyAdmonition}>
      <div className={styles.academyHeader}>
        <img
          src={academyLogoUrl}
          alt="Weaviate Academy"
          className={styles.academyLogo}
        />
        <h4 className={styles.courseTitle}>Course: {title}</h4>
      </div>

      <div className={styles.academyBody}>
        <p className={styles.courseDescription}>{description}</p>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.academyButton}
        >
          <span>{buttonText}</span>
          <svg
            className={styles.buttonIcon}
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M11 3L18 10M18 10L11 17M18 10H3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default AcademyAdmonition;

// ============================================
// Example usage in MDX files:
/*
import AcademyAdmonition from '@site/src/components/AcademyAdmonition';

// Simple usage with courseId from courses.json
<AcademyAdmonition courseId="quick-tour-of-weaviate" />

// With custom button text
<AcademyAdmonition 
  courseId="movie-recommendation-api" 
  buttonText="Start Learning"
/>

// Override with custom content (for courses not in JSON)
<AcademyAdmonition 
  customTitle="Custom Course Title"
  customDescription="This is a custom course description."
  customUrl="https://academy.weaviate.io/courses/custom"
  buttonText="Explore Course"
/>
*/
