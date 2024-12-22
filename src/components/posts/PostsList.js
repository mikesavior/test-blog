import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

function PostsList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
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
              <CardContent>
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
