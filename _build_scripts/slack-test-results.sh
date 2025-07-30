#!/bin/bash
set -e

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
