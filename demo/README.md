# Formula-TS 演示页面

这是 Formula-TS 的交互式演示页面，展示了公式解析引擎与 TradingView Lightweight Charts 的集成。

## 功能特性

- **实时公式编辑器**: 在浏览器中直接编写和测试公式
- **交互式图表**: 使用 TradingView Lightweight Charts 显示 K 线和技术指标
- **预设示例**: 包含 MA、MACD、KDJ、BOLL、RSI 等常用指标示例
- **错误提示**: 实时语法检查和错误提示
- **响应式设计**: 支持桌面和移动设备
- **深色主题**: 现代化的深色 UI 设计

## 运行演示

### 开发模式

```bash
# 安装依赖（如果还没安装）
npm install

# 运行开发服务器
npm run demo
```

演示页面将在浏览器中自动打开，默认地址是 `http://localhost:3000/demo/index.html`

### 构建生产版本

```bash
npm run demo:build
```

构建后的文件将输出到 `dist-demo` 目录。

## 使用指南

### 1. 加载示例数据

点击 "加载示例数据" 按钮来加载 100 条模拟的市场数据。K 线图将显示在右侧面板中。

### 2. 选择示例公式

使用页面顶部的下拉菜单选择预设的公式示例：

- **移动平均线 (MA)**: 5、10、20 日均线
- **MACD**: DIF、DEA、MACD 柱状图
- **KDJ**: K、D、J 三条线
- **布林带 (BOLL)**: 上轨、中轨、下轨
- **RSI**: 6 日和 12 日 RSI
- **自定义策略**: 双均线交叉示例

### 3. 编写公式

在左侧编辑器中输入公式。公式语法示例：

```
// 计算 5 日和 10 日移动平均线
MA5: MA(CLOSE, 5), COLORRED;
MA10: MA(CLOSE, 10), COLORBLUE;

// 绘图函数会输出结构化事件，调用方可自行适配图表
DRAWTEXT(CROSS(MA5, MA10), C, 'B');
```

### 4. 执行公式

点击 "执行公式" 按钮，公式将被解析并执行。结果将显示在：

- **图表区域**: 技术指标将叠加在 K 线图上或显示在下方的指标图中
- **计算结果**: 显示每个输出的最新值和平均值

### 5. 查看结果

- 图表支持缩放和拖动
- 点击 "重置缩放" 按钮恢复默认视图
- 错误信息会显示在编辑器下方

## 支持的函数

演示页面支持以下内置函数：

### 数学函数
- `MA(data, period)` - 简单移动平均
- `EMA(data, period)` - 指数移动平均
- `SUM(data, period)` - 求和
- `MAX(data, period)` - 最大值
- `MIN(data, period)` - 最小值

### 引用函数
- `REF(data, offset)` - 引用历史数据
- `HHV(data, period)` - 周期内最高值
- `LLV(data, period)` - 周期内最低值

### 逻辑函数
- `IF(condition, true_val, false_val)` - 条件判断
- `CROSS(a, b)` - 交叉检测

### 绘图事件函数
- `DRAWTEXT(condition, price, text)` - 文字标注事件
- `DRAWICON(condition, price, iconType)` - 图标标注事件
- `DRAWNUMBER(condition, price, number)` - 数字标注事件
- `STICKLINE(condition, price1, price2, width, empty)` - 柱线事件
- `DRAWLINE(cond1, price1, cond2, price2, expand)` - 线段事件
- `POLYLINE(condition, price)` - 折线点事件
- `DRAWBAND(upper, upperColor, lower, lowerColor)` - 带状区域事件
- `DRAWKLINE(high, open, low, close)` - 自定义 K 线事件

### 技术指标
- `MACD()` - MACD 指标
- `KDJ()` - KDJ 指标
- `BOLL()` - 布林带
- `RSI()` - RSI 指标

## 技术栈

- **TypeScript**: 类型安全的开发体验
- **TradingView Lightweight Charts**: 高性能的金融图表库
- **Vite**: 快速的开发服务器和构建工具
- **Vanilla JS**: 无框架依赖，轻量级实现

## 项目结构

```
demo/
├── index.html      # HTML 页面结构
├── styles.css      # 样式文件
├── main.ts         # 主应用逻辑
├── examples.ts     # 示例公式和数据
└── README.md       # 本文件
```

## 浏览器兼容性

- Chrome/Edge: ✓
- Firefox: ✓
- Safari: ✓
- Opera: ✓

建议使用最新版本的现代浏览器以获得最佳体验。

## 问题反馈

如有问题或建议，请访问：https://github.com/DTrader-store/formula-ts/issues
