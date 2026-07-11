import React from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import SignInSide from "./views/SignInSide";
import UpdatePassword from "./views/UpdatePassword";
import EntityCreation from "./views/EntityCreation";
import Dashboard from "./views/Dashboard";
// import Settings from "./views/Settings";
import Layout from "./components/Layout";
import AdminPortfolio from "./views/AdminPortfolio";
import GlobalUsers from "./views/GlobalUsers";
import QuestionTemplates from "./views/QuestionTemplates";
import SchoolLayout from "./components/SchoolLayout";
import Section1 from "./views/school/Section1";
import Section3 from "./views/school/Section3";
import Section4 from "./views/school/Section4";
import QuizzesList from "./views/school/quizzes/QuizzesList";
import QuizBuilder from "./views/school/quizzes/QuizBuilder";
import PermissionsSettings from "./views/school/settings/PermissionsSettings";
import ClassStructureSettings from "./views/school/settings/ClassStructureSettings";
import QuestionTemplatesSettings from "./views/school/settings/QuestionTemplatesSettings";

// Bare "/school/:entityId/settings" redirects to the first sub-section.
function SettingsIndexRedirect() {
  const { entityId } = useParams<{ entityId: string }>();
  return <Navigate to={`/school/${entityId}/settings/permissions`} replace />;
}

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
            <Route path="question-templates" element={<QuestionTemplates />} />
            {/* <Route path="settings" element={<Settings />} /> */}
            {/* <Route index element={<Navigate to="/dashboard" replace />} /> */}
          </Route>
        )}

        {/* School Routes with dedicated sidebar */}
        {isLoggedIn && (
          <Route path="/school/:entityId" element={<SchoolLayout />}>
            <Route index element={<Navigate to="section-1" replace />} />
            <Route path="section-1" element={<Section1 />} />
            <Route path="quizzes" element={<QuizzesList />} />
            <Route path="quizzes/:quizId" element={<QuizBuilder />} />
            <Route path="section-3" element={<Section3 />} />
            <Route path="section-4" element={<Section4 />} />
            <Route path="settings" element={<SettingsIndexRedirect />} />
            <Route path="settings/permissions" element={<PermissionsSettings />} />
            <Route path="settings/class-structure" element={<ClassStructureSettings />} />
            <Route path="settings/question-templates" element={<QuestionTemplatesSettings />} />
          </Route>
        )}
      </Routes>
    </div>
  );
}

export default App;
