
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// fetchProfiles: supports { q, page, limit }
export const fetchProfiles = createAsyncThunk(
  'profiles/fetchProfiles',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/profiles', { params });
      return res.data.data; // { items, meta }
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

// createProfile: body { name, timezone, email?, role? }
export const createProfile = createAsyncThunk(
  'profiles/createProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/profiles', payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

const profilesSlice = createSlice({
  name: 'profiles',
  initialState: {
    items: [],
    meta: { page: 1, limit: 50, total: 0 },
    status: 'idle',
    error: null,
    createStatus: 'idle',
  },
  reducers: {
    // local mutations if needed
    clearProfiles(state) {
      state.items = [];
      state.meta = { page: 1, limit: 50, total: 0 };
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfiles.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || [];
        state.meta = action.payload.meta || state.meta;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      .addCase(createProfile.pending, (state) => {
        state.createStatus = 'loading';
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        // prepend new profile to items for instant UX
        state.items.unshift(action.payload);
        state.meta.total = (state.meta.total || 0) + 1;
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearProfiles } = profilesSlice.actions;
export default profilesSlice.reducer;
