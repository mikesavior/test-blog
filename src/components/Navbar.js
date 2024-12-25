import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  
  console.log('Navbar render:', { isAuthenticated, user });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate away even if there's an error
      navigate('/login');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            textAlign: 'left',
            marginRight: 2
          }}
        >
          Blog
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button color="inherit" component={Link} to="/posts">
            Posts
          </Button>
          {isAuthenticated && (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/my-posts"
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                My Posts
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/posts/create"
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Create Post
              </Button>
              {user?.isAdmin && (
                <>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/admin/posts"
                    sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                  >
                    Manage Posts
                  </Button>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/admin/users"
                    sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                  >
                    Manage Users
                  </Button>
                </>
              )}
              <Typography 
                variant="body1" 
                component="span" 
                sx={{ 
                  mx: 2,
                  display: { xs: 'none', sm: 'inline' } 
                }}
              >
                Welcome, {user?.username}
              </Typography>
              <Button 
                color="error"
                variant="contained"
                onClick={handleLogout}
                sx={{ 
                  fontWeight: 'bold',
                  px: { xs: 1, sm: 3 },
                  '&:hover': {
                    backgroundColor: '#d32f2f'
                  },
                  marginLeft: 2
                }}
              >
                LOGOUT
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
