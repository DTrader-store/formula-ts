# Sprint 3: AST 和语法分析器

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 定义完整的 AST 节点类型，实现递归下降语法分析器，将 Token 流转换为抽象语法树

**Architecture:** 使用递归下降解析法（Recursive Descent Parsing），每个语法规则对应一个解析方法。AST 节点采用 Visitor 模式设计，便于后续解释器遍历执行。

**Tech Stack:** TypeScript 5.9+, Jest 30.2+

**Duration:** 1-2 周

**Dependencies:** Sprint 2 完成（Lexer）

---

## Task 1: AST 节点类型定义

**Files:**
- Create: `src/parser/ast/ASTNode.ts` - 基础节点接口
- Create: `src/parser/ast/expressions.ts` - 表达式节点
- Create: `src/parser/ast/statements.ts` - 语句节点
- Create: `src/parser/ast/visitor.ts` - Visitor 接口
- Create: `src/parser/ast/__tests__/nodes.test.ts`

**实现内容:**

### ASTNode 基础接口

```typescript
export interface ASTNode {
  readonly kind: string;
  readonly line: number;
  readonly column: number;
  accept<T>(visitor: ASTVisitor<T>): T;
}
```

### 表达式节点（expressions.ts）

1. **NumberLiteral** - 数字字面量
   - value: number

2. **Identifier** - 标识符
   - name: string

3. **BinaryExpression** - 二元运算
   - left: Expression
   - operator: TokenType
   - right: Expression

4. **UnaryExpression** - 一元运算
   - operator: TokenType
   - operand: Expression

5. **CallExpression** - 函数调用
   - callee: Identifier
   - arguments: Expression[]

6. **GroupExpression** - 括号表达式
   - expression: Expression

### 语句节点（statements.ts）

1. **AssignStatement** - 变量赋值
   - name: Identifier
   - value: Expression

2. **OutputStatement** - 输出声明
   - name: Identifier
   - value: Expression
   - style?: StyleProperties

3. **Program** - 程序根节点
   - statements: Statement[]

**提交:**
```bash
git commit -m "feat(parser): define AST node types

- Add base ASTNode interface
- Define expression nodes (literal, binary, unary, call, group)
- Define statement nodes (assign, output, program)
- Add Visitor pattern interface"
```

---

## Task 2: ParserError 错误类

**Files:**
- Create: `src/errors/ParserError.ts`
- Create: `src/errors/__tests__/ParserError.test.ts`

**实现内容:**

```typescript
export class ParserError extends Error {
  constructor(message: string, token: Token, suggestion?: string);

  static unexpectedToken(token: Token, expected: string): ParserError;
  static expectedExpression(token: Token): ParserError;
  static expectedIdentifier(token: Token): ParserError;
  static unclosedParenthesis(token: Token): ParserError;
}
```

**提交:**
```bash
git commit -m "feat(errors): add ParserError with token context"
```

---

## Task 3: Parser 基础框架

**Files:**
- Create: `src/parser/Parser.ts`
- Create: `src/parser/__tests__/Parser.test.ts`

**实现内容:**

```typescript
export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]);

  parse(): Program;

  // 辅助方法
  private peek(): Token;
  private previous(): Token;
  private advance(): Token;
  private isAtEnd(): boolean;
  private check(type: TokenType): boolean;
  private match(...types: TokenType[]): boolean;
  private consume(type: TokenType, message: string): Token;
}
```

**测试重点:**
- 空程序解析
- Token 消费和位置跟踪
- 错误处理

**提交:**
```bash
git commit -m "feat(parser): add Parser basic framework"
```

---

## Task 4: 表达式解析（递归下降）

**Files:**
- Modify: `src/parser/Parser.ts`
- Modify: `src/parser/__tests__/Parser.test.ts`

**语法规则（优先级从低到高）:**

```
expression     → logical_or
logical_or     → logical_and ( "OR" logical_and )*
logical_and    → comparison ( "AND" comparison )*
comparison     → term ( ( ">" | "<" | ">=" | "<=" | "=" | "<>" ) term )*
term           → factor ( ( "+" | "-" ) factor )*
factor         → unary ( ( "*" | "/" ) unary )*
unary          → ( "-" ) unary | call
call           → primary ( "(" arguments? ")" )?
primary        → NUMBER | IDENTIFIER | "(" expression ")"
arguments      → expression ( "," expression )*
```

