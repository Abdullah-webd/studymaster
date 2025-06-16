import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  PlayCircle, 
  BookOpen, 
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';
import api from '../../services/api';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      change: `+${stats?.users?.today || 0} today`,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Verified Users',
      value: stats?.users?.verified || 0,
      change: `${Math.round((stats?.users?.verified / stats?.users?.total) * 100) || 0}% verified`,
      icon: Activity,
      color: 'green'
    },
    {
      title: 'Active Ads',
      value: stats?.ads?.active || 0,
      change: `${stats?.ads?.total || 0} total`,
      icon: PlayCircle,
      color: 'purple'
    },
    {
      title: 'CBT Sessions',
      value: stats?.cbt?.total || 0,
      change: `+${stats?.cbt?.today || 0} today`,
      icon: BookOpen,
      color: 'orange'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 text-white"
      >
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-red-100">Monitor and manage your StudyMaster platform</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-full ${getColorClasses(stat.color)}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">This Week</span>
              <span className="font-semibold text-green-600">+{stats?.users?.thisWeek || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Today</span>
              <span className="font-semibold text-blue-600">+{stats?.users?.today || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Verification Rate</span>
              <span className="font-semibold text-purple-600">
                {Math.round((stats?.users?.verified / stats?.users?.total) * 100) || 0}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center mb-4">
            <Activity className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Status</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Storage</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                75% Used
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center">
            <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Manage Users</p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-center">
            <PlayCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Upload New Ad</p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-center">
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">View Reports</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminOverview;