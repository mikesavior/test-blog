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
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useAuth } from '../../context/AuthContext';

function SinglePost() {
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedPost, setEditedPost] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        console.log('[SinglePost] Fetching post with token');
        const response = await fetch(`/api/posts/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Error fetching post');
        }
        
        const data = await response.json();
        console.log('[SinglePost] Successfully fetched post:', data.id);
        setPost(data);
      } catch (error) {
        console.error('[SinglePost] Error:', error);
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
      const formData = new FormData();
      formData.append('title', editedPost.title);
      formData.append('content', editedPost.content);
      formData.append('published', editedPost.published || false);
      formData.append('removedImages', JSON.stringify(removedImages));
      
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
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
    parseInt(user.id) === parseInt(post?.authorId)
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
          <Typography color="textSecondary" gutterBottom>
            Status: {post.published ? 'Published' : 'Draft'}
          </Typography>
          <div 
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{ 
              marginBottom: '2rem',
              textAlign: 'left'
            }}
          />
          
          {post.Images && post.Images.length > 0 && (
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
                      style={{ 
                        height: '100%', 
                        objectFit: 'cover',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(image.url, '_blank')}
                    />
                    <ImageListItemBar
                      title={image.filename}
                      position="bottom"
                      sx={{
                        background:
                          'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}
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
          <Box sx={{ mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="edit-image-upload"
              multiple
              type="file"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setSelectedFiles(prev => [...prev, ...files]);
                
                // Create preview URLs
                const newPreviewUrls = files.map(file => URL.createObjectURL(file));
                setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
              }}
            />
            <label htmlFor="edit-image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AddPhotoAlternateIcon />}
              >
                Add Images
              </Button>
            </label>
          </Box>

          {post.Images && post.Images.length > 0 && (
            <ImageList sx={{ width: '100%', height: 200 }} cols={4} rowHeight={164}>
              {post.Images.filter(img => !removedImages.includes(img.id)).map((image) => (
                <ImageListItem key={image.id}>
                  <img
                    src={image.path}
                    alt={`Post image ${image.id}`}
                    loading="lazy"
                    style={{ height: '100%', objectFit: 'cover' }}
                  />
                  <ImageListItemBar
                    actionIcon={
                      <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        onClick={() => setRemovedImages(prev => [...prev, image.id])}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}

          {previewUrls.length > 0 && (
            <ImageList sx={{ width: '100%', height: 200 }} cols={4} rowHeight={164}>
              {previewUrls.map((url, index) => (
                <ImageListItem key={index}>
                  <img
                    src={url}
                    alt={`New image ${index + 1}`}
                    loading="lazy"
                    style={{ height: '100%', objectFit: 'cover' }}
                  />
                  <ImageListItemBar
                    actionIcon={
                      <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        onClick={() => {
                          setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                          setPreviewUrls(prev => prev.filter((_, i) => i !== index));
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
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
