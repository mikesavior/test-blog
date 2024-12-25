import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  CardMedia,
  Button 
} from '@mui/material';
import { sanitizeHtml } from '../../utils/textUtils';
import { Link, useNavigate } from 'react-router-dom';

function PostsList() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await response.json();
        setPosts(data.filter(post => post.published));
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
      }
    };

    fetchPosts();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Blog Posts
      </Typography>
      <Grid container spacing={4}>
        {posts.map((post) => (
          <Grid item xs={12} md={6} lg={4} key={post.id}>
            <Card>
              <CardContent>
                {post.Images?.length > 0 && post.Images[0]?.url && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={post.Images[0].url}
                    alt={post.title}
                    sx={{ 
                      objectFit: 'cover',
                      mb: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.9
                      }
                    }}
                    onClick={() => navigate(`/posts/${post.id}`)}
                  />
                )}
                <Typography variant="h5" component="h2">
                  {post.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  By {post.User?.username || 'Anonymous'} • {
                    new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  } • {post.published ? 'Published' : 'Draft'}
                </Typography>
                <Typography variant="body2" component="p">
                  {sanitizeHtml(post.content).substring(0, 200)}...
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  variant="contained" 
                  color="primary"
                  component={Link} 
                  to={`/posts/${post.id}`}
                  sx={{ mt: 2 }}
                >
                  Read More
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default PostsList;
