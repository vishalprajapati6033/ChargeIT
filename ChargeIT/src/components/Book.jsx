import React, { useState, useEffect } from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { db } from "../firebase-config.js";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import EDAPALLY from "../station_edapally.jpg";
import FORT from "../station_fort.jpg";
import KALMASSERY from "../station_kalamassery.jpg";
import VITYILLA from "../station_vytilla.jpg";

const auth = getAuth();

function Book() {
  const [users, setUsers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const usersCollectionRef = collection(db, "users");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const getUsers = async () => {
      const data = await getDocs(usersCollectionRef);
      setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    getUsers();
  }, []);

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
        return null;
    }
  }

  function handleBookNow(address) {
    if (isLoggedIn) {
      console.log(`Booking for address: ${address}`);
      navigate(`/book?address=${address}`);
    } else {
      console.log("Please log in or sign up to book a slot");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center">
        <div className="animate-pulse text-green-800 text-xl font-medium">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center p-4">
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

      <div className="container mx-auto p-4 relative z-10">
        <div className="mb-8 text-3xl text-green-800 text-center font-bold animate-fade-in">
          Please choose an address for slot booking
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-xl overflow-hidden shadow-lg bg-white/80 backdrop-blur-sm border border-green-200 transform transition-all duration-300 hover:scale-105"
            >
              <img
                className="w-full h-48 object-cover"
                src={getImageByAddress(user.address)}
                alt={user.address}
              />
              <div className="px-6 py-4">
                <h1 className="font-bold text-xl mb-2 text-green-800">
                  Address: {user.address}
                </h1>
                {isLoggedIn ? (
                  <button
                    className="w-full bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-800 font-bold py-2 px-4 rounded-xl transition-all duration-300"
                    onClick={() => handleBookNow(user.address)}
                  >
                    Book Now
                  </button>
                ) : (
                  <p className="text-green-700">Please log in or sign up to book a slot</p>
                )}
              </div>
            </div>
          ))}
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

export default Book;
