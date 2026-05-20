import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase-config.js";
import { useFormik } from "formik";
import GoogleSignInButton from "./GoogleSignInButton";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const initialValues = {
  email: "",
  password: "",
};

function Login() {
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Check if user is admin in Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data();
          
          if (userData && userData.role === 'admin') {
            console.log('Admin user detected, redirecting to admin dashboard');
            navigate('/admin-dashboard');
          } else {
            console.log('Regular user detected, redirecting to user dashboard');
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          navigate('/dashboard');
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues: initialValues,
      onSubmit: async (values, action) => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          const userData = userDoc.data();

          if (userData && userData.role === 'admin') {
            console.log('Admin login successful, redirecting to admin dashboard');
            navigate('/admin-dashboard');
          } else {
            console.log('User login successful, redirecting to user dashboard');
            navigate('/dashboard');
          }
        } catch (error) {
          console.error("Login error:", error.message);
          setError(error.message);
        }
      },
    });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 p-4">
      <div className="max-w-md w-full backdrop-blur-lg bg-white/90 rounded-2xl shadow-2xl p-8 space-y-6 transform transition-all duration-300 hover:scale-[1.02] animate-float">
        <div className="text-center space-y-2 animate-fade-in-down">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back!</h1>
          <h3 className="text-lg text-gray-600">
            Login to <span className="font-serif font-semibold text-green-600">Charge IT</span>
          </h3>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 animate-fade-in-up delay-100">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-semibold"
            >
              Email Address
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white/50 hover:shadow-md"
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              autoComplete="off"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.email && touched.email && (
              <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2 animate-fade-in-up delay-200">
            <label 
              className="block text-gray-700 text-sm font-semibold" 
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white/50 hover:shadow-md pr-10"
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
              <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.password}</p>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 animate-fade-in-up delay-300 hover:shadow-lg"
          >
            Sign In
          </button>
        </form>

        <div className="relative animate-fade-in-up delay-400">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/90 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center animate-fade-in-up delay-500">
          <GoogleSignInButton />
        </div>

        <p className="text-center text-gray-600 text-sm animate-fade-in-up delay-600">
          New to Charge IT?{" "}
          <button 
            onClick={() => navigate("/signup")} 
            className="text-green-600 hover:text-green-500 font-semibold hover:underline transition-colors duration-200"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
