import React, { useContext, useEffect } from 'react';
import { Container, Typography, Paper, Box, Grid, Divider, Chip, Avatar, CircularProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AuthContext from '../../context/auth/authContext';
import ProgressContext from '../../context/progress/progressContext';

const Profile = () => {
  const authContext = useContext(AuthContext);
  const progressContext = useContext(ProgressContext);
  
  const { user } = authContext;
  const { progress, getProgress, loading } = progressContext;
  
  useEffect(() => {
    getProgress();
    // eslint-disable-next-line
  }, []);
  
  if (!user) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">Loading user profile...</Typography>
      </Container>
    );
  }
  
  const achievementLabels = {
    '5_lessons': 'Completed 5 Lessons',
    '10_lessons': 'Completed 10 Lessons'
  };
  
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main' }}>
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user.email}
              </Typography>
              <Chip 
                label={progress ? progress.level : 'beginner'} 
                color="primary" 
                sx={{ mt: 2 }} 
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Learning Progress
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : progress ? (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Lessons Completed
                      </Typography>
                      <Typography variant="h4" color="primary.main">
                        {progress.lessonsCompleted ? progress.lessonsCompleted.length : 0}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Exercises Completed
                      </Typography>
                      <Typography variant="h4" color="primary.main">
                        {progress.exercisesCompleted || 0}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Total Practice Time
                      </Typography>
                      <Typography variant="h4" color="primary.main">
                        {progress.totalPracticeTime 
                          ? Math.round(progress.totalPracticeTime / 60) 
                          : 0} min
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Last Active
                      </Typography>
                      <Typography variant="body1">
                        {progress.lastActive 
                          ? new Date(progress.lastActive).toLocaleDateString() 
                          : 'Never'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Achievements
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {progress.achievements && progress.achievements.length > 0 ? (
                      progress.achievements.map((achievement, index) => (
                        <Chip
                          key={index}
                          label={achievementLabels[achievement] || achievement}
                          color="secondary"
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No achievements yet. Keep learning!
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No progress data available. Start learning to see your progress!
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 