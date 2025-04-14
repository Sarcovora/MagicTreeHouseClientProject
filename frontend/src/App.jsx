// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, Link } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
// import Properties from "./pages/admin/Properties"; // REMOVE THIS IMPORT
import ProjectDetail from "./pages/admin/ProjectDetail";
import SeasonProjectList from "./pages/admin/SeasonProjectList";
import Documents from "./pages/Documents";
import DocumentUpload from "./pages/DocumentUpload";
import DocumentDetail from "./pages/DocumentDetail"; // Corrected path assumption
import Map from "./pages/Map";
import PhotoGallery from "./pages/PhotoGallery";
import Forms from "./pages/Forms";
import FormDetail from "./pages/admin/FormDetail";
import LandownerLayout from "./pages/landowner/LandownerLayout";
import LandownerDashboard from "./pages/landowner/LandownerDashboard";

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
          {/* --- REMOVE EXPLICIT ROUTE FOR PROPERTIES --- */}
          {/* <Route path="properties" element={<Properties />} /> */}
          {/* --- END REMOVED ROUTE --- */}
          <Route path="documents" element={<Documents />} />
          <Route path="documents/upload" element={<DocumentUpload />} />
          <Route path="documents/:id" element={<DocumentDetail />} />
          <Route path="map" element={<Map />} />
          <Route path="gallery" element={<PhotoGallery />} />
          <Route path="forms" element={<Forms />} />
          <Route path="forms/:id" element={<FormDetail />} />
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Landowner Routes */}
        <Route path="/landowner" element={<LandownerLayout />}>
           <Route path="dashboard" element={<LandownerDashboard />} />
           {/* Remove landowner properties route if it existed */}
           {/* <Route path="properties" element={<LandownerProperties />} /> */}
           <Route path="documents" element={<Documents />} />
           <Route path="documents/upload" element={<DocumentUpload />} />
           <Route path="documents/:id" element={<DocumentDetail />} />
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