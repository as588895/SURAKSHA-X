import { useEffect, useState } from "react";

const EMPTY = {
  name: "",
  type: "",
  severity: "",
  population: "",
  latitude: "",
  longitude: "",
};

function UpdateHazardModal({ hazard, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hazard) {
      setForm({
        name: hazard.name || "",
        type: hazard.type || "",
        severity: hazard.severity ?? "",
        population: hazard.population ?? "",
        latitude: hazard.latitude ?? "",
        longitude: hazard.longitude ?? "",
      });
      setError("");
      setSuccess("");
    }
  }, [hazard]);

  if (!hazard) return null;

  const change = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const submit = async (e) => {
    e.preventDefault();

    const severity = Number(form.severity);
    const population = Number(form.population);
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    if (!form.name.trim()) return setError("Hazard name is required.");
    if (!form.type.trim()) return setError("Hazard type is required.");
    if (!Number.isFinite(severity) || severity < 0 || severity > 100)
      return setError("Severity must be between 0 and 100.");
    if (!Number.isFinite(population) || population < 0)
      return setError("Population cannot be negative.");
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)
      return setError("Latitude must be between -90 and 90.");
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)
      return setError("Longitude must be between -180 and 180.");

    try {
      setSaving(true);
      await onSave(hazard._id, form);
      setSuccess("Hazard updated successfully.");
      setTimeout(onClose, 650);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update hazard.");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    ["name", "Hazard Name", "text"],
    ["type", "Hazard Type", "text"],
    ["severity", "Severity", "number"],
    ["population", "Affected Population", "number"],
    ["latitude", "Latitude", "number"],
    ["longitude", "Longitude", "number"],
  ];

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <div className="update-modal">
        <div className="modal-header">
          <div>
            <span className="section-kicker">INCIDENT MANAGEMENT</span>
            <h2>✏️ Update Hazard</h2>
            <p>Modify hazard information and recalculate risk automatically.</p>
          </div>
          <button className="modal-close" onClick={onClose} disabled={saving}>✕</button>
        </div>

        {error && <div className="form-error">⚠️ {error}</div>}
        {success && <div className="form-success">✅ {success}</div>}

        <form className="update-form" onSubmit={submit}>
          {fields.map(([name, label, type]) => (
            <div className="form-field" key={name}>
              <label>{label}</label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={change}
                step={["latitude", "longitude"].includes(name) ? "any" : undefined}
                min={name === "severity" ? 0 : name === "latitude" ? -90 : name === "longitude" ? -180 : name === "population" ? 0 : undefined}
                max={name === "severity" ? 100 : name === "latitude" ? 90 : name === "longitude" ? 180 : undefined}
                required
              />
            </div>
          ))}

          <div className="update-modal-actions">
            <button type="button" className="close-btn" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? "Updating..." : "💾 Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateHazardModal;
