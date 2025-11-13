import { Token } from './Token';
import { TokenType } from './TokenType';
import { LexerError } from '../errors';

/**
 * Lexer for tokenizing formula source code
 * Converts input string into a sequence of tokens
 */
export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private currentChar: string | null = null;

  // Keywords map for quick lookup
  private readonly keywords: Map<string, TokenType> = new Map([
    ['IF', TokenType.IF],
    ['AND', TokenType.AND],
    ['OR', TokenType.OR],
    ['DOTLINE', TokenType.DOTLINE],
    ['STICK', TokenType.STICK],
  ]);

  /**
   * Creates a new Lexer instance
   * @param input The source code to tokenize
   */
  constructor(input: string) {
    this.input = input;
    this.currentChar = input.length > 0 ? input[0] : null;
  }

  /**
   * Tokenizes the entire input and returns array of tokens
   * @returns Array of tokens including EOF token at the end
   * @throws {LexerError} If an invalid character or syntax is encountered
   */
  tokenize(): Token[] {
    const tokens: Token[] = [];
    let lastWasNewline = false;

    while (this.currentChar !== null) {
      // Skip whitespace (except newlines)
      if (this.isWhitespace(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      // Handle newlines
      if (this.isNewline(this.currentChar)) {
        if (!lastWasNewline) {
          tokens.push(this.makeToken(TokenType.NEWLINE, '\n'));
          lastWasNewline = true;
        }
        this.skipNewline();
        continue;
      }

      lastWasNewline = false;

      // Skip comments
      if (this.currentChar === '/' && this.peek() === '/') {
        this.skipSingleLineComment();
        continue;
      }

      if (this.currentChar === '{') {
        this.skipBlockComment();
        continue;
      }

      // Numbers
      if (this.isDigit(this.currentChar) || (this.currentChar === '.' && this.isDigit(this.peek()))) {
        tokens.push(this.readNumber());
        continue;
      }

      // Identifiers and keywords
      if (this.isAlpha(this.currentChar)) {
        tokens.push(this.readIdentifierOrKeyword());
        continue;
      }

      // Operators and delimiters
      const operatorToken = this.readOperatorOrDelimiter();
      if (operatorToken) {
        tokens.push(operatorToken);
        continue;
      }

      // If we get here, it's an unexpected character
      throw new LexerError(
        `Unexpected character: '${this.currentChar}'`,
        this.line,
        this.column,
        this.currentChar
      );
    }

    // Add EOF token
    tokens.push(this.makeToken(TokenType.EOF, ''));

    return tokens;
  }

  /**
   * Advances to the next character
   */
  private advance(): void {
    this.position++;
    this.column++;
    this.currentChar = this.position < this.input.length ? this.input[this.position] : null;
  }

  /**
   * Looks at the next character without consuming it
   */
  private peek(offset: number = 1): string | null {
    const peekPos = this.position + offset;
    return peekPos < this.input.length ? this.input[peekPos] : null;
  }

  /**
   * Creates a token at the current position
   */
  private makeToken(type: TokenType, value: string): Token {
    return new Token(type, value, this.line, this.column - value.length);
  }

  /**
   * Checks if character is whitespace (excluding newlines)
   */
  private isWhitespace(char: string): boolean {
    return char === ' ' || char === '\t';
  }

  /**
   * Checks if character is a newline
   */
  private isNewline(char: string): boolean {
    return char === '\n' || char === '\r';
  }

  /**
   * Checks if character is a digit
   */
  private isDigit(char: string | null): boolean {
    return char !== null && char >= '0' && char <= '9';
  }

  /**
   * Checks if character is alphabetic
   */
  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }

  /**
   * Checks if character is alphanumeric
   */
  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  /**
   * Skips whitespace characters
   */
  private skipWhitespace(): void {
    while (this.currentChar !== null && this.isWhitespace(this.currentChar)) {
      this.advance();
    }
  }

  /**
   * Skips newline characters and updates line number
   */
  private skipNewline(): void {
    // Handle \r\n as single newline
    if (this.currentChar === '\r' && this.peek() === '\n') {
      this.advance();
      this.advance();
    } else {
      this.advance();
    }
    this.line++;
    this.column = 1;

    // Skip additional consecutive newlines
    while (this.currentChar !== null && this.isNewline(this.currentChar)) {
      if (this.currentChar === '\r' && this.peek() === '\n') {
        this.advance();
        this.advance();
      } else {
        this.advance();
      }
      this.line++;
      this.column = 1;
    }
  }

  /**
   * Skips single-line comment starting with //
   */
  private skipSingleLineComment(): void {
    // Skip //
    this.advance();
    this.advance();

    // Skip until end of line or end of input
    while (this.currentChar !== null && !this.isNewline(this.currentChar)) {
      this.advance();
    }
  }

  /**
   * Skips block comment enclosed in { }
   */
  private skipBlockComment(): void {
    const startLine = this.line;
    const startColumn = this.column;

    // Skip opening {
    this.advance();

    // Skip until closing }
    while (this.currentChar !== null && this.currentChar !== '}') {
      if (this.isNewline(this.currentChar)) {
        this.skipNewline();
      } else {
        this.advance();
      }
    }

    // Check for unclosed comment
    if (this.currentChar === null) {
      throw new LexerError(
        'Unterminated block comment',
        startLine,
        startColumn,
        '{'
      );
    }

    // Skip closing }
    this.advance();
  }

  /**
   * Reads a number (integer or floating point)
   */
  private readNumber(): Token {
    const startColumn = this.column;
    let value = '';

    // Handle numbers starting with decimal point
    if (this.currentChar === '.') {
      value += '.';
      this.advance();
    }

    // Read digits before decimal point
    while (this.currentChar !== null && this.isDigit(this.currentChar)) {
      value += this.currentChar;
      this.advance();
    }

    // Read decimal part if present
    if (this.currentChar === '.' && value !== '.') {
      value += '.';
      this.advance();

      while (this.currentChar !== null && this.isDigit(this.currentChar)) {
        value += this.currentChar;
        this.advance();
      }
    }

    return new Token(TokenType.NUMBER, value, this.line, startColumn);
  }

  /**
   * Reads an identifier or keyword
   */
  private readIdentifierOrKeyword(): Token {
    const startColumn = this.column;
    let value = '';

    // Read alphanumeric characters
    while (this.currentChar !== null && this.isAlphaNumeric(this.currentChar)) {
      value += this.currentChar;
      this.advance();
    }

    // Check if it's a keyword
    const upperValue = value.toUpperCase();

    // Check for COLOR* keywords
    if (upperValue.startsWith('COLOR') && upperValue.length > 5) {
      return new Token(TokenType.COLOR, upperValue, this.line, startColumn);
    }

    // Check for LINETHICK* keywords
    if (upperValue.startsWith('LINETHICK') && upperValue.length === 10) {
      const thicknessChar = upperValue[9];
      if (thicknessChar >= '1' && thicknessChar <= '9') {
        return new Token(TokenType.LINETHICK, upperValue, this.line, startColumn);
      }
    }

    // Check standard keywords
    const keywordType = this.keywords.get(upperValue);
    if (keywordType !== undefined) {
      return new Token(keywordType, upperValue, this.line, startColumn);
    }

    // It's an identifier
    return new Token(TokenType.IDENTIFIER, value, this.line, startColumn);
  }

  /**
   * Reads an operator or delimiter token
   */
  private readOperatorOrDelimiter(): Token | null {
    const startColumn = this.column;
    const char = this.currentChar!;

    switch (char) {
      case '+':
        this.advance();
        return new Token(TokenType.PLUS, '+', this.line, startColumn);

      case '-':
        this.advance();
        return new Token(TokenType.MINUS, '-', this.line, startColumn);

      case '*':
        this.advance();
        return new Token(TokenType.MULTIPLY, '*', this.line, startColumn);

      case '/':
        this.advance();
        return new Token(TokenType.DIVIDE, '/', this.line, startColumn);

      case '(':
        this.advance();
        return new Token(TokenType.LPAREN, '(', this.line, startColumn);

      case ')':
        this.advance();
        return new Token(TokenType.RPAREN, ')', this.line, startColumn);

      case ',':
        this.advance();
        return new Token(TokenType.COMMA, ',', this.line, startColumn);

      case ';':
        this.advance();
        return new Token(TokenType.SEMICOLON, ';', this.line, startColumn);

      case ':':
        this.advance();
        // Check for :=
        if (this.currentChar === '=') {
          this.advance();
          return new Token(TokenType.ASSIGN, ':=', this.line, startColumn);
        }
        return new Token(TokenType.COLON, ':', this.line, startColumn);

      case '>':
        this.advance();
        // Check for >=
        if (this.currentChar === '=') {
          this.advance();
          return new Token(TokenType.GTE, '>=', this.line, startColumn);
        }
        return new Token(TokenType.GT, '>', this.line, startColumn);

      case '<':
        this.advance();
        // Check for <= or <>
        if (this.currentChar === '=') {
          this.advance();
          return new Token(TokenType.LTE, '<=', this.line, startColumn);
        } else if (this.currentChar === '>') {
          this.advance();
          return new Token(TokenType.NEQ, '<>', this.line, startColumn);
        }
        return new Token(TokenType.LT, '<', this.line, startColumn);

      case '=':
        this.advance();
        return new Token(TokenType.EQ, '=', this.line, startColumn);

      default:
        return null;
    }
  }
}
