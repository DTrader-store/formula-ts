# Sprint 1: Token 系统和项目基础设施

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 建立项目基础设施，实现 Token 类型系统，为词法分析器奠定基础

**Architecture:** 采用 TDD 方式开发，先定义 Token 类型枚举，再实现 Token 类，最后完善测试配置。Token 是编译器的最小单元，包含类型、值、位置信息。

**Tech Stack:** TypeScript 5.9+, Jest 30.2+, ESLint, Prettier

**Duration:** 1 周

---

## Task 1: TypeScript 和 Jest 配置

**Files:**
- Verify: `tsconfig.json`
- Verify: `jest.config.js`
- Create: `src/lexer/TokenType.ts`

**Step 1: 检查 TypeScript 配置**

检查 `tsconfig.json` 是否存在且配置正确。

Run: `cat tsconfig.json`

Expected: 应包含 `strict: true`, `target: "ES2020"`, `module: "commonjs"` 等配置

**Step 2: 检查 Jest 配置**

检查 `jest.config.js` 是否配置 ts-jest。

Run: `cat jest.config.js`

Expected: 应包含 `preset: 'ts-jest'`, `testEnvironment: 'node'`

**Step 3: 验证测试环境**

运行空测试确保环境正常。

Run: `npm test`

Expected: 应显示 "No tests found" 或类似信息，但不应报错

---

## Task 2: TokenType 枚举定义

**Files:**
- Create: `src/lexer/TokenType.ts`
- Create: `src/lexer/__tests__/TokenType.test.ts`

**Step 1: 编写 TokenType 枚举的测试**

创建测试文件，验证 TokenType 枚举的完整性。

```typescript
// src/lexer/__tests__/TokenType.test.ts
import { TokenType, isOperator, isKeyword, getTokenTypeName } from '../TokenType';

describe('TokenType', () => {
  describe('Basic token types', () => {
    it('should have NUMBER token type', () => {
      expect(TokenType.NUMBER).toBeDefined();
    });

    it('should have IDENTIFIER token type', () => {
      expect(TokenType.IDENTIFIER).toBeDefined();
    });

    it('should have EOF token type', () => {
      expect(TokenType.EOF).toBeDefined();
    });
  });

  describe('Operator token types', () => {
    it('should have arithmetic operators', () => {
      expect(TokenType.PLUS).toBeDefined();
      expect(TokenType.MINUS).toBeDefined();
      expect(TokenType.MULTIPLY).toBeDefined();
      expect(TokenType.DIVIDE).toBeDefined();
    });

    it('should have comparison operators', () => {
      expect(TokenType.GREATER_THAN).toBeDefined();
      expect(TokenType.LESS_THAN).toBeDefined();
      expect(TokenType.GREATER_EQUAL).toBeDefined();
      expect(TokenType.LESS_EQUAL).toBeDefined();
      expect(TokenType.EQUAL).toBeDefined();
      expect(TokenType.NOT_EQUAL).toBeDefined();
    });

    it('should identify operators correctly', () => {
      expect(isOperator(TokenType.PLUS)).toBe(true);
      expect(isOperator(TokenType.MULTIPLY)).toBe(true);
      expect(isOperator(TokenType.NUMBER)).toBe(false);
    });
  });

  describe('Keyword token types', () => {
    it('should have logical keywords', () => {
      expect(TokenType.AND).toBeDefined();
      expect(TokenType.OR).toBeDefined();
    });

    it('should identify keywords correctly', () => {
      expect(isKeyword(TokenType.AND)).toBe(true);
      expect(isKeyword(TokenType.OR)).toBe(true);
      expect(isKeyword(TokenType.NUMBER)).toBe(false);
    });
  });

  describe('Helper functions', () => {
    it('should get token type name', () => {
      expect(getTokenTypeName(TokenType.NUMBER)).toBe('NUMBER');
      expect(getTokenTypeName(TokenType.PLUS)).toBe('PLUS');
      expect(getTokenTypeName(TokenType.AND)).toBe('AND');
    });
  });
});
```

