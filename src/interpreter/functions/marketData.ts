import { ExecutionContext } from '../Context';

/**
 * Interface for formula functions that accept ExecutionContext
 * These functions access market data directly from the context
 */
export interface MarketDataFunction {
  /** Function name */
  name: string;

  /** Minimum number of arguments */
  minArgs: number;

  /** Maximum number of arguments */
  maxArgs: number;

  /** Execute the function with given arguments and context */
  execute: (args: number[][], context: ExecutionContext) => number[];
}

/**
 * OPEN - Opening price
 * Returns the opening price array from market data
 *
 * Usage: OPEN
 * Arguments: None
 * Returns: Array of opening prices
 */
export const OPEN: MarketDataFunction = {
  name: 'OPEN',
  minArgs: 0,
  maxArgs: 0,
  execute: (_args, context) => {
    return context.getMarketDataField('OPEN');
  }
};

/**
 * HIGH - Highest price
 * Returns the highest price array from market data
 *
 * Usage: HIGH
 * Arguments: None
 * Returns: Array of highest prices
 */
export const HIGH: MarketDataFunction = {
  name: 'HIGH',
  minArgs: 0,
  maxArgs: 0,
  execute: (_args, context) => {
    return context.getMarketDataField('HIGH');
  }
};

/**
 * LOW - Lowest price
 * Returns the lowest price array from market data
 *
 * Usage: LOW
 * Arguments: None
 * Returns: Array of lowest prices
 */
export const LOW: MarketDataFunction = {
  name: 'LOW',
  minArgs: 0,
  maxArgs: 0,
  execute: (_args, context) => {
    return context.getMarketDataField('LOW');
  }
};

/**
 * CLOSE - Closing price
 * Returns the closing price array from market data
 *
 * Usage: CLOSE
 * Arguments: None
 * Returns: Array of closing prices
 */
export const CLOSE: MarketDataFunction = {
  name: 'CLOSE',
  minArgs: 0,
  maxArgs: 0,
  execute: (_args, context) => {
    return context.getMarketDataField('CLOSE');
  }
};

/**
 * VOL - Trading volume
 * Returns the trading volume array from market data
 *
 * Usage: VOL
 * Arguments: None
 * Returns: Array of trading volumes
 */
export const VOL: MarketDataFunction = {
  name: 'VOL',
  minArgs: 0,
  maxArgs: 0,
  execute: (_args, context) => {
    return context.getMarketDataField('VOLUME');
  }
};

/**
 * AMOUNT - Trading amount
 * Returns the trading amount array from market data
 *
 * Usage: AMOUNT
 * Arguments: None
 * Returns: Array of trading amounts
 *
 * Note: This field is optional in market data.
 * Throws an error if the field is not available.
 */
export const AMOUNT: MarketDataFunction = {
  name: 'AMOUNT',
  minArgs: 0,
  maxArgs: 0,
  execute: (_args, context) => {
    const result = context.getMarketDataField('AMOUNT');

    // Check if any value is NaN (indicating missing data)
    if (result.some(v => isNaN(v))) {
      throw new Error(
        'AMOUNT function requires marketData.amount field. ' +
        'Please provide the "amount" field in your market data.'
      );
    }

    return result;
  }
};

/**
 * ADVANCE - Number of advancing stocks (index only)
 * Returns the advance count array from market data
 *
 * Usage: ADVANCE
 * Arguments: None
 * Returns: Array of advance counts
 *
 * Note: This field is only available for index data.
 * Throws an error if the field is not available.
 */
export const ADVANCE: MarketDataFunction = {
  name: 'ADVANCE',
  minArgs: 0,
  maxArgs: 0,
  execute: (_args, context) => {
    const result = context.getMarketDataField('ADVANCE');

    // Check if any value is NaN (indicating missing data)
    if (result.some(v => isNaN(v))) {
      throw new Error(
        'ADVANCE function requires marketData.advance field. ' +
        'This field is only available for index data. ' +
        'Please provide the "advance" field in your market data.'
      );
    }

    return result;
  }
};

/**
 * DECLINE - Number of declining stocks (index only)
 * Returns the decline count array from market data
 *
 * Usage: DECLINE
 * Arguments: None
 * Returns: Array of decline counts
 *
 * Note: This field is only available for index data.
 * Throws an error if the field is not available.
 */
export const DECLINE: MarketDataFunction = {
  name: 'DECLINE',
  minArgs: 0,
  maxArgs: 0,
  execute: (_args, context) => {
    const result = context.getMarketDataField('DECLINE');

    // Check if any value is NaN (indicating missing data)
    if (result.some(v => isNaN(v))) {
      throw new Error(
        'DECLINE function requires marketData.decline field. ' +
        'This field is only available for index data. ' +
        'Please provide the "decline" field in your market data.'
      );
    }

    return result;
  }
};

/**
 * Get all market data functions
 * @returns Array of all market data functions
 */
export function getAllMarketDataFunctions(): MarketDataFunction[] {
  return [OPEN, HIGH, LOW, CLOSE, VOL, AMOUNT, ADVANCE, DECLINE];
}
