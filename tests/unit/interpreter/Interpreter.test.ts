import { ExecutionContext } from '../../../src/interpreter/Context';
import { Interpreter } from '../../../src/interpreter/Interpreter';
import { FunctionRegistry } from '../../../src/interpreter/FunctionRegistry';
import { registerBuiltinFunctions } from '../../../src/interpreter/functions';
import { MarketData } from '../../../src/types/MarketData';
import { Parser } from '../../../src/parser/Parser';
import { Lexer } from '../../../src/lexer/Lexer';
import { Program } from '../../../src/parser/ast/nodes';

/**
 * Helper function to parse a formula string
 */
function parse(input: string): Program {
  const lexer = new Lexer(input);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}

describe('Interpreter', () => {
  let marketData: MarketData[];
  let functionRegistry: FunctionRegistry;
  let context: ExecutionContext;
  let interpreter: Interpreter;

  beforeEach(() => {
    // Create sample market data
    const baseTimestamp = new Date('2024-01-02T09:30:00.000Z').getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    marketData = [
      { open: 100, close: 105, high: 110, low: 95, volume: 1000, timestamp: baseTimestamp },
      { open: 105, close: 108, high: 112, low: 103, volume: 1200, timestamp: baseTimestamp + dayMs },
      { open: 108, close: 106, high: 109, low: 104, volume: 1100, timestamp: baseTimestamp + 2 * dayMs },
      { open: 106, close: 110, high: 115, low: 105, volume: 1300, timestamp: baseTimestamp + 3 * dayMs },
      { open: 110, close: 112, high: 116, low: 108, volume: 1400, timestamp: baseTimestamp + 4 * dayMs },
    ];

    // Create function registry and register built-in functions
    functionRegistry = new FunctionRegistry();
    registerBuiltinFunctions(functionRegistry);

    // Create execution context and interpreter
    context = new ExecutionContext(marketData, functionRegistry);
    interpreter = new Interpreter(context);
  });

  describe('Number Literals', () => {
    test('should evaluate number literal', () => {
      const program = parse('X: 42;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([42, 42, 42, 42, 42]);
    });
  });

  describe('Identifiers', () => {
    test('should evaluate CLOSE', () => {
      const program = parse('X: CLOSE;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([105, 108, 106, 110, 112]);
    });

    test('should evaluate OPEN', () => {
      const program = parse('X: OPEN;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([100, 105, 108, 106, 110]);
    });

    test('should evaluate HIGH', () => {
      const program = parse('X: HIGH;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([110, 112, 109, 115, 116]);
    });

    test('should evaluate LOW', () => {
      const program = parse('X: LOW;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([95, 103, 104, 105, 108]);
    });

    test('should evaluate VOLUME', () => {
      const program = parse('X: VOLUME;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([1000, 1200, 1100, 1300, 1400]);
    });

    test('should throw error for undefined identifier', () => {
      const program = parse('X: UNKNOWN;');
      expect(() => interpreter.visitProgram(program)).toThrow('Undefined identifier: UNKNOWN');
    });
  });

  describe('Binary Expressions', () => {
    test('should evaluate addition', () => {
      const program = parse('X: 10 + 5;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([15, 15, 15, 15, 15]);
    });

    test('should evaluate subtraction', () => {
      const program = parse('X: 10 - 3;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([7, 7, 7, 7, 7]);
    });

    test('should evaluate multiplication', () => {
      const program = parse('X: 4 * 3;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([12, 12, 12, 12, 12]);
    });

    test('should evaluate division', () => {
      const program = parse('X: 20 / 4;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([5, 5, 5, 5, 5]);
    });

    test('should evaluate comparison - equal', () => {
      const program = parse('X: 5 = 5;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([1, 1, 1, 1, 1]);
    });

    test('should evaluate comparison - not equal', () => {
      const program = parse('X: 5 <> 3;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([1, 1, 1, 1, 1]);
    });

    test('should evaluate comparison - greater than', () => {
      const program = parse('X: 5 > 3;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([1, 1, 1, 1, 1]);
    });

    test('should evaluate comparison - less than', () => {
      const program = parse('X: 3 < 5;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([1, 1, 1, 1, 1]);
    });

    test('should evaluate logical AND', () => {
      const program = parse('X: 1 AND 1;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([1, 1, 1, 1, 1]);
    });

    test('should evaluate logical OR', () => {
      const program = parse('X: 0 OR 1;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([1, 1, 1, 1, 1]);
    });

    test('should evaluate expressions with market data', () => {
      const program = parse('X: CLOSE + OPEN;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      // CLOSE + OPEN = [105+100, 108+105, 106+108, 110+106, 112+110]
      expect(result).toEqual([205, 213, 214, 216, 222]);
    });
  });

  describe('Unary Expressions', () => {
    test('should evaluate unary minus', () => {
      const program = parse('X: -5;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([-5, -5, -5, -5, -5]);
    });
  });

  describe('Function Calls', () => {
    test('should evaluate MA', () => {
      const program = parse('X: MA(CLOSE, 3);');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');

      expect(result![0]).toBeNaN();
      expect(result![1]).toBeNaN();
      expect(result![2]).toBeCloseTo((105 + 108 + 106) / 3, 10);
      expect(result![3]).toBeCloseTo((108 + 106 + 110) / 3, 10);
      expect(result![4]).toBeCloseTo((106 + 110 + 112) / 3, 10);
    });

    test('should evaluate SUM', () => {
      const program = parse('X: SUM(VOLUME, 2);');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');

      expect(result![0]).toBeNaN();
      expect(result![1]).toBe(2200);
      expect(result![2]).toBe(2300);
      expect(result![3]).toBe(2400);
      expect(result![4]).toBe(2700);
    });

    test('should evaluate MAX', () => {
      const program = parse('X: MAX(CLOSE, OPEN);');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([105, 108, 108, 110, 112]);
    });

    test('should evaluate MIN', () => {
      const program = parse('X: MIN(CLOSE, OPEN);');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      expect(result).toEqual([100, 105, 106, 106, 110]);
    });

    test('should evaluate REF', () => {
      const program = parse('X: REF(CLOSE, 1);');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');

      expect(result![0]).toBeNaN();
      expect(result![1]).toBe(105);
      expect(result![2]).toBe(108);
      expect(result![3]).toBe(106);
      expect(result![4]).toBe(110);
    });

    test('should evaluate IF', () => {
      const program = parse('X: IF(CLOSE > OPEN, 1, 0);');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');

      // CLOSE = [105, 108, 106, 110, 112]
      // OPEN  = [100, 105, 108, 106, 110]
      // Result: [1, 1, 0, 1, 1]
      expect(result).toEqual([1, 1, 0, 1, 1]);
    });

    test('should throw error for unknown functions', () => {
      const program = parse('X: UNKNOWN_FUNC();');
      expect(() => interpreter.visitProgram(program)).toThrow('Unknown function: UNKNOWN_FUNC');
    });
  });

  describe('Variable Declarations', () => {
    test('should evaluate and store variable declarations', () => {
      const program = parse('MYVAR := CLOSE + 10; X: MYVAR;');
      interpreter.visitProgram(program);

      const storedValue = context.getVariable('MYVAR');
      const output = context.getOutput('X');

      expect(storedValue).toEqual([115, 118, 116, 120, 122]);
      expect(output).toEqual([115, 118, 116, 120, 122]);
    });

    test('should allow referencing previously declared variables', () => {
      const program = parse('X := CLOSE; Y := X + 10; Z: Y;');
      interpreter.visitProgram(program);

      const y = context.getVariable('Y');
      const z = context.getOutput('Z');

      expect(y).toEqual([115, 118, 116, 120, 122]);
      expect(z).toEqual([115, 118, 116, 120, 122]);
    });
  });

  describe('Output Declarations', () => {
    test('should evaluate and store output declarations', () => {
      const program = parse('RESULT: CLOSE * 2;');
      interpreter.visitProgram(program);

      const storedOutput = context.getOutput('RESULT');
      expect(storedOutput).toEqual([210, 216, 212, 220, 224]);
    });
  });

  describe('Complete Programs', () => {
    test('should execute a simple program with variables and outputs', () => {
      const program = parse(`
        MA5 := MA(CLOSE, 3);
        RESULT: MA5;
      `);
      interpreter.visitProgram(program);

      const ma5 = context.getVariable('MA5');
      const result = context.getOutput('RESULT');

      expect(ma5).toBeDefined();
      expect(result).toBeDefined();
      expect(result).toEqual(ma5);
    });

    test('should execute a complex program with multiple operations', () => {
      const program = parse(`
        MA3 := MA(CLOSE, 3);
        DIFF := CLOSE - MA3;
        SIGNAL: IF(DIFF > 0, 1, -1);
      `);

      interpreter.visitProgram(program);

      const signal = context.getOutput('SIGNAL');
      expect(signal).toBeDefined();
      expect(signal).toHaveLength(5);

      // Check that signal only contains 1 or -1 (or NaN for insufficient data)
      signal!.forEach((value) => {
        if (!isNaN(value)) {
          expect([1, -1]).toContain(value);
        }
      });
    });

    test('should execute a program calculating MACD-like indicator', () => {
      const program = parse(`
        EMA12 := EMA(CLOSE, 3);
        EMA26 := EMA(CLOSE, 2);
        MACD: EMA12 - EMA26;
      `);

      interpreter.visitProgram(program);

      const macd = context.getOutput('MACD');
      expect(macd).toBeDefined();
      expect(macd).toHaveLength(5);
    });

    test('should execute a program with range calculations', () => {
      const program = parse(`
        RANGE := HIGH - LOW;
        AVGRANGE := MA(RANGE, 3);
        RELRANGE: RANGE / AVGRANGE;
      `);

      interpreter.visitProgram(program);

      const range = context.getVariable('RANGE');
      const relRange = context.getOutput('RELRANGE');

      // range = HIGH - LOW = [110-95, 112-103, 109-104, 115-105, 116-108]
      expect(range).toEqual([15, 9, 5, 10, 8]);

      expect(relRange).toBeDefined();
      expect(relRange).toHaveLength(5);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty program', () => {
      const program = parse('');
      expect(() => interpreter.visitProgram(program)).not.toThrow();
    });

    test('should handle division by zero', () => {
      const program = parse('X: 10 / 0;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');
      // Division by zero should result in Infinity
      expect(result).toEqual([Infinity, Infinity, Infinity, Infinity, Infinity]);
    });

    test('should handle NaN propagation', () => {
      // Create a variable with NaN values
      context.setVariable('NANVAR', [NaN, NaN, 1, 2, 3]);

      const program = parse('X: NANVAR + 10;');
      interpreter.visitProgram(program);

      const result = context.getOutput('X');

      expect(result![0]).toBeNaN();
      expect(result![1]).toBeNaN();
      expect(result![2]).toBe(11);
      expect(result![3]).toBe(12);
      expect(result![4]).toBe(13);
    });
  });
});
