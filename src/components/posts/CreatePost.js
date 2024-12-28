import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import RichTextEditor from '../editor/RichTextEditor';
import ImageUploader from '../common/ImageUploader';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('published', published);
      
      // Append each image to formData
      selectedImages.forEach((image, index) => {
        formData.append('images', image);
      });
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error creating post');
      }
      
      navigate(`/posts/${data.id}`);
    } catch (error) {
      setError(error.message || 'Error creating post');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Post
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <RichTextEditor
              content={content}
              onChange={setContent}
              onImageUpload={async (file) => {
                try {
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
                } catch (error) {
                  console.error('Image upload error:', error);
                  throw error;
                }
              }}
            />
          </Box>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Post Images
            </Typography>
            <ImageUploader
              onImagesSelected={(files) => setSelectedImages(files)}
              existingImages={[]}
              onImageRemove={() => {}}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                color="primary"
              />
            }
            label="Publish immediately"
            sx={{ mt: 2, display: 'block' }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Create Post
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default CreatePost;