import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './components/AdminDashboard';
import StationOwnerLayout from './components/StationOwnerLayout';
import StationOwnerDashboard from './components/StationOwnerDashboard';
import ConfirmReservations from './components/ConfirmReservations';
import StationHistory from './components/StationHistory';
import StationSlots from './components/StationSlots';
import FindStations from './components/FindStations';
import ProtectedRoute from './components/ProtectedRoute';
import BookaSlot from './components/BookaSlot';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/find-stations" element={<FindStations />} />
        <Route path="/book-slot" element={<BookaSlot />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<ViewUsers />} />
                  <Route path="stations" element={<ViewStations />} />
                  <Route path="bookings" element={<ViewBookings />} />
                  <Route path="feedback" element={<ViewFeedback />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Station Owner Routes */}
        <Route
          path="/station-owner"
          element={
            <ProtectedRoute>
              <StationOwnerLayout>
                <Routes>
                  <Route index element={<StationOwnerDashboard />} />
                  <Route path="confirm" element={<ConfirmReservations />} />
                  <Route path="status" element={<StationHistory />} />
                  <Route path="slots" element={<StationSlots />} />
                </Routes>
              </StationOwnerLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App; 