
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // allow non-serializable in actions if needed (e.g. Error objects)
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
