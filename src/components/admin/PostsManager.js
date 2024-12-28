import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from '../common/ImageUploader';

function PostsManager() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState('all');

  const fetchPosts = async (searchQuery = '', searchByField = 'all') => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams();
      if (searchQuery) {
        queryParams.append('search', searchQuery);
        queryParams.append('searchBy', searchByField);
      }
      
      const response = await fetch(`/api/posts/admin?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch posts');
      }
      
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleEdit = (post) => {
    setCurrentPost(post);
    setSelectedImages([]);
    setRemovedImages([]);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('title', currentPost.title);
      formData.append('content', currentPost.content);
      formData.append('published', currentPost.published || false);
      formData.append('removedImages', JSON.stringify(removedImages));

      selectedImages.forEach((file, index) => {
        const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
        const filename = `${timestamp}_${file.name}`;
        const s3Key = `posts/${currentPost.id}/${filename}`;
        
        formData.append('images', file);
        formData.append('s3Keys', s3Key);
        formData.append('contentTypes', file.type);
      });

      const response = await fetch(`/api/posts/${currentPost.id}`, {
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

      setEditDialogOpen(false);
      fetchPosts();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/posts/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to delete post');
        }

        fetchPosts();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Manage Posts
      </Typography>
      
      <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'flex-end' }}>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Search By</InputLabel>
          <Select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            label="Search By"
          >
            <MenuItem value="all">All Fields</MenuItem>
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="content">Content</MenuItem>
            <MenuItem value="user">Username</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={() => fetchPosts(search, searchBy)}
        >
          Search
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setSearch('');
            setSearchBy('all');
            fetchPosts();
          }}
        >
          Reset
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>{post.title}</TableCell>
                <TableCell>{post.User?.username}</TableCell>
                <TableCell>{post.published ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(post)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(post.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={currentPost?.title || ''}
            onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Content"
            value={currentPost?.content || ''}
            onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
            margin="normal"
            multiline
            rows={4}
          />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Images
            </Typography>
            <ImageUploader
              onImagesSelected={setSelectedImages}
              existingImages={currentPost?.Images?.filter(img => !removedImages.includes(img.id)) || []}
              onImageRemove={(id) => setRemovedImages(prev => [...prev, id])}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              variant={currentPost?.published ? "contained" : "outlined"}
              color={currentPost?.published ? "success" : "primary"}
              onClick={() => setCurrentPost({ 
                ...currentPost, 
                published: !currentPost.published 
              })}
            >
              {currentPost?.published ? "Published" : "Draft"}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PostsManager;