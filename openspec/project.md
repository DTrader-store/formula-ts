# Project Context

## Purpose

**formula-ts** 是一个用 TypeScript 编写的通达信公式解析器和执行引擎。

**核心目标**：
- 解析通达信技术指标公式语法
- 执行公式计算，生成技术指标数据
- 输出结构化数据用于图表可视化
- 为用户提供自定义技术指标的能力

**使用场景**：
用户输入通达信格式的技术指标公式 → 提供股票市场数据 → 系统计算指标 → 在图表中展示结果

## Tech Stack

### 核心技术
- **TypeScript** - 主要开发语言
- **Node.js** - 运行时环境（支持同构设计，可在浏览器和服务器运行）

### 图表库
- **TradingView Lightweight Charts** - 金融图表可视化

### 开发工具
- **Jest** - 单元测试和集成测试
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **TypeDoc** - API 文档生成

### 构建工具
- **Vite** 或 **Rollup** - 打包和构建

## Project Conventions

### Code Style

**命名约定**：
- 类名：PascalCase (`Lexer`, `Parser`, `Interpreter`)
- 方法名：camelCase (`parseExpression`, `visitNode`)
- 常量：UPPER_SNAKE_CASE (`TOKEN_TYPE`, `MAX_ITERATIONS`)
- 接口：PascalCase with `I` prefix optional (`ASTNode`, `FormulaFunction`)

**文件组织**：
- 每个类一个文件
- 相关功能分组到目录中
- 导出通过 index.ts 统一管理

**TypeScript 规范**：
- 严格模式：`strict: true`
- 显式类型注解（避免 `any`）
- 优先使用接口定义数据结构
- 使用枚举定义常量集合

**注释规范**：
- 公共 API 必须有 JSDoc 注释
- 复杂算法添加行内注释说明
- TODO 标记待完成功能

### Architecture Patterns

**设计模式**：

1. **编译器模式**（整体架构）
   - Lexer → Parser → AST → Interpreter
   - 清晰的职责分离

2. **Visitor 模式**（AST 遍历）
   - Interpreter 使用 Visitor 模式遍历和执行 AST
   - 易于扩展新的节点处理逻辑

3. **Registry 模式**（函数管理）
   - FunctionRegistry 管理所有内置函数
   - 支持动态注册和扩展

4. **Strategy 模式**（输出格式化）
   - 不同图表库使用不同的 Formatter 策略
   - 易于适配新的图表库

**模块划分**：
```
lexer/       - 词法分析（Token 化）
parser/      - 语法分析（AST 生成）
interpreter/ - 解释执行（计算逻辑）
formatter/   - 输出格式化（图表数据）
functions/   - 内置函数库
types/       - 类型定义
utils/       - 工具函数
```

**错误处理**：
- 自定义错误类：`LexerError`, `ParserError`, `RuntimeError`
- 错误信息包含：位置（行号、列号）、错误描述、修复建议
- 不使用异常控制正常流程

**性能优化策略**：
- 增量计算：缓存中间结果，只计算新增数据
- 延迟计算：按需计算变量
- 数组复用：避免不必要的数组拷贝

### Testing Strategy

**测试层级**：

1. **单元测试**（src/**/*.test.ts）
   - Lexer: 测试 Token 识别准确性
   - Parser: 测试 AST 生成正确性
   - Functions: 测试每个内置函数的计算结果
   - 覆盖率目标：> 80%

2. **集成测试**（tests/integration/）
   - 端到端测试经典指标公式（MA, MACD, KDJ, BOLL 等）
   - 使用真实的市场数据验证
   - 与通达信官方结果对比验证

3. **性能测试**（tests/performance/）
   - 大数据量测试（10000+ 数据点）
   - 增量计算性能验证
   - 内存使用监控

**测试数据**：
- 使用 fixtures 目录存储测试数据
- 包含各种边界情况和异常情况
- 准备经典指标的标准结果用于验证

**持续集成**：
- GitHub Actions 自动运行测试
- PR 必须通过所有测试才能合并

### Git Workflow

**分支策略**：
- `main` - 稳定版本
- `develop` - 开发分支
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支

**提交规范**（Conventional Commits）：
```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
test: 测试相关
refactor: 代码重构
perf: 性能优化
chore: 构建工具或辅助工具的变动
```

**发布流程**：
- 语义化版本：`major.minor.patch`
- 发布前运行完整测试套件
- 自动生成 CHANGELOG

## Domain Context

### 通达信公式系统

