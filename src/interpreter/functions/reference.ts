/**
 * REF - Reference
 * Returns the value N periods ago
 *
 * @param data - Input data array
 * @param period - Number of periods to look back
 * @returns Array with referenced values (NaN for insufficient history)
 */
export function REF(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result[i] = NaN;
    } else {
      result[i] = data[i - period];
    }
  }

  return result;
}

/**
 * HHV - Highest High Value
 * Returns the highest value over N periods
 *
 * @param data - Input data array
 * @param period - Number of periods to look back
 * @returns Array with highest values (NaN for insufficient data)
 */
export function HHV(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    let max = data[i];
    for (let j = 1; j < period; j++) {
      max = Math.max(max, data[i - j]);
    }
    result[i] = max;
  }

  return result;
}

/**
 * LLV - Lowest Low Value
 * Returns the lowest value over N periods
 *
 * @param data - Input data array
 * @param period - Number of periods to look back
 * @returns Array with lowest values (NaN for insufficient data)
 */
export function LLV(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    let min = data[i];
    for (let j = 1; j < period; j++) {
      min = Math.min(min, data[i - j]);
    }
    result[i] = min;
  }

  return result;
}
