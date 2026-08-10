/**
 * Fetches benchmark results from the remote Weaviate cluster and writes
 * a static JSON file for the VibeEvalDashboard component.
 *
 * Usage:
 *   node tools/fetch-vibe-eval-results.js
 *
 * Required env vars:
 *   WEAVIATE_VIBE_EVAL_URL  - Weaviate cluster URL (e.g. https://xxx.weaviate.cloud)
 *   WEAVIATE_VIBE_EVAL_KEY  - Weaviate API key
 */

const fs = require("fs");
const path = require("path");

const COLLECTION = "BenchmarkRun";
const OUTPUT_PATH = path.join(
  __dirname,
  "..",
  "src",
  "components",
  "VibeEvalDashboard",
  "data.json"
);
const LIMIT = 2000;

async function fetchAllResults(baseUrl, apiKey) {
  const url = `${baseUrl}/v1/objects?class=${COLLECTION}&limit=${LIMIT}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Weaviate responded ${res.status}: ${await res.text()}`);
  }

  const body = await res.json();
  return (body.objects || []).map((o) => o.properties);
}

function buildDashboardData(results) {
  // Group by run_id
  const runs = {};
  for (const r of results) {
    const runId = r.run_id || "unknown";
    if (!runs[runId]) {
      runs[runId] = { run_id: runId, timestamp: r.timestamp, results: [] };
    }
    runs[runId].results.push(r);
    // Keep the latest timestamp per run
    if (r.timestamp > runs[runId].timestamp) {
      runs[runId].timestamp = r.timestamp;
    }
  }

  // Sort runs by timestamp descending
  const sortedRuns = Object.values(runs).sort(
    (a, b) => (b.timestamp || "").localeCompare(a.timestamp || "")
  );

  // Build leaderboard for latest run
  const latestRun = sortedRuns[0];
  let leaderboard = [];
  if (latestRun) {
    const modelStats = {};
    for (const r of latestRun.results) {
      const mid = r.model_id || "unknown";
      if (!modelStats[mid]) {
        modelStats[mid] = {
          model_id: mid,
          provider: r.provider || "unknown",
          passed: 0,
          total: 0,
          total_duration: 0,
        };
      }
      modelStats[mid].total += 1;
      if (r.success) modelStats[mid].passed += 1;
      modelStats[mid].total_duration += r.duration || 0;
    }

    leaderboard = Object.values(modelStats)
      .map((s) => ({
        ...s,
        pass_rate: s.total > 0 ? s.passed / s.total : 0,
        avg_duration:
          s.total > 0 ? Math.round((s.total_duration / s.total) * 100) / 100 : 0,
      }))
      .sort((a, b) => b.pass_rate - a.pass_rate || a.avg_duration - b.avg_duration);
  }

  // Build per-task breakdown for latest run
  let taskBreakdown = [];
  if (latestRun) {
    const taskMap = {};
    for (const r of latestRun.results) {
      const key = `${r.model_id}||${r.task_id}`;
      if (!taskMap[key]) {
        taskMap[key] = {
          model_id: r.model_id,
          task_id: r.task_id,
          variant: r.variant,
          provider: r.provider,
          success: r.success,
          duration: r.duration,
          similarity_score: r.similarity_score || 0,
          failure_analysis: r.failure_analysis || "",
          root_cause: r.root_cause || "",
          suggested_fix: r.suggested_fix || "",
        };
      }
    }
    taskBreakdown = Object.values(taskMap);
  }

  // Run history summary (last 10 runs)
  const runHistory = sortedRuns.slice(0, 10).map((run) => {
    const passed = run.results.filter((r) => r.success).length;
    return {
      run_id: run.run_id,
      timestamp: run.timestamp,
      total: run.results.length,
      passed,
      pass_rate: run.results.length > 0 ? passed / run.results.length : 0,
    };
  });

  return {
    generated_at: new Date().toISOString(),
    latest_run_id: latestRun ? latestRun.run_id : null,
    leaderboard,
    task_breakdown: taskBreakdown,
    run_history: runHistory,
  };
}

async function main() {
  let baseUrl = process.env.WEAVIATE_VIBE_EVAL_URL;
  const apiKey = process.env.WEAVIATE_VIBE_EVAL_KEY;

  // Ensure URL has protocol
  if (baseUrl && !baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  if (!baseUrl || !apiKey) {
    console.warn(
      "WEAVIATE_VIBE_EVAL_URL or WEAVIATE_VIBE_EVAL_KEY not set. Writing empty data file."
    );
    const emptyData = {
      generated_at: new Date().toISOString(),
      latest_run_id: null,
      leaderboard: [],
      task_breakdown: [],
      run_history: [],
    };
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(emptyData, null, 2));
    console.log(`Wrote empty data to ${OUTPUT_PATH}`);
    return;
  }

  console.log(`Fetching vibe eval results from ${baseUrl}...`);
  const results = await fetchAllResults(baseUrl, apiKey);
  console.log(`Fetched ${results.length} results`);

  const data = buildDashboardData(results);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
  console.log(`Wrote dashboard data to ${OUTPUT_PATH} (${data.leaderboard.length} models, ${data.task_breakdown.length} tasks)`);
}

main().catch((err) => {
  console.error("Failed to fetch vibe eval results:", err.message);
  process.exit(1);
});
