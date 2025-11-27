

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Convert a local "YYYY-MM-DDTHH:mm" string in a given timezone
 * into a JS Date in UTC.
 *
 * Example:
 *  localToUTC("2025-11-26T09:00", "America/New_York")
 *  -> Date representing 14:00 UTC (depending on DST)
 */
function localToUTC(localString, tz) {
  if (!localString || !tz) {
    throw new Error('localToUTC: missing localString or tz');
  }

  // Parse the string as if it's in the given timezone
  const d = dayjs.tz(localString, 'YYYY-MM-DDTHH:mm', tz);
  if (!d.isValid()) {
    throw new Error(`localToUTC: invalid date "${localString}" for tz "${tz}"`);
  }

  // Convert to UTC Date object
  return d.utc().toDate();
}

/**
 * Convert an ISO string (e.g. "2025-11-26T09:00:00Z") to a UTC Date.
 */
function isoToUTC(iso) {
  if (!iso) throw new Error('isoToUTC: missing iso string');
  const d = dayjs(iso).utc();
  if (!d.isValid()) {
    throw new Error(`isoToUTC: invalid iso "${iso}"`);
  }
  return d.toDate();
}

/**
 * Convert a UTC Date to a formatted string in a given timezone.
 * Default format: "YYYY-MM-DD HH:mm".
 */
function utcToLocalString(utcDate, tz, format = 'YYYY-MM-DD HH:mm') {
  if (!utcDate || !tz) return null;
  const d = dayjs(utcDate).utc().tz(tz);
  if (!d.isValid()) return null;
  return d.format(format);
}

module.exports = {
  localToUTC,
  isoToUTC,
  utcToLocalString,
};
