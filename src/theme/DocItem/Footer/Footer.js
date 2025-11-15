import React, { useState } from "react";
import Link from "@docusaurus/Link";
import styles from "./Footer.module.scss";

function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (event) => {
    event.preventDefault();

    // Replace with your actual Beehiiv endpoint
    const endpoint = "https://api.beehiiv.com/subscribe";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("Thank you for subscribing!");
        setEmail("");
      } else {
        setMessage("Subscription failed. Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          {/* Left Section: Newsletter and Social Icons */}
          <div className={styles.leftSection}>
            <div className={styles.socialIcons}>
              <Link
                to="https://github.com/weaviate/weaviate"
                title="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-github" aria-hidden="true"></i>
              </Link>
              <Link
                to="https://weaviate.io/slack"
                title="Slack"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-slack" aria-hidden="true"></i>
              </Link>
              <Link
                to="https://x.com/weaviate_io"
                title="X"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-twitter" aria-hidden="true"></i>
              </Link>
              <Link
                to="https://instagram.com/weaviate.io"
                title="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram" aria-hidden="true"></i>
              </Link>
              <Link
                to="https://youtube.com/@Weaviate"
                title="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-youtube" aria-hidden="true"></i>
              </Link>
              <Link
                to="https://www.linkedin.com/company/weaviate-io"
                title="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-linkedin" aria-hidden="true"></i>
              </Link>
            </div>
            {/*
            <div className={styles.newsletter}>
              <h4>Get updates from Weaviate</h4>
              <form
                onSubmit={handleSubscribe}
                className={styles.newsletterForm}
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit">Subscribe</button>
              </form>
              {message && <p className={styles.message}>{message}</p>}
            </div>
            */}
          </div>

          {/* Right Section: Additional Links */}
          <div className={styles.rightSection}>
            <div className={styles.footerSection}>
              <h5>Documentation</h5>
              <ul>
                <li>
                  <Link to="/weaviate">Weaviate Database</Link>
                </li>
                <li>
                  <Link to="/deploy">Deployment documentation</Link>
                </li>
                <li>
                  <Link to="/cloud">Weaviate Cloud</Link>
                </li>
                <li>
                  <Link to="/agents">Weaviate Agents</Link>
                </li>
              </ul>
            </div>
            <div className={styles.footerSection}>
              <h5>Support</h5>
              <ul>
                <li>
                  <Link
                    to="https://forum.weaviate.io/c/support/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Forum
                  </Link>
                </li>
                <li>
                  <Link
                    to="https://weaviate.io/slack"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Slack
                  </Link>
                </li>
              </ul>
            </div>
            {/* {
              <div className={styles.footerSection}>
                <h5>Deployment options</h5>
                <ul>
                  <li>
                    <Link
                      to="https://weaviate.io/deployment/shared"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Shared Cloud
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="https://weaviate.io/deployment/dedicated"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Dedicated Cloud
                    </Link>
                  </li>
                </ul>
              </div>
            } */}
          </div>
        </div>
        {/*
        <div className={styles.footerText}>
          &copy; {new Date().getFullYear()} Weaviate, B.V. Built with
          Docusaurus.{" "}
          <Link to="https://weaviate.io/service">Terms and policies</Link>
        </div>
        */}
      </div>
    </footer>
  );
}

export default Footer;
