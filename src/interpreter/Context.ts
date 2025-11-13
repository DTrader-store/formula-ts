import { MarketData } from '../types/MarketData';
import { FunctionRegistry } from './FunctionRegistry';

/**
 * ExecutionContext manages the state during formula interpretation
 * Maintains market data, variables, outputs, and function registry
 */
export class ExecutionContext {
  /** Market data arrays for OHLCV */
  private marketData: MarketData[];

  /** User-defined variables */
  private variables: Map<string, number[]>;

  /** Output declarations */
  private outputs: Map<string, number[]>;

  /** Function registry for built-in functions */
  private functionRegistry: FunctionRegistry;

  /**
   * Create a new execution context
   * @param marketData - Array of market data records
   * @param functionRegistry - Registry of available functions
   */
  constructor(marketData: MarketData[], functionRegistry: FunctionRegistry) {
    this.marketData = marketData;
    this.variables = new Map();
    this.outputs = new Map();
    this.functionRegistry = functionRegistry;
  }

  /**
   * Get market data array for a specific field
   * @param field - Field name (OPEN, CLOSE, HIGH, LOW, VOLUME, AMOUNT)
   * @returns Array of values for the field
   */
  getMarketDataField(field: string): number[] {
    const upperField = field.toUpperCase();

    switch (upperField) {
      case 'OPEN':
        return this.marketData.map((d) => d.open);
      case 'CLOSE':
        return this.marketData.map((d) => d.close);
      case 'HIGH':
        return this.marketData.map((d) => d.high);
      case 'LOW':
        return this.marketData.map((d) => d.low);
      case 'VOLUME':
        return this.marketData.map((d) => d.volume);
      case 'AMOUNT':
        return this.marketData.map((d) => d.amount ?? NaN);
      default:
        throw new Error(`Unknown market data field: ${field}`);
    }
  }

  /**
   * Get the length of market data
   * @returns Number of data points
   */
  getDataLength(): number {
    return this.marketData.length;
  }

  /**
   * Set a variable value
   * @param name - Variable name
   * @param value - Variable value (array)
   */
  setVariable(name: string, value: number[]): void {
    this.variables.set(name, value);
  }

  /**
   * Get a variable value
   * @param name - Variable name
   * @returns Variable value (array) or undefined if not found
   */
  getVariable(name: string): number[] | undefined {
    return this.variables.get(name);
  }

  /**
   * Check if a variable exists
   * @param name - Variable name
   * @returns True if variable exists
   */
  hasVariable(name: string): boolean {
    return this.variables.has(name);
  }

  /**
   * Set an output value
   * @param name - Output name
   * @param value - Output value (array)
   */
  setOutput(name: string, value: number[]): void {
    this.outputs.set(name, value);
  }

  /**
   * Get an output value
   * @param name - Output name
   * @returns Output value (array) or undefined if not found
   */
  getOutput(name: string): number[] | undefined {
    return this.outputs.get(name);
  }

  /**
   * Get all outputs
   * @returns Map of output names to values
   */
  getOutputs(): Map<string, number[]> {
    return this.outputs;
  }

  /**
   * Get all variables
   * @returns Map of variable names to values
   */
  getVariables(): Map<string, number[]> {
    return this.variables;
  }

  /**
   * Get the function registry
   * @returns Function registry
   */
  getFunctionRegistry(): FunctionRegistry {
    return this.functionRegistry;
  }

  /**
   * Check if a name is a market data field
   * @param name - Name to check
   * @returns True if it's a market data field
   */
  isMarketDataField(name: string): boolean {
    const upperName = name.toUpperCase();
    return ['OPEN', 'CLOSE', 'HIGH', 'LOW', 'VOLUME', 'AMOUNT'].includes(upperName);
  }
}
