# Phase 4 - Stage 1 设计文档：K线形态与时间函数

**日期**: 2025-11-14
**阶段**: Phase 4, Stage 1
**目标**: 扩展基础数据层 - K线形态函数和时间函数

## 项目背景

当前项目已完成 Phase 1-3，实现了：
- ✅ 完整的编译器管道（Lexer → Parser → AST → Interpreter）
- ✅ 24 个内置函数（数学、引用、逻辑、统计、技术分析）
- ✅ 增量计算优化（2.42x 速度提升）
- ✅ Demo 页面 + VSCode 扩展
- ✅ 361 个测试用例，95.36% 覆盖率

### 扩展计划

Phase 4-6 将系统性扩展函数库，分为三个阶段：

- **Stage 1 (本阶段)**: K线形态 + 时间函数（基础数据层）- 约 20-25 个函数
- **Stage 2**: 高级技术指标函数（计算层）- 约 15 个函数
- **Stage 3**: 画线 + 财务数据函数（展示层 + 数据层）- 约 20-25 个函数

## Stage 1 目标

实现 **20-25 个新函数**，分为两大类别：

### 1. K线形态函数 (12-15 个)

#### 基础行情字段访问 (8 个)
- `OPEN` - 开盘价
- `HIGH` - 最高价
- `LOW` - 最低价
- `CLOSE` - 收盘价
- `VOL` - 成交量
- `AMOUNT` - 成交额
- `ADVANCE` - 涨家数（指数专用）
- `DECLINE` - 跌家数（指数专用）

#### 形态判断函数 (5 个)
- `UPNDAY(n)` - 连续 n 天上涨
- `DOWNNDAY(n)` - 连续 n 天下跌
- `NDAY(cond, n)` - 条件连续满足 n 天
- `RANGE(A, B, C)` - A 在 B 和 C 之间
- `BETWEEN(A, B, C)` - 同 RANGE

#### 筹码与价值函数 (6 个)
- `WINNER(price)` - 价格位置的获利盘比例
- `LWINNER(price)` - 浮动获利盘比例
- `COST(percent)` - 获利比例对应的成本价
- `VALUEWHEN(cond, X)` - 条件满足时 X 的值
- `TOPRANGE(X)` - X 是否为近期最高
- `LOWRANGE(X)` - X 是否为近期最低

### 2. 时间函数 (8-10 个)

#### 时间组件提取 (8 个)
- `DATE` - 日期（YYYYMMDD 格式）
- `TIME` - 时间（HHMMSS 格式）
- `YEAR` - 年份
- `MONTH` - 月份 (1-12)
- `DAY` - 日 (1-31)
- `HOUR` - 小时 (0-23)
- `MINUTE` - 分钟 (0-59)
- `WEEKDAY` - 星期几 (1-7，1=周一)

#### 周期信息 (4 个)
- `BARSCOUNT` - 总 K 线数量
- `BARSSINCE(cond)` - 从首次条件满足至今的周期数
- `ISLASTBAR` - 是否最后一根 K 线
- `PERIOD` - 周期类型（自动推断）
- `DATETODAY(date)` - 指定日期到当前的天数

## 数据模型扩展

### MarketData 类型扩展

```typescript
// src/market/MarketData.ts
export interface MarketData {
  // 现有字段（必需）
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];

  // 新增字段
  timestamp: number[];        // 必需 - Unix 时间戳（毫秒）
  amount?: number[];          // 可选 - 成交额
  tradableShares?: number[];  // 可选 - 流通股本（用于筹码计算）
  advance?: number[];         // 可选 - 涨家数（指数专用）
  decline?: number[];         // 可选 - 跌家数（指数专用）
}
```

### 验证逻辑更新

**必需字段验证**:
- `timestamp` 必须存在且长度与其他字段一致
- `timestamp` 必须递增（不允许倒序）
- `timestamp` 值必须在合理范围内（1970-2100年）

**可选字段验证**:
- `amount`, `tradableShares`, `advance`, `decline` 如果存在，长度必须匹配
- 缺失时，相关函数抛出友好错误

### 向后兼容性

