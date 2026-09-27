import { useEffect, useState } from "react";
import axios from "axios";
import Map from "./Map";
import "./App.css";

function App() {
  const [hazards, setHazards] = useState([]);

  const [dashboardStats, setDashboardStats] = useState({
    totalHazards: 0,
    criticalHazards: 0,
    highHazards: 0,
    moderateHazards: 0,
    lowHazards: 0,
    totalAffectedPopulation: 0,
  });

  const [safeLocations, setSafeLocations] = useState([]);

  const [relocationData, setRelocationData] = useState(null);

  const [loadingRelocation, setLoadingRelocation] =
    useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const [selectedHazard, setSelectedHazard] =
    useState(null);

  // ===============================
  // UPDATE MODAL STATE
  // ===============================

  const [editingHazard, setEditingHazard] =
    useState(null);

  const [updateFormData, setUpdateFormData] =
    useState({
      name: "",
      type: "",
      severity: "",
      population: "",
      latitude: "",
      longitude: "",
    });

  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [updatingHazard, setUpdatingHazard] = useState(false);

  // ===============================
  // ADD HAZARD FORM
  // ===============================

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    severity: "",
    population: "",
    latitude: "",
    longitude: "",
  });

  // ===============================
  // FETCH HAZARDS
  // ===============================

  const fetchHazards = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/hazards"
      );

      setHazards(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch hazards:",
        error
      );
    }
  };

  // ===============================
  // FETCH DASHBOARD STATS
  // ===============================

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/dashboard/stats"
      );

      setDashboardStats(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch dashboard statistics:",
        error
      );
    }
  };

  // ===============================
  // FETCH SAFE LOCATIONS
  // ===============================

  const fetchSafeLocations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/safe-locations"
      );

      setSafeLocations(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch safe locations:",
        error
      );
    }
  };

  // ===============================
  // INITIAL LOAD
  // ===============================

  useEffect(() => {
    fetchHazards();
    fetchSafeLocations();
    fetchDashboardStats();
  }, []);

  // ===============================
  // ADD FORM CHANGE
  // ===============================

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setFormError("");
    setFormSuccess("");
  };

  // ===============================
  // CREATE HAZARD
  // ===============================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setFormSuccess("");

    try {
      await axios.post(
        "http://localhost:5000/api/hazards",
        {
          ...formData,
          severity: Number(formData.severity),
          population: Number(formData.population),
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
        }
      );

      setFormData({
        name: "",
        type: "",
        severity: "",
        population: "",
        latitude: "",
        longitude: "",
      });

      setFormSuccess(
        "Hazard added successfully!"
      );

      fetchHazards();
      fetchDashboardStats();
    } catch (error) {
      console.error(
        "Failed to create hazard:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Failed to create hazard";

      setFormError(message);
    }
  };

  // ===============================
  // DELETE HAZARD
  // ===============================

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/hazards/${id}`
      );

      fetchHazards();
      fetchDashboardStats();

      if (selectedHazard?._id === id) {
        setSelectedHazard(null);
      }
    } catch (error) {
      console.error(
        "Failed to delete hazard:",
        error
      );
    }
  };

  // ===============================
  // OPEN UPDATE MODAL
  // ===============================

  const handleUpdate = (hazard) => {
    setEditingHazard(hazard);

    setUpdateFormData({
      name: hazard.name || "",
      type: hazard.type || "",
      severity: hazard.severity ?? "",
      population: hazard.population ?? "",
      latitude: hazard.latitude ?? "",
      longitude: hazard.longitude ?? "",
    });

    setUpdateError("");
    setUpdateSuccess("");
  };

  // ===============================
  // UPDATE FORM CHANGE
  // ===============================

  const handleUpdateChange = (event) => {
    setUpdateFormData({
      ...updateFormData,
      [event.target.name]: event.target.value,
    });

    setUpdateError("");
    setUpdateSuccess("");
  };

  // ===============================
  // CLOSE UPDATE MODAL
  // ===============================

  const closeUpdateModal = () => {
    if (updatingHazard) {
      return;
    }

    setEditingHazard(null);

    setUpdateFormData({
      name: "",
      type: "",
      severity: "",
      population: "",
      latitude: "",
      longitude: "",
    });

    setUpdateError("");
    setUpdateSuccess("");
  };

  // ===============================
  // SUBMIT UPDATE
  // ===============================

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();

    setUpdateError("");
    setUpdateSuccess("");

    const severity = Number(
      updateFormData.severity
    );

    const population = Number(
      updateFormData.population
    );

    const latitude = Number(
      updateFormData.latitude
    );

    const longitude = Number(
      updateFormData.longitude
    );

    // ===============================
    // FRONTEND VALIDATION
    // ===============================

    if (!updateFormData.name.trim()) {
      setUpdateError(
        "Hazard name is required"
      );
      return;
    }

    if (!updateFormData.type.trim()) {
      setUpdateError(
        "Hazard type is required"
      );
      return;
    }

    if (
      updateFormData.severity === "" ||
      !Number.isFinite(severity) ||
      severity < 0 ||
      severity > 100
    ) {
      setUpdateError(
        "Severity must be between 0 and 100"
      );
      return;
    }

    if (
      updateFormData.population === "" ||
      !Number.isFinite(population) ||
      population < 0
    ) {
      setUpdateError(
        "Population cannot be negative"
      );
      return;
    }

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      setUpdateError(
        "Latitude must be between -90 and 90"
      );
      return;
    }

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setUpdateError(
        "Longitude must be between -180 and 180"
      );
      return;
    }

    try {
      setUpdatingHazard(true);

      const response = await axios.put(
        `http://localhost:5000/api/hazards/${editingHazard._id}`,
        {
          name: updateFormData.name.trim(),
          type: updateFormData.type.trim(),
          severity,
          population,
          latitude,
          longitude,
        }
      );

      setUpdateSuccess(
        "Hazard updated successfully!"
      );

      setHazards((previousHazards) =>
        previousHazards.map((hazard) =>
          hazard._id === editingHazard._id
            ? response.data
            : hazard
        )
      );

      fetchDashboardStats();

      setTimeout(() => {
        closeUpdateModal();
      }, 800);
    } catch (error) {
      console.error(
        "Failed to update hazard:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Failed to update hazard";

      setUpdateError(message);
    } finally {
      setUpdatingHazard(false);
    }
  };

  // ===============================
  // FIND SAFE LOCATION
  // ===============================

  const handleRelocation = async (hazard) => {
    try {
      setLoadingRelocation(true);

      const response = await axios.get(
        `http://localhost:5000/api/relocation/${hazard._id}`
      );

      setRelocationData(response.data);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Failed to fetch relocation plan:",
        error
      );

      setRelocationData(null);
    } finally {
      setLoadingRelocation(false);
    }
  };

  // ===============================
  // CLOSE RELOCATION
  // ===============================

  const closeRelocation = () => {
    setRelocationData(null);
  };

  // ===============================
  // HAZARD DETAILS
  // ===============================

  const handleViewDetails = (hazard) => {
    setSelectedHazard(hazard);
  };

  const closeHazardDetails = () => {
    setSelectedHazard(null);
  };

  // ===============================
  // SEARCH + FILTER
  // ===============================

  const filteredHazards = hazards.filter(
    (hazard) => {
      const search =
        searchTerm.toLowerCase().trim();

      const matchesSearch =
        hazard.name
          ?.toLowerCase()
          .includes(search) ||
        hazard.type
          ?.toLowerCase()
          .includes(search);

      const matchesRisk =
        riskFilter === "ALL" ||
        hazard.riskLevel === riskFilter;

      return matchesSearch && matchesRisk;
    }
  );

  // ===============================
  // RESET SEARCH + FILTER
  // ===============================

  const handleResetFilters = () => {
    setSearchTerm("");
    setRiskFilter("ALL");
  };

  // ===============================
  // UI
  // ===============================

  return (
    <div className="app">

      {/* ================================= */}
      {/* UPDATE HAZARD MODAL */}
      {/* ================================= */}

      {editingHazard && (
        <div className="modal-overlay">

          <div className="update-modal">

            <div className="modal-header">

              <div>
                <h2>✏️ Update Hazard</h2>

                <p>
                  Update hazard information and
                  recalculate risk automatically.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeUpdateModal}
              >
                ✕
              </button>

            </div>

            {updateError && (
              <div className="form-error">
                ⚠️ {updateError}
              </div>
            )}

            {updateSuccess && (
              <div className="form-success">
                ✅ {updateSuccess}
              </div>
            )}

            <form
              className="update-form"
              onSubmit={handleUpdateSubmit}
            >

              <div className="form-field">

                <label>
                  Hazard Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={updateFormData.name}
                  onChange={handleUpdateChange}
                  placeholder="Enter hazard name"
                  required
                />

              </div>

              <div className="form-field">

                <label>
                  Hazard Type
                </label>

                <input
                  type="text"
                  name="type"
                  value={updateFormData.type}
                  onChange={handleUpdateChange}
                  placeholder="Enter hazard type"
                  required
                />

              </div>

              <div className="form-field">

                <label>
                  Severity
                </label>

                <input
                  type="number"
                  name="severity"
                  value={updateFormData.severity}
                  onChange={handleUpdateChange}
                  min="0"
                  max="100"
                  placeholder="0 - 100"
                  required
                />

              </div>

              <div className="form-field">

                <label>
                  Affected Population
                </label>

                <input
                  type="number"
                  name="population"
                  value={updateFormData.population}
                  onChange={handleUpdateChange}
                  min="0"
                  placeholder="Enter population"
                  required
                />

              </div>

              <div className="form-field">

                <label>
                  Latitude
                </label>

                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={updateFormData.latitude}
                  onChange={handleUpdateChange}
                  min="-90"
                  max="90"
                  placeholder="Latitude"
                  required
                />

              </div>

              <div className="form-field">

                <label>
                  Longitude
                </label>

                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={updateFormData.longitude}
                  onChange={handleUpdateChange}
                  min="-180"
                  max="180"
                  placeholder="Longitude"
                  required
                />

              </div>

              <div className="update-modal-actions">

                <button
                  type="button"
                  className="close-btn"
                  onClick={closeUpdateModal}
                  disabled={updatingHazard}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={updatingHazard}
                >
                  {updatingHazard
                    ? "Updating..."
                    : "Update Hazard"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ================================= */}
      {/* HAZARD DETAILS MODAL */}
      {/* ================================= */}

      {selectedHazard && (
        <div className="modal-overlay">

          <div className="hazard-modal">

            <div className="modal-header">

              <div>
                <h2>🚨 Hazard Details</h2>

                <p>
                  Complete information about this hazard
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeHazardDetails}
              >
                ✕
              </button>

            </div>

            <div className="modal-content">

              <div className="detail-item">
                <span>Hazard Name</span>
                <strong>
                  {selectedHazard.name}
                </strong>
              </div>

              <div className="detail-item">
                <span>Hazard Type</span>
                <strong>
                  {selectedHazard.type}
                </strong>
              </div>

              <div className="detail-item">
                <span>Severity</span>
                <strong>
                  {selectedHazard.severity}/100
                </strong>
              </div>

              <div className="detail-item">
                <span>Affected Population</span>
                <strong>
                  {selectedHazard.population}
                </strong>
              </div>

              <div className="detail-item">
                <span>Risk Score</span>
                <strong>
                  {selectedHazard.riskScore}
                </strong>
              </div>

              <div className="detail-item">
                <span>Risk Level</span>
                <strong>
                  {selectedHazard.riskLevel}
                </strong>
              </div>

              <div className="detail-item">
                <span>Latitude</span>
                <strong>
                  {selectedHazard.latitude ?? "N/A"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Longitude</span>
                <strong>
                  {selectedHazard.longitude ?? "N/A"}
                </strong>
              </div>

            </div>

            <div className="modal-footer">

              <button
                className="close-btn"
                onClick={closeHazardDetails}
              >
                Close
              </button>

              <button
                className="relocation-btn"
                onClick={() => {
                  closeHazardDetails();
                  handleRelocation(selectedHazard);
                }}
              >
                Find Safe Location
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ================================= */}
      {/* RELOCATION PLAN */}
      {/* ================================= */}

      {relocationData && (
        <section className="section relocation-section">

          <div className="section-title">

            <div>
              <h2>🚨 Relocation Plan</h2>

              <p className="section-subtitle">
                Smart relocation recommendation based
                on distance and available capacity.
              </p>
            </div>

            <button
              className="close-btn"
              onClick={closeRelocation}
            >
              Close
            </button>

          </div>

          <div className="summary-grid">

            <div className="summary-card">
              <span>
                Affected Population
              </span>

              <strong>
                {relocationData.totalAffectedPopulation}
              </strong>
            </div>

            <div className="summary-card">
              <span>
                Total Relocated
              </span>

              <strong>
                {relocationData.totalRelocatedPopulation}
              </strong>
            </div>

            <div className="summary-card">
              <span>
                Remaining
              </span>

              <strong>
                {relocationData.remainingPopulation}
              </strong>
            </div>

          </div>

          <div className="hazard-summary">

            <h3>Hazard Information</h3>

            <p>
              <strong>Name:</strong>{" "}
              {relocationData.hazard.name}
            </p>

            <p>
              <strong>Risk Level:</strong>{" "}
              {relocationData.hazard.riskLevel}
            </p>

          </div>

          <h3 className="plan-heading">
            Safe Location Allocation
          </h3>

          <div className="relocation-plan">

            {relocationData.relocationPlan.map(
              (location, index) => (

                <div
                  className="relocation-card"
                  key={location.locationId}
                >

                  <div className="location-number">
                    {index + 1}
                  </div>

                  <div className="location-info">

                    <h3>
                      🏠 {location.locationName}
                    </h3>

                    <p>
                      <strong>Type:</strong>{" "}
                      {location.type}
                    </p>

                    <p>
                      <strong>Distance:</strong>{" "}
                      {location.distance} km
                    </p>

                    <p>
                      <strong>
                        Available Capacity:
                      </strong>{" "}
                      {location.availableCapacity}
                    </p>

                    <p className="assigned">
                      <strong>
                        People Assigned:
                      </strong>{" "}
                      {location.peopleToRelocate}
                    </p>

                  </div>

                </div>
              )
            )}

          </div>

          <div
            className={
              relocationData.remainingPopulation === 0
                ? "recommendation success"
                : "recommendation warning"
            }
          >

            <h3>
              {relocationData.remainingPopulation === 0
                ? "✅"
                : "⚠️"}{" "}
              Recommendation
            </h3>

            <p>
              {relocationData.recommendation}
            </p>

          </div>

        </section>
      )}

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <header className="header">

        <h1>SURAKSHA-X</h1>

        <p>
          Hazard Detection & Relocation Management System
        </p>

      </header>

      <main className="container">

        {/* ================================= */}
        {/* ADD HAZARD */}
        {/* ================================= */}

        <section className="section">

          <div className="section-title">

            <div>
              <h2>➕ Add New Hazard</h2>

              <p className="section-subtitle">
                Enter hazard details to add a new risk zone
              </p>
            </div>

          </div>

          {formError && (
            <div className="form-error">
              ⚠️ {formError}
            </div>
          )}

          {formSuccess && (
            <div className="form-success">
              ✅ {formSuccess}
            </div>
          )}

          <form
            className="hazard-form"
            onSubmit={handleSubmit}
          >

            <input
              type="text"
              name="name"
              placeholder="Hazard Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="type"
              placeholder="Hazard Type"
              value={formData.type}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="severity"
              placeholder="Severity (0-100)"
              value={formData.severity}
              onChange={handleChange}
              min="0"
              max="100"
              required
            />

            <input
              type="number"
              name="population"
              placeholder="Affected Population"
              value={formData.population}
              onChange={handleChange}
              min="0"
              required
            />

            <input
              type="number"
              step="any"
              name="latitude"
              placeholder="Latitude"
              value={formData.latitude}
              onChange={handleChange}
              min="-90"
              max="90"
              required
            />

            <input
              type="number"
              step="any"
              name="longitude"
              placeholder="Longitude"
              value={formData.longitude}
              onChange={handleChange}
              min="-180"
              max="180"
              required
            />

            <button
              type="submit"
              className="primary-btn"
            >
              Add Hazard
            </button>

          </form>

        </section>

        {/* ================================= */}
        {/* DASHBOARD */}
        {/* ================================= */}

        <section className="section">

          <h2>Dashboard Overview</h2>

          <div className="dashboard-stats">

            <div className="stat-card">
              <h3>Total Hazards</h3>
              <p>
                {dashboardStats.totalHazards}
              </p>
            </div>

            <div className="stat-card">
              <h3>Critical Hazards</h3>
              <p>
                {dashboardStats.criticalHazards}
              </p>
            </div>

            <div className="stat-card">
              <h3>High Risk Hazards</h3>
              <p>
                {dashboardStats.highHazards}
              </p>
            </div>

            <div className="stat-card">
              <h3>Moderate Hazards</h3>
              <p>
                {dashboardStats.moderateHazards}
              </p>
            </div>

            <div className="stat-card">
              <h3>Low Risk Hazards</h3>
              <p>
                {dashboardStats.lowHazards}
              </p>
            </div>

            <div className="stat-card">
              <h3>Affected Population</h3>
              <p>
                {dashboardStats.totalAffectedPopulation}
              </p>
            </div>

          </div>

        </section>

        {/* ================================= */}
        {/* MAP */}
        {/* ================================= */}

        <section className="section">

          <h2>Hazard Map</h2>

          <div className="map-wrapper">

            <Map
              hazards={hazards}
              safeLocations={safeLocations}
            />

          </div>

        </section>

        {/* ================================= */}
        {/* HAZARDS */}
        {/* ================================= */}

        <section className="section">

          <h2>Hazards</h2>

          <div className="hazard-filters">

            <input
              type="text"
              placeholder="🔍 Search by hazard name or type..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            <select
              value={riskFilter}
              onChange={(event) =>
                setRiskFilter(event.target.value)
              }
            >

              <option value="ALL">
                All Risk Levels
              </option>

              <option value="LOW">
                🟢 Low
              </option>

              <option value="MODERATE">
                🟡 Moderate
              </option>

              <option value="HIGH">
                🟠 High
              </option>

              <option value="CRITICAL">
                🔴 Critical
              </option>

            </select>

            <button
              type="button"
              className="reset-filter-btn"
              onClick={handleResetFilters}
              disabled={
                searchTerm === "" &&
                riskFilter === "ALL"
              }
            >
              🔄 Reset Filters
            </button>

          </div>

          <p className="filter-result">
            Showing {filteredHazards.length} of{" "}
            {hazards.length} hazards
          </p>

          <div className="card-grid">

            {filteredHazards.length > 0 ? (

              filteredHazards.map((hazard) => (

                <div
                  className="hazard-card"
                  key={hazard._id}
                >

                  <h3>{hazard.name}</h3>

                  <p>
                    <strong>Type:</strong>{" "}
                    {hazard.type}
                  </p>

                  <p>
                    <strong>Severity:</strong>{" "}
                    {hazard.severity}
                  </p>

                  <p>
                    <strong>Population:</strong>{" "}
                    {hazard.population}
                  </p>

                  <p>
                    <strong>Risk Score:</strong>{" "}
                    {hazard.riskScore}
                  </p>

                  <p>
                    <strong>Risk Level:</strong>{" "}
                    {hazard.riskLevel}
                  </p>

                  <div className="button-group">

                    <button
                      className="update-btn"
                      onClick={() =>
                        handleUpdate(hazard)
                      }
                    >
                      Update
                    </button>

                    <button
                      className="details-btn"
                      onClick={() =>
                        handleViewDetails(hazard)
                      }
                    >
                      View Details
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(hazard._id)
                      }
                    >
                      Delete
                    </button>

                    <button
                      className="relocation-btn"
                      onClick={() =>
                        handleRelocation(hazard)
                      }
                      disabled={loadingRelocation}
                    >
                      {loadingRelocation
                        ? "Finding..."
                        : "Find Safe Location"}
                    </button>

                  </div>

                </div>

              ))

            ) : (

              <div className="info-card">

                <h3>No Hazards Found</h3>

                <p>
                  Try changing the search text or
                  risk level filter.
                </p>

                <button
                  type="button"
                  className="reset-filter-btn"
                  onClick={handleResetFilters}
                >
                  🔄 Reset Filters
                </button>

              </div>

            )}

          </div>

        </section>

        {/* ================================= */}
        {/* SAFE LOCATIONS */}
        {/* ================================= */}

        <section className="section">

          <h2>Safe Locations</h2>

          <div className="card-grid">

            {safeLocations.map((location) => (

              <div
                className="safe-card"
                key={location._id}
              >

                <h3>
                  🏠 {location.name}
                </h3>

                <p>
                  <strong>Type:</strong>{" "}
                  {location.type}
                </p>

                <p>
                  <strong>Capacity:</strong>{" "}
                  {location.capacity}
                </p>

                <p>
                  <strong>Available:</strong>{" "}
                  {location.availableCapacity}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {location.latitude},{" "}
                  {location.longitude}
                </p>

              </div>

            ))}

          </div>

        </section>

      </main>

    </div>
  );
}

export default App;