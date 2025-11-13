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
  BinaryOperator,
  UnaryOperator,
  NodeType,
} from '../parser/ast/nodes';
import { ExecutionContext } from './Context';
import * as functions from './functions';

/**
 * Interpreter executes formulas by traversing the AST
 * Uses visitor pattern to evaluate expressions and statements
 */
export class Interpreter {
  private context: ExecutionContext;

  /**
   * Create a new interpreter
   * @param context - Execution context with market data and function registry
   */
  constructor(context: ExecutionContext) {
    this.context = context;
  }

  /**
   * Execute a program (root AST node)
   * @param program - Program AST node
   */
  visitProgram(program: Program): void {
    for (const statement of program.body) {
      this.visitStatement(statement);
    }
  }

  /**
   * Visit a statement node
   * @param statement - Statement node
   */
  private visitStatement(statement: Statement): void {
    switch (statement.type) {
      case NodeType.VariableDeclaration:
        this.visitVariableDeclaration(statement as VariableDeclaration);
        break;
      case NodeType.OutputDeclaration:
        this.visitOutputDeclaration(statement as OutputDeclaration);
        break;
      case NodeType.ExpressionStatement:
        // Expression statements don't have side effects in our language
        break;
      default:
        throw new Error(`Unknown statement type: ${statement.type}`);
    }
  }

  /**
   * Visit a variable declaration
   * @param node - VariableDeclaration node
   */
  visitVariableDeclaration(node: VariableDeclaration): void {
    const value = this.visitExpression(node.value);
    this.context.setVariable(node.name, value);
  }

  /**
   * Visit an output declaration
   * @param node - OutputDeclaration node
   */
  visitOutputDeclaration(node: OutputDeclaration): void {
    const value = this.visitExpression(node.value);
    this.context.setOutput(node.name, value);
  }

  /**
   * Visit an expression node
   * @param expression - Expression node
   * @returns Evaluated value as number array
   */
  private visitExpression(expression: Expression): number[] {
    switch (expression.type) {
      case NodeType.BinaryExpression:
        return this.visitBinaryExpression(expression as BinaryExpression);
      case NodeType.UnaryExpression:
        return this.visitUnaryExpression(expression as UnaryExpression);
      case NodeType.FunctionCall:
        return this.visitFunctionCall(expression as FunctionCall);
      case NodeType.Identifier:
        return this.visitIdentifier(expression as Identifier);
      case NodeType.NumberLiteral:
        return this.visitNumberLiteral(expression as NumberLiteral);
      default:
        throw new Error(`Unknown expression type: ${expression.type}`);
    }
  }

  /**
   * Visit a binary expression
   * @param node - BinaryExpression node
   * @returns Evaluated value as number array
   */
  visitBinaryExpression(node: BinaryExpression): number[] {
    const left = this.visitExpression(node.left);
    const right = this.visitExpression(node.right);

    // Ensure both arrays have the same length
    const length = Math.min(left.length, right.length);
    const result: number[] = new Array(length);

    for (let i = 0; i < length; i++) {
      result[i] = this.evaluateBinaryOperation(left[i], node.operator, right[i]);
    }

    return result;
  }

  /**
   * Evaluate a binary operation on two numbers
   * @param left - Left operand
   * @param operator - Binary operator
   * @param right - Right operand
   * @returns Result of the operation
   */
  private evaluateBinaryOperation(left: number, operator: BinaryOperator, right: number): number {
    switch (operator) {
      // Arithmetic
      case BinaryOperator.Plus:
        return left + right;
      case BinaryOperator.Minus:
        return left - right;
      case BinaryOperator.Multiply:
        return left * right;
      case BinaryOperator.Divide:
        return left / right;
      case BinaryOperator.Modulo:
        return left % right;
      case BinaryOperator.Power:
        return Math.pow(left, right);

      // Comparison (return 1 for true, 0 for false)
      case BinaryOperator.Equal:
        return left === right ? 1 : 0;
      case BinaryOperator.NotEqual:
        return left !== right ? 1 : 0;
      case BinaryOperator.LessThan:
        return left < right ? 1 : 0;
      case BinaryOperator.LessThanOrEqual:
        return left <= right ? 1 : 0;
      case BinaryOperator.GreaterThan:
        return left > right ? 1 : 0;
      case BinaryOperator.GreaterThanOrEqual:
        return left >= right ? 1 : 0;

      // Logical (treat non-zero as true)
      case BinaryOperator.And:
        return left !== 0 && right !== 0 ? 1 : 0;
      case BinaryOperator.Or:
        return left !== 0 || right !== 0 ? 1 : 0;

      default:
        throw new Error(`Unknown binary operator: ${operator}`);
    }
  }

  /**
   * Visit a unary expression
   * @param node - UnaryExpression node
   * @returns Evaluated value as number array
   */
  visitUnaryExpression(node: UnaryExpression): number[] {
    const operand = this.visitExpression(node.operand);
    const result: number[] = new Array(operand.length);

    for (let i = 0; i < operand.length; i++) {
      result[i] = this.evaluateUnaryOperation(node.operator, operand[i]);
    }

    return result;
  }