- ✅ 现有 24 个函数不访问新字段
- ✅ 现有 361 个测试继续通过
- ✅ 只需在测试 mock 数据中添加 `timestamp` 字段

## K线形态函数设计

### 文件组织

将 K线形态函数分为 3 个模块：

#### 1. `src/interpreter/functions/marketData.ts`
基础行情字段访问函数（8 个）

```typescript
export const OPEN: FormulaFunction = {
  name: 'OPEN',
  minArgs: 0,
  maxArgs: 0,
  execute: (args, context) => {
    return context.marketData.open;
  }
};

export const AMOUNT: FormulaFunction = {
  name: 'AMOUNT',
  minArgs: 0,
  maxArgs: 0,
  execute: (args, context) => {
    if (!context.marketData.amount) {
      throw new RuntimeError(
        'AMOUNT function requires marketData.amount field',
        0, 0
      );
    }
    return context.marketData.amount;
  }
};

// HIGH, LOW, CLOSE, VOL, ADVANCE, DECLINE 类似实现
```

#### 2. `src/interpreter/functions/pattern.ts`
形态判断函数（5 个）

```typescript
export const UPNDAY: FormulaFunction = {
  name: 'UPNDAY',
  minArgs: 1,
  maxArgs: 1,
  execute: (args, context) => {
    const n = Math.floor(args[0][0]);
    const close = context.marketData.close;
    const result = new Array(close.length).fill(0);

    for (let i = n; i < close.length; i++) {
      let isUpN = true;
      for (let j = 0; j < n; j++) {
        if (close[i - j] <= close[i - j - 1]) {
          isUpN = false;
          break;
        }
      }
      result[i] = isUpN ? 1 : 0;
    }

    return result;
  }
};

export const RANGE: FormulaFunction = {
  name: 'RANGE',
  minArgs: 3,
  maxArgs: 3,
  execute: (args) => {
    const [A, B, C] = args;
    const len = Math.max(A.length, B.length, C.length);
    const result = new Array(len).fill(0);

    for (let i = 0; i < len; i++) {
      const a = A[Math.min(i, A.length - 1)];
      const b = B[Math.min(i, B.length - 1)];
      const c = C[Math.min(i, C.length - 1)];
      const min = Math.min(b, c);
      const max = Math.max(b, c);
      result[i] = (a >= min && a <= max) ? 1 : 0;
    }

    return result;
  }
};

// DOWNNDAY, NDAY, BETWEEN 类似实现
```

#### 3. `src/interpreter/functions/chip.ts`
筹码与价值函数（6 个）

```typescript
export const WINNER: FormulaFunction = {
  name: 'WINNER',
  minArgs: 1,
  maxArgs: 1,
  execute: (args, context) => {
    const price = args[0];
    const { close, volume, tradableShares } = context.marketData;

    if (!tradableShares) {
      throw new RuntimeError(
        'WINNER function requires marketData.tradableShares field',
        0, 0
      );
    }

    // 筹码分布算法
    return calculateChipDistribution(close, volume, tradableShares, price);
  }
};

// 筹码分布核心算法
function calculateChipDistribution(
  close: number[],
  volume: number[],
  tradableShares: number[],
  targetPrice: number[]
): number[] {
  const result = new Array(close.length).fill(0);

  for (let i = 0; i < close.length; i++) {
    // 计算成本分布
    const costDist = buildCostDistribution(close, volume, i);

    // 计算目标价格位置的获利盘比例
    result[i] = calculateWinnerRatio(costDist, targetPrice[i]);
  }

  return result;
}

// LWINNER, COST, VALUEWHEN, TOPRANGE, LOWRANGE 实现
```

## 时间函数设计

### 文件组织

将时间函数分为 2 个模块：

#### 1. `src/interpreter/functions/datetime.ts`
时间组件提取函数（8 个）

