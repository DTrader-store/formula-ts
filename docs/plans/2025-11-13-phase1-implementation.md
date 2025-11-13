# 通达信公式解析器 Phase 1 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个功能完整的通达信公式解析器 MVP，支持基本语法解析、10 个核心函数和友好的错误提示。

**Architecture:** 采用经典编译器架构（Lexer → Parser → AST → Interpreter），使用 Visitor 模式遍历 AST，Registry 模式管理函数。遵循 TDD，每个功能先写测试。

**Tech Stack:** TypeScript, Jest, Node.js

---

## 实现阶段概述

### 阶段 0: 项目初始化
- Task 0: 初始化 TypeScript 项目结构

### 阶段 1: 错误处理基础设施
- Task 1: 定义错误类型

### 阶段 2: 词法分析器 (Lexer)
- Task 2: 定义 Token 类型
- Task 3: 实现 Lexer（数字识别）
- Task 4: 实现 Lexer（标识符和关键字）
- Task 5: 实现 Lexer（运算符和分隔符）
- Task 6: 实现 Lexer（注释支持）
- Task 7: Lexer 导出和完整性测试

### 阶段 3: 抽象语法树 (AST)
- Task 8: 定义 AST 节点类型

### 阶段 4: 语法分析器 (Parser)
- Task 9: 实现 Parser 基础结构
- Task 10: 实现语句解析（变量和输出声明）
- Task 11: 实现表达式解析（二元运算符）
- Task 12: Parser 完整性测试和导出

### 阶段 5: 类型定义
- Task 13: 定义市场数据类型
- Task 14: 定义公式结果类型
- Task 15: 类型模块导出

### 阶段 6: 函数注册表和内置函数
- Task 16: 实现函数注册表
- Task 17: 实现 MA 函数
- Task 18: 实现引用函数（REF, HHV, LLV）
- Task 19: 实现逻辑函数（IF, CROSS）
- Task 20: 函数模块导出和注册

### 阶段 7: 解释器 (Interpreter)
- Task 21: 实现执行上下文
- Task 22: 实现基础解释器
- Task 23: 实现表达式求值
- Task 24: 集成函数调用
- Task 25: 解释器测试

### 阶段 8: 主引擎 (FormulaEngine)
- Task 26: 实现 FormulaEngine 类
- Task 27: 端到端集成测试
- Task 28: 模块导出

### 阶段 9: 示例和文档
- Task 29: 创建示例公式
- Task 30: 编写 README

### 阶段 10: 项目验收
- Task 31: 完整测试和验证

---

## 详细任务说明

完整的任务列表包含约 300+ 个小步骤，每个步骤 2-5 分钟。

关键原则：
1. **TDD**: 先写失败的测试，再写实现
2. **小步提交**: 每个任务完成后立即提交
3. **验证**: 每步都要运行测试确保通过
4. **DRY & YAGNI**: 保持代码简洁，避免过度设计

---

## 核心功能清单

### 已规划的 10 个核心函数：
1. **MA(X, N)** - 简单移动平均
2. **EMA(X, N)** - 指数移动平均
3. **SUM(X, N)** - N 周期累加
4. **REF(X, N)** - N 周期前的值
5. **HHV(X, N)** - N 周期内最高值
6. **LLV(X, N)** - N 周期内最低值
7. **IF(COND, A, B)** - 条件选择
8. **CROSS(A, B)** - A 上穿 B
9. **MAX(X, Y)** - 最大值
10. **MIN(X, Y)** - 最小值

### 支持的语法特性：
- 变量声明：`VAR1 := expression;`
- 输出声明：`MA5: expression, COLORWHITE;`
- 算术运算：`+, -, *, /`
- 比较运算：`>, <, >=, <=, =, <>`
- 逻辑运算：`AND, OR`
- 函数调用：`MA(CLOSE, 5)`
- 括号表达式：`(a + b) * c`
- 条件表达式：`IF(condition, true_val, false_val)`
- 绘图属性：`COLORRED, LINETHICK1, DOTLINE, STICK`
- 注释：`// single line` 和 `{block comment}`

---

## 验证标准

完成后必须满足：

✅ **功能完整性**
- 能解析和执行 MA、MACD、KDJ 等经典指标
- 所有 10 个核心函数正确实现
- 支持完整的通达信语法

✅ **测试覆盖**
- 单元测试覆盖率 > 80%
- 所有核心模块有集成测试
- 边界情况和错误情况有测试

✅ **代码质量**
- 通过 ESLint 检查
- 所有公共 API 有 JSDoc 注释
- 无 TypeScript 类型错误

✅ **错误处理**
- 友好的错误提示（带行号、列号）
- 语法错误和运行时错误分离
- 错误信息有修复建议

---

## 使用建议

**实施方式选择：**

1. **子代理驱动开发（推荐）**
   - 在当前会话中使用 superpowers:subagent-driven-development
   - 每个任务派发新的子代理
   - 任务间进行代码审查
   - 快速迭代，质量保证

2. **批量执行**
   - 在新会话中使用 superpowers:executing-plans
   - 批量执行任务
   - 阶段性检查点

---

## 项目里程碑

**Week 1**: 完成阶段 0-3（项目初始化、错误处理、Lexer、AST）
**Week 2**: 完成阶段 4-6（Parser、类型、函数库）
**Week 3**: 完成阶段 7-10（Interpreter、引擎、示例、文档）

---

## 下一步

保存此计划后，选择实施方式开始开发。

**准备好开始了吗？**
