#!/bin/bash
set -e

# Trunctate branch names since netifly label is too long for DNS
BR_NAME=$(cat .git/HEAD | cut -c 17-49)

./node_modules/.bin/netlify deploy --dir=build --alias ${BR_NAME} --site=docs-weaviate-io > netlify.out
