import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Chip,
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import MicIcon from '@mui/icons-material/Mic';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LessonContext from '../../context/lesson/lessonContext';

const Lessons = () => {
  const lessonContext = useContext(LessonContext);
  const { lessons, getLessons, loading } = lessonContext;
  
  useEffect(() => {
    getLessons();
    // eslint-disable-next-line
  }, []);
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  // Function to get a summary of what's in the lesson
  const getLessonSummary = (lesson) => {
    if (!lesson.content) return [];
    
    const textCount = lesson.content.filter(item => item.type === 'text').length;
    const audioCount = lesson.content.filter(item => item.type === 'audio').length;
    const exerciseCount = lesson.content.filter(item => item.type === 'exercise').length;
    
    const summary = [];
    if (textCount) summary.push({ type: 'Text', count: textCount, icon: <BookIcon color="primary" /> });
    if (audioCount) summary.push({ type: 'Audio', count: audioCount, icon: <MicIcon color="secondary" /> });
    if (exerciseCount) summary.push({ type: 'Exercise', count: exerciseCount, icon: <AssignmentIcon color="warning" /> });
    
    return summary;
  };
  
  return (
    <Container sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4, mb: 4, bgcolor: '#f8f8ff' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Hindi Lessons
        </Typography>
        
        <Typography variant="body1" paragraph>
          Select a lesson below to start learning Hindi with our interactive content and speech practice exercises.
          Each lesson includes detailed explanations, pronunciation guides, and interactive quizzes.
        </Typography>
      </Paper>
      
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {lessons.map(lesson => {
          const summary = getLessonSummary(lesson);
          return (
            <Grid item xs={12} sm={12} md={6} key={lesson.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <Box 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    p: 2,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="h5" component="h2">
                    {lesson.title}
                  </Typography>
                  <Chip 
                    label={lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)} 
                    color={getLevelColor(lesson.level)} 
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" color="text.primary" gutterBottom>
                      What You'll Learn
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                    {lesson.description}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Lesson Contents:
                  </Typography>
                  
                  <List dense>
                    {summary.map((item, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={`${item.count} ${item.type}${item.count > 1 ? 's' : ''}`} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button 
                    component={Link} 
                    to={`/lessons/${lesson.id}`} 
                    variant="contained" 
                    color="primary"
                    size="large"
                    fullWidth
                    sx={{ 
                      py: 1.5,
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}
                  >
                    Start Lesson
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      {lessons.length === 0 && (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          No lessons available. Please check back later.
        </Typography>
      )}
    </Container>
  );
};

export default Lessons; 