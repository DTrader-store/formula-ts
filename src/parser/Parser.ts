import { Token } from '../lexer/Token';
import { TokenType } from '../lexer/TokenType';
import { ParserError } from '../errors';
import {
  Program,
  Statement,
  Expression,
  VariableDeclaration,
  OutputDeclaration,
  BinaryExpression,
  UnaryExpression,
  FunctionCall,
  Identifier,
  NumberLiteral,
  NodeType,
  BinaryOperator,
  UnaryOperator,
  DrawingStyle,
} from './ast/nodes';

/**
 * Parser for the formula language
 * Converts a sequence of tokens into an Abstract Syntax Tree (AST)
 * Uses recursive descent parsing with operator precedence climbing
 */
export class Parser {
  private tokens: Token[];
  private current: number = 0;

  /**
   * Creates a new Parser instance
   * @param tokens Array of tokens to parse
   */
  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * Parses the tokens and returns a Program AST node
   * @returns The root Program node of the AST
   * @throws {ParserError} If the syntax is invalid
   */
  parse(): Program {
    const statements: Statement[] = [];

    // Skip leading newlines
    this.skipNewlines();

    while (!this.isAtEnd()) {
      // Skip any newlines between statements
      if (this.check(TokenType.NEWLINE)) {
        this.advance();
        continue;
      }

      statements.push(this.parseStatement());
      this.skipNewlines();
    }

    return {
      type: NodeType.Program,
      body: statements,
    };
  }

  /**
   * Parses a single statement
   * Handles variable declarations and output declarations
   */
  private parseStatement(): Statement {
    // Check if this is a variable declaration (VAR := expr;)
    if (this.check(TokenType.IDENTIFIER) && this.peekNext()?.type === TokenType.ASSIGN) {
      return this.parseVariableDeclaration();
    }

    // Check if this is an output declaration (NAME: expr;)
    if (this.check(TokenType.IDENTIFIER) && this.peekNext()?.type === TokenType.COLON) {
      return this.parseOutputDeclaration();
    }

    throw this.error('Expected variable or output declaration');
  }

  /**
   * Parses a variable declaration: VAR := expr;
   */
  private parseVariableDeclaration(): VariableDeclaration {
    const nameToken = this.consume(TokenType.IDENTIFIER, 'Expected variable name');
    const name = nameToken.value;

    this.consume(TokenType.ASSIGN, 'Expected := in variable declaration');

    const value = this.parseExpression();

    this.consume(TokenType.SEMICOLON, 'Expected ; after variable declaration');

    return {
      type: NodeType.VariableDeclaration,
      name,
      value,
    };
  }

  /**
   * Parses an output declaration: NAME: expr, STYLE;
   */
  private parseOutputDeclaration(): OutputDeclaration {
    const nameToken = this.consume(TokenType.IDENTIFIER, 'Expected output name');
    const name = nameToken.value;

    this.consume(TokenType.COLON, 'Expected : in output declaration');

    const value = this.parseExpression();

    // Parse optional drawing style attributes
    let style: DrawingStyle | undefined = undefined;
    if (this.check(TokenType.COMMA)) {
      style = this.parseDrawingStyle();
    }

    this.consume(TokenType.SEMICOLON, 'Expected ; after output declaration');

    return {
      type: NodeType.OutputDeclaration,
      name,
      value,
      style,
    };
  }

  /**
   * Parses drawing style attributes: COLORRED, LINETHICK2, etc.
   */
  private parseDrawingStyle(): DrawingStyle {
    const style: DrawingStyle = {};

    // Parse style attributes separated by commas
    while (this.check(TokenType.COMMA)) {
      this.advance(); // consume comma

      if (this.check(TokenType.COLOR)) {
        const colorToken = this.advance();
        style.color = colorToken.value;
      } else if (this.check(TokenType.LINETHICK)) {
        const thickToken = this.advance();
        // Extract thickness number from LINETHICK1-9
        const thickness = parseInt(thickToken.value.slice(-1), 10);
        style.size = thickness;
      } else if (this.check(TokenType.DOTLINE)) {
        this.advance();
        style.italic = true;
      } else if (this.check(TokenType.STICK)) {
        this.advance();
        style.bold = true;
      } else if (this.check(TokenType.SEMICOLON)) {
        // End of style attributes
        break;
      } else {
        throw this.error('Expected drawing style attribute');
      }
    }

    return style;
  }

