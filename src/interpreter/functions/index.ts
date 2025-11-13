import { FunctionRegistry, FormulaFunction } from '../FunctionRegistry';
import { MA, EMA, SUM, MAX, MIN } from './math';
import { REF, HHV, LLV } from './reference';
import { IF, CROSS } from './logical';

// Export all functions
export { MA, EMA, SUM, MAX, MIN } from './math';
export { REF, HHV, LLV } from './reference';
export { IF, CROSS } from './logical';

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
  fn: (...args: number[][]) => number[]
): FormulaFunction {
  return {
    name,
    minArgs,
    maxArgs,
    execute: (args: number[]) => {
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

  // Reference functions
  registry.register(createArrayFunction('REF', 2, 2, (data, period) => REF(data, period[0])));
  registry.register(createArrayFunction('HHV', 2, 2, (data, period) => HHV(data, period[0])));
  registry.register(createArrayFunction('LLV', 2, 2, (data, period) => LLV(data, period[0])));

  // Logical functions
  registry.register(createArrayFunction('IF', 3, 3, (cond, a, b) => IF(cond, a, b)));
  registry.register(createArrayFunction('CROSS', 2, 2, (a, b) => CROSS(a, b)));
}
