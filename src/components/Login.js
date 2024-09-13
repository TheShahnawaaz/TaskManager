// src/components/Login.js
import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Form, Button, Message, Segment, Header, Loader, Dimmer, Divider, Icon } from 'semantic-ui-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../authUtils'; // Import the utility

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setIsLoggingIn(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setIsLoggingIn(false);
  };

  return (
    <Segment padded='very' style={{ maxWidth: '450px', margin: 'auto' }}>
      <Header as='h2' textAlign='center'>Login</Header>
      <Form onSubmit={handleLogin} error={!!error}>
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
        {error && <Message error content={error} />}
        <Button type="submit" primary fluid disabled={isLoggingIn}>
          {isLoggingIn ? <Loader active inline size='small' /> : 'Login'} 
        </Button>
      </Form>
      <Divider horizontal>Or</Divider>
      <Button color='google plus' fluid onClick={handleGoogleLogin} disabled={isLoggingIn}>
        <Icon inverted name='google'/>
        Login with Google
      </Button>
      <Message>
        Don't have an account? <Link to="/signup">Sign up here</Link>.
      </Message>
    </Segment>
  );
};

export default Login;
