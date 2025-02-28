import React from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.scss";
import CustomScriptLoader from "../../scriptSwitch";

const DocHomePage = () => {
  return (
    <>
      <div className={styles.docHome}>
        <h3 className={styles.docHeader}>Step 1 - Choose your deployment</h3>
        <p className={styles.docText}>
          Multiple deployment options are available to cater for different users
          and use cases. All options offer vectorizer and RAG module
          integration.
        </p>

        <div className={styles.deploySection}>
          <div className={styles.deployBox}>
            <div className={styles.tabContainer}>
              <div className={styles.deployTab}>Evaluation</div>
              <div className={styles.deployTab}>Deployment</div>
              <div className={styles.deployTab}>Production</div>
            </div>
            <div className={styles.deployContent}>
              <div className={styles.deployHeader}>Weaviate Cloud</div>
              <ul className={styles.deployList}>
                <li>From evaluation (sandbox) to production</li>
                <li>Serverless (infrastructure managed by Weaviate)</li>
                <li>(Optional) Data replication (high-availability)</li>
                <li>(Optional) Zero-downtime updates</li>
              </ul>
              <button className={styles.deployButton}>
                <Link to="/docs/cloud/create-instance">Set up a WCD instance</Link>
              </button>
            </div>
          </div>

          <div className={styles.deployBox}>
            <div className={styles.tabContainer}>
              <div className={styles.deployTab}>Evaluation</div>
              <div className={styles.deployTab}>Deployment</div>
              <div className={`${styles.deployTab} ${styles.inactive}`}>
                Production
              </div>
            </div>
            <div className={styles.deployContent}>
              <div className={`${styles.deployHeader} ${styles.docker}`}>
                Docker
              </div>
              <ul className={styles.deployList}>
                <li>For local evaluation & development</li>
                <li>Local inference containers</li>
                <li>Multi-modal models</li>
                <li>Customizable configurations</li>
              </ul>
              <button className={styles.deployButton}>
                <Link to="/docs/weaviate/installation/docker-compose">
                  Run Weaviate with Docker
                </Link>
              </button>
            </div>
          </div>
        </div>
        <br />

        <div className={styles.deploySection}>
          <div className={styles.deployBox}>
            <div className={styles.tabContainer}>
              <div className={`${styles.deployTab} ${styles.inactive}`}>
                Evaluation
              </div>
              <div className={styles.deployTab}>Deployment</div>
              <div className={styles.deployTab}>Production</div>
            </div>
            <div className={styles.deployContent}>
              <div className={`${styles.deployHeader} ${styles.kubernetes}`}>
                Kubernetes
              </div>
              <ul className={styles.deployList}>
                <li>For development to production</li>
                <li>Local inference containers</li>
                <li>Multi-modal models</li>
                <li>Customizable configurations</li>
                <li>Self-deploy or Marketplace deployment</li>
                <li>(Optional) Zero-downtime updates</li>
              </ul>
              <button className={styles.deployButton}>
                <Link to="/docs/weaviate/installation/kubernetes">
                  Run Weaviate with Kubernetes
                </Link>
              </button>
            </div>
          </div>

          <div className={styles.deployBox}>
            <div className={styles.tabContainer}>
              <div className={styles.deployTab}>Evaluation</div>
              <div className={`${styles.deployTab} ${styles.inactive}`}>
                Deployment
              </div>
              <div className={`${styles.deployTab} ${styles.inactive}`}>
                Production
              </div>
            </div>
            <div className={styles.deployContent}>
              <div className={styles.deployHeader}>Embedded Weaviate</div>
              <ul className={styles.deployList}>
                <li>For basic, quick evaluation</li>
                <li>
                  Conveniently launch Weaviate directly from Python or JS/TS
                </li>
              </ul>
              <button className={styles.deployButton}>
                <Link to="/docs/weaviate/installation/embedded">
                  Run Embedded Weaviate
                </Link>
              </button>
            </div>
          </div>
        </div>
        <br />

        <h3 className={styles.docHeader}>Step 2 - Choose your scenario</h3>
        <p className={styles.docText}>
          Choose your next step. Weaviate is flexible and can be used in many
          contexts and scenarios.
        </p>

        <div className={`${styles.deploySection} ${styles.scenario}`}>
          <div className={styles.scenarioBox}>
            <div className={`${styles.scenarioLogo} ${styles.data}`}></div>
            <div className={styles.scenarioText}>
              <span>
                <span>Work with text data</span>
                <span>
                  <p>
                    <Link to="/docs/academy/py/starter_text_data/">Python</Link> /{" "}
                    <Link to="/docs/academy/js/starter_text_data/">JavaScript</Link>
                  </p>
                </span>
              </span>

              <p>
                Just bring your text data to Weaviate and it will do the rest.
              </p>
              <p>
                Just{" "}
                <Link to="/docs/academy/py/starter_text_data/text_collections/">
                  populate Weaviate
                </Link>{" "}
                with your text data and start using powerful{" "}
                <Link to="/docs/academy/py/starter_text_data/text_searches/">
                  vector, keyword and hybrid search capabilities
                </Link>
                .
              </p>
              <p>
                And use our integrations to{" "}
                <Link to="/docs/academy/py/starter_text_data/text_rag/">
                  build generative ai tools
                </Link>{" "}
                with your data.
              </p>
            </div>
          </div>
          <div className={styles.scenarioBox}>
            <div className={`${styles.scenarioLogo} ${styles.custom}`}></div>
            <div className={styles.scenarioText}>
              <span>
                <Link to="/docs/weaviate/starter-guides/custom-vectors">
                  Bring your own vectors
                </Link>
              </span>

              <p>Do you prefer to work with your own vectors? No problem.</p>
              <p>
                You can{" "}
                <Link to="/docs/academy/py/starter_custom_vectors/object_collections/">
                  add your own vectors to Weaviate
                </Link>{" "}
                and still benefit from{" "}
                <Link to="/docs/academy/py/starter_custom_vectors/object_searches/">
                  all of its indexing and search capabilities.
                </Link>
                .
              </p>
              <p>
                Our integrations to{" "}
                <Link to="/docs/academy/py/starter_custom_vectors/object_rag/">
                  build generative ai tools
                </Link>{" "}
                work just as well with your data and vectors.
              </p>
            </div>
          </div>
          <div className={styles.scenarioBox}>
            <div className={`${styles.scenarioLogo} ${styles.semantic}`}></div>
            <div className={styles.scenarioText}>
              <span>
                <span>Multimodality</span>
                <span>
                  <p>
                    <Link to="/docs/academy/py/starter_multimodal_data">Python</Link>{" "}
                    /{" "}
                    <Link to="/docs/academy/js/starter_multimodal_data">
                      JavaScript
                    </Link>
                  </p>
                </span>
              </span>

              <p>For many, data comes in multiple forms beyond text.</p>
              <p>
                Weaviate's multimodal modules{" "}
                <Link to="/docs/academy/py/starter_multimodal_data/mm_collections/">
                  can import text, audio and video and more
                </Link>{" "}
                as well as{" "}
                <Link to="/docs/academy/py/starter_multimodal_data/mm_searches/">
                  perform multimodal searches
                </Link>
                .
              </p>
              <p>
                Use these modules to{" "}
                <Link to="/docs/academy/py/starter_multimodal_data/mm_rag/">
                  build generative ai tools
                </Link>{" "}
                from your entire dataset.
              </p>
            </div>
          </div>
        </div>

        <h3 className={styles.docHeader}>What Next</h3>
        <p className={styles.docText}>
          We recommend starting with these sections:
        </p>

        <div className={`${styles.deploySection} ${styles.whatsNext}`}>
          <div className={styles.whatnextBox}>
            <span>What is Weaviate?</span>
            <p>
              Weaviate is an open source vector search engine that stores both
              objects and vectors.
            </p>
            <div className={styles.wtLearn}>
              <Link to="/docs/weaviate/introduction#what-is-weaviate">
                Learn more
              </Link>
            </div>
          </div>
          <div className={styles.whatnextBox}>
            <span>What can you do with Weaviate?</span>
            <p>
              Features, examples, demo applications, recipes, use cases, etc..
            </p>
            <div className={styles.wtLearn}>
              <Link to="/docs/weaviate/more-resources/example-use-cases">
                Learn more
              </Link>
            </div>
          </div>
          <div className={`${styles.whatnextBox} ${styles.small}`}>
            <span className={styles.filters}>Installation</span>
            <p>
              Learn about the available options for running Weaviate, along with
              instructions on installation and configuration.
            </p>
            <div className={styles.wtLearn}>
              <Link to="/docs/weaviate/installation">Learn more</Link>
            </div>
          </div>
          <div className={`${styles.whatnextBox} ${styles.small}`}>
            <span className={styles.filters}>How-to: Configure</span>
            <p>
              Discover how to configure Weaviate to suit your specific needs.
            </p>
            <div className={styles.wtLearn}>
              <Link to="/docs/weaviate/configuration">Learn more</Link>
            </div>
          </div>
          <div className={`${styles.whatnextBox} ${styles.small}`}>
            <span className={styles.filters}>Concepts</span>
            <p>
              Get the most out of Weaviate and learn about its architecture and
              various features.
            </p>
            <div className={styles.wtLearn}>
              <Link to="/docs/weaviate/concepts">Learn more</Link>
            </div>
          </div>
        </div>
        <div className={styles.secondaryContent}>
          <h3>Can we help?</h3>
          <div className={`${styles.secondaryTabs} ${styles.github}`}>
            <Link to="https://github.com/weaviate/weaviate">GitHub</Link>
          </div>
          <div className={`${styles.secondaryTabs} ${styles.forum}`}>
            <Link to="https://forum.weaviate.io/">Community forum</Link>
          </div>
          <div className={`${styles.secondaryTabs} ${styles.slack}`}>
            <Link to="https://weaviate.io/slack">Slack</Link>
          </div>
        </div>
        <div className={styles.secondaryContent}>
          <h3>Client Libraries</h3>
          <div className={styles.tabRow}>
            <div className={`${styles.secondaryTabs} ${styles.python}`}>
              <Link to="/docs/weaviate/client-libraries/python">Python</Link>
            </div>
            <div className={`${styles.secondaryTabs} ${styles.ts}`}>
              <Link to="/docs/weaviate/client-libraries/typescript">JS/TS</Link>
            </div>
          </div>

          <div className={`${styles.secondaryTabs} ${styles.go}`}>
            <Link to="/docs/weaviate/client-libraries/go">Go</Link>
          </div>
          <div className={`${styles.secondaryTabs} ${styles.java}`}>
            <Link to="/docs/weaviate/client-libraries/java">Java</Link>
          </div>
        </div>
      </div>
      <CustomScriptLoader />
    </>
  );
};

export default DocHomePage;
