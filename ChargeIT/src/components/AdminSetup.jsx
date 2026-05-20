import React from 'react';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { doc, setDoc, getDocs, query, collection, where, updateDoc } from 'firebase/firestore';

const AdminSetup = () => {
  const setupAdmin = async () => {
    try {
      const email = 'ranigayatri456@gmail.com';
      
      // First, find the user in Firestore and forcefully upgrade their role to admin
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
          role: 'admin'
        });
      }

      // Try to create the auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        'Ranigayatri456@'
      );

      // If successful and they didn't exist in Firestore, create their document
      if (querySnapshot.empty) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          role: 'admin',
          name: 'Admin User',
          joinDate: new Date().toISOString()
        });
      }

      alert('Admin account created successfully! You can now log in.');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        try {
          await sendPasswordResetEmail(auth, 'ranigayatri456@gmail.com');
          alert('SUCCESS: We upgraded your existing account to Admin! \n\nHOWEVER, because you already created this account previously, you must log in with your ORIGINAL password. \n\nIf you forgot it, we just sent a Password Reset Email to your inbox!');
        } catch (resetError) {
          alert('SUCCESS: We upgraded your existing account to Admin! Please use your original password to log in.');
        }
      } else {
        console.error('Error creating admin:', error);
        alert('Error creating admin account: ' + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Admin Setup</h2>
        <p className="mb-4">Click below to create the admin account:</p>
        <p className="text-sm text-gray-600 mb-4">
          Email: ranigayatri456@gmail.com<br />
          Password: Ranigayatri456@
        </p>
        <button
          onClick={setupAdmin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Admin Account
        </button>
      </div>
    </div>
  );
};

export default AdminSetup; 