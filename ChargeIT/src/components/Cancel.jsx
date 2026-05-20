import React, { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import Layout from './Layout';

function Cancel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchBookings(currentUser.uid);
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchBookings = async (userId) => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const bookingsQuery = query(
        bookingsRef,
        where('userId', '==', userId),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(bookingsQuery);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await deleteDoc(bookingRef);
      setBookings(prevBookings => prevBookings.filter(booking => booking.id !== bookingId));
      alert("Booking has been cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  const content = loading ? (
    <div className="flex justify-center items-center h-full">
      <div className="text-center">Loading...</div>
    </div>
  ) : (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">My Pending Bookings</h2>
      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="text-red-500 text-xl" />
                  <h3 className="text-lg font-semibold text-gray-800">{booking.stationName}</h3>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Pending
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaCalendarAlt className="text-blue-500" />
                  <span>{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaClock className="text-green-500" />
                  <span>{booking.bookingTime || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <span className="font-medium">Vehicle Type:</span>
                  <span>{booking.vehicleType}</span>
                </div>
                {booking.notes && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {booking.notes}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this booking?')) {
                    handleCancelBooking(booking.id);
                  }
                }}
                className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaTimes />
                <span>Cancel Booking</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No pending bookings found.</p>
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

export default Cancel;