  /**
   * Parses an expression
   * Entry point for expression parsing with operator precedence
   */
  private parseExpression(): Expression {
    return this.parseLogicalOr();
  }

  /**
   * Parses logical OR expressions (lowest precedence)
   * LogicalOr -> LogicalAnd (OR LogicalAnd)*
   */
  private parseLogicalOr(): Expression {
    let left = this.parseLogicalAnd();

    while (this.check(TokenType.OR)) {
      this.advance();
      const right = this.parseLogicalAnd();
      const binaryExpr: BinaryExpression = {
        type: NodeType.BinaryExpression,
        left,
        operator: BinaryOperator.Or,
        right,
      };
      left = binaryExpr;
    }

    return left;
  }

  /**
   * Parses logical AND expressions
   * LogicalAnd -> Comparison (AND Comparison)*
   */
  private parseLogicalAnd(): Expression {
    let left = this.parseComparison();

    while (this.check(TokenType.AND)) {
      this.advance();
      const right = this.parseComparison();
      const binaryExpr: BinaryExpression = {
        type: NodeType.BinaryExpression,
        left,
        operator: BinaryOperator.And,
        right,
      };
      left = binaryExpr;
    }

    return left;
  }

  /**
   * Parses comparison expressions
   * Comparison -> Addition (ComparisonOp Addition)*
   */
  private parseComparison(): Expression {
    let left = this.parseAddition();

    while (
      this.check(TokenType.GT) ||
      this.check(TokenType.LT) ||
      this.check(TokenType.GTE) ||
      this.check(TokenType.LTE) ||
      this.check(TokenType.EQ) ||
      this.check(TokenType.NEQ)
    ) {
      const operatorToken = this.advance();
      const operator = this.tokenTypeToBinaryOperator(operatorToken.type);
      const right = this.parseAddition();
      const binaryExpr: BinaryExpression = {
        type: NodeType.BinaryExpression,
        left,
        operator,
        right,
      };
      left = binaryExpr;
    }

    return left;
  }

  /**
   * Parses addition and subtraction expressions
   * Addition -> Multiplication ((PLUS | MINUS) Multiplication)*
   */
  private parseAddition(): Expression {
    let left = this.parseMultiplication();

    while (this.check(TokenType.PLUS) || this.check(TokenType.MINUS)) {
      const operatorToken = this.advance();
      const operator =
        operatorToken.type === TokenType.PLUS ? BinaryOperator.Plus : BinaryOperator.Minus;
      const right = this.parseMultiplication();
      const binaryExpr: BinaryExpression = {
        type: NodeType.BinaryExpression,
        left,
        operator,
        right,
      };
      left = binaryExpr;
    }

    return left;
  }

  /**
   * Parses multiplication and division expressions
   * Multiplication -> Unary ((MULTIPLY | DIVIDE) Unary)*
   */
  private parseMultiplication(): Expression {
    let left = this.parseUnary();

    while (this.check(TokenType.MULTIPLY) || this.check(TokenType.DIVIDE)) {
      const operatorToken = this.advance();
      const operator =
        operatorToken.type === TokenType.MULTIPLY ? BinaryOperator.Multiply : BinaryOperator.Divide;
      const right = this.parseUnary();
      const binaryExpr: BinaryExpression = {
        type: NodeType.BinaryExpression,
        left,
        operator,
        right,
      };
      left = binaryExpr;
    }

    return left;
  }

  /**
   * Parses unary expressions
   * Unary -> (MINUS) Unary | Primary
   */
  private parseUnary(): Expression {
    if (this.check(TokenType.MINUS)) {
      this.advance();
      const operand = this.parseUnary();
      const unaryExpr: UnaryExpression = {
        type: NodeType.UnaryExpression,
        operator: UnaryOperator.Minus,
        operand,
      };
      return unaryExpr;
    }

    return this.parsePrimary();
  }

