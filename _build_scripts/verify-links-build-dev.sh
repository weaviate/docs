#!/bin/bash
set -e

# OLD URL_IGNORES
# URL_IGNORES="jsonlines.org/|arxiv.org/|linkedin.com/in/|crunchbase.com|www.nytimes.com|www.researchgate.net|www.meetup.com|wiki.pathmind.com|twitter.com|towardsdatascience.com|medium.com|openai.com|www.hr-brew.com|www.battery.com|docs.cohere.com/|www.googletagmanager.com|12factor.net|github.com|github.com/weaviate/howto*|instagram.com|kaggle.com|merriam-webster.com|ai.meta.com|huggingface.co/docs/hub/model-cards|aclanthology.org/D19-1445|bib.dbvis.de|ingwb.com|opensource.org/|gpt-index.readthedocs.io|open.spotify.com/|/undefined|youtu.be|/products|reuters.com|www.image-net.org|console.aws.amazon.com|"
URL_IGNORES="openai.com|platform.openai.com|https://ai.google.dev|https://www.snowflake.com|https://www.researchgate.net|https://ai.meta.com/|https://voyageai.com/|https://simple/"
GITHUB_IGNORES="github.com"
DEV_BUILD_LINKS_TO_IGNORE="assets/files|/og/"

echo "**************************************
Starting Link Verification
PATH: ./build.dev
URL_IGNORES: ${URL_IGNORES}|${GITHUB_IGNORES}|${ASSET_FILES}
**************************************"

./node_modules/.bin/linkinator ./build.dev/ \
--recurse \
--verbosity error \
--skip "${URL_IGNORES}|${GITHUB_IGNORES}|${DEV_BUILD_LINKS_TO_IGNORE}" \
--timeout 5000 \
--retry true \
--retry-errors true \
--retry-errors-count 5 \
--retry-errors-jitter 5 \
--directory-listing true

echo "**************************************
Link Verification Complete
**************************************"