/**
 * Chip Distribution and Value Functions
 * Implements functions for analyzing profit distribution, cost positions, and value tracking
 */

/**
 * WINNER - Profit Ratio at Price Level
 * Calculates the ratio of shares that are profitable at the target price
 * Uses a simplified chip distribution algorithm based on volume-weighted cost distribution
 *
 * @param close - Close price array
 * @param volume - Volume array
 * @param targetPrice - Price array to calculate profit ratio at
 * @param lookback - Number of periods to look back (default 100)
 * @returns Array with profit ratios (0-1 range)
 */
export function WINNER(close: number[], volume: number[], targetPrice: number[], lookback: number = 100): number[] {
  const result: number[] = new Array(close.length).fill(0);

  for (let i = 0; i < close.length; i++) {
    const startIdx = Math.max(0, i - lookback + 1);
    let totalVolume = 0;
    let winVolume = 0;

    // Calculate volume-weighted chip distribution
    for (let j = startIdx; j <= i; j++) {
      totalVolume += volume[j];
      // Shares bought below target price are profitable
      if (close[j] < targetPrice[i]) {
        winVolume += volume[j];
      }
    }

    result[i] = totalVolume > 0 ? winVolume / totalVolume : 0;
  }

  return result;
}

/**
 * LWINNER - Floating Profit Ratio
 * Similar to WINNER but focuses on more recent trading periods (shorter lookback)
 * Useful for analyzing short-term profit distribution
 *
 * @param close - Close price array
 * @param volume - Volume array
 * @param targetPrice - Price array to calculate profit ratio at
 * @param lookback - Number of periods to look back (default 20, shorter than WINNER)
 * @returns Array with floating profit ratios (0-1 range)
 */
export function LWINNER(close: number[], volume: number[], targetPrice: number[], lookback: number = 20): number[] {
  // LWINNER uses the same algorithm as WINNER but with shorter lookback
  return WINNER(close, volume, targetPrice, lookback);
}

/**
 * COST - Cost Price for Given Profit Percentage
 * Calculates the price level at which a given percentage of shareholders are profitable
 *
 * @param close - Close price array
 * @param volume - Volume array
 * @param percent - Target profit percentage (0-100 range)
 * @param lookback - Number of periods to look back (default 100)
 * @returns Array with cost prices
 */
export function COST(close: number[], volume: number[], percent: number[], lookback: number = 100): number[] {
  const result: number[] = new Array(close.length).fill(0);

  for (let i = 0; i < close.length; i++) {
    const startIdx = Math.max(0, i - lookback + 1);

    // Build price-volume pairs for the lookback period
    const priceVolumePairs: Array<{ price: number; volume: number }> = [];
    let totalVolume = 0;

    for (let j = startIdx; j <= i; j++) {
      priceVolumePairs.push({ price: close[j], volume: volume[j] });
      totalVolume += volume[j];
    }

    // Sort by price ascending
    priceVolumePairs.sort((a, b) => a.price - b.price);

    // Find the price where cumulative volume reaches the target percentage
    const targetVolume = (totalVolume * percent[i]) / 100;
    let cumulativeVolume = 0;

    for (const pair of priceVolumePairs) {
      cumulativeVolume += pair.volume;
      if (cumulativeVolume >= targetVolume) {
        result[i] = pair.price;
        break;
      }
    }

    // If not found (should not happen), use last price
    if (result[i] === 0 && priceVolumePairs.length > 0) {
      result[i] = priceVolumePairs[priceVolumePairs.length - 1].price;
    }
  }

  return result;
}

/**
 * VALUEWHEN - Value When Condition is True
 * Returns the value of X when condition is satisfied, and holds that value
 * until the condition is satisfied again
 *
 * @param cond - Condition array (0 = false, non-zero = true)
 * @param X - Value array to capture
 * @returns Array with captured values (holds last captured value)
 */
export function VALUEWHEN(cond: number[], X: number[]): number[] {
  const result: number[] = new Array(cond.length).fill(0);
  let lastValue = 0;

  for (let i = 0; i < cond.length; i++) {
    // When condition is satisfied, capture the value
    if (cond[i] !== 0) {
      lastValue = X[Math.min(i, X.length - 1)];
    }
    result[i] = lastValue;
  }

  return result;
}

/**
 * TOPRANGE - Check if Value is Recent High
 * Returns 1 when X equals the maximum value in the recent period, 0 otherwise
 *
 * @param X - Value array to check
 * @param period - Lookback period (default 20)
 * @returns Array with results (1 = is recent high, 0 = otherwise)
 */
export function TOPRANGE(X: number[], period: number = 20): number[] {
  const lookback = Math.floor(period);
  const result: number[] = new Array(X.length).fill(0);

  for (let i = 0; i < X.length; i++) {
    const startIdx = Math.max(0, i - lookback + 1);

    // Find maximum in the range
    let maxValue = -Infinity;
    for (let j = startIdx; j <= i; j++) {
      if (X[j] > maxValue) {
        maxValue = X[j];
      }
    }

    // Check if current value equals the maximum
    result[i] = X[i] === maxValue ? 1 : 0;
  }

  return result;
}

/**
 * LOWRANGE - Check if Value is Recent Low
 * Returns 1 when X equals the minimum value in the recent period, 0 otherwise
 *
 * @param X - Value array to check
 * @param period - Lookback period (default 20)
 * @returns Array with results (1 = is recent low, 0 = otherwise)
 */
export function LOWRANGE(X: number[], period: number = 20): number[] {
  const lookback = Math.floor(period);
  const result: number[] = new Array(X.length).fill(0);

  for (let i = 0; i < X.length; i++) {
    const startIdx = Math.max(0, i - lookback + 1);

    // Find minimum in the range
    let minValue = Infinity;
    for (let j = startIdx; j <= i; j++) {
      if (X[j] < minValue) {
        minValue = X[j];
      }
    }

    // Check if current value equals the minimum
    result[i] = X[i] === minValue ? 1 : 0;
  }

  return result;
}