  /**
   * Parses primary expressions
   * Primary -> NUMBER | IDENTIFIER | FunctionCall | LPAREN Expression RPAREN
   */
  private parsePrimary(): Expression {
    // Number literal
    if (this.check(TokenType.NUMBER)) {
      const token = this.advance();
      const numLiteral: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: parseFloat(token.value),
      };
      return numLiteral;
    }

    // Identifier or function call
    if (this.check(TokenType.IDENTIFIER) || this.check(TokenType.IF)) {
      const nameToken = this.advance();
      const name = nameToken.value;

      // Check if this is a function call
      if (this.check(TokenType.LPAREN)) {
        return this.parseFunctionCall(name);
      }

      // It's an identifier
      const identifier: Identifier = {
        type: NodeType.Identifier,
        name,
      };
      return identifier;
    }

    // Parenthesized expression
    if (this.check(TokenType.LPAREN)) {
      this.advance(); // consume (
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN, 'Expected ) after expression');
      return expr;
    }

    throw this.error('Expected expression');
  }

  /**
   * Parses a function call: NAME(arg1, arg2, ...)
   * Assumes the function name has already been consumed
   */
  private parseFunctionCall(name: string): FunctionCall {
    this.consume(TokenType.LPAREN, 'Expected ( after function name');

    const args: Expression[] = [];

    // Parse arguments
    if (!this.check(TokenType.RPAREN)) {
      do {
        // Skip commas
        if (this.check(TokenType.COMMA)) {
          this.advance();
        }

        // Check for empty argument (trailing comma or missing argument)
        if (this.check(TokenType.RPAREN) || this.check(TokenType.COMMA)) {
          throw this.error('Expected expression in function arguments');
        }

        args.push(this.parseExpression());
      } while (this.check(TokenType.COMMA));
    }

    this.consume(TokenType.RPAREN, 'Expected ) after function arguments');

    const functionCall: FunctionCall = {
      type: NodeType.FunctionCall,
      name,
      arguments: args,
    };
    return functionCall;
  }

  /**
   * Converts TokenType to BinaryOperator
   */
  private tokenTypeToBinaryOperator(type: TokenType): BinaryOperator {
    switch (type) {
      case TokenType.PLUS:
        return BinaryOperator.Plus;
      case TokenType.MINUS:
        return BinaryOperator.Minus;
      case TokenType.MULTIPLY:
        return BinaryOperator.Multiply;
      case TokenType.DIVIDE:
        return BinaryOperator.Divide;
      case TokenType.GT:
        return BinaryOperator.GreaterThan;
      case TokenType.LT:
        return BinaryOperator.LessThan;
      case TokenType.GTE:
        return BinaryOperator.GreaterThanOrEqual;
      case TokenType.LTE:
        return BinaryOperator.LessThanOrEqual;
      case TokenType.EQ:
        return BinaryOperator.Equal;
      case TokenType.NEQ:
        return BinaryOperator.NotEqual;
      case TokenType.AND:
        return BinaryOperator.And;
      case TokenType.OR:
        return BinaryOperator.Or;
      default:
        throw this.error(`Unknown binary operator: ${type}`);
    }
  }

  /**
   * Skips any newline tokens
   */
  private skipNewlines(): void {
    while (this.check(TokenType.NEWLINE)) {
      this.advance();
    }
  }

  /**
   * Checks if the current token is of the specified type
   */
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  /**
   * Advances to the next token and returns the previous one
   */
  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  /**
   * Checks if we're at the end of the token stream
   */
  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  /**
   * Returns the current token without consuming it
   */
  private peek(): Token {
    return this.tokens[this.current];
  }

  /**
   * Returns the next token without consuming current
   */
  private peekNext(): Token | undefined {
    if (this.current + 1 < this.tokens.length) {
      return this.tokens[this.current + 1];
    }
    return undefined;
  }

  /**
   * Returns the previous token
   */
  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  /**
   * Consumes a token of the expected type or throws an error
   */
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }

    throw this.error(message);
  }

  /**
   * Creates a ParserError with the current token's position
   */
  private error(message: string): ParserError {
    const token = this.peek();
    return new ParserError(message, token.line, token.column);
  }
}
