import { FunctionRegistry, FormulaFunction } from '../FunctionRegistry';
import { MA, EMA, SUM, MAX, MIN, ABS, SQRT, POW, MOD, ROUND } from './math';
import { REF, HHV, LLV } from './reference';
import { IF, CROSS, EVERY, EXIST, BARSLAST, COUNT } from './logical';
import { STD, VAR, MEDIAN, AVEDEV } from './statistics';
import { SMA, WMA, RSI } from './technical';
import { UPNDAY, DOWNNDAY, NDAY, RANGE, BETWEEN } from './pattern';
import { WINNER, LWINNER, COST, VALUEWHEN, TOPRANGE, LOWRANGE } from './chip';
import { getAllMarketDataFunctions } from './marketData';

// Export all functions
export { MA, EMA, SUM, MAX, MIN, ABS, SQRT, POW, MOD, ROUND } from './math';
export { REF, HHV, LLV } from './reference';
export { IF, CROSS, EVERY, EXIST, BARSLAST, COUNT } from './logical';
export { STD, VAR, MEDIAN, AVEDEV } from './statistics';
export { SMA, WMA, BOLL, RSI, ATR } from './technical';
export { UPNDAY, DOWNNDAY, NDAY, RANGE, BETWEEN } from './pattern';
export { WINNER, LWINNER, COST, VALUEWHEN, TOPRANGE, LOWRANGE } from './chip';
export { OPEN, HIGH, LOW, CLOSE, VOL, AMOUNT, ADVANCE, DECLINE, getAllMarketDataFunctions } from './marketData';
export { DATE, TIME, YEAR, MONTH, DAY, HOUR, MINUTE, WEEKDAY } from './datetime';
export { PERIOD, BARSCOUNT, ISLASTBAR, BARSSINCE } from './period';

/**
 * Helper function to create a FormulaFunction wrapper for array-based functions
 * These functions work with time-series data (number arrays)
 *
 * Note: For the interpreter to work with array-based functions, we need to handle
 * the conversion between single values and arrays. This is a simplified wrapper
 * that assumes all arguments are already arrays.
 */
function createArrayFunction(
  name: string,
  minArgs: number,
  maxArgs: number,
  _fn: (...args: number[][]) => number[]
): FormulaFunction {
  return {
    name,
    minArgs,
    maxArgs,
    execute: (_args: number[]) => {
      // This is a simplified implementation
      // In a real interpreter, array handling would be more sophisticated
      // For now, this throws an error to indicate array functions need special handling
      throw new Error(
        `Function ${name} requires array handling in the interpreter. ` +
          `Use the exported functions (MA, EMA, etc.) directly for array operations.`
      );
    },
  };
}

/**
 * Register all built-in functions to the function registry
 * @param registry - The function registry to register functions to
 */
