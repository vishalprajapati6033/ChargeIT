import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth } from "../firebase-config";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const initialValues = {
  email: "",
  password: "",
};

// Test admin credentials
// Email: admin@chargeit.com
// Password: admin123

const allowedAdminEmails = [
  "ranigayatri456@gmail.com"
];

function Login() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && allowedAdminEmails.includes(currentUser.email)) {
        navigate('/admin-dashboard');
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues: initialValues,
      onSubmit: async (values, action) => {
        try {
          if (!allowedAdminEmails.includes(values.email)) {
            alert("Access Denied: Only registered admins can login.");
            return;
          }

          const userCredential = await signInWithEmailAndPassword(
            auth,
            values.email,
            values.password
          );
          
          if (allowedAdminEmails.includes(userCredential.user.email)) {
            // Store admin password for later use
            localStorage.setItem('adminPassword', values.password);
            navigate('/admin-dashboard');
          } else {
            await signOut(auth);
            toast.error('You do not have admin privileges');
          }
        } catch (error) {
          console.error("Login error:", error.message);
          toast.error('Invalid email or password');
        }
      },
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
        <div className="text-white text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 p-4">
      <div className="max-w-md w-full backdrop-blur-lg bg-white/90 rounded-2xl shadow-2xl p-8 space-y-6 transform transition-all duration-300 hover:scale-[1.02]">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Portal</h1>
          <h3 className="text-lg text-gray-600">
            Access <span className="font-serif font-semibold text-green-600">Charge IT</span> Admin Dashboard
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-semibold"
            >
              Admin Email
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white/50"
              type="email"
              name="email"
              id="email"
              placeholder="ranigayatri456@gmail.com"
              autoComplete="off"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.email && touched.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label 
              className="block text-gray-700 text-sm font-semibold" 
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white/50 pr-10"
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Enter your password"
                autoComplete="off"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-green-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Sign In as Admin
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
            This portal is restricted to authorized administrators only. If you're not an admin, please use the 
            <button 
              onClick={() => navigate("/")}
              className="text-green-600 hover:text-green-500 font-semibold hover:underline transition-colors duration-200 mx-1"
            >
              regular login
            </button>
            instead.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
