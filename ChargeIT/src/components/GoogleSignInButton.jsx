import React from 'react';
import { auth, db } from '../firebase-config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

const GoogleSignInButton = () => {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: 'user',
          createdAt: new Date(),
          joinDate: new Date().toISOString()
        });
      }

      // Navigate to dashboard after successful sign-in
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert('Error signing in with Google: ' + error.message);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <FcGoogle className="w-5 h-5" />
      <span>Sign in with Google</span>
    </button>
  );
};

export default GoogleSignInButton;

