# Sprint 2: 词法分析器（Lexer）实现

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现完整的词法分析器，将公式文本转换为 Token 流，支持通达信公式的所有基本语法元素

**Architecture:** 采用状态机方式实现 Lexer，逐字符扫描输入，根据当前字符和状态转换生成 Token。使用 TDD 方法，先为每种 token 类型编写测试，再实现识别逻辑。

**Tech Stack:** TypeScript 5.9+, Jest 30.2+

**Duration:** 1-2 周

**Dependencies:** Sprint 1 完成（Token 系统）

---

## Task 1: Lexer 基础框架

**Files:**
- Create: `src/lexer/Lexer.ts`
- Create: `src/lexer/__tests__/Lexer.test.ts`

**Step 1: 编写 Lexer 基础框架测试**

```typescript
// src/lexer/__tests__/Lexer.test.ts
import { Lexer } from '../Lexer';
import { TokenType } from '../TokenType';

describe('Lexer', () => {
  describe('Constructor and basic methods', () => {
    it('should create lexer with input', () => {
      const lexer = new Lexer('123');
      expect(lexer).toBeDefined();
    });

    it('should handle empty input', () => {
      const lexer = new Lexer('');
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe(TokenType.EOF);
    });

    it('should track position', () => {
      const lexer = new Lexer('test');
      const tokens = lexer.tokenize();

      // 第一个 token 应该在 1:1
      expect(tokens[0].line).toBe(1);
      expect(tokens[0].column).toBe(1);
    });
  });

  describe('Whitespace handling', () => {
    it('should skip spaces', () => {
      const lexer = new Lexer('   123   ');
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(2); // NUMBER + EOF
      expect(tokens[0].type).toBe(TokenType.NUMBER);
    });

    it('should skip tabs', () => {
      const lexer = new Lexer('\t\t123\t\t');
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(2);
      expect(tokens[0].type).toBe(TokenType.NUMBER);
    });

    it('should handle newlines and track line numbers', () => {
      const lexer = new Lexer('123\n456');
      const tokens = lexer.tokenize();

      expect(tokens[0].line).toBe(1); // 123 on line 1
      expect(tokens[1].line).toBe(2); // 456 on line 2
    });

    it('should handle carriage return', () => {
      const lexer = new Lexer('123\r\n456');
      const tokens = lexer.tokenize();

      expect(tokens[0].line).toBe(1);
      expect(tokens[1].line).toBe(2);
    });
  });
});
```

**Step 2: 运行测试确认失败**

Run: `npm test -- Lexer.test.ts`

Expected: 测试失败，提示找不到 Lexer 模块

**Step 3: 实现 Lexer 基础框架**

```typescript
// src/lexer/Lexer.ts
import { Token } from './Token';
import { TokenType, KEYWORDS } from './TokenType';
import { LexerError } from '../errors/LexerError';

/**
 * 词法分析器
 * 将公式文本转换为 Token 流
 */
export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private currentChar: string | null;

  constructor(input: string) {
    this.input = input;
    this.currentChar = input.length > 0 ? input[0] : null;
  }

  /**
   * 将整个输入转换为 Token 数组
   */
  tokenize(): Token[] {
    const tokens: Token[] = [];
    let token = this.nextToken();

    while (token.type !== TokenType.EOF) {
      tokens.push(token);
      token = this.nextToken();
    }

    tokens.push(token); // 添加 EOF token
    return tokens;
  }

  /**
   * 获取下一个 Token
   */
  nextToken(): Token {
    this.skipWhitespace();

    if (this.currentChar === null) {
      return Token.eof(this.line, this.column);
    }

    // TODO: 实现其他 token 识别逻辑
    throw new LexerError(
      `Unrecognized character '${this.currentChar}'`,
      this.line,
      this.column
    );
  }

  // ===== 私有辅助方法 =====

  /**
   * 前进到下一个字符
   */
  private advance(): void {
    if (this.currentChar === '\n') {
      this.line++;
      this.column = 1;
    } else if (this.currentChar === '\r') {
      // 处理 \r\n，只增加行号一次
      if (this.peek() === '\n') {
        this.position++;
      }
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }

    this.position++;
    this.currentChar = this.position < this.input.length
      ? this.input[this.position]
      : null;
  }

  /**
   * 查看下一个字符但不移动位置
   */
  private peek(offset: number = 1): string | null {
    const pos = this.position + offset;
    return pos < this.input.length ? this.input[pos] : null;
  }

  /**
   * 跳过空白字符
   */
  private skipWhitespace(): void {
    while (this.currentChar !== null && this.isWhitespace(this.currentChar)) {
      this.advance();
    }
  }

  /**
   * 判断是否为空白字符
   */
  private isWhitespace(char: string): boolean {
    return char === ' ' || char === '\t' || char === '\n' || char === '\r';
  }
}
```

