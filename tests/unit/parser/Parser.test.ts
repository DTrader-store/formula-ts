import { Parser } from '../../../src/parser/Parser';
import { Lexer } from '../../../src/lexer/Lexer';
import {
  NodeType,
  Program,
  VariableDeclaration,
  OutputDeclaration,
  BinaryExpression,
  UnaryExpression,
  FunctionCall,
  Identifier,
  NumberLiteral,
  BinaryOperator,
  UnaryOperator,
} from '../../../src/parser/ast/nodes';
import { ParserError } from '../../../src/errors';

/**
 * Helper function to parse a formula string
 */
function parse(input: string): Program {
  const lexer = new Lexer(input);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}

describe('Parser', () => {
  describe('Basic Structure', () => {
    test('should parse empty program', () => {
      const program = parse('');
      expect(program.type).toBe(NodeType.Program);
      expect(program.body).toEqual([]);
    });

    test('should parse program with only newlines', () => {
      const program = parse('\n\n\n');
      expect(program.type).toBe(NodeType.Program);
      expect(program.body).toEqual([]);
    });
  });

  describe('Number Literals', () => {
    test('should parse integer literal', () => {
      const program = parse('X: 42;');
      const output = program.body[0] as OutputDeclaration;
      const value = output.value as NumberLiteral;
      expect(value.type).toBe(NodeType.NumberLiteral);
      expect(value.value).toBe(42);
    });

    test('should parse floating point literal', () => {
      const program = parse('X: 3.14;');
      const output = program.body[0] as OutputDeclaration;
      const value = output.value as NumberLiteral;
      expect(value.type).toBe(NodeType.NumberLiteral);
      expect(value.value).toBe(3.14);
    });

    test('should parse decimal starting with dot', () => {
      const program = parse('X: .5;');
      const output = program.body[0] as OutputDeclaration;
      const value = output.value as NumberLiteral;
      expect(value.type).toBe(NodeType.NumberLiteral);
      expect(value.value).toBe(0.5);
    });
  });

  describe('Identifiers', () => {
    test('should parse identifier', () => {
      const program = parse('X: CLOSE;');
      const output = program.body[0] as OutputDeclaration;
      const value = output.value as Identifier;
      expect(value.type).toBe(NodeType.Identifier);
      expect(value.name).toBe('CLOSE');
    });

    test('should parse identifier with numbers', () => {
      const program = parse('X: VAR1;');
      const output = program.body[0] as OutputDeclaration;
      const value = output.value as Identifier;
      expect(value.type).toBe(NodeType.Identifier);
      expect(value.name).toBe('VAR1');
    });
  });

  describe('Variable Declaration', () => {
    test('should parse simple variable declaration', () => {
      const program = parse('VAR1 := 10;');
      expect(program.body.length).toBe(1);
      const varDecl = program.body[0] as VariableDeclaration;
      expect(varDecl.type).toBe(NodeType.VariableDeclaration);
      expect(varDecl.name).toBe('VAR1');
      expect((varDecl.value as NumberLiteral).value).toBe(10);
    });

    test('should parse variable declaration with expression', () => {
      const program = parse('VAR1 := CLOSE + 10;');
      const varDecl = program.body[0] as VariableDeclaration;
      expect(varDecl.type).toBe(NodeType.VariableDeclaration);
      expect(varDecl.name).toBe('VAR1');
      expect(varDecl.value.type).toBe(NodeType.BinaryExpression);
    });

    test('should parse multiple variable declarations', () => {
      const program = parse(`
        VAR1 := 10;
        VAR2 := 20;
        VAR3 := VAR1 + VAR2;
      `);
      expect(program.body.length).toBe(3);
      expect((program.body[0] as VariableDeclaration).name).toBe('VAR1');
      expect((program.body[1] as VariableDeclaration).name).toBe('VAR2');
      expect((program.body[2] as VariableDeclaration).name).toBe('VAR3');
    });

    test('should throw error on missing := in variable declaration', () => {
      expect(() => parse('VAR1 = 10;')).toThrow(ParserError);
    });

    test('should throw error on missing semicolon in variable declaration', () => {
      expect(() => parse('VAR1 := 10')).toThrow(ParserError);
    });
  });

  describe('Output Declaration', () => {
    test('should parse simple output declaration', () => {
      const program = parse('MA5: 10;');
      expect(program.body.length).toBe(1);
      const output = program.body[0] as OutputDeclaration;
      expect(output.type).toBe(NodeType.OutputDeclaration);
      expect(output.name).toBe('MA5');
      expect((output.value as NumberLiteral).value).toBe(10);
      expect(output.style).toBeUndefined();
    });

    test('should parse output declaration with color', () => {
      const program = parse('MA5: 10, COLORRED;');
      const output = program.body[0] as OutputDeclaration;
      expect(output.type).toBe(NodeType.OutputDeclaration);
      expect(output.name).toBe('MA5');
      expect(output.style?.color).toBe('COLORRED');
    });

    test('should parse output declaration with line thickness', () => {
      const program = parse('MA5: 10, LINETHICK2;');
      const output = program.body[0] as OutputDeclaration;
      expect(output.style?.size).toBe(2);
    });

    test('should parse output declaration with multiple style attributes', () => {
      const program = parse('MA5: 10, COLORRED, LINETHICK3;');
      const output = program.body[0] as OutputDeclaration;
      expect(output.style?.color).toBe('COLORRED');
      expect(output.style?.size).toBe(3);
    });

    test('should parse output declaration with DOTLINE', () => {
      const program = parse('MA5: 10, DOTLINE;');
      const output = program.body[0] as OutputDeclaration;
      expect(output.style?.italic).toBe(true);
    });

    test('should parse output declaration with STICK', () => {
      const program = parse('MA5: 10, STICK;');
      const output = program.body[0] as OutputDeclaration;
      expect(output.style?.bold).toBe(true);
    });

    test('should throw error on missing colon in output declaration', () => {
      expect(() => parse('MA5 = 10;')).toThrow(ParserError);
    });

    test('should throw error on missing semicolon in output declaration', () => {
      expect(() => parse('MA5: 10')).toThrow(ParserError);
    });
  });

  describe('Binary Expressions', () => {
    test('should parse addition', () => {
      const program = parse('X: 1 + 2;');
      const output = program.body[0] as OutputDeclaration;
      const expr = output.value as BinaryExpression;
      expect(expr.type).toBe(NodeType.BinaryExpression);
      expect(expr.operator).toBe(BinaryOperator.Plus);
      expect((expr.left as NumberLiteral).value).toBe(1);
      expect((expr.right as NumberLiteral).value).toBe(2);
    });

    test('should parse subtraction', () => {
      const program = parse('X: 10 - 3;');
      const output = program.body[0] as OutputDeclaration;
      const expr = output.value as BinaryExpression;
      expect(expr.operator).toBe(BinaryOperator.Minus);
    });

    test('should parse multiplication', () => {
      const program = parse('X: 5 * 4;');
      const output = program.body[0] as OutputDeclaration;
      const expr = output.value as BinaryExpression;
      expect(expr.operator).toBe(BinaryOperator.Multiply);
    });

    test('should parse division', () => {
      const program = parse('X: 20 / 4;');
      const output = program.body[0] as OutputDeclaration;
      const expr = output.value as BinaryExpression;
      expect(expr.operator).toBe(BinaryOperator.Divide);
    });

    test('should parse comparison operators', () => {
      const operators = [
        ['>', BinaryOperator.GreaterThan],
        ['<', BinaryOperator.LessThan],
        ['>=', BinaryOperator.GreaterThanOrEqual],
        ['<=', BinaryOperator.LessThanOrEqual],
        ['=', BinaryOperator.Equal],
        ['<>', BinaryOperator.NotEqual],
      ];

      operators.forEach(([op, expectedOp]) => {
        const program = parse(`X: A ${op} B;`);
        const output = program.body[0] as OutputDeclaration;
        const expr = output.value as BinaryExpression;
        expect(expr.operator).toBe(expectedOp);
      });
    });

    test('should parse logical operators', () => {
      const program1 = parse('X: A AND B;');
      const expr1 = (program1.body[0] as OutputDeclaration).value as BinaryExpression;
      expect(expr1.operator).toBe(BinaryOperator.And);

      const program2 = parse('X: A OR B;');
      const expr2 = (program2.body[0] as OutputDeclaration).value as BinaryExpression;
      expect(expr2.operator).toBe(BinaryOperator.Or);
    });

    test('should handle operator precedence: multiplication before addition', () => {
      const program = parse('X: 1 + 2 * 3;');
      const output = program.body[0] as OutputDeclaration;
      const expr = output.value as BinaryExpression;

      // Should be parsed as: 1 + (2 * 3)
      expect(expr.operator).toBe(BinaryOperator.Plus);
      expect((expr.left as NumberLiteral).value).toBe(1);
      expect((expr.right as BinaryExpression).operator).toBe(BinaryOperator.Multiply);
    });

    test('should handle operator precedence: addition before comparison', () => {
      const program = parse('X: 1 + 2 > 3;');
      const output = program.body[0] as OutputDeclaration;
      const expr = output.value as BinaryExpression;

      // Should be parsed as: (1 + 2) > 3
      expect(expr.operator).toBe(BinaryOperator.GreaterThan);
      expect((expr.left as BinaryExpression).operator).toBe(BinaryOperator.Plus);
    });

    test('should handle operator precedence: comparison before logical', () => {
      const program = parse('X: A > B AND C < D;');
      const output = program.body[0] as OutputDeclaration;
      const expr = output.value as BinaryExpression;

      // Should be parsed as: (A > B) AND (C < D)
      expect(expr.operator).toBe(BinaryOperator.And);
      expect((expr.left as BinaryExpression).operator).toBe(BinaryOperator.GreaterThan);
      expect((expr.right as BinaryExpression).operator).toBe(BinaryOperator.LessThan);
    });

    test('should parse parenthesized expressions', () => {
      const program = parse('X: (1 + 2) * 3;');
      const output = program.body[0] as OutputDeclaration;
      const expr = output.value as BinaryExpression;

      // Should be parsed as: (1 + 2) * 3
      expect(expr.operator).toBe(BinaryOperator.Multiply);
      expect((expr.left as BinaryExpression).operator).toBe(BinaryOperator.Plus);
      expect((expr.right as NumberLiteral).value).toBe(3);
    });

    test('should parse nested parentheses', () => {
      const program = parse('X: ((1 + 2) * (3 + 4));');
      const output = program.body[0] as OutputDeclaration;
      const expr = output.value as BinaryExpression;
      expect(expr.operator).toBe(BinaryOperator.Multiply);
      expect((expr.left as BinaryExpression).operator).toBe(BinaryOperator.Plus);
      expect((expr.right as BinaryExpression).operator).toBe(BinaryOperator.Plus);
    });
  });

  describe('Unary Expressions', () => {
    test('should parse unary minus', () => {
      const program = parse('X: -5;');
      const output = program.body[0] as OutputDeclaration;
      const expr = output.value as UnaryExpression;
      expect(expr.type).toBe(NodeType.UnaryExpression);
      expect(expr.operator).toBe(UnaryOperator.Minus);
      expect((expr.operand as NumberLiteral).value).toBe(5);
    });

    test('should parse unary minus with expression', () => {
      const program = parse('X: -(A + B);');
      const output = program.body[0] as OutputDeclaration;
      const expr = output.value as UnaryExpression;
      expect(expr.operator).toBe(UnaryOperator.Minus);
      expect((expr.operand as BinaryExpression).operator).toBe(BinaryOperator.Plus);
    });

    test('should parse double unary minus', () => {
      const program = parse('X: --5;');
      const output = program.body[0] as OutputDeclaration;
      const expr = output.value as UnaryExpression;
      expect(expr.operator).toBe(UnaryOperator.Minus);
      expect((expr.operand as UnaryExpression).operator).toBe(UnaryOperator.Minus);
    });
  });

  describe('Function Calls', () => {
    test('should parse function call without arguments', () => {
      const program = parse('X: DATE();');
      const output = program.body[0] as OutputDeclaration;
      const call = output.value as FunctionCall;
      expect(call.type).toBe(NodeType.FunctionCall);
      expect(call.name).toBe('DATE');
      expect(call.arguments.length).toBe(0);
    });

    test('should parse function call with one argument', () => {
      const program = parse('X: ABS(5);');
      const output = program.body[0] as OutputDeclaration;
      const call = output.value as FunctionCall;
      expect(call.name).toBe('ABS');
      expect(call.arguments.length).toBe(1);
      expect((call.arguments[0] as NumberLiteral).value).toBe(5);
    });

    test('should parse function call with multiple arguments', () => {
      const program = parse('X: MA(CLOSE, 5);');
      const output = program.body[0] as OutputDeclaration;
      const call = output.value as FunctionCall;
      expect(call.name).toBe('MA');
      expect(call.arguments.length).toBe(2);
      expect((call.arguments[0] as Identifier).name).toBe('CLOSE');
      expect((call.arguments[1] as NumberLiteral).value).toBe(5);
    });

    test('should parse nested function calls', () => {
      const program = parse('X: MA(EMA(CLOSE, 12), 5);');
      const output = program.body[0] as OutputDeclaration;
      const call = output.value as FunctionCall;
      expect(call.name).toBe('MA');
      const nestedCall = call.arguments[0] as FunctionCall;
      expect(nestedCall.type).toBe(NodeType.FunctionCall);
      expect(nestedCall.name).toBe('EMA');
    });

    test('should parse function call with expression arguments', () => {
      const program = parse('X: MAX(A + B, C * D);');
      const output = program.body[0] as OutputDeclaration;
      const call = output.value as FunctionCall;
      expect(call.name).toBe('MAX');
      expect((call.arguments[0] as BinaryExpression).operator).toBe(BinaryOperator.Plus);
      expect((call.arguments[1] as BinaryExpression).operator).toBe(BinaryOperator.Multiply);
    });

    test('should parse IF as function call', () => {
      const program = parse('X: IF(A > B, 1, 0);');
      const output = program.body[0] as OutputDeclaration;
      const call = output.value as FunctionCall;
      expect(call.type).toBe(NodeType.FunctionCall);
      expect(call.name).toBe('IF');
      expect(call.arguments.length).toBe(3);
    });

    test('should throw error on unclosed function call', () => {
      expect(() => parse('X: MA(CLOSE, 5;')).toThrow(ParserError);
    });

    test('should throw error on missing comma in function arguments', () => {
      expect(() => parse('X: MA(CLOSE 5);')).toThrow(ParserError);
    });
  });

  describe('Complex Expressions', () => {
    test('should parse expression with mixed operators', () => {
      const program = parse('X: A + B * C - D / E;');
      const output = program.body[0] as OutputDeclaration;
      const expr = output.value as BinaryExpression;
      // ((A + (B * C)) - (D / E))
      expect(expr.operator).toBe(BinaryOperator.Minus);
    });

    test('should parse function call in binary expression', () => {
      const program = parse('X: MA(CLOSE, 5) > MA(CLOSE, 10);');
      const output = program.body[0] as OutputDeclaration;
      const expr = output.value as BinaryExpression;
      expect(expr.operator).toBe(BinaryOperator.GreaterThan);
      expect((expr.left as FunctionCall).name).toBe('MA');
      expect((expr.right as FunctionCall).name).toBe('MA');
    });

    test('should parse deeply nested expression', () => {
      const program = parse('X: ((A + B) * (C - D)) / (E + F);');
      const output = program.body[0] as OutputDeclaration;
      const expr = output.value as BinaryExpression;
      expect(expr.operator).toBe(BinaryOperator.Divide);
    });
  });

  describe('Classic Formulas', () => {
    test('should parse MA formula', () => {
      const program = parse(`
        MA5: MA(CLOSE, 5), COLORWHITE;
        MA10: MA(CLOSE, 10), COLORYELLOW;
        MA20: MA(CLOSE, 20), COLORPINK;
      `);
      expect(program.body.length).toBe(3);

      const ma5 = program.body[0] as OutputDeclaration;
      expect(ma5.name).toBe('MA5');
      expect((ma5.value as FunctionCall).name).toBe('MA');
      expect(ma5.style?.color).toBe('COLORWHITE');

      const ma10 = program.body[1] as OutputDeclaration;
      expect(ma10.name).toBe('MA10');
      expect(ma10.style?.color).toBe('COLORYELLOW');

      const ma20 = program.body[2] as OutputDeclaration;
      expect(ma20.name).toBe('MA20');
      expect(ma20.style?.color).toBe('COLORPINK');
    });

    test('should parse MACD formula', () => {
      const program = parse(`
        DIF: EMA(CLOSE, 12) - EMA(CLOSE, 26), COLORWHITE;
        DEA: EMA(DIF, 9), COLORYELLOW;
        MACD: (DIF - DEA) * 2, STICK;
      `);
      expect(program.body.length).toBe(3);

      const dif = program.body[0] as OutputDeclaration;
      expect(dif.name).toBe('DIF');
      const difExpr = dif.value as BinaryExpression;
      expect(difExpr.operator).toBe(BinaryOperator.Minus);

      const dea = program.body[1] as OutputDeclaration;
      expect(dea.name).toBe('DEA');
      const deaCall = dea.value as FunctionCall;
      expect(deaCall.name).toBe('EMA');
      expect((deaCall.arguments[0] as Identifier).name).toBe('DIF');

      const macd = program.body[2] as OutputDeclaration;
      expect(macd.name).toBe('MACD');
      expect(macd.style?.bold).toBe(true);
    });

    test('should parse KDJ formula', () => {
      const program = parse(`
        RSV: (CLOSE - LLV(LOW, 9)) / (HHV(HIGH, 9) - LLV(LOW, 9)) * 100;
        K: SMA(RSV, 3, 1), COLORWHITE;
        D: SMA(K, 3, 1), COLORYELLOW;
        J: 3 * K - 2 * D, COLORPINK;
      `);
      expect(program.body.length).toBe(4);

      const rsv = program.body[0] as VariableDeclaration;
      expect(rsv.name).toBe('RSV');
      expect(rsv.value.type).toBe(NodeType.BinaryExpression);

      const k = program.body[1] as OutputDeclaration;
      expect(k.name).toBe('K');
      const kCall = k.value as FunctionCall;
      expect(kCall.name).toBe('SMA');

      const j = program.body[3] as OutputDeclaration;
      expect(j.name).toBe('J');
      const jExpr = j.value as BinaryExpression;
      expect(jExpr.operator).toBe(BinaryOperator.Minus);
    });

    test('should parse formula with IF function', () => {
      const program = parse(`
        SIGNAL: IF(MA(CLOSE, 5) > MA(CLOSE, 10), 1, 0);
      `);
      const signal = program.body[0] as OutputDeclaration;
      expect(signal.name).toBe('SIGNAL');
      const ifCall = signal.value as FunctionCall;
      expect(ifCall.name).toBe('IF');
      expect(ifCall.arguments.length).toBe(3);
    });
  });

  describe('Error Handling', () => {
    test('should throw error on unexpected token', () => {
      expect(() => parse('X: @ + 5;')).toThrow();
    });

    test('should throw error on missing expression', () => {
      expect(() => parse('X: ;')).toThrow(ParserError);
    });

    test('should throw error on mismatched parentheses', () => {
      expect(() => parse('X: (1 + 2;')).toThrow(ParserError);
      expect(() => parse('X: 1 + 2);')).toThrow(ParserError);
    });

    test('should throw error on incomplete binary expression', () => {
      expect(() => parse('X: 1 +;')).toThrow(ParserError);
    });

    test('should throw error on invalid identifier', () => {
      expect(() => parse('123ABC: 10;')).toThrow();
    });

    test('should provide meaningful error messages', () => {
      try {
        parse('X: MA(CLOSE, );');
        fail('Should have thrown error');
      } catch (e) {
        expect(e).toBeInstanceOf(ParserError);
        expect((e as ParserError).message).toContain('Parser error');
      }
    });
  });

  describe('Whitespace and Comments', () => {
    test('should handle multiple newlines', () => {
      const program = parse(`

        MA5: MA(CLOSE, 5);


        MA10: MA(CLOSE, 10);

      `);
      expect(program.body.length).toBe(2);
    });

    test('should handle single-line comments', () => {
      const program = parse(`
        // This is a comment
        MA5: MA(CLOSE, 5);
        MA10: MA(CLOSE, 10); // Another comment
      `);
      expect(program.body.length).toBe(2);
    });

    test('should handle block comments', () => {
      const program = parse(`
        { This is a
          multi-line
          block comment }
        MA5: MA(CLOSE, 5);
      `);
      expect(program.body.length).toBe(1);
    });

    test('should handle mixed spacing', () => {
      const program = parse('MA5:MA(CLOSE,5);');
      const output = program.body[0] as OutputDeclaration;
      expect(output.name).toBe('MA5');
      const call = output.value as FunctionCall;
      expect(call.arguments.length).toBe(2);
    });
  });
});