export function registerBuiltinFunctions(registry: FunctionRegistry): void {
  // Math functions
  registry.register(createArrayFunction('MA', 2, 2, (data, period) => MA(data, period[0])));
  registry.register(createArrayFunction('EMA', 2, 2, (data, period) => EMA(data, period[0])));
  registry.register(createArrayFunction('SUM', 2, 2, (data, period) => SUM(data, period[0])));
  registry.register(createArrayFunction('MAX', 2, 2, (a, b) => MAX(a, b)));
  registry.register(createArrayFunction('MIN', 2, 2, (a, b) => MIN(a, b)));
  registry.register(createArrayFunction('ABS', 1, 1, (data) => ABS(data)));
  registry.register(createArrayFunction('SQRT', 1, 1, (data) => SQRT(data)));
  registry.register(createArrayFunction('POW', 2, 2, (base, exp) => POW(base, exp)));
  registry.register(createArrayFunction('MOD', 2, 2, (dividend, divisor) => MOD(dividend, divisor)));
  registry.register(createArrayFunction('ROUND', 1, 1, (data) => ROUND(data)));

  // Reference functions
  registry.register(createArrayFunction('REF', 2, 2, (data, period) => REF(data, period[0])));
  registry.register(createArrayFunction('HHV', 2, 2, (data, period) => HHV(data, period[0])));
  registry.register(createArrayFunction('LLV', 2, 2, (data, period) => LLV(data, period[0])));

  // Logical functions
  registry.register(createArrayFunction('IF', 3, 3, (cond, a, b) => IF(cond, a, b)));
  registry.register(createArrayFunction('CROSS', 2, 2, (a, b) => CROSS(a, b)));
  registry.register(createArrayFunction('EVERY', 2, 2, (data, period) => EVERY(data, period[0])));
  registry.register(createArrayFunction('EXIST', 2, 2, (data, period) => EXIST(data, period[0])));
  registry.register(createArrayFunction('BARSLAST', 1, 1, (data) => BARSLAST(data)));
  registry.register(createArrayFunction('COUNT', 2, 2, (data, period) => COUNT(data, period[0])));

  // Statistical functions
  registry.register(createArrayFunction('STD', 2, 2, (data, period) => STD(data, period[0])));
  registry.register(createArrayFunction('VAR', 2, 2, (data, period) => VAR(data, period[0])));
  registry.register(createArrayFunction('MEDIAN', 2, 2, (data, period) => MEDIAN(data, period[0])));
  registry.register(createArrayFunction('AVEDEV', 2, 2, (data, period) => AVEDEV(data, period[0])));

  // Technical analysis functions
  registry.register(createArrayFunction('SMA', 3, 3, (data, N, M) => SMA(data, N[0], M[0])));
  registry.register(createArrayFunction('WMA', 2, 2, (data, period) => WMA(data, period[0])));
  registry.register(createArrayFunction('RSI', 2, 2, (data, period) => RSI(data, period[0])));
  // Note: BOLL and ATR require special handling in the interpreter
  // BOLL returns 3 arrays [upper, middle, lower]
  // ATR requires 3 input arrays (high, low, close)

  // Pattern functions
  registry.register(createArrayFunction('UPNDAY', 2, 2, (close, n) => UPNDAY(close, n[0])));
  registry.register(createArrayFunction('DOWNNDAY', 2, 2, (close, n) => DOWNNDAY(close, n[0])));
  registry.register(createArrayFunction('NDAY', 2, 2, (cond, n) => NDAY(cond, n[0])));
  registry.register(createArrayFunction('RANGE', 3, 3, (A, B, C) => RANGE(A, B, C)));
  registry.register(createArrayFunction('BETWEEN', 3, 3, (A, B, C) => BETWEEN(A, B, C)));

  // Chip distribution and value functions
  registry.register(createArrayFunction('WINNER', 3, 4, (close, volume, targetPrice, lookback) =>
    WINNER(close, volume, targetPrice, lookback ? lookback[0] : undefined)
  ));
  registry.register(createArrayFunction('LWINNER', 3, 4, (close, volume, targetPrice, lookback) =>
    LWINNER(close, volume, targetPrice, lookback ? lookback[0] : undefined)
  ));
  registry.register(createArrayFunction('COST', 3, 4, (close, volume, percent, lookback) =>
    COST(close, volume, percent, lookback ? lookback[0] : undefined)
  ));
  registry.register(createArrayFunction('VALUEWHEN', 2, 2, (cond, X) => VALUEWHEN(cond, X)));
  registry.register(createArrayFunction('TOPRANGE', 1, 2, (X, period) =>
    TOPRANGE(X, period ? period[0] : undefined)
  ));
  registry.register(createArrayFunction('LOWRANGE', 1, 2, (X, period) =>
    LOWRANGE(X, period ? period[0] : undefined)
  ));

  // Market data accessor functions (registered separately due to ExecutionContext requirement)
  const marketDataFunctions = getAllMarketDataFunctions();
  for (const func of marketDataFunctions) {
    registry.register(func as unknown as FormulaFunction);
  }

  // Time and period functions registration
  // Note: These require access to timestamp field from MarketData via ExecutionContext
  // TODO: Implement proper context-aware function registration for time/period functions
  // For now, they are exported but not registered in the legacy registry
}

/**
 * Get all registered function names
 * @returns Array of function names
 */
export function getAllFunctions(): string[] {
  return [
    // Math functions (10)
    'MA', 'EMA', 'SUM', 'MAX', 'MIN', 'ABS', 'SQRT', 'POW', 'MOD', 'ROUND',
    // Reference functions (3)
    'REF', 'HHV', 'LLV',
    // Logical functions (6)
    'IF', 'CROSS', 'EVERY', 'EXIST', 'BARSLAST', 'COUNT',
    // Statistical functions (4)
    'STD', 'VAR', 'MEDIAN', 'AVEDEV',
    // Technical analysis functions (3)
    'SMA', 'WMA', 'RSI',
    // Pattern functions (5)
    'UPNDAY', 'DOWNNDAY', 'NDAY', 'RANGE', 'BETWEEN',
    // Chip distribution functions (6)
    'WINNER', 'LWINNER', 'COST', 'VALUEWHEN', 'TOPRANGE', 'LOWRANGE',
    // Market data accessor functions (8)
    'OPEN', 'HIGH', 'LOW', 'CLOSE', 'VOL', 'AMOUNT', 'ADVANCE', 'DECLINE',
    // DateTime functions (8)
    'DATE', 'TIME', 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'WEEKDAY',
    // Period functions (4)
    'PERIOD', 'BARSCOUNT', 'ISLASTBAR', 'BARSSINCE'
  ];
}
