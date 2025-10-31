// src/features/admin/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/AdminSidebar"; // Admin-specific navigation sidebar

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Ensure Sidebar component path is correct */}
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        {/* Outlet renders the matched child route component */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
