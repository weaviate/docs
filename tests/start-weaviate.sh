#!/bin/bash

# Retry each compose file so a transient image pull error does not leave
# containers missing. Fail here if a file still does not come up.
compose_up() {
  local file="$1"
  local delay
  for delay in 10 30 0; do
    if nohup docker compose -f "$file" up -d; then
      return 0
    fi
    if [ "$delay" -gt 0 ]; then
      echo "docker compose up failed for $file, retrying in ${delay}s..."
      sleep "$delay"
    fi
  done
  echo "ERROR: docker compose up failed for $file after 3 attempts" >&2
  exit 1
}

echo "Run Docker compose"
compose_up ./tests/docker-compose.yml
compose_up ./tests/docker-compose-rbac.yml
compose_up ./tests/docker-compose-anon.yml
compose_up ./tests/docker-compose-anon-2.yml
compose_up ./tests/docker-compose-anon-clip.yml
compose_up ./tests/docker-compose-three-nodes.yml

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
