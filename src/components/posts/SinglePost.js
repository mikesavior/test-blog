import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Box } from '@mui/material';
import axios from 'axios';

function SinglePost() {
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const { id } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        setError('Error fetching post');
      }
    };

    fetchPost();
  }, [id]);

  if (error) return <Typography color="error">{error}</Typography>;
  if (!post) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {post.title}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            By {post.User?.username || 'Anonymous'}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {post.content}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default SinglePost;
