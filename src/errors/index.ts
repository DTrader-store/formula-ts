/**
 * Error classes for the Formula-TS parser and interpreter
 * @packageDocumentation
 */

/**
 * Base error class for all formula-related errors
 */
export class FormulaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FormulaError';
    Object.setPrototypeOf(this, FormulaError.prototype);
  }
}

/**
 * Error thrown during lexical analysis (tokenization)
 * Includes line and column information and optionally the character that caused the error
 */
export class LexerError extends FormulaError {
  readonly line: number;
  readonly column: number;
  readonly char?: string;

  constructor(message: string, line: number, column: number, char?: string) {
    const charPart = char !== undefined ? ` (char: ${char})` : '';
    const fullMessage = `Lexer error at line ${line}, column ${column}: ${message}${charPart}`;
    super(fullMessage);
    this.name = 'LexerError';
    this.line = line;
    this.column = column;
    this.char = char;
    Object.setPrototypeOf(this, LexerError.prototype);
  }
}

/**
 * Error thrown during parsing
 * Includes line and column information where the parse error occurred
 */
export class ParserError extends FormulaError {
  readonly line: number;
  readonly column: number;

  constructor(message: string, line: number, column: number) {
    const fullMessage = `Parser error at line ${line}, column ${column}: ${message}`;
    super(fullMessage);
    this.name = 'ParserError';
    this.line = line;
    this.column = column;
    Object.setPrototypeOf(this, ParserError.prototype);
  }
}

/**
 * Error thrown during runtime execution
 * Occurs when evaluating expressions encounters an error
 */
export class RuntimeError extends FormulaError {
  constructor(message: string) {
    const fullMessage = `Runtime error: ${message}`;
    super(fullMessage);
    this.name = 'RuntimeError';
    Object.setPrototypeOf(this, RuntimeError.prototype);
  }
}
