import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';
import Alerts from './components/layout/Alerts';
import Home from './components/pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Lessons from './components/lessons/Lessons';
import LessonDetail from './components/lessons/LessonDetail';
import SpeechPractice from './components/practice/SpeechPractice';
import Profile from './components/profile/Profile';
import PrivateRoute from './components/routing/PrivateRoute';

// Context
import AuthState from './context/auth/AuthState';
import AlertState from './context/alert/AlertState';
import LessonState from './context/lesson/LessonState';
import ProgressState from './context/progress/ProgressState';
import AuthContext from './context/auth/authContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF9933', // Saffron (from Indian flag)
    },
    secondary: {
      main: '#138808', // Green (from Indian flag)
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
  },
});

// Main App component wrapper to handle auth state
const AppContent = () => {
  const authContext = useContext(AuthContext);

  useEffect(() => {
    authContext.loadUser();
    // eslint-disable-next-line
  }, []);

  return (
    <Router>
      <div className="App">
        <NavBar />
        <Alerts />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/lessons" element={
              <PrivateRoute>
                <Lessons />
              </PrivateRoute>
            } />
            <Route path="/lessons/:id" element={
              <PrivateRoute>
                <LessonDetail />
              </PrivateRoute>
            } />
            <Route path="/practice" element={
              <PrivateRoute>
                <SpeechPractice />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthState>
      <AlertState>
        <LessonState>
          <ProgressState>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <AppContent />
            </ThemeProvider>
          </ProgressState>
        </LessonState>
      </AlertState>
    </AuthState>
  );
}

export default App; 