**Step 2: 运行测试确认失败**

Run: `npm test -- TokenType.test.ts`

Expected: 测试失败，提示 `Cannot find module '../TokenType'`

**Step 3: 实现 TokenType 枚举**

创建 TokenType 枚举及辅助函数。

```typescript
// src/lexer/TokenType.ts

/**
 * Token 类型枚举
 * 定义通达信公式支持的所有 token 类型
 */
export enum TokenType {
  // 字面量
  NUMBER = 'NUMBER',           // 数字: 123, 45.67
  IDENTIFIER = 'IDENTIFIER',   // 标识符: CLOSE, MA5, VAR1

  // 运算符
  PLUS = 'PLUS',               // +
  MINUS = 'MINUS',             // -
  MULTIPLY = 'MULTIPLY',       // *
  DIVIDE = 'DIVIDE',           // /

  // 比较运算符
  GREATER_THAN = 'GREATER_THAN',       // >
  LESS_THAN = 'LESS_THAN',             // <
  GREATER_EQUAL = 'GREATER_EQUAL',     // >=
  LESS_EQUAL = 'LESS_EQUAL',           // <=
  EQUAL = 'EQUAL',                     // =
  NOT_EQUAL = 'NOT_EQUAL',             // <>

  // 逻辑运算符（关键字）
  AND = 'AND',                 // AND
  OR = 'OR',                   // OR

  // 分隔符
  LEFT_PAREN = 'LEFT_PAREN',       // (
  RIGHT_PAREN = 'RIGHT_PAREN',     // )
  COMMA = 'COMMA',                 // ,
  SEMICOLON = 'SEMICOLON',         // ;

  // 赋值和声明
  ASSIGN = 'ASSIGN',           // :=
  OUTPUT = 'OUTPUT',           // :

  // 特殊
  EOF = 'EOF',                 // 文件结束
  UNKNOWN = 'UNKNOWN',         // 未知字符
}

/**
 * 判断是否为运算符
 */
export function isOperator(type: TokenType): boolean {
  const operators = new Set([
    TokenType.PLUS,
    TokenType.MINUS,
    TokenType.MULTIPLY,
    TokenType.DIVIDE,
    TokenType.GREATER_THAN,
    TokenType.LESS_THAN,
    TokenType.GREATER_EQUAL,
    TokenType.LESS_EQUAL,
    TokenType.EQUAL,
    TokenType.NOT_EQUAL,
  ]);
  return operators.has(type);
}

/**
 * 判断是否为关键字
 */
export function isKeyword(type: TokenType): boolean {
  const keywords = new Set([
    TokenType.AND,
    TokenType.OR,
  ]);
  return keywords.has(type);
}

/**
 * 获取 TokenType 的字符串名称
 */
export function getTokenTypeName(type: TokenType): string {
  return type;
}

/**
 * 关键字映射表
 */
export const KEYWORDS: Record<string, TokenType> = {
  'AND': TokenType.AND,
  'OR': TokenType.OR,
};
```

**Step 4: 运行测试确认通过**

Run: `npm test -- TokenType.test.ts`

Expected: 所有测试通过

**Step 5: 提交代码**

```bash
git add src/lexer/TokenType.ts src/lexer/__tests__/TokenType.test.ts
git commit -m "feat(lexer): add TokenType enum and helper functions

- Define all token types for TDX formula syntax
- Add isOperator, isKeyword helper functions
- Add KEYWORDS mapping table
- Test coverage for TokenType enum"
```

---

## Task 3: Token 类实现

**Files:**
- Create: `src/lexer/Token.ts`
- Create: `src/lexer/__tests__/Token.test.ts`

**Step 1: 编写 Token 类的测试**

