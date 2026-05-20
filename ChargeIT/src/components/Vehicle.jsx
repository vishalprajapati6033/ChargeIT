import React, { useState, useEffect } from "react";
import { db } from "../firebase-config.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase.js";
import { useNavigate } from "react-router-dom";

function Vehicle() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        try {
          const scootersCollectionRef = collection(db, "scooters");
          const data = await getDocs(scootersCollectionRef);
          setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
          setError(null);
        } catch (error) {
          console.error("Error fetching scooters:", error);
          setError("Error loading vehicle data. Please try again.");
        }
      } else {
        setIsLoggedIn(false);
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const getBikeLink = (bikeName) => {
    switch (bikeName) {
      case "OLA S1 pro":
        return "https://www.olaelectric.com/s1-pro";
      case "OLA S1X":
        return "https://www.olaelectric.com/s1-x";
      case "Aether 450 S":
        return "https://www.atherenergy.com/450S";
      case "Aether 450X":
        return "https://www.atherenergy.com/450X";
      case "Okaaya Freedom":
        return "https://okayaev.com/e-scooters/FREEDUM";
      case "Ampere Primus":
        return "https://ampere.greaveselectricmobility.com/primus";
      case "Hero Atria LX":
        return "https://heroelectric.in/bike/atria-lx/";
      case "TVS Iqube":
        return "https://www.tvsmotor.com/electric-vehicle/tvs-iqube/tvs-iqube-variant-details";
      default:
        return "#";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-100 text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center p-4 min-h-screen bg-black">
      <div className="w-full text-center text-green-100 text-3xl font-bold mt-3 mb-5">
        Please choose the vehicle of your choice
      </div>
      {users.map((user) => (
        <div
          key={user.id}
          className="w-full sm:w-1/2 md:w-1/2 lg:w-1/3 xl:w-1/4 p-4"
        >
          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
            <div className="px-6 py-4">
              <h1 className="font-bold text-xl mb-2">Vehicle: {user.name}</h1>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                onClick={() => window.open(getBikeLink(user.name), "_blank")}
              >
                Vehicle Details
              </button>
              {isLoggedIn ? (
                <button
                  className="float-right bg-green-700 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-full"
                  onClick={() => navigate('/book')}
                >
                  Book Now
                </button>
              ) : (
                <p className="text-red-500 mt-2">Please log in to book a vehicle</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Vehicle;