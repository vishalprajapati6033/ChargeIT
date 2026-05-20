import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function AccountRedirect() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Check user role in Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data();
          
          if (userData) {
            switch (userData.role) {
              case 'admin':
                navigate('/admin-dashboard');
                break;
              case 'stationOwner':
                navigate('/station-owner');
                break;
              default:
                navigate('/dashboard');
            }
          } else {
            // If no role is set, redirect to user dashboard
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          navigate('/dashboard');
        }
      } else {
        // If not logged in, redirect to login
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
        <div className="text-white text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return null;
}

export default AccountRedirect; 