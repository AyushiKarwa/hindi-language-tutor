import {
  GET_LESSONS,
  GET_LESSON,
  LESSON_ERROR,
  CLEAR_LESSON,
  SET_LOADING
} from '../types';

const lessonReducer = (state, action) => {
  switch (action.type) {
    case GET_LESSONS:
      return {
        ...state,
        lessons: action.payload,
        loading: false
      };
    case GET_LESSON:
      return {
        ...state,
        currentLesson: action.payload,
        loading: false
      };
    case LESSON_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case CLEAR_LESSON:
      return {
        ...state,
        currentLesson: null,
        loading: false
      };
    case SET_LOADING:
      return {
        ...state,
        loading: true
      };
    default:
      return state;
  }
};

export default lessonReducer; 