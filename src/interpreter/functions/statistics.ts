/**
 * STD - Standard Deviation
 * Calculates the standard deviation over N periods
 * Uses population standard deviation (not sample)
 *
 * @param data - Input data array
 * @param period - Number of periods for the standard deviation
 * @returns Array with standard deviation values (NaN for insufficient data)
 */
export function STD(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    // Calculate mean
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    const mean = sum / period;

    // Calculate variance (sum of squared differences)
    let variance = 0;
    for (let j = 0; j < period; j++) {
      const diff = data[i - j] - mean;
      variance += diff * diff;
    }
    variance /= period;

    // Standard deviation is square root of variance
    result[i] = Math.sqrt(variance);
  }

  return result;
}

/**
 * VAR - Variance
 * Calculates the variance over N periods
 * Uses population variance (not sample)
 *
 * @param data - Input data array
 * @param period - Number of periods for the variance
 * @returns Array with variance values (NaN for insufficient data)
 */
export function VAR(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    // Calculate mean
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    const mean = sum / period;

    // Calculate variance (sum of squared differences)
    let variance = 0;
    for (let j = 0; j < period; j++) {
      const diff = data[i - j] - mean;
      variance += diff * diff;
    }
    variance /= period;

    result[i] = variance;
  }

  return result;
}

/**
 * MEDIAN - Median
 * Calculates the median over N periods
 *
 * @param data - Input data array
 * @param period - Number of periods for the median
 * @returns Array with median values (NaN for insufficient data)
 */
export function MEDIAN(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    // Extract window of data
    const window: number[] = [];
    for (let j = 0; j < period; j++) {
      window.push(data[i - j]);
    }

    // Sort the window
    window.sort((a, b) => a - b);

    // Calculate median
    const mid = Math.floor(period / 2);
    if (period % 2 === 1) {
      // Odd number of elements
      result[i] = window[mid];
    } else {
      // Even number of elements - average of two middle values
      result[i] = (window[mid - 1] + window[mid]) / 2;
    }
  }

  return result;
}

/**
 * AVEDEV - Average Absolute Deviation
 * Calculates the average absolute deviation from the mean over N periods
 *
 * @param data - Input data array
 * @param period - Number of periods for the average absolute deviation
 * @returns Array with average absolute deviation values (NaN for insufficient data)
 */
export function AVEDEV(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    // Calculate mean
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    const mean = sum / period;

    // Calculate average absolute deviation
    let sumAbsDev = 0;
    for (let j = 0; j < period; j++) {
      sumAbsDev += Math.abs(data[i - j] - mean);
    }
    const avedev = sumAbsDev / period;

    result[i] = avedev;
  }

  return result;
}
