import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase-config';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { FaHistory, FaUser, FaChargingStation, FaCalendarAlt, FaClock, FaCar, FaMotorcycle, FaCheck, FaTimes, FaPhone } from 'react-icons/fa';
import StationOwnerLayout from './StationOwnerLayout';

const StationHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'cancelled', 'pending'
  const [station, setStation] = useState(null);
  const [userDetails, setUserDetails] = useState({});

  const fetchUserDetails = async (userId) => {
    try {
      if (!userId) return null;
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
    return null;
  };

  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('No current user found');
          return;
        }
        console.log('Current user:', currentUser.uid);

        // First, get the station owned by this user
        const stationsRef = collection(db, 'stations');
        const stationsQuery = query(stationsRef, where('ownerId', '==', currentUser.uid));
        const stationsSnapshot = await getDocs(stationsQuery);
        
        if (!stationsSnapshot.empty) {
          const stationData = stationsSnapshot.docs[0].data();
          const stationId = stationsSnapshot.docs[0].id;
          console.log('Found station:', stationId, stationData);
          
          setStation({
            id: stationId,
            ...stationData
          });

          // Then fetch bookings for this station
          const bookingsRef = collection(db, 'bookings');
          let bookingsQuery = query(bookingsRef, where('stationId', '==', stationId));
          
          if (filter !== 'all') {
            bookingsQuery = query(bookingsRef, 
              where('stationId', '==', stationId),
              where('status', '==', filter)
            );
          }

          // Set up real-time listener for bookings
          const unsubscribe = onSnapshot(bookingsQuery, async (snapshot) => {
            const bookingsData = [];
            const userDetailsMap = { ...userDetails };

            for (const doc of snapshot.docs) {
              const bookingData = {
                id: doc.id,
                ...doc.data()
              };

              // Fetch user details if not already in cache
              if (bookingData.userId && !userDetailsMap[bookingData.userId]) {
                const userInfo = await fetchUserDetails(bookingData.userId);
                if (userInfo) {
                  userDetailsMap[bookingData.userId] = userInfo;
                }
              }

              bookingsData.push(bookingData);
            }

            // Sort by date (newest first)
            bookingsData.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
            setBookings(bookingsData);
            setUserDetails(userDetailsMap);
            setLoading(false);
          });

          return () => unsubscribe();
        } else {
          console.log('No station found for user:', currentUser.uid);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching booking history:', error);
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, [filter]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <StationOwnerLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </StationOwnerLayout>
    );
  }

  return (
    <StationOwnerLayout>
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Booking History</h2>
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'cancelled' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => {
                const userInfo = userDetails[booking.userId] || {};
                return (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUser className="text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {userInfo.displayName || userInfo.name || booking.userName || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-500">{booking.userEmail}</div>
                          {userInfo.phone && (
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <FaPhone className="text-gray-400 mr-1" />
                              {userInfo.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaCar className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{booking.vehicleType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{booking.bookingDate}</div>
                          <div className="text-sm text-gray-500">{booking.bookingTime}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{booking.duration} hours</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {booking.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Confirm Booking"
                          >
                            <FaCheck className="text-xl" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel Booking"
                          >
                            <FaTimes className="text-xl" />
                          </button>
                        </div>
                      )}
                      {booking.status === 'confirmed' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusChange(booking.id, 'completed')}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Completed"
                          >
                            <FaCheck className="text-xl" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel Booking"
                          >
                            <FaTimes className="text-xl" />
                          </button>
                        </div>
                      )}
                      {booking.status === 'completed' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusChange(booking.id, 'pending')}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Mark as Pending"
                          >
                            <FaClock className="text-xl" />
                          </button>
                        </div>
                      )}
                      {booking.status === 'cancelled' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusChange(booking.id, 'pending')}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Mark as Pending"
                          >
                            <FaClock className="text-xl" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </StationOwnerLayout>
  );
};

export default StationHistory; 