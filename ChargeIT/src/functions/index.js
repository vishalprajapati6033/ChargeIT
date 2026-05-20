const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Function to get all users
exports.getUsers = functions.https.onCall(async (data, context) => {
  // Check if the user making the request is an admin
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can list users'
    );
  }

  try {
    // List all users
    const listUsersResult = await admin.auth().listUsers();
    return listUsersResult.users;
  } catch (error) {
    console.error('Error listing users:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error listing users'
    );
  }
});

exports.setAdminRole = functions.https.onCall(async (data, context) => {
  // Check if the user making the request is an admin
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can set admin privileges'
    );
  }

  const { email } = data;
  if (!email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email is required'
    );
  }

  try {
    // Get the user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true
    });

    return { success: true, message: `Successfully set admin privileges for ${email}` };
  } catch (error) {
    console.error('Error setting admin role:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error setting admin role'
    );
  }
});

// Function to delete a user
exports.deleteUser = functions.https.onCall(async (data, context) => {
  // Check if the user making the request is an admin
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can delete users'
    );
  }

  const { userId } = data;
  if (!userId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'User ID is required'
    );
  }

  try {
    // Delete the user from Firebase Authentication
    await admin.auth().deleteUser(userId);
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error deleting user'
    );
  }
});

// Function to update station password
exports.updateStationPassword = functions.https.onCall(async (data, context) => {
  // Check if the user making the request is an admin
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can update station passwords'
    );
  }

  const { stationId, newPassword } = data;
  if (!stationId || !newPassword) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Station ID and new password are required'
    );
  }

  try {
    // Get the station document to find the owner's email
    const stationDoc = await admin.firestore().collection('stations').doc(stationId).get();
    if (!stationDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Station not found'
      );
    }

    const stationData = stationDoc.data();
    const ownerEmail = stationData.ownerDetails?.email;

    if (!ownerEmail) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Station owner email not found'
      );
    }

    try {
      // Get the user by email
      const user = await admin.auth().getUserByEmail(ownerEmail);
      console.log(`Found user with email ${ownerEmail}, updating password...`);
      
      // Update the user's password
      await admin.auth().updateUser(user.uid, {
        password: newPassword
      });
      
      console.log(`Successfully updated password for user ${user.uid} (${ownerEmail})`);
      return { success: true, message: 'Station password updated successfully' };
    } catch (authError) {
      console.error('Authentication error:', authError);
      if (authError.code === 'auth/user-not-found') {
        throw new functions.https.HttpsError(
          'not-found',
          'Station owner account not found in Authentication'
        );
      }
      throw new functions.https.HttpsError(
        'internal',
        `Authentication error: ${authError.message}`
      );
    }
  } catch (error) {
    console.error('Error updating station password:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      'internal',
      `Error updating station password: ${error.message}`
    );
  }
}); 