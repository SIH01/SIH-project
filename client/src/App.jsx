import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import About from "./pages/About.jsx";
import DisasterMap from "./pages/DisasterMap.jsx";
import GetHelp from "./pages/GetHelp.jsx";
import Organizations from "./pages/Organizations.jsx";
import OrganizationLogin from "./pages/OrganizationLogin.jsx";
import RegisterOrganization from "./pages/RegisterOrganization.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminDisasterList from "./pages/admin/AdminDisasterList.jsx";
import AdminDisasterForm from "./pages/admin/AdminDisasterForm.jsx";
import AdminAssistanceList from "./pages/admin/AdminAssistanceList.jsx";
import DisasterDetail from "./pages/DisasterDetail.jsx";
import ComingSoon from "./components/ComingSoon.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/about" element={<About />} />
        <Route path="/map" element={<DisasterMap />} />
        <Route path="/disasters/:id" element={<DisasterDetail />} />
        <Route path="/get-help" element={<GetHelp />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/organizations/register" element={<RegisterOrganization />} />
        <Route path="/organizations/login" element={<OrganizationLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/disasters"
          element={
            <ProtectedRoute role="admin">
              <AdminDisasterList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/disasters/new"
          element={
            <ProtectedRoute role="admin">
              <AdminDisasterForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/disasters/:id/edit"
          element={
            <ProtectedRoute role="admin">
              <AdminDisasterForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assistance"
          element={
            <ProtectedRoute role="admin">
              <AdminAssistanceList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization/dashboard"
          element={
            <ProtectedRoute role="organization">
              <ComingSoon
                title="Organization Dashboard"
                stageNote="The API for nearby requests and responses is live (GET /api/assistance/nearby-for-org, POST /api/assistance/:id/respond) — this screen just hasn't been built yet."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/organizations"
          element={
            <ProtectedRoute role="admin">
              <ComingSoon
                title="Organization Verification"
                stageNote="The API is live (GET /api/organizations/admin/all, PUT /api/organizations/:id/verify) — this admin screen just hasn't been built yet."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/missing-persons"
          element={
            <ComingSoon
              title="Report a Missing Person"
              stageNote="The API is live (POST /api/missing-persons) — the report form just hasn't been built yet."
            />
          }
        />
        <Route
          path="/admin/missing-persons"
          element={
            <ProtectedRoute role="admin">
              <ComingSoon
                title="Missing Person Reports"
                stageNote="The API is live (GET/PUT /api/missing-persons) — this review screen just hasn't been built yet."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fundraising"
          element={
            <ComingSoon
              title="Fundraising Campaigns"
              stageNote="The API is live (GET /api/campaigns) — this public campaigns page just hasn't been built yet."
            />
          }
        />
        <Route
          path="/admin/campaigns"
          element={
            <ProtectedRoute role="admin">
              <ComingSoon
                title="Campaign Verification"
                stageNote="The API is live (GET /api/campaigns/admin/all, PUT /api/campaigns/:id/verify) — this admin screen just hasn't been built yet."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute role="admin">
              <ComingSoon
                title="Audit Logs"
                stageNote="The API is live (GET /api/admin/audit-logs, GET /api/admin/stats) — this admin screen just hasn't been built yet."
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}