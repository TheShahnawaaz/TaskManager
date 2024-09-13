// src/components/GoogleAuthButton.js
import React from 'react';
import { Button, Icon } from 'semantic-ui-react';
import { signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const GoogleAuthButton = ({ onSuccess, onError }) => {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      if (onError) onError(error);
    }
  };

  return (
    <Button color='google plus' fluid onClick={handleGoogleSignIn}>
      <Icon inverted name='google'/> Sign in with Google
    </Button>
  );
};

export default GoogleAuthButton;
