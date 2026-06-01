#!/bin/bash

echo "Run Docker compose"
nohup docker compose -f ./tests/docker-compose.yml up -d
nohup docker compose -f ./tests/docker-compose-rbac.yml up -d
nohup docker compose -f ./tests/docker-compose-anon.yml up -d
nohup docker compose -f ./tests/docker-compose-anon-2.yml up -d
nohup docker compose -f ./tests/docker-compose-anon-clip.yml up -d
nohup docker compose -f ./tests/docker-compose-three-nodes.yml up -d
nohup docker compose -f ./tests/docker-compose-namespaces.yml up -d

# Provision Keycloak (realm, client, users) so OIDC-based tests can fetch tokens.
echo "Waiting for Keycloak (http://localhost:8081)..."
for i in {1..60}; do
  if curl -fsS -o /dev/null "http://localhost:8081/realms/master"; then
    echo "Keycloak is ready"
    break
  fi
  sleep 2
done

echo "Provisioning Keycloak realm/client/users..."
uv run python _includes/code/python/keycloak_helper_script.py || \
  echo "Keycloak provisioning failed (OIDC tests may fail)"
