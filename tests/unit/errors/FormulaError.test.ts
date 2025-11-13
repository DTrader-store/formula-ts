import {
  FormulaError,
  LexerError,
  ParserError,
  RuntimeError,
} from '../../../src/errors';

describe('FormulaError', () => {
  describe('Base FormulaError class', () => {
    it('should create a FormulaError instance with message', () => {
      const error = new FormulaError('Test error');
      expect(error).toBeInstanceOf(FormulaError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('FormulaError');
    });

    it('should preserve stack trace', () => {
      const error = new FormulaError('Test error');
      expect(error.stack).toBeDefined();
    });
  });

  describe('LexerError', () => {
    it('should create a LexerError with message, line, and column', () => {
      const error = new LexerError('Invalid token', 1, 5);
      expect(error).toBeInstanceOf(LexerError);
      expect(error).toBeInstanceOf(FormulaError);
      expect(error.message).toBe('Lexer error at line 1, column 5: Invalid token');
      expect(error.name).toBe('LexerError');
      expect(error.line).toBe(1);
      expect(error.column).toBe(5);
    });

    it('should include optional character in message', () => {
      const error = new LexerError('Unexpected character', 2, 10, '$');
      expect(error.message).toBe(
        'Lexer error at line 2, column 10: Unexpected character (char: $)'
      );
      expect(error.char).toBe('$');
    });

    it('should work without optional character', () => {
      const error = new LexerError('Invalid syntax', 3, 7);
      expect(error.char).toBeUndefined();
      expect(error.message).not.toContain('char:');
    });

    it('should have correct error properties', () => {
      const error = new LexerError('Test', 5, 15, 'x');
      expect(error.line).toBe(5);
      expect(error.column).toBe(15);
      expect(error.char).toBe('x');
    });
  });

  describe('ParserError', () => {
    it('should create a ParserError with message, line, and column', () => {
      const error = new ParserError('Expected closing parenthesis', 1, 10);
      expect(error).toBeInstanceOf(ParserError);
      expect(error).toBeInstanceOf(FormulaError);
      expect(error.message).toBe(
        'Parser error at line 1, column 10: Expected closing parenthesis'
      );
      expect(error.name).toBe('ParserError');
      expect(error.line).toBe(1);
      expect(error.column).toBe(10);
    });

    it('should work with different line and column values', () => {
      const error = new ParserError('Unexpected token', 5, 20);
      expect(error.message).toBe('Parser error at line 5, column 20: Unexpected token');
      expect(error.line).toBe(5);
      expect(error.column).toBe(20);
    });

    it('should have correct error properties', () => {
      const error = new ParserError('Syntax error', 2, 8);
      expect(error.line).toBe(2);
      expect(error.column).toBe(8);
    });
  });

  describe('RuntimeError', () => {
    it('should create a RuntimeError with message', () => {
      const error = new RuntimeError('Division by zero');
      expect(error).toBeInstanceOf(RuntimeError);
      expect(error).toBeInstanceOf(FormulaError);
      expect(error.message).toBe('Runtime error: Division by zero');
      expect(error.name).toBe('RuntimeError');
    });

    it('should work with various error messages', () => {
      const error = new RuntimeError('Undefined variable');
      expect(error.message).toBe('Runtime error: Undefined variable');
    });

    it('should have no line or column properties', () => {
      const error = new RuntimeError('Error');
      expect((error as any).line).toBeUndefined();
      expect((error as any).column).toBeUndefined();
    });
  });

  describe('Error type checking', () => {
    it('should properly distinguish between error types', () => {
      const lexerError = new LexerError('Lex', 1, 1);
      const parserError = new ParserError('Parse', 1, 1);
      const runtimeError = new RuntimeError('Runtime');

      expect(lexerError instanceof LexerError).toBe(true);
      expect(lexerError instanceof ParserError).toBe(false);
      expect(lexerError instanceof RuntimeError).toBe(false);

      expect(parserError instanceof ParserError).toBe(true);
      expect(parserError instanceof LexerError).toBe(false);
      expect(parserError instanceof RuntimeError).toBe(false);

      expect(runtimeError instanceof RuntimeError).toBe(true);
      expect(runtimeError instanceof LexerError).toBe(false);
      expect(runtimeError instanceof ParserError).toBe(false);
    });

    it('should all be instances of FormulaError', () => {
      const lexerError = new LexerError('Lex', 1, 1);
      const parserError = new ParserError('Parse', 1, 1);
      const runtimeError = new RuntimeError('Runtime');

      expect(lexerError instanceof FormulaError).toBe(true);
      expect(parserError instanceof FormulaError).toBe(true);
      expect(runtimeError instanceof FormulaError).toBe(true);
    });
  });

  describe('Error thrown and caught', () => {
    it('should be throwable and catchable as FormulaError', () => {
      expect(() => {
        throw new LexerError('Test', 1, 1);
      }).toThrow(FormulaError);
    });

    it('should be throwable and catchable with specific type', () => {
      expect(() => {
        throw new ParserError('Test', 1, 1);
      }).toThrow(ParserError);
    });

    it('should preserve error information when caught', () => {
      try {
        throw new LexerError('Unexpected character', 3, 7, '@');
      } catch (error) {
        expect(error).toBeInstanceOf(LexerError);
        const lexerError = error as LexerError;
        expect(lexerError.line).toBe(3);
        expect(lexerError.column).toBe(7);
        expect(lexerError.char).toBe('@');
        expect(lexerError.message).toContain('line 3, column 7');
      }
    });
  });
});
