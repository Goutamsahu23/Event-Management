
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { setAuthToken } from '../../api/axios';

// login thunk: accepts { email, profileId } (dev mode supports profileId)
export const login = createAsyncThunk(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', payload);
      return res.data.data; // { token, profile }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Login failed';
      return rejectWithValue(msg);
    }
  }
);

// optional: refresh profile from server using stored token
export const fetchCurrentProfile = createAsyncThunk(
  'auth/fetchCurrentProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/profiles/me'); // implement backend /profiles/me if desired
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

const initialToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const initialProfile = null; // we populate after login

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialToken,
    profile: initialProfile,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.profile = null;
      state.status = 'idle';
      state.error = null;
      setAuthToken(null);
    },
    setProfile(state, action) {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.profile = action.payload.profile || null;
        state.error = null;
        // persist token
        setAuthToken(action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchCurrentProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchCurrentProfile.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { logout, setProfile } = authSlice.actions;
export default authSlice.reducer;
