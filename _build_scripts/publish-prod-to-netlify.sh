#!/bin/bash
set -e

# Make sure crawlers are allowed
rm build/robots.txt
mv build/robots.txt.live build/robots.txt

# Deploy to Netlify
./node_modules/.bin/netlify deploy --prod --dir=build --site=docs-weaviate-io

# Share sitemap to Google
curl https://www.google.com/ping?sitemap=https://docs.weaviate.io/sitemap.xml
