#!/bin/bash
set -e

# Get test status and duration from environment
TEST_STATUS=${TEST_STATUS:-"unknown"}
TEST_DURATION=${TEST_DURATION:-"unknown"}
AUTHOR_NAME=${AUTHOR_NAME:-"unknown"}
TEST_TOTAL=${TEST_TOTAL:-"0"}
TEST_PASSED=${TEST_PASSED:-"0"}
TEST_FAILED=${TEST_FAILED:-"0"}
TEST_SKIPPED=${TEST_SKIPPED:-"0"}

# Set emoji and message based on test status
if [ "$TEST_STATUS" = "success" ]; then
    STATUS_TEXT="✅ PASSED"
    COLOR="good"
else
    STATUS_TEXT="❌ FAILED"
    COLOR="danger"
fi

# Build test results summary
if [ "$TEST_TOTAL" != "0" ]; then
    RESULTS_VALUE="✅ ${TEST_PASSED} passed"
    if [ "$TEST_FAILED" != "0" ]; then
        RESULTS_VALUE="${RESULTS_VALUE}, ❌ ${TEST_FAILED} failed"
    fi
    if [ "$TEST_SKIPPED" != "0" ]; then
        RESULTS_VALUE="${RESULTS_VALUE}, ⏭️ ${TEST_SKIPPED} skipped"
    fi
    RESULTS_VALUE="${RESULTS_VALUE} (${TEST_TOTAL} total)"
else
    RESULTS_VALUE="No test results found"
fi

# Get workflow URL
WORKFLOW_URL="https://github.com/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"
branch_name=${GITHUB_REF##*/}

MESSAGE="{
  'text': '*Docs Indexability Tests - $STATUS_TEXT* - $AUTHOR_NAME',
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
          'title': 'Results',
          'value': '$RESULTS_VALUE',
          'short': false
        },
        {
          'title': 'Duration',
          'value': '$TEST_DURATION',
          'short': true
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
