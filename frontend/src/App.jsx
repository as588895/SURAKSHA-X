import { useEffect, useState } from "react";
import axios from "axios";
import Map from "./Map";
import "./App.css";

function App() {
  const [hazards, setHazards] = useState([]);
  const [safeLocations, setSafeLocations] = useState([]);

  const [relocationData, setRelocationData] = useState(null);
  const [loadingRelocation, setLoadingRelocation] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    severity: "",
    population: "",
    latitude: "",
    longitude: "",
  });

  const fetchHazards = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/hazards");

      setHazards(response.data);
    } catch (error) {
      console.error("Failed to fetch hazards:", error);
    }
  };

  const fetchSafeLocations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/safe-locations",
      );

      setSafeLocations(response.data);
    } catch (error) {
      console.error("Failed to fetch safe locations:", error);
    }
  };

  useEffect(() => {
    fetchHazards();
    fetchSafeLocations();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/hazards", {
        ...formData,
        severity: Number(formData.severity),
        population: Number(formData.population),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      });

      setFormData({
        name: "",
        type: "",
        severity: "",
        population: "",
        latitude: "",
        longitude: "",
      });

      fetchHazards();
    } catch (error) {
      console.error("Failed to create hazard:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/hazards/${id}`);

      if (relocationData?.hazard?.id === id) {
        setRelocationData(null);
      }

      fetchHazards();
    } catch (error) {
      console.error("Failed to delete hazard:", error);
    }
  };

  const handleUpdate = async (hazard) => {
    try {
      const updatedSeverity = prompt("Enter new severity:", hazard.severity);

      if (updatedSeverity === null) {
        return;
      }

      await axios.put(`http://localhost:5000/api/hazards/${hazard._id}`, {
        severity: Number(updatedSeverity),
      });

      fetchHazards();
    } catch (error) {
      console.error("Failed to update hazard:", error);
    }
  };

  const handleRelocation = async (hazard) => {
    try {
      setLoadingRelocation(true);

      const response = await axios.get(
        `http://localhost:5000/api/relocation/${hazard._id}`,
      );

      setRelocationData(response.data);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Failed to fetch relocation plan:", error);

      setRelocationData(null);
    } finally {
      setLoadingRelocation(false);
    }
  };

  const closeRelocation = () => {
    setRelocationData(null);
  };

  return (
    <div className="app">
      {/* HEADER */}

      <header className="header">
        <h1>SURAKSHA-X</h1>

        <p>Hazard Detection & Relocation Management System</p>
      </header>

      <main className="container">
        {/* RELOCATION PLAN */}

        {relocationData && (
          <section className="section relocation-section">
            <div className="section-title">
              <div>
                <h2>🚨 Relocation Plan</h2>

                <p className="section-subtitle">
                  Smart relocation recommendation based on distance and
                  available capacity.
                </p>
              </div>

              <button className="close-btn" onClick={closeRelocation}>
                Close
              </button>
            </div>

            {/* SUMMARY */}

            <div className="summary-grid">
              <div className="summary-card">
                <span>Affected Population</span>

                <strong>{relocationData.totalAffectedPopulation}</strong>
              </div>

              <div className="summary-card">
                <span>Total Relocated</span>

                <strong>{relocationData.totalRelocatedPopulation}</strong>
              </div>

              <div className="summary-card">
                <span>Remaining</span>

                <strong>{relocationData.remainingPopulation}</strong>
              </div>
            </div>

            {/* HAZARD INFO */}

            <div className="hazard-summary">
              <h3>Hazard Information</h3>

              <p>
                <strong>Name:</strong> {relocationData.hazard.name}
              </p>

              <p>
                <strong>Risk Level:</strong> {relocationData.hazard.riskLevel}
              </p>
            </div>

            {/* RELOCATION PLAN */}

            <h3 className="plan-heading">Safe Location Allocation</h3>

            <div className="relocation-plan">
              {relocationData.relocationPlan.map((location, index) => (
                <div className="relocation-card" key={location.locationId}>
                  <div className="location-number">{index + 1}</div>

                  <div className="location-info">
                    <h3>🏠 {location.locationName}</h3>

                    <p>
                      <strong>Type:</strong> {location.type}
                    </p>

                    <p>
                      <strong>Distance:</strong> {location.distance} km
                    </p>

                    <p>
                      <strong>Available Capacity:</strong>{" "}
                      {location.availableCapacity}
                    </p>

                    <p className="assigned">
                      <strong>People Assigned:</strong>{" "}
                      {location.peopleToRelocate}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* RECOMMENDATION */}

            <div
              className={
                relocationData.remainingPopulation === 0
                  ? "recommendation success"
                  : "recommendation warning"
              }
            >
              <h3>
                {relocationData.remainingPopulation === 0 ? "✅" : "⚠️"}{" "}
                Recommendation
              </h3>

              <p>{relocationData.recommendation}</p>
            </div>
          </section>
        )}

        {/* ADD HAZARD */}

        <section className="section">
          <h2>Add Hazard</h2>

          <form className="hazard-form" onSubmit={handleSubmit}>
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
              required
            />

            <input
              type="number"
              step="any"
              name="longitude"
              placeholder="Longitude"
              value={formData.longitude}
              onChange={handleChange}
              required
            />

            <button type="submit" className="primary-btn">
              Add Hazard
            </button>
          </form>
        </section>

        {/* MAP */}

        <section className="section">
          <h2>Hazard Map</h2>

          <div className="map-wrapper">
            <Map hazards={hazards} safeLocations={safeLocations} />
          </div>
        </section>

        {/* HAZARDS */}

        <section className="section">
          <h2>Hazards</h2>

          <div className="card-grid">
            {hazards.map((hazard) => (
              <div className="hazard-card" key={hazard._id}>
                <h3>{hazard.name}</h3>

                <p>
                  <strong>Type:</strong> {hazard.type}
                </p>

                <p>
                  <strong>Severity:</strong> {hazard.severity}
                </p>

                <p>
                  <strong>Population:</strong> {hazard.population}
                </p>

                <p>
                  <strong>Risk Score:</strong> {hazard.riskScore}
                </p>

                <p>
                  <strong>Risk Level:</strong> {hazard.riskLevel}
                </p>

                <div className="button-group">
                  <button
                    className="update-btn"
                    onClick={() => handleUpdate(hazard)}
                  >
                    Update
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(hazard._id)}
                  >
                    Delete
                  </button>

                  <button
                    className="relocation-btn"
                    onClick={() => handleRelocation(hazard)}
                    disabled={loadingRelocation}
                  >
                    {loadingRelocation ? "Finding..." : "Find Safe Location"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SAFE LOCATIONS */}

        <section className="section">
          <h2>Safe Locations</h2>

          <div className="card-grid">
            {safeLocations.map((location) => (
              <div className="safe-card" key={location._id}>
                <h3>🏠 {location.name}</h3>

                <p>
                  <strong>Type:</strong> {location.type}
                </p>

                <p>
                  <strong>Capacity:</strong> {location.capacity}
                </p>

                <p>
                  <strong>Available:</strong> {location.availableCapacity}
                </p>

                <p>
                  <strong>Location:</strong> {location.latitude},{" "}
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
