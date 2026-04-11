import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignInSide from "./views/SignInSide";
import UpdatePassword from "./views/UpdatePassword";
import EntityCreation from "./views/EntityCreation";
import Dashboard from "./views/Dashboard";
// import Settings from "./views/Settings";
import Layout from "./components/Layout";
import AdminPortfolio from "./views/AdminPortfolio";
import GlobalUsers from "./views/GlobalUsers";
import SchoolLayout from "./components/SchoolLayout";
import Section1 from "./views/school/Section1";
import Section2 from "./views/school/Section2";
import Section3 from "./views/school/Section3";
import Section4 from "./views/school/Section4";
import Settings from "./views/school/Settings";

function App() {
  const isLoggedIn = true; // ✅ Replace with real auth

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SignInSide />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Private Routes with Sidebar */}
        {isLoggedIn && (
          <Route path="/" element={<Layout />}>
            <Route path="admin-portfolio" element={<AdminPortfolio />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="create-entity" element={<EntityCreation />} />
            <Route path="global-users" element={<GlobalUsers />} />
            {/* <Route path="settings" element={<Settings />} /> */}
            {/* <Route index element={<Navigate to="/dashboard" replace />} /> */}
          </Route>
        )}

        {/* School Routes with dedicated sidebar */}
        {isLoggedIn && (
          <Route path="/school/:schoolSlug" element={<SchoolLayout />}>
            <Route index element={<Navigate to="section-1" replace />} />
            <Route path="section-1" element={<Section1 />} />
            <Route path="section-2" element={<Section2 />} />
            <Route path="section-3" element={<Section3 />} />
            <Route path="section-4" element={<Section4 />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        )}
      </Routes>
    </div>
  );
}

export default App;
