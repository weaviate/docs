#!/bin/bash

# This script starts all Weaviate instances defined in docker-compose files
# in the tests/ directory and waits for them to become ready.

set -e # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
COMPOSE_DIR="tests"
TIMEOUT_SECONDS=300 # 5 minutes
CHECK_INTERVAL_SECONDS=5

# --- Find and Parse Compose Files ---
echo "Finding and parsing docker-compose files in '$COMPOSE_DIR'..."
COMPOSE_FILES=$(find "$COMPOSE_DIR" -name 'docker-compose*.yml')
HOST_PORTS=()

for file in $COMPOSE_FILES; do
    # Start the services defined in the file
    echo "Starting services from $file..."
    docker compose -f "$file" up -d

    # Parse the host port mapped to container port 8080
    # Look for patterns like "8080:8080" or "- 8080:8080" or "- "8080:8080""
    port=$(grep -E '^\s*-?\s*"?[0-9]+:8080"?' "$file" | head -1 | sed -E 's/.*"?([0-9]+):8080"?.*/\1/' | tr -d '[:space:]')

    if [[ -n "$port" && "$port" =~ ^[0-9]+$ ]]; then
        echo "Found service in $file on host port: $port"
        HOST_PORTS+=("$port")
    fi
done

# Remove duplicate ports and filter out empty strings
UNIQUE_HOST_PORTS=($(echo "${HOST_PORTS[@]}" | tr ' ' '\n' | sort -u | tr '\n' ' ' | xargs))

if [ ${#UNIQUE_HOST_PORTS[@]} -eq 0 ]; then
    echo "Error: No Weaviate services with exposed ports found."
    exit 1
fi

echo "Found ${#UNIQUE_HOST_PORTS[@]} unique Weaviate instances to check."
echo "Ports to check: ${UNIQUE_HOST_PORTS[*]}"

# --- Wait for All Services to be Ready ---
start_time=$(date +%s)

for port in "${UNIQUE_HOST_PORTS[@]}"; do
    echo "--- Waiting for Weaviate on port $port to be ready... ---"
    while true; do
        current_time=$(date +%s)
        elapsed_time=$((current_time - start_time))

        if [ $elapsed_time -ge $TIMEOUT_SECONDS ]; then
            echo "Error: Timeout reached waiting for Weaviate on port $port."
            exit 1
        fi

        # Use curl to check the readiness endpoint.
        echo "Checking http://localhost:$port/v1/.well-known/ready"
        if curl -sf -o /dev/null "http://localhost:$port/v1/.well-known/ready"; then
            echo "Weaviate on port $port is ready!"
            break # Exit the while loop for this port
        else
            echo "Weaviate on port $port is not ready yet (curl exit code: $?). Retrying in $CHECK_INTERVAL_SECONDS seconds..."
            # Optional: show what containers are running
            echo "Current containers:"
            docker ps --filter "publish=$port"
            sleep $CHECK_INTERVAL_SECONDS
        fi
    done
done

echo "All Weaviate instances are up and ready."
