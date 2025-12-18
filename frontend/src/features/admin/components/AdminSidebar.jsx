// src/features/admin/components/AdminSidebar.jsx
import React, { useState } from "react";
import {
  TreePine,
  FormInput,
  Map,
  LogOut,
  Settings,
  ChevronDown,
  Image,
  Bell,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import TreeFolks from "../../../assets/icons/treefolks.svg?react";
import UserAvatar from "../../../components/common/UserAvatar";
import { useAuth } from "../../auth/AuthProvider";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isAdmin, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const displayName = profile?.username || profile?.email || "User";
  const roleLabel = isAdmin ? "Admin" : "Landowner";

  const menuItems = [
    { icon: <TreePine size={20} />, label: "Dashboard", path: "/admin/dashboard" },
  ];

   const isActive = (path) => {
    if (path === "/admin/dashboard") {
       // Match dashboard exactly, or /admin/, or /admin/seasons/*
      return location.pathname === path || location.pathname === '/admin' || location.pathname === '/admin/' || location.pathname.startsWith('/admin/seasons/');
    }
    return location.pathname.startsWith(path);
   };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };


  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <Link
          to={isAdmin ? "/admin/dashboard" : "/landowner/dashboard"}
          className="flex items-center justify-center focus:outline-none"
        >
          <TreeFolks className="w-32 h-32 text-green-600" />
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg mb-1 transition-colors duration-150 ease-in-out font-medium ${
              isActive(item.path)
                ? "text-green-700 bg-green-50 border-l-4 border-green-600 font-semibold pl-2"
                : "pl-3"
            }`}
            title={item.label}
          >
            {/* This line requires 'React' to be imported */}
            {React.cloneElement(item.icon, { className: isActive(item.path) ? 'text-green-600' : 'text-gray-500' })}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200 relative">
        {/* User Info Display */}
        <div
          className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          aria-haspopup="true"
          aria-expanded={userMenuOpen}
         >
          <div className="flex items-center space-x-3 overflow-hidden mr-2">
            <UserAvatar name={displayName} size={36} />
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{roleLabel}</p>
            </div>
          </div>
          <ChevronDown size={18} className={`text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* User Dropdown Menu */}
        {userMenuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 w-[calc(100%-2rem)] mx-4 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 animate-fade-in-fast">
            <Link
              to={isAdmin ? "/admin/account" : "/landowner/account"}
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full"
            >
              <Settings size={16} className="text-gray-500" />
              <span>Account</span>
            </Link>
            <button
                onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
                <LogOut size={16} />
                <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
