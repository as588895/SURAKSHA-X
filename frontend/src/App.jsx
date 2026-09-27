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

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loadingRelocation, setLoadingRelocation] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [editingHazard, setEditingHazard] = useState(null);

  const fetchHazards = async () => {
    try {
      const { data } = await axios.get(`${API}/hazards`);
      setHazards(data);
    } catch (error) {
      console.error("Failed to fetch hazards:", error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const { data } = await axios.get(`${API}/dashboard/stats`);
      setDashboardStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard statistics:", error);
    }
  };

  const fetchSafeLocations = async () => {
    try {
      const { data } = await axios.get(`${API}/safe-locations`);
      setSafeLocations(data);
    } catch (error) {
      console.error("Failed to fetch safe locations:", error);
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchHazards(),
      fetchDashboardStats(),
      fetchSafeLocations(),
    ]);
    setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  };

  const manualRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    load();

    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const addHazard = async (formData) => {
    await axios.post(`${API}/hazards`, {
      ...formData,
      name: formData.name.trim(),
      type: formData.type.trim(),
      severity: Number(formData.severity),
      population: Number(formData.population),
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
    });
    await Promise.all([fetchHazards(), fetchDashboardStats()]);
  };

  const deleteHazard = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hazard?")) return;

    try {
      await axios.delete(`${API}/hazards/${id}`);
      await Promise.all([fetchHazards(), fetchDashboardStats()]);
      if (selectedHazard?._id === id) setSelectedHazard(null);
    } catch (error) {
      console.error("Failed to delete hazard:", error);
      alert(error.response?.data?.message || "Failed to delete hazard.");
    }
  };

  const openUpdate = (hazard) => setEditingHazard(hazard);

  const updateHazard = async (hazardId, formData) => {
    const { data } = await axios.put(`${API}/hazards/${hazardId}`, {
      name: formData.name.trim(),
      type: formData.type.trim(),
      severity: Number(formData.severity),
      population: Number(formData.population),
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
    });

    setHazards((prev) =>
      prev.map((hazard) => (hazard._id === hazardId ? data : hazard))
    );
    await fetchDashboardStats();
  };

  const openRelocation = async (hazard) => {
    try {
      setLoadingRelocation(true);
      const { data } = await axios.get(`${API}/relocation/${hazard._id}`);
      setRelocationData(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to fetch relocation plan:", error);
      alert(error.response?.data?.message || "Failed to generate relocation plan.");
    } finally {
      setLoadingRelocation(false);
    }
  };

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

  const priorityHazards = useMemo(
    () =>
      [...hazards]
        .map((hazard) => ({
          ...hazard,
          priorityScore:
            Number(hazard.priorityScore) || Number(hazard.riskScore) || 0,
          priorityLevel:
            hazard.priorityLevel || hazard.riskLevel || "LOW",
        }))
        .sort((a, b) => b.priorityScore - a.priorityScore),
    [hazards]
  );

  const highestPriorityHazard = priorityHazards[0] || null;

  const criticalPriorityCount = priorityHazards.filter(
    (h) => h.priorityLevel === "CRITICAL"
  ).length;

  const highPriorityCount = priorityHazards.filter(
    (h) => h.priorityLevel === "HIGH"
  ).length;

  const emergencyPopulation = priorityHazards
    .filter(
      (h) =>
        h.priorityLevel === "CRITICAL" || h.priorityLevel === "HIGH"
    )
    .reduce((total, h) => total + Number(h.population || 0), 0);

  return (
    <div className="app">
      <Navbar />

      <main className="container">
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

        <EmergencyAlert
          hazard={highestPriorityHazard}
          onResponsePlan={openRelocation}
        />

        <DashboardStats stats={dashboardStats} />

        <LiveMonitoring
          hazards={hazards}
          lastUpdated={lastUpdated}
          onRefresh={manualRefresh}
          refreshing={refreshing}
        />

        <AnalyticsDashboard hazards={hazards} />

        <RiskIntelligence hazards={hazards} onRelocation={openRelocation} />

        <AIRiskPrediction hazards={hazards} onSelect={setSelectedHazard} />

        <DynamicHazardRadius hazards={hazards} />

        <HazardForm
          onSubmit={addHazard}
          initialData={EMPTY_FORM}
        />

        <PriorityCenter
          hazards={priorityHazards}
          highestPriorityHazard={highestPriorityHazard}
          criticalPriorityCount={criticalPriorityCount}
          highPriorityCount={highPriorityCount}
          emergencyPopulation={emergencyPopulation}
          onRelocation={openRelocation}
        />

        <HazardMap
          hazards={hazards}
          safeLocations={safeLocations}
          MapComponent={Map}
        />

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

        <SafeLocations locations={safeLocations} />

        <ReportCenter hazards={hazards} />

        <Footer />
      </main>

      <UpdateHazardModal
        hazard={editingHazard}
        onClose={() => setEditingHazard(null)}
        onSave={updateHazard}
      />

      <HazardDetailsModal
        hazard={selectedHazard}
        onClose={() => setSelectedHazard(null)}
        onRelocation={openRelocation}
      />

      <RelocationModal
        data={relocationData}
        onClose={() => setRelocationData(null)}
      />
    </div>
  );
}

export default App;
