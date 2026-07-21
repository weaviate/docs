import React, { useState, useMemo } from "react";
import styles from "./styles.module.scss";
import dashboardData from "./data.json";

const TABS = ["Leaderboard", "Task Breakdown", "Run History"];

function SortArrow({ active, direction }) {
  if (!active) return null;
  return (
    <span className={styles.sortArrow}>{direction === "asc" ? "▲" : "▼"}</span>
  );
}

function useSortable(data, defaultKey, defaultDir = "desc") {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDir, setSortDir] = useState(defaultDir);

  const sorted = useMemo(() => {
    if (!data || !sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string") {
        return sortDir === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [data, sortKey, sortDir]);

  const onSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return { sorted, sortKey, sortDir, onSort };
}

function passRateClass(rate) {
  if (rate >= 0.8) return `${styles.passRate} ${styles.passRateHigh}`;
  if (rate >= 0.5) return `${styles.passRate} ${styles.passRateMedium}`;
  return `${styles.passRate} ${styles.passRateLow}`;
}

function SortableHeader({ label, field, sortKey, sortDir, onSort }) {
  return (
    <th onClick={() => onSort(field)}>
      {label}
      <SortArrow active={sortKey === field} direction={sortDir} />
    </th>
  );
}

function Leaderboard({ data }) {
  const { sorted, sortKey, sortDir, onSort } = useSortable(
    data,
    "pass_rate",
    "desc"
  );

  if (!sorted || sorted.length === 0) {
    return <div className={styles.emptyState}>No leaderboard data available.</div>;
  }

  const H = (props) => (
    <SortableHeader {...props} sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
  );

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <H label="Model" field="model_id" />
            <H label="Provider" field="provider" />
            <H label="Pass Rate" field="pass_rate" />
            <H label="Passed" field="passed" />
            <H label="Total" field="total" />
            <H label="Avg Duration" field="avg_duration" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={row.model_id}>
              <td className={styles.rank}>{i + 1}</td>
              <td>{row.model_id}</td>
              <td>
                <span className={styles.provider}>{row.provider}</span>
              </td>
              <td className={passRateClass(row.pass_rate)}>
                {(row.pass_rate * 100).toFixed(0)}%
              </td>
              <td>{row.passed}</td>
              <td>{row.total}</td>
              <td>{row.avg_duration.toFixed(1)}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TaskBreakdown({ data }) {
  const [expanded, setExpanded] = useState({});
  const { sorted, sortKey, sortDir, onSort } = useSortable(
    data,
    "task_id",
    "asc"
  );

  if (!sorted || sorted.length === 0) {
    return (
      <div className={styles.emptyState}>No task breakdown data available.</div>
    );
  }

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const H = (props) => (
    <SortableHeader {...props} sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
  );

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <H label="Model" field="model_id" />
            <H label="Task" field="task_id" />
            <H label="Variant" field="variant" />
            <H label="Result" field="success" />
            <H label="Duration" field="duration" />
            <H label="Similarity" field="similarity_score" />
            <th>Analysis</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const key = `${row.model_id}||${row.task_id}`;
            const hasAnalysis = row.failure_analysis || row.root_cause;
            const isExpanded = expanded[key];

            return (
              <React.Fragment key={key}>
                <tr>
                  <td>{row.model_id}</td>
                  <td>{row.task_id}</td>
                  <td>{row.variant}</td>
                  <td className={row.success ? styles.pass : styles.fail}>
                    {row.success ? "PASS" : "FAIL"}
                  </td>
                  <td>{(row.duration || 0).toFixed(1)}s</td>
                  <td>{row.similarity_score > 0 ? `${row.similarity_score}/5` : "-"}</td>
                  <td>
                    {hasAnalysis && (
                      <button
                        className={styles.expandBtn}
                        onClick={() => toggleExpand(key)}
                      >
                        {isExpanded ? "Hide" : "Details"}
                      </button>
                    )}
                  </td>
                </tr>
                {isExpanded && hasAnalysis && (
                  <tr className={styles.analysisRow}>
                    <td colSpan={7}>
                      {row.root_cause && (
                        <div>
                          <span className={styles.analysisLabel}>Root cause:</span>
                          {row.root_cause}
                        </div>
                      )}
                      {row.failure_analysis && (
                        <div>
                          <span className={styles.analysisLabel}>Analysis:</span>
                          {row.failure_analysis}
                        </div>
                      )}
                      {row.suggested_fix && (
                        <div>
                          <span className={styles.analysisLabel}>Suggested fix:</span>
                          {row.suggested_fix}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RunHistory({ data }) {
  if (!data || data.length === 0) {
    return <div className={styles.emptyState}>No run history available.</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Run ID</th>
            <th>Date</th>
            <th>Passed</th>
            <th>Total</th>
            <th>Pass Rate</th>
          </tr>
        </thead>
        <tbody>
          {data.map((run) => (
            <tr key={run.run_id}>
              <td>
                <code>{run.run_id}</code>
              </td>
              <td>
                {run.timestamp
                  ? new Date(run.timestamp).toLocaleDateString()
                  : "-"}
              </td>
              <td>{run.passed}</td>
              <td>{run.total}</td>
              <td className={passRateClass(run.pass_rate)}>
                {(run.pass_rate * 100).toFixed(0)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function VibeEvalDashboard() {
  const [activeTab, setActiveTab] = useState(0);

  const hasData =
    dashboardData.leaderboard.length > 0 ||
    dashboardData.task_breakdown.length > 0;

  return (
    <div className={styles.dashboard}>
      {dashboardData.generated_at && (
        <div className={styles.metadata}>
          Last updated: {new Date(dashboardData.generated_at).toLocaleString()}
          {dashboardData.latest_run_id && (
            <> &middot; Run: <code>{dashboardData.latest_run_id}</code></>
          )}
        </div>
      )}

      <div className={styles.tabs}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === i ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      {!hasData && (
        <div className={styles.emptyState}>
          No benchmark data available yet. Results will appear after the first
          benchmark run.
        </div>
      )}

      {hasData && activeTab === 0 && (
        <Leaderboard data={dashboardData.leaderboard} />
      )}
      {hasData && activeTab === 1 && (
        <TaskBreakdown data={dashboardData.task_breakdown} />
      )}
      {activeTab === 2 && <RunHistory data={dashboardData.run_history} />}
    </div>
  );
}
