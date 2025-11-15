/**
 * Advanced Technical Indicators
 * Implements 15 commonly used technical indicators for trading analysis
 */

import { EMA } from './math';

/**
 * Helper function to calculate EMA (reuse from math.ts)
 */
function calculateEMA(data: number[], period: number): number[] {
  return EMA(data, period);
}

/**
 * Helper function to calculate Simple Moving Average
 */
function calculateMA(data: number[], period: number): number[] {
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
 * Helper function to calculate RSV (Raw Stochastic Value) for KDJ
 */
function calculateRSV(high: number[], low: number[], close: number[], period: number): number[] {
  const result: number[] = new Array(close.length);

  for (let i = 0; i < close.length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    let highestHigh = high[i];
    let lowestLow = low[i];

    for (let j = 0; j < period; j++) {
      highestHigh = Math.max(highestHigh, high[i - j]);
      lowestLow = Math.min(lowestLow, low[i - j]);
    }

    const range = highestHigh - lowestLow;
    if (range === 0) {
      result[i] = 50; // Default to middle value if no range
    } else {
      result[i] = ((close[i] - lowestLow) / range) * 100;
    }
  }

  return result;
}

/**
 * Helper function to calculate True Range for DMI/ADX
 */
function calculateTR(high: number[], low: number[], close: number[]): number[] {
  const length = Math.min(high.length, low.length, close.length);
  const result: number[] = new Array(length);

  // First true range is just high - low (no previous close)
  result[0] = high[0] - low[0];

  // Calculate true ranges for remaining periods
  for (let i = 1; i < length; i++) {
    const highLow = high[i] - low[i];
    const highPrevClose = Math.abs(high[i] - close[i - 1]);
    const lowPrevClose = Math.abs(low[i] - close[i - 1]);
    result[i] = Math.max(highLow, highPrevClose, lowPrevClose);
  }

  return result;
}

// ============================================================================
// MACD - Moving Average Convergence Divergence
// ============================================================================

/**
 * MACD_DIF - MACD DIF Line (Fast EMA - Slow EMA)
 *
 * @param close - Closing prices
 * @param fast - Fast EMA period (typically 12)
 * @param slow - Slow EMA period (typically 26)
 * @returns DIF line values
 */
export function MACD_DIF(close: number[], fast: number, slow: number): number[] {
  const fastEMA = calculateEMA(close, fast);
  const slowEMA = calculateEMA(close, slow);

  const result: number[] = new Array(close.length);
  for (let i = 0; i < close.length; i++) {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
      result[i] = NaN;
    } else {
      result[i] = fastEMA[i] - slowEMA[i];
    }
  }

  return result;
}

/**
 * MACD_DEA - MACD Signal Line (EMA of DIF)
 *
 * @param close - Closing prices
 * @param fast - Fast EMA period (typically 12)
 * @param slow - Slow EMA period (typically 26)
 * @param signal - Signal line period (typically 9)
 * @returns DEA line values
 */
export function MACD_DEA(close: number[], fast: number, slow: number, signal: number): number[] {
  const dif = MACD_DIF(close, fast, slow);
  return calculateEMA(dif, signal);
}

/**
 * MACD_MACD - MACD Histogram (DIF - DEA) * 2
 *
 * @param close - Closing prices
 * @param fast - Fast EMA period (typically 12)
 * @param slow - Slow EMA period (typically 26)
 * @param signal - Signal line period (typically 9)
 * @returns MACD histogram values
 */
export function MACD_MACD(close: number[], fast: number, slow: number, signal: number): number[] {
  const dif = MACD_DIF(close, fast, slow);
  const dea = MACD_DEA(close, fast, slow, signal);

  const result: number[] = new Array(close.length);
  for (let i = 0; i < close.length; i++) {
    if (isNaN(dif[i]) || isNaN(dea[i])) {
      result[i] = NaN;
    } else {
      result[i] = (dif[i] - dea[i]) * 2;
    }
  }

  return result;
}

// ============================================================================
// KDJ - Stochastic Oscillator
// ============================================================================

/**
 * KDJ_K - K Line (SMA of RSV)
 *
 * @param high - High prices
 * @param low - Low prices
 * @param close - Closing prices
 * @param n - RSV period (typically 9)
 * @param m1 - K smoothing period (typically 3)
 * @returns K line values
 */
