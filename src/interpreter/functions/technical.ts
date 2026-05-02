/**
 * Technical Analysis Functions
 * Implements common technical indicators used in trading systems
 */

/**
 * SMA - Simple Moving Average with Weight (TongDaXin style)
 * This is a weighted moving average specific to TongDaXin formula system
 *
 * Formula:
 * - First value: Simple average of first N values
 * - Subsequent values: (M * Current + (N - M) * Previous_SMA) / N
 *
 * When M=1, this becomes a standard simple moving average
 * When M=N, this becomes the current value (no smoothing)
 *
 * @param data - Input data array
 * @param N - Period for the moving average
 * @param M - Weight parameter for smoothing (1 to N)
 * @returns Array with SMA values (NaN for insufficient data)
 */
export function SMA(data: number[], N: number, M: number): number[] {
  const result: number[] = new Array(data.length);

  if (data.length === 0) {
    return result;
  }

  result[0] = data[0];
  for (let i = 1; i < data.length; i++) {
    result[i] = (M * data[i] + (N - M) * result[i - 1]) / N;
  }

  return result;
}

/**
 * WMA - Weighted Moving Average
 * Applies linearly increasing weights to recent values
 *
 * Weights: 1, 2, 3, ..., N (oldest to newest)
 * WMA = (data[i-N+1]*1 + data[i-N+2]*2 + ... + data[i]*N) / (1+2+...+N)
 * Sum of weights = N*(N+1)/2
 *
 * @param data - Input data array
 * @param N - Number of periods
 * @returns Array with WMA values (NaN for insufficient data)
 */
export function WMA(data: number[], N: number): number[] {
  const result: number[] = new Array(data.length);
  const weightSum = (N * (N + 1)) / 2; // Sum of 1+2+...+N

  for (let i = 0; i < data.length; i++) {
    if (i < N - 1) {
      result[i] = NaN;
      continue;
    }

    let weightedSum = 0;
    for (let j = 0; j < N; j++) {
      const weight = j + 1; // Weight increases from 1 to N
      weightedSum += data[i - N + 1 + j] * weight;
    }
    result[i] = weightedSum / weightSum;
  }

  return result;
}

/**
 * DMA - Dynamic moving average.
 * Alpha can be a scalar series (same value on every bar) or a per-bar series.
 */
export function DMA(data: number[], alpha: number[]): number[] {
  const result: number[] = new Array(data.length);
  if (data.length === 0) {
    return result;
  }

  result[0] = data[0];
  for (let i = 1; i < data.length; i++) {
    const currentAlpha = alpha[Math.min(i, alpha.length - 1)];
    result[i] = currentAlpha * data[i] + (1 - currentAlpha) * result[i - 1];
  }

  return result;
}

/**
 * CONST - Fill all bars with the final value of the input series.
 */
export function CONST(data: number[]): number[] {
  if (data.length === 0) {
    return [];
  }
  return new Array(data.length).fill(data[data.length - 1]);
}

/**
 * BOLL - Bollinger Bands
 * Returns three arrays: upper band, middle band (MA), lower band
 *
 * Middle Band = N-period moving average
 * Upper Band = Middle Band + P * Standard Deviation
 * Lower Band = Middle Band - P * Standard Deviation
 *
 * @param data - Input data array
 * @param N - Period for moving average
 * @param P - Number of standard deviations
 * @returns Array of three arrays: [upper, middle, lower]
 */
export function BOLL(data: number[], N: number, P: number): [number[], number[], number[]] {
  const upper: number[] = new Array(data.length);
  const middle: number[] = new Array(data.length);
  const lower: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < N - 1) {
      upper[i] = NaN;
      middle[i] = NaN;
      lower[i] = NaN;
      continue;
    }

    // Calculate middle band (simple moving average)
    let sum = 0;
    for (let j = 0; j < N; j++) {
      sum += data[i - j];
    }
    const ma = sum / N;
    middle[i] = ma;

    // Calculate standard deviation
    let variance = 0;
    for (let j = 0; j < N; j++) {
      const diff = data[i - j] - ma;
      variance += diff * diff;
    }
    const stdDev = Math.sqrt(variance / N);

    // Calculate upper and lower bands
    upper[i] = ma + P * stdDev;
    lower[i] = ma - P * stdDev;
  }

  return [upper, middle, lower];
}

