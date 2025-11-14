/**
 * MarketData interface represents a single market data record
 * with OHLCV (Open, High, Low, Close, Volume) data and additional fields
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
   * Unix timestamp in milliseconds
   */
  timestamp: number;

  /**
   * Trading amount (volume * price, optional)
   */
  amount?: number;

  /**
   * Tradable shares (circulating shares, used for chip distribution calculation, optional)
   */
  tradableShares?: number;

  /**
   * Number of advancing stocks (index only, optional)
   */
  advance?: number;

  /**
   * Number of declining stocks (index only, optional)
   */
  decline?: number;
}

/**
 * Validates a MarketData object to ensure all required fields are present
 * and have correct types and logical constraints
 *
 * @param data - The MarketData object to validate
 * @returns true if the data is valid, false otherwise
 *
 * Validation rules:
 * - open, close, high, low, volume, timestamp must be numbers
 * - volume must be a non-negative number
 * - timestamp must be a positive number in reasonable range (1970-2100)
 * - optional fields (amount, tradableShares, advance, decline) must be numbers if present
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
    typeof obj.volume !== 'number' ||
    typeof obj.timestamp !== 'number'
  ) {
    return false;
  }

  // Check optional fields if present
  if (obj.amount !== undefined && typeof obj.amount !== 'number') {
    return false;
  }

  if (obj.tradableShares !== undefined && typeof obj.tradableShares !== 'number') {
    return false;
  }

  if (obj.advance !== undefined && typeof obj.advance !== 'number') {
    return false;
  }

  if (obj.decline !== undefined && typeof obj.decline !== 'number') {
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

  // Timestamp must be in reasonable range (1970-2100)
  const MIN_TIMESTAMP = new Date('1970-01-01').getTime();
  const MAX_TIMESTAMP = new Date('2100-01-01').getTime();
  if (marketData.timestamp < MIN_TIMESTAMP || marketData.timestamp > MAX_TIMESTAMP) {
    return false;
  }

  // Optional fields must be non-negative if present
  if (marketData.amount !== undefined && marketData.amount < 0) {
    return false;
  }

  if (marketData.tradableShares !== undefined && marketData.tradableShares < 0) {
    return false;
  }

  if (marketData.advance !== undefined && marketData.advance < 0) {
    return false;
  }

  if (marketData.decline !== undefined && marketData.decline < 0) {
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

/**
 * Validates an array of MarketData objects to ensure:
 * - All objects pass validateMarketData checks
 * - Timestamps are strictly increasing (no duplicates or decreasing values)
 *
 * @param data - Array of MarketData objects to validate
 * @throws Error with descriptive message if validation fails
 */
export function validateMarketDataArray(data: MarketData[]): void {
  if (!Array.isArray(data)) {
    throw new Error('Market data must be an array');
  }

  if (data.length === 0) {
    throw new Error('Market data array cannot be empty');
  }

  // Validate each MarketData object
  for (let i = 0; i < data.length; i++) {
    if (!validateMarketData(data[i])) {
      throw new Error(
        `Invalid market data at index ${i}. Please ensure all required fields ` +
        `(open, close, high, low, volume, timestamp) are valid numbers, ` +
        `high >= low, and timestamp is in range (1970-2100).`
      );
    }
  }

  // Validate timestamp strictly increasing
  for (let i = 1; i < data.length; i++) {
    if (data[i].timestamp <= data[i - 1].timestamp) {
      throw new Error(
        `Timestamp at index ${i} (${data[i].timestamp}) must be greater than ` +
        `previous timestamp at index ${i - 1} (${data[i - 1].timestamp}). ` +
        `Timestamps must be strictly increasing.`
      );
    }
  }
}
