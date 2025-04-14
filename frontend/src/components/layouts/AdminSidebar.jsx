// src/components/layouts/AdminSidebar.jsx
import React from 'react'; // <--- ADD THIS LINE
import {
  TreePine,
  Files,
  FormInput,
  Bell,
  Map,
  LogOut,
  Settings,
  ChevronDown,
  Image,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import TreeFolks from "../../assets/icons/treefolks.svg?react";
import { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import UserAvatar from '../common/UserAvatar';

const AdminSidebar = () => {
  const location = useLocation();
  const [user, setUser] = useState({ name: 'User', role: 'Admin' });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const userData = await apiService.getUserProfile();
        if (isMounted && userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchUser();
    return () => { isMounted = false; };
  }, []);


  const menuItems = [
    { icon: <TreePine size={20} />, label: "Dashboard", path: "/admin/dashboard" },
    { icon: <Files size={20} />, label: "Documents", path: "/admin/documents" },
    { icon: <FormInput size={20} />, label: "Forms", path: "/admin/forms" },
    { icon: <Bell size={20} />, label: "Notifications", path: "/admin/notifications" },
    { icon: <Map size={20} />, label: "Map", path: "/admin/map" },
    { icon: <Image size={20} />, label: "Photos", path: "/admin/gallery" },
  ];

   const isActive = (path) => {
    if (path === "/admin/dashboard") {
       // Match dashboard exactly, or /admin/, or /admin/seasons/*
      return location.pathname === path || location.pathname === '/admin' || location.pathname === '/admin/' || location.pathname.startsWith('/admin/seasons/');
    }
    return location.pathname.startsWith(path);
   };

  const handleLogout = () => {
    console.log("Logout clicked");
    alert("Simulating Logout...");
  };


  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/admin/dashboard" className="flex items-center justify-center focus:outline-none d">
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
            <UserAvatar name={user.name} size={36} />
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.role || 'Admin'}</p>
            </div>
          </div>
          <ChevronDown size={18} className={`text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* User Dropdown Menu */}
        {userMenuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 w-[calc(100%-2rem)] mx-4 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 animate-fade-in-fast">
             <Link
                to="/admin/settings" // Assuming settings route
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full"
             >
                <Settings size={16} className="text-gray-500" />
                <span>Settings</span>
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