  /**
   * Evaluate a unary operation on a number
   * @param operator - Unary operator
   * @param operand - Operand
   * @returns Result of the operation
   */
  private evaluateUnaryOperation(operator: UnaryOperator, operand: number): number {
    switch (operator) {
      case UnaryOperator.Minus:
        return -operand;
      case UnaryOperator.Not:
        return operand === 0 ? 1 : 0;
      default:
        throw new Error(`Unknown unary operator: ${operator}`);
    }
  }

  /**
   * Visit a function call
   * @param node - FunctionCall node
   * @returns Evaluated value as number array
   */
  visitFunctionCall(node: FunctionCall): number[] {
    const functionName = node.name.toUpperCase();

    // Evaluate all arguments
    const args = node.arguments.map((arg) => this.visitExpression(arg));

    // Handle built-in array functions directly
    switch (functionName) {
      case 'MA':
        if (args.length !== 2) {
          throw new Error(`MA expects 2 arguments, got ${args.length}`);
        }
        // Second argument should be a constant (period)
        const maPeriod = this.getConstantValue(args[1]);
        return functions.MA(args[0], maPeriod);

      case 'EMA':
        if (args.length !== 2) {
          throw new Error(`EMA expects 2 arguments, got ${args.length}`);
        }
        const emaPeriod = this.getConstantValue(args[1]);
        return functions.EMA(args[0], emaPeriod);

      case 'SUM':
        if (args.length !== 2) {
          throw new Error(`SUM expects 2 arguments, got ${args.length}`);
        }
        const sumPeriod = this.getConstantValue(args[1]);
        return functions.SUM(args[0], sumPeriod);

      case 'MAX':
        if (args.length !== 2) {
          throw new Error(`MAX expects 2 arguments, got ${args.length}`);
        }
        return functions.MAX(args[0], args[1]);

      case 'MIN':
        if (args.length !== 2) {
          throw new Error(`MIN expects 2 arguments, got ${args.length}`);
        }
        return functions.MIN(args[0], args[1]);

      case 'REF':
        if (args.length !== 2) {
          throw new Error(`REF expects 2 arguments, got ${args.length}`);
        }
        const refPeriod = this.getConstantValue(args[1]);
        return functions.REF(args[0], refPeriod);

      case 'HHV':
        if (args.length !== 2) {
          throw new Error(`HHV expects 2 arguments, got ${args.length}`);
        }
        const hhvPeriod = this.getConstantValue(args[1]);
        return functions.HHV(args[0], hhvPeriod);

      case 'LLV':
        if (args.length !== 2) {
          throw new Error(`LLV expects 2 arguments, got ${args.length}`);
        }
        const llvPeriod = this.getConstantValue(args[1]);
        return functions.LLV(args[0], llvPeriod);

      case 'IF':
        if (args.length !== 3) {
          throw new Error(`IF expects 3 arguments, got ${args.length}`);
        }
        return functions.IF(args[0], args[1], args[2]);

      case 'CROSS':
        if (args.length !== 2) {
          throw new Error(`CROSS expects 2 arguments, got ${args.length}`);
        }
        return functions.CROSS(args[0], args[1]);

      default:
        throw new Error(`Unknown function: ${node.name}`);
    }
  }

  /**
   * Get a constant value from an array (all elements should be the same)
   * @param arr - Number array
   * @returns The constant value
   */
  private getConstantValue(arr: number[]): number {
    if (arr.length === 0) {
      throw new Error('Cannot get constant value from empty array');
    }
    // Return the first non-NaN value, or the first value if all are NaN
    const firstValue = arr.find((v) => !isNaN(v));
    return firstValue !== undefined ? firstValue : arr[0];
  }

  /**
   * Visit an identifier
   * @param node - Identifier node
   * @returns Evaluated value as number array
   */
  visitIdentifier(node: Identifier): number[] {
    const name = node.name;

    // Check if it's a market data field
    if (this.context.isMarketDataField(name)) {
      return this.context.getMarketDataField(name);
    }

    // Check if it's a variable
    if (this.context.hasVariable(name)) {
      const value = this.context.getVariable(name);
      if (value === undefined) {
        throw new Error(`Variable ${name} is undefined`);
      }
      return value;
    }

    throw new Error(`Undefined identifier: ${name}`);
  }

  /**
   * Visit a number literal
   * @param node - NumberLiteral node
   * @returns Evaluated value as number array (all elements are the same)
   */
  visitNumberLiteral(node: NumberLiteral): number[] {
    // Create an array with the same length as market data, all values are the literal
    const length = this.context.getDataLength();
    return new Array(length).fill(node.value);
  }

  /**
   * Get the execution context
   * @returns Execution context
   */
  getContext(): ExecutionContext {
    return this.context;
  }
}
