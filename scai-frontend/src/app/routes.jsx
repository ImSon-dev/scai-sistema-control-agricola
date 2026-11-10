import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import AuthGuard from "./components/AuthGuard";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SoilNutrients from "./pages/SoilNutrients";
import Irrigation from "./pages/Irrigation";

export default function AppRoutes() {
  return (
    <Routes>

      {/* SIN layout */}
      <Route path="/" element={<Login />} />

      {/* CON layout + auth */}
      <Route path="/dashboard" element={<AuthGuard><Layout><Dashboard /></Layout></AuthGuard>} />
      <Route path="/profile" element={<AuthGuard><Layout><Profile /></Layout></AuthGuard>} />
      <Route path="/nutrients" element={<AuthGuard><Layout><SoilNutrients /></Layout></AuthGuard>} />
      <Route path="/irrigation" element={<AuthGuard><Layout><Irrigation /></Layout></AuthGuard>} />

    </Routes>
  );
}
