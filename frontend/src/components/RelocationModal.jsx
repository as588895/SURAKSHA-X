import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function RelocationModal({
  data,
  onClose,
  onConfirmed,
}) {
  const [confirmingLocationId, setConfirmingLocationId] =
    useState(null);

  const [confirmedLocations, setConfirmedLocations] =
    useState({});

  const [error, setError] = useState("");

  if (!data) return null;

  const summary =
    data.relocationSummary || {};

  const isComplete =
    summary.status === "COMPLETE";

  // =========================================================
  // CONFIRM RELOCATION
  // =========================================================

  const handleConfirmRelocation =
    async (location) => {
      if (!location?.locationId) {
        return;
      }

      try {
        setConfirmingLocationId(
          location.locationId
        );

        setError("");

        const response =
          await axios.post(
            `${API}/relocation/confirm`,
            {
              hazardId:
                data.hazard?.id,

              locationId:
                location.locationId,

              people:
                Number(
                  location.peopleToRelocate
                ),
            }
          );

        const relocation =
          response.data.relocation;

        setConfirmedLocations(
          (prev) => ({
            ...prev,

            [location.locationId]:
              relocation,
          })
        );

        // Refresh parent dashboard
        if (onConfirmed) {
          await onConfirmed();
        }

      } catch (error) {
        console.error(
          "Relocation confirmation failed:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Failed to confirm relocation."
        );
      } finally {
        setConfirmingLocationId(null);
      }
    };

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    setError("");
    setConfirmingLocationId(null);
    setConfirmedLocations({});

    onClose();
  };

  return (
    <div className="modal-overlay relocation-overlay">

      <div className="relocation-modal">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="modal-header">

          <div>

            <span className="section-kicker">
              EVACUATION INTELLIGENCE
            </span>

            <h2>
              🚨 Smart Relocation Plan
            </h2>

            <p>
              Recommended safe-location
              allocation based on distance,
              population and available
              capacity.
            </p>

          </div>

          <button
            type="button"
            className="modal-close"
            onClick={handleClose}
          >
            ✕
          </button>

        </div>

        {/* =================================================
            HAZARD SUMMARY
        ================================================= */}

        <div className="hazard-summary">

          <h3>
            🚨 Target Hazard
          </h3>

          <p>
            <strong>
              Name:
            </strong>{" "}
            {data.hazard?.name ||
              "Unknown"}
          </p>

          <p>
            <strong>
              Type:
            </strong>{" "}
            {data.hazard?.type ||
              "Unknown"}
          </p>

          <p>
            <strong>
              Severity:
            </strong>{" "}
            {data.hazard?.severity ??
              0}
            /100
          </p>

          <p>
            <strong>
              Risk Level:
            </strong>{" "}
            {data.hazard?.riskLevel ||
              "LOW"}
          </p>

          <p>
            <strong>
              Priority Score:
            </strong>{" "}
            {data.hazard?.priorityScore ??
              0}
          </p>

        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="summary-grid">

          <div className="summary-card">
            <span>
              Affected Population
            </span>

            <strong>
              {summary.totalAffectedPopulation ??
                0}
            </strong>
          </div>

          <div className="summary-card">
            <span>
              Total Available Capacity
            </span>

            <strong>
              {summary.totalAvailableCapacity ??
                0}
            </strong>
          </div>

          <div className="summary-card">
            <span>
              Total Relocated
            </span>

            <strong>
              {summary.totalRelocatedPopulation ??
                0}
            </strong>
          </div>

          <div className="summary-card">
            <span>
              Remaining
            </span>

            <strong>
              {summary.remainingPopulation ??
                0}
            </strong>
          </div>

          <div className="summary-card">
            <span>
              Coverage
            </span>

            <strong>
              {summary.relocationCoverage ??
                0}
              %
            </strong>
          </div>

          <div className="summary-card">
            <span>
              Status
            </span>

            <strong>
              {isComplete
                ? "✅ COMPLETE"
                : "⚠️ INSUFFICIENT"}
            </strong>
          </div>

        </div>

        {/* =================================================
            PLAN
        ================================================= */}

        <h3 className="plan-heading">
          🏠 Safe Location Allocation
        </h3>

        <div className="relocation-plan">

          {data.relocationPlan?.length ? (

            data.relocationPlan.map(
              (location, index) => {

                const confirmed =
                  confirmedLocations[
                    location.locationId
                  ];

                const isConfirming =
                  confirmingLocationId ===
                  location.locationId;

                return (
                  <div
                    className="relocation-card"
                    key={
                      location.locationId ||
                      index
                    }
                  >

                    <div className="location-number">
                      {index + 1}
                    </div>

                    <div className="location-info">

                      <h3>
                        🏠{" "}
                        {location.locationName}
                      </h3>

                      <p>
                        <strong>
                          Type:
                        </strong>{" "}
                        {location.type}
                      </p>

                      <p>
                        <strong>
                          Distance:
                        </strong>{" "}
                        {location.distance ??
                          0}{" "}
                        km
                      </p>

                      <p>
                        <strong>
                          Total Capacity:
                        </strong>{" "}
                        {location.capacity ??
                          0}
                      </p>

                      <p>
                        <strong>
                          Available Capacity:
                        </strong>{" "}
                        {location.availableCapacity ??
                          0}
                      </p>

                      <p className="assigned">

                        <strong>
                          People Assigned:
                        </strong>{" "}

                        {location.peopleToRelocate ??
                          0}

                      </p>

                      <p>
                        <strong>
                          Remaining Capacity:
                        </strong>{" "}
                        {location.remainingCapacity ??
                          0}
                      </p>

                      {/* =================================================
                          CONFIRM BUTTON
                      ================================================= */}

                      {!confirmed ? (

                        <button
                          type="button"
                          className="confirm-relocation-btn"
                          onClick={() =>
                            handleConfirmRelocation(
                              location
                            )
                          }
                          disabled={
                            isConfirming
                          }
                        >

                          {isConfirming
                            ? "⏳ Confirming..."
                            : "✅ Confirm Relocation"}

                        </button>

                      ) : (

                        <div className="relocation-confirmed">

                          ✅ Relocation Confirmed

                          <span>
                            {
                              confirmed.peopleRelocated
                            }{" "}
                            people relocated
                          </span>

                        </div>

                      )}

                    </div>

                  </div>
                );
              }
            )

          ) : (

            <div className="empty-state compact">

              <div>
                ⚠️
              </div>

              <h3>
                No allocation generated
              </h3>

              <p>
                No safe-location
                allocation is currently
                available.
              </p>

            </div>
          )}

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="recommendation warning">

            <h3>
              ⚠️ Relocation Failed
            </h3>

            <p>
              {error}
            </p>

          </div>

        )}

        {/* =================================================
            RECOMMENDATION
        ================================================= */}

        <div
          className={`recommendation ${
            isComplete
              ? "success"
              : "warning"
          }`}
        >

          <h3>

            {isComplete
              ? "✅ Complete Relocation Plan"
              : "⚠️ Additional Capacity Required"}

          </h3>

          <p>
            {data.recommendation ||
              "No recommendation available."}
          </p>

        </div>

        {/* =================================================
            ADDITIONAL CAPACITY
        ================================================= */}

        {!isComplete &&
          (summary.additionalCapacityRequired ??
            0) > 0 && (

            <div className="recommendation warning">

              <h3>
                🚨 Additional Shelter Capacity
              </h3>

              <p>

                Additional capacity required:{" "}

                <strong>
                  {
                    summary.additionalCapacityRequired
                  }
                </strong>{" "}
                people.

              </p>

            </div>
          )}

      </div>

    </div>
  );
}

export default RelocationModal;