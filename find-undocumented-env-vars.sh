#!/bin/bash
# Find environment variables that exist in Weaviate code but aren't documented
# This script:
#   1. Extracts env vars from the Weaviate codebase
#   2. Checks which ones are not documented in this docs repo
#
# Usage: ./find-undocumented-env-vars.sh <path-to-weaviate-repo>
# Example: ./find-undocumented-env-vars.sh ../weaviate

if [ $# -eq 0 ]; then
    echo "Usage: $0 <path-to-weaviate-repo>"
    echo "Example: $0 ../weaviate"
    exit 1
fi

WEAVIATE_REPO="$1"

if [ ! -d "$WEAVIATE_REPO" ]; then
    echo "Error: Directory '$WEAVIATE_REPO' not found"
    exit 1
fi

# Directories to search in docs repo
SEARCH_DIRS="docs _includes"

echo "Step 1: Extracting env vars from Weaviate repo..."
echo "==========================================="

# Extract env vars from Weaviate repo (same logic as env-vars-audit.sh)
# NOTE: Only catches string literal patterns like os.Getenv("VAR") and os.Getenv(`VAR`)
# Will NOT catch variables like os.Getenv(varName)
ENV_VARS=$(cd "$WEAVIATE_REPO" && {
  # Pattern 1: Double-quoted strings
  grep -rnoE 'os\.(Getenv|LookupEnv)\("[^"]+"\)' --include="*.go" --exclude-dir={vendor,test,node_modules,.git} . | while IFS=: read -r file line match; do
    env_var=$(echo "$match" | sed -E 's/os\.(Getenv|LookupEnv)\("([^"]+)"\)/\2/')
    if [ -n "$env_var" ]; then
      echo "$env_var"
    fi
  done

  # Pattern 2: Backtick/raw strings
  grep -rnoE 'os\.(Getenv|LookupEnv)\(`[^`]+`\)' --include="*.go" --exclude-dir={vendor,test,node_modules,.git} . | while IFS=: read -r file line match; do
    env_var=$(echo "$match" | sed -E 's/os\.(Getenv|LookupEnv)\(`([^`]+)`\)/\2/')
    if [ -n "$env_var" ]; then
      echo "$env_var"
    fi
  done
} | sort -u)

TOTAL_COUNT=$(echo "$ENV_VARS" | wc -l | tr -d ' ')
echo "Found $TOTAL_COUNT unique environment variables"
echo ""

echo "Step 2: Checking which are undocumented..."
echo "==========================================="
echo "Searching in: $SEARCH_DIRS"
echo ""
echo "UNDOCUMENTED ENV VARS:"
echo "====================="

UNDOCUMENTED=0
echo "$ENV_VARS" | while read -r env_var; do
    # Skip empty lines
    [ -z "$env_var" ] && continue

    # Search for the env var in the specified directories
    # Use -F for literal string matching, -w for word boundaries
    # Use -q for quiet (just exit status), -r for recursive
    if ! grep -rqFw "$env_var" $SEARCH_DIRS 2>/dev/null; then
        echo "$env_var"
        UNDOCUMENTED=$((UNDOCUMENTED + 1))
    fi
done

echo ""
echo "Done! These env vars appear in code but not in docs."
