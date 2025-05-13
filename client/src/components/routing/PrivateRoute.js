import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';

const PrivateRoute = ({ children }) => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, loading } = authContext;

  // TEMPORARY: Allow direct access to all routes for testing
  // Remove this bypass before production
  console.log('WARNING: Authentication bypass enabled for testing');
  return children;

  // Original authentication check (commented out for testing)
  // if (loading) return <div>Loading...</div>;
  // return isAuthenticated ? children : <Navigate to='/login' />;
};

export default PrivateRoute; 