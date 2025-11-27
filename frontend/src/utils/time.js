// src/utils/time.js
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function formatInTimezone(utcInput, tz, format = 'YYYY-MM-DD HH:mm') {
  if (!utcInput) return '-';
  return dayjs(utcInput).utc().tz(tz).format(format);
}

export function formatUTC(utcInput) {
  if (!utcInput) return '-';
  return dayjs(utcInput).utc().toISOString().replace('.000Z', 'Z');
}

export function utcToDateInZone(utcInput, tz) {
  return dayjs(utcInput).utc().tz(tz).toDate();
}
