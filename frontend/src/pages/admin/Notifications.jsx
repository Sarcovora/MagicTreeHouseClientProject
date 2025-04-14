// src/pages/admin/Notifications.jsx
import React from 'react';

const Notifications = () => {
  console.log("[Notifications Component] Rendering.");
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="text-gray-600">
          This is the placeholder page for viewing Notifications.
        </p>
        <p className="mt-4 text-gray-500">
          (Functionality to be implemented later, including Admin/Landowner differences)
        </p>
         {/* Placeholder for notification list */}
         <div className="mt-6 border-t pt-4">
             <p className="text-center text-gray-400">No notifications yet.</p>
             {/* Example notification item structure */}
             {/*
             <div className="p-3 border-b hover:bg-gray-50">
                 <p className="font-medium">Project "Oak Hill" Update</p>
                 <p className="text-sm text-gray-600">Landowner Alice Green uploaded new photos.</p>
                 <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
             </div>
             */}
         </div>
      </div>
    </div>
  );
};

export default Notifications;