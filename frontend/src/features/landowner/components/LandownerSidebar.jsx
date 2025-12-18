import { useState } from "react";
import {
  TreePine,
  FormInput,
  Map,
  LogOut,
  Settings,
  ChevronDown,
  Image,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import TreeFolks from "../../../assets/icons/treefolks.svg?react";
import UserAvatar from "../../../components/common/UserAvatar";
import { useAuth } from "../../auth/AuthProvider";

const LandownerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = profile?.username || profile?.email || "Landowner";

  const menuItems = [
    { icon: <TreePine size={24} />, label: "Properties", path: "/properties" },
    { icon: <FormInput size={24} />, label: "Forms", path: "/forms" },
    { icon: <Map size={24} />, label: "Map", path: "/map" },
    { icon: <Image size={24} />, label: "Photos", path: "/gallery" },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-6">
        <Link
          to="/landowner/dashboard"
          className="flex items-center justify-center focus:outline-none"
        >
          <TreeFolks className="h-32 w-32 text-green-600" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center space-x-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive(item.path)
                ? "border-l-4 border-green-600 bg-green-50 text-green-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="relative border-t border-gray-200 p-4">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-lg p-2 hover:bg-gray-100"
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <UserAvatar name={displayName} size={36} />
            <div className="overflow-hidden text-left">
              <p className="truncate text-sm font-medium text-gray-900">
                {displayName}
              </p>
              <p className="truncate text-xs text-gray-500">Landowner</p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`text-gray-500 transition-transform ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {menuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
            <Link
              to="/landowner/account"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Settings size={18} />
              <span>Account settings</span>
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="flex w-full items-center space-x-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandownerSidebar;
