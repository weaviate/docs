#!/bin/bash
set -e

# Inputs (set by the handle-test-results action)
TEST_STATUS=${TEST_STATUS:-"unknown"}
TEST_DURATION=${TEST_DURATION:-"unknown"}
TEST_TYPE=${TEST_TYPE:-"unknown"}
LANGUAGES_TESTED=${LANGUAGES_TESTED:-""}
SCOPE_LABEL=${SCOPE_LABEL:-"Languages Tested"}
AUTHOR_NAME=${AUTHOR_NAME:-"unknown"}
TEST_TOTAL=${TEST_TOTAL:-0}
TEST_PASSED=${TEST_PASSED:-0}
TEST_FAILED=${TEST_FAILED:-0}
TEST_SKIPPED=${TEST_SKIPPED:-0}

# Status visuals
if [ "$TEST_STATUS" = "success" ]; then
    STATUS_TEXT="✅ PASSED"
    COLOR="good"
else
    STATUS_TEXT="❌ FAILED"
    COLOR="danger"
fi

WORKFLOW_URL="https://github.com/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"
branch_name=${GITHUB_REF##*/}

# Build optional fields conditionally so we don't print "unknown" or empty values
EXTRA_FIELDS=""

# Scope field (default "Languages Tested") — hidden when value is empty or "unknown"
if [ -n "$LANGUAGES_TESTED" ] && [ "$LANGUAGES_TESTED" != "unknown" ]; then
  EXTRA_FIELDS+="    ,{
      'title': '$SCOPE_LABEL',
      'value': '$LANGUAGES_TESTED',
      'short': true
    }"
fi

# Results field — shown whenever JUnit XML produced a non-zero test count
if [ "$TEST_TOTAL" -gt 0 ] 2>/dev/null; then
  RESULTS_VALUE="${TEST_PASSED} passed"
  if [ "$TEST_FAILED" -gt 0 ] 2>/dev/null; then
    RESULTS_VALUE+=" · ${TEST_FAILED} failed"
  fi
  if [ "$TEST_SKIPPED" -gt 0 ] 2>/dev/null; then
    RESULTS_VALUE+=" · ${TEST_SKIPPED} skipped"
  fi
  EXTRA_FIELDS+="    ,{
      'title': 'Results',
      'value': '$RESULTS_VALUE',
      'short': true
    }"
fi

MESSAGE="{
  'text': '*Docs Code Tests - $STATUS_TEXT* - $AUTHOR_NAME',
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
          'title': 'Type',
          'value': '$TEST_TYPE',
          'short': true
        },
        {
          'title': 'Duration',
          'value': '$TEST_DURATION',
          'short': true
        }
$EXTRA_FIELDS
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
