#!/bin/bash
# Find environment variables that exist in code but aren't documented
# Usage: ./find-undocumented-env-vars.sh path/to/env-vars-list.csv

if [ $# -eq 0 ]; then
    echo "Usage: $0 <path-to-env-vars-list.csv>"
    echo "Example: $0 ../weaviate/env-vars-list.csv"
    exit 1
fi

CSV_FILE="$1"

if [ ! -f "$CSV_FILE" ]; then
    echo "Error: File '$CSV_FILE' not found"
    exit 1
fi

# Directories to search
SEARCH_DIRS="docs _includes"

echo "Checking which env vars from $CSV_FILE are not documented..."
echo "Searching in: $SEARCH_DIRS"
echo ""
echo "UNDOCUMENTED ENV VARS:"
echo "====================="

# Skip header line, extract env var names, and check if they appear in docs
tail -n +2 "$CSV_FILE" | cut -d',' -f1 | sort -u | while read -r env_var; do
    # Skip empty lines
    [ -z "$env_var" ] && continue

    # Search for the env var in the specified directories
    # Use -F for literal string matching, -w for word boundaries
    # Use -q for quiet (just exit status), -r for recursive
    if ! grep -rqFw "$env_var" $SEARCH_DIRS 2>/dev/null; then
        echo "$env_var"
    fi
done

echo ""
echo "Done! These env vars appear in code but not in docs."
