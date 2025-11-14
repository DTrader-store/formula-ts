# Sprint 5: 扩展功能和性能优化

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 扩展函数库至 20-30 个，支持绘图属性，实现增量计算，优化性能

**Architecture:** 扩展 FunctionRegistry，添加更多技术分析函数；实现增量计算缓存机制；优化数组操作性能

**Tech Stack:** TypeScript 5.9+, Jest 30.2+

**Duration:** 1-2 周

**Dependencies:** Sprint 4 完成（Interpreter）

---

## Task 1: 扩展数学统计函数（10 个）

**Files:**
- Modify: `src/interpreter/functions/math.ts`
- Modify: `src/interpreter/functions/__tests__/math.test.ts`

**新增函数:**

1. **SMA - 简单移动平均（加权）**
2. **DMA - 动态移动平均**
3. **WMA - 加权移动平均**
4. **STD - 标准差**
5. **VAR - 方差**
6. **AVEDEV - 平均绝对偏差**
7. **SLOPE - 线性回归斜率**
8. **ABS - 绝对值**
9. **POW - 幂运算**
10. **SQRT - 平方根**

**示例实现 - SMA:**
```typescript
export function SMA(data: number[], n: number, m: number): number[] {
  // SMA(X, N, M) = (M * X + (N - M) * SMA(X, N, M).prev) / N
  const result: number[] = new Array(data.length);

  result[0] = data[0];
  for (let i = 1; i < data.length; i++) {
    result[i] = (m * data[i] + (n - m) * result[i - 1]) / n;
  }

  return result;
}
```

**提交:**
```bash
git commit -m "feat(functions): add 10 mathematical/statistical functions"
```

---

## Task 2: 扩展引用和逻辑函数（8 个）

**Files:**
- Modify: `src/interpreter/functions/reference.ts`
- Modify: `src/interpreter/functions/logical.ts`

**引用函数:**
1. **EVERY - 是否所有周期都满足**
2. **EXIST - 是否存在满足的周期**
3. **BARSLAST - 上次条件成立的周期数**
4. **COUNT - 统计满足条件的周期数**

**逻辑函数:**
5. **FILTER - 过滤信号**
6. **NOT - 逻辑非**
7. **BETWEEN - 范围判断**
8. **VALUEWHEN - 条件成立时的值**

**示例 - EVERY:**
```typescript
export function EVERY(condition: number[], period: number): number[] {
  const result: number[] = new Array(condition.length);

  for (let i = 0; i < condition.length; i++) {
    if (i < period - 1) {
      result[i] = 0;
      continue;
    }

    let allTrue = true;
    for (let j = 0; j < period; j++) {
      if (condition[i - j] === 0) {
        allTrue = false;
        break;
      }
    }
    result[i] = allTrue ? 1 : 0;
  }

  return result;
}
```

---

## Task 3: 绘图属性支持

**Files:**
- Create: `src/types/StyleProperties.ts`
- Modify: `src/parser/ast/statements.ts`
- Modify: `src/interpreter/Interpreter.ts`

**StyleProperties 定义:**
```typescript
export interface StyleProperties {
  color?: string;
  lineWidth?: number;
  lineType?: 'solid' | 'dashed' | 'stick';
}

export const COLOR_MAP: Record<string, string> = {
  'COLORRED': '#FF0000',
  'COLORGREEN': '#00FF00',
  'COLORBLUE': '#0000FF',
  'COLORWHITE': '#FFFFFF',
  'COLORYELLOW': '#FFFF00',
  'COLORPINK': '#FF00FF',
  'COLORCYAN': '#00FFFF',
};

export const LINE_THICK_MAP: Record<string, number> = {
  'LINETHICK1': 1,
  'LINETHICK2': 2,
  'LINETHICK3': 3,
  'LINETHICK4': 4,
  'LINETHICK5': 5,
};

export function parseStyleProperties(styleTokens: string[]): StyleProperties {
  const style: StyleProperties = {};

  for (const token of styleTokens) {
    const upper = token.toUpperCase();

    if (COLOR_MAP[upper]) {
      style.color = COLOR_MAP[upper];
    } else if (LINE_THICK_MAP[upper]) {
      style.lineWidth = LINE_THICK_MAP[upper];
    } else if (upper === 'DOTLINE') {
      style.lineType = 'dashed';
    } else if (upper === 'STICK') {
      style.lineType = 'stick';
    }
  }

  return style;
}
```

**提交:**
```bash
git commit -m "feat(types): add style properties support

- Support color properties (COLORRED, etc.)
- Support line width (LINETHICK1-5)
- Support line type (DOTLINE, STICK)
- Add style parser utility"
```

---

## Task 4: 增量计算实现

**Files:**
- Create: `src/interpreter/IncrementalContext.ts`
- Create: `src/interpreter/__tests__/IncrementalContext.test.ts`
- Modify: `src/FormulaEngine.ts`

**设计思路:**
- 缓存中间计算结果
- 只计算新增数据点
- 支持增量更新

