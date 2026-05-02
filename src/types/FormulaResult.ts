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
  /** TDX draw method such as stick/colorstick/volstick */
  drawMethod?: string;
  /** Whether output is hidden from chart drawing */
  hidden?: boolean;
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
 * Rendering-agnostic drawing event emitted by formula drawing functions
 */
export interface DrawingEvent {
  /** Builtin function that emitted the event, such as DRAWTEXT or DRAWLINE */
  function: string;
  /** Primary bar index for the event */
  barIndex: number;
  /** Numeric payload used by downstream chart adapters */
  values: Record<string, number>;
  /** Optional text payload */
  text?: string;
  /** Optional non-numeric payload for future adapters */
  meta?: Record<string, string>;
}

/**
 * Result of formula calculation containing outputs and variables
 */
export interface FormulaResult {
  /** Array of output lines from the formula calculation */
  outputs: OutputLine[];
  /** Calculated variables and their values (arrays of numbers) */
  variables: Record<string, number[]>;
  /** Rendering-agnostic drawing events emitted by formulas */
  drawings?: DrawingEvent[];
}
