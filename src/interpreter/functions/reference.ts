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
 * REFV - Reference value N periods ago.
 * TDX-compatible alias of REF without future-function marking.
 */
export function REFV(data: number[], period: number): number[] {
  return REF(data, period);
}

/**
 * REFX - Future reference by N periods.
 */
export function REFX(data: number[], period: number): number[] {
  const offset = Math.floor(period);
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    const futureIndex = i + offset;
    result[i] = futureIndex >= data.length ? NaN : data[futureIndex];
  }

  return result;
}

/**
 * REFXV - Future reference by N periods.
 * TDX-compatible alias of REFX without future-function marking.
 */
export function REFXV(data: number[], period: number): number[] {
  return REFX(data, period);
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
 * HHVBARS - Bars since the highest value within the rolling window.
 */
export function HHVBARS(data: number[], period: number): number[] {
  const n = Math.floor(period);
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < n - 1) {
      result[i] = NaN;
      continue;
    }

    let maxValue = data[i];
    let bars = 0;
    for (let j = 1; j < n; j++) {
      if (data[i - j] > maxValue) {
        maxValue = data[i - j];
        bars = j;
      }
    }
    result[i] = bars;
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

/**
 * LLVBARS - Bars since the lowest value within the rolling window.
 */
export function LLVBARS(data: number[], period: number): number[] {
  const n = Math.floor(period);
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < n - 1) {
      result[i] = NaN;
      continue;
    }

    let minValue = data[i];
    let bars = 0;
    for (let j = 1; j < n; j++) {
      if (data[i - j] < minValue) {
        minValue = data[i - j];
        bars = j;
      }
    }
    result[i] = bars;
  }

  return result;
}
