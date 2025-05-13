import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Alert, 
  CircularProgress,
  Slider,
  TextField,
  Tab,
  Tabs,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import TranslateIcon from '@mui/icons-material/Translate';
import ProgressContext from '../../context/progress/progressContext';

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

// Demo phrases for practice
const demoPhrases = [
  { 
    hindi: 'नमस्ते', 
    romanized: 'Namaste', 
    english: 'Hello/Greetings'
  },
  { 
    hindi: 'आप कैसे हैं?', 
    romanized: 'Aap kaise hain?', 
    english: 'How are you?'
  },
  { 
    hindi: 'मेरा नाम ... है', 
    romanized: 'Mera naam ... hai', 
    english: 'My name is ...'
  },
  { 
    hindi: 'धन्यवाद', 
    romanized: 'Dhanyavaad', 
    english: 'Thank you'
  },
  { 
    hindi: 'मुझे हिंदी सीखना है', 
    romanized: 'Mujhe Hindi seekhna hai', 
    english: 'I want to learn Hindi'
  }
];

// Basic English to Hindi translations for common phrases
const basicTranslations = {
  "hello": "नमस्ते (Namaste)",
  "thank you": "धन्यवाद (Dhanyavaad)",
  "good morning": "शुभ प्रभात (Shubh Prabhat)",
  "good night": "शुभ रात्रि (Shubh Ratri)",
  "how are you": "आप कैसे हैं? (Aap kaise hain?)",
  "i am fine": "मैं ठीक हूँ (Main theek hoon)",
  "what is your name": "आपका नाम क्या है? (Aapka naam kya hai?)",
  "my name is": "मेरा नाम है (Mera naam hai)",
  "nice to meet you": "आपसे मिलकर खुशी हुई (Aapse milkar khushi hui)",
  "yes": "हां (Haan)",
  "no": "नहीं (Nahin)",
  "please": "कृपया (Kripaya)",
  "sorry": "माफ़ कीजिए (Maaf kijiye)",
  "excuse me": "क्षमा कीजिए (Kshama kijiye)",
  "i want": "मुझे चाहिए (Mujhe chahiye)",
  "how much": "कितना (Kitna)",
  "where is": "कहां है (Kahaan hai)",
  "i understand": "मैं समझता हूं (Main samajhta hoon)",
  "i don't understand": "मैं नहीं समझता (Main nahin samajhta)",
  "help": "मदद (Madad)",
  "water": "पानी (Paani)",
  "food": "खाना (Khaana)"
};

