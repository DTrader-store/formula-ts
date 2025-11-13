import { TokenType } from './TokenType';

/**
 * Represents a single token in the formula lexer
 */
export class Token {
  /**
   * Creates a new Token
   * @param type The token type
   * @param value The token value
   * @param line The line number (1-indexed)
   * @param column The column number (1-indexed)
   */
  constructor(
    readonly type: TokenType,
    readonly value: string,
    readonly line: number,
    readonly column: number,
  ) {}

  /**
   * Returns a string representation of the token
   */
  toString(): string {
    return `Token(${this.type}, ${JSON.stringify(this.value)}, ${this.line}:${this.column})`;
  }

  /**
   * Checks equality with another token
   */
  equals(other: Token): boolean {
    return (
      this.type === other.type &&
      this.value === other.value &&
      this.line === other.line &&
      this.column === other.column
    );
  }
}
