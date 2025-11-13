# 通达信公式解析器设计方案

**日期**: 2025-11-13
**状态**: 设计完成，待实现

## 概述

本文档描述了一个用 TypeScript 编写的通达信公式解析器的完整设计方案。该解析器能够解析通达信技术指标公式，执行计算，并输出适合在 TradingView Lightweight Charts 中展示的数据。

## 核心目标

1. **解析通达信公式语法** - 支持完整的通达信技术指标公式语法
2. **执行公式计算** - 基于用户提供的市场数据计算技术指标
3. **输出结构化数据** - 生成包含绘图属性的图表数据
4. **支持增量计算** - 新数据到来时只计算增量部分

## 架构设计

### 整体架构

采用经典的编译器架构：

```
通达信公式文本
    ↓
[Lexer 词法分析器] → Token 流
    ↓
[Parser 语法分析器] → AST (抽象语法树)
    ↓
[Validator 验证器] → 语义检查
    ↓
[Interpreter 解释器] → 执行结果
    ↓
[Formatter 格式化器] → 图表数据
```

### 核心组件

#### 1. Lexer (词法分析器)

**职责**: 将文本转换为 Token 流

**Token 类型**:
- 字面量: NUMBER, IDENTIFIER
- 运算符: +, -, *, /
- 比较运算符: >, <, >=, <=, =, <>
- 逻辑运算符: AND, OR
- 分隔符: (, ), ,, ;, :
- 关键字: IF, THEN, ELSE
- 绘图属性: COLORRED, LINETHICK1 等
- 特殊: EOF, NEWLINE

**错误处理**:
- 记录每个 Token 的行号和列号
- 遇到非法字符时提供精确的位置信息

#### 2. Parser (语法分析器)

**职责**: 将 Token 流转换为 AST

**语法结构**:
```
公式 = 语句列表
语句 = 变量定义 | 输出定义
变量定义 = 标识符 := 表达式;
输出定义 = 标识符 : 表达式, 绘图属性;
```

**AST 节点类型**:
- Program: 程序根节点
- VariableDeclaration: 变量声明 (VAR1 := ...)
- OutputDeclaration: 输出声明 (MA5: ...)
- BinaryExpression: 二元表达式 (a + b)
- FunctionCall: 函数调用 (MA(CLOSE, 5))
- ConditionalExpression: 条件表达式 (IF(...))
- Identifier: 标识符
- NumberLiteral: 数字字面量

**运算符优先级** (从低到高):
1. 逻辑运算: AND, OR
2. 比较运算: >, <, >=, <=, =, <>
3. 加减: +, -
4. 乘除: *, /
5. 一元运算: -
6. 函数调用和括号

**解析方法**:
使用递归下降解析，每种语法结构对应一个解析方法。

#### 3. Interpreter (解释器)

**职责**: 遍历 AST 执行计算

**执行上下文**:
```typescript
class ExecutionContext {
  marketData: MarketData;           // 市场数据
  variables: Map<string, number[]>; // 变量存储
  outputs: Map<string, OutputLine>; // 输出结果
  currentIndex: number;              // 当前计算位置
}
```

**执行方式**:
- 使用 Visitor 模式遍历 AST
- 对每种节点类型执行相应的计算逻辑
- 支持增量计算（缓存中间结果）

#### 4. Function Registry (函数注册表)

**职责**: 管理所有内置函数

**函数接口**:
```typescript
interface FormulaFunction {
  name: string;
  minArgs: number;
  maxArgs: number;
  execute: (args: number[][], context: ExecutionContext) => number[];
}
```

**初期实现的核心函数** (10个):
- MA(X, N) - 简单移动平均
- EMA(X, N) - 指数移动平均
- SUM(X, N) - N 周期累加
- REF(X, N) - N 周期前的值
- HHV(X, N) - N 周期内最高值
- LLV(X, N) - N 周期内最低值
- IF(COND, A, B) - 条件选择
- CROSS(A, B) - A 上穿 B
- MAX(X, Y) - 最大值
- MIN(X, Y) - 最小值

#### 5. Chart Formatter (图表格式化器)

**职责**: 将执行结果转换为图表数据格式

**输出格式**:
```typescript
interface ChartOutput {
  lines: LineData[];
  signals?: SignalData[];
}

interface LineData {
  name: string;
  data: number[];
  style: {
    color: string;
    lineWidth: number;
    lineStyle: 'solid' | 'dashed' | 'dotted';
  };
}
```

## 技术栈

- **TypeScript** - 主要开发语言
- **Node.js** - 运行环境（同构设计）
- **Jest** - 测试框架
- **TradingView Lightweight Charts** - 图表库（仅演示页面）
- **Vite** - 构建工具

## 设计模式

1. **编译器模式** - 整体架构
2. **Visitor 模式** - AST 遍历
3. **Registry 模式** - 函数管理
4. **Strategy 模式** - 输出格式化

## 性能优化策略

### 增量计算

**目标**: 新数据到来时只计算新增部分