**IncrementalContext 实现:**
```typescript
export class IncrementalContext extends Context {
  private cache: Map<string, number[]>;
  private lastDataLength: number;

  constructor(marketData: MarketData);

  appendData(newData: Partial<MarketData>): void;
  getIncrementalVariables(): Record<string, number[]>;
  clearCache(): void;
}
```

**CompiledFormula 增量执行:**
```typescript
export class CompiledFormula {
  private incrementalContext?: IncrementalContext;

  executeIncremental(newData: Partial<MarketData>): FormulaResult {
    if (!this.incrementalContext) {
      throw new Error('Incremental execution not initialized');
    }

    this.incrementalContext.appendData(newData);
    return this.execute(this.incrementalContext);
  }

  enableIncremental(initialData: MarketData): void {
    this.incrementalContext = new IncrementalContext(initialData);
  }
}
```

**提交:**
```bash
git commit -m "feat(interpreter): implement incremental calculation

- Add IncrementalContext for caching
- Support append-only data updates
- Optimize recalculation for new data points"
```

---

## Task 5: 性能优化

**Files:**
- Create: `tests/performance/benchmark.test.ts`
- Modify: 多个核心函数实现

**优化策略:**

### 1. 数组预分配
```typescript
// 之前
const result = [];
for (let i = 0; i < data.length; i++) {
  result.push(calculate(data[i]));
}

// 优化后
const result = new Array(data.length);
for (let i = 0; i < data.length; i++) {
  result[i] = calculate(data[i]);
}
```

### 2. 避免重复计算
```typescript
// 之前
for (let i = 0; i < data.length; i++) {
  result[i] = data[i] * 2 + data[i] / 3;
}

// 优化后
for (let i = 0; i < data.length; i++) {
  const val = data[i];
  result[i] = val * 2 + val / 3;
}
```

### 3. 使用 TypedArray（可选）
```typescript
// 对于大数据量，使用 Float64Array
export function MA(data: number[], period: number): Float64Array {
  const result = new Float64Array(data.length);
  // ...
}
```

**性能基准测试:**
```typescript
describe('Performance benchmarks', () => {
  it('should calculate MA for 10000 points in < 100ms', () => {
    const data = generateRandomData(10000);
    const start = performance.now();

    const result = MA(data, 20);

    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it('should execute MACD formula for 10000 points in < 500ms', () => {
    // ... 完整 MACD 测试
  });
});
```

**提交:**
```bash
git commit -m "perf: optimize function calculations

- Pre-allocate arrays for better performance
- Reduce redundant calculations
- Add performance benchmarks
- Target: 10K points < 1s"
```

---

## Task 6: RuntimeError 错误类

**Files:**
- Create: `src/errors/RuntimeError.ts`
- Create: `src/errors/__tests__/RuntimeError.test.ts`

**实现内容:**
```typescript
export class RuntimeError extends Error {
  constructor(message: string, node?: ASTNode);

  static divisionByZero(node: ASTNode): RuntimeError;
  static functionNotFound(name: string, node: ASTNode): RuntimeError;
  static invalidArguments(funcName: string, expected: number, got: number): RuntimeError;
  static variableNotFound(name: string, node: ASTNode): RuntimeError;
}
```

**提交:**
```bash
git commit -m "feat(errors): add RuntimeError for execution errors"
```

---

## Task 7: 完整集成测试

**Files:**
- Modify: `tests/integration/indicators.test.ts`
- Create: `tests/integration/advanced-indicators.test.ts`

**测试内容:**

1. **MACD** - 使用 EMA 和扩展函数
2. **KDJ** - 使用 SMA, HHV, LLV
3. **BOLL** - 使用 MA, STD
4. **RSI** - 使用 SMA, REF
5. **增量计算验证**
6. **性能测试**

**示例测试:**
```typescript
it('should calculate complete MACD indicator', () => {
  const formula = `
    DIF: EMA(CLOSE, 12) - EMA(CLOSE, 26);
    DEA: EMA(DIF, 9);
    MACD: (DIF - DEA) * 2, STICK;
  `;

  const engine = new FormulaEngine();
  const compiled = engine.compile(formula);
  const result = compiled.execute(marketData);

  expect(result.outputs).toHaveLength(3);
  expect(result.outputs[0].name).toBe('DIF');
  expect(result.outputs[1].name).toBe('DEA');
  expect(result.outputs[2].name).toBe('MACD');

  // 验证绘图属性
  expect(result.outputs[2].style?.lineType).toBe('stick');

  // 验证数值（与通达信对比）
  // ...
});
```

---

## Sprint 5 完成检查清单

- [ ] 函数库扩展到 20-30 个
- [ ] 所有新函数经过测试验证
- [ ] 绘图属性解析和应用正确
- [ ] 增量计算功能可用
- [ ] 性能达标（10K 点 < 1s）
- [ ] 集成测试覆盖 5+ 经典指标
- [ ] 测试覆盖率保持 > 85%
- [ ] 与通达信结果误差 < 0.01%

---

## 下一步

Sprint 5 完成后，继续 Sprint 6: 图表格式化和文档

参考文档: `docs/plans/2025-11-14-sprint-6-chart-docs.md`

---

**Sprint 5 预计工时**: 7-10 个工作日
**关键里程碑**: 功能完善，性能达标，可用于生产环境
