import React, { useState, useEffect } from "react";
import BaseModal from "../BaseModal";
import styles from "./styles.module.scss";

export default function FirstVisitModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    console.log("FirstVisitModal useEffect running..."); 

    // Check for dev override in URL
    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.get('firstvisit') === 'true';
    
    const hasVisited = localStorage.getItem("docs-has-visited");
    console.log("hasVisited:", hasVisited, "forceShow:", forceShow);
    
    if (!hasVisited || forceShow) {
      console.log("Showing modal...");
      const timer = setTimeout(() => {
        setIsModalOpen(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    console.log("Modal closing...");
    setIsModalOpen(false);
    
    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.get('firstvisit') === 'true';
    
    if (!forceShow) {
      localStorage.setItem("docs-has-visited", "true");
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  console.log("FirstVisitModal render - isModalOpen:", isModalOpen);

  const tabs = [
    { id: 'overview', label: 'Documentation Overview' },
    { id: 'database', label: 'Core Database' },
    { id: 'deployment', label: 'Deployment' },
    { id: 'cloud', label: 'Weaviate Cloud' },
    { id: 'agents', label: 'Weaviate Agents' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className={styles.tabContent}>
            <div className={styles.description}>
              <p>
                The Weaviate documentation is divided into the following four sections: <button className={styles.tabLink} onClick={() => handleTabClick('database')}>Core database</button>, <button className={styles.tabLink} onClick={() => handleTabClick('deployment')}>Deployment</button>, <button className={styles.tabLink} onClick={() => handleTabClick('cloud')}>Weaviate Cloud</button> and <button className={styles.tabLink} onClick={() => handleTabClick('agents')}>Weaviate Agents</button> docs.
              </p>
            </div>
            
            {/* Guideflow iframe for overview */}
            <div className={styles.iframeContainer}>
              <div>   
                <iframe      
                  id="gky9oo0u4p"      
                  src="https://app.guideflow.com/embed/gky9oo0u4p"      
                  width="100%"      
                  height="100%"      
                  style={{
                    overflow: "hidden", 
                    position: "absolute", 
                    border: "none"
                  }}      
                  scrolling="no"      
                  allow="clipboard-read; clipboard-write"      
                  webKitAllowFullScreen      
                  mozAllowFullScreen      
                  allowFullScreen      
                  allowTransparency="true"   
                />   
                <script 
                  src="https://app.guideflow.com/assets/opt.js" 
                  data-iframe-id="gky9oo0u4p"
                ></script> 
              </div>
            </div>
          </div>
        );

      case 'database':
        return (
          <div className={styles.tabContent}>
            <div className={styles.description}>
              <p>
                Learn about Weaviate's core database functionality, including vector operations, schema design, data modeling, and querying capabilities. This section covers the fundamental concepts you need to build with Weaviate.
              </p>
            </div>
            
            <div className={styles.sectionLinks}>
              <div className={styles.linkCard}>
                <h4><a href="/docs/weaviate/quickstart">🚀 Quick Start</a></h4>
                <p>Get up and running with Weaviate in minutes</p>
              </div>
              <div className={styles.linkCard}>
                <h4><a href="/docs/weaviate/concepts">💡 Core Concepts</a></h4>
                <p>Understanding vector databases and Weaviate's architecture</p>
              </div>
              <div className={styles.linkCard}>
                <h4><a href="/docs/weaviate/api">🔌 API Reference</a></h4>
                <p>Complete REST and GraphQL API documentation</p>
              </div>
              <div className={styles.linkCard}>
                <h4><a href="/docs/weaviate/tutorials">📚 Tutorials</a></h4>
                <p>Step-by-step guides and practical examples</p>
              </div>
            </div>
          </div>
        );

      case 'deployment':
        return (
          <div className={styles.tabContent}>
            <div className={styles.description}>
              <p>
                Everything you need to deploy and operate Weaviate in production. From local development to large-scale enterprise deployments across different cloud providers and on-premises environments.
              </p>
            </div>
            
            <div className={styles.sectionLinks}>
              <div className={styles.linkCard}>
                <h4><a href="/docs/deploy/installation">⚙️ Installation</a></h4>
                <p>Docker, Kubernetes, and bare metal installation guides</p>
              </div>
              <div className={styles.linkCard}>
                <h4><a href="/docs/deploy/kubernetes">☸️ Kubernetes</a></h4>
                <p>Deploy Weaviate on Kubernetes with Helm charts</p>
              </div>
              <div className={styles.linkCard}>
                <h4><a href="/docs/deploy/configuration">🔧 Configuration</a></h4>
                <p>Environment variables, security, and performance tuning</p>
              </div>
              <div className={styles.linkCard}>
                <h4><a href="/docs/deploy/monitoring">📊 Monitoring</a></h4>
                <p>Observability, metrics, and troubleshooting guides</p>
              </div>
            </div>
          </div>
        );

      case 'cloud':
        return (
          <div className={styles.tabContent}>
            <div className={styles.description}>
              <p>
                Weaviate Cloud Services (WCS) provides a fully managed vector database solution. Learn how to get started, manage clusters, and integrate with your applications using our cloud platform.
              </p>
            </div>
            
            <div className={styles.sectionLinks}>
              <div className={styles.linkCard}>
                <h4><a href="/docs/cloud/quickstart">🌟 Cloud Quick Start</a></h4>
                <p>Create your first managed Weaviate cluster</p>
              </div>
              <div className={styles.linkCard}>
                <h4><a href="/docs/cloud/authentication">🔐 Authentication</a></h4>
                <p>API keys, OIDC, and access management</p>
              </div>
              <div className={styles.linkCard}>
                <h4><a href="/docs/cloud/pricing">💰 Pricing & Plans</a></h4>
                <p>Understand billing, usage, and subscription tiers</p>
              </div>
              <div className={styles.linkCard}>
                <h4><a href="/docs/cloud/management">🎛️ Cluster Management</a></h4>
                <p>Scaling, backups, and cluster operations</p>
              </div>
            </div>
          </div>
        );

      case 'agents':
        return (
          <div className={styles.tabContent}>
            <div className={styles.description}>
              <p>
                Build intelligent AI agents with Weaviate's agent framework. Learn how to create, deploy, and manage autonomous agents that can reason, plan, and take actions using your vector data.
              </p>
            </div>
            
            <div className={styles.sectionLinks}>
              <div className={styles.linkCard}>
                <h4><a href="/docs/agents/introduction">🤖 Agent Introduction</a></h4>
                <p>Understanding AI agents and their capabilities</p>
              </div>
              <div className={styles.linkCard}>
                <h4><a href="/docs/agents/quickstart">⚡ Agent Quick Start</a></h4>
                <p>Build your first AI agent in minutes</p>
              </div>
              <div className={styles.linkCard}>
                <h4><a href="/docs/agents/tools">🛠️ Agent Tools</a></h4>
                <p>Available tools and custom tool development</p>
              </div>
              <div className={styles.linkCard}>
                <h4><a href="/docs/agents/examples">📖 Agent Examples</a></h4>
                <p>Real-world agent implementations and use cases</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={handleClose}
      className={styles.firstVisitModal}
      maxWidth="80vw"
      showCloseButton={false} // We'll use custom header
    >
      <div className={styles.modalContent}>
        {/* Custom Header with title aligned to close button */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Explore Weaviate docs</h2>
          <button 
            className={styles.customCloseButton}
            onClick={handleClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Custom Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsList}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className={styles.tabPanel}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}