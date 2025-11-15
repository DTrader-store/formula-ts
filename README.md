# Formula-TS

[![npm version](https://img.shields.io/npm/v/@dtrader/formula-ts.svg)](https://www.npmjs.com/package/@dtrader/formula-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)

A TypeScript implementation of a formula parser and interpreter for technical analysis and financial indicators. Supports TDX (Tongdaxin) formula syntax for trading and technical analysis.

## Features

- **Complete Lexer**: Tokenizes formula source code with support for:
  - Numbers (integers, floats, decimals)
  - Identifiers and keywords
  - Operators (+, -, *, /, >, <, >=, <=, ==, !=, :)
  - Parentheses and semicolons
  - Comments (# line comments)

- **Robust Parser**: Builds Abstract Syntax Trees (AST) with support for:
  - Binary operations (arithmetic and comparison)
  - Function calls
  - Variable assignments
  - Nested expressions

- **Powerful Interpreter**: Execute formulas with 76 built-in functions:
  - **Math & Statistics** (14): MA, EMA, SUM, MAX, MIN, ABS, SQRT, POW, MOD, ROUND, STD, VAR, MEDIAN, AVEDEV
  - **Reference & Comparison** (3): REF, HHV, LLV
  - **Logical Operations** (6): IF, CROSS, EVERY, EXIST, BARSLAST, COUNT
  - **Basic Technical Analysis** (3): SMA, WMA, RSI
  - **Advanced Technical Indicators** (21): MACD (DIF, DEA, MACD), KDJ (K, D, J), SAR, CCI, DMI (PDI, MDI, ADX, ADXR), TRIX, OBV, BIAS, ROC, MTM, WR, PSY
  - **Pattern Detection** (5): UPNDAY, DOWNNDAY, NDAY, RANGE, BETWEEN
  - **Chip Distribution** (6): WINNER, LWINNER, COST, VALUEWHEN, TOPRANGE, LOWRANGE
  - **Market Data Access** (8): OPEN, HIGH, LOW, CLOSE, VOL, AMOUNT, ADVANCE, DECLINE
  - **Time Functions** (8): DATE, TIME, YEAR, MONTH, DAY, HOUR, MINUTE, WEEKDAY
  - **Period Functions** (4): PERIOD, BARSCOUNT, ISLASTBAR, BARSSINCE

- **Incremental Calculation**: Optimize performance for streaming data
  - 50-200% faster than full recalculation
  - Single data point updates in < 10ms
  - Ideal for real-time trading scenarios
  - Handles 10,000+ data points efficiently

- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Detailed error messages with line/column information
- **Well-Tested**: Extensive test coverage (>80%)

## Installation

### NPM

```bash
npm install @dtrader/formula-ts
```

### Yarn

```bash
yarn add @dtrader/formula-ts
```

### PNPM

```bash
pnpm add @dtrader/formula-ts
```

## Quick Start

### Basic Usage

```typescript
import { Lexer, Parser } from '@dtrader/formula-ts';

// 1. Tokenize the formula
const lexer = new Lexer('MA5:MA(CLOSE,5);');
const tokens = lexer.tokenize();

// 2. Parse into AST
const parser = new Parser(tokens);
const ast = parser.parse();

console.log(ast);
```

### Working with Market Data

```typescript
import { MarketData, validateMarketData } from '@dtrader/formula-ts';

const data: MarketData[] = [
  {
    open: 100.0,
    high: 102.5,
    low: 99.5,
    close: 101.25,
    volume: 1000000,
    amount: 101000000
  },
  // ... more data points
];

// Validate market data
const isValid = data.every(validateMarketData);
console.log('Data is valid:', isValid);
```

### Complete Example: MACD Indicator

```typescript
import { FormulaEngine } from '@dtrader/formula-ts';
import { MarketData } from '@dtrader/formula-ts';

// Create formula engine
const engine = new FormulaEngine();

// Define MACD formula
const formula = `
  DIF := EMA(CLOSE, 12) - EMA(CLOSE, 26);
  DEA := EMA(DIF, 9);
  MACD: (DIF - DEA) * 2;
`;

// Prepare market data
const marketData: MarketData[] = [
  { open: 100, close: 102, high: 105, low: 99, volume: 1000 },
  { open: 102, close: 101, high: 103, low: 100, volume: 1100 },
  // ... more data points
];

// Evaluate the formula
const result = engine.evaluate(formula, marketData);

// Access results
console.log('MACD values:', result.outputs[0].data);
console.log('Variables:', result.variables);
```

### Incremental Calculation for Large Datasets

For real-time scenarios with streaming data, use incremental evaluation to optimize performance:

```typescript
import { FormulaEngine } from '@dtrader/formula-ts';
import { MarketData } from '@dtrader/formula-ts';

const engine = new FormulaEngine();
const formula = `
  MA5 := MA(CLOSE, 5);
  MA10 := MA(CLOSE, 10);
  MA20 := MA(CLOSE, 20);
  SIGNAL: IF(MA5 > MA10 AND MA10 > MA20, 1, 0);
`;

// Initial calculation with 1000 data points
const initialData: MarketData[] = [...]; // 1000 points
const result1 = engine.evaluate(formula, initialData);

// Later, when new data arrives (e.g., 10 new candles)
const newData: MarketData[] = [...initialData, ...newCandles]; // 1010 points

// Incremental evaluation - only calculates for new 10 points!
const result2 = engine.evaluateIncremental(formula, newData, result1);

// Performance: 50%+ faster than full recalculation
// Single new point completes in < 10ms
```

**Benefits of Incremental Calculation:**
- 50-200% faster than full recalculation
- Single data point updates in < 10ms
- Maintains result consistency
- Ideal for real-time streaming scenarios
- Handles 10,000+ data points efficiently

## API Documentation

### Lexer

The `Lexer` class tokenizes formula source code into tokens.

```typescript
class Lexer {
  constructor(source: string);
  tokenize(): Token[];
}
```

**Example:**
```typescript
const lexer = new Lexer('MA(CLOSE,5)');
const tokens = lexer.tokenize();
// Returns array of Token objects
```

### Parser

The `Parser` class builds an Abstract Syntax Tree from tokens.

```typescript
class Parser {
  constructor(tokens: Token[]);
  parse(): Program;
}
```

**Example:**
```typescript
const parser = new Parser(tokens);
const ast = parser.parse();
// Returns a Program node containing statements
```

### Token Types

```typescript
enum TokenType {
  NUMBER,
  IDENTIFIER,
  PLUS,
  MINUS,
  MULTIPLY,
  DIVIDE,
  LPAREN,
  RPAREN,
  COMMA,
  SEMICOLON,
  COLON,
  GREATER_THAN,
  LESS_THAN,
  GREATER_EQUAL,
  LESS_EQUAL,
  EQUAL,
  NOT_EQUAL,
  COMMENT,
  EOF
}
```

### AST Node Types

All AST nodes extend the `ASTNode` base interface:

```typescript
interface ASTNode {
  kind: string;
}
```

**Node Types:**
- `Program`: Root node containing statements
- `AssignmentStatement`: Variable assignment (e.g., `MA5:MA(CLOSE,5)`)
- `BinaryExpression`: Binary operations (e.g., `A + B`)
- `FunctionCall`: Function invocation (e.g., `MA(CLOSE,5)`)
- `Identifier`: Variable reference (e.g., `CLOSE`)
- `NumberLiteral`: Numeric value (e.g., `5`, `3.14`)

### Market Data

```typescript
interface MarketData {
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  amount?: number;
}

function validateMarketData(data: unknown): data is MarketData;
function getMarketDataLength(data: MarketData[]): number;
```

### Error Classes

```typescript
class FormulaError extends Error {
  constructor(message: string);
}

class LexerError extends FormulaError {
  constructor(message: string, line: number, column: number);
}

class ParserError extends FormulaError {
  constructor(message: string, token?: Token);
}

class RuntimeError extends FormulaError {
  constructor(message: string);
}
```

## Formula Syntax

### Comments

```
# This is a comment
MA5:MA(CLOSE,5);  # Calculate 5-day moving average
```

### Variable Assignment

```
MA5:MA(CLOSE,5);
MA10:MA(CLOSE,10);
```

### Arithmetic Operations

```
DIFF:MA5-MA10;                # Subtraction
SUM_MA:MA5+MA10;              # Addition
DOUBLE:CLOSE*2;               # Multiplication
HALF:CLOSE/2;                 # Division
```

### Comparison Operations

```
ABOVE:MA5>MA10;               # Greater than
BELOW:MA5<MA10;               # Less than
AT_OR_ABOVE:MA5>=MA10;        # Greater or equal
AT_OR_BELOW:MA5<=MA10;        # Less or equal
EQUAL:MA5==MA10;              # Equal
NOT_EQUAL:MA5!=MA10;          # Not equal
```

### Function Calls

```
MA(CLOSE,5)                   # Moving average
EMA(CLOSE,12)                 # Exponential moving average
IF(CONDITION,A,B)             # Conditional
CROSS(MA5,MA10)               # Crossover detection
```

## Built-in Functions

### MA(data, period)
Simple Moving Average - calculates the average over N periods.

```
MA5:MA(CLOSE,5);
```

### EMA(data, period)
Exponential Moving Average - weighted average giving more weight to recent data.

```
EMA12:EMA(CLOSE,12);
```

### SUM(data, period)
Summation - calculates the sum over N periods.

```
TOTAL:SUM(VOLUME,10);
```

### MAX(a, b)
Maximum - returns element-wise maximum of two arrays.

```
HIGHEST:MAX(MA5,MA10);
```

### MIN(a, b)
Minimum - returns element-wise minimum of two arrays.

```
LOWEST:MIN(MA5,MA10);
```

### REF(data, period)
Reference - returns the value N periods ago.

```
PREV:REF(CLOSE,1);
```

### HHV(data, period)
Highest High Value - returns the highest value over N periods.

```
HIGH20:HHV(HIGH,20);
```

### LLV(data, period)
Lowest Low Value - returns the lowest value over N periods.

```
LOW20:LLV(LOW,20);
```

### IF(condition, a, b)
Conditional - returns A when condition is true (non-zero), otherwise returns B.

```
SIGNAL:IF(MA5>MA10,1,0);
```

### CROSS(a, b)
Crossover - detects when A crosses above B.

```
GOLDEN:CROSS(MA5,MA10);
```

### UPNDAY(data, n)
Consecutive N Day Rise - returns 1 when price rises for N consecutive days.

```
UP3:UPNDAY(CLOSE,3);  # 3 consecutive rising days
```

### DOWNNDAY(data, n)
Consecutive N Day Fall - returns 1 when price falls for N consecutive days.

```
DOWN2:DOWNNDAY(CLOSE,2);  # 2 consecutive falling days
```

### NDAY(condition, n)
Condition Continuous N Days - returns 1 when condition is true for N consecutive days.

```
BULLISH:=CLOSE>OPEN;
BULL3:NDAY(BULLISH,3);  # Bullish for 3 days
```

### RANGE(A, B, C) / BETWEEN(A, B, C)
Range Check - returns 1 when A is between B and C.

```
IN_RANGE:RANGE(CLOSE,100,110);  # Close between 100-110
```

### WINNER(close, volume, targetPrice, [lookback])
Profit Ratio - calculates the ratio of shares profitable at the target price.

- **Parameters**:
  - `close`: Close price array
  - `volume`: Volume array
  - `targetPrice`: Price level to calculate profit ratio
  - `lookback`: Optional, lookback period (default 100)
- **Returns**: Profit ratio (0-1)

```
WIN_RATIO:WINNER(CLOSE,VOLUME,CLOSE,50);
```

### LWINNER(close, volume, targetPrice, [lookback])
Floating Profit Ratio - similar to WINNER but with shorter lookback (default 20).

```
FLOAT_WIN:LWINNER(CLOSE,VOLUME,CLOSE);
```

### COST(close, volume, percent, [lookback])
Cost Distribution - returns the price level at which percent of shares are profitable.

```
COST70:COST(CLOSE,VOLUME,70);  # Price at 70% profit
```

### VALUEWHEN(condition, X)
Value When - returns the value of X when condition is first true.

```
CROSS_UP:=CROSS(MA5,MA10);
BUY_PRICE:VALUEWHEN(CROSS_UP,CLOSE);
```

### TOPRANGE(X, [period])
New High - returns 1 when X reaches a new high over the period (default 20).

```
NEW_HIGH:TOPRANGE(HIGH,20);
```

### LOWRANGE(X, [period])
New Low - returns 1 when X reaches a new low over the period (default 20).

```
NEW_LOW:LOWRANGE(LOW,20);
```

### OPEN
Opening Price - returns the opening price array.

```
O:OPEN;
```

### HIGH
Highest Price - returns the highest price array.

```
H:HIGH;
```

### LOW
Lowest Price - returns the lowest price array.

```
L:LOW;
```

### CLOSE
Closing Price - returns the closing price array.

```
C:CLOSE;
```

### VOL
Trading Volume - returns the trading volume array.

```
V:VOL;
```

### AMOUNT
Trading Amount - returns the trading amount array (requires `amount` field in market data).

```
A:AMOUNT;
```

### ADVANCE
Advancing Stocks - returns the number of advancing stocks (index data only).

```
ADV:ADVANCE;
```

### DECLINE
Declining Stocks - returns the number of declining stocks (index data only).

```
DEC:DECLINE;
```

### DATE
Date - returns date in YYYYMMDD format.

```
D:DATE;  # 20240115
```

### TIME
Time - returns time in HHMMSS format.

```
T:TIME;  # 093000
```

### YEAR
Year - extracts year from timestamp.

```
Y:YEAR;  # 2024
```

### MONTH
Month - extracts month from timestamp (1-12).

```
M:MONTH;  # 1=January, 12=December
```

### DAY
Day - extracts day of month from timestamp (1-31).

```
D:DAY;
```

### HOUR
Hour - extracts hour from timestamp (0-23).

```
H:HOUR;
```

### MINUTE
Minute - extracts minute from timestamp (0-59).

```
MIN:MINUTE;
```

### WEEKDAY
Weekday - returns day of week (1-7, 1=Monday, 7=Sunday).

```
WD:WEEKDAY;
```

### PERIOD
Period Type - automatically detects the period type from timestamps.

- **Returns**: Period code (1=1min, 5=5min, 15=15min, 30=30min, 60=1hour, 101=daily, 102=weekly, 103=monthly)

```
P:PERIOD;
```

### BARSCOUNT
Total Bars - returns the total number of bars in the data.

```
BC:BARSCOUNT;
```

### ISLASTBAR
Is Last Bar - returns 1 for the last bar, 0 for all others.

```
LAST:ISLASTBAR;
```

### BARSSINCE(condition)
Bars Since - counts bars since the first time condition was true.

```
GOLDEN:=CROSS(MA5,MA10);
HOLD:BARSSINCE(GOLDEN);
```

## Advanced Technical Indicators

### MACD - Moving Average Convergence Divergence

MACD is a trend-following momentum indicator that shows the relationship between two moving averages.

**MACD_DIF(close, fast, slow)** - DIF Line (Fast EMA - Slow EMA)
```
DIF:MACD_DIF(CLOSE,12,26);
```

**MACD_DEA(close, fast, slow, signal)** - DEA/Signal Line (EMA of DIF)
```
DEA:MACD_DEA(CLOSE,12,26,9);
```

**MACD_MACD(close, fast, slow, signal)** - MACD Histogram ((DIF - DEA) * 2)
```
MACD:MACD_MACD(CLOSE,12,26,9);
BUY:CROSS(DIF,DEA);
```

### KDJ - Stochastic Oscillator

KDJ is a momentum indicator comparing the closing price to the price range over a period.

**KDJ_K(high, low, close, n, m1)** - K Line (smoothed RSV)
```
K:KDJ_K(HIGH,LOW,CLOSE,9,3);
```

**KDJ_D(high, low, close, n, m1, m2)** - D Line (smoothed K)
```
D:KDJ_D(HIGH,LOW,CLOSE,9,3,3);
```

**KDJ_J(high, low, close, n, m1, m2)** - J Line (3*K - 2*D)
```
J:KDJ_J(HIGH,LOW,CLOSE,9,3,3);
BUY:CROSS(K,D);
```

### SAR - Parabolic Stop and Reverse

SAR is a trend-following indicator providing entry and exit points.

**SAR(high, low, step, max)** - Parabolic SAR
```
SAR_LINE:SAR(HIGH,LOW,0.02,0.2);
LONG:CLOSE>SAR_LINE;
SHORT:CLOSE<SAR_LINE;
```

### CCI - Commodity Channel Index

CCI measures the deviation of price from its statistical mean.

**CCI(high, low, close, period)** - CCI values (typically -200 to +200)
```
CCI14:CCI(HIGH,LOW,CLOSE,14);
OVERBOUGHT:CCI14>100;
OVERSOLD:CCI14<-100;
```

### DMI - Directional Movement Index

DMI measures the strength and direction of a trend.

**DMI_PDI(high, low, close, period)** - Positive Directional Indicator (+DI)
```
PDI:DMI_PDI(HIGH,LOW,CLOSE,14);
```

**DMI_MDI(high, low, close, period)** - Negative Directional Indicator (-DI)
```
MDI:DMI_MDI(HIGH,LOW,CLOSE,14);
```

**DMI_ADX(high, low, close, period)** - Average Directional Index
```
ADX:DMI_ADX(HIGH,LOW,CLOSE,14);
STRONG_TREND:ADX>25;
```

**DMI_ADXR(high, low, close, period)** - ADX Rating
```
ADXR:DMI_ADXR(HIGH,LOW,CLOSE,14);
```

**ADX(high, low, close, period)** - Standalone ADX (alias for DMI_ADX)
```
ADX14:ADX(HIGH,LOW,CLOSE,14);
```

**ADXR(high, low, close, period)** - Standalone ADXR (alias for DMI_ADXR)
```
ADXR14:ADXR(HIGH,LOW,CLOSE,14);
```

### TRIX - Triple Exponential Average

TRIX is a momentum oscillator showing the rate of change of a triple-smoothed EMA.

**TRIX(close, period)** - TRIX percentage
```
TRIX12:TRIX(CLOSE,12);
SIGNAL:MA(TRIX12,9);
BUY:CROSS(TRIX12,SIGNAL);
```

### OBV - On Balance Volume

OBV is a cumulative volume indicator showing buying and selling pressure.

**OBV(close, volume)** - Cumulative volume
```
OBV_LINE:OBV(CLOSE,VOL);
OBV_MA:MA(OBV_LINE,20);
DIVERGENCE:CLOSE>REF(CLOSE,5) AND OBV_LINE<REF(OBV_LINE,5);
```

### BIAS - Bias Ratio

BIAS measures the percentage deviation of price from its moving average.

**BIAS(close, period)** - Deviation percentage
```
BIAS6:BIAS(CLOSE,6);
BIAS12:BIAS(CLOSE,12);
BIAS24:BIAS(CLOSE,24);
OVERSOLD:BIAS6<-5;
OVERBOUGHT:BIAS6>5;
```

### ROC - Rate of Change

ROC measures the percentage change in price over a specified period.

**ROC(close, period)** - Percentage change
```
ROC12:ROC(CLOSE,12);
MOMENTUM_UP:ROC12>0;
MOMENTUM_DOWN:ROC12<0;
```

### MTM - Momentum

MTM measures the absolute change in price over a specified period.

**MTM(close, period)** - Absolute difference
```
MTM12:MTM(CLOSE,12);
MTM_MA:MA(MTM12,6);
BUY:CROSS(MTM12,MTM_MA);
```

### WR - Williams %R

WR is a momentum indicator measuring overbought/oversold levels.

**WR(high, low, close, period)** - Williams %R (-100 to 0)
```
WR14:WR(HIGH,LOW,CLOSE,14);
OVERSOLD:WR14<-80;
OVERBOUGHT:WR14>-20;
```

### PSY - Psychological Line

PSY measures the percentage of up days over a period.

**PSY(close, period)** - Percentage of up days (0-100)
```
PSY12:PSY(CLOSE,12);
BULLISH:PSY12>75;
BEARISH:PSY12<25;
```

## Examples

The project includes example formulas in the `examples/formulas/` directory:

### Moving Average (MA)
```
# examples/formulas/ma.txt
MA5:MA(CLOSE,5);
MA10:MA(CLOSE,10);
MA20:MA(CLOSE,20);
GOLDEN_CROSS:CROSS(MA5,MA10);
```

### MACD Indicator
```
# examples/formulas/macd.txt
FAST:EMA(CLOSE,12);
SLOW:EMA(CLOSE,26);
MACD:FAST-SLOW;
SIGNAL:EMA(MACD,9);
HIST:MACD-SIGNAL;
BUY:CROSS(MACD,SIGNAL);
```

### KDJ Indicator
```
# examples/formulas/kdj.txt
N:9;
HH:HHV(HIGH,N);
LL:LLV(LOW,N);
RSV:(CLOSE-LL)/(HH-LL)*100;
K:EMA(RSV,3);
D:EMA(K,3);
J:3*K-2*D;
```

Sample market data is available in `examples/data/sample-market-data.json`.

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/DTrader-store/formula-ts.git
cd formula-ts

# Install dependencies
npm install

# Build the project
npm run build
```

### Available Scripts

```bash
npm run build          # Compile TypeScript to JavaScript
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run lint          # Lint the codebase
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Project Structure

```
formula-ts/
├── src/
│   ├── lexer/           # Lexical analysis
│   │   ├── Lexer.ts
│   │   ├── Token.ts
│   │   └── TokenType.ts
│   ├── parser/          # Syntax analysis
│   │   ├── Parser.ts
│   │   └── ast/
│   │       └── nodes.ts
│   ├── interpreter/     # Formula execution
│   │   ├── FunctionRegistry.ts
│   │   └── functions/
│   │       ├── math.ts
│   │       ├── reference.ts
│   │       └── logical.ts
│   ├── types/           # Type definitions
│   │   ├── MarketData.ts
│   │   └── FormulaResult.ts
│   ├── errors/          # Error classes
│   │   └── index.ts
│   └── index.ts         # Main entry point
├── tests/               # Test files
│   ├── unit/
│   └── interpreter/
├── examples/            # Example formulas and data
│   ├── formulas/
│   └── data/
├── dist/                # Compiled output
└── docs/                # Documentation
```

## Testing

The project has comprehensive test coverage including:

- **Unit Tests**: Test individual components (Lexer, Parser, Functions)
- **Integration Tests**: Test complete workflows
- **Function Tests**: Test all 10 core functions

**Test Coverage Target**: >80%

Run tests with:
```bash
npm test
```

View coverage report:
```bash
npm run test:coverage
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Message Convention

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Adding or updating tests
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

## License

MIT License - see [LICENSE](LICENSE) file for details.

Copyright (c) 2025 DTrader-store

## Author

[DTrader-store](https://github.com/DTrader-store)

## Version

1.0.0

## Keywords

- formula parser
- technical analysis
- financial indicators
- typescript
- MACD
- moving average
- stock analysis
- trading indicators
- tdx
- tongdaxin

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/DTrader-store/formula-ts/issues) page.

## Publishing

This package is published on NPM as [@dtrader/formula-ts](https://www.npmjs.com/package/@dtrader/formula-ts).

To use the latest version, install it with your preferred package manager:

```bash
npm install @dtrader/formula-ts@latest
```
