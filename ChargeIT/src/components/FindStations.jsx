import React, { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, addDoc, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import Layout from './Layout';
import { FaMapMarkerAlt, FaBolt, FaClock, FaCar, FaMotorcycle, FaMap, FaTimes, FaCrosshairs } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function FindStations() {
  const [stations, setStations] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [mapView, setMapView] = useState(false);
  const [locations, setLocations] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedStationForBooking, setSelectedStationForBooking] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    vehicleType: '4-wheeler',
    bookingDate: '',
    bookingTime: '',
    duration: '1',
    notes: ''
  });
  const auth = getAuth();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [markerIcons, setMarkerIcons] = useState(null);

  // Map container style
  const mapContainerStyle = {
    width: '100%',
    height: '100%',
    position: 'relative'
  };

  // Map options
  const mapOptions = {
    zoom: 13,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    disableDefaultUI: false,
    gestureHandling: 'greedy'
  };

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setMapLoading(false);
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('User location obtained:', userPos);
        setUserLocation(userPos);
        setMapCenter(userPos);
        setMapLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationError('Unable to retrieve your location. Please enable location services.');
        setMapLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  // Effect to initialize map when view changes
  useEffect(() => {
    if (mapView) {
      setMapLoading(true);
      getUserLocation();
    }
  }, [mapView]);

  // Effect to update map center when user location changes
  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchStations();
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const fetchStations = async () => {
    try {
      console.log('Fetching stations from database...');
      const stationsSnapshot = await getDocs(collection(db, "stations"));
      console.log('Total stations found:', stationsSnapshot.size);
      
      if (!stationsSnapshot.empty) {
        const stationsList = stationsSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Raw station data:', data);

          // Check if latitude and longitude exist in the correct format
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);

          console.log('Parsed coordinates:', { lat, lng });

          if (isNaN(lat) || isNaN(lng)) {
            console.error('Invalid coordinates for station:', data);
            return null;
          }

          const station = {
            id: doc.id,
            name: data.name || 'Unnamed Station',
            location: data.location || 'Unknown Location',
            status: data.status || 'inactive',
            availableSlots: data.availableSlots || 0,
            fourWheelerSlots: data.fourWheelerSlots || 0,
            twoWheelerSlots: data.twoWheelerSlots || 0,
            position: {
              lat: lat,
              lng: lng
            }
          };
          console.log('Processed station:', station);
          return station;
        }).filter(station => station !== null);

        console.log('Final stations list:', stationsList);
        setStations(stationsList);
        
        // Extract unique locations from stations
        const uniqueLocations = [...new Set(stationsList.map(station => station.location))];
        setLocations(uniqueLocations);

        // If we have stations, center the map on the first one
        if (stationsList.length > 0) {
          const firstStation = stationsList[0];
          console.log('Setting map center to:', firstStation.position);
          setMapCenter(firstStation.position);
        }
      } else {
        console.log('No stations found in database');
        setStations([]);
        setLocations([]);
      }
    } catch (error) {
      console.error("Error fetching stations:", error);
    }
  };

  // Effect to fetch stations when component mounts
  useEffect(() => {
    console.log('Component mounted, fetching stations...');
    fetchStations();
  }, []);

  // Log whenever stations state changes
  useEffect(() => {
    console.log('Stations state updated:', stations);
  }, [stations]);

  // Log whenever map center changes
  useEffect(() => {
    console.log('Map center updated:', mapCenter);
  }, [mapCenter]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleBookNow = (station) => {
    setSelectedStationForBooking(station);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('Please login to make a booking');
        return;
      }

      console.log('Current user UID:', currentUser.uid);
      console.log('Current user email:', currentUser.email);

      // Verify user role
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      console.log('User document exists:', userDocSnap.exists());
      if (userDocSnap.exists()) {
        console.log('User role:', userDocSnap.data().role);
      }
      
      // Allow booking if user exists and is not an admin or station owner
      if (!userDocSnap.exists() || userDocSnap.data().role === 'admin' || userDocSnap.data().role === 'station-owner') {
        alert('You must be a registered user to make bookings');
        return;
      }

      // Check for overlapping bookings
      const bookingDate = new Date(bookingForm.bookingDate);
      const bookingTime = bookingForm.bookingTime;
      const duration = parseInt(bookingForm.duration);

      // Calculate start and end times
      const [hours, minutes] = bookingTime.split(':');
      const startTime = new Date(bookingDate);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0);

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + duration);

      // Query for overlapping bookings
      const bookingsRef = collection(db, 'bookings');
      const overlappingBookingsQuery = query(
        bookingsRef,
        where('stationId', '==', selectedStationForBooking.id),
        where('bookingDate', '==', bookingForm.bookingDate),
        where('status', '==', 'confirmed')
      );

      const overlappingBookingsSnapshot = await getDocs(overlappingBookingsQuery);
      let hasOverlap = false;
      let currentBookings = 0;

      for (const doc of overlappingBookingsSnapshot.docs) {
        const booking = doc.data();
        const [bookingHours, bookingMinutes] = booking.bookingTime.split(':');
        const bookingStartTime = new Date(booking.bookingDate);
        bookingStartTime.setHours(parseInt(bookingHours), parseInt(bookingMinutes), 0);

        const bookingEndTime = new Date(bookingStartTime);
        bookingEndTime.setHours(bookingEndTime.getHours() + parseInt(booking.duration));

        // Check for overlap
        if (
          (startTime >= bookingStartTime && startTime < bookingEndTime) ||
          (endTime > bookingStartTime && endTime <= bookingEndTime) ||
          (startTime <= bookingStartTime && endTime >= bookingEndTime)
        ) {
          // Count overlapping bookings of the same vehicle type
          if (booking.vehicleType === bookingForm.vehicleType) {
            currentBookings++;
          }
        }
      }

      // Check if there are enough slots available for the vehicle type
      const maxSlots = bookingForm.vehicleType === '4-wheeler' 
        ? selectedStationForBooking.fourWheelerSlots 
        : selectedStationForBooking.twoWheelerSlots;

      if (currentBookings >= maxSlots) {
        alert(`No slots available for ${bookingForm.vehicleType} at this time. Maximum slots (${maxSlots}) have been booked.`);
        return;
      }

      const bookingData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        stationId: selectedStationForBooking.id,
        stationName: selectedStationForBooking.name,
        location: selectedStationForBooking.location,
        vehicleType: bookingForm.vehicleType,
        bookingDate: bookingForm.bookingDate,
        bookingTime: bookingForm.bookingTime,
        duration: parseInt(bookingForm.duration),
        notes: bookingForm.notes,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      console.log('Creating booking with data:', bookingData);
      const docRef = await addDoc(bookingsRef, bookingData);
      console.log('Booking created with ID:', docRef.id);
      
      setShowBookingModal(false);
      alert('Booking request submitted successfully!');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  useEffect(() => {
    setMarkerIcons({
      user: new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      }),
      active: new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      }),
      inactive: new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })
    });
    setIsMapInitialized(true);
  }, []);

  const handleLoadScriptError = (error) => {
    console.error('Error loading Google Maps script:', error);
    setMapError('Failed to load Google Maps. Please check your internet connection.');
    setMapLoading(false);
  };

  const filteredStations = selectedLocation
    ? stations.filter(station => station.location === selectedLocation)
    : stations;

  const content = loading ? (
    <div className="flex justify-center items-center h-full">
      <div className="text-center">Loading...</div>
    </div>
  ) : (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Find Charging Stations</h2>
          <div className="flex space-x-2">
            {mapView && (
              <button
                onClick={() => getUserLocation()}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Center on my current location"
              >
                <FaCrosshairs />
                <span>My Location</span>
              </button>
            )}
            <button
              onClick={() => setMapView(!mapView)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaMap />
              <span>{mapView ? 'List View' : 'Map View'}</span>
            </button>
          </div>
        </div>
        
        {/* Location Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Location</label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {mapView ? (
          <div className="h-[500px] rounded-lg overflow-hidden relative">
            {mapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading map...</p>
                  <p className="mt-1 text-sm text-gray-500">Getting your location...</p>
                </div>
              </div>
            )}
            <MapContainer
              style={mapContainerStyle}
              center={mapCenter || { lat: 16.57011, lng: 80.35992 }}
              zoom={13}
              ref={mapRef}
            >
              <ChangeView center={mapCenter || { lat: 16.57011, lng: 80.35992 }} zoom={13} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {isMapInitialized && markerIcons && userLocation && (
                <Marker
                  position={userLocation}
                  icon={markerIcons.user}
                  title="Your Location"
                />
              )}

              {isMapInitialized && markerIcons && stations.map((station) => (
                <Marker
                  key={station.id}
                  position={station.position}
                  icon={station.status === 'active' ? markerIcons.active : markerIcons.inactive}
                  eventHandlers={{
                    click: () => setSelectedStation(station),
                  }}
                  title={station.name}
                />
              ))}

              {isMapInitialized && selectedStation && (
                <Popup
                  position={selectedStation.position}
                  onClose={() => setSelectedStation(null)}
                >
                  <div className="p-2">
                    <h3 className="text-lg font-semibold">{selectedStation.name}</h3>
                    <p>{selectedStation.location}</p>
                    <p>Status: {selectedStation.status}</p>
                  </div>
                </Popup>
              )}
            </MapContainer>
            
            {mapError && (
              <div className="absolute bottom-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
                <p className="text-sm">{mapError}</p>
              </div>
            )}

            {locationError && (
              <div className="absolute bottom-4 left-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50">
                <p className="text-sm">{locationError}</p>
              </div>
            )}
          </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStations.map((station) => (
              <div key={station.id} className="bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <FaMapMarkerAlt className="text-red-500 text-xl" />
                    <h3 className="text-lg font-semibold text-gray-800">{station.name}</h3>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {station.location}
                    </span>
                    <span className={`mt-1 px-2 py-1 text-xs font-medium rounded-full ${station.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {station.status === 'active' ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FaBolt className="text-yellow-500" />
                    <span>{station.fourWheelerSlots + station.twoWheelerSlots} slots available</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FaClock className="text-blue-500" />
                    <span>Open 24/7</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FaCar className="text-green-500" />
                    <span>4-wheeler: {station.fourWheelerSlots} slots</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FaMotorcycle className="text-purple-500" />
                    <span>2-wheeler: {station.twoWheelerSlots} slots</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBookNow(station)}
                  className={`w-full mt-4 px-4 py-2 rounded-lg transition-colors ${
                    station.status === 'active'
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={station.status !== 'active'}
                >
                  {station.status === 'active' ? 'Book Now' : 'Station Closed'}
                </button>
              </div>
            ))}
          </div>
        )}

        {filteredStations.length === 0 && (
          <p className="text-gray-500 text-center py-8">No stations found in the selected location.</p>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedStationForBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Book Charging Slot</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Station
                </label>
                <p className="text-gray-900">{selectedStationForBooking.name}</p>
                <p className="text-sm text-gray-600">{selectedStationForBooking.location}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  value={bookingForm.vehicleType}
                  onChange={(e) => setBookingForm({...bookingForm, vehicleType: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="4-wheeler">4-wheeler</option>
                  <option value="2-wheeler">2-wheeler</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Date
                </label>
                <input
                  type="date"
                  value={bookingForm.bookingDate}
                  onChange={(e) => setBookingForm({...bookingForm, bookingDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Time
                </label>
                <input
                  type="time"
                  value={bookingForm.bookingTime}
                  onChange={(e) => setBookingForm({...bookingForm, bookingTime: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (hours)
                </label>
                <select
                  value={bookingForm.duration}
                  onChange={(e) => setBookingForm({...bookingForm, duration: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Any special requirements or notes..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
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

export default FindStations; 