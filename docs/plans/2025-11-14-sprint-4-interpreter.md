# Sprint 4: 解释器和核心函数

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现解释器核心，支持 AST 遍历执行，实现 10 个核心函数，完成 MVP 功能

**Architecture:** 使用 Visitor 模式遍历 AST，通过 FunctionRegistry 管理函数，通过 Context 管理变量和市场数据

**Tech Stack:** TypeScript 5.9+, Jest 30.2+

**Duration:** 1-2 周

**Dependencies:** Sprint 3 完成（Parser）

---

## Task 1: 类型定义

**Files:**
- Create: `src/types/MarketData.ts`
- Create: `src/types/FormulaResult.ts`
- Create: `src/types/FormulaFunction.ts`

**MarketData 接口:**
```typescript
export interface MarketData {
  open: number[];
  close: number[];
  high: number[];
  low: number[];
  volume: number[];
  amount?: number[];
}
```

**FormulaResult 接口:**
```typescript
export interface FormulaResult {
  outputs: OutputLine[];
  variables: Record<string, number[]>;
}

export interface OutputLine {
  name: string;
  values: number[];
  style?: StyleProperties;
}
```

---

## Task 2: 执行上下文（Context）

**Files:**
- Create: `src/interpreter/Context.ts`
- Create: `src/interpreter/__tests__/Context.test.ts`

**实现内容:**
```typescript
export class Context {
  private marketData: MarketData;
  private variables: Map<string, number[]>;
  private dataLength: number;

  constructor(marketData: MarketData);

  getMarketData(name: string): number[];
  setVariable(name: string, values: number[]): void;
  getVariable(name: string): number[];
  hasVariable(name: string): boolean;
  getDataLength(): number;
}
```

---

## Task 3: 函数注册表（FunctionRegistry）

**Files:**
- Create: `src/interpreter/FunctionRegistry.ts`
- Create: `src/interpreter/__tests__/FunctionRegistry.test.ts`

**实现内容:**
```typescript
export type FormulaFunction = (args: number[][], dataLength: number) => number[];

export class FunctionRegistry {
  private functions: Map<string, FormulaFunction>;

  register(name: string, fn: FormulaFunction): void;
  get(name: string): FormulaFunction;
  has(name: string): boolean;

  static createDefault(): FunctionRegistry;
}
```

---

## Task 4: 核心函数实现（10 个）

**Files:**
- Create: `src/interpreter/functions/math.ts`
- Create: `src/interpreter/functions/reference.ts`
- Create: `src/interpreter/functions/logical.ts`
- Create: `src/interpreter/functions/__tests__/math.test.ts`
- Create: `src/interpreter/functions/__tests__/reference.test.ts`
- Create: `src/interpreter/functions/__tests__/logical.test.ts`

### 数学函数（math.ts）

**1. MA - 移动平均**
```typescript
export function MA(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    result[i] = sum / period;
  }

  return result;
}
```

**2. EMA - 指数移动平均**
```typescript
export function EMA(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);
  const multiplier = 2 / (period + 1);

  result[0] = data[0];

  for (let i = 1; i < data.length; i++) {
    result[i] = (data[i] - result[i - 1]) * multiplier + result[i - 1];
  }

  return result;
}
```

**3. SUM - 求和**
```typescript
export function SUM(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    result[i] = sum;
  }

  return result;
}
```

### 引用函数（reference.ts）

**4. REF - 引用前 N 个周期的值**
```typescript
export function REF(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result[i] = NaN;
    } else {
      result[i] = data[i - period];
    }
  }

  return result;
}
```

**5. HHV - 最高值**
```typescript
export function HHV(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    let max = data[i];
    for (let j = 1; j < period; j++) {
      max = Math.max(max, data[i - j]);
    }
    result[i] = max;
  }

  return result;
}
```

**6. LLV - 最低值**
```typescript
export function LLV(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result[i] = NaN;
      continue;
    }

    let min = data[i];
    for (let j = 1; j < period; j++) {
      min = Math.min(min, data[i - j]);
    }
    result[i] = min;
  }

  return result;
}
```

### 逻辑函数（logical.ts）

**7. IF - 条件**
```typescript
export function IF(condition: number[], trueValue: number[], falseValue: number[]): number[] {
  const result: number[] = new Array(condition.length);

  for (let i = 0; i < condition.length; i++) {
    result[i] = condition[i] !== 0 ? trueValue[i] : falseValue[i];
  }

  return result;
}
```