```typescript
export const DATE: FormulaFunction = {
  name: 'DATE',
  minArgs: 0,
  maxArgs: 0,
  execute: (args, context) => {
    return context.marketData.timestamp.map(ts => {
      const date = new Date(ts);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return parseInt(`${year}${month}${day}`);
    });
  }
};

export const TIME: FormulaFunction = {
  name: 'TIME',
  minArgs: 0,
  maxArgs: 0,
  execute: (args, context) => {
    return context.marketData.timestamp.map(ts => {
      const date = new Date(ts);
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      const second = String(date.getSeconds()).padStart(2, '0');
      return parseInt(`${hour}${minute}${second}`);
    });
  }
};

export const WEEKDAY: FormulaFunction = {
  name: 'WEEKDAY',
  minArgs: 0,
  maxArgs: 0,
  execute: (args, context) => {
    return context.marketData.timestamp.map(ts => {
      const day = new Date(ts).getDay();
      return day === 0 ? 7 : day; // 转换为 1-7（1=周一）
    });
  }
};

// YEAR, MONTH, DAY, HOUR, MINUTE 类似实现
```

#### 2. `src/interpreter/functions/period.ts`
周期信息函数（4 个）

```typescript
export const BARSCOUNT: FormulaFunction = {
  name: 'BARSCOUNT',
  minArgs: 0,
  maxArgs: 0,
  execute: (args, context) => {
    const count = context.marketData.close.length;
    return new Array(count).fill(count);
  }
};

export const PERIOD: FormulaFunction = {
  name: 'PERIOD',
  minArgs: 0,
  maxArgs: 0,
  execute: (args, context) => {
    const period = detectPeriod(context.marketData.timestamp);
    const count = context.marketData.close.length;
    return new Array(count).fill(period);
  }
};

// 周期自动推断算法
function detectPeriod(timestamps: number[]): number {
  if (timestamps.length < 2) return 101; // 默认日线

  // 计算相邻K线的平均时间差
  const diffs: number[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    diffs.push(timestamps[i] - timestamps[i - 1]);
  }

  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;

  // 根据时间差判断周期类型
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  if (avgDiff < 1.5 * MINUTE) return 1;      // 1分钟
  if (avgDiff < 7 * MINUTE) return 5;        // 5分钟
  if (avgDiff < 20 * MINUTE) return 15;      // 15分钟
  if (avgDiff < 45 * MINUTE) return 30;      // 30分钟
  if (avgDiff < 1.5 * HOUR) return 60;       // 60分钟
  if (avgDiff < 1.5 * DAY) return 101;       // 日线
  if (avgDiff < 8 * DAY) return 102;         // 周线
  return 103;                                 // 月线
}

export const ISLASTBAR: FormulaFunction = {
  name: 'ISLASTBAR',
  minArgs: 0,
  maxArgs: 0,
  execute: (args, context) => {
    const len = context.marketData.close.length;
    const result = new Array(len).fill(0);
    result[len - 1] = 1;
    return result;
  }
};

// BARSSINCE, DATETODAY 实现
```

## 测试策略

### 测试数据准备

创建完整的测试 fixtures：

```typescript
// tests/fixtures/marketData.ts
export const mockDailyData: MarketData = {
  open: [100, 102, 101, 103, 105, ...],  // 100个交易日
  high: [105, 106, 105, 107, 109, ...],
  low: [99, 101, 100, 102, 104, ...],
  close: [103, 104, 103, 105, 107, ...],
  volume: [1000000, 1200000, 900000, ...],
  timestamp: [
    new Date('2024-01-02').getTime(),
    new Date('2024-01-03').getTime(),
    // ... 100个交易日
  ],
  amount: [103000000, 124800000, ...],  // volume * avgPrice
  tradableShares: [10000000, 10000000, ...],
};

export const mock5MinData: MarketData = {
  // 1天内的5分钟K线（48条）
  timestamp: [
    new Date('2024-01-02 09:30:00').getTime(),
    new Date('2024-01-02 09:35:00').getTime(),
    // ... 每5分钟一条
  ],
  // ...
};

export const mock1MinData: MarketData = {
  // 1小时内的1分钟K线（60条）
  timestamp: [
    new Date('2024-01-02 09:30:00').getTime(),
    new Date('2024-01-02 09:31:00').getTime(),
    // ... 每1分钟一条
  ],
  // ...
};
```

### 测试覆盖

**单元测试**（约 150-200 个新测试）:

