# Formula-TS 敏捷开发路线图

**版本**: 1.0
**创建日期**: 2025-11-14
**项目周期**: 6-8 周
**开发模式**: 敏捷迭代（Scrum）

---

## 📋 总体概览

Formula-TS 项目采用敏捷开发方法，分为 6 个 Sprint 逐步交付功能。每个 Sprint 都是独立可交付的增量，遵循 TDD（测试驱动开发）原则。

### 核心原则

1. **TDD 优先**: 先写测试，再写实现
2. **小步迭代**: 每个任务 2-5 分钟完成
3. **频繁提交**: 每完成一个功能立即提交
4. **持续集成**: 所有测试必须通过
5. **代码审查**: 关键功能完成后进行审查

---

## 🎯 项目里程碑

| Sprint | 功能 | 周期 | 交付物 | 状态 |
|--------|------|------|--------|------|
| Sprint 1 | Token 系统和项目基础 | 1 周 | Token, TokenType, LexerError | 📝 待开始 |
| Sprint 2 | 词法分析器 | 1-2 周 | Lexer（完整） | 📝 待开始 |
| Sprint 3 | 语法分析器 | 1-2 周 | Parser, AST | 📝 待开始 |
| Sprint 4 | 解释器和核心函数 | 1-2 周 | Interpreter, 10 个函数, MVP | 📝 待开始 |
| Sprint 5 | 扩展功能 | 1-2 周 | 20+ 函数，增量计算，性能优化 | 📝 待开始 |
| Sprint 6 | 图表和文档 | 1 周 | 演示页面，完整文档 | 📝 待开始 |

**总计**: 6-8 周 → 完整的 1.0 版本

---

## 📦 Sprint 1: Token 系统和项目基础

**目标**: 建立项目基础设施，实现 Token 类型系统

**周期**: 5-7 个工作日

### 交付物

- ✅ TypeScript 和 Jest 配置验证
- ✅ TokenType 枚举（25+ 种类型）
- ✅ Token 类（带位置跟踪）
- ✅ LexerError 错误类
- ✅ 模块导出结构
- ✅ 单元测试（覆盖率 > 80%）

### 关键任务

1. **TokenType 枚举** - 定义所有 token 类型
2. **Token 类** - 实现不可变 Token 对象
3. **LexerError** - 友好的错误信息
4. **模块导出** - 清晰的导出结构
5. **代码质量检查** - ESLint + Prettier

### 验收标准

- [ ] 所有基本 token 类型定义完整
- [ ] Token 包含行号、列号位置信息
- [ ] 错误类提供清晰的错误描述和建议
- [ ] 测试覆盖率 > 80%
- [ ] 代码通过 lint 检查

**详细计划**: `docs/plans/2025-11-14-sprint-1-token-system.md`

---

## 🔤 Sprint 2: 词法分析器（Lexer）

**目标**: 实现完整的词法分析器，将公式文本转换为 Token 流

**周期**: 7-10 个工作日

### 交付物

- ✅ Lexer 基础框架
- ✅ 数字识别（整数、小数）
- ✅ 标识符和关键字识别
- ✅ 运算符识别（单字符和多字符）
- ✅ 注释支持（// 行注释）
- ✅ 完整的集成测试
- ✅ Lexer 文档

### 关键任务

1. **基础框架** - 位置跟踪，空白跳过
2. **数字识别** - 支持 123, 45.67, .5
3. **运算符识别** - +, -, *, /, >, <, >=, <=, =, <>, :=, :
4. **标识符识别** - CLOSE, MA5, VAR_1
5. **关键字识别** - AND, OR（不区分大小写）
6. **注释跳过** - // 行注释
7. **集成测试** - MA, MACD, KDJ 公式

### 验收标准

- [ ] 支持所有通达信基本语法元素
- [ ] 位置跟踪准确
- [ ] 错误信息友好
- [ ] 集成测试覆盖经典公式
- [ ] 测试覆盖率 > 90%

**详细计划**: `docs/plans/2025-11-14-sprint-2-lexer.md`

---

## 🌳 Sprint 3: 语法分析器（Parser）

**目标**: 定义 AST 节点，实现递归下降语法分析器

**周期**: 7-10 个工作日

### 交付物

- ✅ AST 节点类型定义
- ✅ ParserError 错误类
- ✅ Parser 基础框架
- ✅ 表达式解析（所有优先级）
- ✅ 语句解析（赋值、输出）
- ✅ 绘图属性解析
- ✅ 完整的集成测试

