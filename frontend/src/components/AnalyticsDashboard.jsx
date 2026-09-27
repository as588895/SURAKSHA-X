import { useMemo } from "react";

function AnalyticsDashboard({ hazards }) {
  const analytics = useMemo(() => {
    const totalPopulation = hazards.reduce((sum, h) => sum + Number(h.population || 0), 0);
    const avgSeverity = hazards.length
      ? Math.round(hazards.reduce((sum, h) => sum + Number(h.severity || 0), 0) / hazards.length)
      : 0;

    const typeMap = {};
    hazards.forEach((h) => {
      const type = h.type || "Unknown";
      typeMap[type] = (typeMap[type] || 0) + 1;
    });

    const riskMap = { CRITICAL: 0, HIGH: 0, MODERATE: 0, LOW: 0 };
    hazards.forEach((h) => {
      const level = h.riskLevel || "LOW";
      if (riskMap[level] !== undefined) riskMap[level] += 1;
    });

    const topTypes = Object.entries(typeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { totalPopulation, avgSeverity, riskMap, topTypes };
  }, [hazards]);

  return (
    <section className="section analytics-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">SITUATIONAL ANALYTICS</span>
          <h2>📊 Disaster Analytics Dashboard</h2>
          <p>Convert current incident data into fast operational insights.</p>
        </div>
        <div className="heading-icon">📈</div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <span>Average Severity</span>
          <strong>{analytics.avgSeverity}<small>/100</small></strong>
          <div className="analytics-progress"><span style={{ width: `${analytics.avgSeverity}%` }} /></div>
        </div>

        <div className="analytics-card">
          <span>Population Exposure</span>
          <strong>{analytics.totalPopulation.toLocaleString("en-IN")}</strong>
          <small>people currently monitored</small>
        </div>

        <div className="analytics-card">
          <span>Critical + High</span>
          <strong>{analytics.riskMap.CRITICAL + analytics.riskMap.HIGH}</strong>
          <small>priority incidents</small>
        </div>
      </div>

      <div className="analytics-columns">
        <div className="analytics-panel">
          <div className="panel-title"><h3>Risk Distribution</h3><span>Live</span></div>
          {Object.entries(analytics.riskMap).map(([level, count]) => (
            <div className="distribution-row" key={level}>
              <div className="distribution-label"><span>{level}</span><strong>{count}</strong></div>
              <div className="distribution-track">
                <span style={{ width: `${hazards.length ? (count / hazards.length) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="analytics-panel">
          <div className="panel-title"><h3>Most Reported Hazards</h3><span>{hazards.length} total</span></div>
          {analytics.topTypes.length ? analytics.topTypes.map(([type, count], index) => (
            <div className="type-row" key={type}>
              <span className="type-rank">#{index + 1}</span>
              <span>{type}</span>
              <strong>{count}</strong>
            </div>
          )) : <div className="empty-mini">No incident data available.</div>}
        </div>
      </div>
    </section>
  );
}

export default AnalyticsDashboard;
