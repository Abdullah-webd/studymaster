import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminHeader = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
            <Bell className="h-5 w-5" />
          </button>

          {/* User menu */}
          <div className="relative flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-red-600" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;