```typescript
// src/lexer/__tests__/Token.test.ts
import { Token } from '../Token';
import { TokenType } from '../TokenType';

describe('Token', () => {
  describe('Constructor', () => {
    it('should create a token with all properties', () => {
      const token = new Token(TokenType.NUMBER, '123', 1, 5);

      expect(token.type).toBe(TokenType.NUMBER);
      expect(token.value).toBe('123');
      expect(token.line).toBe(1);
      expect(token.column).toBe(5);
    });

    it('should create a token with default line and column', () => {
      const token = new Token(TokenType.PLUS, '+');

      expect(token.type).toBe(TokenType.PLUS);
      expect(token.value).toBe('+');
      expect(token.line).toBe(0);
      expect(token.column).toBe(0);
    });
  });

  describe('toString', () => {
    it('should return formatted string representation', () => {
      const token = new Token(TokenType.NUMBER, '123', 1, 5);
      const str = token.toString();

      expect(str).toContain('NUMBER');
      expect(str).toContain('123');
      expect(str).toContain('1:5');
    });

    it('should handle tokens without position', () => {
      const token = new Token(TokenType.EOF, '');
      const str = token.toString();

      expect(str).toContain('EOF');
    });
  });

  describe('is', () => {
    it('should check token type correctly', () => {
      const token = new Token(TokenType.NUMBER, '123');

      expect(token.is(TokenType.NUMBER)).toBe(true);
      expect(token.is(TokenType.IDENTIFIER)).toBe(false);
    });
  });

  describe('isOneOf', () => {
    it('should check multiple token types', () => {
      const token = new Token(TokenType.PLUS, '+');

      expect(token.isOneOf([TokenType.PLUS, TokenType.MINUS])).toBe(true);
      expect(token.isOneOf([TokenType.MULTIPLY, TokenType.DIVIDE])).toBe(false);
    });

    it('should handle empty array', () => {
      const token = new Token(TokenType.NUMBER, '123');

      expect(token.isOneOf([])).toBe(false);
    });
  });

  describe('Static factory methods', () => {
    it('should create EOF token', () => {
      const token = Token.eof(1, 10);

      expect(token.type).toBe(TokenType.EOF);
      expect(token.value).toBe('');
      expect(token.line).toBe(1);
      expect(token.column).toBe(10);
    });

    it('should create NUMBER token', () => {
      const token = Token.number('123', 1, 5);

      expect(token.type).toBe(TokenType.NUMBER);
      expect(token.value).toBe('123');
    });

    it('should create IDENTIFIER token', () => {
      const token = Token.identifier('CLOSE', 1, 1);

      expect(token.type).toBe(TokenType.IDENTIFIER);
      expect(token.value).toBe('CLOSE');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string value', () => {
      const token = new Token(TokenType.EOF, '');

      expect(token.value).toBe('');
    });

    it('should handle negative line and column', () => {
      const token = new Token(TokenType.NUMBER, '123', -1, -1);

      expect(token.line).toBe(-1);
      expect(token.column).toBe(-1);
    });

    it('should handle very long value', () => {
      const longValue = 'A'.repeat(1000);
      const token = new Token(TokenType.IDENTIFIER, longValue);

      expect(token.value).toBe(longValue);
      expect(token.value.length).toBe(1000);
    });
  });
});
```

**Step 2: 运行测试确认失败**

Run: `npm test -- Token.test.ts`

Expected: 测试失败，提示 `Cannot find module '../Token'`

**Step 3: 实现 Token 类**

