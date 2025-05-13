import React, { useState, useEffect, useRef } from 'react';
import { 
  Box,
  Button,
  Typography,
  Paper,
  Tooltip,
  Slider,
  Alert
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SpeedIcon from '@mui/icons-material/Speed';

const Pronunciation = ({ text, englishText }) => {
  const [rate, setRate] = useState(0.8);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const voicesLoaded = useRef(false);

  // Pre-load voices when component mounts
  useEffect(() => {
    // Function to initialize voices
    const initVoices = () => {
      return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          voicesLoaded.current = true;
          resolve(voices);
        } else {
          // Chrome requires waiting for the voiceschanged event
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            voicesLoaded.current = true;
            resolve(voices);
          };
        }
      });
    };

    // Initialize voices if Speech Synthesis is available
    if (window.speechSynthesis) {
      initVoices().then(() => {
        console.log('Voices loaded successfully');
      }).catch(err => {
        console.error('Error loading voices:', err);
        setError('Could not load speech voices');
      });
    } else {
      setError('Your browser does not support speech synthesis');
    }

    // Clean up on component unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Function to speak the text using Web Speech API
  const speakText = () => {
    if (!window.speechSynthesis) {
      setError('Sorry, your browser does not support speech synthesis');
      return;
    }
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create a new speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      console.log('Available voices:', voices.length);
      
      // Try to set a Hindi voice if available
      const hindiVoice = voices.find(voice => voice.lang === 'hi-IN');
      if (hindiVoice) {
        console.log('Using Hindi voice:', hindiVoice.name);
        utterance.voice = hindiVoice;
      } else {
        // If no Hindi voice, try to use a different voice
        console.log('No Hindi voice found, using default voice');
      }
      
      // Set speech rate (slower for better learning)
      utterance.rate = rate;
      
      // Set event handlers
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (e) => {
        console.error('Speech error:', e);
        setError(`Error playing audio: ${e.error}`);
        setIsPlaying(false);
      };
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Error in speech synthesis:', err);
      setError('Failed to play audio. Try refreshing the page.');
      setIsPlaying(false);
    }
  };
  
  // Fallback speech using audio element (for browsers without Speech Synthesis support)
  const speakWithFallback = () => {
    // Try with Speech Synthesis first
    if (window.speechSynthesis) {
      speakText();
    } else {
      setError('Your browser does not support speech synthesis. Try using Chrome or Edge.');
    }
  };
  
  const handleRateChange = (event, newValue) => {
    setRate(newValue);
  };
  
  return (
    <Paper elevation={2} sx={{ p: 2, my: 2, bgcolor: '#f8f7ff', borderLeft: '4px solid #6573c3' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" className="hindi-text" sx={{ mr: 2, flexGrow: 1 }}>
          {text}
        </Typography>
        <Tooltip title="Listen to pronunciation">
          <Button
            variant="contained"
            color="primary"
            onClick={speakWithFallback}
            startIcon={<VolumeUpIcon />}
            size="medium"
            disabled={isPlaying}
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            {isPlaying ? 'PLAYING...' : 'LISTEN'}
          </Button>
        </Tooltip>
      </Box>
      
      {englishText && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          "{englishText}"
        </Typography>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <SpeedIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ mr: 2 }}>Speech Rate:</Typography>
        <Slider
          value={rate}
          onChange={handleRateChange}
          min={0.5}
          max={1.0}
          step={0.1}
          sx={{ maxWidth: 150 }}
          size="small"
          disabled={isPlaying}
        />
        <Typography variant="caption" sx={{ ml: 1 }}>
          {rate === 0.5 ? "Slow" : rate === 1.0 ? "Normal" : "Medium"}
        </Typography>
      </Box>
    </Paper>
  );
};

export default Pronunciation; 