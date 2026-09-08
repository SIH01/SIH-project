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
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminDisasterList from "./pages/admin/AdminDisasterList.jsx";
import AdminDisasterForm from "./pages/admin/AdminDisasterForm.jsx";
import DisasterDetail from "./pages/DisasterDetail.jsx";

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
      </Routes>
    </>
  );
}