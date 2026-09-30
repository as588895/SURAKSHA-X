import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Map from "./Map";
import "./App.css";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import EmergencyAlert from "./components/EmergencyAlert";
import DashboardStats from "./components/DashboardStats";
import HazardForm from "./components/HazardForm";
import PriorityCenter from "./components/PriorityCenter";
import HazardMap from "./components/HazardMap";
import HazardDatabase from "./components/HazardDatabase";
import SafeLocations from "./components/SafeLocations";
import UpdateHazardModal from "./components/UpdateHazardModal";
import HazardDetailsModal from "./components/HazardDetailsModal";
import RelocationModal from "./components/RelocationModal";
import Footer from "./components/Footer";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import RiskIntelligence from "./components/RiskIntelligence";
import LiveMonitoring from "./components/LiveMonitoring";
import ReportCenter from "./components/ReportCenter";
import AIRiskPrediction from "./components/AIRiskPrediction";
import DynamicHazardRadius from "./components/DynamicHazardRadius";

const API = "http://localhost:5000/api";

const EMPTY_FORM = {
  name: "",
  type: "",
  severity: "",
  population: "",
  latitude: "",
  longitude: "",
};

function App() {
  // =========================================================
  // CORE DATA
  // =========================================================

  const [hazards, setHazards] = useState([]);
  const [safeLocations, setSafeLocations] = useState([]);
  const [relocationData, setRelocationData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalHazards: 0,
    criticalHazards: 0,
    highHazards: 0,
    moderateHazards: 0,
    lowHazards: 0,
    totalAffectedPopulation: 0,
  });

  // =========================================================
  // AI / RISK INTELLIGENCE
  // =========================================================

  const [riskPredictions, setRiskPredictions] = useState([]);
  const [riskPredictionLoading, setRiskPredictionLoading] = useState(false);
  const [riskPredictionError, setRiskPredictionError] = useState("");

  // =========================================================
  // UI STATES
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingRelocation, setLoadingRelocation] = useState(false);

  const [lastUpdated, setLastUpdated] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const [selectedHazard, setSelectedHazard] = useState(null);
  const [editingHazard, setEditingHazard] = useState(null);

  // =========================================================
  // FETCH HAZARDS
  // =========================================================

  const fetchHazards = async () => {
    try {
      const { data } = await axios.get(`${API}/hazards`);

      setHazards(data);

      return data;
    } catch (error) {
      console.error("Failed to fetch hazards:", error);
      return [];
    }
  };

  // =========================================================
  // AI RISK PREDICTION
  // =========================================================

  const fetchRiskPredictions = async (hazardList) => {
    if (!hazardList || hazardList.length === 0) {
      setRiskPredictions([]);
      setRiskPredictionError("");
      return;
    }

    try {
      setRiskPredictionLoading(true);
      setRiskPredictionError("");

      const predictions = await Promise.all(
        hazardList.map(async (hazard) => {
          try {
            const response = await axios.post(`${API}/intelligence/predict`, {
              severity: Number(hazard.severity),
              population: Number(hazard.population),
              type: hazard.type,
            });

            const prediction = response.data;

            return {
              ...hazard,

              prediction,

              // AI result → Priority Engine
              priorityScore: Number(prediction.predictedScore) || 0,

              priorityLevel: prediction.predictedRisk || "LOW",
            };
          } catch (error) {
            console.error(`Prediction failed for ${hazard.name}:`, error);

            return {
              ...hazard,
              prediction: null,

              priorityScore:
                Number(hazard.priorityScore) || Number(hazard.riskScore) || 0,

              priorityLevel: hazard.priorityLevel || hazard.riskLevel || "LOW",
            };
          }
        }),
      );

      setRiskPredictions(predictions);
    } catch (error) {
      console.error("Failed to fetch risk predictions:", error);

      setRiskPredictionError(
        "Risk intelligence service is temporarily unavailable.",
      );

      setRiskPredictions([]);
    } finally {
      setRiskPredictionLoading(false);
    }
  };

  // =========================================================
  // DASHBOARD STATISTICS
  // =========================================================

  const fetchDashboardStats = async () => {
    try {
      const { data } = await axios.get(`${API}/dashboard/stats`);

      setDashboardStats(data);

      return data;
    } catch (error) {
      console.error("Failed to fetch dashboard statistics:", error);

      return null;
    }
  };

  // =========================================================
  // SAFE LOCATIONS
  // =========================================================

  const fetchSafeLocations = async () => {
    try {
      const { data } = await axios.get(`${API}/safe-locations`);

      setSafeLocations(data);

      return data;
    } catch (error) {
      console.error("Failed to fetch safe locations:", error);

      return [];
    }
  };

  // =========================================================
  // REFRESH COMPLETE SYSTEM
  // =========================================================

  const refreshData = async () => {
    try {
      const [hazardData] = await Promise.all([
        fetchHazards(),
        fetchDashboardStats(),
        fetchSafeLocations(),
      ]);

      // AI prediction always works on latest hazards
      await fetchRiskPredictions(hazardData);

      setLastUpdated(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    } catch (error) {
      console.error("Failed to refresh system:", error);
    }
  };

  // =========================================================
  // MANUAL REFRESH
  // =========================================================

  const manualRefresh = async () => {
    try {
      setRefreshing(true);

      await refreshData();
    } finally {
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD + AUTO REFRESH
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) return;

      setLoading(true);

      await refreshData();

      if (mounted) {
        setLoading(false);
      }
    };

    load();

    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // =========================================================
  // ADD HAZARD
  // =========================================================

  const addHazard = async (formData) => {
    try {
      await axios.post(`${API}/hazards`, {
        ...formData,

        name: formData.name.trim(),

        type: formData.type.trim(),

        severity: Number(formData.severity),

        population: Number(formData.population),

        latitude: Number(formData.latitude),

        longitude: Number(formData.longitude),
      });

      // Refresh everything including AI prediction
      await refreshData();
    } catch (error) {
      console.error("Failed to add hazard:", error);

      alert(error.response?.data?.message || "Failed to add hazard.");

      throw error;
    }
  };

  // =========================================================
  // DELETE HAZARD
  // =========================================================

  const deleteHazard = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hazard?")) {
      return;
    }

    try {
      await axios.delete(`${API}/hazards/${id}`);

      await refreshData();

      if (selectedHazard?._id === id) {
        setSelectedHazard(null);
      }
    } catch (error) {
      console.error("Failed to delete hazard:", error);

      alert(error.response?.data?.message || "Failed to delete hazard.");
    }
  };

  // =========================================================
  // OPEN UPDATE MODAL
  // =========================================================

  const openUpdate = (hazard) => {
    setEditingHazard(hazard);
  };

  // =========================================================
  // UPDATE HAZARD
  // =========================================================

  const updateHazard = async (hazardId, formData) => {
    try {
      await axios.put(`${API}/hazards/${hazardId}`, {
        name: formData.name.trim(),

        type: formData.type.trim(),

        severity: Number(formData.severity),

        population: Number(formData.population),

        latitude: Number(formData.latitude),

        longitude: Number(formData.longitude),
      });

      // Refresh hazards + dashboard + AI prediction
      await refreshData();

      setEditingHazard(null);

      // Update selected hazard if currently open
      if (selectedHazard?._id === hazardId) {
        const updatedHazard = hazards.find((hazard) => hazard._id === hazardId);

        if (updatedHazard) {
          setSelectedHazard(updatedHazard);
        }
      }
    } catch (error) {
      console.error("Failed to update hazard:", error);

      alert(error.response?.data?.message || "Failed to update hazard.");

      throw error;
    }
  };

  // =========================================================
  // RELOCATION PLAN
  // =========================================================

  const openRelocation = async (hazard) => {
    try {
      setLoadingRelocation(true);

      const { data } = await axios.get(`${API}/relocation/${hazard._id}`);

      setRelocationData(data);

      // window.scrollTo({
      //   top: 0,
      //   behavior: "smooth",
      // });
    } catch (error) {
      console.error("Failed to fetch relocation plan:", error);

      alert(
        error.response?.data?.message || "Failed to generate relocation plan.",
      );
    } finally {
      setLoadingRelocation(false);
    }
  };

  // =========================================================
  // FILTER HAZARDS
  // =========================================================

  const filteredHazards = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return hazards.filter((hazard) => {
      const matchesSearch =
        !search ||
        hazard.name?.toLowerCase().includes(search) ||
        hazard.type?.toLowerCase().includes(search);

      const matchesRisk =
        riskFilter === "ALL" || hazard.riskLevel === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [hazards, searchTerm, riskFilter]);

  // =========================================================
  // PRIORITY ENGINE
  // =========================================================

  const priorityHazards = useMemo(() => {
  return [...hazards]
    .map((hazard) => ({
      ...hazard,

      priorityScore:
        Number(hazard.priorityScore) ||
        Number(hazard.riskScore) ||
        0,

      priorityLevel:
        hazard.priorityLevel ||
        hazard.riskLevel ||
        "LOW",
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}, [hazards]);

  // =========================================================
  // HIGHEST PRIORITY
  // =========================================================

  const highestPriorityHazard = priorityHazards[0] || null;

  // =========================================================
  // CRITICAL COUNT
  // =========================================================

  const criticalPriorityCount = priorityHazards.filter(
    (hazard) => hazard.priorityLevel === "CRITICAL",
  ).length;

  // =========================================================
  // HIGH COUNT
  // =========================================================

  const highPriorityCount = priorityHazards.filter(
    (hazard) => hazard.priorityLevel === "HIGH",
  ).length;

  // =========================================================
  // EMERGENCY POPULATION
  // =========================================================

  const emergencyPopulation = priorityHazards
    .filter(
      (hazard) =>
        hazard.priorityLevel === "CRITICAL" || hazard.priorityLevel === "HIGH",
    )
    .reduce((total, hazard) => total + Number(hazard.population || 0), 0);

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="app">
      <Navbar />

      <main className="container">
        {/* =================================================
            HERO
        ================================================= */}

        <HeroSection
          onReport={() =>
            document.getElementById("hazard-form")?.scrollIntoView({
              behavior: "smooth",
            })
          }
          onMap={() =>
            document.getElementById("hazard-map")?.scrollIntoView({
              behavior: "smooth",
            })
          }
        />

        {/* =================================================
            EMERGENCY ALERT
        ================================================= */}

        <EmergencyAlert
          hazard={highestPriorityHazard}
          prediction={
            riskPredictions.find(
              (item) => item._id === highestPriorityHazard?._id,
            )?.prediction
          }
          onResponsePlan={openRelocation}
        />

        {/* =================================================
            DASHBOARD STATS
        ================================================= */}

        <DashboardStats stats={dashboardStats} />

        {/* =================================================
            LIVE MONITORING
        ================================================= */}

        <LiveMonitoring
          hazards={hazards}
          lastUpdated={lastUpdated}
          onRefresh={manualRefresh}
          refreshing={refreshing}
        />

        {/* =================================================
            ANALYTICS
        ================================================= */}

        <AnalyticsDashboard hazards={hazards} />

        {/* =================================================
            RISK INTELLIGENCE
        ================================================= */}

        <RiskIntelligence
          hazards={hazards}
          predictions={riskPredictions}
          loading={riskPredictionLoading}
          error={riskPredictionError}
          onRelocation={openRelocation}
        />

        {/* =================================================
            AI RISK PREDICTION
        ================================================= */}

        <AIRiskPrediction
          hazards={hazards}
          predictions={riskPredictions}
          loading={riskPredictionLoading}
          error={riskPredictionError}
          onSelect={setSelectedHazard}
        />

        {/* =================================================
            DYNAMIC HAZARD RADIUS
        ================================================= */}

        <DynamicHazardRadius hazards={hazards} />

        {/* =================================================
            HAZARD FORM
        ================================================= */}

        <HazardForm onSubmit={addHazard} initialData={EMPTY_FORM} />

        {/* =================================================
            PRIORITY CENTER
        ================================================= */}

        <PriorityCenter
  hazards={priorityHazards}
  highestPriorityHazard={highestPriorityHazard}
  criticalPriorityCount={criticalPriorityCount}
  highPriorityCount={highPriorityCount}
  emergencyPopulation={emergencyPopulation}
  predictions={riskPredictions}
  onRelocation={openRelocation}
/>

        {/* =================================================
            HAZARD MAP
        ================================================= */}

        <HazardMap
          hazards={hazards}
          safeLocations={safeLocations}
          MapComponent={Map}
        />

        {/* =================================================
            HAZARD DATABASE
        ================================================= */}

        <HazardDatabase
          hazards={filteredHazards}
          totalHazards={hazards.length}
          loading={loading}
          searchTerm={searchTerm}
          riskFilter={riskFilter}
          onSearch={setSearchTerm}
          onRiskFilter={setRiskFilter}
          onReset={() => {
            setSearchTerm("");
            setRiskFilter("ALL");
          }}
          onUpdate={openUpdate}
          onDetails={setSelectedHazard}
          onRelocation={openRelocation}
          onDelete={deleteHazard}
          loadingRelocation={loadingRelocation}
        />

        {/* =================================================
            SAFE LOCATIONS
        ================================================= */}

        <SafeLocations locations={safeLocations} />

        {/* =================================================
            REPORT CENTER
        ================================================= */}

        <ReportCenter hazards={hazards} />

        {/* =================================================
            FOOTER
        ================================================= */}

        <Footer />
      </main>

      {/* =====================================================
          UPDATE MODAL
      ===================================================== */}

      <UpdateHazardModal
        hazard={editingHazard}
        onClose={() => setEditingHazard(null)}
        onSave={updateHazard}
      />

      {/* =====================================================
          HAZARD DETAILS MODAL
      ===================================================== */}

      <HazardDetailsModal
        hazard={selectedHazard}
        onClose={() => setSelectedHazard(null)}
        onRelocation={openRelocation}
      />

      {/* =====================================================
          RELOCATION MODAL
      ===================================================== */}

      <RelocationModal
        data={relocationData}
        onClose={() => setRelocationData(null)}
      />
    </div>
  );
}

export default App;
