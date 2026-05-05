# Formula-TS

[![npm version](https://img.shields.io/npm/v/@dtrader/formula-ts.svg)](https://www.npmjs.com/package/@dtrader/formula-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)

Formula-TS 是一个用 TypeScript 编写的通达信公式解析和执行引擎。它可以把公式文本解析为 AST，并基于 OHLCV 行情数据计算技术指标、变量、输出线和绘图事件，适合接入 Web 金融应用、量化策略工具、指标回测和自定义图表渲染流程。

当前包名为 `@dtrader/formula-ts`，版本为 `1.0.0`，构建产物输出到 `dist/`，以 CommonJS 形式发布，同时提供完整 TypeScript 类型声明。

## 项目概览

这个仓库主要包含四部分：

- `src/lexer`：词法分析器，把公式源码转换为 Token，支持数字、字符串、Unicode 标识符、运算符、注释和绘图样式关键字。
- `src/parser`：递归下降 Parser，把 Token 转为 AST，支持变量声明、输出声明、表达式语句、函数调用、运算符优先级和输出样式。
- `src/interpreter`：解释器和执行上下文，负责读取市场数据、计算表达式、调用内置函数、保存变量/输出和收集绘图事件。
- `demo`、`examples`、`tests`、`vscode-extension`：分别提供浏览器演示、公式示例、单元/集成/性能测试，以及 VSCode 通达信公式语法高亮扩展。

## 核心能力

- **通达信风格语法**：支持 `:=` 变量声明、`:` 输出声明、分号结尾、函数调用、括号表达式、`AND` / `OR` 逻辑运算。
- **行情字段访问**：支持 `OPEN/O`、`HIGH/H`、`LOW/L`、`CLOSE/C`、`VOLUME/VOL/V`、`AMOUNT/AMO`、`ADVANCE`、`DECLINE` 等字段。
- **内置函数体系**：覆盖数学、引用、逻辑、统计、技术指标、形态识别、筹码分布、行情访问、时间周期和绘图事件函数。
- **高级指标**：包含 MACD、KDJ、SAR、CCI、DMI、TRIX、OBV、BIAS、ROC、MTM、WR、PSY 等指标函数。
- **绘图事件输出**：`DRAWTEXT`、`DRAWICON`、`STICKLINE`、`DRAWLINE` 等函数不会直接渲染图表，而是生成结构化 `DrawingEvent`，方便调用方适配 Canvas、SVG、Lightweight Charts 或其他图表库。
- **增量计算 API**：`evaluateIncremental` 可在追加新 K 线后复用上一次结果，减少调用方手动维护历史变量和输出的成本。
- **类型安全与错误处理**：导出市场数据、公式结果、AST、Token、错误类型等定义，词法、语法和运行期错误有独立错误类。

## 安装

```bash
npm install @dtrader/formula-ts
```

也可以使用 Yarn 或 PNPM：

```bash
yarn add @dtrader/formula-ts
pnpm add @dtrader/formula-ts
```

## 快速开始

### 使用 FormulaEngine 计算指标

```typescript
import { FormulaEngine, MarketData } from '@dtrader/formula-ts';

const engine = new FormulaEngine();

const formula = `
  DIF := EMA(CLOSE, 12) - EMA(CLOSE, 26);
  DEA := EMA(DIF, 9);
  MACD: (DIF - DEA) * 2, COLORSTICK;
`;

const marketData: MarketData[] = [
  { open: 100, high: 105, low: 99, close: 102, volume: 1000, timestamp: 1704187800000 },
  { open: 102, high: 103, low: 100, close: 101, volume: 1100, timestamp: 1704274200000 },
  { open: 101, high: 106, low: 101, close: 103, volume: 1200, timestamp: 1704360600000 },
  // 继续追加更多 K 线数据
];

const result = engine.evaluate(formula, marketData);

console.log(result.outputs[0].name);      // MACD
console.log(result.outputs[0].data);      // MACD 序列
console.log(result.variables.DIF);        // 中间变量
console.log(result.drawings);             // 绘图事件
```

### 只解析公式

```typescript
import { FormulaEngine } from '@dtrader/formula-ts';

const engine = new FormulaEngine();
const ast = engine.parse('MA5: MA(CLOSE, 5), COLORRED;');

console.log(ast.body);
```

### 单独使用 Lexer 和 Parser

```typescript
import { Lexer, Parser } from '@dtrader/formula-ts';

const lexer = new Lexer('MA5: MA(CLOSE, 5);');
const tokens = lexer.tokenize();

const parser = new Parser(tokens);
const ast = parser.parse();
```

### 校验市场数据

```typescript
import { MarketData, validateMarketData } from '@dtrader/formula-ts';

const item: MarketData = {
  open: 100,
  high: 105,
  low: 99,
  close: 102,
  volume: 1000,
  amount: 102000,
  timestamp: Date.now(),
};

if (!validateMarketData(item)) {
  throw new Error('行情数据不合法');
}
```

### 增量计算

```typescript
import { FormulaEngine, MarketData } from '@dtrader/formula-ts';

const engine = new FormulaEngine();
const formula = `
  MA5 := MA(CLOSE, 5);
  MA10 := MA(CLOSE, 10);
  SIGNAL: IF(CROSS(MA5, MA10), 1, 0);
`;

const firstBatch: MarketData[] = loadInitialBars();
const firstResult = engine.evaluate(formula, firstBatch);

const nextBatch: MarketData[] = [...firstBatch, ...loadNewBars()];
const nextResult = engine.evaluateIncremental(formula, nextBatch, firstResult);

console.log(nextResult.outputs);
```

## 公式语法

### 变量和输出

```tdx
MA5 := MA(CLOSE, 5);
MA10 := MA(CLOSE, 10);
TREND: MA5 - MA10;
```

`:=` 用于声明中间变量，结果会进入 `FormulaResult.variables`。`:` 用于声明输出线，结果会同时进入 `FormulaResult.outputs` 和 `variables`。

### 表达式

```tdx
RANGE: HIGH - LOW;
MID: (HIGH + LOW) / 2;
ABOVE: CLOSE > MA(CLOSE, 20);
SIGNAL: CLOSE > OPEN AND VOL > MA(VOL, 5);
```

支持 `+`、`-`、`*`、`/`、`>`、`<`、`>=`、`<=`、`=`、`<>`、`AND`、`OR`。比较和逻辑表达式返回 `1` 或 `0`。

### 注释和字符串

```tdx
// 单行注释
{ 块注释 }
DRAWTEXT(CROSS(MA(C, 5), MA(C, 10)), C, 'B');
```

字符串支持单引号和双引号，主要用于绘图事件文本。

### 输出样式

```tdx
MA5: MA(C, 5), COLORRED, LINETHICK2;
MACD: (DIF - DEA) * 2, COLORSTICK;
VOLBAR: VOL, VOLSTICK;
HIDDEN: MA(C, 20), NODRAW;
```

Parser 会把样式解析到输出声明中，`FormulaEngine.evaluate` 会把样式带到 `OutputLine.style`。

## 主要 API

### FormulaEngine

```typescript
class FormulaEngine {
  constructor(registry?: FunctionRegistry);
  parse(formula: string): Program;
  evaluate(formula: string, marketData: MarketData[]): FormulaResult;
  evaluateIncremental(
    formula: string,
    newData: MarketData[],
    previousResult: FormulaResult
  ): FormulaResult;
  getRegistry(): FunctionRegistry;
}
```

### MarketData

```typescript
interface MarketData {
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
  amount?: number;
  tradableShares?: number;
  advance?: number;
  decline?: number;
}
```

`timestamp` 使用毫秒级 Unix 时间戳。`amount`、`tradableShares`、`advance`、`decline` 是可选字段，对应成交额、流通股本和指数上涨/下跌家数等扩展数据。

### FormulaResult

```typescript
interface FormulaResult {
  outputs: OutputLine[];
  variables: Record<string, number[]>;
  drawings?: DrawingEvent[];
}

interface OutputLine {
  name: string;
  data: number[];
  style?: LineStyle;
}

interface DrawingEvent {
  function: string;
  barIndex: number;
  values: Record<string, number>;
  text?: string;
  meta?: Record<string, string>;
}
```

### 错误类型

```typescript
import {
  FormulaError,
  LexerError,
  ParserError,
  RuntimeError,
} from '@dtrader/formula-ts';
```

- `LexerError`：非法字符、未闭合字符串、未闭合块注释等词法错误。
- `ParserError`：缺少分号、括号不匹配、函数参数为空等语法错误。
- `RuntimeError` / 普通运行期错误：未知函数、未知标识符、参数数量不匹配、空行情数据等执行错误。

## 内置函数分类

### 数学与统计

- 数学序列：`MA`、`EMA`、`SUM`、`MAX`、`MIN`、`ABS`、`SQRT`、`POW`、`EXP`、`LN`、`LOG`、`MOD`
- 取整和三角：`CEILING`、`FLOOR`、`INTPART`、`FRACPART`、`ROUND`、`ROUND2`、`SIGN`、`SIN`、`COS`、`TAN`、`ASIN`、`ACOS`、`ATAN`
- 统计：`STD`、`STDP`、`STDDEV`、`VAR`、`VARP`、`DEVSQ`、`FORCAST`、`SLOPE`、`COVAR`、`RELATE`、`BETA`、`MEDIAN`、`AVEDEV`

### 引用、逻辑和形态

- 引用：`REF`、`REFV`、`REFX`、`REFXV`、`HHV`、`LLV`、`HHVBARS`、`LLVBARS`
- 逻辑：`IF`、`IFF`、`IFN`、`CROSS`、`LONGCROSS`、`EVERY`、`EXIST`、`BARSLAST`、`BARSLASTCOUNT`、`COUNT`、`FILTER`、`NOT`
- 形态：`UPNDAY`、`DOWNNDAY`、`NDAY`、`LAST`、`EXISTR`、`RANGE`、`BETWEEN`

### 技术指标和筹码分布

- 基础技术函数：`SMA`、`WMA`、`DMA`、`CONST`、`RSI`
- 高级指标：`MACD_DIF`、`MACD_DEA`、`MACD_MACD`、`KDJ_K`、`KDJ_D`、`KDJ_J`、`SAR`、`CCI`、`DMI_PDI`、`DMI_MDI`、`DMI_ADX`、`DMI_ADXR`、`ADX`、`ADXR`、`TRIX`、`OBV`、`BIAS`、`ROC`、`MTM`、`WR`、`PSY`
- 筹码和价值：`WINNER`、`LWINNER`、`COST`、`VALUEWHEN`、`TOPRANGE`、`LOWRANGE`

### 行情、时间和周期

- 行情字段：`OPEN`、`HIGH`、`LOW`、`CLOSE`、`VOL`、`AMOUNT`、`ADVANCE`、`DECLINE`
- 时间：`DATE`、`TIME`、`YEAR`、`MONTH`、`DAY`、`HOUR`、`MINUTE`、`WEEKDAY`
- 周期：`PERIOD`、`BARSCOUNT`、`CURRBARSCOUNT`、`TOTALBARSCOUNT`、`ISLASTBAR`、`BARSTATUS`、`BARSSINCE`、`SUMBARS`

### 绘图事件

- `DRAWTEXT(condition, price, text)`
- `DRAWICON(condition, price, iconType)`
- `DRAWNUMBER(condition, price, number)`
- `STICKLINE(condition, price1, price2, width, empty)`
- `DRAWLINE(cond1, price1, cond2, price2, expand)`
- `POLYLINE(condition, price)`
- `DRAWBAND(upper, upperColor, lower, lowerColor)`
- `DRAWKLINE(high, open, low, close)`

绘图函数会把事件写入 `FormulaResult.drawings`。调用方需要自行把事件映射到具体图表组件。

## 示例公式

### 均线

```tdx
MA5: MA(CLOSE, 5), COLORRED;
MA10: MA(CLOSE, 10), COLORBLUE;
MA20: MA(CLOSE, 20), COLORGREEN;
GOLDEN: CROSS(MA5, MA10);
```

### MACD

```tdx
DIF := EMA(CLOSE, 12) - EMA(CLOSE, 26);
DEA := EMA(DIF, 9);
DIF线: DIF, COLORYELLOW;
DEA线: DEA, COLORBLUE;
MACD: (DIF - DEA) * 2, COLORSTICK;
```

### KDJ

```tdx
RSV := (CLOSE - LLV(LOW, 9)) / (HHV(HIGH, 9) - LLV(LOW, 9)) * 100;
K := EMA(RSV, 3);
D := EMA(K, 3);
J := 3 * K - 2 * D;
K线: K, COLORYELLOW;
D线: D, COLORBLUE;
J线: J, COLORMAGENTA;
```

### 绘图标记

```tdx
MA5 := MA(C, 5);
MA10 := MA(C, 10);
DRAWTEXT(CROSS(MA5, MA10), C, 'B');
DRAWICON(CROSS(MA10, MA5), H, 2);
```

更多示例见 `demo/examples.ts` 和 `examples/formulas/`。

## 浏览器演示

仓库内置了一个基于 Vite 和 Lightweight Charts 的演示页面。

```bash
npm install
npm run demo
```

演示页面包含 MA、MACD、KDJ、RSI、自定义策略、时间过滤和筹码分布等公式示例。详情见 `demo/README.md`。

## VSCode 语法高亮扩展

`vscode-extension/` 提供了通达信公式的 VSCode 语法高亮、代码片段和示例文件。安装和使用方式见：

- `VSCODE_EXTENSION_GUIDE.md`
- `vscode-extension/README.md`
- `vscode-extension/INSTALLATION_GUIDE.md`

## 开发

```bash
npm install
npm run build
npm test
npm run test:coverage
npm run lint
npm run format:check
```

常用脚本：

- `npm run build`：使用 `tsc` 编译 TypeScript。
- `npm test`：运行 Jest 测试。
- `npm run test:coverage`：生成测试覆盖率报告。
- `npm run lint`：运行 ESLint。
- `npm run format`：用 Prettier 格式化 `src` 和 `tests`。
- `npm run demo`：构建库并启动浏览器演示。
- `npm run demo:build`：构建演示页面。

## 测试覆盖

测试目录覆盖以下层面：

- `tests/unit`：Lexer、Parser、AST、错误类型、市场数据和解释器基础行为。
- `tests/interpreter/functions`：各类内置函数的行为测试。
- `tests/integration`：`FormulaEngine` 端到端公式执行。
- `tests/performance`：增量计算在较大数据集上的行为和延迟边界。

## 目录结构

```text
.
├── src/
│   ├── FormulaEngine.ts
│   ├── lexer/
│   ├── parser/
│   ├── interpreter/
│   ├── types/
│   └── errors/
├── tests/
├── demo/
├── examples/
├── docs/
├── vscode-extension/
├── package.json
├── tsconfig.json
└── README.md
```

## 注意事项

- 公式执行以数组为基本计算单位，每个数值序列通常与输入行情数据长度一致。
- 指标在回看周期不足的位置通常返回 `NaN`，调用方渲染时需要处理空值。
- 公式字符串和增量计算的前后结果应保持同一公式语义，`evaluateIncremental` 期望传入完整的新行情数组以及上一次 `FormulaResult`。
- `BOLL`、`ATR` 等部分函数已作为直接导出的工具函数存在；是否能在公式解释器中直接按同名函数调用，以 `Interpreter` 当前支持为准。
- 绘图函数只产出渲染无关事件，不负责图表绘制。

## License

MIT
