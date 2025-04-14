// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, Link } from "react-router-dom"; // Added Link
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import ProjectDetail from "./pages/admin/ProjectDetail";
// Keep the import for the component we want to test later
import SeasonProjectList from "./pages/admin/SeasonProjectList";
import Documents from "./pages/Documents";
import DocumentUpload from "./pages/DocumentUpload";
// Use the existing DocumentDetail for both for now
import DocumentDetail from "./pages/DocumentDetail";
import Map from "./pages/Map";
import PhotoGallery from "./pages/PhotoGallery";
import Forms from "./pages/Forms";
import FormDetail from "./pages/admin/FormDetail";
import LandownerLayout from "./pages/landowner/LandownerLayout";
import LandownerDashboard from "./pages/landowner/LandownerDashboard";
// import SeasonProjectList from "./pages/admin/SeasonProjectList";

// Removed the non-existent LandownerDocumentDetail import

// Temporary auth simulation
const isAdmin = true;

// // Temporary simple component to grab and display params
// const SimpleRouteTest = () => {
//     const { seasonYear } = useParams();
//     console.log(`[SimpleRouteTest] Rendering for season: ${seasonYear}`);
//     return (
//         <div style={{ padding: '20px', border: '2px solid red', margin: '20px' }}> {/* Added margin */}
//             <h1>TEST ROUTE REACHED</h1>
//             <p>Season Year from URL: {seasonYear}</p>
//             <Link to="/admin/dashboard">Back to Dashboard</Link>
//         </div>
//     );
// };


function App() {
  const defaultRedirect = isAdmin ? "/admin/dashboard" : "/landowner/dashboard";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={defaultRedirect} replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          {/* --- RESTORE ORIGINAL ROUTE HERE --- */}
          {/* <Route path="seasons/:seasonYear" element={<SimpleRouteTest />} /> */}
          <Route path="seasons/:seasonYear" element={<SeasonProjectList />} /> {/* Use the actual component */}
          {/* --- END RESTORED ROUTE --- */}
          <Route path="project/:id" element={<ProjectDetail />} />
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
           <Route path="documents" element={<Documents />} />
           <Route path="documents/upload" element={<DocumentUpload />} />
           {/* Use the shared DocumentDetail for landowner document routes */}
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