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
            flexGrow: 1,
            textAlign: 'center',
            marginRight: 'auto',
            marginLeft: 'auto',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          Blog
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/posts">
            Posts
          </Button>
          {isAuthenticated ? (
            <>
              <Button color="inherit" component={Link} to="/posts/create">
                Create Post
              </Button>
              {user?.isAdmin && (
                <Button color="inherit" component={Link} to="/admin/posts">
                  Manage Posts
                </Button>
              )}
              <Typography variant="body1" component="span" sx={{ mx: 2 }}>
                Welcome, {user?.username}
              </Typography>
              <Button 
                color="error"
                variant="contained"
                onClick={handleLogout}
                sx={{ 
                  fontWeight: 'bold',
                  px: 3,
                  '&:hover': {
                    backgroundColor: '#d32f2f'
                  }
                }}
              >
                LOGOUT
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
