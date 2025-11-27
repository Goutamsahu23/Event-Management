
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// GET /events?profileId=...&from=...&to=...
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.get('/events', { params });
      return {
        profileId: params.profileId,
        ...res.data.data, // { items, meta }
      };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

// POST /events
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/events', payload);
      return res.data.data; // created event doc
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

// PATCH /events/:id
export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/events/${id}`, updates);
      return res.data.data; // updated event doc
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    items: [],          // events for currently selected profile
    meta: { page: 1, limit: 200, total: 0 },
    status: 'idle',     // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    currentProfileId: null,
    createStatus: 'idle',
    updateStatus: 'idle',
  },
  reducers: {
    setCurrentProfileId(state, action) {
      state.currentProfileId = action.payload;
    },
    clearEvents(state) {
      state.items = [];
      state.meta = { page: 1, limit: 200, total: 0 };
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchEvents
      .addCase(fetchEvents.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        const { profileId } = action.meta.arg || {};
        if (profileId) {
          state.currentProfileId = profileId;
        }
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || [];
        state.meta = action.payload.meta || state.meta;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // createEvent
      .addCase(createEvent.pending, (state) => {
        state.createStatus = 'loading';
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        // if event belongs to current profile, add it to list
        const evt = action.payload;
        if (evt && evt.profiles && evt.profiles.some((p) => String(p) === String(state.currentProfileId))) {
          state.items.push(evt);
          state.meta.total = (state.meta.total || 0) + 1;
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = action.payload || action.error.message;
      })

      // updateEvent
      .addCase(updateEvent.pending, (state) => {
        state.updateStatus = 'loading';
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        const updated = action.payload;
        const idx = state.items.findIndex((e) => e._id === updated._id);
        if (idx !== -1) {
          state.items[idx] = updated;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setCurrentProfileId, clearEvents } = eventsSlice.actions;
export default eventsSlice.reducer;
