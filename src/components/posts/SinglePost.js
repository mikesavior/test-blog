import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../../context/AuthContext';

function SinglePost() {
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedPost, setEditedPost] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Error fetching post');
        }
        
        setPost(data);
      } catch (error) {
        setError(error.message || 'Error fetching post');
      }
    };

    fetchPost();
  }, [id]);

  const handleEdit = () => {
    if (!post) return;
    setEditedPost({ ...post });
    setEditDialogOpen(true);
  };

  if (error) return <Typography color="error">{error}</Typography>;
  if (!post) return <Typography>Loading...</Typography>;

  // Debug information
  console.log('Current user:', user);
  console.log('Post author:', post.authorId);
  console.log('Can edit?:', user && (user.isAdmin || user.id === post.authorId));

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedPost)
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
      setEditDialogOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const canEdit = user && (
    user.isAdmin || 
    String(user.id) === String(post?.authorId)
  );
  
  console.log('Edit permission check:', {
    userExists: !!user,
    userId: user?.id,
    userIsAdmin: user?.isAdmin,
    postAuthorId: post?.authorId,
    canEdit,
    userIdType: typeof user?.id,
    authorIdType: typeof post?.authorId,
    rawUser: user,
    rawPost: post
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              {post.title}
            </Typography>
            {canEdit && (
              <IconButton 
                onClick={handleEdit} 
                color="primary"
                sx={{ 
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.2)',
                  },
                  marginLeft: 2
                }}
              >
                <EditIcon />
              </IconButton>
            )}
          </Box>
          <Typography color="textSecondary" gutterBottom>
            By {post.User?.username || 'Anonymous'}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
            {post.content}
          </Typography>
          {canEdit && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ mt: 2 }}
            >
              Edit Post
            </Button>
          )}
        </Paper>
      </Box>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={editedPost?.title || ''}
            onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Content"
            value={editedPost?.content || ''}
            onChange={(e) => setEditedPost({ ...editedPost, content: e.target.value })}
            margin="normal"
            multiline
            rows={8}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default SinglePost;