### AST 节点类型

**表达式节点**:
- NumberLiteral - 数字字面量
- Identifier - 标识符
- BinaryExpression - 二元运算
- UnaryExpression - 一元运算
- CallExpression - 函数调用
- GroupExpression - 括号表达式

**语句节点**:
- AssignStatement - 变量赋值 (`:=`)
- OutputStatement - 输出声明 (`:`)
- Program - 程序根节点

### 语法规则

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
```

### 验收标准

- [ ] 所有表达式类型正确解析
- [ ] 运算符优先级正确
- [ ] 支持函数调用和参数
- [ ] 支持绘图属性
- [ ] 测试覆盖率 > 85%

**详细计划**: `docs/plans/2025-11-14-sprint-3-parser.md`

---

## ⚙️ Sprint 4: 解释器和核心函数（MVP）

**目标**: 实现解释器核心，支持 10 个核心函数，完成 MVP

**周期**: 7-10 个工作日

### 交付物

- ✅ MarketData, FormulaResult 类型定义
- ✅ Context 执行上下文
- ✅ FunctionRegistry 函数注册表
- ✅ 10 个核心函数实现
- ✅ Interpreter 解释器（Visitor 模式）
- ✅ FormulaEngine 主入口
- ✅ 端到端集成测试

### 10 个核心函数

**数学函数**:
1. **MA** - 移动平均
2. **EMA** - 指数移动平均
3. **SUM** - 求和

**引用函数**:
4. **REF** - 引用前 N 周期
5. **HHV** - 最高值
6. **LLV** - 最低值

**逻辑函数**:
7. **IF** - 条件判断
8. **CROSS** - 交叉

**工具函数**:
9. **MAX** - 最大值
10. **MIN** - 最小值

### FormulaEngine API

```typescript
const engine = new FormulaEngine();
const compiled = engine.compile(formulaText);
const result = compiled.execute(marketData);
```

### 验收标准

- [ ] 10 个核心函数正确实现
- [ ] Interpreter 支持所有 AST 节点
- [ ] 可以执行 MA, MACD, KDJ 等经典指标
- [ ] 计算结果与通达信误差 < 0.01%
- [ ] 测试覆盖率 > 85%

**详细计划**: `docs/plans/2025-11-14-sprint-4-interpreter.md`

---

## 🚀 Sprint 5: 扩展功能和性能优化

**目标**: 扩展函数库至 20-30 个，实现增量计算，优化性能

**周期**: 7-10 个工作日

### 交付物

- ✅ 20-30 个技术分析函数
- ✅ 绘图属性支持
- ✅ 增量计算实现
- ✅ 性能优化
- ✅ RuntimeError 错误类
- ✅ 完整的集成测试

### 扩展函数（20+ 个）

**数学统计**:
- SMA, DMA, WMA
- STD, VAR, AVEDEV
- SLOPE, ABS, POW, SQRT

**引用函数**:
- EVERY, EXIST, BARSLAST, COUNT

**逻辑函数**:
- FILTER, NOT, BETWEEN, VALUEWHEN

### 绘图属性

- 颜色: COLORRED, COLORGREEN, COLORWHITE, etc.
- 线宽: LINETHICK1-9
- 线型: DOTLINE, STICK

### 性能目标

| 指标 | 目标 |
|------|------|
| 1K 数据点 | < 200ms |
| 10K 数据点 | < 1s |
| 增量计算 | < 100ms |
| 内存占用 | < 100MB (10K点) |

### 验收标准

- [ ] 函数库 ≥ 20 个
- [ ] 所有函数测试覆盖
- [ ] 绘图属性正确解析和应用
- [ ] 增量计算功能可用
- [ ] 性能达标
- [ ] 集成测试验证 5+ 指标

**详细计划**: `docs/plans/2025-11-14-sprint-5-advanced.md`

---

## 📊 Sprint 6: 图表格式化和文档完善

**目标**: 实现图表数据格式化，创建演示页面，完善文档

**周期**: 5-7 个工作日

### 交付物

- ✅ ChartFormatter 接口
- ✅ TradingViewFormatter 实现
- ✅ 5+ 个示例公式
- ✅ 交互式演示页面
- ✅ API 文档（TypeDoc）
- ✅ 使用指南
- ✅ README 完善
- ✅ 发布准备

### 演示页面功能

- 公式编辑器
- 预置公式模板（MA, MACD, KDJ, BOLL）
- TradingView 图表展示
- 实时计算和更新
- 错误提示

### 文档结构

```
docs/
├── api/              # TypeDoc 生成的 API 文档
├── guides/           # 使用指南
│   ├── getting-started.md
│   ├── formula-syntax.md
│   ├── function-reference.md
│   └── advanced-usage.md
└── plans/            # 实施计划
    ├── AGILE-ROADMAP.md (本文件)
    ├── sprint-1-token-system.md
    ├── sprint-2-lexer.md
    ├── sprint-3-parser.md
    ├── sprint-4-interpreter.md
    └── sprint-5-advanced.md
