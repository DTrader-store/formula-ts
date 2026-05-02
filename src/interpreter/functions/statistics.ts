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
 * VARP - Population variance alias for VAR
 */
export function VARP(data: number[], period: number): number[] {
  return VAR(data, period);
}

/**
 * STDP - Population standard deviation alias for STD
 */
export function STDP(data: number[], period: number): number[] {
  return STD(data, period);
}

/**
 * STDDEV - Sample standard deviation
 */
export function STDDEV(data: number[], period: number): number[] {
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
    const mean = sum / period;

    let variance = 0;
    for (let j = 0; j < period; j++) {
      const diff = data[i - j] - mean;
      variance += diff * diff;
    }

    result[i] = period < 2 ? 0 : Math.sqrt(variance / (period - 1));
  }

  return result;
}

/**
 * DEVSQ - Sum of squared deviations from the rolling mean
 */
export function DEVSQ(data: number[], period: number): number[] {
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
    const mean = sum / period;

    let devsq = 0;
    for (let j = 0; j < period; j++) {
      const diff = data[i - j] - mean;
      devsq += diff * diff;
    }

    result[i] = devsq;
  }

  return result;
}

/**
 * FORCAST - Rolling linear regression projection at the current bar.
 */
export function FORCAST(data: number[], period: number): number[] {
  return rollingRegression(data, period, (slope, intercept, n) => intercept + slope * (n - 1));
}

/**
 * SLOPE - Rolling linear regression slope.
 */
export function SLOPE(data: number[], period: number): number[] {
  return rollingRegression(data, period, (slope) => slope);
}

/**
 * COVAR - Rolling population covariance.
 */
export function COVAR(a: number[], b: number[], period: number): number[] {
  return rollingPairStats(a, b, period, covariance);
}

/**
 * RELATE - Rolling correlation coefficient.
 */
export function RELATE(a: number[], b: number[], period: number): number[] {
  return rollingPairStats(a, b, period, (windowA, windowB) => {
    const cov = covariance(windowA, windowB);
    const varA = variance(windowA);
    const varB = variance(windowB);
    return varA === 0 || varB === 0 ? NaN : cov / Math.sqrt(varA * varB);
  });
}

/**
 * BETA - Rolling beta = covariance(a,b) / variance(b).
 */
export function BETA(a: number[], b: number[], period: number): number[] {
  return rollingPairStats(a, b, period, (windowA, windowB) => {
    const varB = variance(windowB);
    return varB === 0 ? NaN : covariance(windowA, windowB) / varB;
  });
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

function rollingRegression(
  data: number[],
  period: number,
  fn: (slope: number, intercept: number, n: number) => number,
): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    const window = data.slice(i - period + 1, i + 1);
    const { slope, intercept } = linearRegression(window);
    result[i] = fn(slope, intercept, window.length);
  }

  return result;
}

function rollingPairStats(
  a: number[],
  b: number[],
  period: number,
  fn: (a: number[], b: number[]) => number,
): number[] {
  const length = Math.min(a.length, b.length);
  const result: number[] = new Array(length);

  for (let i = 0; i < length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    result[i] = fn(a.slice(i - period + 1, i + 1), b.slice(i - period + 1, i + 1));
  }

  return result;
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function variance(values: number[]): number {
  const mean = average(values);
  return values.reduce((sum, value) => {
    const diff = value - mean;
    return sum + diff * diff;
  }, 0) / values.length;
}

function covariance(a: number[], b: number[]): number {
  const meanA = average(a);
  const meanB = average(b);
  let sum = 0;

  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - meanA) * (b[i] - meanB);
  }

  return sum / a.length;
}

function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < values.length; i++) {
    const x = i;
    const y = values[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    return { slope: 0, intercept: values[values.length - 1] };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}
