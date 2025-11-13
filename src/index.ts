/**
 * Formula-TS: A TypeScript implementation of a formula parser and interpreter
 * @packageDocumentation
 */

export const VERSION = '1.0.0';

// Export main engine
export { FormulaEngine } from './FormulaEngine';

// Export error classes
export {
  FormulaError,
  LexerError,
  ParserError,
  RuntimeError,
} from './errors';

// Export types
export { MarketData, validateMarketData, getMarketDataLength } from './types/MarketData';
export { FormulaResult, OutputLine, LineStyle } from './types/FormulaResult';

// Export AST node types
export {
  NodeType,
  BinaryOperator,
  UnaryOperator,
  DrawingStyle,
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
} from './parser/ast/nodes';

// Export core components (for advanced usage)
export { Lexer } from './lexer/Lexer';
export { Token } from './lexer/Token';
export { TokenType } from './lexer/TokenType';
export { Parser } from './parser/Parser';
export { Interpreter } from './interpreter/Interpreter';
export { ExecutionContext } from './interpreter/Context';
export { FunctionRegistry, FormulaFunction } from './interpreter/FunctionRegistry';

// Export built-in functions
export { MA, EMA, SUM, MAX, MIN } from './interpreter/functions/math';
export { REF, HHV, LLV } from './interpreter/functions/reference';
export { IF, CROSS } from './interpreter/functions/logical';
