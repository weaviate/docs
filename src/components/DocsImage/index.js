import React from "react";
import PropTypes from "prop-types";
import styles from "./styles.module.scss";

/**
 * DocsImage
 *
 * Props:
 * - image: (string) URL of the image to display.
 * - caption: (string) Caption text under the image.
 * - alt: (string) Alternate text for the image.
 * - layout: (string) 'right' (default) will show content on the left and image on the right,
 *           'below' will show content above the image.
 * - contentColumns: (number) Number of columns (out of 12) the content occupies (default: 6).
 * - imageColumns: (number) Number of columns the image occupies when content is present (default: 6).
 *                 If no content is provided, image takes full width (12 columns).
 * - children: (node) The HTML/JSX content to display.
 */
const DocsImage = ({
  image,
  caption = "",
  alt = "",
  layout = "right",
  contentColumns = 6,
  imageColumns = 6,
  children,
}) => {
  // Hack for better SEO score: if alt is empty and caption exists, use caption as alt
  if (alt === "" && caption !== "") {
    alt = caption;
  }
  const hasContent = !!children;

  // Wrap everything inside a unique container
  if (layout === "right") {
    return (
      <div className="row">
        {hasContent && (
          <div className={`col col--${contentColumns}`}>{children}</div>
        )}
        <div className={`col col--${hasContent ? imageColumns : 12}`}>
          <div className="card">
            <div className="card__image">
              <img
                src={image}
                alt={alt}
                className={!caption ? styles.fullRoundedImage : ""}
              />
            </div>
            {caption && <div className="card__body">{caption}</div>}
          </div>
        </div>
      </div>
    );
  } else if (layout === "below") {
    return (
      <div>
        {hasContent && <div>{children}</div>}
        <div className="row">
          <div className={`col col--${hasContent ? imageColumns : 12}`}>
            <div className="card">
              <div className="card__image">
                <img
                  src={image}
                  alt={alt}
                  className={!caption ? styles.fullRoundedImage : ""}
                />
              </div>
              {caption && <div className="card__body">{caption}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

DocsImage.propTypes = {
  image: PropTypes.string.isRequired,
  caption: PropTypes.string,
  alt: PropTypes.string,
  layout: PropTypes.oneOf(["right", "below"]),
  contentColumns: PropTypes.number,
  imageColumns: PropTypes.number,
  children: PropTypes.node,
};

export default DocsImage;
