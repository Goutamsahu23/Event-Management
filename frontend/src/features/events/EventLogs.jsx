
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import { formatInTimezone, formatUTC } from "../../utils/time";

export default function EventLogs({ eventId, displayTimezone }) {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const viewerTZ = displayTimezone || "UTC";

  // Profiles for id → name mapping
  const profilesState = useSelector((state) => state.profiles);
  const profiles = profilesState.items || [];

  const profileNameById = useMemo(() => {
    const map = {};
    profiles.forEach((p) => {
      if (p?._id) {
        map[p._id] = p.name || p._id;
      }
    });
    return map;
  }, [profiles]);

  useEffect(() => {
    if (!eventId) return;

    const loadLogs = async () => {
      setStatus("loading");
      setError(null);
      try {
        const res = await api.get(`/events/${eventId}/logs`);
        setLogs(res.data?.data?.items || []);
        setStatus("succeeded");
      } catch (err) {
        setStatus("failed");
        setError(err?.response?.data?.message || err.message);
      }
    };

    loadLogs();
  }, [eventId]);

  if (!eventId) return null;

  return (
    <div className="event-logs">
      <div className="event-logs-header">
        <div className="event-logs-title">Update logs</div>
        <div className="event-logs-subtitle">
          Times shown in {viewerTZ}
        </div>
      </div>

      {status === "loading" && (
        <div className="event-logs-status">Loading logs…</div>
      )}

      {error && (
        <div className="event-logs-error">{error}</div>
      )}

      {logs.length === 0 && status === "succeeded" && !error && (
        <div className="event-logs-empty">
          No changes recorded for this event yet.
        </div>
      )}

      {logs.length > 0 && (
        <div className="event-logs-list">
          {logs.map((log) => {
            const tsLocal = formatInTimezone(
              log.timestampUTC,
              viewerTZ,
              "MMM DD, YYYY · hh:mm A"
            );
            const tsUTC = formatUTC(log.timestampUTC);
            const who = formatChangedBy(log.changedBy, profileNameById);
            const whoTz = log.changedByTimezone || "—";

            return (
              <div key={log._id} className="event-log-card">
                {/* Top row */}
                <div className="event-log-card-top">
                  <div className="event-log-timestamps">
                    <div className="event-log-time-main">{tsLocal}</div>
                    <div className="event-log-time-utc">UTC: {tsUTC}</div>
                  </div>
                  <div className="event-log-user">
                    <div className="event-log-user-chip">{who}</div>
                    <div>Timezone: {whoTz}</div>
                  </div>
                </div>

                {/* Note */}
                {log.note && (
                  <div className="event-log-note">
                    <strong>Note: </strong>
                    {log.note}
                  </div>
                )}

                {/* Changes */}
                {log.changes && log.changes.length > 0 && (
                  <>
                    <div className="event-log-changes-header">Changes</div>
                    {log.changes.map((ch, idx) => (
                      <ChangeRow
                        key={idx}
                        field={ch.field}
                        before={ch.before}
                        after={ch.after}
                        profileNameById={profileNameById}
                      />
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================
   Subcomponents / helpers
   ========================= */

function ChangeRow({ field, before, after, profileNameById }) {
  const label = prettyFieldName(field);
  const formattedBefore = formatValue(before, field, profileNameById);
  const formattedAfter = formatValue(after, field, profileNameById);

  return (
    <div className="event-log-change-row">
      <div className="event-log-change-title">
        <div className="event-log-change-label">{label}</div>
        <div className="event-log-change-badge">Updated</div>
      </div>
      <div className="event-log-change-values">
        <div className="event-log-change-col">
          <div className="event-log-change-col-label">From</div>
          <div className="event-log-change-col-box-old">
            {formattedBefore}
          </div>
        </div>
        <div className="event-log-change-col">
          <div className="event-log-change-col-label">To</div>
          <div className="event-log-change-col-box-new">
            {formattedAfter}
          </div>
        </div>
      </div>
    </div>
  );
}

function prettyFieldName(field) {
  switch (field) {
    case "title":
      return "Title";
    case "description":
      return "Description";
    case "profiles":
      return "Assigned profiles";
    case "eventTimezone":
      return "Event timezone";
    case "startUTC":
      return "Start time (UTC)";
    case "endUTC":
      return "End time (UTC)";
    case "meta":
      return "Metadata";
    default:
      return field;
  }
}

function shortId(id) {
  if (!id) return "";
  const s = String(id);
  if (s.length <= 8) return s;
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

// Format values nicely, trying to replace IDs with names when possible
function formatValue(v, field, profileNameById) {
  if (v === null || v === undefined) return "—";

  if (field === "profiles") {
    if (Array.isArray(v)) {
      const names = v.map((item) => {
        if (typeof item === "string") {
          return profileNameById[item] || shortId(item);
        }
        if (item && item.name) return item.name;
        if (item && item._id)
          return profileNameById[item._id] || shortId(item._id);
        return "";
      });
      const filtered = names.filter(Boolean);
      return filtered.length ? filtered.join(", ") : "—";
    }
  }

  // object-like field
  if (typeof v === "object" && !Array.isArray(v)) {
    if (v.name) return v.name;
    if (v._id) return profileNameById[v._id] || shortId(v._id);
    const json = JSON.stringify(v);
    return json.length > 60 ? json.slice(0, 57) + "…" : json;
  }

  if (Array.isArray(v)) {
    const json = JSON.stringify(v);
    return json.length > 60 ? json.slice(0, 57) + "…" : json;
  }

  return String(v);
}

function formatChangedBy(changedBy, profileNameById) {
  if (!changedBy) return "Unknown user";

  if (typeof changedBy === "string") {
    return profileNameById[changedBy] || `User ${shortId(changedBy)}`;
  }

  if (changedBy.name) return changedBy.name;
  if (changedBy._id) {
    return profileNameById[changedBy._id] || `User ${shortId(changedBy._id)}`;
  }

  return "Unknown user";
}
