/**
 * Interface for formula functions
 */
export interface FormulaFunction {
  /** Function name */
  name: string;

  /** Minimum number of arguments */
  minArgs: number;

  /** Maximum number of arguments (can be Infinity for variadic functions) */
  maxArgs: number;

  /** Execute the function with given arguments and return a result value */
  execute: (args: number[]) => number;
}

/**
 * Registry for formula functions
 * Supports case-insensitive function lookup and prevents duplicate registration
 */
export class FunctionRegistry {
  private functions: Map<string, FormulaFunction> = new Map();

  /**
   * Register a new formula function
   * @param fn The formula function to register
   * @throws Error if function is already registered (case-insensitive)
   */
  register(fn: FormulaFunction): void {
    const normalizedName = fn.name.toUpperCase();

    if (this.functions.has(normalizedName)) {
      throw new Error(`Function ${normalizedName} is already registered`);
    }

    this.functions.set(normalizedName, fn);
  }

  /**
   * Get a registered function by name (case-insensitive)
   * @param name The function name
   * @returns The function or undefined if not found
   */
  get(name: string): FormulaFunction | undefined {
    const normalizedName = name.toUpperCase();
    return this.functions.get(normalizedName);
  }

  /**
   * Check if a function is registered (case-insensitive)
   * @param name The function name
   * @returns True if function is registered, false otherwise
   */
  has(name: string): boolean {
    const normalizedName = name.toUpperCase();
    return this.functions.has(normalizedName);
  }

  /**
   * Get all registered function names in uppercase
   * @returns Array of function names
   */
  getAllNames(): string[] {
    return Array.from(this.functions.keys());
  }
}
