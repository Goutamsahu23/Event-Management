
import { combineReducers } from 'redux';
import authReducer from '../features/auth/authSlice';
import profilesReducer from '../features/profiles/profilesSlice';
import eventsReducer from '../features/events/eventsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  profiles: profilesReducer,
  events: eventsReducer,
});

export default rootReducer;
