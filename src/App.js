// src/App.js
import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import { Button, Container, Menu, Loader, Dimmer } from 'semantic-ui-react';

const App = () => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false); // Loader state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  if (!authChecked) {
    // Show loader while checking auth status
    return (
      <Dimmer active inverted>
        <Loader size='large'>Loading</Loader>
      </Dimmer>
    );
  }

  return (
    <Router>
      <Container style={{ marginTop: '20px' }}>
        <Menu>
          <Menu.Item as={Link} to="/" header>
            Task Manager
          </Menu.Item>
          {!user && (
            <Menu.Menu position='right'>
              <Menu.Item as={Link} to="/login">Login</Menu.Item>
              <Menu.Item as={Link} to="/signup">Signup</Menu.Item>
            </Menu.Menu>
          )}
          {user && (
            <Menu.Menu position='right'>
              <Menu.Item>
                <Button color="red" onClick={handleLogout}>Logout</Button>
              </Menu.Item>
            </Menu.Menu>
          )}
        </Menu>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;