**Step 4: 运行测试确认通过**

Run: `npm test -- Lexer.test.ts`

Expected: 基础测试通过（空输入和空白处理）

**Step 5: 提交代码**

```bash
git add src/lexer/Lexer.ts src/lexer/__tests__/Lexer.test.ts
git commit -m "feat(lexer): add Lexer basic framework

- Implement Lexer class with position tracking
- Add whitespace skipping and line number tracking
- Add tokenize() and nextToken() methods
- Handle empty input and EOF"
```

---

## Task 2: 数字识别

**Files:**
- Modify: `src/lexer/Lexer.ts`
- Modify: `src/lexer/__tests__/Lexer.test.ts`

**Step 1: 编写数字识别测试**

```typescript
// 添加到 src/lexer/__tests__/Lexer.test.ts
describe('Number recognition', () => {
  it('should recognize integer', () => {
    const lexer = new Lexer('123');
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].value).toBe('123');
  });

  it('should recognize decimal number', () => {
    const lexer = new Lexer('123.45');
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].value).toBe('123.45');
  });

  it('should recognize number starting with decimal point', () => {
    const lexer = new Lexer('.5');
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].value).toBe('.5');
  });

  it('should recognize multiple numbers', () => {
    const lexer = new Lexer('12 34.5 .6');
    const tokens = lexer.tokenize();

    expect(tokens).toHaveLength(4); // 3 numbers + EOF
    expect(tokens[0].value).toBe('12');
    expect(tokens[1].value).toBe('34.5');
    expect(tokens[2].value).toBe('.6');
  });

  it('should reject invalid number with multiple decimal points', () => {
    const lexer = new Lexer('12.34.56');

    expect(() => lexer.tokenize()).toThrow(LexerError);
    expect(() => lexer.tokenize()).toThrow(/Invalid number/);
  });

  it('should handle number followed by operator', () => {
    const lexer = new Lexer('123+');
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].value).toBe('123');
  });
});
```

**Step 2: 运行测试确认失败**

Run: `npm test -- Lexer.test.ts`

Expected: 数字识别测试失败

**Step 3: 实现数字识别**

```typescript
// 在 src/lexer/Lexer.ts 的 nextToken() 方法中添加
nextToken(): Token {
  this.skipWhitespace();

  if (this.currentChar === null) {
    return Token.eof(this.line, this.column);
  }

  const line = this.line;
  const column = this.column;

  // 识别数字
  if (this.isDigit(this.currentChar) || this.currentChar === '.') {
    return this.readNumber(line, column);
  }

  throw new LexerError(
    `Unrecognized character '${this.currentChar}'`,
    this.line,
    this.column
  );
}

// 添加私有方法
private isDigit(char: string): boolean {
  return char >= '0' && char <= '9';
}

private readNumber(line: number, column: number): Token {
  let value = '';
  let hasDecimalPoint = false;

  // 处理以小数点开头的情况
  if (this.currentChar === '.') {
    hasDecimalPoint = true;
    value += this.currentChar;
    this.advance();

    // 小数点后必须有数字
    if (this.currentChar === null || !this.isDigit(this.currentChar)) {
      throw LexerError.invalidNumber(value, line, column);
    }
  }

  // 读取数字
  while (this.currentChar !== null && this.isDigit(this.currentChar)) {
    value += this.currentChar;
    this.advance();
  }

  // 处理小数点
  if (this.currentChar === '.' && !hasDecimalPoint) {
    hasDecimalPoint = true;
    value += this.currentChar;
    this.advance();

    // 小数点后可以没有数字（如 123.）
    while (this.currentChar !== null && this.isDigit(this.currentChar)) {
      value += this.currentChar;
      this.advance();
    }
  } else if (this.currentChar === '.' && hasDecimalPoint) {
    // 第二个小数点，报错
    throw LexerError.invalidNumber(value + '.', line, column);
  }

  return Token.number(value, line, column);
}
```

