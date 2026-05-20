import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { FaCalendarCheck, FaChargingStation, FaHistory, FaTimes, FaStar, FaComment } from 'react-icons/fa';
import Layout from './Layout';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: ''
  });
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Check if user is admin
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.role === 'admin') {
              console.log('Admin user detected, redirecting to admin dashboard');
              navigate('/admin-dashboard');
              return;
            }
          }
          
          setUser(currentUser);
        } catch (error) {
          console.error('Error checking user role:', error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Separate useEffect to fetch bookings when user state changes
  useEffect(() => {
    if (user) {
      console.log('User state changed, fetching bookings for:', user.uid);
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      console.log('Fetching bookings for user:', user.uid); // Debug log
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      console.log('Query snapshot size:', querySnapshot.size); // Debug log
      
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('Fetched bookings:', bookingsData); // Debug log

      // Count bookings by status
      const total = bookingsData.length;
      const active = bookingsData.filter(booking => booking.status === 'pending').length;
      const completed = bookingsData.filter(booking => booking.status === 'completed' || booking.status === 'confirmed').length;
      const cancelled = bookingsData.filter(booking => booking.status === 'cancelled').length;

      console.log('Booking counts:', { total, active, completed, cancelled }); // Debug log
      console.log('Booking statuses:', bookingsData.map(b => b.status)); // Debug log

      setStats({
        totalBookings: total,
        activeBookings: active,
        completedBookings: completed,
        cancelledBookings: cancelled
      });
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (error.message.includes('index')) {
        console.log('Please create the required index using this link:', 
          error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0] || 'Index link not found');
      }
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

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !feedback.rating) return;

    try {
      const feedbackData = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        stationId: selectedBooking.stationId,
        stationName: selectedBooking.stationName,
        bookingId: selectedBooking.id,
        rating: feedback.rating,
        comment: feedback.comment,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'feedback'), feedbackData);
      
      // Update the booking to mark that feedback has been given
      const bookingRef = doc(db, 'bookings', selectedBooking.id);
      await updateDoc(bookingRef, {
        hasFeedback: true
      });

      // Reset feedback form and close modal
      setFeedback({ rating: 0, comment: '' });
      setShowFeedbackModal(false);
      setSelectedBooking(null);
      
      // Refresh bookings to update the UI
      fetchBookings();
      
      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    }
  };

  const openFeedbackModal = (booking) => {
    setSelectedBooking(booking);
    setShowFeedbackModal(true);
  };

  const content = loading ? (
    <div className="flex justify-center items-center h-full">
      <div className="text-center">Loading...</div>
    </div>
  ) : (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-xl md:text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
            </div>
            <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
              <FaCalendarCheck className="text-blue-600 text-lg md:text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Bookings</p>
              <p className="text-xl md:text-2xl font-semibold text-gray-900">{stats.activeBookings}</p>
            </div>
            <div className="p-2 md:p-3 bg-green-100 rounded-lg">
              <FaChargingStation className="text-green-600 text-lg md:text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-xl md:text-2xl font-semibold text-gray-900">{stats.completedBookings}</p>
            </div>
            <div className="p-2 md:p-3 bg-purple-100 rounded-lg">
              <FaHistory className="text-purple-600 text-lg md:text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Cancelled</p>
              <p className="text-xl md:text-2xl font-semibold text-gray-900">{stats.cancelledBookings}</p>
            </div>
            <div className="p-2 md:p-3 bg-red-100 rounded-lg">
              <FaTimes className="text-red-600 text-lg md:text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Recent Bookings</h2>
        {bookings.length > 0 ? (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{booking.stationName}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.bookingTime || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.status === 'completed' && !booking.hasFeedback && (
                          <button
                            onClick={() => openFeedbackModal(booking)}
                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          >
                            <FaComment className="text-sm" />
                            <span>Give Feedback</span>
                          </button>
                        )}
                        {booking.status === 'completed' && booking.hasFeedback && (
                          <span className="text-green-600 flex items-center space-x-1">
                            <FaStar className="text-sm" />
                            <span>Feedback Given</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent bookings found.</p>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Rate Your Experience</h3>
            <form onSubmit={handleFeedbackSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                      className={`text-2xl ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <FaStar />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                <textarea
                  value={feedback.comment}
                  onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedBooking(null);
                    setFeedback({ rating: 0, comment: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!feedback.rating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  return (
    <Layout user={user} onLogout={handleLogout}>
      {content}
    </Layout>
  );
};

export default UserDashboard; 