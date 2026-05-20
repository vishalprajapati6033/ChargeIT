import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase-config';
import { collection, addDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const AddStation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      } else {
        setAdminEmail(user.email);
        // Store the admin's email for later use
        localStorage.setItem('adminEmail', user.email);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    fourWheelerSlots: 0,
    twoWheelerSlots: 0,
    status: 'active',
    ownerName: '',
    phoneNumber: '',
    panNumber: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Slots') ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      toast.error('You must be logged in to add stations');
      return;
    }

    // Store admin credentials before creating new user
    const adminEmail = auth.currentUser.email;
    const adminPassword = localStorage.getItem('adminPassword');

    try {
      console.log('Starting station creation process...');
      
      // First, create the user document in Firestore
      console.log('Creating user document in Firestore...');
      const usersRef = collection(db, 'users');
      const userData = {
        name: formData.ownerName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        role: 'station_owner',
        createdAt: new Date().toISOString()
      };
      console.log('User data:', userData);
      
      const userDocRef = await addDoc(usersRef, userData);
      console.log('User document created with ID:', userDocRef.id);

      // Then create the Firebase Authentication account
      console.log('Creating Firebase Authentication account...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      console.log('User account created successfully:', userCredential.user.uid);

      // Update the user document with the auth UID
      console.log('Updating user document with auth UID...');
      await updateDoc(userDocRef, {
        uid: userCredential.user.uid
      });

      // Finally, create the station document
      console.log('Creating station document...');
      const stationsRef = collection(db, 'stations');
      const stationData = {
        name: formData.name,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        fourWheelerSlots: formData.fourWheelerSlots,
        twoWheelerSlots: formData.twoWheelerSlots,
        status: formData.status,
        ownerId: userCredential.user.uid,
        ownerDetails: {
          name: formData.ownerName,
          phoneNumber: formData.phoneNumber,
          panNumber: formData.panNumber,
          email: formData.email
        },
        createdAt: new Date().toISOString()
      };
      console.log('Station data:', stationData);
      
      const stationDoc = await addDoc(stationsRef, stationData);
      console.log('Station added successfully:', stationDoc.id);

      // Sign out the station owner
      await signOut(auth);

      // Sign back in as admin
      if (adminEmail && adminPassword) {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      }

      toast.success('Station and owner account created successfully!');
      navigate('/admin/stations');
    } catch (error) {
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to add station. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to perform this action.';
      }
      
      toast.error(errorMessage);
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

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Add New Station</h2>
          <p className="mt-2 text-sm text-gray-600">
            Fill in the details below to add a new charging station and create a station owner account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Station Details</h3>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Station Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter station name"
                required
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter station location"
                required
              />
            </div>

            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                Latitude
              </label>
              <input
                type="text"
                name="latitude"
                id="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter latitude coordinates"
                required
              />
            </div>

            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                Longitude
              </label>
              <input
                type="text"
                name="longitude"
                id="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter longitude coordinates"
                required
              />
            </div>

            <div>
              <label htmlFor="fourWheelerSlots" className="block text-sm font-medium text-gray-700">
                4-Wheeler Slots
              </label>
              <input
                type="number"
                name="fourWheelerSlots"
                id="fourWheelerSlots"
                value={formData.fourWheelerSlots}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                placeholder="Enter number of 4-wheeler slots"
                required
              />
            </div>

            <div>
              <label htmlFor="twoWheelerSlots" className="block text-sm font-medium text-gray-700">
                2-Wheeler Slots
              </label>
              <input
                type="number"
                name="twoWheelerSlots"
                id="twoWheelerSlots"
                value={formData.twoWheelerSlots}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                placeholder="Enter number of 2-wheeler slots"
                required
              />
            </div>

            <div className="col-span-2 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Station Owner Details</h3>
            </div>

            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
                Owner Name
              </label>
              <input
                type="text"
                name="ownerName"
                id="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter owner name"
                required
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter phone number"
                required
              />
            </div>

            <div>
              <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700">
                PAN Number
              </label>
              <input
                type="text"
                name="panNumber"
                id="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter PAN number"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/stations')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Station
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddStation; 