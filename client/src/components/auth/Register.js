import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Link,
  Grid,
  Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alert/alertContext';

const Register = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);
  
  const { register, error, clearErrors, isAuthenticated } = authContext;
  const { setAlert } = alertContext;
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    if (error) {
      setAlert(error, 'error');
      clearErrors();
    }
    // eslint-disable-next-line
  }, [error, isAuthenticated]);
  
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });
  
  const { name, email, password, password2 } = user;
  
  const onChange = e => setUser({ ...user, [e.target.name]: e.target.value });
  
  const onSubmit = e => {
    e.preventDefault();
    
    if (name === '' || email === '' || password === '') {
      setAlert('Please enter all fields', 'error');
    } else if (password !== password2) {
      setAlert('Passwords do not match', 'error');
    } else {
      console.log('Registering user:', { name, email, password });
      register({
        name,
        email,
        password
      });
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoComplete="name"
                name="name"
                variant="outlined"
                required
                fullWidth
                id="name"
                label="Full Name"
                autoFocus
                value={name}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password2"
                label="Confirm Password"
                type="password"
                id="password2"
                value={password2}
                onChange={onChange}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            REGISTER
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 