import { MarketData } from '../types/MarketData';
import { FunctionRegistry } from './FunctionRegistry';
import { ExecutionContext } from './Context';

/**
 * Cache entry storing computation results and metadata
 */
interface CacheEntry {
  /** Cached computation result */
  value: number[];
  /** Hash of the expression/operation that produced this result */
  expressionHash: string;
  /** Last data index this cache is valid for */
  validUpTo: number;
}

/**
 * IncrementalContext extends ExecutionContext with caching capabilities
 * to support incremental calculations on new data points
 */
export class IncrementalContext extends ExecutionContext {
  /** Cache for intermediate computation results */
  private cache: Map<string, CacheEntry>;

  /** Starting index for new data points */
  private startIndex: number;

  /** Previous market data length */
  private previousDataLength: number;

  /**
   * Create a new incremental execution context
   * @param marketData - Array of market data records (includes old + new data)
   * @param functionRegistry - Registry of available functions
   * @param startIndex - Index where new data begins (for incremental calculation)
   */
  constructor(marketData: MarketData[], functionRegistry: FunctionRegistry, startIndex: number = 0) {
    super(marketData, functionRegistry);
    this.cache = new Map();
    this.startIndex = startIndex;
    this.previousDataLength = startIndex;
  }

  /**
   * Set a cached value for a computation
   * @param key - Cache key (variable/output name)
   * @param value - Computed value array
   * @param expressionHash - Hash of the expression
   */
  setCachedValue(key: string, value: number[], expressionHash: string): void {
    this.cache.set(key, {
      value: [...value], // Deep copy to prevent mutations
      expressionHash,
      validUpTo: value.length - 1,
    });
  }

  /**
   * Get a cached value if valid
   * @param key - Cache key
   * @param expressionHash - Hash of the expression
   * @returns Cached value or undefined if not found/invalid
   */
  getCachedValue(key: string, expressionHash: string): number[] | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    // Verify cache is still valid (same expression)
    if (entry.expressionHash !== expressionHash) {
      return undefined;
    }

    // Cache is valid, return it
    return [...entry.value]; // Return copy to prevent mutations
  }

  /**
   * Check if we should use cached results (incremental mode)
   * @returns True if in incremental mode
   */
  isIncrementalMode(): boolean {
    return this.startIndex > 0;
  }

  /**
   * Get the starting index for new calculations
   * @returns Start index for incremental calculations
   */
  getStartIndex(): number {
    return this.startIndex;
  }

  /**
   * Get the previous data length (before new data was added)
   * @returns Previous data length
   */
  getPreviousDataLength(): number {
    return this.previousDataLength;
  }

  /**
   * Clear all cached values
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Restore variable from cache
   * Useful when reusing computed variables from previous runs
   * @param name - Variable name
   * @param value - Variable value from previous result
   */
  restoreVariable(name: string, value: number[]): void {
    this.setVariable(name, value);
  }

  /**
   * Restore output from cache
   * Useful when reusing computed outputs from previous runs
   * @param name - Output name
   * @param value - Output value from previous result
   */
  restoreOutput(name: string, value: number[]): void {
    this.setOutput(name, value);
  }

  /**
   * Create a hash for an expression (simple string hash)
   * @param expression - Expression string
   * @returns Hash string
   */
  static hashExpression(expression: string): string {
    let hash = 0;
    for (let i = 0; i < expression.length; i++) {
      const char = expression.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
}
