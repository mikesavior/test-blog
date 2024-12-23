import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function PostsList() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('api/posts');
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
        Blog Posts
      </Typography>
      <Grid container spacing={4}>
        {posts.map((post) => (
          <Grid item xs={12} md={6} key={post.id}>
            <Card>
              <CardContent 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.03)'
                  }
                }}
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                <Typography variant="h5" component="h2">
                  {post.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  By {post.User?.username || 'Anonymous'}
                </Typography>
                <Typography variant="body2" component="p">
                  {post.content.substring(0, 200)}...
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to={`/posts/${post.id}`}>
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
