// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import AdminLayout from "./features/admin/layouts/AdminLayout";
import Notifications from "./features/admin/pages/Notifications";
import ProjectDetail from "./features/admin/pages/ProjectDetail";
import SeasonProjectList from "./features/admin/pages/SeasonProjectList";
import Map from "./pages/Map";
import PhotoGallery from "./pages/PhotoGallery";
import Forms from "./pages/Forms";
import FormDetail from "./features/admin/pages/FormDetail";
import LandownerLayout from "./features/landowner/layouts/LandownerLayout";
import LandownerDashboard from "./features/landowner/pages/LandownerDashboard";
import AddProject from "./features/admin/pages/AddProject"; 
import EditProject from './features/admin/pages/EditProject';
import ProtectedRoute from "./features/auth/ProtectedRoute";
import LoginPage from "./features/auth/pages/LoginPage";
import AccountPage from "./features/auth/pages/AccountPage";
import { useAuth } from "./features/auth/AuthProvider";

function App() {
  const { user, isAdmin } = useAuth();
  const defaultRedirect = !user
    ? "/login"
    : isAdmin
      ? "/admin/dashboard"
      : "/landowner/dashboard";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={defaultRedirect} replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiresAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="seasons/:seasonYear" element={<SeasonProjectList />} />
          <Route path="project/:id" element={<ProjectDetail />} />
          <Route path="project/:id/edit" element={<EditProject />} />
          <Route path="add-project" element={<AddProject />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="map" element={<Map />} />
          <Route path="gallery" element={<PhotoGallery />} />
          <Route path="forms" element={<Forms />} />
          <Route path="forms/:id" element={<FormDetail />} />
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route
          path="/landowner"
          element={
            <ProtectedRoute disallowAdmin>
              <LandownerLayout />
            </ProtectedRoute>
          }
        >
           <Route index element={<Navigate to="dashboard" replace />} />
           <Route path="dashboard" element={<LandownerDashboard />} />
           <Route path="map" element={<Map />} />
           <Route path="gallery" element={<PhotoGallery />} />
           <Route path="forms" element={<Forms />} />
           <Route index element={<Navigate to="dashboard" replace />} />
           <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
