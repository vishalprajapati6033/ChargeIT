import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { FaCheck, FaTimes, FaUser, FaPhone, FaClock } from 'react-icons/fa';
import StationOwnerLayout from './StationOwnerLayout';

const ConfirmReservations = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const fetchPendingBookings = async () => {
      try {
        const bookingsRef = collection(db, 'bookings');
        const bookingsQuery = query(bookingsRef, where('status', '==', 'pending'));
        
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

            // Format the booking date
            if (bookingData.bookingDate) {
              try {
                const date = new Date(bookingData.bookingDate);
                if (!isNaN(date.getTime())) {
                  bookingData.formattedDate = date.toLocaleDateString();
                } else {
                  bookingData.formattedDate = 'Invalid Date';
                }
              } catch (error) {
                console.error('Error formatting date:', error);
                bookingData.formattedDate = 'Invalid Date';
              }
            } else {
              bookingData.formattedDate = 'No date';
            }

            // Format the booking time
            bookingData.formattedTime = bookingData.bookingTime || 'No time';

            // Format the duration
            bookingData.formattedDuration = bookingData.duration ? `${bookingData.duration} hours` : '1 hour';

            bookingsData.push(bookingData);
          }

          setPendingBookings(bookingsData);
          setUserDetails(userDetailsMap);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching pending bookings:', error);
        setLoading(false);
      }
    };

    fetchPendingBookings();
  }, []);

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
        <h2 className="text-2xl font-semibold mb-4">Pending Reservations</h2>
        {pendingBookings.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingBookings.map(booking => {
                  const userInfo = userDetails[booking.userId] || {};
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.stationName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.formattedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.formattedTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaClock className="text-gray-400 mr-1" />
                          {booking.formattedDuration}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.vehicleType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleBookingResponse(booking.id, 'confirmed')}
                            className="text-green-600 hover:text-green-900"
                            title="Accept Reservation"
                          >
                            <FaCheck className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleBookingResponse(booking.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                            title="Decline Reservation"
                          >
                            <FaTimes className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No pending reservations
          </div>
        )}
      </div>
    </StationOwnerLayout>
  );
};

export default ConfirmReservations; 