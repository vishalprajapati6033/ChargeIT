import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db, functions } from '../firebase-config';
import { onAuthStateChanged, getAuth, deleteUser, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { 
  collection, 
  query, 
  getDocs, 
  deleteDoc, 
  doc as firestoreDoc, 
  where, 
  addDoc,
  onSnapshot,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { FaUsers, FaChargingStation, FaCalendarCheck, FaComments, FaHistory, FaTrash, FaEdit, FaPlus, FaStar, FaBookmark, FaCheck, FaTimes, FaClock, FaExclamationCircle, FaUser, FaCar, FaMotorcycle, FaComment, FaKey, FaTimes as FaClose } from 'react-icons/fa';
import AdminLayout from './AdminLayout';
import { toast } from 'react-hot-toast';
import { httpsCallable } from 'firebase/functions';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStation, setNewStation] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    fourWheelerSlots: 0,
    twoWheelerSlots: 0
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStations: 0,
    totalBookings: 0,
    totalFeedback: 0,
    recentBookings: [],
    recentFeedback: []
  });
  const [error, setError] = useState('');
  const [bookingsWithDetails, setBookingsWithDetails] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser); // Debug log
      if (currentUser) {
        // Check if user is admin by querying the users collection
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('email', '==', currentUser.email));
        const userSnapshot = await getDocs(userQuery);
        
        console.log('Admin check - User snapshot:', userSnapshot.docs.length); // Debug log
        
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          console.log('Admin check - User data:', userData); // Debug log
          
          if (userData.role === 'admin') {
            setUser(currentUser);
            await fetchData();
          } else {
            console.log('Regular user detected, redirecting to user dashboard');
            navigate('/dashboard');
            return;
          }
        } else {
          console.log('User not found in database, redirecting to login');
          navigate('/login');
          return;
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Set up real-time listeners for all collections
        const usersRef = collection(db, 'users');
        const stationsRef = collection(db, 'stations');
        const bookingsRef = collection(db, 'bookings');
        const feedbackRef = collection(db, 'feedback');

        // Users listener (only count users with role 'user')
        const usersQuery = query(usersRef, where('role', '==', 'user'));
        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
          const totalUsers = snapshot.size;
          setStats(prev => ({ ...prev, totalUsers }));
        });

        // Stations listener
        const unsubscribeStations = onSnapshot(stationsRef, (snapshot) => {
          const totalStations = snapshot.size;
          setStats(prev => ({ ...prev, totalStations }));
        });

        // Bookings listener
        const unsubscribeBookings = onSnapshot(bookingsRef, (snapshot) => {
          const totalBookings = snapshot.size;
          const recentBookings = snapshot.docs
            .map(doc => {
              const data = doc.data();
              const createdAt = data.createdAt ? 
                (typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt.toDate()) 
                : new Date();
              return {
                id: doc.id,
                ...data,
                createdAt
              };
            })
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5);
          setStats(prev => ({ ...prev, totalBookings, recentBookings }));
        });

        // Feedback listener
        const unsubscribeFeedback = onSnapshot(feedbackRef, (snapshot) => {
          const totalFeedback = snapshot.size;
          const recentFeedback = snapshot.docs
            .map(doc => {
              const data = doc.data();
              const createdAt = data.createdAt ? 
                (typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt.toDate()) 
                : new Date();
              return {
                id: doc.id,
                ...data,
                createdAt
              };
            })
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 4);
          setStats(prev => ({ ...prev, totalFeedback, recentFeedback }));
        });

        return () => {
          unsubscribeUsers();
          unsubscribeStations();
          unsubscribeBookings();
          unsubscribeFeedback();
        };
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Starting to fetch data...'); // Debug log
      
      // Set up real-time listeners for all collections
      const usersRef = collection(db, 'users');
      const stationsRef = collection(db, 'stations');
      const bookingsRef = collection(db, 'bookings');
      const feedbackRef = collection(db, 'feedback');

      // Users listener
      const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      });

      // Stations listener
      const unsubscribeStations = onSnapshot(stationsRef, (snapshot) => {
        const stationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStations(stationsData);
      });

      // Bookings listener with error handling
      const unsubscribeBookings = onSnapshot(bookingsRef, 
        async (snapshot) => {
          console.log('Bookings snapshot received:', snapshot.size); // Debug log
          try {
            const bookingsData = await Promise.all(
              snapshot.docs.map(async (doc) => {
                const data = doc.data();
                console.log('Processing booking:', doc.id, data); // Debug log

                // Get user details if userId exists
                let userName = 'Anonymous';
                if (data.userId) {
                  const userDoc = await getDoc(firestoreDoc(db, 'users', data.userId));
                  if (userDoc.exists()) {
                    userName = userDoc.data().name || 'Anonymous';
                  }
                }

                // Get station details if stationId exists
                let stationName = 'Unknown Station';
                if (data.stationId) {
                  const stationDoc = await getDoc(firestoreDoc(db, 'stations', data.stationId));
                  if (stationDoc.exists()) {
                    stationName = stationDoc.data().name || 'Unknown Station';
                  }
                }

                return {
                  id: doc.id,
                  ...data,
                  userName,
                  stationName
                };
              })
            );
            console.log('Processed bookings data:', bookingsData); // Debug log
            setBookings(bookingsData);
          } catch (error) {
            console.error('Error processing bookings:', error);
            setError('Error loading bookings');
          }
        },
        (error) => {
          console.error('Bookings listener error:', error);
          setError('Failed to load bookings');
        }
      );

      // Feedback listener
      const unsubscribeFeedback = onSnapshot(feedbackRef, (snapshot) => {
        const feedbackData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeedback(feedbackData);
      });

      return () => {
        unsubscribeUsers();
        unsubscribeStations();
        unsubscribeBookings();
        unsubscribeFeedback();
      };
    } catch (error) {
      console.error('Error in fetchData:', error);
      setError('Failed to fetch data');
    }
  };

  const handleAddStation = async (e) => {
    e.preventDefault();
    try {
      const stationsRef = collection(db, 'stations');
      await addDoc(stationsRef, {
        ...newStation,
        status: 'active',
        createdAt: new Date().toISOString()
      });
      setNewStation({
        name: '',
        location: '',
        latitude: '',
        longitude: '',
        fourWheelerSlots: 0,
        twoWheelerSlots: 0
      });
    } catch (error) {
      console.error('Error adding station:', error);
    }
  };

  const handleDeleteStation = async (stationId) => {
    try {
      await deleteDoc(firestoreDoc(db, 'stations', stationId));
    } catch (error) {
      console.error('Error deleting station:', error);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      console.log('Starting user removal process for:', userId);
      
      // Delete all bookings for this user
      const bookingsSnapshot = await getDocs(query(collection(db, 'bookings'), where('userId', '==', userId)));
      console.log('Found bookings to delete:', bookingsSnapshot.size);
      
      const deletePromises = bookingsSnapshot.docs.map(doc => {
        console.log('Deleting booking:', doc.id);
        return deleteDoc(doc.ref);
      });
      
      await Promise.all(deletePromises);
      console.log('All bookings deleted successfully');
      
      // Delete the user document
      console.log('Attempting to delete user document:', userId);
      await deleteDoc(firestoreDoc(db, 'users', userId));
      console.log('User document deleted successfully');
      
      // Delete the user from Firebase Authentication
      console.log('Attempting to delete user from Authentication');
      await deleteUser(auth, userId);
      console.log('User deleted from Authentication successfully');
      
      // Update the users list
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User removed successfully');
    } catch (error) {
      console.error('Error removing user:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      toast.error('Error removing user');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FaCheck className="text-green-500" />;
      case 'rejected':
        return <FaTimes className="text-red-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      default:
        return <FaExclamationCircle className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const overviewCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FaUsers,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Stations',
      value: stats.totalStations,
      icon: FaChargingStation,
      color: 'bg-green-500'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: FaBookmark,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Feedback',
      value: stats.totalFeedback,
      icon: FaComments,
      color: 'bg-yellow-500'
    }
  ];

  const fetchUserDetails = async (userId) => {
    try {
      const userDocRef = firestoreDoc(db, 'users', userId);
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
    const fetchBookingsWithDetails = async () => {
      setLoadingBookings(true);
      try {
        const bookingsRef = collection(db, 'bookings');
        const unsubscribe = onSnapshot(bookingsRef, async (snapshot) => {
          const bookingsPromises = snapshot.docs.map(async (bookingDoc) => {
            const bookingData = bookingDoc.data();
            
            // Fetch user details
            let userData = {};
            if (bookingData.userId) {
              const userDoc = await getDoc(firestoreDoc(db, 'users', bookingData.userId));
              if (userDoc.exists()) {
                userData = userDoc.data();
              }
            }

            // Fetch station details
            let stationData = {};
            if (bookingData.stationId) {
              const stationDoc = await getDoc(firestoreDoc(db, 'stations', bookingData.stationId));
              if (stationDoc.exists()) {
                stationData = stationDoc.data();
              }
            }

            return {
              id: bookingDoc.id,
              ...bookingData,
              userName: userData.name || bookingData.userName || 'Anonymous',
              userEmail: userData.email || bookingData.userEmail || 'No email',
              stationName: stationData.name || bookingData.stationName || 'Unknown Station',
              location: stationData.location || bookingData.location || 'Unknown Location'
            };
          });

          const bookingsWithDetails = await Promise.all(bookingsPromises);
          setBookingsWithDetails(bookingsWithDetails);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to fetch bookings');
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookingsWithDetails();
  }, []);

  const getVehicleIcon = (type) => {
    return type.toLowerCase().includes('4') ? 
      <FaCar className="text-blue-500" /> : 
      <FaMotorcycle className="text-green-500" />;
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleChangeStationPassword = async (station) => {
    setSelectedStation(station);
    setShowPasswordModal(true);
    setPasswordForm({
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    try {
      console.log('Starting password update process for station:', selectedStation.id);
      
      // Get the station owner's email from the station document
      const stationDoc = await getDoc(firestoreDoc(db, 'stations', selectedStation.id));
      if (!stationDoc.exists()) {
        toast.error('Station not found');
        return;
      }

      const stationData = stationDoc.data();
      const ownerEmail = stationData.ownerDetails?.email;

      if (!ownerEmail) {
        toast.error('Station owner email not found');
        return;
      }

      console.log('Found station owner email:', ownerEmail);

      // Update the password using admin SDK
      const updateStationPassword = httpsCallable(functions, 'updateStationPassword');
      const result = await updateStationPassword({ 
        stationId: selectedStation.id, 
        newPassword: passwordForm.newPassword 
      });
      
      console.log('Password update result:', result);
      
      if (result.data.success) {
        toast.success('Station password updated successfully');
        setShowPasswordModal(false);
        setPasswordForm({
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(result.data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating station password:', error);
      let errorMessage = 'Failed to update password';
      
      if (error.code === 'not-found') {
        errorMessage = 'Station owner account not found';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to update this password';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setPasswordError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError('');
  };

  const renderContent = () => {
    const path = location.pathname;
    console.log('Current path:', path);

    switch (path) {
      case '/admin/users':
        // Filter users to only show those with role 'user'
        const regularUsers = users.filter(user => user.role === 'user');
        
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Users Management</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {regularUsers.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                          No regular users found
                        </td>
                      </tr>
                    ) : (
                      regularUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-medium">
                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name || 'No Name'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.phone || 'No Phone'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to remove this user?')) {
                                  handleRemoveUser(user.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

        case '/admin/stations':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Stations</h2>
              <button
                onClick={() => navigate('/admin/add-station')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
              >
                <FaPlus className="mr-2" />
                Add New Station
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Location</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Slots</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.map(station => (
                    <tr key={station.id} className="border-t">
                      <td className="px-6 py-4">{station.name}</td>
                      <td className="px-6 py-4">{station.location}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          station.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {station.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <span className="text-sm">4W: {station.fourWheelerSlots}</span>
                          <span className="text-sm">2W: {station.twoWheelerSlots}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleChangeStationPassword(station)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Change Password"
                          >
                            <FaKey />
                          </button>
                          <button
                            onClick={() => handleDeleteStation(station.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Station"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Change Station Password</h3>
                    <button
                      onClick={() => setShowPasswordModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaClose />
                    </button>
                  </div>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    {passwordError && (
                      <div className="text-red-500 text-sm">{passwordError}</div>
                    )}
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowPasswordModal(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

        case '/admin/bookings':
        console.log('Rendering bookings view, current bookings:', bookings); // Debug log
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Bookings</h2>
            {error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-6 py-3 text-left">User</th>
                      <th className="px-6 py-3 text-left">Station</th>
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-left">Vehicle Type</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No bookings found
                        </td>
                      </tr>
                    ) : (
                      bookings.map(booking => (
                        <tr key={booking.id} className="border-t">
                          <td className="px-6 py-4">{booking.userName || 'Anonymous'}</td>
                          <td className="px-6 py-4">{booking.stationName || 'Unknown Station'}</td>
                          <td className="px-6 py-4">
                            {booking.bookingDate || 'No date'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {booking.vehicleType === '4-wheeler' ? (
                                <FaCar className="text-gray-400 mr-2" />
                              ) : (
                                <FaMotorcycle className="text-gray-400 mr-2" />
                              )}
                              <span>{booking.vehicleType || 'Not specified'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status || 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

        case '/admin/feedback':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Station Feedback</h2>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : feedback.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No feedback available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feedback.map(item => (
                  <div key={item.id} className="bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, index) => (
                            <FaStar
                              key={index}
                              className={`w-5 h-5 ${
                                index < item.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-gray-700">
                          {item.rating}/5
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'No date'}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaUser className="text-gray-400" />
                        <span className="font-medium text-gray-700">{item.userName || 'Anonymous User'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaChargingStation className="text-gray-400" />
                        <span className="text-gray-700">{item.stationName || 'Unknown Station'}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {item.comment || 'No comment provided'}
                      </p>
                    </div>

                    {item.response ? (
                      <div className="border-t pt-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <FaComment className="text-blue-500" />
                          <span className="font-medium text-gray-700">Station Owner Response:</span>
                        </div>
                        <p className="text-gray-600 bg-blue-50 rounded-lg p-3">
                          {item.response}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleDeleteFeedback(item.id)}
                        className="flex items-center space-x-2 text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

        case '/admin-dashboard':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <FaUsers className="text-4xl text-blue-500 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold">Total Users</h3>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <FaChargingStation className="text-4xl text-green-500 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold">Total Stations</h3>
                    <p className="text-3xl font-bold">{stats.totalStations}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <FaCalendarCheck className="text-4xl text-purple-500 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold">Total Bookings</h3>
                    <p className="text-3xl font-bold">{stats.totalBookings}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <FaComments className="text-4xl text-yellow-500 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold">Total Feedback</h3>
                    <p className="text-3xl font-bold">{stats.totalFeedback}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Recent Bookings</h3>
                <div className="space-y-4">
                  {stats.recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FaCalendarCheck className="text-blue-500" />
                        <div>
                          <p className="font-medium">{booking.userName}</p>
                          <p className="text-sm text-gray-500">Station: {booking.stationName}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Feedback */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Recent Feedback</h3>
                <div className="space-y-4">
                  {stats.recentFeedback.map((item) => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FaStar className="text-yellow-500" />
                          <span className="font-medium">{item.rating}/5</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{item.comment}</p>
                      <p className="text-sm text-gray-500 mt-2">Station: {item.stationName}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewCards.map((card, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-full ${card.color}`}>
                        <card.icon className="text-white text-xl" />
                      </div>
                      <span className="text-3xl font-bold text-gray-700">{card.value}</span>
                    </div>
                    <h3 className="text-gray-600 font-medium">{card.title}</h3>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Bookings</h3>
                <div className="space-y-4">
                  {stats.recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FaBookmark className="text-blue-500" />
                        <div>
                          <p className="font-medium">{booking.userName}</p>
                          <p className="text-sm text-gray-500">Station: {booking.stationName}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Feedback Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Feedback</h3>
                <div className="space-y-4">
                  {stats.recentFeedback.map((item) => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FaStar className="text-yellow-500" />
                          <span className="font-medium">{item.rating}/5</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{item.comment}</p>
                      <p className="text-sm text-gray-500 mt-2">Station: {item.stationName}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Users Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Users List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Email</th>
                      <th className="py-2 px-4 border-b">Role</th>
                      <th className="py-2 px-4 border-b">Phone</th>
                      <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{user.name}</td>
                        <td className="py-2 px-4 border-b">{user.email}</td>
                        <td className="py-2 px-4 border-b">{user.role}</td>
                        <td className="py-2 px-4 border-b">{user.phone}</td>
                        <td className="py-2 px-4 border-b">
                          <button
                            onClick={() => handleRemoveUser(user.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
    }
  };

  // Add the handleDeleteFeedback function
  const handleDeleteFeedback = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await deleteDoc(firestoreDoc(db, 'feedback', feedbackId));
        toast.success('Feedback deleted successfully');
      } catch (error) {
        console.error('Error deleting feedback:', error);
        toast.error('Failed to delete feedback');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminDashboard; 