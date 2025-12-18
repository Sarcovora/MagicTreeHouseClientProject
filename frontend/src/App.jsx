// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, Link } from "react-router-dom";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import AdminLayout from "./features/admin/layouts/AdminLayout";
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

// Temporary auth simulation
const isAdmin = true;


function App() {
  const defaultRedirect = isAdmin ? "/admin/dashboard" : "/landowner/dashboard";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={defaultRedirect} replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="seasons/:seasonYear" element={<SeasonProjectList />} />
          <Route path="project/:id" element={<ProjectDetail />} />
          {/* --- ADD ROUTE FOR EDIT PROJECT --- */}
          <Route path="project/:id/edit" element={<EditProject />} />
          {/* --- END ADD ROUTE --- */}
          <Route path="add-project" element={<AddProject />} />
          <Route path="map" element={<Map />} />
          <Route path="gallery" element={<PhotoGallery />} />
          <Route path="forms" element={<Forms />} />
          <Route path="forms/:id" element={<FormDetail />} />
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
        {/* Landowner Routes */}
        <Route path="/landowner" element={<LandownerLayout />}>
           <Route index element={<Navigate to="dashboard" replace />} />
           <Route path="dashboard" element={<LandownerDashboard />} />
           <Route path="map" element={<Map />} />
           <Route path="gallery" element={<PhotoGallery />} />
           <Route path="forms" element={<Forms />} />
           {/* <Route path="forms/:id" element={<LandownerFormDetail />} /> */}
           <Route index element={<Navigate to="dashboard" replace />} />
           <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