**Step 4: 运行测试确认通过**

Run: `npm test -- Lexer.test.ts`

Expected: 数字识别测试全部通过

**Step 5: 提交代码**

```bash
git add src/lexer/Lexer.ts src/lexer/__tests__/Lexer.test.ts
git commit -m "feat(lexer): add number recognition

- Support integer and decimal numbers
- Handle numbers starting with decimal point (.5)
- Validate against multiple decimal points
- Track number position correctly"
```

---

## Task 3: 运算符和分隔符识别

**Files:**
- Modify: `src/lexer/Lexer.ts`
- Modify: `src/lexer/__tests__/Lexer.test.ts`

**Step 1: 编写运算符识别测试**

```typescript
// 添加到 src/lexer/__tests__/Lexer.test.ts
describe('Operator and delimiter recognition', () => {
  describe('Single character operators', () => {
    it('should recognize arithmetic operators', () => {
      const lexer = new Lexer('+ - * /');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.PLUS);
      expect(tokens[1].type).toBe(TokenType.MINUS);
      expect(tokens[2].type).toBe(TokenType.MULTIPLY);
      expect(tokens[3].type).toBe(TokenType.DIVIDE);
    });

    it('should recognize parentheses', () => {
      const lexer = new Lexer('( )');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.LEFT_PAREN);
      expect(tokens[1].type).toBe(TokenType.RIGHT_PAREN);
    });

    it('should recognize comma and semicolon', () => {
      const lexer = new Lexer(', ;');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.COMMA);
      expect(tokens[1].type).toBe(TokenType.SEMICOLON);
    });
  });

  describe('Multi-character operators', () => {
    it('should recognize := (assign)', () => {
      const lexer = new Lexer(':=');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.ASSIGN);
      expect(tokens[0].value).toBe(':=');
    });

    it('should recognize : (output)', () => {
      const lexer = new Lexer(':');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.OUTPUT);
      expect(tokens[0].value).toBe(':');
    });

    it('should recognize >= and <=', () => {
      const lexer = new Lexer('>= <=');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.GREATER_EQUAL);
      expect(tokens[1].type).toBe(TokenType.LESS_EQUAL);
    });

    it('should recognize <> (not equal)', () => {
      const lexer = new Lexer('<>');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.NOT_EQUAL);
      expect(tokens[0].value).toBe('<>');
    });

    it('should recognize > and < separately', () => {
      const lexer = new Lexer('> <');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.GREATER_THAN);
      expect(tokens[1].type).toBe(TokenType.LESS_THAN);
    });

    it('should recognize = (equal)', () => {
      const lexer = new Lexer('=');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.EQUAL);
    });
  });

  describe('Complex expressions', () => {
    it('should tokenize arithmetic expression', () => {
      const lexer = new Lexer('(1+2)*3');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.LEFT_PAREN);
      expect(tokens[1].type).toBe(TokenType.NUMBER);
      expect(tokens[2].type).toBe(TokenType.PLUS);
      expect(tokens[3].type).toBe(TokenType.NUMBER);
      expect(tokens[4].type).toBe(TokenType.RIGHT_PAREN);
      expect(tokens[5].type).toBe(TokenType.MULTIPLY);
      expect(tokens[6].type).toBe(TokenType.NUMBER);
    });
  });
});
```

**Step 2: 运行测试确认失败**

