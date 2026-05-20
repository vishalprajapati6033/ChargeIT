import React, { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { db } from "../firebase-config.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  getDatabase,
  ref,
  get,
  query as rtdbQuery,
  orderByChild,
  equalTo,
  push,
  set,
  onValue,
} from "firebase/database";
import { useNavigate } from "react-router-dom";
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
import bgImage from "../images/bg.jpg";
import EDAPALLY from "../station_edapally.jpg";
import FORT from "../station_fort.jpg";
import KALMASSERY from "../station_kalamassery.jpg";
import VITYILLA from "../station_vytilla.jpg";

const auth = getAuth();

function BookStation() {
  const [users, setUsers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState("");
  const [batteryPercentage, setBatteryPercentage] = useState("");
  const [bestStation, setBestStation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [slotAvailability, setSlotAvailability] = useState("");
  const [queuedStations, setQueuedStations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [allStations, setAllStations] = useState([]);
  const searchBoxRefCurrentLocation = useRef(null);
  const searchBoxRefDestination = useRef(null);
  const navigate = useNavigate();
  const [selectedStation, setSelectedStation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 16.0, lng: 80 });

  const isLoaded = true; // Bypassed since we use Leaflet
  
  const greenIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
  const blueIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  // Define the Firestore collection reference
  const usersCollectionRef = collection(db, "users");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentUser(user);
        // If user is logged in, check for notifications
        fetchUserNotifications(user.uid);
        fetchUserQueuedStations(user.uid);
        // Fetch stations after user is authenticated
        fetchAllStations();
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const getUsers = async () => {
      try {
        if (!currentUser) return;
        
        const q = query(usersCollectionRef, where("uid", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        setUsers(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error("Error fetching users:", error);
        setErrorMessage("Error loading user data. Please try again.");
      }
    };

    if (currentUser) {
      getUsers();
    }
  }, [currentUser]);

  // Function to fetch user's notifications
  const fetchUserNotifications = (userId) => {
    if (!userId) return;

    const rtdb = getDatabase();
    const notificationsRef = ref(rtdb, `notifications/${userId}`);

    onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        const notificationsList = Object.keys(notificationsData).map((key) => ({
          id: key,
          ...notificationsData[key],
        }));
        setNotifications(notificationsList);
      } else {
        setNotifications([]);
      }
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setErrorMessage("Error loading notifications. Please try again.");
    });
  };

  // Function to fetch user's queued stations
  const fetchUserQueuedStations = (userId) => {
    if (!userId) return;

    const rtdb = getDatabase();
    const queueRef = ref(rtdb, "queue");

    onValue(queueRef, (snapshot) => {
      if (snapshot.exists()) {
        const queueData = snapshot.val();
        const userQueuedStations = Object.keys(queueData)
          .filter((key) => queueData[key].userId === userId)
          .map((key) => ({
            id: key,
            ...queueData[key],
          }));
        setQueuedStations(userQueuedStations);
      } else {
        setQueuedStations([]);
      }
    }, (error) => {
      console.error("Error fetching queued stations:", error);
      setErrorMessage("Error loading queue data. Please try again.");
    });
  };

  // Function to mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    if (!currentUser) return;

    const db = getDatabase();
    const notificationRef = ref(
      db,
      `notifications/${currentUser.uid}/${notificationId}`
    );

    try {
      await set(notificationRef, {
        ...notifications.find((n) => n.id === notificationId),
        read: true,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Function to join the queue for a station
  const joinQueue = async (station, bookingTime) => {
    if (!currentUser) {
      alert("Please log in to join the queue");
      return;
    }

    try {
      const db = getDatabase();
      const queueRef = ref(db, "queue");

      // Check if user is already in queue for this station and time
      const isAlreadyQueued = queuedStations.some(
        (item) =>
          item.stationName === station.station_name &&
          item.preferredTime === bookingTime
      );

      if (isAlreadyQueued) {
        alert("You are already in queue for this station and time slot!");
        return;
      }

      // Add user to queue
      const newQueueItem = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        stationName: station.station_name,
        preferredLocation: station.station_name,
        vehicleType: "four-wheeler", // This would ideally come from user profile or selection
        chargingType: "DC", // This would ideally come from user profile or selection
        preferredTime: bookingTime,
        timestamp: new Date().toISOString(),
      };

      const newQueueItemRef = push(queueRef);
      await set(newQueueItemRef, newQueueItem);

      alert("You'll be notified when a slot becomes available!");
    } catch (error) {
      console.error("Error joining queue:", error);
      alert("Failed to join queue. Please try again.");
    }
  };

  // Function to check slot availability based on current time
  const checkSlotAvailability = async (stationName) => {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();

      // Check if current time is around 7:30 (between 7:00 and 7:59)
      if (currentHour === 7) {
        const db = getDatabase();
        const bookingsRef = ref(db, "bookings");
        const queryForExistingBooking = await get(
          query(
            bookingsRef,
            orderByChild("selectedLocation"),
            equalTo(stationName)
          )
        );

        const existingBookings = queryForExistingBooking.val();
        const nextTimeSlot = "8:00 - 9:00";

        if (existingBookings) {
          const bookingsArray = Object.values(existingBookings);
          const isSlotBooked = bookingsArray.some(
            (booking) => booking.bookingTime === nextTimeSlot
          );

          return isSlotBooked
            ? `8:00 - 9:00 slot NOT available at ${stationName}`
            : `8:00 - 9:00 slot AVAILABLE at ${stationName}`;
        } else {
          return `8:00 - 9:00 slot AVAILABLE at ${stationName}`;
        }
      } else {
        return ""; // Don't show availability for other hours
      }
    } catch (error) {
      console.error("Error checking slot availability:", error);
      return "Error checking slot availability";
    }
  };

  async function fetchBestChargingStation(
    location,
    destinationCoords,
    battery
  ) {
    try {
      const [latitude, longitude] = location.split(",");
      const requestBody = {
        current_location: [parseFloat(latitude), parseFloat(longitude)],
        destination: [destinationCoords.lat(), destinationCoords.lng()],
        battery_percentage: parseFloat(battery),
      };

      console.log("Sending data:", requestBody);

      const response = await fetch(
        "http://127.0.0.1:5000/api/nearest-stations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      console.log("Fetched stations:", result);

      if (!result || result.length === 0) {
        setErrorMessage("No available charging stations found.");
        setBestStation(null);
        return;
      }

      const db = getDatabase();
      let availableStation = null;
      const now = new Date();
      const bookTime = roundUpTime(now);

      for (const station of result) {
        const bookingsRef = ref(db, "bookings");
        const queryForExistingBooking = await get(
          query(
            bookingsRef,
            orderByChild("selectedLocation"),
            equalTo(station.station_name)
          )
        );

        const existingBookings = queryForExistingBooking.val();
        let isSlotAvailable = true;

        if (existingBookings) {
          const bookingsArray = Object.values(existingBookings);
          isSlotAvailable = !bookingsArray.some(
            (booking) => booking.bookingTime + 1 === bookTime
          );
        }

        if (isSlotAvailable) {
          availableStation = station;
          break;
        }
      }

      if (availableStation) {
        // Check the 8:00-9:00 slot availability for this station
        const availability = await checkSlotAvailability(
          availableStation.station_name
        );
        setSlotAvailability(availability);
        setBestStation([availableStation]);
        setErrorMessage("");
      } else {
        setErrorMessage(
          "No available slots at any station. Please try again later."
        );
        setBestStation(null);
        setSlotAvailability("");
      }

      // After processing all stations
      // Check slot availability for all returned stations and add to them
      const stationsWithAvailability = await Promise.all(
        result.map(async (station) => {
          // Check if the slot is available
          const db = getDatabase();
          const bookingsRef = ref(db, "bookings");
          const queryForExistingBooking = await get(
            query(
              bookingsRef,
              orderByChild("selectedLocation"),
              equalTo(station.station_name)
            )
          );

          const existingBookings = queryForExistingBooking.val();
          const now = new Date();
          const bookTime = roundUpTime(now);
          let isSlotAvailable = true;

          if (existingBookings) {
            const bookingsArray = Object.values(existingBookings);
            isSlotAvailable = !bookingsArray.some(
              (booking) => booking.bookingTime === bookTime
            );
          }

          // Check if user is already in queue for this station
          let isInQueue = false;
          if (currentUser) {
            isInQueue = queuedStations.some(
              (item) =>
                item.stationName === station.station_name &&
                item.preferredTime === bookTime
            );
          }

          return {
            ...station,
            isSlotAvailable: isSlotAvailable,
            slotStatus: isSlotAvailable
              ? `${bookTime} slot AVAILABLE`
              : `${bookTime} slot NOT AVAILABLE`,
            currentTimeSlot: bookTime,
            isInQueue: isInQueue,
          };
        })
      );

      setBestStation(stationsWithAvailability);
    } catch (error) {
      console.error("Error fetching best station:", error);
      setErrorMessage("An error occurred while fetching the best station.");
    }
  }

  // Function to round up time to the nearest booking slot
  const roundUpTime = (date) => {
    const minutes = date.getMinutes();
    const hours = date.getHours();

    // Assuming booking slots are in 1-hour intervals, round up to the next hour
    const roundedHour = minutes > 0 ? hours + 1 : hours;
    return `${roundedHour}:00 - ${roundedHour + 1}:00`;
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation is not supported by this browser.");
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const locationString = `${latitude},${longitude}`;
          setCurrentLocation(locationString);
          console.log(
            `📍 Location: ${latitude}, ${longitude} (Accuracy: ${accuracy}m)`
          );

          if (accuracy > 50) {
            console.warn(
              "⚠️ Location accuracy is low. Try moving to an open area."
            );
          }

          resolve(locationString);
        },
        async (error) => {
          console.warn("❌ Geolocation error:", error.message);

          // Fallback to IP-based location if user denies GPS access
          if (error.code === error.PERMISSION_DENIED) {
            console.warn("🌐 Fetching approximate location via IP...");

            try {
              const response = await fetch("https://ipapi.co/json/");
              const data = await response.json();
              if (data.latitude && data.longitude) {
                const ipLocation = `${data.latitude},${data.longitude}`;
                setCurrentLocation(ipLocation);
                resolve(ipLocation);
              } else {
                reject("Failed to fetch location from IP.");
              }
            } catch (err) {
              reject("IP-based location failed: " + err.message);
            }
          } else {
            reject(error.message);
          }
        },
        options
      );
    });
  };

  const handleGetLocationClick = async () => {
    try {
      const location = await getCurrentLocation();
      // Update the current location input box
      if (searchBoxRefCurrentLocation.current) {
        // Replaced Google Geocoder
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setErrorMessage("Failed to get your location. Please enter it manually.");
    }
  };

  const handlePlacesChanged = () => { /* Removed Google Places */ };

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentLocation) {
      setErrorMessage("Please provide your current location.");
      return;
    }

    if (!destination) {
      setErrorMessage("Please enter a valid destination.");
      return;
    }

    if (!batteryPercentage) {
      setErrorMessage("Please enter your battery percentage.");
      return;
    }

    const destCoords = await geocodeAddress(destination);
    if (!destCoords) {
      setErrorMessage("Could not find destination coordinates. Please try a different address.");
      return;
    }
    
    const googleLikeCoords = {
      lat: () => destCoords.lat,
      lng: () => destCoords.lng
    };

    fetchBestChargingStation(
      currentLocation,
      googleLikeCoords,
      batteryPercentage
    );
  };

  function handleBookNow(stationAddress) {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    console.log(`Booking for station: ${stationAddress}`);
    navigate(`/book?address=${stationAddress}`);
  }

  function getImageByAddress(address) {
    switch (address) {
      case "EDAPALLY":
        return EDAPALLY;
      case "FORT":
        return FORT;
      case "KALMASSERY":
        return KALMASSERY;
      case "VITYILLA":
        return VITYILLA;
      default:
        return bgImage;
    }
  }

  // Function to toggle notifications panel
  const toggleNotificationsPanel = () => {
    setShowNotifications(!showNotifications);
  };

  // Update the fetchAllStations function
  const fetchAllStations = async () => {
    try {
      if (!auth.currentUser) {
        console.log('User not authenticated, waiting for auth...');
        return;
      }

      console.log('Starting to fetch stations...');
      const stationsCollectionRef = collection(db, "stations");
      const stationsSnapshot = await getDocs(stationsCollectionRef);
      console.log('Raw stations data:', stationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      if (!stationsSnapshot.empty) {
        const stationsList = stationsSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Processing station:', data);

          // Handle different possible formats of coordinates
          let lat = null;
          let lng = null;

          // Try to get coordinates from different possible fields
          if (data.latitude && data.longitude) {
            lat = parseFloat(data.latitude);
            lng = parseFloat(data.longitude);
          } else if (data.location && typeof data.location === 'object') {
            lat = data.location.latitude || data.location.lat;
            lng = data.location.longitude || data.location.lng;
          } else if (data.coordinates) {
            lat = parseFloat(data.coordinates.latitude || data.coordinates.lat);
            lng = parseFloat(data.coordinates.longitude || data.coordinates.lng);
          }

          console.log('Parsed coordinates for station:', { name: data.name, lat, lng });

          if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
            console.error('Invalid coordinates for station:', data);
            return null;
          }

          return {
            id: doc.id,
            name: data.name || 'Unnamed Station',
            location: data.location || 'Unknown Location',
            status: data.status || 'active',
            availableSlots: data.availableSlots || 0,
            fourWheelerSlots: data.fourWheelerSlots || 0,
            twoWheelerSlots: data.twoWheelerSlots || 0,
            latitude: lat,
            longitude: lng,
            charging_speed: data.charging_speed || '50'
          };
        }).filter(station => station !== null);

        console.log('Final processed stations:', stationsList);
        setAllStations(stationsList);

        // If we have stations, center the map on the first one
        if (stationsList.length > 0 && !currentLocation) {
          const firstStation = stationsList[0];
          const center = {
            lat: firstStation.latitude,
            lng: firstStation.longitude
          };
          console.log('Setting initial map center to:', center);
          setMapCenter(center);
        }
      } else {
        console.log('No stations found in database');
        setAllStations([]);
      }
    } catch (error) {
      console.error("Error fetching stations:", error);
      setErrorMessage("Error loading stations. Please try again.");
    }
  };

  if (loading || !isLoaded) {
    return <p>Loading...</p>;
  }

  return (
    <div name="stations" className="relative overflow-hidden">
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 py-20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-4 animate-fade-in">
              Find Your Perfect Charging Station
            </h2>
            <p className="text-lg text-green-700">
              Enter your details to find the best charging station for your needs
            </p>
          </div>

          {/* Google Map */}
          <div className="mb-8 rounded-xl overflow-hidden shadow-lg border border-green-200">
            <MapContainer
              style={{ width: "100%", height: "400px" }}
              center={
                currentLocation
                  ? {
                      lat: parseFloat(currentLocation.split(",")[0]),
                      lng: parseFloat(currentLocation.split(",")[1]),
                    }
                  : mapCenter
              }
              zoom={12}
            >
              <ChangeView center={
                currentLocation
                  ? {
                      lat: parseFloat(currentLocation.split(",")[0]),
                      lng: parseFloat(currentLocation.split(",")[1]),
                    }
                  : mapCenter
              } zoom={12} />
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {currentLocation && (
                <Marker
                  position={{
                    lat: parseFloat(currentLocation.split(",")[0]),
                    lng: parseFloat(currentLocation.split(",")[1]),
                  }}
                  icon={blueIcon}
                  title="Your Location"
                />
              )}

              {allStations && allStations.length > 0 && allStations.map((station) => (
                  <Marker
                    key={station.id}
                    position={{
                      lat: parseFloat(station.latitude),
                      lng: parseFloat(station.longitude)
                    }}
                    icon={greenIcon}
                    title={station.name}
                    eventHandlers={{
                      click: () => {
                        setSelectedStation({
                          ...station,
                          station_name: station.name,
                          distance_to_station: 0,
                          charging_speed: station.charging_speed,
                          isSlotAvailable: true,
                          total_eta: 0
                        });
                      }
                    }}
                  />
              ))}

              {bestStation && bestStation.map((station, index) => (
                <Marker
                  key={`best-${index}`}
                  position={{
                    lat: parseFloat(station.latitude),
                    lng: parseFloat(station.longitude)
                  }}
                  icon={greenIcon}
                  title={station.station_name}
                  eventHandlers={{
                    click: () => {
                      setSelectedStation(station);
                    }
                  }}
                />
              ))}

              {selectedStation && (
                <Popup
                  position={{
                    lat: parseFloat(selectedStation.latitude || selectedStation.lat),
                    lng: parseFloat(selectedStation.longitude || selectedStation.lng)
                  }}
                  onClose={() => setSelectedStation(null)}
                >
                  <div className="p-3">
                    <h3 className="text-lg font-bold text-green-800 mb-2">
                      {selectedStation.station_name || selectedStation.name}
                    </h3>
                    <div className="space-y-1 text-sm text-green-700">
                      {selectedStation.distance_to_station && (
                        <p>Distance: {selectedStation.distance_to_station.toFixed(2)} km</p>
                      )}
                      <p>Charging Speed: {selectedStation.charging_speed} kW</p>
                      {selectedStation.total_eta && (
                        <p>ETA: {Math.ceil(selectedStation.total_eta / 60)} minutes</p>
                      )}
                      {selectedStation.slotStatus && (
                        <p className={selectedStation.isSlotAvailable ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                          {selectedStation.slotStatus}
                        </p>
                      )}
                    </div>
                    {isLoggedIn && (
                      <button
                        className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all duration-300"
                        onClick={() => handleBookNow(selectedStation.station_name || selectedStation.name)}
                      >
                        Book Now
                      </button>
                    )}
                  </div>
                </Popup>
              )}
            </MapContainer>
          </div>

          {/* Current location display - moved below map */}
          {currentLocation && (
            <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-200 text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Your Current Location:</h3>
              <p className="text-green-700">
                Latitude: {currentLocation.split(",")[0]}, Longitude: {currentLocation.split(",")[1]}
              </p>
            </div>
          )}

          <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-green-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-2">
                    Current Location
                  </label>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter your current location (lat,lng)"
                        value={currentLocation}
                        onChange={(e) => setCurrentLocation(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGetLocationClick}
                      className="px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-800 rounded-lg transition-all duration-300"
                    >
                      Get Location
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-800 mb-2">
                    Destination
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter your destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-800 mb-2">
                    Battery Percentage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={batteryPercentage}
                    onChange={(e) => setBatteryPercentage(e.target.value)}
                    placeholder="Enter battery percentage"
                    className="w-full px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-800 font-bold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Find Best Station
                </button>
              </div>
            </form>
          </div>

          {errorMessage && (
            <div className="mt-6 p-4 bg-red-100 border border-red-200 rounded-xl text-red-800 text-center">
              {errorMessage}
            </div>
          )}

          {bestStation && bestStation.length > 0 && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestStation.map((station, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-green-200 transform transition-all duration-300 hover:scale-105"
                >
                  <img
                    className="w-full h-48 object-cover"
                    src={getImageByAddress(station.station_name)}
                    alt={station.station_name}
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      {station.station_name}
                    </h3>
                    <div className="space-y-2 text-green-700">
                      <p>Distance to Station: {station.distance_to_station.toFixed(2)} km</p>
                      <p>Distance to Destination: {station.distance_to_destination.toFixed(2)} km</p>
                      <p>Charging Speed: {station.charging_speed} kW</p>
                      <p>Total ETA: {Math.ceil(station.total_eta / 60)} minutes</p>
                      <p className={station.isSlotAvailable ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                        {station.slotStatus}
                      </p>
                    </div>

                    {isLoggedIn && station.isSlotAvailable ? (
                      <button
                        className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-800 font-bold rounded-xl transition-all duration-300"
                        onClick={() => handleBookNow(station.station_name)}
                      >
                        Book Now
                      </button>
                    ) : isLoggedIn && !station.isSlotAvailable ? (
                      station.isInQueue ? (
                        <div className="mt-4">
                          <button
                            className="w-full px-4 py-2 bg-gray-200 text-gray-600 font-bold rounded-xl cursor-not-allowed"
                            disabled
                          >
                            In Queue
                          </button>
                          <p className="text-sm text-gray-600 mt-2 text-center">
                            You'll be notified when a slot becomes available
                          </p>
                        </div>
                      ) : (
                        <button
                          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-800 font-bold rounded-xl transition-all duration-300"
                          onClick={() => joinQueue(station, station.currentTimeSlot)}
                        >
                          Notify Me
                        </button>
                      )
                    ) : (
                      <p className="mt-4 text-center text-green-700">
                        Please log in to book or get notifications
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}

export default BookStation;
      