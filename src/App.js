import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/auth/PrivateRoute';
import PostsList from './components/posts/PostsList';
import CreatePost from './components/posts/CreatePost';
import SinglePost from './components/posts/SinglePost';
import PostsManager from './components/admin/PostsManager';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts" element={<PostsList />} />
          <Route path="/posts/:id" element={<SinglePost />} />
          <Route
            path="/posts/create"
            element={
              <PrivateRoute>
                <CreatePost />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/posts"
            element={
              <PrivateRoute>
                <PostsManager />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/posts" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
