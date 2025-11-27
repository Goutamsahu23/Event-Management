
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { createEvent } from './eventsSlice';
import { fetchProfiles, createProfile } from '../profiles/profilesSlice';
import MultiProfileSelect from '../../components/MultiProfileSelect';
import TimezonePicker from '../../components/TimezonePicker';
import DateTimePicker from '../../components/DateTimePicker/DateTimePicker';

export default function EventForm({ onCreated }) {
  const dispatch = useDispatch();
  const profilesState = useSelector((state) => state.profiles);
  const auth = useSelector((state) => state.auth);

  const allProfiles = profilesState.items || [];
  const viewer = auth.profile;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [profiles, setProfiles] = useState(viewer?._id ? [viewer._id] : []);
  const [eventTimezone, setEventTimezone] = useState(
    viewer?.timezone || 'Asia/Kolkata'
  );

  // Dates
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load profiles
  useEffect(() => {
    if (profilesState.status === 'idle') {
      dispatch(fetchProfiles());
    }
  }, [dispatch, profilesState.status]);

  // Default select self
  useEffect(() => {
    if (viewer?._id && profiles.length === 0) {
      setProfiles([viewer._id]);
    }
  }, [viewer, profiles.length]);

  // Quick-create profile (name only)
  const handleQuickCreateProfile = async ({ name }) => {
    try {
      const payload = { name };
      const result = await dispatch(createProfile(payload));

      if (createProfile.fulfilled.match(result)) {
        const created = result.payload;
        await dispatch(fetchProfiles());
        setProfiles((prev) => [...prev, created._id]);
        return { success: true };
      }

      return {
        success: false,
        error: result.payload || result.error?.message || 'Create failed',
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const todayStart = dayjs().startOf('day').toDate();
  const endMin = startDate || todayStart;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!profiles.length) {
      setError('Please select at least one profile.');
      return;
    }
    if (!eventTimezone) {
      setError('Please choose an event timezone.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Please choose start and end datetime.');
      return;
    }

    const startLocal = dayjs(startDate).format('YYYY-MM-DDTHH:mm');
    const endLocal = dayjs(endDate).format('YYYY-MM-DDTHH:mm');

    if (dayjs(endLocal).isBefore(dayjs(startLocal))) {
      setError('End time cannot be before start time.');
      return;
    }

    const payload = {
      title: title || 'Untitled event',
      description,
      profiles,
      eventTimezone,
      startLocal,
      endLocal,
    };

    setIsSubmitting(true);
    const result = await dispatch(createEvent(payload));
    setIsSubmitting(false);

    if (createEvent.fulfilled.match(result)) {
      setTitle('');
      setDescription('');
      setStartDate(null);
      setEndDate(null);
      onCreated?.(result.payload);
    } else {
      setError(result.payload || result.error?.message || 'Event create failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">

      {/* Profiles */}
      <div className="event-form-group">
        <label className="event-form-label">Assign profiles</label>
        <MultiProfileSelect
          profiles={allProfiles}
          value={profiles}
          onChange={setProfiles}
          onQuickCreate={handleQuickCreateProfile}
        />
      </div>

      {/* Timezone */}
      <div className="event-form-group">
        <TimezonePicker
          label="Event timezone"
          value={eventTimezone}
          onChange={setEventTimezone}
        />
      </div>

      {/* Start & End Date/Time */}
      <div className="event-form-row">
        <DateTimePicker
          label="Start date & time"
          value={startDate}
          onChange={setStartDate}
          minDate={todayStart}
        />
        <DateTimePicker
          label="End date & time"
          value={endDate}
          onChange={setEndDate}
          minDate={endMin}
        />
      </div>

      <p className="event-form-hint">
        These times are interpreted in <strong>{eventTimezone}</strong> and will
        show differently for each user based on their own timezone.
      </p>

      {/* Title */}
      <div className="event-form-group">
        <label className="event-form-label">Title (optional)</label>
        <input
          className="event-form-input"
          value={title}
          placeholder="Event title"
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="event-form-group">
        <label className="event-form-label">Description (optional)</label>
        <textarea
          className="event-form-textarea"
          rows={3}
          placeholder="Event description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error && <div className="event-form-error">{error}</div>}

      <button
        type="submit"
        className="event-form-submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating…' : 'Create Event'}
      </button>
    </form>
  );
}
