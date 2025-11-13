/**
 * MarketData interface represents a single market data record
 * with OHLCV (Open, High, Low, Close, Volume) data and optional amount
 */
export interface MarketData {
  /**
   * Opening price
   */
  open: number;

  /**
   * Closing price
   */
  close: number;

  /**
   * Highest price in the period
   */
  high: number;

  /**
   * Lowest price in the period
   */
  low: number;

  /**
   * Trading volume (number of shares/units traded)
   */
  volume: number;

  /**
   * Trading amount (volume * price, optional)
   */
  amount?: number;
}

/**
 * Validates a MarketData object to ensure all required fields are present
 * and have correct types and logical constraints
 *
 * @param data - The MarketData object to validate
 * @returns true if the data is valid, false otherwise
 *
 * Validation rules:
 * - open, close, high, low must be numbers
 * - volume must be a non-negative number
 * - amount (if present) must be a non-negative number
 * - high must be >= low
 */
export function validateMarketData(data: unknown): data is MarketData {
  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // Check required fields exist and are numbers
  if (
    typeof obj.open !== 'number' ||
    typeof obj.close !== 'number' ||
    typeof obj.high !== 'number' ||
    typeof obj.low !== 'number' ||
    typeof obj.volume !== 'number'
  ) {
    return false;
  }

  // Check optional amount field if present
  if (obj.amount !== undefined && typeof obj.amount !== 'number') {
    return false;
  }

  // Validate logical constraints
  const marketData = obj as unknown as MarketData;

  // High must be >= low
  if (marketData.high < marketData.low) {
    return false;
  }

  // Volume must be non-negative
  if (marketData.volume < 0) {
    return false;
  }

  // Amount must be non-negative if present
  if (marketData.amount !== undefined && marketData.amount < 0) {
    return false;
  }

  return true;
}

/**
 * Returns the length of a MarketData array
 *
 * @param data - Array of MarketData objects
 * @returns The number of elements in the array
 */
export function getMarketDataLength(data: MarketData[]): number {
  return data.length;
}
