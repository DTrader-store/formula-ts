import {
  Program,
  Statement,
  Expression,
  VariableDeclaration,
  OutputDeclaration,
  ExpressionStatement,
  BinaryExpression,
  UnaryExpression,
  FunctionCall,
  Identifier,
  NumberLiteral,
  StringLiteral,
  BinaryOperator,
  UnaryOperator,
  NodeType,
} from '../parser/ast/nodes';
import { DrawingEvent } from '../types/FormulaResult';
import { ExecutionContext } from './Context';
import * as functions from './functions';
import * as marketDataFunctions from './functions/marketData';
import * as datetimeFunctions from './functions/datetime';
import * as periodFunctions from './functions/period';
import * as patternFunctions from './functions/pattern';
import * as chipFunctions from './functions/chip';
import * as technicalFunctions from './functions/technical';
import * as statisticsFunctions from './functions/statistics';

type DrawingEventList = DrawingEvent[] & { __formulaDrawingEvents: true };
type EvaluatedValue = number[] | string | DrawingEventList;

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
        const result = this.visitExpression((statement as ExpressionStatement).expression);
        if (Array.isArray(result) && !this.isNumberArray(result)) {
          this.context.addDrawings(result as DrawingEvent[]);
        }
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
    if (this.isDrawingEventArray(value)) {
      this.context.addDrawings(value);
      return;
    }
    this.context.setVariable(node.name, this.expectNumberArray(value, node.name));
  }

  /**
   * Visit an output declaration
   * @param node - OutputDeclaration node
   */
  visitOutputDeclaration(node: OutputDeclaration): void {
    const value = this.visitExpression(node.value);
    if (this.isDrawingEventArray(value)) {
      this.context.addDrawings(value);
      return;
    }
    const numericValue = this.expectNumberArray(value, node.name);
    this.context.setOutput(node.name, numericValue);
    this.context.setVariable(node.name, numericValue);
  }

  /**
   * Visit an expression node
   * @param expression - Expression node
   * @returns Evaluated value as number array
   */
  private visitExpression(expression: Expression): EvaluatedValue {
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
      case NodeType.StringLiteral:
        return this.visitStringLiteral(expression as StringLiteral);
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
    const left = this.expectNumberArray(this.visitExpression(node.left), 'binary left operand');
    const right = this.expectNumberArray(this.visitExpression(node.right), 'binary right operand');

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
        return this.isTruthy(left) && this.isTruthy(right) ? 1 : 0;
      case BinaryOperator.Or:
        return this.isTruthy(left) || this.isTruthy(right) ? 1 : 0;

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
    const operand = this.expectNumberArray(this.visitExpression(node.operand), 'unary operand');
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
        return this.isTruthy(operand) ? 0 : 1;
      default:
        throw new Error(`Unknown unary operator: ${operator}`);
    }
  }

  /**
   * Visit a function call
   * @param node - FunctionCall node
   * @returns Evaluated value as number array
   */
  visitFunctionCall(node: FunctionCall): EvaluatedValue {
    const functionName = node.name.toUpperCase();

    // Evaluate all arguments
    const args = node.arguments.map((arg) => this.visitExpression(arg));
    const numericArgs = (): number[][] =>
      args.map((arg, index) => this.expectNumberArray(arg, `${functionName} argument ${index + 1}`));

    // Handle built-in array functions directly
    switch (functionName) {
      case 'MA':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`MA expects 2 arguments, got ${args.length}`);
        }
        // Second argument should be a constant (period)
        const maPeriod = this.getConstantValue(values[1]);
        return functions.MA(values[0], maPeriod);
        }

      case 'EMA':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`EMA expects 2 arguments, got ${args.length}`);
        }
        const emaPeriod = this.getConstantValue(values[1]);
        return functions.EMA(values[0], emaPeriod);
        }

      case 'SUM':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`SUM expects 2 arguments, got ${args.length}`);
        }
        const sumPeriod = this.getConstantValue(values[1]);
        return functions.SUM(values[0], sumPeriod);
        }

      case 'MAX':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`MAX expects 2 arguments, got ${args.length}`);
        }
        return functions.MAX(values[0], values[1]);
        }

      case 'MIN':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`MIN expects 2 arguments, got ${args.length}`);
        }
        return functions.MIN(values[0], values[1]);
        }

      case 'REF':
      case 'REFV':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`${functionName} expects 2 arguments, got ${args.length}`);
        }
        const refPeriod = this.getConstantValue(values[1]);
        return functions.REF(values[0], refPeriod);
        }

      case 'REFX':
      case 'REFXV':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`${functionName} expects 2 arguments, got ${args.length}`);
        }
        return functions.REFX(values[0], this.getConstantValue(values[1]));
        }

      case 'HHV':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`HHV expects 2 arguments, got ${args.length}`);
        }
        const hhvPeriod = this.getConstantValue(values[1]);
        return functions.HHV(values[0], hhvPeriod);
        }

      case 'HHVBARS':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`HHVBARS expects 2 arguments, got ${args.length}`);
        }
        return functions.HHVBARS(values[0], this.getConstantValue(values[1]));
        }

      case 'LLV':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`LLV expects 2 arguments, got ${args.length}`);
        }
        const llvPeriod = this.getConstantValue(values[1]);
        return functions.LLV(values[0], llvPeriod);
        }

      case 'LLVBARS':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`LLVBARS expects 2 arguments, got ${args.length}`);
        }
        return functions.LLVBARS(values[0], this.getConstantValue(values[1]));
        }

      case 'IF':
      case 'IFF':
        {
        const values = numericArgs();
        if (args.length !== 3) {
          throw new Error(`${functionName} expects 3 arguments, got ${args.length}`);
        }
        return functions.IF(values[0], values[1], values[2]);
        }

      case 'IFN':
        {
        const values = numericArgs();
        if (args.length !== 3) {
          throw new Error(`IFN expects 3 arguments, got ${args.length}`);
        }
        return functions.IFN(values[0], values[1], values[2]);
        }

      case 'CROSS':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`CROSS expects 2 arguments, got ${args.length}`);
        }
        return functions.CROSS(values[0], values[1]);
        }

      case 'LONGCROSS':
        {
        const values = numericArgs();
        if (args.length !== 3) {
          throw new Error(`LONGCROSS expects 3 arguments, got ${args.length}`);
        }
        return functions.LONGCROSS(values[0], values[1], this.getConstantValue(values[2]));
        }

      case 'ABS':
        {
        const values = numericArgs();
        if (args.length !== 1) {
          throw new Error(`ABS expects 1 argument, got ${args.length}`);
        }
        return functions.ABS(values[0]);
        }

      case 'SQRT':
        {
        const values = numericArgs();
        if (args.length !== 1) {
          throw new Error(`SQRT expects 1 argument, got ${args.length}`);
        }
        return functions.SQRT(values[0]);
        }

      case 'POW':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`POW expects 2 arguments, got ${args.length}`);
        }
        return functions.POW(values[0], values[1]);
        }

      case 'MOD':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`MOD expects 2 arguments, got ${args.length}`);
        }
        return functions.MOD(values[0], values[1]);
        }

      case 'ROUND':
        {
        const values = numericArgs();
        if (args.length !== 1) {
          throw new Error(`ROUND expects 1 argument, got ${args.length}`);
        }
        return functions.ROUND(values[0]);
        }

      case 'EXP':
      case 'LN':
      case 'LOG':
      case 'CEILING':
      case 'FLOOR':
      case 'INTPART':
      case 'FRACPART':
      case 'SIGN':
      case 'SIN':
      case 'COS':
      case 'TAN':
      case 'ASIN':
      case 'ACOS':
      case 'ATAN':
        {
        const values = numericArgs();
        if (args.length !== 1) {
          throw new Error(`${functionName} expects 1 argument, got ${args.length}`);
        }
        switch (functionName) {
          case 'EXP':
            return functions.EXP(values[0]);
          case 'LN':
            return functions.LN(values[0]);
          case 'LOG':
            return functions.LOG(values[0]);
          case 'CEILING':
            return functions.CEILING(values[0]);
          case 'FLOOR':
            return functions.FLOOR(values[0]);
          case 'INTPART':
            return functions.INTPART(values[0]);
          case 'FRACPART':
            return functions.FRACPART(values[0]);
          case 'SIGN':
            return functions.SIGN(values[0]);
          case 'SIN':
            return functions.SIN(values[0]);
          case 'COS':
            return functions.COS(values[0]);
          case 'TAN':
            return functions.TAN(values[0]);
          case 'ASIN':
            return functions.ASIN(values[0]);
          case 'ACOS':
            return functions.ACOS(values[0]);
          case 'ATAN':
            return functions.ATAN(values[0]);
        }
        }

      case 'ROUND2':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`ROUND2 expects 2 arguments, got ${args.length}`);
        }
        return functions.ROUND2(values[0], this.getConstantValue(values[1]));
        }

      case 'DRAWNULL':
        if (args.length !== 0) {
          throw new Error(`DRAWNULL expects 0 arguments, got ${args.length}`);
        }
        return this.visitNumberLiteral({ type: NodeType.NumberLiteral, value: NaN });

      case 'EVERY':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`EVERY expects 2 arguments, got ${args.length}`);
        }
        return functions.EVERY(values[0], this.getConstantValue(values[1]));
        }

      case 'EXIST':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`EXIST expects 2 arguments, got ${args.length}`);
        }
        return functions.EXIST(values[0], this.getConstantValue(values[1]));
        }

      case 'BARSLAST':
        {
        const values = numericArgs();
        if (args.length !== 1) {
          throw new Error(`BARSLAST expects 1 argument, got ${args.length}`);
        }
        return functions.BARSLAST(values[0]);
        }

      case 'BARSLASTCOUNT':
        {
        const values = numericArgs();
        if (args.length !== 1) {
          throw new Error(`BARSLASTCOUNT expects 1 argument, got ${args.length}`);
        }
        return functions.BARSLASTCOUNT(values[0]);
        }

      case 'COUNT':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`COUNT expects 2 arguments, got ${args.length}`);
        }
        return functions.COUNT(values[0], this.getConstantValue(values[1]));
        }

      case 'FILTER':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`FILTER expects 2 arguments, got ${args.length}`);
        }
        return functions.FILTER(values[0], this.getConstantValue(values[1]));
        }

      case 'NOT':
        {
        const values = numericArgs();
        if (args.length !== 1) {
          throw new Error(`NOT expects 1 argument, got ${args.length}`);
        }
        return functions.NOT(values[0]);
        }

      case 'STD':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`STD expects 2 arguments, got ${args.length}`);
        }
        return statisticsFunctions.STD(values[0], this.getConstantValue(values[1]));
        }

      case 'VAR':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`VAR expects 2 arguments, got ${args.length}`);
        }
        return statisticsFunctions.VAR(values[0], this.getConstantValue(values[1]));
        }

      case 'STDP':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`STDP expects 2 arguments, got ${args.length}`);
        }
        return statisticsFunctions.STDP(values[0], this.getConstantValue(values[1]));
        }

      case 'STDDEV':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`STDDEV expects 2 arguments, got ${args.length}`);
        }
        return statisticsFunctions.STDDEV(values[0], this.getConstantValue(values[1]));
        }

      case 'VARP':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`VARP expects 2 arguments, got ${args.length}`);
        }
        return statisticsFunctions.VARP(values[0], this.getConstantValue(values[1]));
        }

      case 'DEVSQ':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`DEVSQ expects 2 arguments, got ${args.length}`);
        }
        return statisticsFunctions.DEVSQ(values[0], this.getConstantValue(values[1]));
        }

      case 'FORCAST':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`FORCAST expects 2 arguments, got ${args.length}`);
        }
        return statisticsFunctions.FORCAST(values[0], this.getConstantValue(values[1]));
        }

      case 'SLOPE':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`SLOPE expects 2 arguments, got ${args.length}`);
        }
        return statisticsFunctions.SLOPE(values[0], this.getConstantValue(values[1]));
        }

      case 'COVAR':
      case 'RELATE':
      case 'BETA':
        {
        const values = numericArgs();
        if (args.length !== 3) {
          throw new Error(`${functionName} expects 3 arguments, got ${args.length}`);
        }
        const period = this.getConstantValue(values[2]);
        if (functionName === 'COVAR') {
          return statisticsFunctions.COVAR(values[0], values[1], period);
        }
        if (functionName === 'RELATE') {
          return statisticsFunctions.RELATE(values[0], values[1], period);
        }
        return statisticsFunctions.BETA(values[0], values[1], period);
        }

      case 'MEDIAN':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`MEDIAN expects 2 arguments, got ${args.length}`);
        }
        return statisticsFunctions.MEDIAN(values[0], this.getConstantValue(values[1]));
        }

      case 'AVEDEV':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`AVEDEV expects 2 arguments, got ${args.length}`);
        }
        return statisticsFunctions.AVEDEV(values[0], this.getConstantValue(values[1]));
        }

      case 'SMA':
        {
        const values = numericArgs();
        if (args.length !== 2 && args.length !== 3) {
          throw new Error(`SMA expects 2 or 3 arguments, got ${args.length}`);
        }
        if (args.length === 2) {
          return functions.MA(values[0], this.getConstantValue(values[1]));
        }
        return technicalFunctions.SMA(
          values[0],
          this.getConstantValue(values[1]),
          this.getConstantValue(values[2]),
        );
        }

      case 'WMA':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`WMA expects 2 arguments, got ${args.length}`);
        }
        return technicalFunctions.WMA(values[0], this.getConstantValue(values[1]));
        }

      case 'RSI':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`RSI expects 2 arguments, got ${args.length}`);
        }
        return technicalFunctions.RSI(values[0], this.getConstantValue(values[1]));
        }

      case 'DMA':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`DMA expects 2 arguments, got ${args.length}`);
        }
        return technicalFunctions.DMA(values[0], values[1]);
        }

      case 'CONST':
        {
        const values = numericArgs();
        if (args.length !== 1) {
          throw new Error(`CONST expects 1 argument, got ${args.length}`);
        }
        return technicalFunctions.CONST(values[0]);
        }

      // Market data functions
      case 'OPEN':
        if (args.length !== 0) {
          throw new Error(`OPEN expects 0 arguments, got ${args.length}`);
        }
        return marketDataFunctions.OPEN.execute([], this.context);

      case 'HIGH':
        if (args.length !== 0) {
          throw new Error(`HIGH expects 0 arguments, got ${args.length}`);
        }
        return marketDataFunctions.HIGH.execute([], this.context);

      case 'LOW':
        if (args.length !== 0) {
          throw new Error(`LOW expects 0 arguments, got ${args.length}`);
        }
        return marketDataFunctions.LOW.execute([], this.context);

      case 'CLOSE':
        if (args.length !== 0) {
          throw new Error(`CLOSE expects 0 arguments, got ${args.length}`);
        }
        return marketDataFunctions.CLOSE.execute([], this.context);

      case 'VOL':
        if (args.length !== 0) {
          throw new Error(`VOL expects 0 arguments, got ${args.length}`);
        }
        return marketDataFunctions.VOL.execute([], this.context);

      case 'AMOUNT':
        if (args.length !== 0) {
          throw new Error(`AMOUNT expects 0 arguments, got ${args.length}`);
        }
        return marketDataFunctions.AMOUNT.execute([], this.context);

      case 'ADVANCE':
        if (args.length !== 0) {
          throw new Error(`ADVANCE expects 0 arguments, got ${args.length}`);
        }
        return marketDataFunctions.ADVANCE.execute([], this.context);

      case 'DECLINE':
        if (args.length !== 0) {
          throw new Error(`DECLINE expects 0 arguments, got ${args.length}`);
        }
        return marketDataFunctions.DECLINE.execute([], this.context);

      // DateTime functions
      case 'DATE':
        if (args.length !== 0) {
          throw new Error(`DATE expects 0 arguments, got ${args.length}`);
        }
        return datetimeFunctions.DATE(this.context.getMarketDataField('TIMESTAMP'));

      case 'TIME':
        if (args.length !== 0) {
          throw new Error(`TIME expects 0 arguments, got ${args.length}`);
        }
        return datetimeFunctions.TIME(this.context.getMarketDataField('TIMESTAMP'));

      case 'YEAR':
        if (args.length !== 0) {
          throw new Error(`YEAR expects 0 arguments, got ${args.length}`);
        }
        return datetimeFunctions.YEAR(this.context.getMarketDataField('TIMESTAMP'));

      case 'MONTH':
        if (args.length !== 0) {
          throw new Error(`MONTH expects 0 arguments, got ${args.length}`);
        }
        return datetimeFunctions.MONTH(this.context.getMarketDataField('TIMESTAMP'));

      case 'DAY':
        if (args.length !== 0) {
          throw new Error(`DAY expects 0 arguments, got ${args.length}`);
        }
        return datetimeFunctions.DAY(this.context.getMarketDataField('TIMESTAMP'));

      case 'HOUR':
        if (args.length !== 0) {
          throw new Error(`HOUR expects 0 arguments, got ${args.length}`);
        }
        return datetimeFunctions.HOUR(this.context.getMarketDataField('TIMESTAMP'));

      case 'MINUTE':
        if (args.length !== 0) {
          throw new Error(`MINUTE expects 0 arguments, got ${args.length}`);
        }
        return datetimeFunctions.MINUTE(this.context.getMarketDataField('TIMESTAMP'));

      case 'WEEKDAY':
        if (args.length !== 0) {
          throw new Error(`WEEKDAY expects 0 arguments, got ${args.length}`);
        }
        return datetimeFunctions.WEEKDAY(this.context.getMarketDataField('TIMESTAMP'));

      // Period functions
      case 'PERIOD':
        if (args.length !== 0) {
          throw new Error(`PERIOD expects 0 arguments, got ${args.length}`);
        }
        return periodFunctions.PERIOD(this.context.getMarketDataField('TIMESTAMP'));

      case 'BARSCOUNT':
        if (args.length !== 0 && args.length !== 1) {
          throw new Error(`BARSCOUNT expects 0 or 1 arguments, got ${args.length}`);
        }
        if (args.length === 1) {
          return periodFunctions.BARSCOUNT(this.expectNumberArray(args[0], 'BARSCOUNT argument 1'));
        }
        return periodFunctions.BARSCOUNT(this.context.getDataLength());

      case 'CURRBARSCOUNT':
        if (args.length !== 0) {
          throw new Error(`CURRBARSCOUNT expects 0 arguments, got ${args.length}`);
        }
        return periodFunctions.CURRBARSCOUNT(this.context.getDataLength());

      case 'TOTALBARSCOUNT':
        if (args.length !== 0) {
          throw new Error(`TOTALBARSCOUNT expects 0 arguments, got ${args.length}`);
        }
        return periodFunctions.TOTALBARSCOUNT(this.context.getDataLength());

      case 'ISLASTBAR':
        if (args.length !== 0) {
          throw new Error(`ISLASTBAR expects 0 arguments, got ${args.length}`);
        }
        return periodFunctions.ISLASTBAR(this.context.getDataLength());

      case 'BARSTATUS':
        if (args.length !== 0) {
          throw new Error(`BARSTATUS expects 0 arguments, got ${args.length}`);
        }
        return this.barStatus();

      case 'BARSSINCE':
        {
        const values = numericArgs();
        if (args.length !== 1) {
          throw new Error(`BARSSINCE expects 1 argument, got ${args.length}`);
        }
        return periodFunctions.BARSSINCE(values[0]);
        }

      case 'SUMBARS':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`SUMBARS expects 2 arguments, got ${args.length}`);
        }
        return periodFunctions.SUMBARS(values[0], this.getConstantValue(values[1]));
        }

      // Pattern functions
      case 'UPNDAY':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`UPNDAY expects 2 arguments, got ${args.length}`);
        }
        const upndayN = this.getConstantValue(values[1]);
        return patternFunctions.UPNDAY(values[0], upndayN);
        }

      case 'DOWNNDAY':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`DOWNNDAY expects 2 arguments, got ${args.length}`);
        }
        const downndayN = this.getConstantValue(values[1]);
        return patternFunctions.DOWNNDAY(values[0], downndayN);
        }

      case 'NDAY':
        {
        const values = numericArgs();
        if (args.length !== 2 && args.length !== 3) {
          throw new Error(`NDAY expects 2 or 3 arguments, got ${args.length}`);
        }
        if (args.length === 3) {
          return patternFunctions.NDAY_AB(values[0], values[1], this.getConstantValue(values[2]));
        }
        const ndayN = this.getConstantValue(values[1]);
        return patternFunctions.NDAY(values[0], ndayN);
        }

      case 'LAST':
      case 'EXISTR':
        {
        const values = numericArgs();
        if (args.length !== 3) {
          throw new Error(`${functionName} expects 3 arguments, got ${args.length}`);
        }
        const from = this.getConstantValue(values[1]);
        const to = this.getConstantValue(values[2]);
        if (functionName === 'LAST') {
          return patternFunctions.LAST(values[0], from, to);
        }
        return patternFunctions.EXISTR(values[0], from, to);
        }

      case 'RANGE':
        {
        const values = numericArgs();
        if (args.length !== 3) {
          throw new Error(`RANGE expects 3 arguments, got ${args.length}`);
        }
        return patternFunctions.RANGE(values[0], values[1], values[2]);
        }

      case 'BETWEEN':
        {
        const values = numericArgs();
        if (args.length !== 3) {
          throw new Error(`BETWEEN expects 3 arguments, got ${args.length}`);
        }
        return patternFunctions.BETWEEN(values[0], values[1], values[2]);
        }

      // Chip distribution functions
      case 'WINNER':
        {
        const values = numericArgs();
        if (args.length < 3 || args.length > 4) {
          throw new Error(`WINNER expects 3-4 arguments, got ${args.length}`);
        }
        if (args.length === 4) {
          const winnerLookback = this.getConstantValue(values[3]);
          return chipFunctions.WINNER(values[0], values[1], values[2], winnerLookback);
        }
        return chipFunctions.WINNER(values[0], values[1], values[2]);
        }

      case 'LWINNER':
        {
        const values = numericArgs();
        if (args.length < 3 || args.length > 4) {
          throw new Error(`LWINNER expects 3-4 arguments, got ${args.length}`);
        }
        if (args.length === 4) {
          const lwinnerLookback = this.getConstantValue(values[3]);
          return chipFunctions.LWINNER(values[0], values[1], values[2], lwinnerLookback);
        }
        return chipFunctions.LWINNER(values[0], values[1], values[2]);
        }

      case 'COST':
        {
        const values = numericArgs();
        if (args.length < 3 || args.length > 4) {
          throw new Error(`COST expects 3-4 arguments, got ${args.length}`);
        }
        if (args.length === 4) {
          const costLookback = this.getConstantValue(values[3]);
          return chipFunctions.COST(values[0], values[1], values[2], costLookback);
        }
        return chipFunctions.COST(values[0], values[1], values[2]);
        }

      case 'VALUEWHEN':
        {
        const values = numericArgs();
        if (args.length !== 2) {
          throw new Error(`VALUEWHEN expects 2 arguments, got ${args.length}`);
        }
        return chipFunctions.VALUEWHEN(values[0], values[1]);
        }

      case 'TOPRANGE':
        {
        const values = numericArgs();
        if (args.length < 1 || args.length > 2) {
          throw new Error(`TOPRANGE expects 1-2 arguments, got ${args.length}`);
        }
        if (args.length === 2) {
          const toprangePeriod = this.getConstantValue(values[1]);
          return chipFunctions.TOPRANGE(values[0], toprangePeriod);
        }
        return chipFunctions.TOPRANGE(values[0]);
        }

      case 'LOWRANGE':
        {
        const values = numericArgs();
        if (args.length < 1 || args.length > 2) {
          throw new Error(`LOWRANGE expects 1-2 arguments, got ${args.length}`);
        }
        if (args.length === 2) {
          const lowrangePeriod = this.getConstantValue(values[1]);
          return chipFunctions.LOWRANGE(values[0], lowrangePeriod);
        }
        return chipFunctions.LOWRANGE(values[0]);
        }

      case 'DRAWTEXT':
        if (args.length !== 3) {
          throw new Error(`DRAWTEXT expects 3 arguments, got ${args.length}`);
        }
        return this.buildPointDrawings(functionName, args[0], args[1], undefined, args[2]);

      case 'DRAWICON':
      case 'DRAWNUMBER':
        if (args.length !== 3) {
          throw new Error(`${functionName} expects 3 arguments, got ${args.length}`);
        }
        return this.buildPointDrawings(functionName, args[0], args[1], args[2]);

      case 'STICKLINE':
        if (args.length !== 5) {
          throw new Error(`STICKLINE expects 5 arguments, got ${args.length}`);
        }
        return this.buildStickLineDrawings(args);

      case 'DRAWLINE':
        if (args.length !== 5) {
          throw new Error(`DRAWLINE expects 5 arguments, got ${args.length}`);
        }
        return this.buildDrawLineEvents(args);

      case 'POLYLINE':
        if (args.length !== 2) {
          throw new Error(`POLYLINE expects 2 arguments, got ${args.length}`);
        }
        return this.buildPointDrawings(functionName, args[0], args[1]);

      case 'DRAWBAND':
        if (args.length !== 4) {
          throw new Error(`DRAWBAND expects 4 arguments, got ${args.length}`);
        }
        return this.buildFullRangeDrawings(functionName, args, [
          'upper',
          'upperColor',
          'lower',
          'lowerColor',
        ]);

      case 'DRAWKLINE':
        if (args.length !== 4) {
          throw new Error(`DRAWKLINE expects 4 arguments, got ${args.length}`);
        }
        return this.buildFullRangeDrawings(functionName, args, ['high', 'open', 'low', 'close']);

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

  private isNumberArray(value: EvaluatedValue): value is number[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'number');
  }

  private isDrawingEventArray(value: EvaluatedValue): value is DrawingEventList {
    return (
      Array.isArray(value) &&
      (value as Partial<DrawingEventList>).__formulaDrawingEvents === true
    );
  }

  private markDrawingEvents(drawings: DrawingEvent[]): DrawingEventList {
    return Object.assign(drawings, { __formulaDrawingEvents: true as const });
  }

  private expectNumberArray(value: EvaluatedValue, label: string): number[] {
    if (!this.isNumberArray(value)) {
      throw new Error(`${label} must be numeric`);
    }
    return value;
  }

  private visitStringLiteral(node: StringLiteral): string {
    return node.value;
  }

  private isTruthy(value: number): boolean {
    return value !== 0 && !Number.isNaN(value);
  }

  private scalarOrArrayAt(value: number[], index: number): number {
    return index < value.length ? value[index] : NaN;
  }

  private textValueAt(value: EvaluatedValue, index: number): string {
    if (typeof value === 'string') {
      return value;
    }
    if (this.isNumberArray(value)) {
      return String(this.scalarOrArrayAt(value, index));
    }
    throw new Error('drawing text argument must be text or numeric');
  }

  private validateDrawingNumericArgs(
    functionName: string,
    length: number,
    values: EvaluatedValue[],
  ): number[][] {
    return values.map((value) => {
      const numeric = this.expectNumberArray(value, `${functionName} arguments`);
      if (numeric.length !== length) {
        throw new Error(`${functionName}: array length mismatch`);
      }
      return numeric;
    });
  }

  private drawingValueLength(functionName: string, values: EvaluatedValue[]): number {
    let length = 0;
    for (const value of values) {
      const numeric = this.expectNumberArray(value, `${functionName} arguments`);
      if (length === 0) {
        length = numeric.length;
      } else if (numeric.length !== length) {
        throw new Error(`${functionName}: array length mismatch`);
      }
    }
    return length || this.context.getDataLength();
  }

  private buildPointDrawings(
    functionName: string,
    conditionValue: EvaluatedValue,
    priceValue: EvaluatedValue,
    numericValue?: EvaluatedValue,
    textValue?: EvaluatedValue,
  ): DrawingEventList {
    const condition = this.expectNumberArray(conditionValue, `${functionName} first argument`);
    const numericArgs = numericValue === undefined ? [priceValue] : [priceValue, numericValue];
    const [price, numeric] = this.validateDrawingNumericArgs(functionName, condition.length, numericArgs);
    const drawings: DrawingEvent[] = [];

    for (let i = 0; i < condition.length; i++) {
      if (!this.isTruthy(condition[i])) {
        continue;
      }

      const event: DrawingEvent = {
        function: functionName,
        barIndex: i,
        values: {
          price: this.scalarOrArrayAt(price, i),
        },
      };

      if (numeric !== undefined) {
        event.values.value = this.scalarOrArrayAt(numeric, i);
      }
      if (textValue !== undefined) {
        event.text = this.textValueAt(textValue, i);
      }

      drawings.push(event);
    }

    return this.markDrawingEvents(drawings);
  }

  private buildStickLineDrawings(args: EvaluatedValue[]): DrawingEventList {
    const condition = this.expectNumberArray(args[0], 'STICKLINE first argument');
    const [price1, price2, width, empty] = this.validateDrawingNumericArgs(
      'STICKLINE',
      condition.length,
      args.slice(1),
    );
    const drawings: DrawingEvent[] = [];

    for (let i = 0; i < condition.length; i++) {
      if (!this.isTruthy(condition[i])) {
        continue;
      }
      drawings.push({
        function: 'STICKLINE',
        barIndex: i,
        values: {
          price1: this.scalarOrArrayAt(price1, i),
          price2: this.scalarOrArrayAt(price2, i),
          width: this.scalarOrArrayAt(width, i),
          empty: this.scalarOrArrayAt(empty, i),
        },
      });
    }

    return this.markDrawingEvents(drawings);
  }

  private buildDrawLineEvents(args: EvaluatedValue[]): DrawingEventList {
    const cond1 = this.expectNumberArray(args[0], 'DRAWLINE first argument');
    const cond2 = this.expectNumberArray(args[2], 'DRAWLINE third argument');
    if (cond1.length !== cond2.length) {
      throw new Error('DRAWLINE: condition array length mismatch');
    }

    const [price1, price2, expand] = this.validateDrawingNumericArgs(
      'DRAWLINE',
      cond1.length,
      [args[1], args[3], args[4]],
    );
    const drawings: DrawingEvent[] = [];
    let startIndex = -1;
    let startPrice = NaN;

    for (let i = 0; i < cond1.length; i++) {
      if (this.isTruthy(cond1[i])) {
        startIndex = i;
        startPrice = this.scalarOrArrayAt(price1, i);
      }
      if (startIndex < 0 || !this.isTruthy(cond2[i]) || i < startIndex) {
        continue;
      }

      drawings.push({
        function: 'DRAWLINE',
        barIndex: startIndex,
        values: {
          startBar: startIndex,
          startPrice,
          endBar: i,
          endPrice: this.scalarOrArrayAt(price2, i),
          expand: this.scalarOrArrayAt(expand, i),
        },
      });
      startIndex = -1;
      startPrice = NaN;
    }

    return this.markDrawingEvents(drawings);
  }

  private buildFullRangeDrawings(
    functionName: string,
    args: EvaluatedValue[],
    keys: string[],
  ): DrawingEventList {
    const length = this.drawingValueLength(functionName, args);
    const numericArgs = this.validateDrawingNumericArgs(functionName, length, args);
    const drawings: DrawingEvent[] = [];

    for (let i = 0; i < length; i++) {
      const values: Record<string, number> = {};
      for (let j = 0; j < keys.length; j++) {
        values[keys[j]] = this.scalarOrArrayAt(numericArgs[j], i);
      }
      drawings.push({
        function: functionName,
        barIndex: i,
        values,
      });
    }

    return this.markDrawingEvents(drawings);
  }

  private barStatus(): number[] {
    const length = this.context.getDataLength();
    const result = new Array(length).fill(2);
    if (length > 0) {
      result[0] = 1;
      result[length - 1] = length === 1 ? 1 : 3;
    }
    return result;
  }

  /**
   * Visit an identifier
   * @param node - Identifier node
   * @returns Evaluated value as number array
   */
  visitIdentifier(node: Identifier): number[] {
    const name = node.name;
    const upperName = name.toUpperCase();

    // Check if it's a market data function used as identifier (without parentheses)
    // These functions can be used as identifiers: OPEN, HIGH, LOW, CLOSE, VOL, AMOUNT, ADVANCE, DECLINE
    const marketDataFunctionNames = ['OPEN', 'HIGH', 'LOW', 'CLOSE', 'VOL', 'AMOUNT', 'ADVANCE', 'DECLINE'];
    if (marketDataFunctionNames.includes(upperName)) {
      switch (upperName) {
        case 'OPEN':
          return marketDataFunctions.OPEN.execute([], this.context);
        case 'HIGH':
          return marketDataFunctions.HIGH.execute([], this.context);
        case 'LOW':
          return marketDataFunctions.LOW.execute([], this.context);
        case 'CLOSE':
          return marketDataFunctions.CLOSE.execute([], this.context);
        case 'VOL':
          return marketDataFunctions.VOL.execute([], this.context);
        case 'AMOUNT':
          return marketDataFunctions.AMOUNT.execute([], this.context);
        case 'ADVANCE':
          return marketDataFunctions.ADVANCE.execute([], this.context);
        case 'DECLINE':
          return marketDataFunctions.DECLINE.execute([], this.context);
      }
    }

    // Check if it's a datetime function used as identifier (without parentheses)
    const datetimeFunctionNames = ['DATE', 'TIME', 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'WEEKDAY'];
    if (datetimeFunctionNames.includes(upperName)) {
      const timestamps = this.context.getMarketDataField('TIMESTAMP');
      switch (upperName) {
        case 'DATE':
          return datetimeFunctions.DATE(timestamps);
        case 'TIME':
          return datetimeFunctions.TIME(timestamps);
        case 'YEAR':
          return datetimeFunctions.YEAR(timestamps);
        case 'MONTH':
          return datetimeFunctions.MONTH(timestamps);
        case 'DAY':
          return datetimeFunctions.DAY(timestamps);
        case 'HOUR':
          return datetimeFunctions.HOUR(timestamps);
        case 'MINUTE':
          return datetimeFunctions.MINUTE(timestamps);
        case 'WEEKDAY':
          return datetimeFunctions.WEEKDAY(timestamps);
      }
    }

    // Check if it's a period function used as identifier (without parentheses)
    const periodFunctionNames = ['PERIOD', 'BARSCOUNT', 'ISLASTBAR'];
    if (periodFunctionNames.includes(upperName)) {
      switch (upperName) {
        case 'PERIOD':
          return periodFunctions.PERIOD(this.context.getMarketDataField('TIMESTAMP'));
        case 'BARSCOUNT':
          return periodFunctions.BARSCOUNT(this.context.getDataLength());
        case 'ISLASTBAR':
          return periodFunctions.ISLASTBAR(this.context.getDataLength());
      }
    }

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