export function KDJ_K(high: number[], low: number[], close: number[], n: number, m1: number): number[] {
  const rsv = calculateRSV(high, low, close, n);

  // K is SMA of RSV, but using weighted formula like TongDaXin's SMA
  // K = (M1 * RSV + (N - M1) * Previous K) / N, where N is smoothing period
  const result: number[] = new Array(close.length);

  for (let i = 0; i < close.length; i++) {
    if (isNaN(rsv[i])) {
      result[i] = NaN;
      continue;
    }

    if (i === 0 || isNaN(result[i - 1])) {
      result[i] = rsv[i];
    } else {
      // Weighted moving average: (M1 * Current + (m1 - 1) * Previous) / m1
      result[i] = (rsv[i] + (m1 - 1) * result[i - 1]) / m1;
    }
  }

  return result;
}

/**
 * KDJ_D - D Line (SMA of K)
 *
 * @param high - High prices
 * @param low - Low prices
 * @param close - Closing prices
 * @param n - RSV period (typically 9)
 * @param m1 - K smoothing period (typically 3)
 * @param m2 - D smoothing period (typically 3)
 * @returns D line values
 */
export function KDJ_D(high: number[], low: number[], close: number[], n: number, m1: number, m2: number): number[] {
  const k = KDJ_K(high, low, close, n, m1);

  const result: number[] = new Array(close.length);

  for (let i = 0; i < close.length; i++) {
    if (isNaN(k[i])) {
      result[i] = NaN;
      continue;
    }

    if (i === 0 || isNaN(result[i - 1])) {
      result[i] = k[i];
    } else {
      result[i] = (k[i] + (m2 - 1) * result[i - 1]) / m2;
    }
  }

  return result;
}

/**
 * KDJ_J - J Line (3*K - 2*D)
 *
 * @param high - High prices
 * @param low - Low prices
 * @param close - Closing prices
 * @param n - RSV period (typically 9)
 * @param m1 - K smoothing period (typically 3)
 * @param m2 - D smoothing period (typically 3)
 * @returns J line values
 */
export function KDJ_J(high: number[], low: number[], close: number[], n: number, m1: number, m2: number): number[] {
  const k = KDJ_K(high, low, close, n, m1);
  const d = KDJ_D(high, low, close, n, m1, m2);

  const result: number[] = new Array(close.length);
  for (let i = 0; i < close.length; i++) {
    if (isNaN(k[i]) || isNaN(d[i])) {
      result[i] = NaN;
    } else {
      result[i] = 3 * k[i] - 2 * d[i];
    }
  }

  return result;
}

// ============================================================================
// SAR - Parabolic Stop and Reverse
// ============================================================================

/**
 * SAR - Parabolic SAR
 *
 * @param high - High prices
 * @param low - Low prices
 * @param step - Acceleration factor step (typically 0.02)
 * @param max - Maximum acceleration factor (typically 0.2)
 * @returns SAR values
 */
export function SAR(high: number[], low: number[], step: number, max: number): number[] {
  const length = Math.min(high.length, low.length);
  const result: number[] = new Array(length);

  if (length < 2) {
    result[0] = NaN;
    return result;
  }

  // Initialize - assume starting in uptrend
  let isUptrend = true;
  let sar = low[0];
  let ep = high[0]; // Extreme point
  let af = step; // Acceleration factor

  result[0] = sar;

  for (let i = 1; i < length; i++) {
    // Calculate new SAR
    sar = sar + af * (ep - sar);

    if (isUptrend) {
      // Check for reversal
      if (low[i] < sar) {
        isUptrend = false;
        sar = ep; // Switch to highest high
        ep = low[i]; // New extreme point is current low
        af = step; // Reset acceleration factor
      } else {
        // Continue uptrend
        if (high[i] > ep) {
          ep = high[i];
          af = Math.min(af + step, max);
        }
        // SAR should not be above prior two lows
        sar = Math.min(sar, low[i - 1]);
        if (i > 1) {
          sar = Math.min(sar, low[i - 2]);
        }
      }
    } else {
      // Downtrend
      if (high[i] > sar) {
        isUptrend = true;
        sar = ep; // Switch to lowest low
        ep = high[i]; // New extreme point is current high
        af = step; // Reset acceleration factor
      } else {
        // Continue downtrend
        if (low[i] < ep) {
          ep = low[i];
          af = Math.min(af + step, max);
        }
        // SAR should not be below prior two highs
        sar = Math.max(sar, high[i - 1]);
        if (i > 1) {
          sar = Math.max(sar, high[i - 2]);
        }
      }
    }

    result[i] = sar;
  }

  return result;
}

