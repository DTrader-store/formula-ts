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

- **Powerful Interpreter**: Execute formulas with 10 core functions:
  - **MA**: Simple Moving Average
  - **EMA**: Exponential Moving Average
  - **SUM**: Summation over N periods
  - **MAX**: Element-wise maximum
  - **MIN**: Element-wise minimum
  - **REF**: Reference value N periods ago
  - **HHV**: Highest High Value over N periods
  - **LLV**: Lowest Low Value over N periods
  - **IF**: Conditional selection
  - **CROSS**: Crossover detection

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
