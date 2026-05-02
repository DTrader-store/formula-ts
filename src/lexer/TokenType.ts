/**
 * Token types for the formula lexer
 */
export enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  IDENTIFIER = 'IDENTIFIER',

  // Operators
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',

  // Comparison operators
  GT = 'GT',
  LT = 'LT',
  GTE = 'GTE',
  LTE = 'LTE',
  EQ = 'EQ',
  NEQ = 'NEQ',

  // Logical operators
  AND = 'AND',
  OR = 'OR',

  // Punctuation
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  COMMA = 'COMMA',
  SEMICOLON = 'SEMICOLON',
  COLON = 'COLON',

  // Assignment
  ASSIGN = 'ASSIGN',

  // Keywords
  IF = 'IF',

  // Chart attributes
  COLOR = 'COLOR',
  LINETHICK = 'LINETHICK',
  DOTLINE = 'DOTLINE',
  STICK = 'STICK',
  COLORSTICK = 'COLORSTICK',
  VOLSTICK = 'VOLSTICK',
  NODRAW = 'NODRAW',

  // Special
  NEWLINE = 'NEWLINE',
  EOF = 'EOF',
}