Run: `npm test -- Lexer.test.ts`

Expected: 运算符识别测试失败

**Step 3: 实现运算符识别**

```typescript
// 在 src/lexer/Lexer.ts 的 nextToken() 方法中添加
nextToken(): Token {
  this.skipWhitespace();

  if (this.currentChar === null) {
    return Token.eof(this.line, this.column);
  }

  const line = this.line;
  const column = this.column;

  // 识别数字
  if (this.isDigit(this.currentChar) || this.currentChar === '.') {
    return this.readNumber(line, column);
  }

  // 识别运算符和分隔符
  const char = this.currentChar;

  // 单字符运算符
  if (char === '+') {
    this.advance();
    return new Token(TokenType.PLUS, '+', line, column);
  }

  if (char === '-') {
    this.advance();
    return new Token(TokenType.MINUS, '-', line, column);
  }

  if (char === '*') {
    this.advance();
    return new Token(TokenType.MULTIPLY, '*', line, column);
  }

  if (char === '/') {
    this.advance();
    return new Token(TokenType.DIVIDE, '/', line, column);
  }

  if (char === '(') {
    this.advance();
    return new Token(TokenType.LEFT_PAREN, '(', line, column);
  }

  if (char === ')') {
    this.advance();
    return new Token(TokenType.RIGHT_PAREN, ')', line, column);
  }

  if (char === ',') {
    this.advance();
    return new Token(TokenType.COMMA, ',', line, column);
  }

  if (char === ';') {
    this.advance();
    return new Token(TokenType.SEMICOLON, ';', line, column);
  }

  if (char === '=') {
    this.advance();
    return new Token(TokenType.EQUAL, '=', line, column);
  }

  // 多字符运算符
  if (char === ':') {
    this.advance();
    if (this.currentChar === '=') {
      this.advance();
      return new Token(TokenType.ASSIGN, ':=', line, column);
    }
    return new Token(TokenType.OUTPUT, ':', line, column);
  }

  if (char === '>') {
    this.advance();
    if (this.currentChar === '=') {
      this.advance();
      return new Token(TokenType.GREATER_EQUAL, '>=', line, column);
    }
    return new Token(TokenType.GREATER_THAN, '>', line, column);
  }

  if (char === '<') {
    this.advance();
    if (this.currentChar === '=') {
      this.advance();
      return new Token(TokenType.LESS_EQUAL, '<=', line, column);
    }
    if (this.currentChar === '>') {
      this.advance();
      return new Token(TokenType.NOT_EQUAL, '<>', line, column);
    }
    return new Token(TokenType.LESS_THAN, '<', line, column);
  }

  throw LexerError.unexpectedCharacter(this.currentChar, this.line, this.column);
}
```

**Step 4: 运行测试确认通过**

Run: `npm test -- Lexer.test.ts`

Expected: 运算符识别测试全部通过

**Step 5: 提交代码**

```bash
git add src/lexer/Lexer.ts src/lexer/__tests__/Lexer.test.ts
git commit -m "feat(lexer): add operator and delimiter recognition

- Support single char operators: + - * / ( ) , ; =
- Support multi-char operators: := : >= <= <> > <
- Handle operator lookahead correctly
- Add comprehensive operator tests"
```

---

## Task 4: 标识符和关键字识别

**Files:**
- Modify: `src/lexer/Lexer.ts`
- Modify: `src/lexer/__tests__/Lexer.test.ts`

**Step 1: 编写标识符和关键字识别测试**

