import React from 'react';
import { Container, Typography, Paper, Box, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
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
          <Typography variant="body1" gutterBottom>
            Hello, {user?.username}! This is your personal dashboard.
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Button
                  component={Link}
                  to="/my-posts"
                  variant="contained"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  My Posts
                </Button>
                <Button
                  component={Link}
                  to="/posts/create"
                  variant="contained"
                  fullWidth
                >
                  Create New Post
                </Button>
              </Grid>
              
              {user?.isAdmin && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Admin Controls
                  </Typography>
                  <Button
                    component={Link}
                    to="/admin/posts"
                    variant="contained"
                    color="secondary"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Manage Posts
                  </Button>
                  <Button
                    component={Link}
                    to="/admin/users"
                    variant="contained"
                    color="secondary"
                    fullWidth
                  >
                    Manage Users
                  </Button>
                </Grid>
              )}
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Dashboard;