通达信是中国最流行的股票分析软件之一，其公式系统允许用户自定义技术指标。

**公式类型**（本项目先支持技术指标公式）：
1. **技术指标公式** - 计算并绘制技术指标线（本项目重点）
2. 条件选股公式 - 筛选符合条件的股票
3. 交易系统公式 - 买卖点提示
4. 五彩K线公式 - K线着色

**核心概念**：

1. **变量声明**：
   ```
   VAR1 := (CLOSE - MA(CLOSE, 6)) / MA(CLOSE, 6) * 100;
   ```
   使用 `:=` 声明中间变量（不显示）

2. **输出声明**：
   ```
   MA5: MA(CLOSE, 5), COLORRED;
   ```
   使用 `:` 声明输出线（在图表中显示）

3. **市场数据变量**（内置）：
   - `OPEN` - 开盘价
   - `CLOSE` - 收盘价
   - `HIGH` - 最高价
   - `LOW` - 最低价
   - `VOLUME` - 成交量
   - `AMOUNT` - 成交额

4. **绘图属性**：
   - 颜色：`COLORRED`, `COLORGREEN`, `COLORWHITE`, `COLORYELLOW` 等
   - 线宽：`LINETHICK1` 到 `LINETHICK9`
   - 线型：`DOTLINE`（虚线）, `STICK`（柱状）

5. **运算符优先级**：
   - 一元运算：`-` (负号)
   - 乘除：`*`, `/`
   - 加减：`+`, `-`
   - 比较：`>`, `<`, `>=`, `<=`, `=`, `<>`
   - 逻辑：`AND`, `OR`

6. **常用函数分类**：
   - 数学：MA, EMA, SUM, ABS, MAX, MIN
   - 引用：REF, HHV, LLV
   - 逻辑：IF, CROSS, EVERY, EXIST
   - 统计：STD, VAR, AVEDEV

### 经典指标示例

**MA（移动平均线）**：
```
MA5: MA(CLOSE, 5), COLORWHITE;
MA10: MA(CLOSE, 10), COLORYELLOW;
MA20: MA(CLOSE, 20), COLORPINK;
```

**MACD**：
```
DIF: EMA(CLOSE, 12) - EMA(CLOSE, 26), COLORWHITE;
DEA: EMA(DIF, 9), COLORYELLOW;
MACD: (DIF - DEA) * 2, COLORSTICK;
```

**KDJ**：
```
RSV: (CLOSE - LLV(LOW, 9)) / (HHV(HIGH, 9) - LLV(LOW, 9)) * 100;
K: SMA(RSV, 3, 1), COLORWHITE;
D: SMA(K, 3, 1), COLORYELLOW;
J: 3 * K - 2 * D, COLORPINK;
```

## Important Constraints

### 技术约束

1. **同构设计要求**
   - 代码必须同时支持浏览器和 Node.js 环境
   - 不能使用平台特定的 API
   - 使用标准 JavaScript/TypeScript 特性

2. **性能要求**
   - 支持至少 10000 个数据点的计算
   - 增量计算延迟 < 100ms
   - 内存使用合理（避免大量数组拷贝）

3. **兼容性**
   - 支持现代浏览器（Chrome, Firefox, Safari, Edge）
   - Node.js >= 16.0

### 功能约束

1. **第一版本范围**
   - 仅支持技术指标公式（不支持选股、交易系统等）
   - 实现 20-30 个核心函数
   - 不支持自定义函数定义
   - 不支持跨周期引用（如日线引用周线数据）

2. **数据依赖**
   - 用户必须提供市场数据
   - 不内置数据获取功能
   - 数据格式由用户保证

3. **错误恢复**
   - 语法错误直接报错，不尝试修复
   - 运行时错误停止计算，返回错误信息

### 设计约束

1. **可扩展性优先**
   - 函数注册机制必须易于扩展
   - AST 设计要预留扩展空间
   - 架构清晰，模块独立

2. **代码质量**
   - 所有公共 API 必须有类型定义
   - 关键算法必须有注释
   - 测试覆盖率 > 80%

## External Dependencies

### 运行时依赖

目前计划零运行时依赖，纯 TypeScript 实现。

如需引入依赖，优先考虑：
- 体积小
- 维护活跃
- TypeScript 支持良好

### 开发依赖

- **TypeScript** - 类型系统和编译器
- **Jest** - 测试框架
- **@types/jest** - Jest 类型定义
- **ESLint** - 代码检查
  - @typescript-eslint/parser
  - @typescript-eslint/eslint-plugin
