const express = require('express');
const router = express.Router();

// Mock lessons data
const lessons = [
  {
    id: '1',
    title: 'Basic Greetings',
    level: 'beginner',
    description: 'Learn common Hindi greetings and introductions',
    content: [
      {
        type: 'text',
        content: 'नमस्ते (Namaste) - Hello/Greetings'
      },
      {
        type: 'audio',
        url: '/audio/namaste.mp3',
        text: 'नमस्ते'
      },
      {
        type: 'text',
        content: 'आप कैसे हैं? (Aap kaise hain?) - How are you?'
      },
      {
        type: 'audio',
        url: '/audio/aap-kaise-hain.mp3',
        text: 'आप कैसे हैं?'
      },
      {
        type: 'exercise',
        question: 'How do you say "Hello" in Hindi?',
        options: ['नमस्ते', 'धन्यवाद', 'माफ़ कीजिये', 'फिर मिलेंगे'],
        correctAnswer: 'नमस्ते'
      }
    ]
  },
  {
    id: '2',
    title: 'Common Phrases',
    level: 'beginner',
    description: 'Learn everyday useful Hindi phrases',
    content: [
      {
        type: 'text',
        content: 'धन्यवाद (Dhanyavaad) - Thank you'
      },
      {
        type: 'audio',
        url: '/audio/dhanyavaad.mp3',
        text: 'धन्यवाद'
      },
      {
        type: 'text',
        content: 'माफ़ कीजिये (Maaf kijiye) - I\'m sorry/Excuse me'
      },
      {
        type: 'audio',
        url: '/audio/maaf-kijiye.mp3',
        text: 'माफ़ कीजिये'
      },
      {
        type: 'exercise',
        question: 'How do you say "Thank you" in Hindi?',
        options: ['नमस्ते', 'धन्यवाद', 'माफ़ कीजिये', 'फिर मिलेंगे'],
        correctAnswer: 'धन्यवाद'
      }
    ]
  },
  {
    id: '3',
    title: 'Numbers 1-10',
    level: 'beginner',
    description: 'Learn to count from 1 to 10 in Hindi',
    content: [
      {
        type: 'text',
        content: 'एक (Ek) - One'
      },
      {
        type: 'text',
        content: 'दो (Do) - Two'
      },
      {
        type: 'text',
        content: 'तीन (Teen) - Three'
      },
      {
        type: 'exercise',
        question: 'What is "Three" in Hindi?',
        options: ['एक', 'दो', 'तीन', 'चार'],
        correctAnswer: 'तीन'
      }
    ]
  }
];

// @route   GET api/lessons
// @desc    Get all lessons
// @access  Public
router.get('/', (req, res) => {
  try {
    // Send lesson summaries (without detailed content)
    const lessonSummaries = lessons.map(({ id, title, level, description }) => ({
      id,
      title,
      level,
      description
    }));
    
    res.json(lessonSummaries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/lessons/:id
// @desc    Get lesson by ID
// @access  Public
router.get('/:id', (req, res) => {
  try {
    const lesson = lessons.find(lesson => lesson.id === req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ msg: 'Lesson not found' });
    }
    
    res.json(lesson);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 