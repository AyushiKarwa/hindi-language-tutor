import React, { useReducer } from 'react';
import axios from 'axios';
import AuthContext from './authContext';
import authReducer from './authReducer';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS
} from '../types';

const AuthState = props => {
  const initialState = {
    token: localStorage.getItem('token') || sessionStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    error: null
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load User
  const loadUser = async () => {
    // Check for token in both localStorage and sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // Set token in headers if it exists
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      console.log('Token loaded:', token.substring(0, 15) + '...');
      
      // Special handling for demo token
      if (token === 'demo-token-12345678') {
        console.log('Using demo token, skipping API call');
        
        dispatch({
          type: USER_LOADED,
          payload: {
            id: 'demo123',
            name: 'Demo User',
            email: 'demo@example.com'
          }
        });
        
        return;
      }
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      console.log('No token found in storage');
    }

    try {
      console.log('Attempting to load user data...');
      const res = await axios.get('/api/auth');
      console.log('User data loaded successfully:', res.data);

      dispatch({
        type: USER_LOADED,
        payload: res.data
      });
    } catch (err) {
      console.error('Error loading user:', err.response ? err.response.data : err.message);
      dispatch({ type: AUTH_ERROR });
    }
  };

  // Register User
  const register = async formData => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      console.log('Registering user:', formData.email);
      const res = await axios.post('/api/users', formData, config);
      console.log('Registration successful, token received');

      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data
      });

      loadUser();
    } catch (err) {
      const errorMessage = err.response && err.response.data.msg 
        ? err.response.data.msg 
        : 'Registration failed';
      
      console.error('Registration error:', errorMessage);
      
      dispatch({
        type: REGISTER_FAIL,
        payload: errorMessage
      });
    }
  };

  // Login User
  const login = async formData => {
    // Handle demo login
    if (formData.email === 'demo@example.com' && formData.password === 'demo123456') {
      console.log('Using demo account login');
      
      // Create a demo user token and data
      const demoData = {
        token: 'demo-token-12345678',
        user: {
          id: 'demo123',
          name: 'Demo User',
          email: 'demo@example.com'
        }
      };
      
      // Save token if "remember me" is checked
      if (formData.rememberMe) {
        localStorage.setItem('token', demoData.token);
      } else {
        // Use sessionStorage for session-only storage
        sessionStorage.setItem('token', demoData.token);
      }
      
      dispatch({
        type: LOGIN_SUCCESS,
        payload: demoData
      });
      
      return;
    }
    
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      console.log('Login attempt for:', formData.email);
      const res = await axios.post('/api/auth', formData, config);
      console.log('Login successful, token received');
      
      // Store token based on "remember me" setting
      if (formData.rememberMe) {
        localStorage.setItem('token', res.data.token);
      } else {
        // Use sessionStorage for session-only storage
        sessionStorage.setItem('token', res.data.token);
        // Remove any existing token from localStorage to avoid conflicts
        localStorage.removeItem('token');
      }

      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data
      });

      loadUser();
    } catch (err) {
      const errorMessage = err.response && err.response.data.msg 
        ? err.response.data.msg 
        : 'Login failed - server error';
      
      console.error('Login error:', err.response ? err.response.status : 'No response', errorMessage);
      
      dispatch({
        type: LOGIN_FAIL,
        payload: errorMessage
      });
    }
  };

  // Logout
  const logout = () => {
    console.log('User logged out');
    // Clear tokens from both storages
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    dispatch({ type: LOGOUT });
  };

  // Clear Errors
  const clearErrors = () => dispatch({ type: CLEAR_ERRORS });

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        loadUser,
        login,
        logout,
        clearErrors
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState; 