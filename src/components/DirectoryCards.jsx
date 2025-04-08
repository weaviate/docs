// src/components/DirectoryCards.js
import React from 'react';
import { useLocation } from '@docusaurus/router';
import { useActivePlugin, useAllDocsData } from '@docusaurus/plugin-content-docs/client';
import CardsSection from "/src/components/CardsSection";

export default function DirectoryCards() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Get the active docs plugin
  const activePlugin = useActivePlugin();
  
  // If no active plugin, we can't proceed
  if (!activePlugin) {
    return <p>No docs plugin data available for this page.</p>;
  }
  
  // Get all docs data for the active plugin
  const allDocsData = useAllDocsData();
  const docsData = allDocsData[activePlugin.pluginId];
  
  // If we don't have docs data, we can't proceed
  if (!docsData) {
    return <p>No docs data available for this plugin: {activePlugin.pluginId}</p>;
  }
  
  // Extract the version name (usually "default" or a version number)
  const versions = Object.keys(docsData.versions);
  const currentVersion = versions[0]; // Using the first version, typically "default"
  
  // Get all docs from the current version
  const allDocs = docsData.versions[currentVersion]?.docs || {};
  
  // CORRECTED: Since index.mdx is at /docs/weaviate/recipes/, we should look for
  // siblings that are directly in this directory, not in the parent
  
  // Find all docs that are direct children of the current directory
  const siblingDocs = Object.values(allDocs).filter(doc => {
    // Skip if there's no path
    if (!doc?.path) return false;
    
    // Skip the current page itself
    if (doc.path === currentPath) return false;
    
    // Check if this is in the same directory
    // For a page at /docs/weaviate/recipes, we want pages like:
    // /docs/weaviate/recipes/page1, /docs/weaviate/recipes/page2, etc.
    return doc.path.startsWith(currentPath.endsWith('/') ? currentPath : currentPath + '/');
  });
  
  // Map docs to the format expected by CardsSection
  const cardsData = siblingDocs.map(doc => ({
    title: doc.title || 'Unnamed Document',
    description: doc.description || " ",
    link: doc.path,
  }));
  
  return (
    <div>
      <details>
        <summary>Debug Information (click to expand)</summary>
        <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px', border: '1px solid #ccc', padding: '10px', margin: '10px 0', backgroundColor: '#f5f5f5' }}>
          <p>Current Path: {currentPath}</p>
          <p>Active Plugin: {activePlugin?.pluginId}</p>
          <p>Versions Available: {versions.length}</p>
          <p>Current Version: {currentVersion}</p>
          <p>Total Docs: {Object.keys(allDocs).length}</p>
          <p>Sibling Docs Found: {siblingDocs.length}</p>
          <p>Sibling Docs: {JSON.stringify(siblingDocs.map(doc => ({
            title: doc.title,
            path: doc.path
          })), null, 2)}</p>
        </div>
      </details>
      
      {cardsData.length === 0 ? (
        <p>No other documents found in this section.</p>
      ) : (
        <>
          <br />
          <CardsSection items={cardsData} />
          <br />
        </>
      )}
    </div>
  );
}