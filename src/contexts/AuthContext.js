// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader, Dimmer } from 'semantic-ui-react';

const AuthContext = createContext();

// Custom hook for easy access to AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!authChecked ? (
        // Show loader while checking auth status
        <Dimmer active inverted>
          <Loader size='large'>Loading</Loader>
        </Dimmer>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
