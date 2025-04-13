import {
  TreePine,
  Files,
  FormInput,
  Bell,
  Map,
  LogOut,
  Settings,
  ChevronDown,
  Home,
  FileText,
  ClipboardList,
  Image,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import TreeFolks from "../../assets/icons/treefolks.svg?react";

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <TreePine size={24} />, label: "Properties", path: "/admin/properties" },
    { icon: <Files size={24} />, label: "Documents", path: "/admin/documents" },
    { icon: <FormInput size={24} />, label: "Forms", path: "/admin/forms" },
    { icon: <Bell size={24} />, label: "Notifications", path: "/admin/notifications" },
    { icon: <Map size={24} />, label: "Map", path: "/admin/map" },
    { icon: <Image size={24} />, label: "Photos", path: "/admin/gallery" },
  ];

  // Check if a path is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <TreeFolks className="w-32 h-32 text-green-600" />
          {/* <span className="text-xl font-semibold">TreeFolks</span> */}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mb-1 transition-colors ${
              isActive(item.path)
                ? "text-green-600 bg-green-50 border-l-4 border-green-600"
                : ""
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              {/* You can replace this with an actual profile image */}
              <span className="text-gray-600 font-medium">JD</span>
            </div>
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-gray-500">Admin</p>
            </div>
          </div>
          <ChevronDown size={20} className="text-gray-500" />
        </div>

        {/* Settings and Logout */}
        <div className="mt-4 space-y-2">
          <Link
            to="/settings"
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full"
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          <button
            onClick={() => {
              /* Handle logout */
            }}
            className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