```typescript
// 添加到 src/lexer/__tests__/Lexer.test.ts
describe('Identifier and keyword recognition', () => {
  describe('Identifiers', () => {
    it('should recognize simple identifier', () => {
      const lexer = new Lexer('CLOSE');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0].value).toBe('CLOSE');
    });

    it('should recognize identifier with numbers', () => {
      const lexer = new Lexer('MA5');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0].value).toBe('MA5');
    });

    it('should recognize identifier with underscore', () => {
      const lexer = new Lexer('VAR_1');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0].value).toBe('VAR_1');
    });

    it('should recognize multiple identifiers', () => {
      const lexer = new Lexer('OPEN HIGH LOW CLOSE');
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(5); // 4 identifiers + EOF
      expect(tokens[0].value).toBe('OPEN');
      expect(tokens[1].value).toBe('HIGH');
      expect(tokens[2].value).toBe('LOW');
      expect(tokens[3].value).toBe('CLOSE');
    });

    it('should handle lowercase identifiers', () => {
      const lexer = new Lexer('close');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0].value).toBe('close');
    });
  });

  describe('Keywords', () => {
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

    it('should recognize keywords case-insensitively', () => {
      const lexer = new Lexer('and or And Or');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.AND);
      expect(tokens[1].type).toBe(TokenType.OR);
      expect(tokens[2].type).toBe(TokenType.AND);
      expect(tokens[3].type).toBe(TokenType.OR);
    });
  });

  describe('Mixed expressions', () => {
    it('should tokenize variable declaration', () => {
      const lexer = new Lexer('VAR1 := CLOSE');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0].value).toBe('VAR1');
      expect(tokens[1].type).toBe(TokenType.ASSIGN);
      expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[2].value).toBe('CLOSE');
    });

    it('should tokenize function call', () => {
      const lexer = new Lexer('MA(CLOSE, 5)');
      const tokens = lexer.tokenize();

      expect(tokens[0].type).toBe(TokenType.IDENTIFIER); // MA
      expect(tokens[1].type).toBe(TokenType.LEFT_PAREN);
      expect(tokens[2].type).toBe(TokenType.IDENTIFIER); // CLOSE
      expect(tokens[3].type).toBe(TokenType.COMMA);
      expect(tokens[4].type).toBe(TokenType.NUMBER); // 5
      expect(tokens[5].type).toBe(TokenType.RIGHT_PAREN);
    });
  });
});
```

**Step 2: 运行测试确认失败**

Run: `npm test -- Lexer.test.ts`

Expected: 标识符和关键字识别测试失败

**Step 3: 实现标识符和关键字识别**

```typescript
// 在 src/lexer/Lexer.ts 的 nextToken() 方法中添加
nextToken(): Token {
  this.skipWhitespace();

  if (this.currentChar === null) {
    return Token.eof(this.line, this.column);
  }

  const line = this.line;
  const column = this.column;

  // 识别数字
  if (this.isDigit(this.currentChar) || this.currentChar === '.') {
    return this.readNumber(line, column);
  }

  // 识别标识符和关键字
  if (this.isAlpha(this.currentChar) || this.currentChar === '_') {
    return this.readIdentifier(line, column);
  }

  // 识别运算符和分隔符
  // ... (之前的运算符识别代码)
}

// 添加私有方法
private isAlpha(char: string): boolean {
  return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
}

private isAlphaNumeric(char: string): boolean {
  return this.isAlpha(char) || this.isDigit(char) || char === '_';
}

private readIdentifier(line: number, column: number): Token {
  let value = '';

  while (this.currentChar !== null && this.isAlphaNumeric(this.currentChar)) {
    value += this.currentChar;
    this.advance();
  }

  // 检查是否为关键字（不区分大小写）
  const upperValue = value.toUpperCase();
  const tokenType = KEYWORDS[upperValue] || TokenType.IDENTIFIER;

  return new Token(tokenType, value, line, column);
}
```

**Step 4: 运行测试确认通过**

Run: `npm test -- Lexer.test.ts`

Expected: 标识符和关键字识别测试全部通过

**Step 5: 提交代码**

```bash
git add src/lexer/Lexer.ts src/lexer/__tests__/Lexer.test.ts
git commit -m "feat(lexer): add identifier and keyword recognition

- Support identifiers with letters, numbers, underscores
- Recognize AND, OR keywords case-insensitively
- Handle function names and variable names
- Add comprehensive identifier tests"
```

---

## Task 5: 注释支持

**Files:**
- Modify: `src/lexer/Lexer.ts`
- Modify: `src/lexer/__tests__/Lexer.test.ts`