- **Prettier** - 代码格式化
- **Vite** - 开发服务器和构建工具

### 图表库（演示页面使用）

- **lightweight-charts** - TradingView 图表库（仅在 demo 中使用）

### 可选依赖

未来可能需要：
- **decimal.js** - 高精度数值计算（如果浮点精度成为问题）
- **web-worker** - 大数据量计算的性能优化

## Project Structure

```
formula-ts/
├── src/
│   ├── lexer/
│   │   ├── Lexer.ts              # 词法分析器
│   │   ├── Token.ts              # Token 类定义
│   │   └── TokenType.ts          # Token 类型枚举
│   ├── parser/
│   │   ├── Parser.ts             # 语法分析器
│   │   ├── ast/
│   │   │   ├── nodes.ts          # AST 节点类型定义
│   │   │   └── visitor.ts        # Visitor 接口
│   │   └── errors.ts             # 解析错误类
│   ├── interpreter/
│   │   ├── Interpreter.ts        # 解释器（执行引擎）
│   │   ├── Context.ts            # 执行上下文
│   │   ├── FunctionRegistry.ts   # 函数注册表
│   │   └── functions/
│   │       ├── index.ts          # 函数导出
│   │       ├── math.ts           # 数学函数：MA, EMA, SUM 等
│   │       ├── reference.ts      # 引用函数：REF, HHV, LLV 等
│   │       └── logical.ts        # 逻辑函数：IF, CROSS 等
│   ├── formatter/
│   │   ├── ChartFormatter.ts     # 图表数据格式化器
│   │   └── types.ts              # 输出数据类型定义
│   ├── types/
│   │   ├── MarketData.ts         # 市场数据类型
│   │   └── FormulaResult.ts      # 公式结果类型
│   ├── errors/
│   │   └── index.ts              # 统一错误类定义
│   ├── FormulaEngine.ts          # 主入口类
│   └── index.ts                  # 模块导出
├── examples/
│   ├── formulas/
│   │   ├── ma.txt                # MA 指标公式
│   │   ├── macd.txt              # MACD 指标公式
│   │   └── kdj.txt               # KDJ 指标公式
│   └── data/
│       └── sample-market-data.json  # 示例市场数据
├── demo/
│   ├── index.html                # 演示页面
│   ├── main.ts                   # 演示代码
│   └── styles.css                # 样式
├── tests/
│   ├── unit/                     # 单元测试
│   │   ├── lexer.test.ts
│   │   ├── parser.test.ts
│   │   └── functions/
│   ├── integration/              # 集成测试
│   │   └── indicators.test.ts
│   ├── fixtures/                 # 测试数据
│   └── performance/              # 性能测试
├── docs/
│   ├── api/                      # API 文档
│   ├── guides/                   # 使用指南
│   └── plans/                    # 设计文档
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.js
├── .prettierrc
└── README.md
```

## Implementation Priority

### Phase 1: 核心解析器（MVP）
- [ ] Lexer 实现
- [ ] Parser 实现（支持基本语法）
- [ ] AST 定义
- [ ] 基本的 Interpreter
- [ ] 10 个核心函数：MA, EMA, SUM, REF, HHV, LLV, IF, CROSS, MAX, MIN
- [ ] 基础错误处理
- [ ] 单元测试

### Phase 2: 完善功能
- [ ] 增量计算支持
- [ ] 更多内置函数（20-30 个）
- [ ] 完整的绘图属性支持
- [ ] ChartFormatter 实现
- [ ] 集成测试
- [ ] 经典指标验证

### Phase 3: 演示和文档
- [ ] 演示页面
- [ ] TradingView Charts 集成
- [ ] API 文档
- [ ] 使用指南
- [ ] 示例公式库

### Phase 4: 优化和扩展
- [ ] 性能优化
- [ ] 更多指标公式
- [ ] 错误提示改进
- [ ] 生态系统（插件机制）

## Success Metrics

**功能完整性**：
- 能正确解析和执行常见的 20+ 个经典技术指标
- 计算结果与通达信官方结果一致（误差 < 0.01%）

**性能指标**：
- 10000 数据点完整计算 < 1 秒
- 增量计算单个数据点 < 100ms
- 内存占用合理（< 100MB for 10000 points）

**代码质量**：
- 测试覆盖率 > 80%
- 零严重 bug
- API 文档完整

**开发者体验**：
- API 简洁易用
- 错误信息清晰友好
- 文档和示例充足
