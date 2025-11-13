/**
 * Line style configuration for output visualization
 */
export interface LineStyle {
  /** Color of the line (e.g., '#FF0000', 'red') */
  color?: string;
  /** Width of the line in pixels */
  lineWidth?: number;
  /** Style of the line ('solid', 'dashed', 'dotted', etc.) */
  lineStyle?: string;
}

/**
 * A single output line representing calculated data
 */
export interface OutputLine {
  /** Name/identifier of the output line */
  name: string;
  /** Data points for the output line */
  data: number[];
  /** Optional style configuration for visualization */
  style?: LineStyle;
}

/**
 * Result of formula calculation containing outputs and variables
 */
export interface FormulaResult {
  /** Array of output lines from the formula calculation */
  outputs: OutputLine[];
  /** Calculated variables and their values */
  variables: Record<string, number>;
}
