
import React from "react";
import { formatInTimezone, formatUTC } from "../../utils/time";

export default function EventDetails({ event, displayTimezone }) {
  const viewerTZ = displayTimezone || "UTC";

  if (!event) return null;

  return (
    <div className="event-details">
      
      {/* Title */}
      <div className="event-details-item">
        <div className="event-details-label">Title</div>
        <div className="event-details-value">{event.title}</div>
      </div>

      {/* Original TZ */}
      <div className="event-details-item">
        <div className="event-details-label">Original timezone</div>
        <div className="event-details-value">
          <span className="event-details-badge">
            {event.eventTimezone}
          </span>
        </div>
      </div>

      {/* Start (Viewer TZ) */}
      <div className="event-details-item">
        <div className="event-details-label">Start time ({viewerTZ})</div>
        <div className="event-details-value">
          {formatInTimezone(event.startUTC, viewerTZ, "MMM DD, YYYY · hh:mm A")}
        </div>
      </div>

      {/* End (Viewer TZ) */}
      <div className="event-details-item">
        <div className="event-details-label">End time ({viewerTZ})</div>
        <div className="event-details-value">
          {formatInTimezone(event.endUTC, viewerTZ, "MMM DD, YYYY · hh:mm A")}
        </div>
      </div>

      {/* Start UTC */}
      <div className="event-details-item">
        <div className="event-details-label">Start (UTC)</div>
        <div className="event-details-value">
          {formatUTC(event.startUTC)}
        </div>
      </div>

      {/* End UTC */}
      <div className="event-details-item">
        <div className="event-details-label">End (UTC)</div>
        <div className="event-details-value">
          {formatUTC(event.endUTC)}
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <div className="event-details-item" style={{ gridColumn: "1 / span 2" }}>
          <div className="event-details-label">Description</div>
          <div className="event-details-value">{event.description}</div>
        </div>
      )}

      {/* Profiles */}
      {event.profiles && (
        <div className="event-details-item" style={{ gridColumn: "1 / span 2" }}>
          <div className="event-details-label">Assigned profiles</div>
          <div className="event-details-value">
            {(event.profiles || [])
              .map((p) => (p.name ? p.name : p._id))
              .join(", ")}
          </div>
        </div>
      )}
    </div>
  );
}
