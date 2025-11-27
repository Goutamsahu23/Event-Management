
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents, setCurrentProfileId } from './eventsSlice';
import { fetchProfiles, createProfile } from '../profiles/profilesSlice';
import { formatInTimezone } from '../../utils/time';
import EventForm from './EventForm';
import EventCalendar from './EventCalendar';
import Modal from '../../components/Modal';
import EventDetails from './EventDetails';
import EditEventForm from './EditEventFrom';
import EventLogs from './EventLogs';
import TimezonePicker from '../../components/TimezonePicker';
import ProfileSelectorDropdown from '../../components/ProfileSelectorDropdown';

export default function EventsPage() {
  const dispatch = useDispatch();
  const { items, status, error, currentProfileId } = useSelector(
    (state) => state.events
  );
  const profilesState = useSelector((state) => state.profiles);
  const auth = useSelector((state) => state.auth);

  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [displayTimezone, setDisplayTimezone] = useState(
    auth?.profile?.timezone || 'UTC'
  );

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const viewerTZ = displayTimezone;
  const profiles = profilesState.items || [];

  // Load profiles once
  useEffect(() => {
    if (profilesState.status === 'idle') {
      dispatch(fetchProfiles());
    }
  }, [dispatch, profilesState.status]);

  // Default selected profile = current user
  useEffect(() => {
    if (!selectedProfileId && auth.profile && profiles.length > 0) {
      const own = profiles.find((p) => p._id === auth.profile._id);
      if (own) setSelectedProfileId(own._id);
    }
  }, [auth.profile, profiles, selectedProfileId]);

  // Keep in sync with events slice
  useEffect(() => {
    if (!selectedProfileId && currentProfileId) {
      setSelectedProfileId(currentProfileId);
    }
  }, [currentProfileId, selectedProfileId]);

  // Fetch events when profile changes
  useEffect(() => {
    if (!selectedProfileId) return;
    dispatch(setCurrentProfileId(selectedProfileId));
    dispatch(fetchEvents({ profileId: selectedProfileId }));
  }, [dispatch, selectedProfileId]);

  const handleSelectProfile = (id) => {
    setSelectedProfileId(id);
    if (id) {
      dispatch(setCurrentProfileId(id));
      dispatch(fetchEvents({ profileId: id }));
    }
  };

  // Quick create profile from dropdown (name only)
  const handleQuickCreateProfile = async ({ name }) => {
    try {
      const payload = { name }; // only name required
      const result = await dispatch(createProfile(payload));

      if (createProfile.fulfilled.match(result)) {
        const created = result.payload;

        // refresh list & select the new profile
        await dispatch(fetchProfiles());
        setSelectedProfileId(created._id);
        dispatch(setCurrentProfileId(created._id));
        dispatch(fetchEvents({ profileId: created._id }));

        return { success: true };
      }

      return {
        success: false,
        error:
          result.payload ||
          result.error?.message ||
          'Failed to create profile',
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Failed to create profile',
      };
    }
  };

  const handleEventCreated = () => {
    if (selectedProfileId) {
      dispatch(fetchEvents({ profileId: selectedProfileId }));
    }
  };

  // ---- Modal helpers ----
  const openEditModal = (evt) => {
    setSelectedEvent(evt);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedEvent(null);
    setIsEditModalOpen(false);
  };

  const openLogsModal = (evt) => {
    setSelectedEvent(evt);
    setIsLogsModalOpen(true);
  };

  const closeLogsModal = () => {
    setSelectedEvent(null);
    setIsLogsModalOpen(false);
  };

  const openCalendarModal = () => {
    setIsCalendarModalOpen(true);
  };

  const closeCalendarModal = () => {
    setIsCalendarModalOpen(false);
  };

  const handleEventUpdated = () => {
    if (selectedProfileId) {
      dispatch(fetchEvents({ profileId: selectedProfileId }));
    }
    closeEditModal();
  };

  const handleCalendarEventClick = (evt) => {
    setIsCalendarModalOpen(false);
    openEditModal(evt);
  };

  return (
    <div className="events-page">
      {/* Header */}
      <div className="events-header">
        <div className="events-header-title">
          <h2>Event Management</h2>
          <p className="events-header-subtitle">
            Create and manage events across multiple users and timezones.
          </p>
        </div>

        {/* Current profile selector (with search + quick add) */}
        <div>
          <ProfileSelectorDropdown
            label="Select current profile"
            profiles={profiles}
            selectedProfileId={selectedProfileId}
            onSelectProfile={handleSelectProfile}
            onQuickCreate={handleQuickCreateProfile}
          />
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="events-columns">
        {/* Left: Create Event */}
        <div className="card">
          <div className="card-section">
            <h2>Create Event</h2>
          </div>
          <EventForm onCreated={handleEventCreated} />
        </div>

        {/* Right: Events list */}
        <div className="card">
          <div className="events-card-header">
            <div>
              <h2>Events</h2>
              <p className="events-header-subtitle">
                Times shown in the selected view timezone.
              </p>
            </div>

            <div className="events-card-header-right">
              <div style={{ width: 210 }}>
                <TimezonePicker
                  label="View in timezone"
                  value={displayTimezone}
                  onChange={setDisplayTimezone}
                />
              </div>
              <button
                type="button"
                onClick={openCalendarModal}
                className="btn btn-outline btn-small"
              >
                View in calendar
              </button>
            </div>
          </div>

          {/* Status & errors */}
          {status === 'loading' && selectedProfileId && (
            <p className="events-status-text">Loading events…</p>
          )}
          {error && (
            <p className="events-error-text">
              {error}
            </p>
          )}
          {!selectedProfileId && (
            <p className="events-status-text">
              Select a profile to view events.
            </p>
          )}

          {selectedProfileId &&
            items.length === 0 &&
            status === 'succeeded' && (
              <div className="events-empty">
                No events found for this profile.
              </div>
            )}

          {/* Events list */}
          {selectedProfileId && items.length > 0 && (
            <div className="events-list">
              {items.map((evt) => (
                <div key={evt._id} className="event-item">
                  {/* Profiles */}
                  <div className="event-item-header">
                    <span style={{ fontSize: 14 }}>👥</span>
                    <span className="event-item-profiles">
                      {(evt.profiles || [])
                        .map((p) =>
                          typeof p === 'string' ? p : p.name || p._id
                        )
                        .join(', ')}
                    </span>
                  </div>

                  {/* Times */}
                  <div className="event-item-times">
                    <div className="event-item-times-row">
                      <span>📅</span>
                      <span>
                        <strong>Start:</strong>{' '}
                        <span className="time-badge">
                          {formatInTimezone(
                            evt.startUTC,
                            viewerTZ,
                            'MMM DD, YYYY · hh:mm A'
                          )}
                        </span>
                      </span>
                    </div>
                    <div className="event-item-times-row">
                      <span>📅</span>
                      <span>
                        <strong>End:</strong>{' '}
                        <span className="time-badge">
                          {formatInTimezone(
                            evt.endUTC,
                            viewerTZ,
                            'MMM DD, YYYY · hh:mm A'
                          )}
                        </span>
                      </span>
                    </div>
                    <div className="mt-1 small-text text-muted">
                      Original timezone:{' '}
                      <span className="badge badge-muted">
                        {evt.eventTimezone}
                      </span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="event-item-meta">
                    {evt.createdAtUTC && (
                      <div>
                        Created:{' '}
                        {formatInTimezone(
                          evt.createdAtUTC,
                          viewerTZ,
                          'MMM DD, YYYY · hh:mm A'
                        )}
                      </div>
                    )}
                    {evt.updatedAtUTC && (
                      <div>
                        Updated:{' '}
                        {formatInTimezone(
                          evt.updatedAtUTC,
                          viewerTZ,
                          'MMM DD, YYYY · hh:mm A'
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="event-actions">
                    <button
                      type="button"
                      onClick={() => openEditModal(evt)}
                      className="btn btn-outline btn-small"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => openLogsModal(evt)}
                      className="btn btn-outline btn-small"
                    >
                      📘 View logs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit modal: ONLY edit form */}
      <Modal
        isOpen={isEditModalOpen && !!selectedEvent}
        onClose={closeEditModal}
        title="Edit event"
      >
        {selectedEvent && (
          <div style={{ fontSize: 12 }}>
            <EditEventForm event={selectedEvent} onUpdated={handleEventUpdated} />
          </div>
        )}
      </Modal>

      {/* Logs modal: details + logs */}
      <Modal
        isOpen={isLogsModalOpen && !!selectedEvent}
        onClose={closeLogsModal}
        title="Event logs"
      >
        {selectedEvent && (
          <div style={{ fontSize: 12 }}>
            <EventDetails event={selectedEvent} displayTimezone={viewerTZ} />
            <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>
              <EventLogs eventId={selectedEvent._id} displayTimezone={viewerTZ} />
            </div>
          </div>
        )}
      </Modal>

      {/* Calendar modal */}
      <Modal
        isOpen={isCalendarModalOpen && !!selectedProfileId && items.length > 0}
        onClose={closeCalendarModal}
        title={`Calendar view · ${viewerTZ}`}
      >
        {selectedProfileId && items.length > 0 ? (
          <div style={{ height: 520, fontSize: 12 }}>
            <EventCalendar
              events={items}
              viewerTimezone={viewerTZ}
              onSelectEvent={handleCalendarEventClick}
            />
            <p className="calendar-helper">
              Click an event to open its edit modal.
            </p>
          </div>
        ) : (
          <p className="events-status-text">
            No events to show in calendar.
          </p>
        )}
      </Modal>
    </div>
  );
}
