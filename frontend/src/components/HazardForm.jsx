import { useState } from "react";

const FIELDS = [
  ["name", "Hazard Name", "e.g. Joshimath Zone A", "text"],
  ["type", "Hazard Type", "e.g. Landslide", "text"],
  ["severity", "Severity", "0 - 100", "number"],
  ["population", "Affected Population", "Number of people", "number"],
  ["latitude", "Latitude", "e.g. 30.556", "number"],
  ["longitude", "Longitude", "e.g. 79.564", "number"],
];

function HazardForm({ onSubmit, initialData }) {
  const [formData, setFormData] = useState(initialData);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const change = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const validate = () => {
    if (!formData.name.trim()) return "Hazard name is required.";
    if (!formData.type.trim()) return "Hazard type is required.";

    const severity = Number(formData.severity);
    const population = Number(formData.population);
    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);

    if (!Number.isFinite(severity) || severity < 0 || severity > 100)
      return "Severity must be between 0 and 100.";
    if (!Number.isFinite(population) || population < 0)
      return "Population cannot be negative.";
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)
      return "Latitude must be between -90 and 90.";
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)
      return "Longitude must be between -180 and 180.";

    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      await onSubmit(formData);
      setFormData(initialData);
      setSuccess("Hazard successfully added to the command center.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create hazard.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section command-section" id="hazard-form">
      <div className="section-heading">
        <div>
          <span className="section-kicker">INCIDENT REGISTRATION</span>
          <h2>➕ Report New Hazard</h2>
          <p>Register a new disaster zone for automated risk analysis.</p>
        </div>
        <div className="heading-icon">📡</div>
      </div>

      {error && <div className="form-error">⚠️ {error}</div>}
      {success && <div className="form-success">✅ {success}</div>}

      <form className="hazard-form" onSubmit={submit}>
        {FIELDS.map(([name, label, placeholder, type]) => (
          <div className="input-group" key={name}>
            <label>{label}</label>
            <input
              type={type}
              name={name}
              placeholder={placeholder}
              value={formData[name]}
              onChange={change}
              min={
                name === "severity"
                  ? 0
                  : name === "population"
                  ? 0
                  : name === "latitude"
                  ? -90
                  : name === "longitude"
                  ? -180
                  : undefined
              }
              max={
                name === "severity"
                  ? 100
                  : name === "latitude"
                  ? 90
                  : name === "longitude"
                  ? 180
                  : undefined
              }
              step={["latitude", "longitude"].includes(name) ? "any" : undefined}
              required
            />
          </div>
        ))}

        <button className="primary-btn add-hazard-btn" disabled={saving}>
          {saving ? "Adding Hazard..." : "🚨 Add Hazard to Command Center"}
        </button>
      </form>
    </section>
  );
}

export default HazardForm;