1. **MarketData 验证测试** (`tests/market/MarketData.test.ts`)
   - timestamp 必需字段验证
   - timestamp 递增性验证
   - 可选字段验证
   - 错误提示友好性

2. **基础行情字段函数测试** (`tests/interpreter/functions/marketData.test.ts`)
   - 每个函数的基本功能（8 个函数 × 5 个测试 = 40 个）
   - 可选字段缺失时的错误处理

3. **形态判断函数测试** (`tests/interpreter/functions/pattern.test.ts`)
   - UPNDAY/DOWNNDAY 各种 n 值
   - NDAY 不同条件
   - RANGE/BETWEEN 边界条件
   - 约 40 个测试

4. **筹码函数测试** (`tests/interpreter/functions/chip.test.ts`)
   - WINNER/LWINNER 不同价格位置
   - COST 不同获利比例
   - VALUEWHEN 条件触发
   - TOPRANGE/LOWRANGE 判断
   - 约 50 个测试

5. **时间函数测试** (`tests/interpreter/functions/datetime.test.ts`)
   - DATE/TIME 格式正确性
   - YEAR/MONTH/DAY/HOUR/MINUTE 提取正确性
   - WEEKDAY 周一到周日
   - 约 40 个测试

6. **周期函数测试** (`tests/interpreter/functions/period.test.ts`)
   - PERIOD 不同周期自动推断（1分钟、5分钟、日线等）
   - BARSCOUNT 正确性
   - ISLASTBAR 最后一根判断
   - BARSSINCE 计数正确性
   - 约 30 个测试

**集成测试** (`tests/FormulaEngine.test.ts`):
- 组合新旧函数的公式
- 实际场景公式（如：`UPNDAY(3) AND CROSS(MA(CLOSE,5), MA(CLOSE,10))`）
- 增量计算兼容性
- 约 20 个新测试

**性能测试** (`tests/performance/functions.test.ts`):
- 时间函数性能（避免重复 Date 对象创建）
- 筹码函数性能（WINNER/COST 计算优化）
- 约 10 个测试

### 测试目标

- ✅ 保持 95%+ 代码覆盖率
- ✅ 新增约 200-250 个测试用例
- ✅ 所有现有 361 个测试继续通过
- ✅ 总测试数达到 560-610 个

## 实现计划

### 任务分解

将 Stage 1 分为 **6 个主要任务**：

#### Task 0: 数据模型扩展
**文件**:
- `src/market/MarketData.ts` - 扩展类型定义
- `tests/market/MarketData.test.ts` - 更新测试
- `tests/fixtures/marketData.ts` - 创建完整 mock 数据

**工作内容**:
1. 扩展 `MarketData` 接口（添加 5 个新字段）
2. 更新 `validateMarketData` 函数
3. 添加 timestamp 验证逻辑（必需、递增、合理范围）
4. 创建 3 套测试数据（日线、5分钟线、1分钟线）
5. 更新所有现有测试的 mock 数据（添加 timestamp）

**预估**:
- 代码: ~150 行
- 测试: ~30 个新测试
- 现有测试更新: 15 个文件

#### Task 1: 基础行情字段函数
**文件**:
- `src/interpreter/functions/marketData.ts` - 新建
- `tests/interpreter/functions/marketData.test.ts` - 新建

**工作内容**:
1. 实现 8 个函数：OPEN, HIGH, LOW, CLOSE, VOL, AMOUNT, ADVANCE, DECLINE
2. 可选字段缺失时的错误处理
3. 注册到 FunctionRegistry

**预估**:
- 代码: ~200 行
- 测试: ~40 个测试

#### Task 2: 时间函数
**文件**:
- `src/interpreter/functions/datetime.ts` - 新建（8 个函数）
- `src/interpreter/functions/period.ts` - 新建（4 个函数）
- `tests/interpreter/functions/datetime.test.ts` - 新建
- `tests/interpreter/functions/period.test.ts` - 新建

**工作内容**:
1. 实现 8 个时间组件提取函数
2. 实现周期自动推断算法
3. 实现 4 个周期信息函数
4. 注册到 FunctionRegistry

**预估**:
- 代码: ~400 行
- 测试: ~70 个测试