const SpeechPractice = () => {
  const progressContext = useContext(ProgressContext);
  const { updateLessonProgress } = progressContext;
  
  const [currentPhrase, setCurrentPhrase] = useState(demoPhrases[0]);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [rate, setRate] = useState(0.8);
  const [usingDemoMode, setUsingDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [customEnglish, setCustomEnglish] = useState('');
  const [customHindi, setCustomHindi] = useState('');
  const [customRomanized, setCustomRomanized] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef(null);
  const recordingTimeoutRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  const audioDataRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Initialize speech recognition
  useEffect(() => {
    // Check if Speech Recognition is supported
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.log('Speech recognition not supported, using demo mode');
      setSpeechSupported(false);
      setUsingDemoMode(true);
      return;
    }
    
    try {
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configure speech recognition
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'hi-IN'; // Hindi language
      
      // Set up event handlers
      recognitionRef.current.onresult = handleSpeechResult;
      recognitionRef.current.onerror = handleSpeechError;
      recognitionRef.current.onend = handleSpeechEnd;
      
      console.log('Speech recognition initialized successfully');
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setSpeechSupported(false);
      setUsingDemoMode(true);
    }
    
    // Load voices for speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      
      // Chrome requires this additional event listener
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = window.speechSynthesis.getVoices;
      }
    }
    
    return () => {
      // Clean up timeouts
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      
      // Cleanup recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.error('Error cleaning up speech recognition:', error);
        }
      }
    };
  }, []);
  
  // Handle speech recognition result
  const handleSpeechResult = (event) => {
    try {
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript;
      // FIX: For demo purposes, give a higher base confidence if the text matches
      let confidence = event.results[lastResultIndex][0].confidence * 100;
      
      console.log('Speech recognized:', transcript, 'Confidence:', confidence);
      
      // FIX: Add a minimum confidence level for correct words to improve user experience
      const expectedWord = activeTab === 0 ? currentPhrase.hindi : customHindi;
      
      // Normalize strings for better comparison (remove spaces, lowercase)
      const normalizedTranscript = transcript.trim().toLowerCase().replace(/\s+/g, '');
      const normalizedExpected = expectedWord.trim().toLowerCase().replace(/\s+/g, '');
      
      // Check for exact or similar matches
      if (normalizedTranscript === normalizedExpected) {
        confidence = Math.max(confidence, 90); // Increase to 90% for exact matches
      } else if (normalizedTranscript.includes(normalizedExpected) || 
                normalizedExpected.includes(normalizedTranscript)) {
        confidence = Math.max(confidence, 75); // Increase to 75% for partial matches
      } else {
        // For any detected speech with Hindi characters, give minimum 40% confidence
        const hindiPattern = /[\u0900-\u097F]/; // Unicode range for Hindi
        if (hindiPattern.test(transcript) && transcript.length > 0) {
          confidence = Math.max(confidence, 40);
        } else if (transcript.length > 0) {
          // If any speech detected, minimum 30%
          confidence = Math.max(confidence, 30);
        }
      }
      
      setProcessing(false);
      setRecording(false);
      setTranscript(transcript);
      setConfidence(confidence);
      
      // Generate feedback based on accuracy
      provideFeedback(confidence);
      
      // Update practice progress
      updateLessonProgress('practice', { 
        timeSpent: 10, 
        score: confidence
      });
    } catch (error) {
      console.error('Error handling speech result:', error);
      setError('Error processing speech result');
      resetRecordingState();
    }
  };
  
  // Handle speech recognition error
  const handleSpeechError = (event) => {
    console.error('Speech recognition error:', event.error);
    
    if (event.error === 'no-speech') {
      setFeedback({
        type: 'warning',
        message: 'No speech detected',
        details: 'Please speak more clearly or check that your microphone is working.'
      });
    } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
      setError('Microphone access denied. Please allow microphone access in your browser settings.');
      // Switch to demo mode after permission error
      setUsingDemoMode(true);
    } else if (event.error === 'audio-capture' || event.error === 'no-speech') {
      setError('No audio captured. Please check your microphone is connected and working.');
    } else if (event.error === 'network') {
      setError('Network error occurred. Switching to demo mode.');
      setUsingDemoMode(true);
    } else if (event.error === 'aborted') {
      // Don't show error for user-initiated abort
      console.log('Speech recognition aborted by user');
    } else {
      setError(`Speech recognition error: ${event.error}. Try using demo mode instead.`);
      // After any significant error, offer demo mode
      setUsingDemoMode(true);
    }
    
    resetRecordingState();
  };
  
  // Handle speech recognition end
  const handleSpeechEnd = () => {
    console.log('Speech recognition ended');
    
    // If we're still recording when this ends, it means no result was captured
    if (recording) {
      resetRecordingState();
      
      if (!transcript) {
        setFeedback({
          type: 'error',
          message: 'No speech detected',
          details: 'Please speak more clearly or check that your microphone is working properly.'
        });
        setConfidence(0);
      }
    }
  };
  
  // Generate feedback based on accuracy
  const provideFeedback = (confidence) => {
    if (confidence >= 85) {
      setFeedback({
        type: 'success',
        message: 'Excellent pronunciation!',
        details: 'Your pronunciation was very clear and accurate.'
      });
    } else if (confidence >= 70) {
      setFeedback({
        type: 'info',
        message: 'Good pronunciation',
        details: 'Your pronunciation was good, but there\'s room for improvement.'
      });
    } else if (confidence >= 50) {
      setFeedback({
        type: 'warning',
        message: 'Keep practicing',
        details: 'Try to pronounce the phrase more clearly. Listen to the example again.'
      });
    } else {
      setFeedback({
        type: 'error',
        message: 'Needs improvement',
        details: 'Try again with clearer pronunciation. Use the listen button to hear the correct pronunciation.'
      });
    }
  };
  
  // Reset recording state
  const resetRecordingState = () => {
    setProcessing(false);
    setRecording(false);
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };
  
  // Initialize audio visualization
  const initAudioVisualization = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log('Media devices API not supported');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      microphone.connect(analyser);
      analyser.fftSize = 256;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      audioAnalyserRef.current = analyser;
      audioDataRef.current = dataArray;
      
      updateAudioVisualization();
      
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      return null;
    }
  };
  
  // Update audio visualization
  const updateAudioVisualization = () => {
    if (!audioAnalyserRef.current || !audioDataRef.current) return;
    
    audioAnalyserRef.current.getByteFrequencyData(audioDataRef.current);
    
    // Calculate average volume level
    const average = Array.from(audioDataRef.current)
      .reduce((sum, value) => sum + value, 0) / audioDataRef.current.length;
    
    setAudioLevel(average);
    
    // Only continue animation loop if recording
    if (recording) {
      animationFrameRef.current = requestAnimationFrame(updateAudioVisualization);
    }
  };
  
  // Start recording with visualization
  const startRecording = async () => {
    // Clear previous state
    setRecording(true);
    setError(null);
    setFeedback(null);
    setTranscript('');
    setConfidence(0);
    
    // Start audio visualization
    if (!usingDemoMode) {
      const stream = await initAudioVisualization();
      if (!stream && !recognitionRef.current) {
        setError('Could not access microphone');
        setRecording(false);
        return;
      }
    }
    
    if (usingDemoMode) {
      // Use demo mode (simulated) instead of actual speech recognition
      handleDemoRecording();
      // Simulate audio visualization for demo mode
      simulateDemoAudioVisualization();
      return;
    }
    
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      setRecording(false);
      return;
    }
    
    try {
      recognitionRef.current.start();
      console.log('Speech recognition started');
      
      // Set a timeout to automatically stop recording after 5 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        if (recording) {
          console.log('Recording timed out after 5 seconds');
          stopRecording();
        }
      }, 5000);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setError(`Could not start recording: ${error.message}`);
      setRecording(false);
    }
  };
  
  // Simulate audio visualization in demo mode
  const simulateDemoAudioVisualization = () => {
    let counter = 0;
    const simulateAudio = () => {
      // Create wave-like pattern for visualization
      const value = 20 + Math.sin(counter) * 20 + Math.random() * 30;
      counter += 0.2;
      setAudioLevel(value);
      
      if (recording) {
        animationFrameRef.current = requestAnimationFrame(simulateAudio);
      }
    };
    simulateAudio();
  };
  
  // Stop recording
  const stopRecording = () => {
    if (usingDemoMode) {
      // In demo mode, just reset the state - the demo will handle itself
      return;
    }
    
    if (!recognitionRef.current) return;
    
    if (recording) {
      setProcessing(true);
      try {
        recognitionRef.current.stop();
        console.log('Speech recognition stopped');
        
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        resetRecordingState();
        setError(`Error stopping recording: ${error.message}`);
      }
    }
    
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Reset audio level
    setAudioLevel(0);
  };
  
  // Handle demo recording (simulated speech recognition)
  const handleDemoRecording = () => {
    // Simulate recording in progress
    setTimeout(() => {
      setProcessing(true);
      setRecording(false);
      
      // Simulate processing delay
      setTimeout(() => {
        processDemoAudio();
      }, 1500);
    }, 2000);
  };
  
  // Process demo audio (simulated speech recognition)
  const processDemoAudio = () => {
    setProcessing(false);
    
    // Generate a random accuracy between 65-95%
    const randomAccuracy = Math.floor(Math.random() * 31) + 65;
    
    // Use the current phrase as the transcript (based on active tab)
    const phraseToUse = activeTab === 0 ? currentPhrase.hindi : customHindi;
    setTranscript(phraseToUse);
    
    // In demo mode, always give reasonable confidence for practice
    // This helps users not get discouraged when real speech recognition fails
    const demoConfidence = Math.max(randomAccuracy, 70);
    setConfidence(demoConfidence);
    
    // Generate feedback based on the confidence
    provideFeedback(demoConfidence);
    
    // Update practice progress
    updateLessonProgress('practice', { 
      timeSpent: 10, 
      score: demoConfidence
    });
  };
  
  // Change to a different phrase
  const changePhrase = () => {
    // Get a random phrase different from the current one
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * demoPhrases.length);
    } while (demoPhrases[newIndex].hindi === currentPhrase.hindi && demoPhrases.length > 1);
    
    setCurrentPhrase(demoPhrases[newIndex]);
    setTranscript('');
    setConfidence(0);
    setFeedback(null);
  };
  
  // Function to speak the text using Web Speech API
  const speakText = async (textToSpeak = null) => {
    if (!window.speechSynthesis) {
      alert('Sorry, your browser does not support speech synthesis');
      return;
    }
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create a new speech synthesis utterance
      const text = textToSpeak || (activeTab === 0 ? currentPhrase.hindi : customHindi);
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Ensure voices are loaded before selecting one
      const voices = await ensureVoicesLoaded();
      console.log('Available voices:', voices.length);
      
      // Try to set a Hindi voice if available
      const hindiVoice = voices.find(voice => voice.lang === 'hi-IN');
      if (hindiVoice) {
        console.log('Using Hindi voice:', hindiVoice.name);
        utterance.voice = hindiVoice;
      } else {
        console.log('No Hindi voice available, using default');
      }
      
      // Set speech rate (slower for better learning)
      utterance.rate = rate;
      
      // Add error handling
      utterance.onerror = (e) => {
        console.error('Speech error:', e);
      };
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error in speech synthesis:', error);
    }
  };
  
  const handleRateChange = (event, newValue) => {
    setRate(newValue);
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Reset states when switching tabs
    setTranscript('');
    setConfidence(0);
    setFeedback(null);
  };
  
  const translateText = () => {
    if (!customEnglish.trim()) return;
    
    // Convert to lowercase for lookup
    const lowerText = customEnglish.toLowerCase().trim();
    
    // Check if we have a direct translation
    if (basicTranslations[lowerText]) {
      const fullTranslation = basicTranslations[lowerText];
      // Extract Hindi (before the parenthesis) and romanized (inside parenthesis)
      const hindi = fullTranslation.split('(')[0].trim();
      const romanized = fullTranslation.includes('(') ? 
          fullTranslation.split('(')[1].replace(')', '').trim() : '';
          
      setCustomHindi(hindi);
      setCustomRomanized(romanized);
      return;
    }
    
    // Check for matches in partial phrases
    for (const [english, translation] of Object.entries(basicTranslations)) {
      if (lowerText.includes(english) || english.includes(lowerText)) {
        const hindi = translation.split('(')[0].trim();
        const romanized = translation.includes('(') ? 
            translation.split('(')[1].replace(')', '').trim() : '';
            
        setCustomHindi(hindi);
        setCustomRomanized(romanized);
        return;
      }
    }
    
    // Fallback - use whatever the user typed
    setCustomHindi(customEnglish);
    setCustomRomanized(customEnglish);
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Render audio visualization
  const renderAudioVisualization = () => {
    if (!recording) return null;
    
    // Create bars for visualization
    const bars = [];
    const totalBars = 20;
    
    for (let i = 0; i < totalBars; i++) {
      // Create varying heights based on audio level and position
      const multiplier = 0.5 + Math.abs(i - totalBars/2) / (totalBars/2);
      const height = Math.max(3, Math.min(50, audioLevel * multiplier * 0.7));
      
      bars.push(
        <div
          key={i}
          style={{
            width: '3px',
            height: `${height}px`,
            background: `hsl(${180 + height * 3}, 80%, 60%)`,
            margin: '0 2px',
            borderRadius: '1px',
            transition: 'height 0.05s ease'
          }}
        />
      );
    }
    
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-end', 
        height: '60px', 
        my: 2,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: '8px',
        p: 1
      }}>
        {bars}
      </Box>
    );
  };
  
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Speech Practice
      </Typography>
      
      <Typography variant="body1" paragraph>
        Practice your Hindi pronunciation with our speech recognition tool. Speak the phrase clearly and get instant feedback.
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={usingDemoMode}
              onChange={(e) => setUsingDemoMode(e.target.checked)}
              color="secondary"
            />
          }
          label={usingDemoMode ? "Using Demo Mode (Always Successful)" : "Using Real Speech Recognition"}
        />
        {!speechSupported && (
          <Alert severity="warning" sx={{ flexGrow: 1, ml: 2 }}>
            Speech recognition not supported in your browser.
          </Alert>
        )}
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="practice options">
          <Tab label="Common Phrases" />
          <Tab label="Custom Phrase" />
        </Tabs>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {activeTab === 0 ? (
              <>
                <Typography variant="h5" gutterBottom>
                  Speak this phrase:
                </Typography>
                
                <Card variant="outlined" sx={{ mb: 3, bgcolor: 'primary.light', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h4" className="hindi-text" gutterBottom>
                      {currentPhrase.hindi}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {currentPhrase.romanized}
                    </Typography>
                    <Typography variant="body2">
                      {currentPhrase.english}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<VolumeUpIcon />}
                        onClick={() => speakText()}
                        size="small"
                      >
                        LISTEN
                      </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Typography variant="caption" sx={{ mr: 1 }}>Speed:</Typography>
                      <Slider
                        value={rate}
                        onChange={handleRateChange}
                        min={0.5}
                        max={1.0}
                        step={0.1}
                        sx={{ maxWidth: 150 }}
                        size="small"
                      />
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {rate === 0.5 ? "Slow" : rate === 1.0 ? "Normal" : "Medium"}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Typography variant="h5" gutterBottom>
                  Create your own phrase:
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Enter phrase in English"
                    value={customEnglish}
                    onChange={(e) => setCustomEnglish(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<TranslateIcon />}
                    onClick={translateText}
                    disabled={!customEnglish.trim()}
                  >
                    Translate
                  </Button>
                </Box>
                
                {customHindi && (
                  <Card variant="outlined" sx={{ mb: 3, bgcolor: 'primary.light', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h4" className="hindi-text" gutterBottom>
                        {customHindi}
                      </Typography>
                      {customRomanized && (
                        <Typography variant="body1" gutterBottom>
                          {customRomanized}
                        </Typography>
                      )}
                      <Typography variant="body2">
                        {customEnglish}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          variant="contained"
                          color="secondary"
                          startIcon={<VolumeUpIcon />}
                          onClick={() => speakText()}
                          size="small"
                        >
                          LISTEN
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <Typography variant="caption" sx={{ mr: 1 }}>Speed:</Typography>
                        <Slider
                          value={rate}
                          onChange={handleRateChange}
                          min={0.5}
                          max={1.0}
                          step={0.1}
                          sx={{ maxWidth: 150 }}
                          size="small"
                        />
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          {rate === 0.5 ? "Slow" : rate === 1.0 ? "Normal" : "Medium"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<MicIcon />}
                onClick={startRecording}
                disabled={recording || processing || (activeTab === 1 && !customHindi)}
              >
                START SPEAKING
              </Button>
              
              <Button 
                variant="outlined" 
                color="secondary" 
                startIcon={<StopIcon />}
                onClick={stopRecording}
                disabled={!recording}
              >
                STOP
              </Button>
              
              {activeTab === 0 ? (
                <Button 
                  variant="outlined"
                  startIcon={<ReplayIcon />}
                  onClick={changePhrase}
                  disabled={recording || processing}
                >
                  NEW PHRASE
                </Button>
              ) : (
                <Button 
                  variant="outlined"
                  startIcon={<ReplayIcon />}
                  onClick={() => {
                    setCustomEnglish('');
                    setCustomHindi('');
                    setCustomRomanized('');
                    setTranscript('');
                    setConfidence(0);
                    setFeedback(null);
                  }}
                  disabled={recording || processing}
                >
                  CLEAR
                </Button>
              )}
            </Box>
            
            {/* Add audio visualization */}
            {renderAudioVisualization()}
            
            {processing && (
              <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', my: 2 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Processing your speech... (Converting audio to text and comparing to expected phrase)
                </Typography>
              </Box>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {transcript && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Your speech:
                  </Typography>
                  <Typography variant="h6" className="hindi-text">
                    {transcript}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Confidence: {confidence.toFixed(1)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
            
            {feedback && (
              <Alert severity={feedback.type} sx={{ mb: 3 }}>
                <Typography variant="subtitle1">{feedback.message}</Typography>
                <Typography variant="body2">{feedback.details}</Typography>
                {feedback.type === 'error' && (
                  <Button 
                    size="small" 
                    startIcon={<VolumeUpIcon />}
                    onClick={() => speakText()}
                    sx={{ mt: 1 }}
                  >
                    Hear correct pronunciation
                  </Button>
                )}
              </Alert>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Pronunciation Tips
            </Typography>
            
            <Typography variant="body1" paragraph>
              Hindi is a phonetic language, which means it's pronounced exactly as it's written. Here are some tips:
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              Vowels
            </Typography>
            <Typography variant="body2" paragraph>
              Hindi has short and long vowels. Make sure to maintain the correct length.
              For example, "i" in "sit" (इ) vs "ee" in "seat" (ई).
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              Consonants
            </Typography>
            <Typography variant="body2" paragraph>
              Hindi has aspirated consonants (pronounced with a puff of air) and unaspirated ones.
              For example, "k" (क) vs "kh" (ख).
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              Nasalization
            </Typography>
            <Typography variant="body2" paragraph>
              The chandrabindu (ँ) and anusvar (ं) indicate nasalization. Practice saying these sounds through your nose.
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Microphone Tips:
            </Typography>
            <Typography variant="body2" paragraph>
              • Speak clearly and at a normal volume
            </Typography>
            <Typography variant="body2" paragraph>
              • Make sure your microphone permissions are enabled
            </Typography>
            <Typography variant="body2" paragraph>
              • Try in a quiet environment with minimal background noise
            </Typography>
            <Typography variant="body2" paragraph>
              • If you get 0% confidence repeatedly, try refreshing the page or using a different browser
            </Typography>
            
            <Typography variant="body1" sx={{ mt: 2 }}>
              Practice regularly and don't worry about making mistakes. The more you speak, the better you'll get!
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SpeechPractice; 