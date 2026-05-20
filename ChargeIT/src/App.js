import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Footer from './components/Footer';
import About from './components/About';
import Login from './components/Login';
import Signup from './components/Signup';
import Logout from './components/Logout';
import BookDate from './components/BookDate';
import BookaSlot from './components/BookaSlot';
import Cancel from './components/Cancel';
import BatterySwap from './components/BatterySwap';
import BookBattery from './components/BookBattery';
import BookingHistory from './components/BookingHistory';
import Profile from './components/Profile';
import UserDashboard from './components/UserDashboard';
import FindStations from './components/FindStations';
import AdminSetup from './components/AdminSetup';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import StationOwnerLogin from './components/StationOwnerLogin';
import Vehicle from './components/Vehicle';
import StationOwnerDashboard from './components/StationOwnerDashboard';
import ConfirmReservations from './components/ConfirmReservations';
import StationHistory from './components/StationHistory';
import StationSlots from './components/StationSlots';
import AccountRedirect from './components/AccountRedirect';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import AddStation from './components/AddStation';

const App = () => {
  //AOS Init
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <>
              <Navbar />
              <Hero />
              <Services />
              <About />
              <Footer />
            </>
          } />
          <Route path="/services" element={
            <>
              <Navbar />
              <Services />
              <Footer />
            </>
          } />
          <Route path="/about" element={
            <>
              <Navbar />
              <About />
              <Footer />
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/station-login" element={<StationOwnerLogin />} />
          <Route path="/logout" element={<Logout />} />
          
          {/* Account Redirect Route */}
          <Route path="/account" element={<AccountRedirect />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/admin/stations" element={<AdminDashboard />} />
          <Route path="/admin/bookings" element={<AdminDashboard />} />
          <Route path="/admin/feedback" element={<AdminDashboard />} />
          <Route path="/station-owner" element={<StationOwnerDashboard />} />
          <Route path="/book-date" element={<BookDate />} />
          <Route path="/book-slot" element={<BookaSlot />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/battery-swap" element={<BatterySwap />} />
          <Route path="/book-battery" element={<BookBattery />} />
          <Route path="/history" element={<BookingHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/find-stations" element={<FindStations />} />
          <Route path="/admin-setup" element={<AdminSetup />} />
          <Route path="/vehicle" element={<Vehicle />} />
          <Route path="/station-owner/confirm" element={<ConfirmReservations />} />
          <Route path="/station-owner/status" element={<StationHistory />} />
          <Route path="/station-owner/slots" element={<StationSlots />} />
          <Route path="/admin/add-station" element={<AddStation />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;