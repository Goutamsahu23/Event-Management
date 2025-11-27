
import React from "react";

const COMMON_TIMEZONES = [
  "Asia/Kolkata",
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Singapore",
  "Australia/Sydney",
];

export default function TimezonePicker({ label = "Timezone", value, onChange }) {
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="timezone-picker">
      {label && (
        <label className="timezone-picker-label">
          {label}
        </label>
      )}
      <select
        className="timezone-picker-select"
        value={value || ""}
        onChange={handleChange}
      >
        {COMMON_TIMEZONES.map((tz) => (
          <option key={tz} value={tz}>
            {tz}
          </option>
        ))}
      </select>
    </div>
  );
}
