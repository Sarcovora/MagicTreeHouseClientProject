import { Outlet } from "react-router-dom";
import Sidebar from "../components/LandownerSidebar"; // Landowner-specific sidebar

const LandownerLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default LandownerLayout;
