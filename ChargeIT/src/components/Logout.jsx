import React, { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase.js";
import { useNavigate } from "react-router-dom";
import { FaUser, FaUserCog, FaChargingStation, FaHistory, FaSignOutAlt, FaBookmark } from "react-icons/fa";

function Logout() {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const redirectToMyBooking = () => navigate("/cancel");
  const redirectToHistory = () => navigate("/history");
  const redirectToLogin = () => navigate("/login");
  const redirectToAdminLogin = () => navigate("/admin-login");
  const redirectToStationLogin = () => navigate("/station-login");

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

      <div className="w-full max-w-2xl relative z-10">
        <div className="backdrop-blur-lg bg-white/80 rounded-2xl p-8 shadow-2xl border border-green-200 transform transition-all duration-500 hover:scale-[1.02]">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-4 tracking-tight animate-fade-in">
              ChargeIT Dashboard
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full animate-pulse"></div>
          </div>

          {user ? (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-green-700 text-lg animate-fade-in-up">
                  Welcome back,{" "}
                  <span className="font-semibold text-green-800">{user.email}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={redirectToMyBooking}
                  className="group flex items-center justify-center space-x-3 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-800 p-4 rounded-xl transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-200"
                >
                  <FaBookmark className="text-xl group-hover:scale-110 transition-transform" />
                  <span>My Bookings</span>
                </button>

                <button
                  onClick={redirectToHistory}
                  className="group flex items-center justify-center space-x-3 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-800 p-4 rounded-xl transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-400"
                >
                  <FaHistory className="text-xl group-hover:scale-110 transition-transform" />
                  <span>History</span>
                </button>

                <button
                  onClick={logout}
                  className="group flex items-center justify-center space-x-3 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-800 p-4 rounded-xl transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-600"
                >
                  <FaSignOutAlt className="text-xl group-hover:scale-110 transition-transform" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-2xl text-green-800 text-center font-medium mb-8 animate-fade-in">
                Choose your login type
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={redirectToLogin}
                  className="group flex flex-col items-center justify-center p-6 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 rounded-xl transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-200"
                >
                  <FaUser className="text-3xl text-green-800 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-green-800 font-medium">User</span>
                </button>

                <button
                  onClick={redirectToAdminLogin}
                  className="group flex flex-col items-center justify-center p-6 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 rounded-xl transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-400"
                >
                  <FaUserCog className="text-3xl text-green-800 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-green-800 font-medium">Admin</span>
                </button>

                <button
                  onClick={redirectToStationLogin}
                  className="group flex flex-col items-center justify-center p-6 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 rounded-xl transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-600"
                >
                  <FaChargingStation className="text-3xl text-green-800 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-green-800 font-medium">Station Owner</span>
                </button>
              </div>
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
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Logout;