**实现步骤:**

### Step 1: Primary 表达式（数字、标识符、括号）

```typescript
private primary(): Expression {
  if (this.match(TokenType.NUMBER)) {
    const token = this.previous();
    return new NumberLiteral(parseFloat(token.value), token.line, token.column);
  }

  if (this.match(TokenType.IDENTIFIER)) {
    const token = this.previous();
    return new Identifier(token.value, token.line, token.column);
  }

  if (this.match(TokenType.LEFT_PAREN)) {
    const expr = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression");
    return new GroupExpression(expr);
  }

  throw ParserError.expectedExpression(this.peek());
}
```

**测试:** 解析 `123`, `CLOSE`, `(1+2)`

### Step 2: 函数调用

```typescript
private call(): Expression {
  let expr = this.primary();

  if (this.match(TokenType.LEFT_PAREN)) {
    const args = this.arguments();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments");
    expr = new CallExpression(expr as Identifier, args);
  }

  return expr;
}

private arguments(): Expression[] {
  const args: Expression[] = [];

  if (!this.check(TokenType.RIGHT_PAREN)) {
    do {
      args.push(this.expression());
    } while (this.match(TokenType.COMMA));
  }

  return args;
}
```

**测试:** 解析 `MA(CLOSE, 5)`, `SUM(CLOSE, 10)`

### Step 3: 一元运算

```typescript
private unary(): Expression {
  if (this.match(TokenType.MINUS)) {
    const operator = this.previous();
    const right = this.unary();
    return new UnaryExpression(operator.type, right, operator.line, operator.column);
  }

  return this.call();
}
```

**测试:** 解析 `-123`, `-(CLOSE + 1)`

### Step 4: 二元运算（factor, term, comparison）

```typescript
private factor(): Expression {
  let expr = this.unary();

  while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE)) {
    const operator = this.previous();
    const right = this.unary();
    expr = new BinaryExpression(expr, operator.type, right, operator.line, operator.column);
  }

  return expr;
}

private term(): Expression {
  let expr = this.factor();

  while (this.match(TokenType.PLUS, TokenType.MINUS)) {
    const operator = this.previous();
    const right = this.factor();
    expr = new BinaryExpression(expr, operator.type, right, operator.line, operator.column);
  }

  return expr;
}

private comparison(): Expression {
  let expr = this.term();

  while (this.match(
    TokenType.GREATER_THAN,
    TokenType.LESS_THAN,
    TokenType.GREATER_EQUAL,
    TokenType.LESS_EQUAL,
    TokenType.EQUAL,
    TokenType.NOT_EQUAL
  )) {
    const operator = this.previous();
    const right = this.term();
    expr = new BinaryExpression(expr, operator.type, right, operator.line, operator.column);
  }

  return expr;
}
```

**测试:** 解析 `1 + 2 * 3`, `CLOSE > OPEN`, `(1 + 2) * (3 - 4)`

### Step 5: 逻辑运算

```typescript
private logicalAnd(): Expression {
  let expr = this.comparison();

  while (this.match(TokenType.AND)) {
    const operator = this.previous();
    const right = this.comparison();
    expr = new BinaryExpression(expr, operator.type, right, operator.line, operator.column);
  }

  return expr;
}

private logicalOr(): Expression {
  let expr = this.logicalAnd();

  while (this.match(TokenType.OR)) {
    const operator = this.previous();
    const right = this.logicalAnd();
    expr = new BinaryExpression(expr, operator.type, right, operator.line, operator.column);
  }

  return expr;
}

private expression(): Expression {
  return this.logicalOr();
}
```

**测试:** 解析 `CLOSE > OPEN AND VOLUME > 1000`

**提交:**
```bash
git commit -m "feat(parser): implement expression parsing

- Support number, identifier, parentheses
- Support function calls with arguments
- Support unary operators (-)
- Support binary operators (+, -, *, /, >, <, etc.)
- Support logical operators (AND, OR)
- Follow correct operator precedence"
```

---

## Task 5: 语句解析

