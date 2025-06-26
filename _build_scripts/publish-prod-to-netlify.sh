# #!/bin/bash
set -e

#### TODO: REMOVE 👇 BEFORE WE GO LIVE ####
# For Netlify - change robot.txt to Disallow - so that crawlers will ignore it
mv build/robots.txt build/robots.txt.live
echo -e "User-agent: *
Disallow: /" >> build/robots.txt
#### TODO: REMOVE 👆 BEFORE WE GO LIVE ####

# # deploy
./node_modules/.bin/netlify deploy --prod --dir=build --site=docs-weaviate-io

echo "TODO: you may need to figure out GOOGLE KEYS for the sitemap"
# # Share sitemap to G
# curl https://www.google.com/ping?sitemap=https://weaviate.io/sitemap.xml

#### TODO: REMOVE 👇 BEFORE WE GO LIVE ####
# Bring back the original robots.txt file
rm build/robots.txt
mv build/robots.txt.live build/robots.txt
#### TODO: REMOVE 👆 BEFORE WE GO LIVE ####