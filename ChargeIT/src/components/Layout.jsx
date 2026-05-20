import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChargingStation, FaHistory, FaUserEdit, FaSignOutAlt, FaTimes, FaSearch, FaBell, FaHome, FaMapMarkerAlt, FaBars } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username || userDoc.data().name || 'User');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUsername('User');
        }
      }
    };

    fetchUserData();
  }, [user]);

  const sidebarItems = [
    { icon: FaHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FaMapMarkerAlt, label: 'Find Stations', path: '/find-stations' },
    { icon: FaHistory, label: 'Booking History', path: '/history' },
    { icon: FaTimes, label: 'Cancel Booking', path: '/cancel' },
    { icon: FaUserEdit, label: 'Update Profile', path: '/profile' }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <FaChargingStation className="text-blue-600 text-2xl" />
            <span className="text-xl font-bold text-gray-800">ChargeIT</span>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <FaBars className="text-gray-600 text-xl" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r z-50 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:w-64 w-3/4
      `}>
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <FaChargingStation className="text-blue-600 text-2xl" />
            <span className="text-xl font-bold text-gray-800">ChargeIT</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`text-xl ${location.pathname === item.path ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-800">Welcome back {username}</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative hidden md:block">
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
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaSignOutAlt />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header Actions */}
        <div className="lg:hidden bg-white border-b sticky top-16 z-30">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-lg font-bold text-gray-800">Welcome back {username}</h1>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <FaBell className="text-gray-600" />
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <FaSignOutAlt className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout; 