#### Task 3: 形态判断函数
**文件**:
- `src/interpreter/functions/pattern.ts` - 新建
- `tests/interpreter/functions/pattern.test.ts` - 新建

**工作内容**:
1. 实现 5 个函数：UPNDAY, DOWNNDAY, NDAY, RANGE, BETWEEN
2. 处理边界条件（前 n 根K线）
3. 注册到 FunctionRegistry

**预估**:
- 代码: ~250 行
- 测试: ~40 个测试

#### Task 4: 筹码与价值函数
**文件**:
- `src/interpreter/functions/chip.ts` - 新建
- `tests/interpreter/functions/chip.test.ts` - 新建

**工作内容**:
1. 实现筹码分布算法
2. 实现 6 个函数：WINNER, LWINNER, COST, VALUEWHEN, TOPRANGE, LOWRANGE
3. 性能优化（缓存中间结果）
4. 注册到 FunctionRegistry

**预估**:
- 代码: ~400 行
- 测试: ~50 个测试

#### Task 5: 集成与文档
**文件**:
- `src/interpreter/FunctionRegistry.ts` - 更新注册
- `tests/FormulaEngine.test.ts` - 集成测试
- `tests/performance/functions.test.ts` - 性能测试
- `README.md` - 更新文档
- `demo/examples.ts` - 新增示例
- `vscode-extension/syntaxes/tdx-formula.tmLanguage.json` - 更新语法
- `vscode-extension/snippets/tdx-formula.code-snippets` - 新增代码片段

**工作内容**:
1. 确保所有新函数正确注册
2. 添加集成测试（组合使用新旧函数）
3. 添加性能测试
4. 更新 README（新增 20+ 个函数文档）
5. Demo 页面新增 3-5 个示例公式
6. VSCode 扩展新增语法高亮和代码片段

**预估**:
- 代码: ~200 行
- 测试: ~30 个测试
- 文档: ~500 行更新

### 执行策略

使用**并行批量执行**：

**Batch 1**（基础数据层，必须先完成）:
- Task 0: 数据模型扩展

**Batch 2**（独立并行）:
- Task 1: 基础行情字段函数
- Task 2: 时间函数
- Task 3: 形态判断函数

**Batch 3**（依赖 Task 0）:
- Task 4: 筹码与价值函数

**Batch 4**（集成，依赖所有任务）:
- Task 5: 集成与文档

### 预估总工作量

- **新增代码**: ~1,600 行
- **新增测试**: ~230 个测试用例
- **现有测试更新**: 15 个文件
- **文档更新**: ~500 行
- **开发时间**: 3-5 天

## 技术细节与注意事项

### 1. 周期自动推断算法

**核心思路**:
- 分析相邻 K 线的时间差
- 计算平均时间间隔
- 根据间隔范围映射到周期类型

**周期类型映射**:
```
1   = 1分钟线
5   = 5分钟线
15  = 15分钟线
30  = 30分钟线
60  = 60分钟线
101 = 日线
102 = 周线
103 = 月线
```

**边界处理**:
- 跳过非交易时间（如隔夜、周末）的影响
- 使用中位数而非平均值（更鲁棒）
- 至少需要 2 根 K 线才能推断

### 2. 筹码分布算法

**WINNER 算法原理**:
1. 构建成本分布：每个价格档位的持仓量
2. 计算累积分布：价格从低到高累积
3. 获利盘比例 = 目标价格以下的持仓量 / 总持仓量

**简化实现**:
```typescript
function calculateWinnerRatio(
  close: number[],
  volume: number[],
  targetPrice: number,
  lookback: number = 100  // 回溯周期
): number {
  let totalVolume = 0;
  let winVolume = 0;

  for (let i = 0; i < lookback; i++) {
    totalVolume += volume[i];
    if (close[i] < targetPrice) {
      winVolume += volume[i];
    }
  }

  return totalVolume > 0 ? winVolume / totalVolume : 0;
}
```

**性能优化**:
- 使用滑动窗口（只保留最近 N 个周期）
- 缓存中间计算结果
- 增量更新（新增一根 K 线时）

### 3. 向后兼容性保证

