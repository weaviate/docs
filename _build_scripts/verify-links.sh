#!/bin/bash
set -e
set -o errexit # stop script immediately on error

# URL_IGNORES="jsonlines.org/|arxiv.org/|linkedin.com/in/|crunchbase.com|www.nytimes.com|www.researchgate.net|www.meetup.com|wiki.pathmind.com|x.com|towardsdatascience.com|medium.com|openai.com|www.hr-brew.com|www.battery.com|docs.cohere.com/|www.googletagmanager.com|12factor.net|github.com|github.com/weaviate/howto*|instagram.com|kaggle.com|merriam-webster.com|ai.meta.com|huggingface.co/docs/hub/model-cards|aclanthology.org/D19-1445|bib.dbvis.de|ingwb.com|opensource.org/|gpt-index.readthedocs.io|open.spotify.com/|/undefined|youtu.be|/products|reuters.com|www.image-net.org|console.aws.amazon.com|"
URL_IGNORES="https://x.com|https://openai.com|https://platform.openai.com|https://aistudio.google.com|https://ai.google.dev|https://www.snowflake.com|https://www.researchgate.net|https://ai.meta.com/|https://voyageai.com/|https://simple/"
DOCUSAURUS_IGNORES="github.com/weaviate/docs"
# Note #1 github.com/weaviate/docs/tree/ - is for edit on github links

# Extract Netlify URL
# NETLIFY_LOC=$(grep -r 'Website draft URL:' netlify.out)
# NETLIFY_URL=$(echo ${NETLIFY_LOC:20})
NETLIFY_URL="https://netlify-deploy--weaviate-docs.netlify.app"

echo "**************************************
Starting Link Verification
PATH: ${NETLIFY_URL}
URL_IGNORES: ${URL_IGNORES}|${DOCUSAURUS_IGNORES}
**************************************"

# TODO: when we go live replace weaviate-docs.netlify.app with weaviate.io

./node_modules/.bin/linkinator ${NETLIFY_URL} \
--recurse \
--skip "${URL_IGNORES}|${DOCUSAURUS_IGNORES}" \
--timeout 4000 \
--verbosity error \
--url-rewrite-search "https://weaviate-docs.netlify.app" \
--url-rewrite-replace "${NETLIFY_URL}" \
--retry true \
--retry-errors true \
--retry-errors-count 2 \
--retry-errors-jitter 5

# USE search/replace to test validity of links on Nelify, as they might not yet exist on weaviate.io

echo "**************************************
Link Verification Complete
**************************************"