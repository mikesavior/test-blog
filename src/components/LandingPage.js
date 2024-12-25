import React from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Grid,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link } from 'react-router-dom';
import ArticleIcon from '@mui/icons-material/Article';
import CreateIcon from '@mui/icons-material/Create';
import PeopleIcon from '@mui/icons-material/People';

function LandingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      minHeight: '90vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(45deg, #1a237e 30%, #311b92 90%)'
            : 'linear-gradient(45deg, #42a5f5 30%, #1976d2 90%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant={isMobile ? 'h3' : 'h2'}
            component="h1"
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Welcome to Our Blog
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            sx={{ 
              mb: 4,
              opacity: 0.9,
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Share your thoughts, discover new perspectives, and join our community of writers.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              component={Link}
              to="/posts"
              variant="contained"
              size="large"
              sx={{
                mr: 2,
                mb: { xs: 2, sm: 0 },
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)'
                }
              }}
            >
              Explore Posts
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.9)',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Get Started
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <ArticleIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Read Articles
              </Typography>
              <Typography>
                Discover thoughtful articles on various topics written by our community members.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <CreateIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Write Content
              </Typography>
              <Typography>
                Share your knowledge and experiences with our rich text editor and image support.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <PeopleIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Join Community
              </Typography>
              <Typography>
                Connect with other writers and readers in our growing community.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default LandingPage;
