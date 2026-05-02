/**
 * Period Functions
 * Functions for period information and bar counting
 */

/**
 * Detect the period type from timestamps
 * Analyzes time differences between consecutive bars to infer the period
 *
 * Period codes:
 * - 1: 1-minute
 * - 5: 5-minute
 * - 15: 15-minute
 * - 30: 30-minute
 * - 60: 60-minute (1-hour)
 * - 101: Daily
 * - 102: Weekly
 * - 103: Monthly
 *
 * @param timestamps - Unix timestamps in milliseconds
 * @returns Detected period code
 */
function detectPeriod(timestamps: number[]): number {
  if (timestamps.length < 2) {
    return 101; // Default to daily
  }

  // Calculate time differences between consecutive bars
  const diffs: number[] = [];
  for (let i = 1; i < Math.min(10, timestamps.length); i++) {
    diffs.push(timestamps[i] - timestamps[i - 1]);
  }

  // Use median for robustness (avoid outliers like gaps)
  diffs.sort((a, b) => a - b);
  const medianDiff = diffs[Math.floor(diffs.length / 2)];

  // Time constants (in milliseconds)
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  // Determine period based on median difference
  if (medianDiff < 1.5 * MINUTE) return 1;      // 1-minute
  if (medianDiff < 7 * MINUTE) return 5;        // 5-minute
  if (medianDiff < 20 * MINUTE) return 15;      // 15-minute
  if (medianDiff < 45 * MINUTE) return 30;      // 30-minute
  if (medianDiff < 1.5 * HOUR) return 60;       // 60-minute
  if (medianDiff < 1.5 * DAY) return 101;       // Daily
  if (medianDiff < 8 * DAY) return 102;         // Weekly
  return 103;                                    // Monthly
}

/**
 * PERIOD - Get the period type
 * Automatically detects the period type from timestamp intervals
 * Returns the same period code for all bars
 *
 * @param timestamps - Unix timestamps in milliseconds
 * @returns Array filled with the detected period code
 */
export function PERIOD(timestamps: number[]): number[] {
  const period = detectPeriod(timestamps);
  return new Array(timestamps.length).fill(period);
}

/**
 * BARSCOUNT - Count valid bars seen so far
 *
 * @param dataLength - Length of the data array
 * @returns Array filled with the total bar count
 */
export function BARSCOUNT(data: number[] | number): number[] {
  if (typeof data === 'number') {
    return new Array(data).fill(data);
  }

  const result: number[] = new Array(data.length);
  let count = 0;

  for (let i = 0; i < data.length; i++) {
    if (!Number.isNaN(data[i])) {
      count++;
    }
    result[i] = count;
  }

  return result;
}

/**
 * ISLASTBAR - Check if current bar is the last one
 * Returns 1 for the last bar, 0 for all others
 * Useful for triggering actions only on the most recent bar
 *
 * @param dataLength - Length of the data array
 * @returns Array with 1 at the last position, 0 elsewhere
 */
export function ISLASTBAR(dataLength: number): number[] {
  const result = new Array(dataLength).fill(0);
  result[dataLength - 1] = 1;
  return result;
}

/**
 * BARSSINCE - Bars since first condition match
 * Counts the number of bars from the first time the condition was true
 * Returns 0 until the condition is first met, then increments
 *
 * Example:
 * Input:  [0, 0, 1, 0, 1, 0, 0]
 * Output: [0, 0, 0, 1, 2, 3, 4]
 *
 * @param condition - Boolean array (0 or non-zero)
 * @returns Array with count of bars since first true condition
 */
export function BARSSINCE(condition: number[]): number[] {
  const result = new Array(condition.length);

  // Find the first index where condition is true (non-zero)
  let firstTrueIndex = -1;
  for (let i = 0; i < condition.length; i++) {
    if (condition[i] !== 0 && !Number.isNaN(condition[i])) {
      firstTrueIndex = i;
      break;
    }
  }

  // If condition was never true, return all NaN values.
  if (firstTrueIndex === -1) {
    result.fill(NaN);
    return result;
  }

  for (let i = 0; i < firstTrueIndex; i++) {
    result[i] = NaN;
  }

  // Count bars since first true
  for (let i = firstTrueIndex; i < condition.length; i++) {
    result[i] = i - firstTrueIndex;
  }

  return result;
}

/**
 * CURRBARSCOUNT - Distance from current bar to the last bar, counting current bar.
 */
export function CURRBARSCOUNT(dataLength: number): number[] {
  return Array.from({ length: dataLength }, (_, index) => dataLength - index);
}

/**
 * TOTALBARSCOUNT - Total number of bars repeated on every bar.
 */
export function TOTALBARSCOUNT(dataLength: number): number[] {
  return new Array(dataLength).fill(dataLength);
}

/**
 * SUMBARS - Number of bars needed for cumulative sum to reach target.
 */
export function SUMBARS(data: number[], target: number): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    result[i] = NaN;
    for (let j = i; j >= 0; j--) {
      sum += data[j];
      if (sum >= target) {
        result[i] = i - j + 1;
        break;
      }
    }
  }

  return result;
}
