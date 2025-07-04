#!/bin/bash
set -e

# Get commit message
echo "0" $GITHUB_SHA
git_hash=$(echo "$GITHUB_SHA" | cut -c1-7)
echo "1" $git_hash
commit_message="$(git log -1 $git_hash --pretty="%s")"
echo "2" $commit_message

# Replace &, <, and > – as per Slack API instructions
commit_message=${commit_message//&/&amp;}
commit_message=${commit_message//</&lt;}
commit_message=${commit_message//>/&gt;}
echo "3" $commit_message

# Extract Netlify URL
NETLIFY_LOC=$(grep -r 'Website draft URL:' netlify.out)
NETLIFY_URL=$(echo ${NETLIFY_LOC:20})

# echo "---|" $NETLIFY_URL "|---"

# Prepare the message and send it to Slack
branch_name=${GITHUB_REF##*/}
MESSAGE="{'text': ':construction: Hey $AUTHOR_NAME - your :docusaurus: :weaviate-logo: website build (<https://github.com/weaviate/docs/tree/$branch_name|$branch_name>) is ready on Netlify:\n $NETLIFY_URL/docs/weaviate \n> $commit_message' }"

echo $MESSAGE > payload_netlify.json

# Send the slack message
curl -X POST -H 'Content-type: application/json' -d @payload_netlify.json https://hooks.slack.com/services/$SLACK_BOT
