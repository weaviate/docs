# #!/bin/bash
set -e

# # deploy
./node_modules/.bin/netlify deploy --prod --dir=build --site=weaviate-docs

echo "TODO: you may need to figure out GOOGLE KEYS for the sitemap"
# # Share sitemap to G
# curl https://www.google.com/ping?sitemap=https://weaviate.io/sitemap.xml