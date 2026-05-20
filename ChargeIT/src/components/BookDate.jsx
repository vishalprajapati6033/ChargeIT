import React, { useState, useEffect } from "react";
import {
  getDatabase,
  ref,
  set,
  push,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Layout from './Layout';

function BookDate() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [bookTime, setBookTime] = useState("");
  const [vehicleType, setVehicleType] = useState("two-wheeler"); // Default value
  const [chargingType, setChargingType] = useState("AC"); // Default value
  const [locations] = useState(["EDAPALLY", "FORT", "KALMASSERY", "VITYILLA"]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const addressFromQuery = searchParams.get("address");

    if (addressFromQuery) {
      setSelectedAddress(addressFromQuery);
      setSelectedLocation(addressFromQuery);
    }

    // Create the "bookedLocations" node
    const db = getDatabase();
    const bookedLocationsRef = ref(db, "bookedLocations");
    get(bookedLocationsRef).then((snapshot) => {
      if (!snapshot.exists()) {
        set(bookedLocationsRef, {});
      }
    });

    // Set the email state whenever the user's authentication state changes
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email);
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    // Cleanup function to unsubscribe from the AuthStateChanged observer
    return unsubscribe;
  }, [navigate]);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data:", {
      name,
      vehicleNumber,
      bookTime,
      selectedLocation,
    });

    if (!name || !vehicleNumber || !bookTime || !selectedLocation) {
      alert("Please fill all the fields");
      return;
    }

    try {
      await checkAndWriteUserData();
      alert("Your booking has been made");
      navigate("/cancel");
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const checkAndWriteUserData = async () => {
    const db = getDatabase();
    const bookingsRef = ref(db, "bookings");

    // Check the number of occurrences of the user's email
    const queryForUserBookings = await get(
      query(bookingsRef, orderByChild("userEmail"), equalTo(email))
    );
    const existingUserBookings = queryForUserBookings.val();
    const userBookingCount = existingUserBookings
      ? Object.keys(existingUserBookings).length
      : 0;

    if (userBookingCount >= 3) {
      throw new Error("You have already made 3 bookings. You cannot make any more bookings.");
    }

    const querySnapshot = await get(
      query(bookingsRef, orderByChild("vehicleNumber"), equalTo(vehicleNumber))
    );
    const existingBookings = querySnapshot.val();

    if (existingBookings) {
      throw new Error(`You have already made a booking with the vehicle number ${vehicleNumber}.`);
    }

    const queryForExistingBooking = await get(
      query(
        bookingsRef,
        orderByChild("selectedLocation"),
        equalTo(selectedLocation)
      )
    );
    const existingBookingsAtSameLocation = queryForExistingBooking.val();

    if (existingBookingsAtSameLocation) {
      const bookingsArray = Object.values(existingBookingsAtSameLocation);
      const conflictingBooking = bookingsArray.find(
        (booking) => booking.bookingTime === bookTime
      );

      if (conflictingBooking) {
        throw new Error(`There is already a booking at ${bookTime} for ${selectedLocation}. Please choose a different time slot or location.`);
      }
    }

    const newBookingRef = push(bookingsRef);
    await set(ref(db, `/bookings/${newBookingRef.key}`), {
      name: name,
      vehicleNumber: vehicleNumber,
      selectedAddress: selectedAddress,
      selectedLocation: selectedLocation,
      bookingTime: bookTime,
      vehicleType: vehicleType,
      chargingType: chargingType,
      userEmail: email,
      date: new Date().toISOString(),
      status: "Booked",
      details: `Booking at ${selectedLocation} for ${bookTime}`
    });
  };

  const generateTimeOptions = () => {
    const options = [];
    const currentHour = new Date().getHours();
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);

    for (let hour = currentHour; hour < 24; hour++) {
      const startTime = `${hour}:00`;
      const endTime = `${hour + 1}:00`;
      options.push(`${startTime} - ${endTime}`);
    }

    for (let hour = 0; hour < currentHour; hour++) {
      const startTime = `${hour}:00`;
      const endTime = `${hour + 1}:00`;
      options.push(`${startTime} - ${endTime} (next-day)`);
    }

    return options;
  };

  const content = loading ? (
    <div className="flex justify-center items-center h-full">
      <div className="text-center">Loading...</div>
    </div>
  ) : (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">New Booking</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
          />
        </div>

        <div>
          <label htmlFor="vehicle-number" className="block text-sm font-medium text-gray-700">Vehicle Number</label>
          <input
            type="text"
            id="vehicle-number"
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            placeholder="Vehicle Number"
          />
        </div>

        <div>
          <label htmlFor="selected-location" className="block text-sm font-medium text-gray-700">Location</label>
          <select
            id="selected-location"
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">Select a location</option>
            {locations.map((location, index) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="vehicle-type" className="block text-sm font-medium text-gray-700">Vehicle Type</label>
          <select
            id="vehicle-type"
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
          >
            <option value="two-wheeler">Two Wheeler</option>
            <option value="four-wheeler">Four Wheeler</option>
          </select>
        </div>

        {vehicleType === "four-wheeler" && (
          <div>
            <label htmlFor="charging-type" className="block text-sm font-medium text-gray-700">Charging Type</label>
            <select
              id="charging-type"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={chargingType}
              onChange={(e) => setChargingType(e.target.value)}
            >
              <option value="AC">AC Charging</option>
              <option value="DC">DC Charging</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="book-time" className="block text-sm font-medium text-gray-700">Time Slot</label>
          <select
            id="book-time"
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={bookTime}
            onChange={(e) => setBookTime(e.target.value)}
          >
            <option value="">Select a time slot</option>
            {generateTimeOptions().map((time, index) => (
              <option key={index} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/cancel')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            View My Bookings
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Book Now
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <Layout user={user} onLogout={handleLogout}>
      {content}
    </Layout>
  );
}

export default BookDate;
