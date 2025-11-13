import {
  ASTNode,
  NodeType,
  Program,
  VariableDeclaration,
  OutputDeclaration,
  ExpressionStatement,
  BinaryExpression,
  UnaryExpression,
  FunctionCall,
  ConditionalExpression,
  Identifier,
  NumberLiteral,
  DrawingStyle,
  BinaryOperator,
  UnaryOperator,
} from '../../../../src/parser/ast/nodes';

describe('AST Nodes', () => {
  describe('Program', () => {
    it('should create a valid Program node', () => {
      const program: Program = {
        type: NodeType.Program,
        body: [],
      };

      expect(program.type).toBe(NodeType.Program);
      expect(program.body).toEqual([]);
    });

    it('should contain statements in body', () => {
      const numLiteral: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: 10,
      };

      const varDecl: VariableDeclaration = {
        type: NodeType.VariableDeclaration,
        name: 'x',
        value: numLiteral,
      };

      const program: Program = {
        type: NodeType.Program,
        body: [varDecl],
      };

      expect(program.body).toHaveLength(1);
      expect(program.body[0].type).toBe(NodeType.VariableDeclaration);
    });
  });

  describe('VariableDeclaration', () => {
    it('should create a valid variable declaration', () => {
      const numLiteral: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: 100,
      };

      const varDecl: VariableDeclaration = {
        type: NodeType.VariableDeclaration,
        name: 'price',
        value: numLiteral,
      };

      expect(varDecl.type).toBe(NodeType.VariableDeclaration);
      expect(varDecl.name).toBe('price');
      expect(varDecl.value.type).toBe(NodeType.NumberLiteral);
    });
  });

  describe('OutputDeclaration', () => {
    it('should create a valid output declaration', () => {
      const numLiteral: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: 42,
      };

      const output: OutputDeclaration = {
        type: NodeType.OutputDeclaration,
        name: 'result',
        value: numLiteral,
        style: {
          color: 'red',
          size: 12,
        },
      };

      expect(output.type).toBe(NodeType.OutputDeclaration);
      expect(output.name).toBe('result');
      expect(output.style?.color).toBe('red');
    });

    it('should allow optional style', () => {
      const numLiteral: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: 42,
      };

      const output: OutputDeclaration = {
        type: NodeType.OutputDeclaration,
        name: 'result',
        value: numLiteral,
      };

      expect(output.style).toBeUndefined();
    });
  });

  describe('ExpressionStatement', () => {
    it('should create a valid expression statement', () => {
      const numLiteral: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: 5,
      };

      const stmt: ExpressionStatement = {
        type: NodeType.ExpressionStatement,
        expression: numLiteral,
      };

      expect(stmt.type).toBe(NodeType.ExpressionStatement);
      expect(stmt.expression.type).toBe(NodeType.NumberLiteral);
    });
  });

  describe('BinaryExpression', () => {
    it('should create a valid binary expression', () => {
      const left: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: 5,
      };

      const right: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: 3,
      };

      const binExpr: BinaryExpression = {
        type: NodeType.BinaryExpression,
        left,
        operator: BinaryOperator.Plus,
        right,
      };

      expect(binExpr.type).toBe(NodeType.BinaryExpression);
      expect(binExpr.operator).toBe(BinaryOperator.Plus);
    });

    it('should support different binary operators', () => {
      const operators = [
        BinaryOperator.Plus,
        BinaryOperator.Minus,
        BinaryOperator.Multiply,
        BinaryOperator.Divide,
        BinaryOperator.Modulo,
        BinaryOperator.Power,
        BinaryOperator.Equal,
        BinaryOperator.NotEqual,
        BinaryOperator.LessThan,
        BinaryOperator.LessThanOrEqual,
        BinaryOperator.GreaterThan,
        BinaryOperator.GreaterThanOrEqual,
        BinaryOperator.And,
        BinaryOperator.Or,
      ];

      operators.forEach((op) => {
        const leftId: Identifier = {
          type: NodeType.Identifier,
          name: 'a',
        };

        const rightId: Identifier = {
          type: NodeType.Identifier,
          name: 'b',
        };

        const binExpr: BinaryExpression = {
          type: NodeType.BinaryExpression,
          left: leftId,
          operator: op,
          right: rightId,
        };

        expect(binExpr.operator).toBe(op);
      });
    });
  });

  describe('UnaryExpression', () => {
    it('should create a valid unary expression', () => {
      const numLiteral: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: 5,
      };

      const unaryExpr: UnaryExpression = {
        type: NodeType.UnaryExpression,
        operator: UnaryOperator.Minus,
        operand: numLiteral,
      };

      expect(unaryExpr.type).toBe(NodeType.UnaryExpression);
      expect(unaryExpr.operator).toBe(UnaryOperator.Minus);
    });

    it('should support different unary operators', () => {
      const operators = [UnaryOperator.Minus, UnaryOperator.Not];

      operators.forEach((op) => {
        const identifier: Identifier = {
          type: NodeType.Identifier,
          name: 'x',
        };

        const unaryExpr: UnaryExpression = {
          type: NodeType.UnaryExpression,
          operator: op,
          operand: identifier,
        };

        expect(unaryExpr.operator).toBe(op);
      });
    });
  });

  describe('FunctionCall', () => {
    it('should create a valid function call with no arguments', () => {
      const funcCall: FunctionCall = {
        type: NodeType.FunctionCall,
        name: 'rand',
        arguments: [],
      };

      expect(funcCall.type).toBe(NodeType.FunctionCall);
      expect(funcCall.name).toBe('rand');
      expect(funcCall.arguments).toHaveLength(0);
    });

    it('should create a valid function call with arguments', () => {
      const arg1: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: 10,
      };

      const arg2: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: 20,
      };

      const funcCall: FunctionCall = {
        type: NodeType.FunctionCall,
        name: 'max',
        arguments: [arg1, arg2],
      };

      expect(funcCall.arguments).toHaveLength(2);
      expect(funcCall.arguments[0].type).toBe(NodeType.NumberLiteral);
    });
  });

  describe('ConditionalExpression', () => {
    it('should create a valid conditional expression', () => {
      const leftId: Identifier = {
        type: NodeType.Identifier,
        name: 'x',
      };

      const rightNum: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: 5,
      };

      const test: BinaryExpression = {
        type: NodeType.BinaryExpression,
        left: leftId,
        operator: BinaryOperator.GreaterThan,
        right: rightNum,
      };

      const consequent: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: 1,
      };

      const alternate: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: 0,
      };

      const conditional: ConditionalExpression = {
        type: NodeType.ConditionalExpression,
        test,
        consequent,
        alternate,
      };

      expect(conditional.type).toBe(NodeType.ConditionalExpression);
      expect(conditional.test.type).toBe(NodeType.BinaryExpression);
    });
  });

  describe('Identifier', () => {
    it('should create a valid identifier', () => {
      const id: Identifier = {
        type: NodeType.Identifier,
        name: 'price',
      };

      expect(id.type).toBe(NodeType.Identifier);
      expect(id.name).toBe('price');
    });
  });

  describe('NumberLiteral', () => {
    it('should create a valid number literal', () => {
      const num: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: 42.5,
      };

      expect(num.type).toBe(NodeType.NumberLiteral);
      expect(num.value).toBe(42.5);
    });

    it('should support integer and float values', () => {
      const intNum: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: 100,
      };

      const floatNum: NumberLiteral = {
        type: NodeType.NumberLiteral,
        value: 3.14159,
      };

      expect(intNum.value).toBe(100);
      expect(floatNum.value).toBe(3.14159);
    });
  });

  describe('DrawingStyle', () => {
    it('should create a valid drawing style with all properties', () => {
      const style: DrawingStyle = {
        color: 'blue',
        size: 14,
        bold: true,
        italic: false,
      };

      expect(style.color).toBe('blue');
      expect(style.size).toBe(14);
      expect(style.bold).toBe(true);
      expect(style.italic).toBe(false);
    });

    it('should allow partial drawing style', () => {
      const style: DrawingStyle = {
        color: 'red',
      };

      expect(style.color).toBe('red');
      expect(style.size).toBeUndefined();
    });

    it('should allow empty drawing style', () => {
      const style: DrawingStyle = {};

      expect(Object.keys(style).length).toBe(0);
    });
  });

  describe('Type Guards and Discriminated Unions', () => {
    it('should correctly identify different node types', () => {
      const program: Program = { type: NodeType.Program, body: [] };
      const numLiteral: NumberLiteral = { type: NodeType.NumberLiteral, value: 42 };
      const identifier: Identifier = { type: NodeType.Identifier, name: 'x' };

      const nodes: ASTNode[] = [program, numLiteral, identifier];

      expect(nodes[0].type).toBe(NodeType.Program);
      expect(nodes[1].type).toBe(NodeType.NumberLiteral);
      expect(nodes[2].type).toBe(NodeType.Identifier);
    });
  });
});
