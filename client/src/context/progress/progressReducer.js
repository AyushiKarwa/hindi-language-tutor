import {
  GET_PROGRESS,
  UPDATE_PROGRESS,
  PROGRESS_ERROR,
  CLEAR_PROGRESS,
  SET_LOADING
} from '../types';

const progressReducer = (state, action) => {
  switch (action.type) {
    case GET_PROGRESS:
      return {
        ...state,
        progress: action.payload,
        loading: false
      };
    case UPDATE_PROGRESS:
      return {
        ...state,
        progress: action.payload,
        loading: false
      };
    case PROGRESS_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case CLEAR_PROGRESS:
      return {
        ...state,
        progress: null,
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

export default progressReducer; 