// ============================================================================
// CCI - Commodity Channel Index
// ============================================================================

/**
 * CCI - Commodity Channel Index
 *
 * @param high - High prices
 * @param low - Low prices
 * @param close - Closing prices
 * @param period - Period (typically 14)
 * @returns CCI values
 */
export function CCI(high: number[], low: number[], close: number[], period: number): number[] {
  const length = Math.min(high.length, low.length, close.length);
  const result: number[] = new Array(length);

  // Calculate typical price
  const tp: number[] = new Array(length);
  for (let i = 0; i < length; i++) {
    tp[i] = (high[i] + low[i] + close[i]) / 3;
  }

  for (let i = 0; i < length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    // Calculate SMA of typical price
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += tp[i - j];
    }
    const sma = sum / period;

    // Calculate mean deviation
    let deviation = 0;
    for (let j = 0; j < period; j++) {
      deviation += Math.abs(tp[i - j] - sma);
    }
    const meanDeviation = deviation / period;

    // CCI = (Typical Price - SMA) / (0.015 * Mean Deviation)
    if (meanDeviation === 0) {
      result[i] = 0;
    } else {
      result[i] = (tp[i] - sma) / (0.015 * meanDeviation);
    }
  }

  return result;
}

// ============================================================================
// DMI - Directional Movement Index
// ============================================================================

/**
 * DMI_PDI - Positive Directional Indicator (+DI)
 *
 * @param high - High prices
 * @param low - Low prices
 * @param close - Closing prices
 * @param period - Period (typically 14)
 * @returns +DI values
 */
export function DMI_PDI(high: number[], low: number[], close: number[], period: number): number[] {
  const length = Math.min(high.length, low.length, close.length);
  const result: number[] = new Array(length);

  if (length < 2) {
    result[0] = NaN;
    return result;
  }

  // Calculate +DM (Positive Directional Movement)
  const plusDM: number[] = new Array(length);
  plusDM[0] = 0;

  for (let i = 1; i < length; i++) {
    const upMove = high[i] - high[i - 1];
    const downMove = low[i - 1] - low[i];

    if (upMove > downMove && upMove > 0) {
      plusDM[i] = upMove;
    } else {
      plusDM[i] = 0;
    }
  }

  // Calculate TR (True Range)
  const tr = calculateTR(high, low, close);

  // Calculate smoothed +DM and TR
  for (let i = 0; i < length; i++) {
    if (i < period) {
      result[i] = NaN;
      continue;
    }

    if (i === period) {
      // Initial sum
      let sumPlusDM = 0;
      let sumTR = 0;
      for (let j = 1; j <= period; j++) {
        sumPlusDM += plusDM[j];
        sumTR += tr[j];
      }
      result[i] = sumTR === 0 ? 0 : (sumPlusDM / sumTR) * 100;
    } else {
      // Smoothing formula (Wilder's smoothing)
      const prevIdx = i - 1;
      const prevPlusDM = (result[prevIdx] / 100) * tr[prevIdx];
      const smoothedPlusDM = prevPlusDM - prevPlusDM / period + plusDM[i];
      const smoothedTR = tr[prevIdx] - tr[prevIdx] / period + tr[i];
      result[i] = smoothedTR === 0 ? 0 : (smoothedPlusDM / smoothedTR) * 100;
    }
  }

  return result;
}

/**
 * DMI_MDI - Negative Directional Indicator (-DI)
 *
 * @param high - High prices
 * @param low - Low prices
 * @param close - Closing prices
 * @param period - Period (typically 14)
 * @returns -DI values
 */
