// src/components/Signup.js
import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Form, Button, Message, Segment, Header, Divider, Icon } from 'semantic-ui-react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithGoogle } from '../authUtils'; // Import the utility

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignup = async () => {
    setError('');
    setIsSigningUp(true);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSigningUp(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Add user details to Firestore (optional)
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        createdAt: serverTimestamp(),
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setIsSigningUp(false);
  };

  const handleGoogleSignup = async () => {
    setError('');
    setIsSigningUp(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setIsSigningUp(false);
  };

  return (
    <Segment padded='very' style={{ maxWidth: '450px', margin: 'auto' }}>
      <Header as='h2' textAlign='center'>Sign Up</Header>
      <Form onSubmit={handleSignup} error={!!error}>
        <Form.Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Form.Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Form.Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <Message error content={error} />}
        <Button type="submit" primary fluid loading={isSigningUp} disabled={isSigningUp}>
          Sign Up
        </Button>
      </Form>
      <Divider horizontal>Or</Divider>
      <Button color='google plus' fluid onClick={handleGoogleSignup} loading={isSigningUp} disabled={isSigningUp}>
        <Icon inverted name='google'/>
        Sign Up with Google
      </Button>
      <Message>
        Already have an account? <Link to="/login">Login here</Link>.
      </Message>
    </Segment>
  );
};

export default Signup;
