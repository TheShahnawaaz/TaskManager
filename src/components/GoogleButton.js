// src/components/GoogleButton.js
import React from 'react';
import { Button, Icon } from 'semantic-ui-react';

const GoogleButton = ({ onClick, loading, disabled, text }) => (
  <Button
    color='google plus'
    fluid
    onClick={onClick}
    loading={loading}
    disabled={disabled}
  >
    <Icon inverted name='google' />
    {text}
  </Button>
);

export default GoogleButton;
