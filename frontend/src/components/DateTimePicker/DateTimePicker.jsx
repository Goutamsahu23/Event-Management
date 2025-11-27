import React from "react";

export default function DateTimePicker({
  label = "Select date/time",
  value,
  onChange,
  minDate,
  disabled = false,
}) {
  const handleChange = (e) => {
    const val = e.target.value; // "YYYY-MM-DDTHH:mm"
    if (!val) return;

    // This will be parsed as local time by JS
    const date = new Date(val);

    // Optional extra safety: don't allow below minDate
    if (minDate && date < minDate) return;

    onChange?.(date);
  };

  // Format a JS Date as "YYYY-MM-DDTHH:mm" in LOCAL time (no timezone shift)
  const formatLocalForInput = (d) => {
    if (!d) return "";
    const dateObj = d instanceof Date ? d : new Date(d);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const valueStr = value ? formatLocalForInput(value) : "";
  const minStr = minDate ? formatLocalForInput(minDate) : undefined;

  return (
    <div className="dtp-wrapper">
      <label className="dtp-label">{label}</label>

      <div className="dtp-input-wrapper">
        <input
          type="datetime-local"
          className={`dtp-input ${disabled ? "dtp-disabled" : ""}`}
          value={valueStr}
          onChange={handleChange}
          min={minStr}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