**Step 1: 编写注释识别测试**

```typescript
// 添加到 src/lexer/__tests__/Lexer.test.ts
describe('Comment handling', () => {
  it('should skip line comment', () => {
    const lexer = new Lexer('123 // this is a comment\n456');
    const tokens = lexer.tokenize();

    expect(tokens).toHaveLength(3); // 123, 456, EOF
    expect(tokens[0].value).toBe('123');
    expect(tokens[1].value).toBe('456');
  });

  it('should handle comment at end of file', () => {
    const lexer = new Lexer('123 // comment');
    const tokens = lexer.tokenize();

    expect(tokens).toHaveLength(2); // 123, EOF
    expect(tokens[0].value).toBe('123');
  });

  it('should handle multiple comments', () => {
    const lexer = new Lexer(`
      // comment 1
      123
      // comment 2
      456
      // comment 3
    `);
    const tokens = lexer.tokenize();

    expect(tokens).toHaveLength(3); // 123, 456, EOF
  });

  it('should handle comment with code on same line', () => {
    const lexer = new Lexer('VAR1 := CLOSE // get close price');
    const tokens = lexer.tokenize();

    expect(tokens[0].value).toBe('VAR1');
    expect(tokens[1].type).toBe(TokenType.ASSIGN);
    expect(tokens[2].value).toBe('CLOSE');
    expect(tokens[3].type).toBe(TokenType.EOF);
  });
});
```

**Step 2: 运行测试确认失败**

Run: `npm test -- Lexer.test.ts`

Expected: 注释测试失败

**Step 3: 实现注释跳过**

```typescript
// 修改 src/lexer/Lexer.ts 的 skipWhitespace 方法
private skipWhitespace(): void {
  while (this.currentChar !== null) {
    // 跳过空白字符
    if (this.isWhitespace(this.currentChar)) {
      this.advance();
      continue;
    }

    // 跳过行注释
    if (this.currentChar === '/' && this.peek() === '/') {
      this.skipLineComment();
      continue;
    }

    // 没有更多空白或注释
    break;
  }
}

private skipLineComment(): void {
  // 跳过 //
  this.advance();
  this.advance();

  // 跳过直到行尾
  while (this.currentChar !== null && this.currentChar !== '\n' && this.currentChar !== '\r') {
    this.advance();
  }
}
```

**Step 4: 运行测试确认通过**

Run: `npm test -- Lexer.test.ts`

Expected: 注释测试全部通过

**Step 5: 提交代码**

```bash
git add src/lexer/Lexer.ts src/lexer/__tests__/Lexer.test.ts
git commit -m "feat(lexer): add comment support

- Support // line comments
- Skip comments during tokenization
- Handle comments at end of file
- Handle comments mixed with code"
```

---

## Task 6: 完整公式测试

**Files:**
- Create: `src/lexer/__tests__/Lexer.integration.test.ts`

**Step 1: 编写完整公式测试**