/**
 * RSI - Relative Strength Index
 * Measures the speed and magnitude of price changes
 *
 * RSI = 100 - (100 / (1 + RS))
 * RS = Average Gain / Average Loss over N periods
 *
 * Uses exponential moving average for smoothing
 *
 * @param data - Input data array (typically closing prices)
 * @param N - Number of periods
 * @returns Array with RSI values (0-100, NaN for insufficient data)
 */
export function RSI(data: number[], N: number): number[] {
  const result: number[] = new Array(data.length);

  // Need at least N+1 values to calculate first RSI
  for (let i = 0; i < N; i++) {
    result[i] = NaN;
  }

  if (data.length <= N) {
    return result;
  }

  // Calculate initial average gain and loss (first N periods)
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= N; i++) {
    const change = data[i] - data[i - 1];
    if (change > 0) {
      avgGain += change;
    } else {
      avgLoss += Math.abs(change);
    }
  }

  avgGain /= N;
  avgLoss /= N;

  // Calculate first RSI
  const rs = avgLoss === 0 ? (avgGain > 0 ? Infinity : 0) : avgGain / avgLoss;
  result[N] = avgLoss === 0 && avgGain === 0 ? 50 : 100 - 100 / (1 + rs);

  // Calculate subsequent RSI values using exponential smoothing
  for (let i = N + 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    // Exponential moving average
    avgGain = (avgGain * (N - 1) + gain) / N;
    avgLoss = (avgLoss * (N - 1) + loss) / N;

    const currentRS = avgLoss === 0 ? (avgGain > 0 ? Infinity : 0) : avgGain / avgLoss;
    result[i] = avgLoss === 0 && avgGain === 0 ? 50 : 100 - 100 / (1 + currentRS);
  }

  return result;
}

/**
 * ATR - Average True Range
 * Measures market volatility
 *
 * True Range (TR) = max of:
 * 1. High - Low
 * 2. |High - Previous Close|
 * 3. |Low - Previous Close|
 *
 * ATR = N-period exponential moving average of TR
 * First ATR = simple average of first N true ranges
 * Subsequent ATR = (Previous ATR * (N-1) + Current TR) / N
 *
 * @param high - Array of high prices
 * @param low - Array of low prices
 * @param close - Array of closing prices
 * @param N - Number of periods
 * @returns Array with ATR values (NaN for insufficient data)
 */
export function ATR(high: number[], low: number[], close: number[], N: number): number[] {
  const length = Math.min(high.length, low.length, close.length);
  const result: number[] = new Array(length);

  // Need at least N+1 values (to calculate N true ranges)
  for (let i = 0; i < N; i++) {
    result[i] = NaN;
  }

  if (length <= N) {
    return result;
  }

  // Calculate true ranges
  const trueRanges: number[] = new Array(length);

  // First true range is just high - low (no previous close)
  trueRanges[0] = high[0] - low[0];

  // Calculate true ranges for remaining periods
  for (let i = 1; i < length; i++) {
    const highLow = high[i] - low[i];
    const highPrevClose = Math.abs(high[i] - close[i - 1]);
    const lowPrevClose = Math.abs(low[i] - close[i - 1]);
    trueRanges[i] = Math.max(highLow, highPrevClose, lowPrevClose);
  }

  // Calculate first ATR as simple average of first N true ranges
  let sum = 0;
  for (let i = 1; i <= N; i++) {
    sum += trueRanges[i];
  }
  result[N] = sum / N;

  // Calculate subsequent ATR values using exponential smoothing
  for (let i = N + 1; i < length; i++) {
    result[i] = (result[i - 1] * (N - 1) + trueRanges[i]) / N;
  }

  return result;
}