```typescript
// src/lexer/Token.ts
import { TokenType } from './TokenType';

/**
 * Token 类
 * 表示词法分析过程中的一个标记（token）
 */
export class Token {
  /**
   * @param type - Token 类型
   * @param value - Token 的文本值
   * @param line - Token 所在行号（从 1 开始）
   * @param column - Token 所在列号（从 1 开始）
   */
  constructor(
    public readonly type: TokenType,
    public readonly value: string,
    public readonly line: number = 0,
    public readonly column: number = 0,
  ) {}

  /**
   * 判断 token 是否为指定类型
   */
  is(type: TokenType): boolean {
    return this.type === type;
  }

  /**
   * 判断 token 是否为指定类型之一
   */
  isOneOf(types: TokenType[]): boolean {
    return types.includes(this.type);
  }

  /**
   * 返回 token 的字符串表示，用于调试
   */
  toString(): string {
    const position = this.line > 0 ? ` at ${this.line}:${this.column}` : '';
    return `Token(${this.type}, "${this.value}"${position})`;
  }

  // ===== 静态工厂方法 =====

  /**
   * 创建 EOF token
   */
  static eof(line: number = 0, column: number = 0): Token {
    return new Token(TokenType.EOF, '', line, column);
  }

  /**
   * 创建 NUMBER token
   */
  static number(value: string, line: number = 0, column: number = 0): Token {
    return new Token(TokenType.NUMBER, value, line, column);
  }

  /**
   * 创建 IDENTIFIER token
   */
  static identifier(value: string, line: number = 0, column: number = 0): Token {
    return new Token(TokenType.IDENTIFIER, value, line, column);
  }

  /**
   * 创建运算符 token
   */
  static operator(type: TokenType, value: string, line: number = 0, column: number = 0): Token {
    return new Token(type, value, line, column);
  }
}
```

**Step 4: 运行测试确认通过**

Run: `npm test -- Token.test.ts`

Expected: 所有测试通过

**Step 5: 提交代码**

```bash
git add src/lexer/Token.ts src/lexer/__tests__/Token.test.ts
git commit -m "feat(lexer): add Token class with position tracking

- Implement Token class with type, value, line, column
- Add helper methods: is(), isOneOf(), toString()
- Add static factory methods for common tokens
- Full test coverage for Token class"
```

---

## Task 4: 导出 Lexer 模块

**Files:**
- Create: `src/lexer/index.ts`
- Modify: `src/index.ts`

**Step 1: 创建 lexer 模块导出文件**

```typescript
// src/lexer/index.ts
/**
 * Lexer 模块
 * 负责词法分析，将公式文本转换为 token 流
 */

export { Token } from './Token';
export { TokenType, isOperator, isKeyword, getTokenTypeName, KEYWORDS } from './TokenType';
```

**Step 2: 更新主入口文件**

```typescript
// src/index.ts
/**
 * Formula-TS: A TypeScript implementation of a formula parser and interpreter
 * @packageDocumentation
 */

export const VERSION = '1.0.0';

// Lexer 模块
export { Token, TokenType, isOperator, isKeyword, getTokenTypeName, KEYWORDS } from './lexer';
```

**Step 3: 验证导出**

创建简单的导入测试：

```typescript
// src/__tests__/exports.test.ts
import { Token, TokenType, isOperator, VERSION } from '../index';

describe('Package exports', () => {
  it('should export VERSION', () => {
    expect(VERSION).toBe('1.0.0');
  });

  it('should export Token', () => {
    expect(Token).toBeDefined();
    const token = new Token(TokenType.NUMBER, '123');
    expect(token.type).toBe(TokenType.NUMBER);
  });

  it('should export TokenType', () => {
    expect(TokenType).toBeDefined();
    expect(TokenType.NUMBER).toBeDefined();
  });

  it('should export helper functions', () => {
    expect(isOperator).toBeDefined();
    expect(typeof isOperator).toBe('function');
  });
});
```

**Step 4: 运行测试**

Run: `npm test -- exports.test.ts`

Expected: 所有测试通过

**Step 5: 提交代码**

```bash
git add src/lexer/index.ts src/index.ts src/__tests__/exports.test.ts
git commit -m "feat: add lexer module exports

- Create lexer/index.ts for module exports
- Update main index.ts to export lexer components
- Add export verification tests"
```

---

## Task 5: 错误类型定义

