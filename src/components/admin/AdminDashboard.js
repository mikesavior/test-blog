import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin statistics');
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <ArticleIcon sx={{ fontSize: 40, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Total Posts
            </Typography>
            <Typography variant="h3" color="primary">
              {stats?.totalPosts || 0}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Published: {stats?.publishedPosts || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Drafts: {stats?.draftPosts || 0}
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/admin/posts"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Manage Posts
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <PeopleIcon sx={{ fontSize: 40, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Total Users
            </Typography>
            <Typography variant="h3" color="primary">
              {stats?.totalUsers || 0}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Admins: {stats?.adminUsers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Regular Users: {stats?.regularUsers || 0}
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/admin/users"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Manage Users
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminDashboard;
