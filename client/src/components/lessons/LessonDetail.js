import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Divider,
  Card,
  CardContent,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LessonContext from '../../context/lesson/lessonContext';
import ProgressContext from '../../context/progress/progressContext';
import Pronunciation from '../audio/Pronunciation';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

// Helper function to ensure voices are loaded
const ensureVoicesLoaded = async () => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      // Chrome requires waiting for the voiceschanged event
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });
};

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const lessonContext = useContext(LessonContext);
  const progressContext = useContext(ProgressContext);
  
  const { currentLesson, getLesson, loading, clearLesson } = lessonContext;
  const { updateLessonProgress } = progressContext;
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answerResult, setAnswerResult] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  
  useEffect(() => {
    getLesson(id);
    
    return () => {
      clearLesson();
    };
    // eslint-disable-next-line
  }, [id]);
  
  // Preload voices when component mounts
  useEffect(() => {
    // Preload voices for text-to-speech
    if (window.speechSynthesis) {
      ensureVoicesLoaded().then(voices => {
        console.log('Preloaded voices:', voices.length);
      }).catch(err => {
        console.error('Failed to preload voices:', err);
      });
    }
  }, []);
  
  if (loading || !currentLesson) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  const { title, level, description, content } = currentLesson;
  
  const handleNext = () => {
    if (activeStep === content.length - 1) {
      // Last step - complete the lesson
      const timeSpent = (Date.now() - startTime) / 1000; // in seconds
      
      // Update progress
      updateLessonProgress(id, {
        score,
        timeSpent
      });
      
      setCompleted(true);
    } else {
      setActiveStep((prevStep) => prevStep + 1);
      setSelectedAnswer('');
      setAnswerResult(null);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(0, prevStep - 1));
    setSelectedAnswer('');
    setAnswerResult(null);
  };
  
  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;
    
    const currentContent = content[activeStep];
    const isCorrect = selectedAnswer === currentContent.correctAnswer;
    
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }
    
    setAnswerResult({
      isCorrect,
      message: isCorrect
        ? 'Correct! Great job!'
        : `Incorrect. The correct answer is: ${currentContent.correctAnswer}`
    });
  };
  
  // Render content based on type
  const renderContent = (item, index) => {
    switch (item.type) {
      case 'text':
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" className={item.content.match(/[\u0900-\u097F]/) ? 'hindi-text' : ''}>
              {item.content}
            </Typography>
            {item.content.match(/[\u0900-\u097F]/) && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  startIcon={<VolumeUpIcon />}
                  onClick={async () => {
                    try {
                      // Cancel any ongoing speech
                      window.speechSynthesis && window.speechSynthesis.cancel();
                      
                      // Extract just the Hindi text to speak
                      const hindiText = item.content.match(/[\u0900-\u097F]+/g)?.join(' ') || '';
                      if (!hindiText) {
                        console.error('No Hindi text found to pronounce');
                        return;
                      }
                      
                      console.log('Speaking Hindi text:', hindiText);
                      
                      // Create speech utterance
                      const utterance = new SpeechSynthesisUtterance(hindiText);
                      utterance.rate = 0.8;
                      
                      // Ensure voices are loaded before trying to use them
                      const voices = await ensureVoicesLoaded();
                      console.log('Available voices:', voices.length);
                      
                      // Find Hindi voice
                      const hindiVoice = voices.find(voice => voice.lang === 'hi-IN');
                      if (hindiVoice) {
                        console.log('Using Hindi voice:', hindiVoice.name);
                        utterance.voice = hindiVoice;
                      } else {
                        console.log('No Hindi voice available, using default');
                      }
                      
                      // Handle errors
                      utterance.onerror = (e) => {
                        console.error('Speech error:', e);
                      };
                      
                      // Speak the text
                      window.speechSynthesis.speak(utterance);
                    } catch (error) {
                      console.error('Error pronouncing text:', error);
                      alert('Could not pronounce text. Please try another browser or refresh the page.');
                    }
                  }}
                >
                  PRONOUNCE HINDI TEXT
                </Button>
              </Box>
            )}
          </Box>
        );
      case 'audio':
        return (
          <Box sx={{ mb: 3 }}>
            <Pronunciation text={item.text} englishText={item.englishText} />
            {item.examples && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Examples:
                </Typography>
                {item.examples.map((example, idx) => (
                  <Pronunciation key={idx} text={example.hindi} englishText={example.english} />
                ))}
              </Box>
            )}
          </Box>
        );
      case 'exercise':
        return (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
                  {item.question}
                </Typography>
                
                {/* Add pronunciation for the question if it contains Hindi text */}
                {item.question.match(/[\u0900-\u097F]/) && (
                  <Button 
                    size="small" 
                    startIcon={<VolumeUpIcon />}
                    onClick={() => {
                      const utterance = new SpeechSynthesisUtterance(item.question);
                      utterance.rate = 0.8;
                      const voices = window.speechSynthesis.getVoices();
                      const hindiVoice = voices.find(voice => voice.lang === 'hi-IN');
                      if (hindiVoice) utterance.voice = hindiVoice;
                      window.speechSynthesis.speak(utterance);
                    }}
                  >
                    Listen
                  </Button>
                )}
              </Box>
              
              {item.audioPrompt && (
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Pronunciation text={item.audioPrompt} englishText={item.audioPromptEnglish} />
                  </Box>
                </Box>
              )}
              
              <FormControl component="fieldset" fullWidth sx={{ my: 2 }}>
                <RadioGroup
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                >
                  {item.options.map((option, idx) => (
                    <FormControlLabel
                      key={idx}
                      value={option}
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <span className={option.match(/[\u0900-\u097F]/) ? 'hindi-text' : ''}>{option}</span>
                          {/* Show audio button for Hindi text options or when optionsAudio is true */}
                          {(option.match(/[\u0900-\u097F]/) || (item.optionsAudio && item.optionsAudio[idx])) && (
                            <Button 
                              size="small" 
                              sx={{ ml: 1, minWidth: 0 }}
                              variant="contained"
                              color="secondary"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                
                                try {
                                  // Cancel any ongoing speech
                                  window.speechSynthesis && window.speechSynthesis.cancel();
                                  
                                  // Try to extract just Hindi text if it's mixed with English
                                  let textToSpeak = option;
                                  if (option.match(/[\u0900-\u097F]/) && option.includes('(')) {
                                    const hindiMatch = option.match(/[\u0900-\u097F]+/g);
                                    textToSpeak = hindiMatch ? hindiMatch.join(' ') : option;
                                  }
                                  
                                  console.log('Speaking text:', textToSpeak);
                                  
                                  const utterance = new SpeechSynthesisUtterance(textToSpeak);
                                  utterance.rate = 0.8;
                                  
                                  // Ensure voices are loaded before trying to use them
                                  const voices = await ensureVoicesLoaded();
                                  console.log('Available voices:', voices.length);
                                  
                                  // Use Hindi voice for Hindi text, default voice otherwise
                                  if (option.match(/[\u0900-\u097F]/)) {
                                    const hindiVoice = voices.find(voice => voice.lang === 'hi-IN');
                                    if (hindiVoice) {
                                      console.log('Using Hindi voice:', hindiVoice.name);
                                      utterance.voice = hindiVoice;
                                    } else {
                                      console.log('No Hindi voice found, using default');
                                    }
                                  }
                                  
                                  // Handle errors
                                  utterance.onerror = (e) => {
                                    console.error('Speech error:', e);
                                  };
                                  
                                  window.speechSynthesis.speak(utterance);
                                } catch (error) {
                                  console.error('Error pronouncing option:', error);
                                }
                              }}
                            >
                              <VolumeUpIcon fontSize="small" />
                            </Button>
                          )}
                        </Box>
                      }
                      disabled={!!answerResult}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              
              {!answerResult && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer}
                >
                  Check Answer
                </Button>
              )}
              
              {answerResult && (
                <Alert severity={answerResult.isCorrect ? 'success' : 'error'} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">{answerResult.message}</Typography>
                  {answerResult.isCorrect ? (
                    <Button 
                      size="small" 
                      startIcon={<VolumeUpIcon />}
                      onClick={() => {
                        // Extract just Hindi text if needed
                        let textToSpeak = selectedAnswer;
                        if (selectedAnswer.match(/[\u0900-\u097F]/) && selectedAnswer.includes('(')) {
                          textToSpeak = selectedAnswer.match(/[\u0900-\u097F]+/g).join(' ');
                        }
                        
                        const utterance = new SpeechSynthesisUtterance(textToSpeak);
                        utterance.rate = 0.8;
                        
                        if (selectedAnswer.match(/[\u0900-\u097F]/)) {
                          const voices = window.speechSynthesis.getVoices();
                          const hindiVoice = voices.find(voice => voice.lang === 'hi-IN');
                          if (hindiVoice) utterance.voice = hindiVoice;
                        }
                        
                        window.speechSynthesis.speak(utterance);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Hear Pronunciation
                    </Button>
                  ) : (
                    <Button 
                      size="small" 
                      startIcon={<VolumeUpIcon />}
                      onClick={() => {
                        // Extract just Hindi text if needed
                        let textToSpeak = item.correctAnswer;
                        if (item.correctAnswer.match(/[\u0900-\u097F]/) && item.correctAnswer.includes('(')) {
                          textToSpeak = item.correctAnswer.match(/[\u0900-\u097F]+/g).join(' ');
                        }
                        
                        const utterance = new SpeechSynthesisUtterance(textToSpeak);
                        utterance.rate = 0.8;
                        
                        if (item.correctAnswer.match(/[\u0900-\u097F]/)) {
                          const voices = window.speechSynthesis.getVoices();
                          const hindiVoice = voices.find(voice => voice.lang === 'hi-IN');
                          if (hindiVoice) utterance.voice = hindiVoice;
                        }
                        
                        window.speechSynthesis.speak(utterance);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Hear Correct Answer
                    </Button>
                  )}
                </Alert>
              )}
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };
  
  return (
    <Container sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/lessons')}
        sx={{ mb: 3 }}
      >
        Back to Lessons
      </Button>
      
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Level: {level}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {activeStep + 1} of {content.length}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {completed ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h5" gutterBottom>
              Lesson Completed!
            </Typography>
            <Typography variant="body1" paragraph>
              Your score: {score}/{content.filter(item => item.type === 'exercise').length}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/lessons')}
              sx={{ mr: 2 }}
            >
              Back to Lessons
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setActiveStep(0);
                setCompleted(false);
                setScore(0);
              }}
            >
              Restart Lesson
            </Button>
          </Box>
        ) : (
          <>
            <Stepper activeStep={activeStep} orientation="vertical">
              {content.map((item, index) => (
                <Step key={index}>
                  <StepLabel>{`${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`}</StepLabel>
                  <StepContent>
                    {renderContent(item, index)}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                disabled={content[activeStep].type === 'exercise' && !answerResult}
              >
                {activeStep === content.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default LessonDetail; 