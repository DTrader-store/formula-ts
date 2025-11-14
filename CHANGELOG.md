# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-14

### Added

#### Core Components
- **Lexer**: Complete lexical analyzer for tokenizing formula source code
  - Support for numbers (integers, floats, decimals)
  - Identifier and keyword recognition
  - Operators: `+`, `-`, `*`, `/`, `>`, `<`, `>=`, `<=`, `==`, `!=`, `:`
  - Parentheses, commas, semicolons, and comments
  - Line comments starting with `#`
  - Comprehensive error reporting with line and column information

- **Parser**: Robust Abstract Syntax Tree (AST) builder
  - Binary operations (arithmetic and comparison)
  - Function calls with multiple arguments
  - Variable assignments with colon syntax (e.g., `MA5:MA(CLOSE,5)`)
  - Nested expressions and operator precedence
  - Detailed parsing error messages

- **AST Node Types**
  - `Program`: Root node containing statements
  - `AssignmentStatement`: Variable assignment
  - `BinaryExpression`: Binary operations
  - `FunctionCall`: Function invocations
  - `Identifier`: Variable references
  - `NumberLiteral`: Numeric constants

#### Interpreter & Functions
- **10 Core Built-in Functions**
  - `MA(data, period)`: Simple Moving Average
  - `EMA(data, period)`: Exponential Moving Average
  - `SUM(data, period)`: Summation over N periods
  - `MAX(a, b)`: Element-wise maximum
  - `MIN(a, b)`: Element-wise minimum
  - `REF(data, period)`: Reference value N periods ago
  - `HHV(data, period)`: Highest High Value over N periods
  - `LLV(data, period)`: Lowest Low Value over N periods
  - `IF(condition, a, b)`: Conditional selection
  - `CROSS(a, b)`: Crossover detection

#### Type Definitions
- **MarketData Interface**
  - OHLCV (Open, High, Low, Close, Volume)
  - Optional amount field
  - Validation function for type safety

- **FormulaResult Types**
  - Result values and types
  - Error information for failed computations
  - Comprehensive type definitions

- **Token Types**
  - Complete enumeration of all supported token types
  - Token class with value, type, line, and column information

#### Error Handling
- Hierarchical error classes
- `FormulaError`: Base error class
- `LexerError`: Lexical analysis errors with line/column info
- `ParserError`: Syntax analysis errors with token context
- `RuntimeError`: Execution-time errors

#### Examples & Documentation
- Example formulas for common technical indicators
  - Simple Moving Average (MA)
  - MACD indicator
  - KDJ indicator
- Sample market data in JSON format
- Comprehensive README with API documentation
- Full project structure documentation

#### Project Configuration
- TypeScript configuration with strict type checking
- Jest test framework setup
- ESLint configuration for code quality
- Prettier configuration for code formatting
- GitHub repository setup with issues and discussion templates

#### Testing
- Unit tests for Lexer, Parser, and core functions
- Integration tests for complete workflows
- Test coverage >80%
- Test utilities and fixtures

### Technical Details

- **Language**: TypeScript 5.9.3
- **Target**: ES2020
- **Module System**: CommonJS
- **Type Safety**: Strict mode enabled
- **Source Maps**: Generated for debugging
- **Declaration Maps**: Included for better IDE support

### Development Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm test`: Run all tests
- `npm run test:watch`: Watch mode for development
- `npm run test:coverage`: Coverage report
- `npm run lint`: Lint code with ESLint
- `npm run format`: Format with Prettier
- `npm run format:check`: Check code formatting

## Release Process

This release marks the first public version (1.0.0) of Formula-TS with complete core functionality for parsing and interpreting technical analysis formulas compatible with TDX (Tongdaxin) syntax.

### Future Versions

- Performance optimizations for large datasets
- Additional built-in functions
- Support for more indicator types
- Plugin system for custom functions
- Enhanced error recovery in parser
