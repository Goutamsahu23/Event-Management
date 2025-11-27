
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { updateEvent } from "./eventsSlice";
import { fetchProfiles, createProfile } from "../profiles/profilesSlice";
import MultiProfileSelect from "../../components/MultiProfileSelect";
import TimezonePicker from "../../components/TimezonePicker";
import DateTimePicker from "../../components/DateTimePicker/DateTimePicker";

export default function EditEventForm({ event, onUpdated }) {
  const dispatch = useDispatch();
  const profilesState = useSelector((state) => state.profiles);
  const allProfiles = profilesState.items || [];

  const [title, setTitle] = useState(event.title || "");
  const [description, setDescription] = useState(event.description || "");
  const [profiles, setProfiles] = useState(
    event.profiles?.map((p) => (typeof p === "string" ? p : p._id)) || []
  );

  const [eventTimezone, setEventTimezone] = useState(event.eventTimezone);

  const [startDate, setStartDate] = useState(
    event.startUTC ? dayjs(event.startUTC).toDate() : null
  );
  const [endDate, setEndDate] = useState(
    event.endUTC ? dayjs(event.endUTC).toDate() : null
  );

  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profilesState.status === "idle") {
      dispatch(fetchProfiles());
    }
  }, [dispatch, profilesState.status]);

  const todayStart = dayjs().startOf("day").toDate();
  const endMin = startDate || todayStart;

  const handleQuickCreateProfile = async ({ name }) => {
    try {
      const result = await dispatch(createProfile({ name }));
      if (createProfile.fulfilled.match(result)) {
        const created = result.payload;
        await dispatch(fetchProfiles());
        setProfiles((prev) => [...prev, created._id]);
        return { success: true };
      }
      return { success: false, error: "Failed to create profile" };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!profiles.length) {
      setError("Select at least one profile.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Select valid start & end datetime.");
      return;
    }

    const startLocal = dayjs(startDate).format("YYYY-MM-DDTHH:mm");
    const endLocal = dayjs(endDate).format("YYYY-MM-DDTHH:mm");

    if (dayjs(endLocal).isBefore(startLocal)) {
      setError("End time cannot be before start time.");
      return;
    }

    const payload = {
      title,
      description,
      profiles,
      eventTimezone,
      startLocal,
      endLocal,
      note,
    };

    setSaving(true);
    const result = await dispatch(updateEvent({ id: event._id, updates: payload }));
    setSaving(false);

    if (updateEvent.fulfilled.match(result)) {
      onUpdated?.(result.payload);
    } else {
      setError(result.payload || "Update failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-event-form">

      {/* Profiles */}
      <div className="edit-event-group">
        <label className="edit-event-section-title">Assigned profiles</label>
        <MultiProfileSelect
          profiles={allProfiles}
          value={profiles}
          onChange={setProfiles}
          onQuickCreate={handleQuickCreateProfile}
        />
      </div>

      {/* Timezone */}
      <div className="edit-event-group">
        <TimezonePicker
          label="Event timezone"
          value={eventTimezone}
          onChange={setEventTimezone}
        />
      </div>

      {/* Start & End */}
      <div className="edit-event-row">
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

      {/* Title */}
      <div className="edit-event-group">
        <label className="edit-event-section-title">Title</label>
        <input
          className="edit-event-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="edit-event-group">
        <label className="edit-event-section-title">Description</label>
        <textarea
          className="edit-event-textarea"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Optional note */}
      <div className="edit-event-group">
        <label className="edit-event-note-label">Update note (optional)</label>
        <textarea
          className="edit-event-textarea"
          rows={2}
          placeholder="What was changed?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {error && <div className="edit-event-error">{error}</div>}

      <button
        type="submit"
        className="edit-event-submit"
        disabled={saving}
      >
        {saving ? "Saving…" : "Save changes"}
      </button>

    </form>
  );
}
