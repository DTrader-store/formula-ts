/**
 * DateTime Functions
 * Extract time components from timestamps
 * All functions work with MarketData timestamp field
 */

/**
 * DATE - Get date in YYYYMMDD format
 * Extracts date from timestamp and returns it as integer (e.g., 20240115)
 *
 * @param timestamps - Unix timestamps in milliseconds
 * @returns Array of dates in YYYYMMDD format
 */
export function DATE(timestamps: number[]): number[] {
  const result: number[] = new Array(timestamps.length);

  for (let i = 0; i < timestamps.length; i++) {
    const date = new Date(timestamps[i]);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    result[i] = parseInt(`${year}${month}${day}`);
  }

  return result;
}

/**
 * TIME - Get time in HHMMSS format
 * Extracts time from timestamp and returns it as integer (e.g., 093000 for 09:30:00)
 *
 * @param timestamps - Unix timestamps in milliseconds
 * @returns Array of times in HHMMSS format
 */
export function TIME(timestamps: number[]): number[] {
  const result: number[] = new Array(timestamps.length);

  for (let i = 0; i < timestamps.length; i++) {
    const date = new Date(timestamps[i]);
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    result[i] = parseInt(`${hour}${minute}${second}`);
  }

  return result;
}

/**
 * YEAR - Get year
 * Extracts year from timestamp (e.g., 2024)
 *
 * @param timestamps - Unix timestamps in milliseconds
 * @returns Array of years
 */
export function YEAR(timestamps: number[]): number[] {
  const result: number[] = new Array(timestamps.length);

  for (let i = 0; i < timestamps.length; i++) {
    result[i] = new Date(timestamps[i]).getFullYear();
  }

  return result;
}

/**
 * MONTH - Get month (1-12)
 * Extracts month from timestamp
 *
 * @param timestamps - Unix timestamps in milliseconds
 * @returns Array of months (1=January, 12=December)
 */
export function MONTH(timestamps: number[]): number[] {
  const result: number[] = new Array(timestamps.length);

  for (let i = 0; i < timestamps.length; i++) {
    result[i] = new Date(timestamps[i]).getMonth() + 1; // getMonth() returns 0-11
  }

  return result;
}

/**
 * DAY - Get day of month (1-31)
 * Extracts day from timestamp
 *
 * @param timestamps - Unix timestamps in milliseconds
 * @returns Array of days (1-31)
 */
export function DAY(timestamps: number[]): number[] {
  const result: number[] = new Array(timestamps.length);

  for (let i = 0; i < timestamps.length; i++) {
    result[i] = new Date(timestamps[i]).getDate();
  }

  return result;
}

/**
 * HOUR - Get hour (0-23)
 * Extracts hour from timestamp
 *
 * @param timestamps - Unix timestamps in milliseconds
 * @returns Array of hours (0-23)
 */
export function HOUR(timestamps: number[]): number[] {
  const result: number[] = new Array(timestamps.length);

  for (let i = 0; i < timestamps.length; i++) {
    result[i] = new Date(timestamps[i]).getHours();
  }

  return result;
}

/**
 * MINUTE - Get minute (0-59)
 * Extracts minute from timestamp
 *
 * @param timestamps - Unix timestamps in milliseconds
 * @returns Array of minutes (0-59)
 */
export function MINUTE(timestamps: number[]): number[] {
  const result: number[] = new Array(timestamps.length);

  for (let i = 0; i < timestamps.length; i++) {
    result[i] = new Date(timestamps[i]).getMinutes();
  }

  return result;
}

/**
 * WEEKDAY - Get day of week (1-7)
 * Returns day of week where 1=Monday, 7=Sunday
 * Converts JavaScript's getDay() which returns 0=Sunday, 6=Saturday
 *
 * @param timestamps - Unix timestamps in milliseconds
 * @returns Array of weekdays (1=Monday, 2=Tuesday, ..., 7=Sunday)
 */
export function WEEKDAY(timestamps: number[]): number[] {
  const result: number[] = new Array(timestamps.length);

  for (let i = 0; i < timestamps.length; i++) {
    const day = new Date(timestamps[i]).getDay();
    // Convert Sunday=0 to Sunday=7, and shift others by 1
    result[i] = day === 0 ? 7 : day;
  }

  return result;
}