**Files:**
- Modify: `src/parser/Parser.ts`
- Modify: `src/parser/__tests__/Parser.test.ts`

**语法规则:**

```
program        → statement* EOF
statement      → assignStatement | outputStatement
assignStatement → IDENTIFIER ":=" expression ";"
outputStatement → IDENTIFIER ":" expression ( "," styleProperty )* ";"
styleProperty  → IDENTIFIER
```

**实现:**

```typescript
parse(): Program {
  const statements: Statement[] = [];

  while (!this.isAtEnd()) {
    statements.push(this.statement());
  }

  return new Program(statements);
}

private statement(): Statement {
  if (this.match(TokenType.IDENTIFIER)) {
    const name = this.previous();

    if (this.match(TokenType.ASSIGN)) {
      return this.assignStatement(name);
    } else if (this.match(TokenType.OUTPUT)) {
      return this.outputStatement(name);
    }

    throw ParserError.unexpectedToken(this.peek(), "':=' or ':'");
  }

  throw ParserError.expectedExpression(this.peek());
}

private assignStatement(name: Token): AssignStatement {
  const value = this.expression();
  this.consume(TokenType.SEMICOLON, "Expect ';' after statement");

  return new AssignStatement(
    new Identifier(name.value, name.line, name.column),
    value,
    name.line,
    name.column
  );
}

private outputStatement(name: Token): OutputStatement {
  const value = this.expression();

  // 解析绘图属性
  const style: string[] = [];
  while (this.match(TokenType.COMMA)) {
    if (this.match(TokenType.IDENTIFIER)) {
      style.push(this.previous().value);
    }
  }

  this.consume(TokenType.SEMICOLON, "Expect ';' after statement");

  return new OutputStatement(
    new Identifier(name.value, name.line, name.column),
    value,
    style,
    name.line,
    name.column
  );
}
```

**测试:**
- `VAR1 := CLOSE + 1;`
- `MA5: MA(CLOSE, 5);`
- `MA5: MA(CLOSE, 5), COLORRED, LINETHICK2;`

**提交:**
```bash
git commit -m "feat(parser): implement statement parsing

- Support variable assignment (:=)
- Support output declaration (:)
- Support style properties (COLORRED, etc.)
- Complete program parsing"
```

---

## Task 6: 集成测试

**Files:**
- Create: `src/parser/__tests__/Parser.integration.test.ts`

**测试内容:**

1. 完整的 MA 公式
2. 完整的 MACD 公式
3. 完整的 KDJ 公式
4. 错误处理测试

**示例:**

```typescript
it('should parse MA formula', () => {
  const source = 'MA5: MA(CLOSE, 5);';
  const lexer = new Lexer(source);
  const parser = new Parser(lexer.tokenize());
  const ast = parser.parse();

  expect(ast.statements).toHaveLength(1);
  expect(ast.statements[0]).toBeInstanceOf(OutputStatement);

  const stmt = ast.statements[0] as OutputStatement;
  expect(stmt.name.name).toBe('MA5');
  expect(stmt.value).toBeInstanceOf(CallExpression);
});
```

**提交:**
```bash
git commit -m "test(parser): add integration tests for complete formulas"
```

---

## Task 7: 模块导出和文档

**Files:**
- Create: `src/parser/index.ts`
- Modify: `src/index.ts`
- Create: `src/parser/README.md`

**提交:**
```bash
git commit -m "docs(parser): add module documentation and exports"
```

---

## Sprint 3 完成检查清单

- [ ] AST 节点类型定义完整
- [ ] Parser 支持所有表达式类型
- [ ] Parser 支持语句（赋值、输出）
- [ ] 运算符优先级正确
- [ ] 支持绘图属性解析
- [ ] 集成测试覆盖经典公式
- [ ] 单元测试覆盖率 > 85%
- [ ] ParserError 提供友好错误信息
- [ ] 文档完整

---

## 下一步

Sprint 3 完成后，继续 Sprint 4: 解释器和核心函数

参考文档: `docs/plans/2025-11-14-sprint-4-interpreter.md`

---

**Sprint 3 预计工时**: 7-10 个工作日
**关键里程碑**: 完成语法分析器，可以将 Token 流转换为 AST
