import { MarketData } from '../types/MarketData';
import { DrawingEvent } from '../types/FormulaResult';
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

  /** Rendering-agnostic drawing events */
  private drawings: DrawingEvent[];

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
    this.drawings = [];
    this.functionRegistry = functionRegistry;
  }

  /**
   * Get market data array for a specific field
   * @param field - Field name (OPEN, CLOSE, HIGH, LOW, VOLUME, AMOUNT, TIMESTAMP, TRADABLESHARES, ADVANCE, DECLINE)
   * @returns Array of values for the field
   */
  getMarketDataField(field: string): number[] {
    const upperField = field.toUpperCase();

    switch (upperField) {
      case 'OPEN':
      case 'O':
        return this.marketData.map((d) => d.open);
      case 'CLOSE':
      case 'C':
        return this.marketData.map((d) => d.close);
      case 'HIGH':
      case 'H':
        return this.marketData.map((d) => d.high);
      case 'LOW':
      case 'L':
        return this.marketData.map((d) => d.low);
      case 'VOLUME':
      case 'VOL':
      case 'V':
        return this.marketData.map((d) => d.volume);
      case 'TIMESTAMP':
        return this.marketData.map((d) => d.timestamp);
      case 'AMOUNT':
      case 'AMO':
        return this.marketData.map((d) => d.amount ?? NaN);
      case 'TRADABLESHARES':
        return this.marketData.map((d) => d.tradableShares ?? NaN);
      case 'ADVANCE':
        return this.marketData.map((d) => d.advance ?? NaN);
      case 'DECLINE':
        return this.marketData.map((d) => d.decline ?? NaN);
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
   * Append drawing events emitted by a formula function
   * @param drawings - Drawing events to append
   */
  addDrawings(drawings: DrawingEvent[]): void {
    this.drawings.push(...drawings);
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
   * Get all drawing events
   * @returns Rendering-agnostic drawing events
   */
  getDrawings(): DrawingEvent[] {
    return this.drawings;
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
    return [
      'OPEN', 'CLOSE', 'HIGH', 'LOW', 'VOLUME', 'VOL', 'V',
      'O', 'C', 'H', 'L', 'AMO',
      'TIMESTAMP', 'AMOUNT', 'TRADABLESHARES', 'ADVANCE', 'DECLINE'
    ].includes(upperName);
  }
}
