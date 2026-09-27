function ReportCenter({ hazards }) {
  const exportCSV = () => {
    const headers = ["Name", "Type", "Severity", "Population", "Risk Score", "Risk Level", "Priority Score", "Priority Level", "Latitude", "Longitude"];
    const rows = hazards.map((h) => [
      h.name, h.type, h.severity, h.population, h.riskScore ?? "", h.riskLevel ?? "", h.priorityScore ?? "", h.priorityLevel ?? "", h.latitude, h.longitude,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `suraksha-x-hazard-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="section report-section">
      <div className="report-content">
        <div>
          <span className="section-kicker">FIELD REPORTING</span>
          <h2>📁 Incident Report Center</h2>
          <p>Export the current hazard database for authority review, documentation and project demonstrations.</p>
        </div>
        <button className="primary-btn report-btn" onClick={exportCSV} disabled={!hazards.length}>
          ⬇ Export Hazard CSV
        </button>
      </div>
    </section>
  );
}

export default ReportCenter;
