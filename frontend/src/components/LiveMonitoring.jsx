function LiveMonitoring({ hazards, lastUpdated, onRefresh, refreshing }) {
  const critical = hazards.filter((h) => h.riskLevel === "CRITICAL").length;
  const high = hazards.filter((h) => h.riskLevel === "HIGH").length;

  return (
    <section className="live-monitoring-bar">
      <div className="monitoring-left">
        <span className="live-pulse" />
        <div>
          <strong>LIVE MONITORING ACTIVE</strong>
          <small>Auto-refresh every 30 seconds</small>
        </div>
      </div>
      <div className="monitoring-metrics">
        <span>🔴 {critical} Critical</span>
        <span>🟠 {high} High</span>
        <span>🕒 {lastUpdated || "Starting..."}</span>
      </div>
      <button className="refresh-btn" onClick={onRefresh} disabled={refreshing}>
        {refreshing ? "Refreshing..." : "↻ Refresh"}
      </button>
    </section>
  );
}

export default LiveMonitoring;
