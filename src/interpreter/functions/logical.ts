/**
 * IF - Conditional Selection
 * Returns A when condition is true (non-zero), otherwise returns B
 *
 * @param condition - Condition array (0 = false, non-zero = true)
 * @param a - Array to select when condition is true
 * @param b - Array to select when condition is false
 * @returns Array with selected values (length = min of all arrays)
 */
export function IF(condition: number[], a: number[], b: number[]): number[] {
  const length = Math.min(condition.length, a.length, b.length);
  const result: number[] = new Array(length);

  for (let i = 0; i < length; i++) {
    result[i] = condition[i] !== 0 && !Number.isNaN(condition[i]) ? a[i] : b[i];
  }

  return result;
}

/**
 * IFF - Alias for IF
 */
export function IFF(condition: number[], a: number[], b: number[]): number[] {
  return IF(condition, a, b);
}

/**
 * IFN - Inverted IF. Returns A when condition is false, otherwise B.
 */
export function IFN(condition: number[], a: number[], b: number[]): number[] {
  return IF(condition, b, a);
}

/**
 * CROSS - Crossover Detection
 * Detects when A crosses above B
 * Returns 1 when A[i-1] < B[i-1] and A[i] >= B[i], otherwise 0
 *
 * @param a - First array
 * @param b - Second array
 * @returns Array with cross signals (1 = cross, 0 = no cross)
 */
export function CROSS(a: number[], b: number[]): number[] {
  const length = Math.min(a.length, b.length);
  const result: number[] = new Array(length);

  // First value is always 0 (no previous data to compare)
  result[0] = 0;

  for (let i = 1; i < length; i++) {
    // Check if previous A was below B and current A is at or above B
    const wasBelowPreviously = a[i - 1] < b[i - 1];
    const isAboveOrEqualNow = a[i] >= b[i];

    result[i] = wasBelowPreviously && isAboveOrEqualNow ? 1 : 0;
  }

  return result;
}

/**
 * LONGCROSS - Cross above after A has stayed below B for N bars.
 */
export function LONGCROSS(a: number[], b: number[], period: number): number[] {
  const length = Math.min(a.length, b.length);
  const n = Math.floor(period);
  const result: number[] = new Array(length).fill(0);

  for (let i = 1; i < length; i++) {
    if (!(a[i - 1] <= b[i - 1] && a[i] > b[i]) || i < n) {
      continue;
    }

    let stayedBelow = true;
    for (let j = 1; j <= n; j++) {
      if (a[i - j] >= b[i - j]) {
        stayedBelow = false;
        break;
      }
    }
    result[i] = stayedBelow ? 1 : 0;
  }

  return result;
}

/**
 * EVERY - Check if all values in N periods are non-zero
 * Returns 1 if all values in the last N periods are non-zero, 0 otherwise
 * First N-1 values are NaN (not enough data)
 *
 * @param data - Input array
 * @param period - Number of periods to check
 * @returns Array with results (1 = all non-zero, 0 = at least one zero, NaN = not enough data)
 */
export function EVERY(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length).fill(0);

  const n = Math.floor(period);

  // Calculate for remaining values
  for (let i = n - 1; i < data.length; i++) {
    let allNonZero = true;
    for (let j = i - n + 1; j <= i; j++) {
      if (data[j] === 0 || Number.isNaN(data[j])) {
        allNonZero = false;
        break;
      }
    }
    result[i] = allNonZero ? 1 : 0;
  }

  return result;
}

/**
 * EXIST - Check if any value in N periods is non-zero
 * Returns 1 if at least one value in the last N periods is non-zero, 0 if all are zero
 * First N-1 values are NaN (not enough data)
 *
 * @param data - Input array
 * @param period - Number of periods to check
 * @returns Array with results (1 = at least one non-zero, 0 = all zero, NaN = not enough data)
 */
export function EXIST(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length).fill(0);

  const n = Math.floor(period);

  // Calculate for remaining values
  for (let i = n - 1; i < data.length; i++) {
    let hasNonZero = false;
    for (let j = i - n + 1; j <= i; j++) {
      if (data[j] !== 0 && !Number.isNaN(data[j])) {
        hasNonZero = true;
        break;
      }
    }
    result[i] = hasNonZero ? 1 : 0;
  }

  return result;
}

/**
 * BARSLAST - Bars since last non-zero value
 * Returns the number of bars (periods) since the last non-zero value
 * If current value is non-zero, returns 0
 * If no previous non-zero value exists, starts counting from 1
 *
 * @param data - Input array
 * @returns Array with bar counts
 */
export function BARSLAST(data: number[]): number[] {
  const result: number[] = new Array(data.length);

  let lastNonZeroIndex = -1; // Index of last non-zero value

  for (let i = 0; i < data.length; i++) {
    if (data[i] !== 0 && !Number.isNaN(data[i])) {
      // Current value is non-zero
      result[i] = 0;
      lastNonZeroIndex = i;
    } else if (lastNonZeroIndex >= 0) {
      // There's a previous non-zero value
      result[i] = i - lastNonZeroIndex;
    } else {
      // No previous non-zero value exists
      result[i] = NaN;
    }
  }

  return result;
}

/**
 * BARSLASTCOUNT - Consecutive true count ending at each bar.
 */
export function BARSLASTCOUNT(data: number[]): number[] {
  const result: number[] = new Array(data.length);
  let count = 0;

  for (let i = 0; i < data.length; i++) {
    if (data[i] !== 0 && !Number.isNaN(data[i])) {
      count++;
    } else {
      count = 0;
    }
    result[i] = count;
  }

  return result;
}

/**
 * COUNT - Count non-zero values in N periods
 * Returns the count of non-zero values in the last N periods
 * First N-1 values are NaN (not enough data)
 *
 * @param data - Input array
 * @param period - Number of periods to check
 * @returns Array with counts (NaN = not enough data)
 */
export function COUNT(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);

  // First period-1 values are NaN
  for (let i = 0; i < period - 1; i++) {
    result[i] = NaN;
  }

  // Calculate for remaining values
  for (let i = period - 1; i < data.length; i++) {
    let count = 0;
    for (let j = i - period + 1; j <= i; j++) {
      if (data[j] !== 0 && !Number.isNaN(data[j])) {
        count++;
      }
    }
    result[i] = count;
  }

  return result;
}

/**
 * FILTER - Keep a signal, then suppress following signals for N bars.
 */
export function FILTER(data: number[], period: number): number[] {
  const n = Math.floor(period);
  const result: number[] = new Array(data.length).fill(0);
  let lastSignal = -n - 1;

  for (let i = 0; i < data.length; i++) {
    if (data[i] !== 0 && !Number.isNaN(data[i]) && i - lastSignal >= n) {
      result[i] = 1;
      lastSignal = i;
    }
  }

  return result;
}

/**
 * NOT - Logical negation, treating NaN as false.
 */
export function NOT(data: number[]): number[] {
  return data.map((value) => (value !== 0 && !Number.isNaN(value) ? 0 : 1));
}