**8. CROSS - 交叉**
```typescript
export function CROSS(a: number[], b: number[]): number[] {
  const result: number[] = new Array(a.length);

  result[0] = 0;
  for (let i = 1; i < a.length; i++) {
    // a 向上穿过 b
    result[i] = (a[i] > b[i] && a[i - 1] <= b[i - 1]) ? 1 : 0;
  }

  return result;
}
```

### 工具函数

**9. MAX - 最大值**
```typescript
export function MAX(a: number[], b: number[]): number[] {
  const result: number[] = new Array(a.length);

  for (let i = 0; i < a.length; i++) {
    result[i] = Math.max(a[i], b[i]);
  }

  return result;
}
```

**10. MIN - 最小值**
```typescript
export function MIN(a: number[], b: number[]): number[] {
  const result: number[] = new Array(a.length);

  for (let i = 0; i < a.length; i++) {
    result[i] = Math.min(a[i], b[i]);
  }

  return result;
}
```

---

## Task 5: 解释器实现（Interpreter）

**Files:**
- Create: `src/interpreter/Interpreter.ts`
- Create: `src/interpreter/__tests__/Interpreter.test.ts`

**实现内容:**

```typescript
export class Interpreter implements ASTVisitor<number[]> {
  private context: Context;
  private registry: FunctionRegistry;

  constructor(context: Context, registry?: FunctionRegistry);

  interpret(ast: Program): FormulaResult;

  visitProgram(node: Program): number[];
  visitAssignStatement(node: AssignStatement): number[];
  visitOutputStatement(node: OutputStatement): number[];
  visitBinaryExpression(node: BinaryExpression): number[];
  visitUnaryExpression(node: UnaryExpression): number[];
  visitCallExpression(node: CallExpression): number[];
  visitNumberLiteral(node: NumberLiteral): number[];
  visitIdentifier(node: Identifier): number[];
  visitGroupExpression(node: GroupExpression): number[];
}
```

**关键实现:**

### 二元运算
```typescript
visitBinaryExpression(node: BinaryExpression): number[] {
  const left = node.left.accept(this);
  const right = node.right.accept(this);
  const dataLength = this.context.getDataLength();
  const result: number[] = new Array(dataLength);

  for (let i = 0; i < dataLength; i++) {
    switch (node.operator) {
      case TokenType.PLUS:
        result[i] = left[i] + right[i];
        break;
      case TokenType.MINUS:
        result[i] = left[i] - right[i];
        break;
      case TokenType.MULTIPLY:
        result[i] = left[i] * right[i];
        break;
      case TokenType.DIVIDE:
        result[i] = right[i] !== 0 ? left[i] / right[i] : NaN;
        break;
      case TokenType.GREATER_THAN:
        result[i] = left[i] > right[i] ? 1 : 0;
        break;
      // ... 其他运算符
    }
  }

  return result;
}
```

### 函数调用
```typescript
visitCallExpression(node: CallExpression): number[] {
  const funcName = node.callee.name.toUpperCase();

  if (!this.registry.has(funcName)) {
    throw new RuntimeError(`Function '${funcName}' not found`);
  }

  const func = this.registry.get(funcName);
  const args = node.arguments.map(arg => arg.accept(this));

  return func(args, this.context.getDataLength());
}
```

---

## Task 6: FormulaEngine 主入口

**Files:**
- Create: `src/FormulaEngine.ts`
- Create: `src/__tests__/FormulaEngine.test.ts`

**实现内容:**

```typescript
export class FormulaEngine {
  compile(source: string): CompiledFormula;
}

export class CompiledFormula {
  private ast: Program;

  constructor(ast: Program);

  execute(marketData: MarketData): FormulaResult;
}
```

---

## Task 7: 集成测试（经典指标）

**Files:**
- Create: `tests/integration/indicators.test.ts`
- Create: `tests/fixtures/market-data.json`

**测试指标:**
1. MA5, MA10, MA20
2. 简单 MACD
3. 简单 KDJ

---

## Sprint 4 完成检查清单

- [ ] 10 个核心函数实现并测试
- [ ] Interpreter 支持所有 AST 节点
- [ ] Context 正确管理变量和数据
- [ ] FunctionRegistry 正确注册和调用函数
- [ ] FormulaEngine 提供简洁的 API
- [ ] 集成测试验证经典指标
- [ ] 测试覆盖率 > 85%
- [ ] 计算结果准确（误差 < 0.01%）

---

## 下一步

Sprint 4 完成后，继续 Sprint 5: 扩展功能

参考文档: `docs/plans/2025-11-14-sprint-5-advanced.md`

---

**Sprint 4 预计工时**: 7-10 个工作日
**关键里程碑**: 完成 MVP，可以执行基本的技术指标公式
