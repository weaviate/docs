// src/components/DirectoryCards.js
import React from 'react';
import { useActivePlugin, useAllDocsData } from '@docusaurus/plugin-content-docs/client';
import { useLocation } from '@docusaurus/router';
import CardsSection from "/src/components/CardsSection";

export default function DirectoryCards({ path }) {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Use provided path or current path as fallback
  const directoryPath = path || currentPath;
  
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
  console.log(docsData.versions[currentVersion])
  console.log('Full structure of allDocs:', JSON.stringify(allDocs, null, 2)); 

  // Find all docs that are direct children of the specified directory
  const directoryDocs = Object.values(allDocs).filter(doc => {
    // Skip if there's no path
    if (!doc?.path) return false;
    
    // Skip the current page itself
    if (doc.path === currentPath) return false;
    
    // Skip the directory index page itself
    if (doc.path === directoryPath) return false;
    
    // Check if this is a direct child of the specified directory path
    const normalizedDirPath = directoryPath.endsWith('/') ? directoryPath : directoryPath + '/';
    
    // A direct child starts with the directory path and doesn't have additional slashes
    if (!doc.path.startsWith(normalizedDirPath)) return false;
    
    const remainingPath = doc.path.substring(normalizedDirPath.length);
    return !remainingPath.includes('/');
  });
  
  // Function to extract title from frontmatter or metadata
  function extractTitle(doc) {
    // Check for frontmatter title first (explore all possible locations)
    if (doc.frontMatter && doc.frontMatter.title) {
      return doc.frontMatter.title;
    }
    
    // Try to find title in metadata (Docusaurus 2.0+ style)
    if (doc.title) {
      return doc.title;
    }
    
    // Try other possible locations for the title
    if (doc.metadata && doc.metadata.title) {
      return doc.metadata.title;
    }
    
    // If we have source available, try to extract title from there
    if (doc.source) {
      const frontmatterMatch = doc.source.match(/---[\s\S]*?title:\s*["']?(.*?)["']?[\s\n][\s\S]*?---/);
      if (frontmatterMatch && frontmatterMatch[1]) {
        return frontmatterMatch[1];
      }
    }
    
    // Last resort: use path
    const pathParts = doc.path.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // Convert slug to title case
    return lastPart
      .replace(/-/g, ' ')
      .replace(/_/g, ' ') // Also replace underscores with spaces
      .replace(/\b\w/g, c => c.toUpperCase());
  }
  
  // Map docs to the format expected by CardsSection
  const cardsData = directoryDocs.map(doc => {
    // Show detailed document structure in console for debugging
    console.log('Document structure:', JSON.stringify(doc, null, 2));
    
    return {
      title: extractTitle(doc),
      description: doc.description || doc.frontMatter?.description || " ",
      link: doc.path,
    };
  });
  
  return (
    <div>
      {cardsData.length === 0 ? (
        <p>No documents found in directory: {directoryPath}</p>
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