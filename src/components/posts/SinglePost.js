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
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext';
import RichTextEditor from '../editor/RichTextEditor';
import ImageUploader from '../common/ImageUploader';

function SinglePost() {
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedPost, setEditedPost] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`/api/posts/${id}`, { headers });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error fetching post');
      }
      
      const data = await response.json();
      setPost(data);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleEdit = () => {
    setEditedPost({ ...post });
    setSelectedImages([]);
    setRemovedImages([]);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No authentication token found');

      const formData = new FormData();
      formData.append('title', editedPost.title);
      formData.append('content', editedPost.content);
      formData.append('published', editedPost.published);
      formData.append('removedImages', JSON.stringify(removedImages));

      selectedImages.forEach(file => {
        const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
        const filename = `${timestamp}_${file.name}`;
        const s3Key = `posts/${id}/${filename}`;
        
        formData.append('images', file);
        formData.append('s3Keys', s3Key);
        formData.append('contentTypes', file.type);
      });

      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update post');
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
      setEditDialogOpen(false);
      setSelectedImages([]);
      setRemovedImages([]);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete post');
      }

      navigate('/my-posts');
    } catch (error) {
      setError(error.message);
    }
  };

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography color="error" variant="h5" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/posts')}
              sx={{ mt: 2 }}
            >
              Back to Posts
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }
  
  if (!post) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Loading...
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  const canEdit = user && (
    user.isAdmin || 
    parseInt(user.id) === parseInt(post.authorId)
  );

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
                  }
                }}
              >
                <EditIcon />
              </IconButton>
            )}
          </Box>

          <Typography color="textSecondary" gutterBottom>
            By {post.User?.username || 'Anonymous'}
          </Typography>
          
          <Typography color="textSecondary" gutterBottom>
            Status: {post.published ? 'Published' : 'Draft'}
          </Typography>

          <div 
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{ marginBottom: '2rem' }}
          />
          
          {post.Images?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Attachments
              </Typography>
              <ImageList sx={{ width: '100%', maxHeight: 400 }} cols={3} rowHeight={200}>
                {post.Images.map((image) => (
                  <ImageListItem key={image.id}>
                    <img
                      src={image.url}
                      alt={`Post image ${image.id}`}
                      loading="lazy"
                      style={{ height: '100%', objectFit: 'cover' }}
                      onClick={() => window.open(image.url, '_blank')}
                    />
                    <ImageListItemBar
                      title={image.filename}
                      position="bottom"
                      sx={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}

          {canEdit && (
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit Post
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                Delete Post
              </Button>
            </Box>
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

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Content
            </Typography>
            <RichTextEditor
              content={editedPost?.content || ''}
              onChange={(newContent) => setEditedPost({ ...editedPost, content: newContent })}
              onImageUpload={async (file) => {
                const formData = new FormData();
                formData.append('image', file);
                
                const token = localStorage.getItem('accessToken');
                const response = await fetch('/api/posts/upload-image', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  },
                  body: formData
                });
                
                if (!response.ok) {
                  throw new Error('Failed to upload image');
                }
                
                const { url } = await response.json();
                return url;
              }}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Images
            </Typography>
            <ImageUploader
              onImagesSelected={setSelectedImages}
              existingImages={editedPost?.Images?.filter(img => !removedImages.includes(img.id)) || []}
              onImageRemove={(id) => setRemovedImages(prev => [...prev, id])}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              variant={editedPost?.published ? "contained" : "outlined"}
              color={editedPost?.published ? "success" : "primary"}
              onClick={() => setEditedPost({ 
                ...editedPost, 
                published: !editedPost.published 
              })}
            >
              {editedPost?.published ? "Published" : "Draft"}
            </Button>
          </Box>
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