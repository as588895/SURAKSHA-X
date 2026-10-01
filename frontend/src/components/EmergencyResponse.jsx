import { useEffect, useMemo, useState } from "react";

const STEPS = [
  "Verify incident data",
  "Calculate emergency priority",
  "Check safe-site capacity",
  "Generate evacuation recommendation",
  "Prepare response plan",
];

function EmergencyResponse({ hazards = [], safeLocations = [], highestPriorityHazard, onResponsePlan }) {
  const [selectedId, setSelectedId] = useState(highestPriorityHazard?._id || hazards[0]?._id || "");
  const [active, setActive] = useState(false);
  const [completed, setCompleted] = useState(0);

  const selected = useMemo(
    () => hazards.find((item) => item._id === selectedId) || highestPriorityHazard || hazards[0],
    [hazards, selectedId, highestPriorityHazard],
  );

  const totalCapacity = safeLocations.reduce((sum, location) => sum + Number(location.availableCapacity || 0), 0);
  const capacityReady = Number(selected?.population || 0) <= totalCapacity;

  useEffect(() => {
    if (!active) return undefined;
    if (completed >= STEPS.length) return undefined;

    const timer = setTimeout(() => setCompleted((value) => value + 1), 650);
    return () => clearTimeout(timer);
  }, [active, completed]);

  useEffect(() => {
    if (active && completed === STEPS.length) {
      const timer = setTimeout(() => {
        setActive(false);
        onResponsePlan?.(selected);
      }, 550);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [active, completed, selected, onResponsePlan]);

  const activate = () => {
    if (!selected) return;
    setCompleted(0);
    setActive(true);
  };

  return (
    <section className="section emergency-response-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">COORDINATED RESPONSE ORCHESTRATOR</span>
          <h2>🚨 One-Click Emergency Response</h2>
          <p>Run the complete response preparation flow from one command-center action.</p>
        </div>
        <div className="response-status"><span className="status-dot" /> READY</div>
      </div>

      {!selected ? (
        <div className="empty-state"><div>🚨</div><h3>No active incident</h3><p>Add a hazard to activate an emergency response.</p></div>
      ) : (
        <div className="response-command-center">
          <div className="response-target">
            <div className="response-target-icon">🚨</div>
            <div>
              <span>TARGET INCIDENT</span>
              <h3>{selected.name}</h3>
              <p>{selected.type} · Severity {selected.severity}/100 · {Number(selected.population || 0).toLocaleString()} people affected</p>
            </div>
            <select value={selected._id} onChange={(e) => { setSelectedId(e.target.value); setActive(false); setCompleted(0); }} disabled={active}>
              {hazards.map((hazard) => <option key={hazard._id} value={hazard._id}>{hazard.name}</option>)}
            </select>
          </div>

          <div className="response-readiness">
            <div><span>Risk level</span><strong className={`priority-badge risk-${String(selected.riskLevel || "LOW").toLowerCase()}`}>{selected.riskLevel || "LOW"}</strong></div>
            <div><span>Safe capacity</span><strong>{totalCapacity.toLocaleString()}</strong></div>
            <div><span>Capacity status</span><strong className={capacityReady ? "fit-good" : "fit-bad"}>{capacityReady ? "READY" : "GAP"}</strong></div>
          </div>

          <div className="response-progress-wrap">
            <div className="response-progress-head"><span>RESPONSE PIPELINE</span><b>{completed}/{STEPS.length} complete</b></div>
            <div className="response-progress"><i style={{ width: `${(completed / STEPS.length) * 100}%` }} /></div>
          </div>

          <div className="response-steps">
            {STEPS.map((step, index) => {
              const done = completed > index;
              const running = active && completed === index;
              return (
                <div className={`response-step ${done ? "done" : ""} ${running ? "running" : ""}`} key={step}>
                  <span>{done ? "✓" : index + 1}</span>
                  <div><strong>{step}</strong><small>{done ? "Completed" : running ? "Processing..." : "Waiting"}</small></div>
                </div>
              );
            })}
          </div>

          <button className="activate-response-btn" onClick={activate} disabled={active}>
            {active ? `⚡ ACTIVATING RESPONSE · ${completed}/${STEPS.length}` : "🚨 ACTIVATE EMERGENCY RESPONSE"}
          </button>

          <p className="response-disclaimer">This command prepares decision-support outputs from the data currently stored in SURAKSHA-X. It does not replace official emergency command decisions.</p>
        </div>
      )}
    </section>
  );
}

export default EmergencyResponse;
