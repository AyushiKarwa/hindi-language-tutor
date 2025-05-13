import React, { useReducer } from 'react';
import axios from 'axios';
import ProgressContext from './progressContext';
import progressReducer from './progressReducer';
import {
  GET_PROGRESS,
  UPDATE_PROGRESS,
  PROGRESS_ERROR,
  CLEAR_PROGRESS,
  SET_LOADING
} from '../types';

// Demo progress data
const demoProgress = {
  userId: 'demo-user',
  level: 'beginner',
  lessonsCompleted: ['1', '2'],
  exercisesCompleted: 8,
  totalPracticeTime: 1200, // in seconds
  achievements: ['5_lessons', 'first_perfect_score'],
  lastActive: new Date().toISOString()
};

const ProgressState = props => {
  const initialState = {
    progress: null,
    loading: false,
    error: null
  };

  const [state, dispatch] = useReducer(progressReducer, initialState);

  // Get user's progress
  const getProgress = async () => {
    setLoading();

    try {
      // For demo purposes, use the demo data instead of API call
      // const res = await axios.get('/api/progress');
      
      setTimeout(() => {
        dispatch({
          type: GET_PROGRESS,
          payload: demoProgress
        });
      }, 500); // Simulate network delay
    } catch (err) {
      dispatch({
        type: PROGRESS_ERROR,
        payload: 'Error loading progress data'
      });
    }
  };

  // Update lesson progress
  const updateLessonProgress = async (lessonId, progressData) => {
    setLoading();

    try {
      // For demo purposes, simulate updating progress data
      // const res = await axios.post(`/api/progress/lessons/${lessonId}`, progressData);
      
      // Update the demo progress data
      const updatedProgress = {
        ...demoProgress,
        lessonsCompleted: [...demoProgress.lessonsCompleted, lessonId].filter((id, index, self) => self.indexOf(id) === index), // prevent duplicates
        exercisesCompleted: demoProgress.exercisesCompleted + 1,
        totalPracticeTime: demoProgress.totalPracticeTime + (progressData.timeSpent || 0),
        lastActive: new Date().toISOString()
      };
      
      setTimeout(() => {
        dispatch({
          type: UPDATE_PROGRESS,
          payload: updatedProgress
        });
      }, 500); // Simulate network delay
      
      return true;
    } catch (err) {
      dispatch({
        type: PROGRESS_ERROR,
        payload: 'Error updating progress'
      });
      return false;
    }
  };

  // Clear progress
  const clearProgress = () => {
    dispatch({ type: CLEAR_PROGRESS });
  };

  // Set loading
  const setLoading = () => {
    dispatch({ type: SET_LOADING });
  };

  return (
    <ProgressContext.Provider
      value={{
        progress: state.progress,
        loading: state.loading,
        error: state.error,
        getProgress,
        updateLessonProgress,
        clearProgress
      }}
    >
      {props.children}
    </ProgressContext.Provider>
  );
};

export default ProgressState; 