import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../firebase-config";
import { useFormik } from "formik";
import { signUpSchema } from "../Schemas";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import GoogleSignInButton from "./GoogleSignInButton";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const initialValues = {
  name: "",
  email: "",
  password: "",
  confirm_password: "",
};

function Signup() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        navigate('/dashboard');
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues: initialValues,
      validationSchema: signUpSchema,
      onSubmit: async (values, action) => {
        try {
          // Create user in Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            values.email,
            values.password
          );

          // Create user document in Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: values.name,
            email: values.email,
            joinDate: new Date().toISOString(),
            role: 'user'
          });

          // Reset form
          action.resetForm();
          
          // Navigate to dashboard
          navigate('/dashboard');
        } catch (error) {
          console.error('Error during signup:', error);
          alert(error.message);
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

  if (user && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 p-4">
      <div className="max-w-md w-full backdrop-blur-lg bg-white/90 rounded-2xl shadow-2xl p-8 space-y-6 transform transition-all duration-300 hover:scale-[1.02] animate-float">
        <div className="text-center space-y-2 animate-fade-in-down">
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <h3 className="text-lg text-gray-600">
            Join <span className="font-serif font-semibold text-green-600">Charge IT</span>
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 animate-fade-in-up delay-100">
            <label
              htmlFor="name"
              className="block text-gray-700 text-sm font-semibold"
            >
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter your full name"
              autoComplete="off"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white/50 hover:shadow-md"
            />
            {errors.name && touched.name && (
              <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2 animate-fade-in-up delay-200">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-semibold"
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              autoComplete="off"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white/50 hover:shadow-md"
            />
            {errors.email && touched.email && (
              <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2 animate-fade-in-up delay-300">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-semibold"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Create a password"
                autoComplete="off"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white/50 hover:shadow-md pr-10"
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

          <div className="space-y-2 animate-fade-in-up delay-400">
            <label
              htmlFor="confirm_password"
              className="block text-gray-700 text-sm font-semibold"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                id="confirm_password"
                placeholder="Confirm your password"
                autoComplete="off"
                value={values.confirm_password}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white/50 hover:shadow-md pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-green-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirm_password && touched.confirm_password && (
              <p className="text-red-500 text-xs mt-1 animate-fade-in">{errors.confirm_password}</p>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 animate-fade-in-up delay-500 hover:shadow-lg"
          >
            Create Account
          </button>
        </form>

        <div className="relative animate-fade-in-up delay-600">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/90 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center animate-fade-in-up delay-700">
          <GoogleSignInButton />
        </div>

        <p className="text-center text-gray-600 text-sm animate-fade-in-up delay-800">
          Already have an account?{" "}
          <button 
            onClick={() => navigate("/")} 
            className="text-green-600 hover:text-green-500 font-semibold hover:underline transition-colors duration-200"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;
