/**
 * UPNDAY - Continuous N Day Rise
 * Returns 1 when price rises for N consecutive days, 0 otherwise
 * First N bars return 0 (not enough data)
 *
 * @param close - Close price array
 * @param n - Number of consecutive days
 * @returns Array with results (1 = N consecutive rises, 0 = otherwise)
 */
export function UPNDAY(close: number[], n: number): number[] {
  const period = Math.floor(n);
  const result: number[] = new Array(close.length).fill(0);

  // Need at least period bars to calculate
  for (let i = period; i < close.length; i++) {
    let isUpN = true;
    for (let j = 0; j < period; j++) {
      // Check if close[i-j] > close[i-j-1]
      if (close[i - j] <= close[i - j - 1]) {
        isUpN = false;
        break;
      }
    }
    result[i] = isUpN ? 1 : 0;
  }

  return result;
}

/**
 * DOWNNDAY - Continuous N Day Fall
 * Returns 1 when price falls for N consecutive days, 0 otherwise
 * First N bars return 0 (not enough data)
 *
 * @param close - Close price array
 * @param n - Number of consecutive days
 * @returns Array with results (1 = N consecutive falls, 0 = otherwise)
 */
export function DOWNNDAY(close: number[], n: number): number[] {
  const period = Math.floor(n);
  const result: number[] = new Array(close.length).fill(0);

  // Need at least period bars to calculate
  for (let i = period; i < close.length; i++) {
    let isDownN = true;
    for (let j = 0; j < period; j++) {
      // Check if close[i-j] < close[i-j-1]
      if (close[i - j] >= close[i - j - 1]) {
        isDownN = false;
        break;
      }
    }
    result[i] = isDownN ? 1 : 0;
  }

  return result;
}

/**
 * NDAY - Condition Satisfied for N Consecutive Days
 * Returns 1 when condition is satisfied for N consecutive days, 0 otherwise
 * First N-1 bars return 0 (not enough data)
 *
 * @param cond - Condition array (0 = false, non-zero = true)
 * @param n - Number of consecutive days
 * @returns Array with results (1 = condition satisfied for N days, 0 = otherwise)
 */
export function NDAY(cond: number[], n: number): number[] {
  const period = Math.floor(n);
  const result: number[] = new Array(cond.length).fill(0);

  // Need at least period bars to calculate
  for (let i = period - 1; i < cond.length; i++) {
    let allTrue = true;
    for (let j = 0; j < period; j++) {
      // Check if condition is satisfied (non-zero)
      if (cond[i - j] === 0) {
        allTrue = false;
        break;
      }
    }
    result[i] = allTrue ? 1 : 0;
  }

  return result;
}

/**
 * NDAY_AB - Returns 1 when A has been greater than B for N bars.
 */
export function NDAY_AB(a: number[], b: number[], n: number): number[] {
  const period = Math.floor(n);
  const length = Math.min(a.length, b.length);
  const result: number[] = new Array(length).fill(0);

  for (let i = period - 1; i < length; i++) {
    let allGreater = true;
    for (let j = 0; j < period; j++) {
      if (!(a[i - j] > b[i - j])) {
        allGreater = false;
        break;
      }
    }
    result[i] = allGreater ? 1 : 0;
  }

  return result;
}

/**
 * LAST - Whether condition stayed true from from bars ago through to bars ago.
 */
export function LAST(condition: number[], from: number, to: number): number[] {
  const fromN = Math.floor(from);
  const toN = Math.floor(to);
  const result: number[] = new Array(condition.length).fill(0);

  for (let i = fromN; i < condition.length; i++) {
    let allTrue = true;
    for (let j = toN; j <= fromN; j++) {
      if (condition[i - j] === 0 || Number.isNaN(condition[i - j])) {
        allTrue = false;
        break;
      }
    }
    result[i] = allTrue ? 1 : 0;
  }

  return result;
}

/**
 * EXISTR - Whether condition was true at least once from from bars ago through to bars ago.
 */
export function EXISTR(condition: number[], from: number, to: number): number[] {
  const fromN = Math.floor(from);
  const toN = Math.floor(to);
  const result: number[] = new Array(condition.length).fill(0);

  for (let i = fromN; i < condition.length; i++) {
    for (let j = toN; j <= fromN; j++) {
      if (condition[i - j] !== 0 && !Number.isNaN(condition[i - j])) {
        result[i] = 1;
        break;
      }
    }
  }

  return result;
}

/**
 * RANGE - Check if A is Between B and C
 * Returns 1 when A is between B and C (inclusive), 0 otherwise
 * B and C can be in any order (min and max are determined automatically)
 *
 * @param A - Value to check
 * @param B - First boundary
 * @param C - Second boundary
 * @returns Array with results (1 = in range, 0 = out of range)
 */
export function RANGE(A: number[], B: number[], C: number[]): number[] {
  const len = Math.max(A.length, B.length, C.length);
  const result: number[] = new Array(len).fill(0);

  for (let i = 0; i < len; i++) {
    // Handle arrays of different lengths by using last value
    const a = A[Math.min(i, A.length - 1)];
    const b = B[Math.min(i, B.length - 1)];
    const c = C[Math.min(i, C.length - 1)];

    // Determine min and max boundaries
    const min = Math.min(b, c);
    const max = Math.max(b, c);

    // Check if a is in range [min, max]
    result[i] = (a >= min && a <= max) ? 1 : 0;
  }

  return result;
}

/**
 * BETWEEN - Alias for RANGE
 * Returns 1 when A is between B and C (inclusive), 0 otherwise
 * B and C can be in any order (min and max are determined automatically)
 *
 * @param A - Value to check
 * @param B - First boundary
 * @param C - Second boundary
 * @returns Array with results (1 = in range, 0 = out of range)
 */
export function BETWEEN(A: number[], B: number[], C: number[]): number[] {
  return RANGE(A, B, C);
}
