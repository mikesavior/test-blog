import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to your Dashboard
          </Typography>
          <Typography variant="body1">
            Hello, {user?.username}! This is your personal dashboard.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Dashboard;