**实现方案**:
1. 缓存每个变量的计算结果
2. 记录已计算的数据范围
3. 新数据到来时，只计算新增的索引
4. 追加到已有结果数组

**示例**:
```typescript
// 已有 100 个数据点，计算了 MA5
// 新增 1 个数据点，只需要计算新的 MA5 值
// 不需要重新计算前 100 个
```

### 其他优化

- 延迟计算：按需计算变量
- 数组复用：避免不必要的数组拷贝
- 对象池：复用临时对象

## 错误处理

### 错误类型

1. **LexerError** - 词法错误（非法字符）
2. **ParserError** - 语法错误（语法不匹配）
3. **RuntimeError** - 运行时错误（除零、参数错误等）

### 错误信息格式

```
Error at line 2, column 5: Unexpected character '@'
  VAR1: @CLOSE + 5;
        ^
Suggestion: Remove the invalid character
```

包含：
- 错误位置（行号、列号）
- 错误描述
- 问题代码片段
- 修复建议

## 项目结构

```
formula-ts/
├── src/
│   ├── lexer/              # 词法分析
│   ├── parser/             # 语法分析
│   ├── interpreter/        # 解释执行
│   ├── formatter/          # 输出格式化
│   ├── types/              # 类型定义
│   ├── errors/             # 错误类
│   ├── FormulaEngine.ts    # 主入口
│   └── index.ts
├── examples/               # 示例公式和数据
├── demo/                  # 演示页面
├── tests/                 # 测试
└── docs/                  # 文档
```

## 实现计划

### Phase 1: 核心解析器 (MVP)
- Lexer 实现
- Parser 实现（支持基本语法）
- AST 定义
- 基本的 Interpreter
- 10 个核心函数
- 基础错误处理
- 单元测试

**预计时间**: 2-3 周

### Phase 2: 完善功能
- 增量计算支持
- 更多内置函数（20-30 个）
- 完整的绘图属性支持
- ChartFormatter 实现
- 集成测试
- 经典指标验证

**预计时间**: 2-3 周

### Phase 3: 演示和文档
- 演示页面
- TradingView Charts 集成
- API 文档
- 使用指南
- 示例公式库

**预计时间**: 1-2 周

### Phase 4: 优化和扩展
- 性能优化
- 更多指标公式
- 错误提示改进
- 生态系统（插件机制）

**预计时间**: 持续迭代

## 测试策略

### 单元测试
- Lexer: Token 识别准确性
- Parser: AST 生成正确性
- Functions: 每个函数的计算结果
- 覆盖率目标: > 80%

### 集成测试
- 端到端测试经典指标（MA, MACD, KDJ, BOLL）
- 与通达信官方结果对比
- 使用真实市场数据验证

### 性能测试
- 10000 数据点完整计算
- 增量计算性能
- 内存使用监控

## 成功指标

**功能完整性**:
- 正确解析和执行 20+ 个经典技术指标
- 计算结果与通达信一致（误差 < 0.01%）

**性能指标**:
- 10000 数据点完整计算 < 1 秒
- 增量计算单个数据点 < 100ms
- 内存占用 < 100MB (for 10000 points)

**代码质量**:
- 测试覆盖率 > 80%
- 零严重 bug
- API 文档完整

**开发者体验**:
- API 简洁易用
- 错误信息清晰
- 文档和示例充足

## 经典指标示例

### MA (移动平均线)
```
MA5: MA(CLOSE, 5), COLORWHITE;
MA10: MA(CLOSE, 10), COLORYELLOW;
MA20: MA(CLOSE, 20), COLORPINK;
```

### MACD
```
DIF: EMA(CLOSE, 12) - EMA(CLOSE, 26), COLORWHITE;
DEA: EMA(DIF, 9), COLORYELLOW;
MACD: (DIF - DEA) * 2, COLORSTICK;
```

### KDJ
```
RSV: (CLOSE - LLV(LOW, 9)) / (HHV(HIGH, 9) - LLV(LOW, 9)) * 100;
K: SMA(RSV, 3, 1), COLORWHITE;
D: SMA(K, 3, 1), COLORYELLOW;
J: 3 * K - 2 * D, COLORPINK;
```

## 约束和限制

### 第一版本范围
- 仅支持技术指标公式
- 不支持选股公式、交易系统公式等
- 不支持自定义函数定义
- 不支持跨周期引用

### 技术约束
- 同构设计（浏览器 + Node.js）
- 零运行时依赖
- 支持现代浏览器
- Node.js >= 16.0

## 风险和挑战

1. **通达信公式的复杂性** - 某些高级特性可能难以实现
2. **性能要求** - 大数据量计算可能成为瓶颈
3. **精度问题** - 浮点运算可能导致精度差异
4. **兼容性** - 确保与通达信官方计算结果一致

## 下一步

1. 初始化项目结构
2. 实现 Phase 1（核心解析器）
3. 验证核心功能
4. 逐步迭代完善

---

**设计文档版本**: v1.0
**最后更新**: 2025-11-13
