import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUsers, FaChargingStation, FaHistory, FaSignOutAlt, FaComments, FaTachometerAlt, FaSearch, FaBell } from 'react-icons/fa';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const AdminLayout = ({ children, user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Helper function to check if a path is active
  const isActivePath = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard' || location.pathname === '/admin';
    }
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const sidebarItems = [
    { icon: FaTachometerAlt, label: 'Dashboard', path: '/admin-dashboard' },
    { icon: FaUsers, label: 'View Users', path: '/admin/users' },
    { icon: FaChargingStation, label: 'View Stations', path: '/admin/stations' },
    { icon: FaHistory, label: 'View Bookings', path: '/admin/bookings' },
    { icon: FaComments, label: 'View Feedback', path: '/admin/feedback' }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <FaChargingStation className="text-blue-600 text-2xl" />
            <span className="text-xl font-bold text-gray-800">Admin Panel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActivePath(item.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`text-xl ${isActivePath(item.path) ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-800">Welcome back, Admin!</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <FaBell className="text-gray-600" />
                </button>
                <div className="flex items-center space-x-3 border-l pl-4">
                  <div className="text-right">
                    <p className="font-medium text-gray-800">Admin</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 