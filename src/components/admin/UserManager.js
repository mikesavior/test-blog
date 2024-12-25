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
  Switch,
  FormControlLabel,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext';

function UserManager() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { user: currentAdmin } = useAuth();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setCurrentUser({
      ...user,
      password: '' // Clear password field for security
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: currentUser.username,
          email: currentUser.email,
          password: currentUser.password || undefined, // Only send if changed
          isAdmin: currentUser.isAdmin
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        fetchUsers();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleCreateUser = async () => {
    setCurrentUser({
      username: '',
      email: '',
      password: '',
      isAdmin: false
    });
    setEditDialogOpen(true);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        User Management
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleCreateUser}
        sx={{ mb: 4 }}
      >
        Create New User
      </Button>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Admin Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleEdit(user)}
                    disabled={user.id === currentAdmin?.id}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(user.id)}
                    disabled={user.id === currentAdmin?.id}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>
          {currentUser?.id ? 'Edit User' : 'Create User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Username"
              value={currentUser?.username || ''}
              onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              value={currentUser?.email || ''}
              onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              value={currentUser?.password || ''}
              onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
              helperText={currentUser?.id ? "Leave blank to keep current password" : ""}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={currentUser?.isAdmin || false}
                  onChange={(e) => setCurrentUser({ ...currentUser, isAdmin: e.target.checked })}
                />
              }
              label="Admin Status"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {currentUser?.id ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default UserManager;
