import { Lexer } from '../../../src/lexer/Lexer';
import { TokenType } from '../../../src/lexer/TokenType';
import { LexerError } from '../../../src/errors';

describe('Lexer', () => {
  describe('Numbers', () => {
    it('should tokenize integers', () => {
      const lexer = new Lexer('123');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(2); // NUMBER + EOF
      expect(tokens[0].type).toBe(TokenType.NUMBER);
      expect(tokens[0].value).toBe('123');
      expect(tokens[0].line).toBe(1);
      expect(tokens[0].column).toBe(1);
    });

    it('should tokenize floating point numbers', () => {
      const lexer = new Lexer('123.456');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe(TokenType.NUMBER);
      expect(tokens[0].value).toBe('123.456');
    });

    it('should tokenize numbers starting with decimal point', () => {
      const lexer = new Lexer('.5');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe(TokenType.NUMBER);
      expect(tokens[0].value).toBe('.5');
    });

    it('should tokenize multiple numbers', () => {
      const lexer = new Lexer('10 20.5 .75');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(4); // 3 numbers + EOF
      expect(tokens[0].value).toBe('10');
      expect(tokens[1].value).toBe('20.5');
      expect(tokens[2].value).toBe('.75');
    });
  });

  describe('Identifiers and Keywords', () => {
    it('should tokenize identifiers', () => {
      const lexer = new Lexer('MA5');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0].value).toBe('MA5');
    });

    it('should tokenize unicode identifiers', () => {
      const lexer = new Lexer('阻力1 支撑2');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(3);
      expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0].value).toBe('阻力1');
      expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[1].value).toBe('支撑2');
    });

    it('should tokenize market data identifiers', () => {
      const lexer = new Lexer('OPEN CLOSE HIGH LOW VOLUME AMOUNT');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(7); // 6 identifiers + EOF
      const identifiers = tokens.slice(0, 6);
      identifiers.forEach((token) => {
        expect(token.type).toBe(TokenType.IDENTIFIER);
      });
    });

    it('should recognize IF keyword', () => {
      const lexer = new Lexer('IF');
      const tokens = lexer.tokenize();
      expect(tokens[0].type).toBe(TokenType.IF);
      expect(tokens[0].value).toBe('IF');
    });

    it('should recognize AND keyword', () => {
      const lexer = new Lexer('AND');
      const tokens = lexer.tokenize();
      expect(tokens[0].type).toBe(TokenType.AND);
      expect(tokens[0].value).toBe('AND');
    });

    it('should recognize OR keyword', () => {
      const lexer = new Lexer('OR');
      const tokens = lexer.tokenize();
      expect(tokens[0].type).toBe(TokenType.OR);
      expect(tokens[0].value).toBe('OR');
    });

    it('should recognize color keywords', () => {
      const lexer = new Lexer('COLORRED COLORGREEN COLORWHITE COLORYELLOW');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(5); // 4 colors + EOF
      tokens.slice(0, 4).forEach((token) => {
        expect(token.type).toBe(TokenType.COLOR);
      });
      expect(tokens[0].value).toBe('COLORRED');
      expect(tokens[1].value).toBe('COLORGREEN');
      expect(tokens[2].value).toBe('COLORWHITE');
      expect(tokens[3].value).toBe('COLORYELLOW');
    });

    it('should recognize line thickness keywords', () => {
      const lexer = new Lexer('LINETHICK1 LINETHICK5 LINETHICK9');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(4); // 3 linethick + EOF
      tokens.slice(0, 3).forEach((token) => {
        expect(token.type).toBe(TokenType.LINETHICK);
      });
    });

    it('should recognize DOTLINE keyword', () => {
      const lexer = new Lexer('DOTLINE');
      const tokens = lexer.tokenize();
      expect(tokens[0].type).toBe(TokenType.DOTLINE);
    });

    it('should recognize STICK keyword', () => {
      const lexer = new Lexer('STICK');
      const tokens = lexer.tokenize();
      expect(tokens[0].type).toBe(TokenType.STICK);
    });

    it('should recognize extended drawing style keywords', () => {
      const lexer = new Lexer('COLORSTICK VOLSTICK NODRAW');
      const tokens = lexer.tokenize();
      expect(tokens[0].type).toBe(TokenType.COLORSTICK);
      expect(tokens[1].type).toBe(TokenType.VOLSTICK);
      expect(tokens[2].type).toBe(TokenType.NODRAW);
    });
  });

  describe('String Literals', () => {
    it('should tokenize quoted strings', () => {
      const lexer = new Lexer("'BUY' \"SELL\"");
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(3);
      expect(tokens[0].type).toBe(TokenType.STRING);
      expect(tokens[0].value).toBe('BUY');
      expect(tokens[1].type).toBe(TokenType.STRING);
      expect(tokens[1].value).toBe('SELL');
    });

    it('should decode escaped characters in strings', () => {
      const lexer = new Lexer("'A\\nB\\'C'");
      const tokens = lexer.tokenize();
      expect(tokens[0].type).toBe(TokenType.STRING);
      expect(tokens[0].value).toBe("A\nB'C");
    });
  });

  describe('Operators', () => {
    it('should tokenize arithmetic operators', () => {
      const lexer = new Lexer('+ - * /');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(5); // 4 operators + EOF
      expect(tokens[0].type).toBe(TokenType.PLUS);
      expect(tokens[1].type).toBe(TokenType.MINUS);
      expect(tokens[2].type).toBe(TokenType.MULTIPLY);
      expect(tokens[3].type).toBe(TokenType.DIVIDE);
    });

    it('should tokenize comparison operators', () => {
      const lexer = new Lexer('> < >= <= = <>');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(7); // 6 operators + EOF
      expect(tokens[0].type).toBe(TokenType.GT);
      expect(tokens[1].type).toBe(TokenType.LT);
      expect(tokens[2].type).toBe(TokenType.GTE);
      expect(tokens[3].type).toBe(TokenType.LTE);
      expect(tokens[4].type).toBe(TokenType.EQ);
      expect(tokens[5].type).toBe(TokenType.NEQ);
    });

    it('should tokenize assignment operator', () => {
      const lexer = new Lexer(':=');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe(TokenType.ASSIGN);
      expect(tokens[0].value).toBe(':=');
    });
  });

  describe('Delimiters', () => {
    it('should tokenize parentheses', () => {
      const lexer = new Lexer('()');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(3);
      expect(tokens[0].type).toBe(TokenType.LPAREN);
      expect(tokens[1].type).toBe(TokenType.RPAREN);
    });

    it('should tokenize comma', () => {
      const lexer = new Lexer(',');
      const tokens = lexer.tokenize();
      expect(tokens[0].type).toBe(TokenType.COMMA);
    });

    it('should tokenize semicolon', () => {
      const lexer = new Lexer(';');
      const tokens = lexer.tokenize();
      expect(tokens[0].type).toBe(TokenType.SEMICOLON);
    });

    it('should tokenize colon', () => {
      const lexer = new Lexer(':');
      const tokens = lexer.tokenize();
      expect(tokens[0].type).toBe(TokenType.COLON);
    });
  });

  describe('Comments', () => {
    it('should skip single-line comments', () => {
      const lexer = new Lexer('MA5 // This is a comment\nMA10');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(4); // MA5, NEWLINE, MA10, EOF
      expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0].value).toBe('MA5');
      expect(tokens[1].type).toBe(TokenType.NEWLINE);
      expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[2].value).toBe('MA10');
    });

    it('should skip block comments', () => {
      const lexer = new Lexer('MA5 { This is a block comment } MA10');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(3); // MA5, MA10, EOF
      expect(tokens[0].value).toBe('MA5');
      expect(tokens[1].value).toBe('MA10');
    });

    it('should skip multi-line block comments', () => {
      const lexer = new Lexer('MA5\n{\nMulti\nLine\nComment\n}\nMA10');
      const tokens = lexer.tokenize();
      // Should have MA5, NEWLINE, NEWLINE, MA10, EOF
      const identifiers = tokens.filter((t) => t.type === TokenType.IDENTIFIER);
      expect(identifiers).toHaveLength(2);
      expect(identifiers[0].value).toBe('MA5');
      expect(identifiers[1].value).toBe('MA10');
    });

    it('should handle comment at end of file', () => {
      const lexer = new Lexer('MA5 // comment');
      const tokens = lexer.tokenize();
      expect(tokens[0].value).toBe('MA5');
      expect(tokens[tokens.length - 1].type).toBe(TokenType.EOF);
    });
  });

  describe('Newlines and Whitespace', () => {
    it('should skip spaces and tabs', () => {
      const lexer = new Lexer('MA5   \t  MA10');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(3); // MA5, MA10, EOF
    });

    it('should tokenize newlines', () => {
      const lexer = new Lexer('MA5\nMA10');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(4); // MA5, NEWLINE, MA10, EOF
      expect(tokens[1].type).toBe(TokenType.NEWLINE);
    });

    it('should handle multiple consecutive newlines as single newline', () => {
      const lexer = new Lexer('MA5\n\n\nMA10');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(4); // MA5, NEWLINE, MA10, EOF
      expect(tokens[1].type).toBe(TokenType.NEWLINE);
    });

    it('should handle carriage return and line feed', () => {
      const lexer = new Lexer('MA5\r\nMA10');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(4);
      expect(tokens[1].type).toBe(TokenType.NEWLINE);
    });
  });

  describe('Position Tracking', () => {
    it('should track line numbers correctly', () => {
      const lexer = new Lexer('MA5\nMA10\nMA20');
      const tokens = lexer.tokenize();
      expect(tokens[0].line).toBe(1); // MA5
      expect(tokens[2].line).toBe(2); // MA10
      expect(tokens[4].line).toBe(3); // MA20
    });

    it('should track column numbers correctly', () => {
      const lexer = new Lexer('MA5 + MA10');
      const tokens = lexer.tokenize();
      expect(tokens[0].column).toBe(1); // MA5 starts at column 1
      expect(tokens[1].column).toBe(5); // + at column 5
      expect(tokens[2].column).toBe(7); // MA10 starts at column 7
    });

    it('should reset column on newline', () => {
      const lexer = new Lexer('MA5\nMA10');
      const tokens = lexer.tokenize();
      expect(tokens[0].column).toBe(1); // MA5 at line 1, column 1
      expect(tokens[2].column).toBe(1); // MA10 at line 2, column 1
    });
  });

  describe('Error Handling', () => {
    it('should throw error on invalid character', () => {
      const lexer = new Lexer('MA5 @ MA10');
      expect(() => lexer.tokenize()).toThrow(LexerError);
      expect(() => lexer.tokenize()).toThrow('Unexpected character');
    });

    it('should throw error on unclosed block comment', () => {
      const lexer = new Lexer('MA5 { unclosed comment');
      expect(() => lexer.tokenize()).toThrow(LexerError);

      // Test with a fresh lexer to ensure message is correct
      const lexer2 = new Lexer('{ unclosed');
      expect(() => lexer2.tokenize()).toThrow('Unterminated block comment');
    });

    it('should include position in error', () => {
      const lexer = new Lexer('MA5\n@');
      try {
        lexer.tokenize();
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(LexerError);
        const lexerError = error as LexerError;
        expect(lexerError.line).toBe(2);
        expect(lexerError.column).toBe(1);
      }
    });
  });

  describe('Complete Formula Examples', () => {
    it('should tokenize simple MA formula', () => {
      const lexer = new Lexer('MA5: MA(CLOSE, 5);');
      const tokens = lexer.tokenize();
      const types = tokens.map((t) => t.type);
      expect(types).toEqual([
        TokenType.IDENTIFIER, // MA5
        TokenType.COLON, // :
        TokenType.IDENTIFIER, // MA
        TokenType.LPAREN, // (
        TokenType.IDENTIFIER, // CLOSE
        TokenType.COMMA, // ,
        TokenType.NUMBER, // 5
        TokenType.RPAREN, // )
        TokenType.SEMICOLON, // ;
        TokenType.EOF,
      ]);
    });

    it('should tokenize variable assignment', () => {
      const lexer = new Lexer('VAR1 := CLOSE - MA(CLOSE, 5);');
      const tokens = lexer.tokenize();
      expect(tokens[0].type).toBe(TokenType.IDENTIFIER); // VAR1
      expect(tokens[1].type).toBe(TokenType.ASSIGN); // :=
      expect(tokens[2].type).toBe(TokenType.IDENTIFIER); // CLOSE
      expect(tokens[3].type).toBe(TokenType.MINUS); // -
    });

    it('should tokenize formula with chart attributes', () => {
      const lexer = new Lexer('MA5: MA(CLOSE, 5), COLORRED, LINETHICK2;');
      const tokens = lexer.tokenize();
      const colorToken = tokens.find((t) => t.type === TokenType.COLOR);
      const thickToken = tokens.find((t) => t.type === TokenType.LINETHICK);
      expect(colorToken).toBeDefined();
      expect(colorToken?.value).toBe('COLORRED');
      expect(thickToken).toBeDefined();
      expect(thickToken?.value).toBe('LINETHICK2');
    });

    it('should tokenize complex MACD formula', () => {
      const input = `
DIF: EMA(CLOSE, 12) - EMA(CLOSE, 26), COLORWHITE;
DEA: EMA(DIF, 9), COLORYELLOW;
MACD: (DIF - DEA) * 2, STICK;
      `.trim();
      const lexer = new Lexer(input);
      const tokens = lexer.tokenize();
      // Verify it doesn't throw and produces tokens
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens[tokens.length - 1].type).toBe(TokenType.EOF);
    });

    it('should tokenize formula with logical operators', () => {
      const lexer = new Lexer('CROSS(MA5, MA10) AND CLOSE > OPEN');
      const tokens = lexer.tokenize();
      const andToken = tokens.find((t) => t.type === TokenType.AND);
      const gtToken = tokens.find((t) => t.type === TokenType.GT);
      expect(andToken).toBeDefined();
      expect(gtToken).toBeDefined();
    });

    it('should tokenize formula with comparison operators', () => {
      const lexer = new Lexer('IF(CLOSE >= 100, 1, 0)');
      const tokens = lexer.tokenize();
      const ifToken = tokens.find((t) => t.type === TokenType.IF);
      const gteToken = tokens.find((t) => t.type === TokenType.GTE);
      expect(ifToken).toBeDefined();
      expect(gteToken).toBeDefined();
    });

    it('should tokenize KDJ formula', () => {
      const input = `
RSV: (CLOSE - LLV(LOW, 9)) / (HHV(HIGH, 9) - LLV(LOW, 9)) * 100;
K: SMA(RSV, 3, 1), COLORWHITE;
D: SMA(K, 3, 1), COLORYELLOW;
J: 3 * K - 2 * D, COLORPINK;
      `.trim();
      const lexer = new Lexer(input);
      const tokens = lexer.tokenize();
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens[tokens.length - 1].type).toBe(TokenType.EOF);
      // Verify all identifiers are captured
      const identifiers = tokens.filter((t) => t.type === TokenType.IDENTIFIER);
      expect(identifiers.length).toBeGreaterThan(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      const lexer = new Lexer('');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe(TokenType.EOF);
    });

    it('should handle whitespace-only input', () => {
      const lexer = new Lexer('   \t\n  ');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(2); // NEWLINE + EOF
    });

    it('should handle numbers adjacent to operators', () => {
      const lexer = new Lexer('5+3*2');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(6); // 5, +, 3, *, 2, EOF
      expect(tokens[0].type).toBe(TokenType.NUMBER);
      expect(tokens[1].type).toBe(TokenType.PLUS);
      expect(tokens[2].type).toBe(TokenType.NUMBER);
    });

    it('should distinguish between : and :=', () => {
      const lexer = new Lexer('MA5: VAR1 :=');
      const tokens = lexer.tokenize();
      expect(tokens[1].type).toBe(TokenType.COLON);
      expect(tokens[3].type).toBe(TokenType.ASSIGN);
    });

    it('should handle identifiers with numbers', () => {
      const lexer = new Lexer('MA5 MA10 VAR1 K9');
      const tokens = lexer.tokenize();
      expect(tokens).toHaveLength(5);
      tokens.slice(0, 4).forEach((token) => {
        expect(token.type).toBe(TokenType.IDENTIFIER);
      });
    });
  });
});
