import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  CardMedia,
  Button,
  Chip
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/posts/my-posts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch posts');
        }
        
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError(error.message);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Posts
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate('/posts/create')}
        sx={{ mb: 4 }}
      >
        Create New Post
      </Button>
      <Grid container spacing={4}>
        {posts.map((post) => (
          <Grid item xs={12} md={6} key={post.id}>
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
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
                <Chip 
                  label={post.published ? 'Published' : 'Draft'} 
                  color={post.published ? 'success' : 'default'}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" component="p">
                  {post.content.substring(0, 200)}...
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to={`/posts/${post.id}`}>
                  Read More
                </Button>
                <Button 
                  size="small" 
                  color="primary" 
                  onClick={() => navigate(`/posts/${post.id}/edit`)}
                >
                  Edit
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {posts.length === 0 && (
        <Typography variant="body1" sx={{ mt: 4, textAlign: 'center' }}>
          You haven't created any posts yet.
        </Typography>
      )}
    </Container>
  );
}

export default MyPosts;
