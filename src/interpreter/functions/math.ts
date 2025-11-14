/**
 * MA - Simple Moving Average
 * Calculates the simple moving average over N periods
 *
 * @param data - Input data array
 * @param period - Number of periods for the moving average
 * @returns Array with MA values (NaN for insufficient data)
 */
export function MA(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    result[i] = sum / period;
  }

  return result;
}

/**
 * EMA - Exponential Moving Average
 * Calculates the exponential moving average over N periods
 * Uses multiplier = 2/(N+1)
 * First EMA value is calculated as SMA
 *
 * @param data - Input data array
 * @param period - Number of periods for the EMA
 * @returns Array with EMA values (NaN for insufficient data)
 */
export function EMA(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);
  const multiplier = 2 / (period + 1);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    if (i === period - 1) {
      // First EMA value = SMA
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      result[i] = sum / period;
    } else {
      // EMA = (Current - Previous EMA) * multiplier + Previous EMA
      result[i] = (data[i] - result[i - 1]) * multiplier + result[i - 1];
    }
  }

  return result;
}

/**
 * SUM - Summation
 * Calculates the sum over N periods
 *
 * @param data - Input data array
 * @param period - Number of periods to sum
 * @returns Array with sum values (NaN for insufficient data)
 */
export function SUM(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    result[i] = sum;
  }

  return result;
}

/**
 * MAX - Maximum
 * Returns element-wise maximum of two arrays
 *
 * @param a - First array
 * @param b - Second array
 * @returns Array with maximum values (length = min(a.length, b.length))
 */
export function MAX(a: number[], b: number[]): number[] {
  const length = Math.min(a.length, b.length);
  const result: number[] = new Array(length);

  for (let i = 0; i < length; i++) {
    result[i] = Math.max(a[i], b[i]);
  }

  return result;
}

/**
 * MIN - Minimum
 * Returns element-wise minimum of two arrays
 *
 * @param a - First array
 * @param b - Second array
 * @returns Array with minimum values (length = min(a.length, b.length))
 */
export function MIN(a: number[], b: number[]): number[] {
  const length = Math.min(a.length, b.length);
  const result: number[] = new Array(length);

  for (let i = 0; i < length; i++) {
    result[i] = Math.min(a[i], b[i]);
  }

  return result;
}

/**
 * ABS - Absolute Value
 * Returns element-wise absolute values
 *
 * @param data - Input data array
 * @returns Array with absolute values
 */
export function ABS(data: number[]): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    result[i] = Math.abs(data[i]);
  }

  return result;
}

/**
 * SQRT - Square Root
 * Returns element-wise square root values
 *
 * @param data - Input data array
 * @returns Array with square root values (NaN for negative values)
 */
export function SQRT(data: number[]): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    result[i] = Math.sqrt(data[i]);
  }

  return result;
}

/**
 * POW - Power (Exponentiation)
 * Returns element-wise power values
 *
 * @param base - Base array
 * @param exponent - Exponent array
 * @returns Array with power values (length = min(base.length, exponent.length))
 */
export function POW(base: number[], exponent: number[]): number[] {
  const length = Math.min(base.length, exponent.length);
  const result: number[] = new Array(length);

  for (let i = 0; i < length; i++) {
    result[i] = Math.pow(base[i], exponent[i]);
  }

  return result;
}

/**
 * MOD - Modulo
 * Returns element-wise modulo values
 *
 * @param dividend - Dividend array
 * @param divisor - Divisor array
 * @returns Array with modulo values (length = min(dividend.length, divisor.length))
 */
export function MOD(dividend: number[], divisor: number[]): number[] {
  const length = Math.min(dividend.length, divisor.length);
  const result: number[] = new Array(length);

  for (let i = 0; i < length; i++) {
    if (divisor[i] === 0) {
      result[i] = NaN;
    } else {
      result[i] = dividend[i] % divisor[i];
    }
  }

  return result;
}

/**
 * ROUND - Rounding
 * Returns element-wise rounded values
 *
 * @param data - Input data array
 * @returns Array with rounded values
 */
export function ROUND(data: number[]): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    result[i] = Math.round(data[i]);
  }

  return result;
}