```typescript
// src/lexer/__tests__/Lexer.integration.test.ts
import { Lexer } from '../Lexer';
import { TokenType } from '../TokenType';

describe('Lexer Integration Tests', () => {
  describe('MA formula', () => {
    it('should tokenize simple MA formula', () => {
      const formula = 'MA5: MA(CLOSE, 5);';
      const lexer = new Lexer(formula);
      const tokens = lexer.tokenize();

      expect(tokens[0].value).toBe('MA5');
      expect(tokens[1].type).toBe(TokenType.OUTPUT);
      expect(tokens[2].value).toBe('MA');
      expect(tokens[3].type).toBe(TokenType.LEFT_PAREN);
      expect(tokens[4].value).toBe('CLOSE');
      expect(tokens[5].type).toBe(TokenType.COMMA);
      expect(tokens[6].value).toBe('5');
      expect(tokens[7].type).toBe(TokenType.RIGHT_PAREN);
      expect(tokens[8].type).toBe(TokenType.SEMICOLON);
    });
  });

  describe('MACD formula', () => {
    it('should tokenize MACD formula', () => {
      const formula = `
        DIF: EMA(CLOSE, 12) - EMA(CLOSE, 26);
        DEA: EMA(DIF, 9);
        MACD: (DIF - DEA) * 2;
      `;
      const lexer = new Lexer(formula);
      const tokens = lexer.tokenize();

      // 验证第一行: DIF: EMA(CLOSE, 12) - EMA(CLOSE, 26);
      let i = 0;
      expect(tokens[i++].value).toBe('DIF');
      expect(tokens[i++].type).toBe(TokenType.OUTPUT);
      expect(tokens[i++].value).toBe('EMA');
      // ... 可以继续验证
    });
  });

  describe('Variable assignment', () => {
    it('should tokenize variable assignment', () => {
      const formula = 'VAR1 := (CLOSE - MA(CLOSE, 6)) / MA(CLOSE, 6) * 100;';
      const lexer = new Lexer(formula);
      const tokens = lexer.tokenize();

      expect(tokens[0].value).toBe('VAR1');
      expect(tokens[1].type).toBe(TokenType.ASSIGN);
      expect(tokens[2].type).toBe(TokenType.LEFT_PAREN);
      // ... 继续验证
    });
  });

  describe('Comparison expressions', () => {
    it('should tokenize comparison operators', () => {
      const formula = 'CROSS(MA5, MA10) AND CLOSE > OPEN';
      const lexer = new Lexer(formula);
      const tokens = lexer.tokenize();

      const types = tokens.map(t => t.type);
      expect(types).toContain(TokenType.AND);
      expect(types).toContain(TokenType.GREATER_THAN);
    });
  });

  describe('Complex formulas', () => {
    it('should tokenize KDJ formula', () => {
      const formula = `
        // KDJ 指标
        RSV := (CLOSE - LLV(LOW, 9)) / (HHV(HIGH, 9) - LLV(LOW, 9)) * 100;
        K: SMA(RSV, 3, 1);
        D: SMA(K, 3, 1);
        J: 3 * K - 2 * D;
      `;
      const lexer = new Lexer(formula);
      const tokens = lexer.tokenize();

      // 应该没有注释 token
      const hasComment = tokens.some(t => t.value.includes('//'));
      expect(hasComment).toBe(false);

      // 验证关键元素存在
      const values = tokens.map(t => t.value);
      expect(values).toContain('RSV');
      expect(values).toContain('LLV');
      expect(values).toContain('HHV');
    });
  });

  describe('Error cases', () => {
    it('should throw error for invalid character', () => {
      const lexer = new Lexer('CLOSE @ 123');
      expect(() => lexer.tokenize()).toThrow(LexerError);
    });

    it('should throw error for invalid number', () => {
      const lexer = new Lexer('12.34.56');
      expect(() => lexer.tokenize()).toThrow(LexerError);
    });
  });
});
```

**Step 2: 运行集成测试**

Run: `npm test -- Lexer.integration.test.ts`

Expected: 所有集成测试通过

**Step 3: 提交代码**

```bash
git add src/lexer/__tests__/Lexer.integration.test.ts
git commit -m "test(lexer): add integration tests for complete formulas

- Add tests for MA, MACD, KDJ formulas
- Test variable assignments and comparisons
- Verify comment handling in real formulas
- Add error case tests"
```

---

## Task 7: 更新模块导出和文档

**Files:**
- Modify: `src/lexer/index.ts`
- Modify: `src/index.ts`
- Create: `src/lexer/README.md`

**Step 1: 更新 lexer 模块导出**

```typescript
// src/lexer/index.ts
/**
 * Lexer 模块
 * 负责词法分析，将公式文本转换为 token 流
 */

export { Token } from './Token';
export { TokenType, isOperator, isKeyword, getTokenTypeName, KEYWORDS } from './TokenType';
export { Lexer } from './Lexer';
```

**Step 2: 更新主入口导出**

