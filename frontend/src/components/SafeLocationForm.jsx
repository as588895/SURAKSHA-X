import { useState } from "react";

const EMPTY_FORM = {
  name: "",
  type: "Relief Camp",
  latitude: "",
  longitude: "",
  capacity: "",
  availableCapacity: "",
};

function SafeLocationForm({ onSubmit, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Location name is required.");
      return;
    }

    if (!form.latitude || !form.longitude) {
      setError("Latitude and longitude are required.");
      return;
    }

    if (!form.capacity || Number(form.capacity) <= 0) {
      setError("Capacity must be greater than 0.");
      return;
    }

    if (
      form.availableCapacity === "" ||
      Number(form.availableCapacity) < 0
    ) {
      setError("Available capacity is required.");
      return;
    }

    if (
      Number(form.availableCapacity) >
      Number(form.capacity)
    ) {
      setError(
        "Available capacity cannot be greater than total capacity."
      );
      return;
    }

    try {
      setLoading(true);

      await onSubmit({
        name: form.name.trim(),
        type: form.type.trim(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        capacity: Number(form.capacity),
        availableCapacity: Number(form.availableCapacity),
      });

      setForm(EMPTY_FORM);
      onClose();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to add safe location."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="safe-location-modal-overlay">
      <div className="safe-location-modal">
        <div className="safe-location-modal-header">
          <div>
            <span className="section-kicker">
              EVACUATION NETWORK
            </span>

            <h2>➕ Add Safe Location</h2>

            <p>
              Register a new emergency relocation zone.
            </p>
          </div>

          <button
            className="safe-location-close"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="safe-location-error">
            ⚠️ {error}
          </div>
        )}

        <form
          className="safe-location-form"
          onSubmit={handleSubmit}
        >
          <div className="safe-location-field">
            <label>Location Name</label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Joshimath Relief Camp B"
            />
          </div>

          <div className="safe-location-field">
            <label>Location Type</label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option>Relief Camp</option>
              <option>Emergency Shelter</option>
              <option>School Shelter</option>
              <option>Hospital</option>
              <option>Community Center</option>
              <option>Temporary Camp</option>
            </select>
          </div>

          <div className="safe-location-field">
            <label>Latitude</label>

            <input
              type="number"
              step="any"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              placeholder="30.62"
            />
          </div>

          <div className="safe-location-field">
            <label>Longitude</label>

            <input
              type="number"
              step="any"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              placeholder="79.56"
            />
          </div>

          <div className="safe-location-field">
            <label>Total Capacity</label>

            <input
              type="number"
              min="1"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              placeholder="5000"
            />
          </div>

          <div className="safe-location-field">
            <label>Available Capacity</label>

            <input
              type="number"
              min="0"
              name="availableCapacity"
              value={form.availableCapacity}
              onChange={handleChange}
              placeholder="5000"
            />
          </div>

          <div className="safe-location-form-actions">
            <button
              type="button"
              className="safe-location-cancel"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="safe-location-submit"
              disabled={loading}
            >
              {loading
                ? "Adding..."
                : "🏠 Add Safe Location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SafeLocationForm;