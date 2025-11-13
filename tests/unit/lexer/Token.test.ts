import { Token } from '../../../src/lexer/Token';
import { TokenType } from '../../../src/lexer/TokenType';

describe('Token', () => {
  describe('constructor', () => {
    it('should create a token with correct properties', () => {
      const token = new Token(TokenType.NUMBER, '42', 1, 5);

      expect(token.type).toBe(TokenType.NUMBER);
      expect(token.value).toBe('42');
      expect(token.line).toBe(1);
      expect(token.column).toBe(5);
    });

    it('should create tokens with all token types', () => {
      const tokenTypes = Object.values(TokenType);

      tokenTypes.forEach((type) => {
        const token = new Token(type, 'test', 1, 1);
        expect(token.type).toBe(type);
      });
    });
  });

  describe('toString', () => {
    it('should return a readable string representation', () => {
      const token = new Token(TokenType.PLUS, '+', 2, 10);
      expect(token.toString()).toBe(
        'Token(PLUS, "+", 2:10)',
      );
    });

    it('should handle identifiers', () => {
      const token = new Token(TokenType.IDENTIFIER, 'myVar', 5, 3);
      expect(token.toString()).toBe(
        'Token(IDENTIFIER, "myVar", 5:3)',
      );
    });

    it('should handle special characters in value', () => {
      const token = new Token(TokenType.IDENTIFIER, 'test"quote', 1, 1);
      expect(token.toString()).toContain('test\\"quote');
    });
  });

  describe('equals', () => {
    it('should return true for identical tokens', () => {
      const token1 = new Token(TokenType.NUMBER, '42', 1, 5);
      const token2 = new Token(TokenType.NUMBER, '42', 1, 5);

      expect(token1.equals(token2)).toBe(true);
    });

    it('should return false for different token types', () => {
      const token1 = new Token(TokenType.NUMBER, '42', 1, 5);
      const token2 = new Token(TokenType.IDENTIFIER, '42', 1, 5);

      expect(token1.equals(token2)).toBe(false);
    });

    it('should return false for different values', () => {
      const token1 = new Token(TokenType.NUMBER, '42', 1, 5);
      const token2 = new Token(TokenType.NUMBER, '43', 1, 5);

      expect(token1.equals(token2)).toBe(false);
    });

    it('should return false for different line numbers', () => {
      const token1 = new Token(TokenType.NUMBER, '42', 1, 5);
      const token2 = new Token(TokenType.NUMBER, '42', 2, 5);

      expect(token1.equals(token2)).toBe(false);
    });

    it('should return false for different columns', () => {
      const token1 = new Token(TokenType.NUMBER, '42', 1, 5);
      const token2 = new Token(TokenType.NUMBER, '42', 1, 6);

      expect(token1.equals(token2)).toBe(false);
    });
  });

  describe('TokenType enum', () => {
    it('should have all required token types', () => {
      const requiredTypes = [
        'NUMBER',
        'IDENTIFIER',
        'PLUS',
        'MINUS',
        'MULTIPLY',
        'DIVIDE',
        'GT',
        'LT',
        'GTE',
        'LTE',
        'EQ',
        'NEQ',
        'AND',
        'OR',
        'LPAREN',
        'RPAREN',
        'COMMA',
        'SEMICOLON',
        'COLON',
        'ASSIGN',
        'IF',
        'COLOR',
        'LINETHICK',
        'DOTLINE',
        'STICK',
        'NEWLINE',
        'EOF',
      ];

      requiredTypes.forEach((type) => {
        expect(TokenType[type as keyof typeof TokenType]).toBe(type);
      });
    });

    it('should have correct number of token types', () => {
      const tokenTypes = Object.keys(TokenType);
      expect(tokenTypes.length).toBe(27);
    });
  });

  describe('integration', () => {
    it('should create and compare various tokens', () => {
      const tokens = [
        new Token(TokenType.NUMBER, '100', 1, 1),
        new Token(TokenType.PLUS, '+', 1, 4),
        new Token(TokenType.IDENTIFIER, 'price', 1, 6),
        new Token(TokenType.MULTIPLY, '*', 1, 12),
        new Token(TokenType.NUMBER, '2', 1, 13),
        new Token(TokenType.EOF, '', 1, 14),
      ];

      expect(tokens).toHaveLength(6);
      expect(tokens[0].type).toBe(TokenType.NUMBER);
      expect(tokens[1].type).toBe(TokenType.PLUS);
      expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[5].type).toBe(TokenType.EOF);

      // Verify uniqueness
      const sameNumberToken = new Token(TokenType.NUMBER, '100', 1, 1);
      expect(sameNumberToken.equals(tokens[0])).toBe(true);
    });
  });
});
