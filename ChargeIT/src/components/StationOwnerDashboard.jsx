import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  addDoc
} from 'firebase/firestore';
import { FaCheck, FaTimes, FaClock, FaExclamationCircle, FaBook, FaStar, FaComments, FaUser, FaCar, FaCalendarAlt, FaMotorcycle } from 'react-icons/fa';
import StationOwnerLayout from './StationOwnerLayout';

const StationOwnerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [station, setStation] = useState(null);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingUsers, setBookingUsers] = useState({});

  const fetchUserDetails = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return userDocSnap.data();
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Check if user is a station owner
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.role !== 'station-owner') {
              navigate('/login');
              return;
            }
            setUser(currentUser);
          }

          // Get station data
          const stationsRef = collection(db, 'stations');
          const stationsQuery = query(stationsRef, where('ownerId', '==', currentUser.uid));
          const stationsSnapshot = await getDocs(stationsQuery);
          
          if (!stationsSnapshot.empty) {
            const stationData = stationsSnapshot.docs[0].data();
            const stationId = stationsSnapshot.docs[0].id;
            setStation({
              id: stationId,
              ...stationData
            });
            
            // Set up real-time listener for bookings
            const bookingsRef = collection(db, 'bookings');
            const bookingsQuery = query(
              bookingsRef, 
              where('stationId', '==', stationId)
            );
            
            const unsubscribeBookings = onSnapshot(bookingsQuery, async (snapshot) => {
              const bookingsData = [];
              const usersData = {};

              for (const doc of snapshot.docs) {
                const bookingData = {
                  id: doc.id,
                  ...doc.data()
                };

                // Fetch user details if not already fetched
                if (bookingData.userId && !usersData[bookingData.userId]) {
                  const userDetails = await fetchUserDetails(bookingData.userId);
                  if (userDetails) {
                    usersData[bookingData.userId] = userDetails;
                  }
                }

                bookingsData.push(bookingData);
              }

              // Sort bookings by date (newest first)
              bookingsData.sort((a, b) => {
                const dateA = new Date(a.bookingDate + ' ' + a.bookingTime);
                const dateB = new Date(b.bookingDate + ' ' + b.bookingTime);
                return dateB - dateA;
              });

              setBookingUsers(usersData);
              setTotalBookings(bookingsData.length);

              // Update booking counts based on status
              setPendingBookings(bookingsData.filter(booking => booking.status === 'pending'));
              setCompletedBookings(bookingsData.filter(booking => 
                booking.status === 'confirmed' || booking.status === 'completed'
              ));

              // Fetch feedback for this station
              const feedbackRef = collection(db, 'feedback');
              const feedbackQuery = query(
                feedbackRef,
                where('stationId', '==', stationId)
              );
              const feedbackSnapshot = await getDocs(feedbackQuery);
              const feedbackData = feedbackSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              setFeedback(feedbackData);
            });

            return () => {
              unsubscribeBookings();
            };
          }
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

  const handleBookingResponse = async (bookingId, status) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  if (loading) {
    return (
      <StationOwnerLayout user={user}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </StationOwnerLayout>
    );
  }

  return (
    <StationOwnerLayout user={user}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Station Dashboard</h1>
          {station && (
            <p className="text-gray-600 mt-2">
              Managing: {station.name} - {station.location}
            </p>
          )}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaBook className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500">Total Bookings</p>
                <p className="text-2xl font-semibold">{totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500">Pending Bookings</p>
                <p className="text-2xl font-semibold">{pendingBookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <FaCheck className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500">Completed Bookings</p>
                <p className="text-2xl font-semibold">{completedBookings.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Bookings Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Pending Reservations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingBookings.map((booking) => {
                  const userDetails = bookingUsers[booking.userId] || {};
                  return (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaUser className="text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {userDetails.displayName || userDetails.name || booking.userName || 'Anonymous'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{station?.name || 'Test Station'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.bookingDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.bookingTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {booking.vehicleType === '4-wheeler' ? (
                            <FaCar className="text-gray-400 mr-2" />
                          ) : (
                            <FaMotorcycle className="text-gray-400 mr-2" />
                          )}
                          <span className="text-sm text-gray-900">{booking.vehicleType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleBookingResponse(booking.id, 'confirmed')}
                            className="text-green-600 hover:text-green-900"
                            title="Accept Booking"
                          >
                            <FaCheck className="text-xl" />
                          </button>
                          <button
                            onClick={() => handleBookingResponse(booking.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                            title="Reject Booking"
                          >
                            <FaTimes className="text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Feedback Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Recent Feedback</h2>
          </div>
          <div className="p-6">
            {feedback.length > 0 ? (
              <div className="space-y-6">
                {feedback.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <FaComments className="text-blue-500 text-xl" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {item.userName || 'Anonymous User'}
                        </span>
                        <div className="flex items-center text-yellow-400">
                          {[...Array(5)].map((_, index) => (
                            <FaStar
                              key={index}
                              className={index < item.rating ? 'text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{item.comment}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No feedback received yet.</p>
            )}
          </div>
        </div>
      </div>
    </StationOwnerLayout>
  );
};

export default StationOwnerDashboard; 