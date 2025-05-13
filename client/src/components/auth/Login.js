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
  Alert,
  InputLabel,
  Divider,
  CircularProgress,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alert/alertContext';

const Login = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);
  
  const { login, error, clearErrors, isAuthenticated, loading } = authContext;
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
    email: '',
    password: ''
  });
  
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const { email, password } = user;
  
  const onChange = e => {
    setUser({ ...user, [e.target.name]: e.target.value });
    
    // Clear validation errors when user types
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: null
      });
    }
  };
  
  const validate = () => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const onSubmit = e => {
    e.preventDefault();
    
    if (validate()) {
      console.log('Login attempt:', { email, rememberMe });
      login({
        email,
        password,
        rememberMe
      });
    }
  };
  
  const handleDemoLogin = () => {
    const demoCredentials = {
      email: 'demo@example.com',
      password: 'demo123456'
    };
    
    setUser(demoCredentials);
    login(demoCredentials);
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ 
        mt: { xs: 4, sm: 8 }, 
        p: { xs: 3, sm: 4 }, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        borderRadius: 2
      }}>
        <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
          <LockOutlinedIcon fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h4" gutterBottom fontWeight="500">
          Welcome Back
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Log in to your Hindi Language Tutor account to continue your learning journey
        </Typography>
        
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mb: 2 }}>
            <InputLabel sx={{ mb: 1 }}>Email Address *</InputLabel>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={onChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1
                }
              }}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <InputLabel sx={{ mb: 1 }}>Password *</InputLabel>
            <TextField
              variant="outlined"
              required
              fullWidth
              name="password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={onChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1
                }
              }}
            />
          </Box>
          
          <FormControlLabel
            control={
              <Checkbox 
                value="remember" 
                color="primary" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            }
            label="Remember me"
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ 
              mt: 2, 
              mb: 2, 
              py: 1.5,
              borderRadius: 1,
              fontSize: '1rem'
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'SIGN IN'}
          </Button>
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">OR</Typography>
          </Divider>
          
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={handleDemoLogin}
            disabled={loading}
            sx={{ 
              mb: 2, 
              py: 1.5,
              borderRadius: 1
            }}
          >
            TRY WITH DEMO ACCOUNT
          </Button>
          
          <Grid container sx={{ mt: 2 }}>
            <Grid item xs>
              <Link component={RouterLink} to="#" variant="body2" sx={{ color: 'primary.main' }}>
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2" sx={{ color: 'primary.main' }}>
                Don't have an account? Sign Up
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 