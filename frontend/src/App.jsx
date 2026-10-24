import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

import Map from "./Map";
import "./App.css";
import AuthScreen from "./components/AuthScreen";

// ================= COMPONENTS =================

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

import DisasterSimulator from "./components/DisasterSimulator";
import CascadeRiskEngine from "./components/CascadeRiskEngine";
import SmartEvacuationRoute from "./components/SmartEvacuationRoute";
import ExplainableRisk from "./components/ExplainableRisk";
import EmergencyResponse from "./components/EmergencyResponse";

import SafeLocationForm from "./components/SafeLocationForm";

// ================= API =================

// const API = "http://localhost:5000/api";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ================= EMPTY FORM =================

const EMPTY_FORM = {
  name: "",
  type: "",
  severity: "",
  population: "",
  latitude: "",
  longitude: "",
};

// =========================================================
// DISTANCE CALCULATOR
// =========================================================

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (value) => (value * Math.PI) / 180;

  const R = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// =========================================================
// APP
// =========================================================

function App() {
  const [authUser, setAuthUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("surakshaXUser") || "null"); }
    catch { return null; }
  });
  const handleLogout = () => { localStorage.removeItem("surakshaXUser"); setAuthUser(null); };
  // =========================================================
  // CORE DATA
  // =========================================================

  const [hazards, setHazards] = useState([]);
  const [safeLocations, setSafeLocations] = useState([]);

  // =========================================================
  // SAFE LOCATION UI
  // =========================================================

  const [showSafeLocationForm, setShowSafeLocationForm] = useState(false);
  const [recommendedSafeZone, setRecommendedSafeZone] = useState(null);

  // =========================================================
  // RELOCATION
  // =========================================================

  const [relocationData, setRelocationData] = useState(null);

  // =========================================================
  // DASHBOARD
  // =========================================================

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

  // =========================================================
  // SEARCH / FILTERS
  // =========================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  // =========================================================
  // MODALS
  // =========================================================

  const [selectedHazard, setSelectedHazard] = useState(null);
  const [editingHazard, setEditingHazard] = useState(null);

  // =========================================================
  // IMPORTANT:
  // PREVENT REPEATED AI PREDICTION REQUESTS
  // =========================================================

  const predictionKeyRef = useRef("");

  // =========================================================
  // FETCH HAZARDS
  // =========================================================

  const fetchHazards = async () => {
    try {
      const response = await axios.get(`${API}/hazards`);

      const data = Array.isArray(response.data) ? response.data : [];

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
  // IMPORTANT:
  // RUN AI PREDICTION ONLY WHEN HAZARD DATA CHANGES
  // =========================================================

  useEffect(() => {
    if (!hazards.length) {
      setRiskPredictions([]);
      predictionKeyRef.current = "";
      return;
    }

    const predictionKey = hazards
      .map(
        (hazard) =>
          `${hazard._id}-${hazard.severity}-${hazard.population}-${hazard.type}`,
      )
      .sort()
      .join("|");

    // Same hazard data:
    // DO NOT CALL AI API AGAIN
    if (predictionKeyRef.current === predictionKey) {
      return;
    }

    predictionKeyRef.current = predictionKey;

    fetchRiskPredictions(hazards);
  }, [hazards]);

  // =========================================================
  // DASHBOARD STATISTICS
  // =========================================================

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);

      const data = response.data || {};

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
      const response = await axios.get(`${API}/safe-locations`);

      const data = Array.isArray(response.data) ? response.data : [];

      setSafeLocations(data);

      return data;
    } catch (error) {
      console.error("Failed to fetch safe locations:", error);

      return [];
    }
  };

  // =========================================================
  // FIND BEST SAFE ZONE
  // =========================================================

  const findRecommendedSafeZone = (hazard, locations) => {
    if (!hazard || !Array.isArray(locations) || locations.length === 0) {
      return null;
    }

    const hazardLatitude = Number(hazard.latitude);
    const hazardLongitude = Number(hazard.longitude);

    if (!Number.isFinite(hazardLatitude) || !Number.isFinite(hazardLongitude)) {
      return null;
    }

    const usableLocations = locations
      .map((location) => {
        const latitude = Number(location.latitude);
        const longitude = Number(location.longitude);

        const availableCapacity = Number(location.availableCapacity) || 0;

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          availableCapacity <= 0
        ) {
          return null;
        }

        const distance = calculateDistance(
          hazardLatitude,
          hazardLongitude,
          latitude,
          longitude,
        );

        return {
          ...location,

          distance: Number(distance.toFixed(2)),

          availableCapacity,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }

        return b.availableCapacity - a.availableCapacity;
      });

    return usableLocations[0] || null;
  };

  // =========================================================
  // ADD SAFE LOCATION
  // =========================================================

  const addSafeLocation = async (formData) => {
    try {
      const payload = {
        ...formData,

        name: String(formData.name || "").trim(),

        type: String(formData.type || "Relief Camp").trim(),

        latitude: Number(formData.latitude),

        longitude: Number(formData.longitude),

        capacity: Number(formData.capacity || 0),

        availableCapacity: Number(
          formData.availableCapacity ?? formData.capacity ?? 0,
        ),
      };

      await axios.post(`${API}/safe-locations`, payload);

      const latestLocations = await fetchSafeLocations();

      // Refresh relocation plan if open
      if (relocationData?.hazard?.id) {
        try {
          const response = await axios.get(
            `${API}/relocation/${relocationData.hazard.id}`,
          );

          setRelocationData(response.data);

          const latestHazard = hazards.find(
            (hazard) => hazard._id === relocationData.hazard.id,
          );

          if (latestHazard) {
            const recommended = findRecommendedSafeZone(
              latestHazard,
              latestLocations,
            );

            setRecommendedSafeZone(recommended);
          }
        } catch (error) {
          console.error("Failed to refresh relocation plan:", error);
        }
      }

      setShowSafeLocationForm(false);

      return true;
    } catch (error) {
      console.error("Failed to add safe location:", error);

      alert(error.response?.data?.message || "Failed to add safe location.");

      throw error;
    }
  };

  // =========================================================
  // REFRESH COMPLETE SYSTEM
  // =========================================================

  const refreshData = async () => {
    try {
      const [hazardData, dashboardData, safeLocationData] = await Promise.all([
        fetchHazards(),
        fetchDashboardStats(),
        fetchSafeLocations(),
      ]);

      // =====================================================
      // IMPORTANT:
      // NO fetchRiskPredictions() HERE
      //
      // AI prediction is handled by the useEffect above.
      // =====================================================

      if (!dashboardData) {
        setDashboardStats({
          totalHazards: 0,
          criticalHazards: 0,
          highHazards: 0,
          moderateHazards: 0,
          lowHazards: 0,
          totalAffectedPopulation: 0,
        });
      }

      // Refresh recommendation
      if (relocationData?.hazard?.id) {
        const activeHazard = hazardData.find(
          (hazard) => hazard._id === relocationData.hazard.id,
        );

        if (activeHazard) {
          const recommended = findRecommendedSafeZone(
            activeHazard,
            safeLocationData,
          );

          setRecommendedSafeZone(recommended);
        }
      }

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

    // Refresh normal data every 30 seconds
    // AI prediction will NOT repeat unless
    // hazard data actually changes.
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
      const payload = {
        ...formData,

        name: String(formData.name || "").trim(),

        type: String(formData.type || "").trim(),

        severity: Number(formData.severity),

        population: Number(formData.population),

        latitude: Number(formData.latitude),

        longitude: Number(formData.longitude),
      };

      await axios.post(`${API}/hazards`, payload);

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

      if (relocationData?.hazard?.id === id) {
        setRelocationData(null);
        setRecommendedSafeZone(null);
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
      const payload = {
        name: String(formData.name || "").trim(),

        type: String(formData.type || "").trim(),

        severity: Number(formData.severity),

        population: Number(formData.population),

        latitude: Number(formData.latitude),

        longitude: Number(formData.longitude),
      };

      await axios.put(`${API}/hazards/${hazardId}`, payload);

      const latestHazards = await fetchHazards();

      await Promise.all([fetchDashboardStats(), fetchSafeLocations()]);

      // =====================================================
      // IMPORTANT:
      // Removed fetchRiskPredictions(latestHazards)
      //
      // useEffect will automatically detect
      // changed severity/population/type and
      // call prediction API.
      // =====================================================

      setEditingHazard(null);

      const updatedHazard = latestHazards.find(
        (hazard) => hazard._id === hazardId,
      );

      if (updatedHazard) {
        setSelectedHazard(updatedHazard);
      }
    } catch (error) {
      console.error("Failed to update hazard:", error);

      alert(error.response?.data?.message || "Failed to update hazard.");

      throw error;
    }
  };

  // =========================================================
  // OPEN RELOCATION PLAN
  // =========================================================

  const openRelocation = async (hazard) => {
    if (!hazard?._id) {
      alert("Invalid hazard selected.");
      return;
    }

    try {
      setLoadingRelocation(true);

      setRecommendedSafeZone(null);

      const response = await axios.get(`${API}/relocation/${hazard._id}`);

      const data = response.data;

      setRelocationData(data);

      const recommended = findRecommendedSafeZone(hazard, safeLocations);

      setRecommendedSafeZone(recommended);
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
  // REFRESH ACTIVE RELOCATION
  // =========================================================

  const refreshRelocationPlan = async () => {
    if (!relocationData?.hazard?.id) {
      return;
    }

    try {
      const hazardId = relocationData.hazard.id;

      const response = await axios.get(`${API}/relocation/${hazardId}`);

      setRelocationData(response.data);

      const currentHazard = hazards.find((hazard) => hazard._id === hazardId);

      if (currentHazard) {
        const recommended = findRecommendedSafeZone(
          currentHazard,
          safeLocations,
        );

        setRecommendedSafeZone(recommended);
      }
    } catch (error) {
      console.error("Failed to refresh relocation:", error);
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
      .map((hazard) => {
        const aiPrediction = riskPredictions.find(
          (item) => item._id === hazard._id,
        );

        return {
          ...hazard,

          prediction: aiPrediction?.prediction || null,

          priorityScore:
            Number(aiPrediction?.priorityScore) ||
            Number(hazard.priorityScore) ||
            Number(hazard.riskScore) ||
            0,

          priorityLevel:
            aiPrediction?.priorityLevel ||
            hazard.priorityLevel ||
            hazard.riskLevel ||
            "LOW",
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [hazards, riskPredictions]);

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
  // AUTHENTICATION GATE
  // =========================================================
  if (!authUser) return <AuthScreen onAuthenticated={setAuthUser} />;

  // =========================================================
  // MAIN UI
  // =========================================================
  return (
    <div className="app app-shell">
      <aside className="sx-sidebar">
        <a className="sx-brand" href="#overview" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <span className="sx-brand-mark">✦</span><span><strong>SURAKSHA<span>-X</span></strong><small>DISASTER INTELLIGENCE</small></span>
        </a>
        <div className="sx-nav-label">WORKSPACE</div>
        <nav className="sx-nav">
          <a className="active" href="#overview"><span>▦</span> Overview</a>
          <a href="#hazard-form"><span>＋</span> Report Hazard</a>
          <a href="#hazard-database"><span>⌕</span> Hazard Database</a>
          <a href="#hazard-map"><span>⌖</span> Live Risk Map</a>
          <a href="#risk-intelligence"><span>✧</span> AI Risk Intelligence</a>
          <a href="#analytics"><span>▥</span> Analytics</a>
          <a href="#safe-zones"><span>⌂</span> Safe Zones & Relief</a>
          <a href="#report-center"><span>▤</span> Reports</a>
        </nav>
        <div className="sx-sidebar-bottom"><div className="sx-profile-avatar">{String(authUser.name || authUser.email || "U").charAt(0).toUpperCase()}</div><div className="sx-profile-text"><strong>{authUser.name || "System User"}</strong><small>{authUser.email}</small></div><button type="button" className="sx-logout" onClick={handleLogout} title="Log out">↪</button></div>
      </aside>
      <div className="sx-workspace">
        <header className="sx-topbar">
          <div className="sx-topbar-title"><span className="sx-top-icon">⌖</span><div><strong>Hazard Detection & Relocation</strong><small><i className="sx-online-dot" /> System workspace active</small></div></div>
          <div className="sx-topbar-right"><span className="sx-live-pill"><i /> Live monitoring</span><span className="sx-user-chip">{String(authUser.name || authUser.email || "U").charAt(0).toUpperCase()}</span><button className="sx-top-logout" onClick={handleLogout}>Log out</button></div>
        </header>
        <main className="container workspace-container">
          <section className="sx-welcome" id="overview">
            <div className="sx-welcome-copy"><span className="sx-eyebrow"><i /> DISASTER RESPONSE CONTROL CENTER</span><h1>Stay ahead of <span>every risk.</span></h1><p>Monitor hazards, understand risk levels, and coordinate safer relocations from one intelligent workspace.</p><div className="sx-feature-pills"><span>✦ Risk intelligence</span><span>⌖ Geospatial monitoring</span><span>✓ Relocation planning</span></div></div>
            <div className="sx-welcome-actions"><button className="sx-primary-action" onClick={() => document.getElementById("hazard-form")?.scrollIntoView({ behavior: "smooth" })}>＋ Report a hazard <span>→</span></button><button className="sx-secondary-action" onClick={manualRefresh} disabled={refreshing}>{refreshing ? "Refreshing…" : "⟳ Refresh dashboard"}</button></div>
            <div className="sx-welcome-orb sx-orb-one" /><div className="sx-welcome-orb sx-orb-two" />
          </section>
          <section className="sx-kpi-grid" aria-label="System overview">
            <article className="sx-kpi-card"><span className="sx-kpi-icon blue">⌖</span><span className="sx-kpi-label">Total hazards</span><strong>{dashboardStats.totalHazards ?? hazards.length}</strong><small>Tracked in the system</small></article>
            <article className="sx-kpi-card"><span className="sx-kpi-icon red">⚠</span><span className="sx-kpi-label">Critical risks</span><strong>{criticalPriorityCount}</strong><small>Require urgent attention</small></article>
            <article className="sx-kpi-card"><span className="sx-kpi-icon amber">⌁</span><span className="sx-kpi-label">High-risk zones</span><strong>{highPriorityCount}</strong><small>Priority response needed</small></article>
            <article className="sx-kpi-card"><span className="sx-kpi-icon green">♙</span><span className="sx-kpi-label">People at risk</span><strong>{Number(dashboardStats.totalAffectedPopulation ?? emergencyPopulation).toLocaleString("en-IN")}</strong><small>Across identified hazards</small></article>
          </section>
          <div className="sx-section-intro"><div><span className="sx-eyebrow dark">YOUR RESPONSE OVERVIEW</span><h2>Operational dashboard</h2></div><span className="sx-updated">Last sync: {lastUpdated || "Syncing…"}</span></div>
      {/* Existing operational modules */}
      <div className="sx-legacy-content">
        {/* ================= HERO ================= */}

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

        {/* ================= EMERGENCY ALERT ================= */}

        <EmergencyAlert
          hazard={highestPriorityHazard}
          prediction={
            riskPredictions.find(
              (item) => item._id === highestPriorityHazard?._id,
            )?.prediction
          }
          onResponsePlan={openRelocation}
        />

        {/* ================= DASHBOARD ================= */}

        <DashboardStats stats={dashboardStats} />

        {/* ================= LIVE MONITORING ================= */}

        <LiveMonitoring
          hazards={hazards}
          lastUpdated={lastUpdated}
          onRefresh={manualRefresh}
          refreshing={refreshing}
        />

        {/* ================= ANALYTICS ================= */}

        <div id="analytics"><AnalyticsDashboard hazards={hazards} /></div>

        {/* ================= RISK INTELLIGENCE ================= */}

        <div id="risk-intelligence"><RiskIntelligence
          hazards={hazards}
          predictions={riskPredictions}
          loading={riskPredictionLoading}
          error={riskPredictionError}
          onRelocation={openRelocation}
        /></div>

        {/* ================= AI PREDICTION ================= */}

        <AIRiskPrediction
          hazards={hazards}
          predictions={riskPredictions}
          loading={riskPredictionLoading}
          error={riskPredictionError}
          onSelect={setSelectedHazard}
        />

        {/* ================= DYNAMIC RADIUS ================= */}

        <DynamicHazardRadius hazards={hazards} />

        {/* ================= DISASTER SIMULATOR ================= */}

        <DisasterSimulator hazards={hazards} safeLocations={safeLocations} />

        {/* ================= CASCADE RISK ================= */}

        <CascadeRiskEngine hazards={hazards} safeLocations={safeLocations} />

        {/* ================= SMART EVACUATION ================= */}

        <SmartEvacuationRoute
          hazards={hazards}
          safeLocations={safeLocations}
          onOpenMap={() =>
            document.getElementById("hazard-map")?.scrollIntoView({
              behavior: "smooth",
            })
          }
        />

        {/* ================= EXPLAINABLE RISK ================= */}

        <ExplainableRisk hazards={hazards} predictions={riskPredictions} />

        {/* ================= EMERGENCY RESPONSE ================= */}

        <EmergencyResponse
          hazards={hazards}
          safeLocations={safeLocations}
          highestPriorityHazard={highestPriorityHazard}
          onResponsePlan={openRelocation}
        />

        {/* ================= HAZARD FORM ================= */}

        <div id="hazard-form">
          <HazardForm onSubmit={addHazard} initialData={EMPTY_FORM} />
        </div>

        {/* ================= PRIORITY CENTER ================= */}

        <PriorityCenter
          hazards={priorityHazards}
          highestPriorityHazard={highestPriorityHazard}
          criticalPriorityCount={criticalPriorityCount}
          highPriorityCount={highPriorityCount}
          emergencyPopulation={emergencyPopulation}
          predictions={riskPredictions}
          onRelocation={openRelocation}
        />

        {/* ================= MAP ================= */}

        <div id="hazard-map">
          <HazardMap
            hazards={hazards}
            safeLocations={safeLocations}
            MapComponent={Map}
          />
        </div>

        {/* ================= DATABASE ================= */}

        <div id="hazard-database"><HazardDatabase
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
        /></div>

        {/* ================= SAFE LOCATIONS ================= */}

        <section className="section safe-location-section" id="safe-zones">
          <div className="section-heading">
            <div>
              <div className="section-kicker">EVACUATION NETWORK</div>

              <h2>Safe Zones & Relief Locations</h2>

              <p>
                Manage emergency shelters and available evacuation capacity.
              </p>
            </div>

            <button
              type="button"
              className="primary-btn"
              onClick={() => setShowSafeLocationForm((prev) => !prev)}
            >
              {showSafeLocationForm ? "Close Form" : "+ Add Safe Zone"}
            </button>
          </div>

          {/* ================= RECOMMENDED ZONE ================= */}

          {recommendedSafeZone && (
            <div className="recommended-safe-zone">
              <div>
                <span className="section-kicker">SMART RECOMMENDATION</span>

                <h3>🛡️ Recommended Safe Zone</h3>

                <p>
                  Based on distance and currently available emergency capacity.
                </p>
              </div>

              <div className="recommended-safe-zone-info">
                <strong>{recommendedSafeZone.name}</strong>

                <span>{recommendedSafeZone.type || "Relief Location"}</span>

                <span>📍 {recommendedSafeZone.distance ?? 0} km away</span>

                <span>
                  👥 {recommendedSafeZone.availableCapacity ?? 0} capacity
                  available
                </span>
              </div>
            </div>
          )}

          {/* ================= SAFE LOCATION FORM ================= */}

          {showSafeLocationForm && (
            <SafeLocationForm
              onSubmit={addSafeLocation}
              onCancel={() => setShowSafeLocationForm(false)}
            />
          )}

          {/* ================= SAFE LOCATIONS ================= */}

          <SafeLocations locations={safeLocations} />
        </section>

        {/* ================= REPORT CENTER ================= */}

        <div id="report-center"><ReportCenter hazards={hazards} /></div>

        {/* ================= FOOTER ================= */}

        <Footer />
      </div>
      </main>
      </div>

      {/* ================= UPDATE MODAL ================= */}

      <UpdateHazardModal
        hazard={editingHazard}
        onClose={() => setEditingHazard(null)}
        onSave={updateHazard}
      />

      {/* ================= DETAILS MODAL ================= */}

      <HazardDetailsModal
        hazard={selectedHazard}
        onClose={() => setSelectedHazard(null)}
        onRelocation={openRelocation}
      />

      {/* ================= RELOCATION MODAL ================= */}

      <RelocationModal
        data={relocationData}
        recommendedSafeZone={recommendedSafeZone}
        onClose={() => {
          setRelocationData(null);
          setRecommendedSafeZone(null);
        }}
        onConfirmed={async () => {
          await fetchSafeLocations();

          await refreshRelocationPlan();

          await fetchDashboardStats();
        }}
      />
    </div>
  );
}

export default App;
