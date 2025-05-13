import React, { useContext, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';
import ProgressContext from '../../context/progress/progressContext';

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const progressContext = useContext(ProgressContext);

  const { user } = authContext;
  const { progress, getProgress, loading } = progressContext;

  useEffect(() => {
    getProgress();
    // eslint-disable-next-line
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {user && (
        <Typography variant="h6" gutterBottom>
          Welcome, {user.name}!
        </Typography>
      )}
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Progress Overview
            </Typography>
            
            {loading ? (
              <Typography>Loading your progress...</Typography>
            ) : progress ? (
              <Box>
                <Typography variant="body1">
                  Level: {progress.level}
                </Typography>
                <Typography variant="body1">
                  Lessons Completed: {progress.lessonsCompleted ? progress.lessonsCompleted.length : 0}
                </Typography>
                <Typography variant="body1">
                  Exercises Completed: {progress.exercisesCompleted || 0}
                </Typography>
                <Typography variant="body1">
                  Total Practice Time: {progress.totalPracticeTime ? Math.round(progress.totalPracticeTime / 60) : 0} minutes
                </Typography>
              </Box>
            ) : (
              <Typography>Start learning to see your progress!</Typography>
            )}
            
            <Button 
              variant="contained" 
              color="primary" 
              component={Link} 
              to="/lessons"
              sx={{ mt: 3 }}
            >
              Continue Learning
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Practice Speech
            </Typography>
            <Typography variant="body1" paragraph>
              Improve your Hindi pronunciation with real-time feedback using our speech recognition tool.
            </Typography>
            
            <Button 
              variant="contained" 
              color="secondary" 
              component={Link} 
              to="/practice"
              sx={{ mt: 1 }}
            >
              Start Practice
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 