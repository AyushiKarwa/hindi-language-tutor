import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Divider
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import TranslateIcon from '@mui/icons-material/Translate';
import MicIcon from '@mui/icons-material/Mic';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const Home = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Learn Hindi with AI
              </Typography>
              <Typography variant="h5" paragraph>
                Master Hindi pronunciation, vocabulary, and conversation with our AI-powered tutor
              </Typography>
              <Button 
                variant="contained" 
                size="large" 
                component={RouterLink} 
                to="/register"
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  }
                }}
              >
                Start Learning for Free
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Typography variant="h1" className="hindi-text" sx={{ fontSize: '5rem' }}>
                  नमस्ते
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Key Features
        </Typography>
        <Divider sx={{ mb: 6 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <MicIcon sx={{ fontSize: 60, color: 'primary.main' }} />
              </Box>
              <CardContent>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Speech Recognition
                </Typography>
                <Typography variant="body1">
                  Practice your Hindi pronunciation with our advanced speech recognition technology that provides real-time feedback and correction.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <SchoolIcon sx={{ fontSize: 60, color: 'primary.main' }} />
              </Box>
              <CardContent>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  AI Tutoring
                </Typography>
                <Typography variant="body1">
                  Get personalized lessons and feedback from our AI tutor that adapts to your learning style and progress to help you learn effectively.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <EmojiEventsIcon sx={{ fontSize: 60, color: 'primary.main' }} />
              </Box>
              <CardContent>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Gamified Learning
                </Typography>
                <Typography variant="body1">
                  Stay motivated with our gamified learning experience. Earn achievements, track your progress, and compete with friends.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            How It Works
          </Typography>
          <Divider sx={{ mb: 6 }} />
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h1" sx={{ color: 'primary.main' }}>1</Typography>
                <Typography variant="h5" component="h3" gutterBottom>
                  Create an Account
                </Typography>
                <Typography variant="body1">
                  Sign up for a free account to get started with basic lessons and features.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h1" sx={{ color: 'primary.main' }}>2</Typography>
                <Typography variant="h5" component="h3" gutterBottom>
                  Take Interactive Lessons
                </Typography>
                <Typography variant="body1">
                  Learn Hindi through our structured lessons with interactive exercises and real-time feedback.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h1" sx={{ color: 'primary.main' }}>3</Typography>
                <Typography variant="h5" component="h3" gutterBottom>
                  Practice Speaking
                </Typography>
                <Typography variant="body1">
                  Use our speech recognition feature to practice pronunciation and get instant feedback from our AI.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'secondary.main', color: 'white', py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h2" gutterBottom>
              Ready to Start Learning Hindi?
            </Typography>
            <Typography variant="h6" paragraph>
              Join thousands of students who are already improving their Hindi skills with our AI-powered platform.
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              component={RouterLink} 
              to="/register"
              sx={{ 
                bgcolor: 'white', 
                color: 'secondary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                }
              }}
            >
              Get Started Now
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 