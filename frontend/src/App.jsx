// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import ProjectDetail from "./pages/admin/ProjectDetail";
import Documents from "./pages/Documents";
import DocumentUpload from "./pages/DocumentUpload";
import DocumentDetail from "./pages/DocumentDetail";
import Map from "./pages/Map";
import PhotoGallery from "./pages/PhotoGallery";
import Forms from "./pages/Forms";
import FormDetail from "./pages/FormDetail";
import LandownerLayout from "./pages/landowner/LandownerLayout";
import LandownerDashboard from "./pages/landowner/LandownerDashboard";

// Temporary auth simulation - in real app, this would come from your auth system
const isAdmin = true; // Set to true to see admin view

/**
 * Main App component with routing configuration
 */
function App() {
  // Redirect to appropriate dashboard based on user role
  const defaultRedirect = isAdmin ? "/admin/dashboard" : "/landowner";

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to appropriate dashboard */}
        <Route path="/" element={<Navigate to={defaultRedirect} replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="project/:id" element={<ProjectDetail />} />
          <Route path="documents" element={<Documents />} />
          <Route path="documents/upload" element={<DocumentUpload />} />
          <Route path="documents/:id" element={<DocumentDetail />} />
          <Route path="map" element={<Map />} />
          <Route path="gallery" element={<PhotoGallery />} />
          <Route path="forms" element={<Forms />} />
          <Route path="forms/:id" element={<FormDetail />} />
        </Route>

        {/* Landowner Routes */}
        <Route path="/landowner" element={<LandownerLayout />}>
          <Route index element={<LandownerDashboard />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
