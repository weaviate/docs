// src/components/RecipesCards/index.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "@docusaurus/router";
import CardsSection from "/src/components/CardsSection";
import styles from "./styles.module.css"; // Import CSS Modules for styling

// --- Helper Functions (parseToml, extractPathCategory - Keep as they are) ---
// Function to parse TOML data (simplified)
function parseToml(tomlString) {
  try {
    const config = {};
    const recipes = [];
    const recipeBlocks =
      tomlString.match(/\[\[recipe\]\]([\s\S]*?)(?=\[\[recipe\]\]|$)/g) || [];
    const configMatch = tomlString.match(
      /\[config\]([\s\S]*?)(?=\[\[recipe\]\]|$)/
    );

    if (configMatch) {
      const configLines = configMatch[1].trim().split("\n");
      configLines.forEach((line) => {
        if (line.trim() && line.includes("=")) {
          const [key, value] = line.split("=").map((part) => part.trim());
          config[key] = value.replace(/^["'](.*)["']$/, "$1");
        }
      });
    }

    recipeBlocks.forEach((block) => {
      const recipe = {};
      const lines = block.trim().split("\n");
      lines.forEach((line) => {
        if (line.trim() && !line.includes("[[recipe]]") && line.includes("=")) {
          const [key, rawValue] = line.split("=").map((part) => part.trim());
          if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
            const items = rawValue.slice(1, -1).split(",");
            recipe[key] = items
              .map((item) => item.trim().replace(/^["'](.*)["']$/, "$1"))
              .filter((tag) => tag); // Ensure tags are not empty strings
          } else if (rawValue === "true" || rawValue === "false") {
            recipe[key] = rawValue === "true";
          } else {
            recipe[key] = rawValue.replace(/^["'](.*)["']$/, "$1");
          }
        }
      });
      if (Object.keys(recipe).length > 0) {
        recipes.push(recipe);
      }
    });
    return { config, recipes };
  } catch (error) {
    console.error("Error parsing TOML:", error);
    return { config: {}, recipes: [] };
  }
}

// Function to extract key segments from path
function extractPathCategory(path) {
  const cleanPath = path.replace(/^\/docs\//, "");
  const segments = cleanPath.split("/");
  return segments[0];
}

// --- Main Component ---

export default function RecipesCards({ path }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [allCardsData, setAllCardsData] = useState([]); // Stores ALL cards for the category
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allTags, setAllTags] = useState([]); // Stores all unique tags
  const [selectedTags, setSelectedTags] = useState(new Set()); // Stores selected tags, START EMPTY

  const directoryPath = path || currentPath;
  const pathCategory = extractPathCategory(directoryPath);

  useEffect(() => {
    async function loadIndexToml() {
      try {
        setLoading(true);
        setError(null);
        const indexPath = "/docs/config/index.toml";

        console.log("Attempting to fetch index.toml from:", indexPath);
        console.log("Current path category for filtering:", pathCategory);

        const response = await fetch(indexPath);
        console.log("Fetch response status:", response.status);

        if (!response.ok) {
          throw new Error(
            `Failed to load index.toml: ${response.status} ${response.statusText}`
          );
        }

        const tomlContent = await response.text();
        const { config, recipes } = parseToml(tomlContent);
        console.log("Parsed config:", config);
        console.log("Found recipes:", recipes.length);

        const filteredRecipes = recipes.filter((recipe) => {
          if (!recipe.notebook) return false;
          let recipeCategory;
          if (recipe.agent === true) recipeCategory = "agents";
          else if (recipe.integration === true) recipeCategory = "integrations";
          else recipeCategory = "weaviate"; // Default or base category

          const normalizedPathCategory = pathCategory.replace(/\/$/, "");

          // Match recipe category with current path category (allow for plurals like 'agent' vs 'agents')
          return (
            normalizedPathCategory === recipeCategory ||
            normalizedPathCategory === recipeCategory.replace(/s$/, "") || // Handle singular vs plural
            `${normalizedPathCategory}s` === recipeCategory
          );
        });

        console.log(
          `Filtered to ${filteredRecipes.length} recipes for category ${pathCategory}`
        );

        const uniqueTags = new Set();
        const cards = filteredRecipes.map((recipe) => {
          const notebookPath = recipe.notebook;
          const notebookName = notebookPath
            .split("/")
            .pop()
            .replace(".ipynb", "");
          const link = `${directoryPath.replace(/\/$/, "")}/${notebookName}`; // Ensure single slash

          (recipe.tags || []).forEach((tag) => {
            if (tag) uniqueTags.add(tag);
          });

          return {
            title: recipe.title,
            description: recipe.description || "",
            link: link,
            tags: recipe.tags || [],
            featured: recipe.featured || false,
            agent: recipe.agent || false,
            integration: recipe.integration || false,
          };
        });

        const sortedTags = Array.from(uniqueTags).sort();

        setAllCardsData(cards);
        setAllTags(sortedTags);
        setSelectedTags(new Set()); // Initialize with NO tags selected
      } catch (err) {
        console.error("Error loading index.toml:", err);
        setError(err.message);
        setAllCardsData([]);
        setAllTags([]);
        setSelectedTags(new Set());
      } finally {
        setLoading(false);
      }
    }

    loadIndexToml();
  }, [directoryPath, pathCategory]);

  // --- Tag Handling ---
  const handleTagClick = (tag) => {
    setSelectedTags((prevSelectedTags) => {
      const newSelectedTags = new Set(prevSelectedTags);
      if (newSelectedTags.has(tag)) {
        newSelectedTags.delete(tag);
      } else {
        newSelectedTags.add(tag);
      }
      return newSelectedTags;
    });
  };

  // --- Filtering Logic ---
  const filteredCards = useMemo(() => {
    // *** CHANGE HERE: If no tags are selected, show ALL cards ***
    if (selectedTags.size === 0) {
      return allCardsData;
    }

    // Otherwise, filter: show a card if it has at least one selected tag
    return allCardsData.filter((card) =>
      card.tags.some((tag) => selectedTags.has(tag))
    );
  }, [allCardsData, selectedTags]); // Dependencies: Recalculate when base data or selection changes

  // --- Rendering ---

  if (loading) {
    return <div>Loading recipes...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error loading recipes: {error}</p>
        <p>
          Make sure you have an index.toml file at:{" "}
          <code>/static/config/index.toml</code> and it's correctly formatted.
        </p>
      </div>
    );
  }

  if (allCardsData.length === 0 && !loading) {
    // Check !loading to avoid brief flash
    return (
      <div>
        <p>No recipes found for category: "{pathCategory}"</p>
        <p>
          Check if <code>/static/config/index.toml</code> contains recipe entries
          matching this category.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Tag Filter Section */}
      {allTags.length > 0 && (
        <div className={styles.tagContainer}>
          <span className={styles.tagLabel}>Filter by tag:</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              // Style depends only on whether the tag is in the set
              className={`${styles.tagButton} ${
                selectedTags.has(tag) ? styles.tagSelected : ""
              }`}
              aria-pressed={selectedTags.has(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <br />

      {/* Cards Section */}
      {/* Show message only if tags ARE selected, but result is empty */}
      {filteredCards.length === 0 && selectedTags.size > 0 && (
        <p>No recipes match the selected tags.</p>
      )}

      {/* Render cards if there are any matching the filter (or all, if no filter active) */}
      {filteredCards.length > 0 && (
        <CardsSection items={filteredCards} recipeCards={true} />
      )}

      <br />
    </div>
  );
}