```typescript
// src/index.ts
/**
 * Formula-TS: A TypeScript implementation of a formula parser and interpreter
 * @packageDocumentation
 */

export const VERSION = '1.0.0';

// Lexer 模块
export { Token, TokenType, isOperator, isKeyword, getTokenTypeName, KEYWORDS, Lexer } from './lexer';

// 错误类型
export { LexerError } from './errors';
```

**Step 3: 创建 Lexer 模块文档**

```markdown
// src/lexer/README.md
# Lexer 模块

词法分析器模块，负责将通达信公式文本转换为 Token 流。

## 使用示例

\`\`\`typescript
import { Lexer } from 'formula-ts';

const lexer = new Lexer('MA5: MA(CLOSE, 5);');
const tokens = lexer.tokenize();

tokens.forEach(token => {
  console.log(token.toString());
});
\`\`\`

## 支持的 Token 类型

### 字面量
- NUMBER: 数字（123, 45.67, .5）
- IDENTIFIER: 标识符（CLOSE, MA5, VAR1）

### 运算符
- 算术运算符: +, -, *, /
- 比较运算符: >, <, >=, <=, =, <>
- 逻辑运算符: AND, OR

### 分隔符
- 括号: (, )
- 其他: ,, ;

### 赋值和声明
- := 赋值（中间变量）
- : 输出（显示线）

### 注释
- // 行注释

## API

### Lexer 类

#### 构造函数
\`\`\`typescript
new Lexer(input: string)
\`\`\`

#### 方法

**tokenize(): Token[]**
- 将整个输入转换为 Token 数组
- 返回包含 EOF token 的完整 token 列表

**nextToken(): Token**
- 获取下一个 Token
- 用于流式处理

## 错误处理

词法分析器会抛出 `LexerError`：
- 包含错误位置（行号、列号）
- 提供清晰的错误描述
- 给出修复建议

## 设计特点

1. **位置跟踪**: 每个 Token 包含准确的行号和列号
2. **注释支持**: 自动跳过 // 行注释
3. **关键字识别**: 不区分大小写识别关键字
4. **友好错误**: 提供详细的错误信息和修复建议
\`\`\`

**Step 4: 运行完整测试**

Run: `npm test`

Expected: 所有测试通过

**Step 5: 检查测试覆盖率**

Run: `npm run test:coverage`

Expected: Lexer.ts 覆盖率 > 90%

**Step 6: 提交代码**

```bash
git add src/lexer/ src/index.ts
git commit -m "docs(lexer): add module documentation and exports

- Update lexer module exports
- Export Lexer from main index
- Add Lexer README with usage examples
- Document all token types and features"
```

---

## Sprint 2 完成检查清单

- [ ] Lexer 类实现完整，支持所有 token 类型
- [ ] 支持数字、标识符、运算符、分隔符
- [ ] 支持注释（// 行注释）
- [ ] 关键字大小写不敏感
- [ ] 位置跟踪准确（行号、列号）
- [ ] 错误信息清晰友好
- [ ] 集成测试覆盖经典指标公式
- [ ] 单元测试覆盖率 > 90%
- [ ] 模块导出正确
- [ ] 文档完整

---

## 下一步

Sprint 2 完成后，继续 Sprint 3: AST 定义和语法分析器

参考文档: `docs/plans/2025-11-14-sprint-3-parser.md`

---

## 技术注意事项

### Lexer 设计原则

1. **单一职责**: Lexer 只负责识别 token，不做语法验证
2. **错误恢复**: 遇到错误立即抛出，不尝试恢复
3. **性能考虑**: 使用单次扫描，避免回溯

### 测试策略

1. **TDD 优先**: 每个特性先写测试
2. **边界测试**: 测试空输入、单字符、超长输入
3. **集成测试**: 测试真实的公式场景

### 常见问题

Q: 为什么不支持块注释（/* */）？
A: 通达信公式不支持块注释，只支持行注释

Q: 标识符可以以数字开头吗？
A: 不可以，必须以字母或下划线开头

---

**Sprint 2 预计工时**: 7-10 个工作日
**关键里程碑**: 完成词法分析器，可以将公式文本转换为 Token 流
