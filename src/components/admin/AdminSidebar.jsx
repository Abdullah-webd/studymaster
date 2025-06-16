import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  PlayCircle,
  Settings,
  X,
  Shield
} from 'lucide-react';

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    { to: '/admin', icon: BarChart3, label: 'Dashboard', end: true },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/ads', icon: PlayCircle, label: 'Ad Management' }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-red-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${
                      isActive
                        ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;