export function DMI_MDI(high: number[], low: number[], close: number[], period: number): number[] {
  const length = Math.min(high.length, low.length, close.length);
  const result: number[] = new Array(length);

  if (length < 2) {
    result[0] = NaN;
    return result;
  }

  // Calculate -DM (Negative Directional Movement)
  const minusDM: number[] = new Array(length);
  minusDM[0] = 0;

  for (let i = 1; i < length; i++) {
    const upMove = high[i] - high[i - 1];
    const downMove = low[i - 1] - low[i];

    if (downMove > upMove && downMove > 0) {
      minusDM[i] = downMove;
    } else {
      minusDM[i] = 0;
    }
  }

  // Calculate TR (True Range)
  const tr = calculateTR(high, low, close);

  // Calculate smoothed -DM and TR
  for (let i = 0; i < length; i++) {
    if (i < period) {
      result[i] = NaN;
      continue;
    }

    if (i === period) {
      // Initial sum
      let sumMinusDM = 0;
      let sumTR = 0;
      for (let j = 1; j <= period; j++) {
        sumMinusDM += minusDM[j];
        sumTR += tr[j];
      }
      result[i] = sumTR === 0 ? 0 : (sumMinusDM / sumTR) * 100;
    } else {
      // Smoothing formula (Wilder's smoothing)
      const prevIdx = i - 1;
      const prevMinusDM = (result[prevIdx] / 100) * tr[prevIdx];
      const smoothedMinusDM = prevMinusDM - prevMinusDM / period + minusDM[i];
      const smoothedTR = tr[prevIdx] - tr[prevIdx] / period + tr[i];
      result[i] = smoothedTR === 0 ? 0 : (smoothedMinusDM / smoothedTR) * 100;
    }
  }

  return result;
}

/**
 * DMI_ADX - Average Directional Index
 *
 * @param high - High prices
 * @param low - Low prices
 * @param close - Closing prices
 * @param period - Period (typically 14)
 * @returns ADX values
 */
export function DMI_ADX(high: number[], low: number[], close: number[], period: number): number[] {
  const pdi = DMI_PDI(high, low, close, period);
  const mdi = DMI_MDI(high, low, close, period);

  const length = Math.min(pdi.length, mdi.length);
  const result: number[] = new Array(length);

  // Calculate DX (Directional Index)
  const dx: number[] = new Array(length);
  for (let i = 0; i < length; i++) {
    if (isNaN(pdi[i]) || isNaN(mdi[i])) {
      dx[i] = NaN;
      result[i] = NaN;
      continue;
    }

    const sum = pdi[i] + mdi[i];
    if (sum === 0) {
      dx[i] = 0;
    } else {
      dx[i] = (Math.abs(pdi[i] - mdi[i]) / sum) * 100;
    }
  }

  // Calculate ADX as smoothed DX
  for (let i = 0; i < length; i++) {
    if (i < period * 2 - 1) {
      result[i] = NaN;
      continue;
    }

    if (i === period * 2 - 1) {
      // First ADX value is average of first 'period' DX values
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += dx[i - j];
      }
      result[i] = sum / period;
    } else {
      // Subsequent ADX values use Wilder's smoothing
      result[i] = (result[i - 1] * (period - 1) + dx[i]) / period;
    }
  }

  return result;
}

/**
 * DMI_ADXR - Average Directional Index Rating
 *
 * @param high - High prices
 * @param low - Low prices
 * @param close - Closing prices
 * @param period - Period (typically 14)
 * @returns ADXR values
 */
export function DMI_ADXR(high: number[], low: number[], close: number[], period: number): number[] {
  const adx = DMI_ADX(high, low, close, period);

  const result: number[] = new Array(adx.length);

  for (let i = 0; i < adx.length; i++) {
    if (i < period || isNaN(adx[i]) || isNaN(adx[i - period])) {
      result[i] = NaN;
    } else {
      result[i] = (adx[i] + adx[i - period]) / 2;
    }
  }

  return result;
}

// ============================================================================
// TRIX - Triple Exponential Average
// ============================================================================

/**
 * TRIX - Triple Exponential Average
 *
 * @param close - Closing prices
 * @param period - Period (typically 12)
 * @returns TRIX values (percentage rate of change)
 */
export function TRIX(close: number[], period: number): number[] {
  // First EMA
  const ema1 = calculateEMA(close, period);

  // Second EMA (EMA of EMA)
  const ema2 = calculateEMA(ema1, period);

  // Third EMA (EMA of EMA of EMA)
  const ema3 = calculateEMA(ema2, period);

  // Calculate rate of change
  const result: number[] = new Array(close.length);

  for (let i = 0; i < close.length; i++) {
    if (i === 0 || isNaN(ema3[i]) || isNaN(ema3[i - 1]) || ema3[i - 1] === 0) {
      result[i] = NaN;
    } else {
      result[i] = ((ema3[i] - ema3[i - 1]) / ema3[i - 1]) * 100;
    }
  }

  return result;
}

// ============================================================================
// OBV - On Balance Volume
// ============================================================================

/**
 * OBV - On Balance Volume
 *
 * @param close - Closing prices
 * @param volume - Volume
 * @returns OBV values
 */
