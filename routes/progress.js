const express = require('express');
const router = express.Router();

// Mock user progress data (in a real app, this would be in a database)
let userProgress = [];

// @route   GET api/progress
// @desc    Get user's learning progress
// @access  Private
router.get('/', (req, res) => {
  // Note: In a real app, this would use middleware to validate the token
  const userId = req.header('user-id');
  
  if (!userId) {
    return res.status(401).json({ msg: 'No user ID, authorization denied' });
  }

  try {
    const progress = userProgress.find(progress => progress.userId === userId);
    
    if (!progress) {
      return res.json({
        userId,
        lessonsCompleted: [],
        exercisesCompleted: 0,
        totalPracticeTime: 0,
        level: 'beginner',
        achievements: [],
        lastActive: new Date()
      });
    }
    
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/progress/lesson/:id
// @desc    Update progress for a completed lesson
// @access  Private
router.post('/lesson/:id', (req, res) => {
  const userId = req.header('user-id');
  const lessonId = req.params.id;
  const { score, timeSpent } = req.body;
  
  if (!userId) {
    return res.status(401).json({ msg: 'No user ID, authorization denied' });
  }

  try {
    // Find user progress or create if not exists
    let progress = userProgress.find(progress => progress.userId === userId);
    
    if (!progress) {
      progress = {
        userId,
        lessonsCompleted: [],
        exercisesCompleted: 0,
        totalPracticeTime: 0,
        level: 'beginner',
        achievements: [],
        lastActive: new Date()
      };
      userProgress.push(progress);
    }
    
    // Update lesson completion
    const existingLessonIndex = progress.lessonsCompleted.findIndex(
      lesson => lesson.lessonId === lessonId
    );
    
    if (existingLessonIndex >= 0) {
      // Update existing lesson progress
      progress.lessonsCompleted[existingLessonIndex] = {
        lessonId,
        completedAt: new Date(),
        score,
        timeSpent
      };
    } else {
      // Add new lesson completion
      progress.lessonsCompleted.push({
        lessonId,
        completedAt: new Date(),
        score,
        timeSpent
      });
    }
    
    // Update total practice time
    progress.totalPracticeTime += timeSpent;
    
    // Update exercises completed (assuming 5 exercises per lesson)
    progress.exercisesCompleted += 5;
    
    // Update last active
    progress.lastActive = new Date();
    
    // Update level based on lessons completed (simple logic)
    if (progress.lessonsCompleted.length >= 20) {
      progress.level = 'advanced';
    } else if (progress.lessonsCompleted.length >= 10) {
      progress.level = 'intermediate';
    }
    
    // Add achievements (simple logic)
    if (progress.lessonsCompleted.length === 5 && !progress.achievements.includes('5_lessons')) {
      progress.achievements.push('5_lessons');
    }
    
    if (progress.lessonsCompleted.length === 10 && !progress.achievements.includes('10_lessons')) {
      progress.achievements.push('10_lessons');
    }
    
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/progress/practice
// @desc    Update progress for a practice session
// @access  Private
router.post('/practice', (req, res) => {
  const userId = req.header('user-id');
  const { timeSpent, wordsStudied, exercisesCompleted } = req.body;
  
  if (!userId) {
    return res.status(401).json({ msg: 'No user ID, authorization denied' });
  }

  try {
    // Find user progress or create if not exists
    let progress = userProgress.find(progress => progress.userId === userId);
    
    if (!progress) {
      progress = {
        userId,
        lessonsCompleted: [],
        exercisesCompleted: 0,
        totalPracticeTime: 0,
        level: 'beginner',
        achievements: [],
        lastActive: new Date()
      };
      userProgress.push(progress);
    }
    
    // Update practice statistics
    progress.totalPracticeTime += timeSpent;
    progress.exercisesCompleted += exercisesCompleted || 0;
    progress.lastActive = new Date();
    
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 