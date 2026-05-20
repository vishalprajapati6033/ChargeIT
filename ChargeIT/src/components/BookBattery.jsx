import React, { useState } from "react";
import { ref, push, set } from "firebase/database";
// import { db } from "../firebase-config";
import { getDatabase } from "firebase/database";
import { useNavigate} from "react-router-dom";

function BookBattery() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    vehicleName: "",
    vehicleModel: "",
    numberPlate: "",
  });
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const redirectToHome = () => {
    navigate("/");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, address, phone, vehicleName, vehicleModel, numberPlate } = formData;
    const errors = {};

    if (!name) {
      errors.name = "Name is required";
    }
    if (!email) {
      errors.email = "Email is required";
    }
    if (!address) {
      errors.address = "Address is required";
    }
    if (!phone) {
      errors.phone = "Phone number is required";
    }
    if (!vehicleName) {
      errors.vehicleName = "Vehicle name is required";
    }
    if (!vehicleModel) {
      errors.vehicleModel = "Vehicle model is required";
    }
    if (!numberPlate) {
      errors.numberPlate = "Number plate is required";
    }

    if (Object.keys(errors).length === 0) {
      try {
        const db = getDatabase();
        const batteryRef = ref(db, "battery");
        const newBookingRef = push(batteryRef);
        await set(newBookingRef, formData);
        alert("Booking successful");
        setFormData({ 
          name: "", 
          email: "", 
          address: "", 
          phone: "",
          vehicleName: "",
          vehicleModel: "",
          numberPlate: "",
        });
      } catch (error) {
        console.error("Error submitting booking:", error);
        alert("Error submitting booking. Please try again later.");
      }
    } else {
      setErrors(errors);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
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

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm shadow-xl rounded-xl p-8 transform transition-all duration-300 hover:scale-[1.02]">
            <h1 className="text-3xl font-bold text-center mb-4 text-green-800">EV Lifeline Express</h1>
            <h3 className="text-lg text-green-700 text-center mb-8">
              Please enter your details below
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-green-800 text-sm font-bold mb-2"
                >
                  Name:
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Name"
                  autoComplete="off"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-800 placeholder-green-400"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-green-800 text-sm font-bold mb-2"
                >
                  Email:
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email"
                  autoComplete="off"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-800 placeholder-green-400"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-green-800 text-sm font-bold mb-2"
                >
                  Address:
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  placeholder="Address"
                  autoComplete="off"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-800 placeholder-green-400"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs italic mt-1">{errors.address}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-green-800 text-sm font-bold mb-2"
                >
                  Phone:
                </label>
                <input
                  type="number"
                  name="phone"
                  id="phone"
                  placeholder="+91"
                  autoComplete="off"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-800 placeholder-green-400"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs italic mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="vehicleName"
                  className="block text-green-800 text-sm font-bold mb-2"
                >
                  Vehicle Name:
                </label>
                <input
                  type="text"
                  name="vehicleName"
                  id="vehicleName"
                  placeholder="e.g., Tesla Model 3"
                  autoComplete="off"
                  value={formData.vehicleName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-800 placeholder-green-400"
                />
                {errors.vehicleName && (
                  <p className="text-red-500 text-xs italic mt-1">{errors.vehicleName}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="vehicleModel"
                  className="block text-green-800 text-sm font-bold mb-2"
                >
                  Vehicle Model Number:
                </label>
                <input
                  type="text"
                  name="vehicleModel"
                  id="vehicleModel"
                  placeholder="e.g., TM3-2023"
                  autoComplete="off"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-800 placeholder-green-400"
                />
                {errors.vehicleModel && (
                  <p className="text-red-500 text-xs italic mt-1">{errors.vehicleModel}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="numberPlate"
                  className="block text-green-800 text-sm font-bold mb-2"
                >
                  Number Plate:
                </label>
                <input
                  type="text"
                  name="numberPlate"
                  id="numberPlate"
                  placeholder="e.g., MH01AB1234"
                  autoComplete="off"
                  value={formData.numberPlate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-800 placeholder-green-400"
                />
                {errors.numberPlate && (
                  <p className="text-red-500 text-xs italic mt-1">{errors.numberPlate}</p>
                )}
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Submit
                </button>
              </div>
            </form>
            <div className="text-center mt-6">
              <button
                onClick={redirectToHome}
                className="text-green-800 hover:text-green-600 font-medium transition-colors duration-300"
              >
                Back to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
}

export default BookBattery;