```

### 验收标准

- [ ] Chart formatter 实现并测试
- [ ] 演示页面可用且美观
- [ ] API 文档自动生成
- [ ] 使用指南完整
- [ ] README 清晰详细
- [ ] 发布准备就绪（npm package）

---

## 🔄 开发流程

### 每个任务的标准流程（TDD）

1. **编写测试** - 先写失败的测试
2. **运行测试** - 确认测试失败
3. **实现功能** - 编写最小实现
4. **运行测试** - 确认测试通过
5. **代码审查** - 检查代码质量
6. **提交代码** - 清晰的 commit message

### Git 提交规范

```
<type>(<scope>): <subject>

type:
  - feat: 新功能
  - fix: bug 修复
  - docs: 文档更新
  - test: 测试相关
  - refactor: 代码重构
  - perf: 性能优化
  - chore: 构建工具或辅助工具

scope:
  - lexer, parser, interpreter, functions, types, errors, etc.

examples:
  - feat(lexer): add number recognition
  - fix(parser): correct operator precedence
  - test(functions): add MA function tests
  - docs: update README with examples
```

### 每日工作流

1. **早晨**: 查看 sprint 计划，选择当天任务
2. **开发**: 按照 TDD 流程逐个完成任务
3. **下午**: 运行完整测试套件
4. **傍晚**: 提交代码，更新进度

### Sprint 结束标准

- ✅ 所有计划任务完成
- ✅ 所有测试通过
- ✅ 代码覆盖率达标
- ✅ 代码通过 lint 检查
- ✅ 文档更新
- ✅ Sprint 演示可运行

---

## 📈 质量标准

### 代码质量

- ✅ TypeScript 严格模式
- ✅ 所有公共 API 有类型定义
- ✅ ESLint 无错误和警告
- ✅ Prettier 格式化
- ✅ JSDoc 注释（公共 API）

### 测试质量

| 模块 | 覆盖率目标 |
|------|-----------|
| Lexer | > 90% |
| Parser | > 85% |
| Interpreter | > 85% |
| Functions | > 95% |
| 整体 | > 85% |

### 性能标准

| 场景 | 目标 | 验证方式 |
|------|------|----------|
| 小数据集 (100点) | < 10ms | 性能测试 |
| 中数据集 (1K点) | < 200ms | 性能测试 |
| 大数据集 (10K点) | < 1s | 性能测试 |
| 增量计算 | < 100ms | 性能测试 |

### 准确性标准

- 与通达信官方结果对比，误差 < 0.01%
- 使用真实市场数据验证
- 覆盖边界情况和异常情况

---

## 🎓 技术栈和工具

### 核心技术

- **TypeScript** 5.9+ - 主要开发语言
- **Node.js** 16+ - 运行时环境

### 开发工具

- **Jest** - 测试框架
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **TypeDoc** - API 文档生成
- **Vite** - 演示页面构建

### 图表库

- **TradingView Lightweight Charts** - 金融图表

### CI/CD

- **GitHub Actions** - 持续集成
- **npm** - 包管理和发布

---

## 📊 进度跟踪

### Sprint 进度表

| Sprint | 开始日期 | 结束日期 | 状态 | 完成度 |
|--------|---------|---------|------|--------|
| Sprint 1 | TBD | TBD | 📝 待开始 | 0% |
| Sprint 2 | TBD | TBD | 📝 待开始 | 0% |
| Sprint 3 | TBD | TBD | 📝 待开始 | 0% |
| Sprint 4 | TBD | TBD | 📝 待开始 | 0% |
| Sprint 5 | TBD | TBD | 📝 待开始 | 0% |
| Sprint 6 | TBD | TBD | 📝 待开始 | 0% |

### 功能完成度

| 功能模块 | 状态 |
|---------|------|
| Token 系统 | 📝 待开始 |
| Lexer | 📝 待开始 |
| Parser | 📝 待开始 |
| AST | 📝 待开始 |
| Interpreter | 📝 待开始 |
| 核心函数(10) | 📝 待开始 |
| 扩展函数(20+) | 📝 待开始 |
| 增量计算 | 📝 待开始 |
| 图表格式化 | 📝 待开始 |
| 演示页面 | 📝 待开始 |
| 文档 | 📝 待开始 |

---

## 🚦 风险管理

### 识别的风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 浮点精度问题 | 中 | 高 | 引入 decimal.js 或高精度算法 |
| 性能不达标 | 中 | 中 | 早期性能测试，优化算法 |
| 语法复杂度超预期 | 低 | 高 | 分阶段实现，先支持核心语法 |
| 测试覆盖不足 | 中 | 中 | TDD 强制，CI 检查覆盖率 |
| 时间超期 | 中 | 中 | 严格控制范围，MVP 优先 |

---

## 📚 参考资源

### 内部文档

- [PRD 文档](../PRD.md)
- [项目技术上下文](../../openspec/project.md)
- [Sprint 计划详情](./sprint-1-token-system.md)

### 外部资源

- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Jest 测试框架](https://jestjs.io/)
- [编译原理（龙书）](https://en.wikipedia.org/wiki/Compilers:_Principles,_Techniques,_and_Tools)
- [通达信公式系统](https://www.tdx.com.cn/)

---

## 🎯 成功指标

### MVP (Sprint 4 完成后)

- ✅ 可以解析和执行基本公式
- ✅ 支持 10 个核心函数
- ✅ 可以计算 MA, MACD, KDJ
- ✅ 测试覆盖率 > 80%
- ✅ 基础文档完成

### 1.0 版本 (Sprint 6 完成后)

- ✅ 支持 20+ 个函数
- ✅ 增量计算功能
- ✅ 性能达标（10K 点 < 1s）
- ✅ 演示页面可用
- ✅ 完整文档
- ✅ 可以发布 npm 包

### 长期目标

- GitHub Stars > 500
- npm 下载量 > 1000/月
- 社区贡献 > 5 个插件
- 文档完善，易于使用

---

## 🤝 团队协作

### 角色和职责

- **开发者**: 按照 Sprint 计划实现功能
- **测试者**: 编写和维护测试
- **文档编写者**: 编写和维护文档
- **代码审查者**: 审查关键代码

### 沟通机制

- **每日站会**: 同步进度和问题
- **Sprint 计划会**: 规划下一个 Sprint
- **Sprint 回顾会**: 总结经验教训
- **代码审查**: 关键功能完成后

---

## 📝 附录

### Sprint 计划文档列表

1. [Sprint 1: Token 系统](./2025-11-14-sprint-1-token-system.md)
2. [Sprint 2: 词法分析器](./2025-11-14-sprint-2-lexer.md)
3. [Sprint 3: 语法分析器](./2025-11-14-sprint-3-parser.md)
4. [Sprint 4: 解释器和核心函数](./2025-11-14-sprint-4-interpreter.md)
5. [Sprint 5: 扩展功能](./2025-11-14-sprint-5-advanced.md)

### 快速开始

要开始开发，请按照以下步骤：

1. 阅读 [PRD 文档](../PRD.md) 了解产品需求
2. 阅读 [项目技术上下文](../../openspec/project.md)
3. 从 [Sprint 1](./2025-11-14-sprint-1-token-system.md) 开始
4. 使用 `superpowers:executing-plans` 技能执行计划
5. 遵循 TDD 流程开发

---

**文档版本**: 1.0
**最后更新**: 2025-11-14
**维护者**: 开发团队

---

## 总结

这个敏捷开发路线图将 Formula-TS 项目分解为 6 个可管理的 Sprint，每个 Sprint 都有明确的目标和交付物。通过遵循 TDD 原则和小步迭代，我们可以在 6-8 周内完成一个高质量、可靠的技术指标公式解析引擎。

**立即开始**: 查看 [Sprint 1 计划](./2025-11-14-sprint-1-token-system.md) 并开始第一个任务！