**Files:**
- Create: `src/errors/LexerError.ts`
- Create: `src/errors/__tests__/LexerError.test.ts`
- Create: `src/errors/index.ts`

**Step 1: 编写 LexerError 的测试**

```typescript
// src/errors/__tests__/LexerError.test.ts
import { LexerError } from '../LexerError';

describe('LexerError', () => {
  describe('Constructor', () => {
    it('should create error with message and position', () => {
      const error = new LexerError('Unexpected character', 1, 5);

      expect(error.message).toContain('Unexpected character');
      expect(error.line).toBe(1);
      expect(error.column).toBe(5);
      expect(error.name).toBe('LexerError');
    });

    it('should include position in message', () => {
      const error = new LexerError('Invalid number', 2, 10);

      expect(error.message).toContain('2:10');
      expect(error.message).toContain('Invalid number');
    });

    it('should handle missing position', () => {
      const error = new LexerError('General error');

      expect(error.line).toBeUndefined();
      expect(error.column).toBeUndefined();
      expect(error.message).toContain('General error');
    });
  });

  describe('Error properties', () => {
    it('should be instance of Error', () => {
      const error = new LexerError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(LexerError);
    });

    it('should have stack trace', () => {
      const error = new LexerError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('LexerError');
    });
  });

  describe('Static factory methods', () => {
    it('should create unexpectedCharacter error', () => {
      const error = LexerError.unexpectedCharacter('$', 1, 5);

      expect(error.message).toContain('Unexpected character');
      expect(error.message).toContain('$');
      expect(error.line).toBe(1);
      expect(error.column).toBe(5);
    });

    it('should create invalidNumber error', () => {
      const error = LexerError.invalidNumber('12.34.56', 1, 1);

      expect(error.message).toContain('Invalid number');
      expect(error.message).toContain('12.34.56');
    });

    it('should create unterminatedString error', () => {
      const error = LexerError.unterminatedString(2, 15);

      expect(error.message).toContain('Unterminated string');
      expect(error.line).toBe(2);
      expect(error.column).toBe(15);
    });
  });

  describe('Error formatting', () => {
    it('should format error with suggestion', () => {
      const error = new LexerError('Unknown token', 1, 5, 'Did you mean CLOSE?');

      expect(error.message).toContain('Unknown token');
      expect(error.message).toContain('Did you mean CLOSE?');
    });
  });
});
```

**Step 2: 运行测试确认失败**

Run: `npm test -- LexerError.test.ts`

Expected: 测试失败，提示找不到模块

**Step 3: 实现 LexerError 类**

```typescript
// src/errors/LexerError.ts

/**
 * 词法分析错误
 * 在词法分析过程中遇到无法识别的字符或格式时抛出
 */
export class LexerError extends Error {
  public readonly line?: number;
  public readonly column?: number;
  public readonly suggestion?: string;

  constructor(message: string, line?: number, column?: number, suggestion?: string) {
    const position = line !== undefined && column !== undefined
      ? `[${line}:${column}] `
      : '';
    const suggestionText = suggestion ? `\n💡 ${suggestion}` : '';

    super(`${position}${message}${suggestionText}`);

    this.name = 'LexerError';
    this.line = line;
    this.column = column;
    this.suggestion = suggestion;

    // 保持正确的原型链
    Object.setPrototypeOf(this, LexerError.prototype);
  }

  // ===== 静态工厂方法 =====

  /**
   * 创建"未预期字符"错误
   */
  static unexpectedCharacter(char: string, line: number, column: number): LexerError {
    return new LexerError(
      `Unexpected character '${char}'`,
      line,
      column,
      'Check if this is a valid operator or identifier'
    );
  }

  /**
   * 创建"无效数字"错误
   */
  static invalidNumber(value: string, line: number, column: number): LexerError {
    return new LexerError(
      `Invalid number format '${value}'`,
      line,
      column,
      'Numbers should be in format: 123 or 123.45'
    );
  }

  /**
   * 创建"未终止字符串"错误
   */
  static unterminatedString(line: number, column: number): LexerError {
    return new LexerError(
      'Unterminated string literal',
      line,
      column,
      'Add closing quote'
    );
  }
}
```

