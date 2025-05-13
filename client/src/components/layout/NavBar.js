import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AuthContext from '../../context/auth/authContext';

const NavBar = () => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, logout, user } = authContext;

  const onLogout = () => {
    logout();
  };

  const authLinks = (
    <>
      <Button color="inherit" component={Link} to="/dashboard">
        Dashboard
      </Button>
      <Button color="inherit" component={Link} to="/lessons">
        Lessons
      </Button>
      <Button color="inherit" component={Link} to="/practice">
        Practice
      </Button>
      <Button color="inherit" component={Link} to="/profile">
        Profile
      </Button>
      <Button color="inherit" onClick={onLogout}>
        Logout
      </Button>
    </>
  );

  const guestLinks = (
    <>
      <Button color="inherit" component={Link} to="/register">
        Register
      </Button>
      <Button color="inherit" component={Link} to="/login">
        Login
      </Button>
    </>
  );

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
            Hindi Language Tutor
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {isAuthenticated ? authLinks : guestLinks}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar; 