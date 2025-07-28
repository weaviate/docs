#!/bin/bash
set -e

# Get commit info
git_hash=$(echo "$GITHUB_SHA" | cut -c1-7)
commit_message="$(git log -1 $git_hash --pretty="%s")"

# Replace &, <, and > for Slack
commit_message=${commit_message//&/&amp;}
commit_message=${commit_message//</&lt;}
commit_message=${commit_message//>/&gt;}

# Get test status and duration from environment
TEST_STATUS=${TEST_STATUS:-"unknown"}
TEST_DURATION=${TEST_DURATION:-"unknown"}

# Set emoji and message based on test status
if [ "$TEST_STATUS" = "success" ]; then
    EMOJI=":white_check_mark:"
    STATUS_TEXT="✅ PASSED"
    COLOR="good"
else
    EMOJI=":x:"
    STATUS_TEXT="❌ FAILED"
    COLOR="danger"
fi

# Get workflow URL
WORKFLOW_URL="https://github.com/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"
branch_name=${GITHUB_REF##*/}

# Simple message format
MESSAGE="{
  'text': '$EMOJI *Documentation Code Tests - Weekly $STATUS_TEXT*',
  'channel': '#docs-workflow-updates',
  'attachments': [
    {
      'color': '$COLOR',
      'fields': [
        {
          'title': 'Repository',
          'value': '<https://github.com/$GITHUB_REPOSITORY|$GITHUB_REPOSITORY>',
          'short': true
        },
        {
          'title': 'Branch', 
          'value': '<https://github.com/$GITHUB_REPOSITORY/tree/$branch_name|$branch_name>',
          'short': true
        },
        {
          'title': 'Duration',
          'value': '$TEST_DURATION',
          'short': true
        },
        {
          'title': 'Commit',
          'value': '\`$git_hash\` $commit_message',
          'short': false
        }
      ],
      'actions': [
        {
          'type': 'button',
          'text': 'View Workflow',
          'url': '$WORKFLOW_URL'
        }
      ]
    }
  ]
}"

echo $MESSAGE > payload_test_results.json

# Send to Slack
curl -X POST -H 'Content-type: application/json' -d @payload_test_results.json https://hooks.slack.com/services/$SLACK_BOT
