import { Lexer } from './lexer/Lexer';
import { Parser } from './parser/Parser';
import { Interpreter } from './interpreter/Interpreter';
import { ExecutionContext } from './interpreter/Context';
import { FunctionRegistry } from './interpreter/FunctionRegistry';
import { Program } from './parser/ast/nodes';
import { MarketData } from './types/MarketData';
import { FormulaResult, OutputLine } from './types/FormulaResult';

/**
 * FormulaEngine - Main entry point for formula compilation and execution
 * Integrates lexer, parser, and interpreter to provide a simple API
 */
export class FormulaEngine {
  private registry: FunctionRegistry;

  /**
   * Create a new FormulaEngine instance
   * @param registry Optional custom function registry
   */
  constructor(registry?: FunctionRegistry) {
    this.registry = registry || new FunctionRegistry();
  }

  /**
   * Parse a formula string into an AST
   * @param formula Formula source code
   * @returns Parsed AST program
   * @throws {LexerError} If lexical analysis fails
   * @throws {ParserError} If parsing fails
   */
  parse(formula: string): Program {
    const lexer = new Lexer(formula);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    return parser.parse();
  }

  /**
   * Evaluate a formula with market data
   * @param formula Formula source code
   * @param marketData Array of market data records
   * @returns Formula result containing outputs and variables
   * @throws {LexerError} If lexical analysis fails
   * @throws {ParserError} If parsing fails
   * @throws {RuntimeError} If execution fails
   */
  evaluate(formula: string, marketData: MarketData[]): FormulaResult {
    // Parse the formula
    const ast = this.parse(formula);

    // Create execution context
    const context = new ExecutionContext(marketData, this.registry);

    // Create interpreter and execute
    const interpreter = new Interpreter(context);
    interpreter.visitProgram(ast);

    // Collect results
    const outputs: OutputLine[] = [];
    const outputsMap = context.getOutputs();

    for (const [name, data] of outputsMap) {
      outputs.push({
        name,
        data,
      });
    }

    // Convert variables Map to Record
    const variables: Record<string, number[]> = {};
    const variablesMap = context.getVariables();
    for (const [name, value] of variablesMap) {
      variables[name] = value;
    }

    return {
      outputs,
      variables,
    };
  }

  /**
   * Get the function registry
   * @returns Function registry instance
   */
  getRegistry(): FunctionRegistry {
    return this.registry;
  }
}
