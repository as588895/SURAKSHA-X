function DashboardStats({ stats }) {
  const cards = [
    ["kpi-blue", "⚠️", "Total Hazards", stats.totalHazards, "Registered risk zones"],
    ["kpi-red", "🚨", "Critical Hazards", stats.criticalHazards, "Immediate attention"],
    ["kpi-orange", "🔥", "High Risk", stats.highHazards, "Priority monitoring"],
    [
      "kpi-green",
      "👥",
      "Affected Population",
      stats.totalAffectedPopulation,
      "People under monitoring",
    ],
  ];

  return (
    <section className="kpi-grid">
      {cards.map(([className, icon, title, value, subtitle]) => (
        <div className={`kpi-card ${className}`} key={title}>
          <div className="kpi-icon">{icon}</div>
          <div>
            <span>{title}</span>
            <strong>{value ?? 0}</strong>
            <small>{subtitle}</small>
          </div>
        </div>
      ))}
    </section>
  );
}

export default DashboardStats;
