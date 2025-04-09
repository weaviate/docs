// src/components/RecipesCards/index.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "@docusaurus/router";
import CardsSection from "/src/components/CardsSection";

// Function to parse TOML data
function parseToml(tomlString) {
  try {
    // This is a simplified TOML parser focused on our specific use case
    const config = {};
    const recipes = [];

    // Extract recipe blocks
    const recipeBlocks =
      tomlString.match(/\[\[recipe\]\]([\s\S]*?)(?=\[\[recipe\]\]|$)/g) || [];

    // Extract config section
    const configMatch = tomlString.match(
      /\[config\]([\s\S]*?)(?=\[\[recipe\]\]|$)/
    );
    if (configMatch) {
      const configLines = configMatch[1].trim().split("\n");
      configLines.forEach((line) => {
        if (line.trim() && line.includes("=")) {
          const [key, value] = line.split("=").map((part) => part.trim());
          // Remove quotes if present
          config[key] = value.replace(/^["'](.*)["']$/, "$1");
        }
      });
    }

    // Process each recipe block
    recipeBlocks.forEach((block) => {
      const recipe = {};
      const lines = block.trim().split("\n");

      lines.forEach((line) => {
        if (line.trim() && !line.includes("[[recipe]]") && line.includes("=")) {
          const [key, rawValue] = line.split("=").map((part) => part.trim());

          // Handle arrays (like tags)
          if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
            const items = rawValue.slice(1, -1).split(",");
            recipe[key] = items.map((item) =>
              item.trim().replace(/^["'](.*)["']$/, "$1")
            );
          }
          // Handle booleans
          else if (rawValue === "true" || rawValue === "false") {
            recipe[key] = rawValue === "true";
          }
          // Handle strings
          else {
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
  // Remove /docs/ prefix if present
  const cleanPath = path.replace(/^\/docs\//, "");
  // Get first segment
  const segments = cleanPath.split("/");
  return segments[0];
}

export default function RecipesCards({ path }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [cardsData, setCardsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use provided path or current path as fallback
  const directoryPath = path || currentPath;

  // Extract path category for filtering
  const pathCategory = extractPathCategory(directoryPath);

  useEffect(() => {
    async function loadIndexToml() {
      try {
        setLoading(true);

        // The index.toml file is in static/docs/
        const indexPath = "/docs/index.toml";

        console.log("Attempting to fetch index.toml from:", indexPath);
        console.log("Current path category for filtering:", pathCategory);

        // Fetch the index.toml file
        const response = await fetch(indexPath);
        console.log("Fetch response status:", response.status);

        if (!response.ok) {
          throw new Error(
            `Failed to load index.toml: ${response.status} ${response.statusText}`
          );
        }

        const tomlContent = await response.text();
        console.log(
          "TOML content first 100 chars:",
          tomlContent.substring(0, 100)
        );

        const { config, recipes } = parseToml(tomlContent);
        console.log("Parsed config:", config);
        console.log("Found recipes:", recipes.length);

        // Filter recipes based on the provided path category
        // This allows us to use a single index.toml file for all directories
        const filteredRecipes = recipes.filter((recipe) => {
          if (!recipe.notebook) return false;

          // Get recipe category based on properties
          let recipeCategory;
          if (recipe.agent === true) {
            recipeCategory = "agents";
          } else if (recipe.integration === true) {
            recipeCategory = "integrations";
          } else {
            recipeCategory = "weaviate";
          }

          console.log(
            `Recipe "${recipe.title}" category: ${recipeCategory}, current path category: ${pathCategory}`
          );

          // Match recipe category with current path category
          return (
            pathCategory === recipeCategory ||
            pathCategory === recipeCategory.replace("-", "")
          );
        });

        console.log(
          `Filtered to ${filteredRecipes.length} recipes for category ${pathCategory}`
        );

        // Map recipes to card format
        const cards = filteredRecipes.map((recipe) => {
          // Get notebook path and create appropriate link
          const notebookPath = recipe.notebook;

          // Extract the notebook name without extension to create a path
          const notebookName = notebookPath
            .split("/")
            .pop()
            .replace(".ipynb", "");

          // Create link to the doc page based on the notebook path
          const link = `${directoryPath}${
            directoryPath.endsWith("/") ? "" : "/"
          }${notebookName}`;

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

        setCardsData(cards);
      } catch (err) {
        console.error("Error loading index.toml:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadIndexToml();
  }, [directoryPath, pathCategory]);

  if (loading) {
    return <p>Loading recipes...</p>;
  }

  if (error) {
    return (
      <div>
        <p>Error loading recipes: {error}</p>
        <p>
          Make sure you have an index.toml file at:{" "}
          <code>/static/docs/index.toml</code> in your project.
        </p>
      </div>
    );
  }

  return (
    <div>
      {cardsData.length === 0 ? (
        <div>
          <p>No recipes found for category: {pathCategory}</p>
          <p>
            Make sure your index.toml file contains properly formatted recipe
            entries that match this category.
          </p>
        </div>
      ) : (
        <>
          <br />
          <CardsSection items={cardsData} recipeCards={true} />
          <br />
        </>
      )}
    </div>
  );
}
