import React, { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaCalendarCheck, FaClock, FaMapMarkerAlt, FaCar } from "react-icons/fa";
import Layout from './Layout';

function BookingHistory() {
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchHistory(currentUser.uid);
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const fetchHistory = async (userId) => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const bookingsQuery = query(
        bookingsRef,
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(bookingsQuery);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)); // Sort by date, newest first

      console.log('Fetched bookings:', bookingsData); // Debug log
      setHistory(bookingsData);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const content = loading ? (
    <div className="flex justify-center items-center h-full">
      <div className="text-center">Loading...</div>
    </div>
  ) : (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Booking History</h2>
      {history.length > 0 ? (
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-red-500 mr-2" />
                        <span className="text-sm text-gray-900">{booking.stationName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaCar className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">{booking.vehicleType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaCalendarCheck className="text-blue-500 mr-2" />
                        <span className="text-sm text-gray-500">
                          {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaClock className="text-green-500 mr-2" />
                        <span className="text-sm text-gray-500">{booking.bookingTime || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <FaCalendarCheck className="mx-auto text-gray-400 text-4xl mb-4" />
          <p className="text-gray-500">No booking history available.</p>
          <button
            onClick={() => navigate('/find-stations')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Book a Station
          </button>
        </div>
      )}
    </div>
  );

  return (
    <Layout user={user} onLogout={handleLogout}>
      {content}
    </Layout>
  );
}

export default BookingHistory;
