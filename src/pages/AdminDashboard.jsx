import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import AdminOverview from '../components/admin/AdminOverview';
import UserManagement from '../components/admin/UserManagement';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={<AdminOverview />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;