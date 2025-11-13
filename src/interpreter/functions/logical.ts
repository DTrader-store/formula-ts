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
    result[i] = condition[i] !== 0 ? a[i] : b[i];
  }

  return result;
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
