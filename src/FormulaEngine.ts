import { Lexer } from './lexer/Lexer';
import { Parser } from './parser/Parser';
import { Interpreter } from './interpreter/Interpreter';
import { ExecutionContext } from './interpreter/Context';
import { IncrementalContext } from './interpreter/IncrementalContext';
import { FunctionRegistry } from './interpreter/FunctionRegistry';
import { Program, isOutputDeclaration } from './parser/ast/nodes';
import { MarketData } from './types/MarketData';
import { FormulaResult, OutputLine, LineStyle } from './types/FormulaResult';

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
      const statement = ast.body.find(
        (item) => isOutputDeclaration(item) && item.name === name,
      ) as { style?: LineStyle } | undefined;
      outputs.push({
        name,
        data,
        style: statement?.style,
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
      drawings: context.getDrawings(),
    };
  }

  /**
   * Evaluate a formula incrementally with new market data
   * Only calculates values for new data points, reusing previous results
   *
   * @param formula Formula source code (must be the same as previous evaluation)
   * @param newData Complete array of market data (old + new data)
   * @param previousResult Previous formula result to build upon
   * @returns Formula result containing outputs and variables
   * @throws {LexerError} If lexical analysis fails
   * @throws {ParserError} If parsing fails
   * @throws {RuntimeError} If execution fails
   *
   * @example
   * ```typescript
   * // Initial evaluation with 100 data points
   * const result1 = engine.evaluate(formula, marketData.slice(0, 100));
   *
   * // Add 10 new data points and evaluate incrementally
   * const result2 = engine.evaluateIncremental(
   *   formula,
   *   marketData.slice(0, 110),
   *   result1
   * );
   * // Only calculates for the 10 new points, much faster!
   * ```
   */
  evaluateIncremental(
    formula: string,
    newData: MarketData[],
    previousResult: FormulaResult,
  ): FormulaResult {
    // Validate inputs
    if (!previousResult || !previousResult.outputs || previousResult.outputs.length === 0) {
      throw new Error('Previous result is required for incremental evaluation');
    }

    const previousLength = previousResult.outputs[0].data.length;

    if (newData.length < previousLength) {
      throw new Error(
        `New data (${newData.length} points) must have at least as many points as previous data (${previousLength} points)`,
      );
    }

    // If no new data, return previous result
    if (newData.length === previousLength) {
      return previousResult;
    }

    // Parse the formula
    const ast = this.parse(formula);

    // Create incremental execution context
    const context = new IncrementalContext(newData, this.registry, previousLength);

    // Restore previous variables and outputs into context
    for (const [name, value] of Object.entries(previousResult.variables)) {
      context.restoreVariable(name, value);
    }

    for (const output of previousResult.outputs) {
      context.restoreOutput(output.name, output.data);
    }

    // Create interpreter and execute
    // The interpreter will use the context to only calculate new values
    const interpreter = new Interpreter(context);
    interpreter.visitProgram(ast);

    // Collect results (will include both old and new data)
    const outputs: OutputLine[] = [];
    const outputsMap = context.getOutputs();

    for (const [name, data] of outputsMap) {
      const statement = ast.body.find(
        (item) => isOutputDeclaration(item) && item.name === name,
      ) as { style?: LineStyle } | undefined;
      outputs.push({
        name,
        data,
        style: statement?.style,
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
      drawings: context.getDrawings(),
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