export function OBV(close: number[], volume: number[]): number[] {
  const length = Math.min(close.length, volume.length);
  const result: number[] = new Array(length);

  if (length === 0) {
    return result;
  }

  result[0] = volume[0];

  for (let i = 1; i < length; i++) {
    if (close[i] > close[i - 1]) {
      result[i] = result[i - 1] + volume[i];
    } else if (close[i] < close[i - 1]) {
      result[i] = result[i - 1] - volume[i];
    } else {
      result[i] = result[i - 1];
    }
  }

  return result;
}

// ============================================================================
// BIAS - Bias Ratio
// ============================================================================

/**
 * BIAS - Bias Ratio
 *
 * @param close - Closing prices
 * @param period - Period (typically 6, 12, or 24)
 * @returns BIAS values (percentage)
 */
export function BIAS(close: number[], period: number): number[] {
  const ma = calculateMA(close, period);
  const result: number[] = new Array(close.length);

  for (let i = 0; i < close.length; i++) {
    if (isNaN(ma[i]) || ma[i] === 0) {
      result[i] = NaN;
    } else {
      result[i] = ((close[i] - ma[i]) / ma[i]) * 100;
    }
  }

  return result;
}

// ============================================================================
// ROC - Rate of Change
// ============================================================================

/**
 * ROC - Rate of Change
 *
 * @param close - Closing prices
 * @param period - Period (typically 12)
 * @returns ROC values (percentage)
 */
export function ROC(close: number[], period: number): number[] {
  const result: number[] = new Array(close.length);

  for (let i = 0; i < close.length; i++) {
    if (i < period || close[i - period] === 0) {
      result[i] = NaN;
    } else {
      result[i] = ((close[i] - close[i - period]) / close[i - period]) * 100;
    }
  }

  return result;
}

// ============================================================================
// MTM - Momentum
// ============================================================================

/**
 * MTM - Momentum
 *
 * @param close - Closing prices
 * @param period - Period (typically 12)
 * @returns MTM values (absolute difference)
 */
export function MTM(close: number[], period: number): number[] {
  const result: number[] = new Array(close.length);

  for (let i = 0; i < close.length; i++) {
    if (i < period) {
      result[i] = NaN;
    } else {
      result[i] = close[i] - close[i - period];
    }
  }

  return result;
}

// ============================================================================
// WR - Williams %R
// ============================================================================

/**
 * WR - Williams %R
 *
 * @param high - High prices
 * @param low - Low prices
 * @param close - Closing prices
 * @param period - Period (typically 14)
 * @returns WR values (negative percentage, -100 to 0)
 */
export function WR(high: number[], low: number[], close: number[], period: number): number[] {
  const length = Math.min(high.length, low.length, close.length);
  const result: number[] = new Array(length);

  for (let i = 0; i < length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    let highestHigh = high[i];
    let lowestLow = low[i];

    for (let j = 0; j < period; j++) {
      highestHigh = Math.max(highestHigh, high[i - j]);
      lowestLow = Math.min(lowestLow, low[i - j]);
    }

    const range = highestHigh - lowestLow;
    if (range === 0) {
      result[i] = -50; // Middle value
    } else {
      result[i] = ((highestHigh - close[i]) / range) * -100;
    }
  }

  return result;
}

// ============================================================================
// PSY - Psychological Line
// ============================================================================

/**
 * PSY - Psychological Line
 *
 * @param close - Closing prices
 * @param period - Period (typically 12)
 * @returns PSY values (percentage, 0-100)
 */
export function PSY(close: number[], period: number): number[] {
  const result: number[] = new Array(close.length);

  for (let i = 0; i < close.length; i++) {
    if (i < period) {
      result[i] = NaN;
      continue;
    }

    let upDays = 0;
    for (let j = 1; j <= period; j++) {
      if (close[i - j + 1] > close[i - j]) {
        upDays++;
      }
    }

    result[i] = (upDays / period) * 100;
  }

  return result;
}

// ============================================================================
// Standalone ADX and ADXR (aliases for convenience)
// ============================================================================

/**
 * ADX - Average Directional Index (standalone)
 * This is an alias for DMI_ADX for convenience
 */
export function ADX(high: number[], low: number[], close: number[], period: number): number[] {
  return DMI_ADX(high, low, close, period);
}

/**
 * ADXR - Average Directional Index Rating (standalone)
 * This is an alias for DMI_ADXR for convenience
 */
export function ADXR(high: number[], low: number[], close: number[], period: number): number[] {
  return DMI_ADXR(high, low, close, period);
}