**现有测试必须通过**:
- 361 个现有测试全部继续通过
- 只需在 mock 数据中添加 `timestamp` 字段

**增量计算兼容性**:
- 新函数支持增量计算
- `IncrementalContext` 能够缓存新函数的结果

**API 不变**:
- `FormulaEngine.evaluate()` 接口不变
- `FormulaEngine.evaluateIncremental()` 接口不变

### 4. 错误处理

**缺失字段错误**:
```typescript
if (!marketData.amount) {
  throw new RuntimeError(
    'AMOUNT function requires marketData.amount field. ' +
    'Please provide the "amount" field in your market data.',
    node.line,
    node.column
  );
}
```

**时间戳验证错误**:
```typescript
// 检查递增性
for (let i = 1; i < timestamps.length; i++) {
  if (timestamps[i] <= timestamps[i - 1]) {
    throw new ValidationError(
      `Timestamp at index ${i} (${timestamps[i]}) must be greater than ` +
      `previous timestamp (${timestamps[i - 1]})`
    );
  }
}

// 检查合理范围
const MIN_TIMESTAMP = new Date('1970-01-01').getTime();
const MAX_TIMESTAMP = new Date('2100-01-01').getTime();

for (let i = 0; i < timestamps.length; i++) {
  if (timestamps[i] < MIN_TIMESTAMP || timestamps[i] > MAX_TIMESTAMP) {
    throw new ValidationError(
      `Timestamp at index ${i} (${timestamps[i]}) is out of reasonable range ` +
      `(1970-2100)`
    );
  }
}
```

### 5. 性能优化策略

**时间函数优化**:
```typescript
// 不好：每次都创建新的 Date 对象
const dates = timestamps.map(ts => new Date(ts).getFullYear());

// 好：复用 Date 对象
const date = new Date();
const years = timestamps.map(ts => {
  date.setTime(ts);
  return date.getFullYear();
});
```

**筹码函数优化**:
- 使用滑动窗口限制回溯周期（默认 100）
- 缓存成本分布结果
- 增量计算时只更新最新部分

**目标性能**:
- 时间函数：< 5ms（1000 根 K 线）
- 筹码函数：< 50ms（1000 根 K 线，100 周期回溯）

## 验收标准

### 功能完整性
- ✅ 实现所有 20-25 个计划中的函数
- ✅ 所有函数正确注册到 FunctionRegistry
- ✅ Demo 页面能够使用所有新函数

### 测试质量
- ✅ 所有新函数有完整的单元测试
- ✅ 集成测试覆盖组合使用场景
- ✅ 所有现有 361 个测试继续通过
- ✅ 代码覆盖率保持在 95%+

### 文档完整性
- ✅ README 更新所有新函数的文档
- ✅ 每个函数有使用示例
- ✅ VSCode 扩展支持新函数的语法高亮
- ✅ 代码片段包含新函数

### 性能要求
- ✅ 时间函数执行时间 < 5ms（1000 根 K 线）
- ✅ 筹码函数执行时间 < 50ms（1000 根 K 线）
- ✅ 增量计算继续有效

## 后续计划

### Stage 2 预览
**高级技术指标函数**（约 15 个）:
- MACD, KDJ, SAR, CCI, DMI, TRIX
- OBV, BIAS, ROC, MTM, WR
- ADX, ADXR
- 预估时间：3-5 天

### Stage 3 预览
**画线 + 财务数据函数**（约 20-25 个）:
- 画线函数：DRAWLINE, DRAWTEXT, DRAWNUMBER, DRAWICON, STICKLINE 等
- 财务数据：FINANCE, CAPITAL, DYNAINFO 等
- 预估时间：4-6 天

## 总结

Stage 1 将实现 **20-25 个基础函数**，为后续的高级功能奠定坚实基础：

- 📊 **K线形态函数** - 完整的行情数据访问和形态判断
- ⏰ **时间函数** - 智能周期识别和时间组件提取
- 💎 **筹码函数** - 专业的成本分布和获利分析
- 🧪 **高质量测试** - 230+ 新测试，95%+ 覆盖率
- 📚 **完整文档** - 函数说明、示例、VSCode 支持

预计开发时间：**3-5 天**