**Step 4: 创建错误模块导出**

```typescript
// src/errors/index.ts
/**
 * 错误类型模块
 */

export { LexerError } from './LexerError';
```

**Step 5: 运行测试确认通过**

Run: `npm test -- LexerError.test.ts`

Expected: 所有测试通过

**Step 6: 更新主入口导出**

```typescript
// src/index.ts (修改部分)
/**
 * Formula-TS: A TypeScript implementation of a formula parser and interpreter
 * @packageDocumentation
 */

export const VERSION = '1.0.0';

// Lexer 模块
export { Token, TokenType, isOperator, isKeyword, getTokenTypeName, KEYWORDS } from './lexer';

// 错误类型
export { LexerError } from './errors';
```

**Step 7: 提交代码**

```bash
git add src/errors/ src/index.ts
git commit -m "feat(errors): add LexerError with position tracking

- Implement LexerError with line/column information
- Add static factory methods for common errors
- Include helpful error suggestions
- Export from main index"
```

---

## Task 6: 代码质量检查

**Files:**
- Verify: All files pass linting and formatting

**Step 1: 运行 ESLint 检查**

Run: `npm run lint`

Expected: 无错误或警告，如有问题按提示修复

**Step 2: 运行 Prettier 格式化检查**

Run: `npm run format:check`

Expected: 所有文件格式正确，如需要格式化运行 `npm run format`

**Step 3: 运行完整测试套件**

Run: `npm test`

Expected: 所有测试通过，测试覆盖率统计正常

**Step 4: 检查测试覆盖率**

Run: `npm run test:coverage`

Expected:
- Token.ts 覆盖率 > 95%
- TokenType.ts 覆盖率 > 90%
- LexerError.ts 覆盖率 > 90%

**Step 5: 构建项目**

Run: `npm run build`

Expected: 成功编译，生成 dist/ 目录和类型定义文件

**Step 6: 提交最终清理**

如果有任何格式化或小的修复：

```bash
git add .
git commit -m "chore: code quality fixes for Sprint 1

- Run prettier format
- Fix any lint warnings
- Verify test coverage"
```

---

## Sprint 1 完成检查清单

在进入 Sprint 2 之前，确认以下内容：

- [ ] TokenType 枚举定义完整，包含所有基本类型
- [ ] Token 类实现正确，包含位置信息
- [ ] LexerError 错误类提供友好的错误信息
- [ ] 所有模块正确导出
- [ ] 单元测试覆盖率 > 80%
- [ ] 代码通过 ESLint 和 Prettier 检查
- [ ] TypeScript 编译无错误
- [ ] Git 提交历史清晰，每个任务独立提交

---

## 下一步

Sprint 1 完成后，继续 Sprint 2: 词法分析器（Lexer）实现

参考文档: `docs/plans/2025-11-14-sprint-2-lexer.md`

---

## 技术注意事项

### Token 设计原则

1. **不可变性**: Token 的所有属性都是 readonly，创建后不可修改
2. **位置跟踪**: 记录行号和列号，便于错误定位
3. **类型安全**: 使用 TypeScript 枚举而非字符串字面量

### 错误处理原则

1. **信息完整**: 错误信息包含位置、描述、建议
2. **用户友好**: 提供可操作的修复建议
3. **可追溯**: 保留完整的堆栈跟踪

### 测试策略

1. **TDD 驱动**: 先写测试，确保测试失败，再实现功能
2. **边界测试**: 测试空字符串、极值、异常情况
3. **覆盖率目标**: 每个模块 > 80%

---

**Sprint 1 预计工时**: 5-7 个工作日
**关键里程碑**: 完成 Token 系统，为 Lexer 实现做准备
