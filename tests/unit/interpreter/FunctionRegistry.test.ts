import { FunctionRegistry, FormulaFunction } from '../../../src/interpreter/FunctionRegistry';

describe('FunctionRegistry', () => {
  let registry: FunctionRegistry;

  beforeEach(() => {
    registry = new FunctionRegistry();
  });

  describe('register', () => {
    it('should register a function', () => {
      const mockFn: FormulaFunction = {
        name: 'ADD',
        minArgs: 2,
        maxArgs: 2,
        execute: (args) => args[0] + args[1]
      };

      registry.register(mockFn);
      expect(registry.has('ADD')).toBe(true);
    });

    it('should handle case-insensitive registration', () => {
      const mockFn: FormulaFunction = {
        name: 'Add',
        minArgs: 2,
        maxArgs: 2,
        execute: (args) => args[0] + args[1]
      };

      registry.register(mockFn);
      expect(registry.has('add')).toBe(true);
      expect(registry.has('ADD')).toBe(true);
      expect(registry.has('AdD')).toBe(true);
    });

    it('should prevent duplicate registration of the same function', () => {
      const mockFn: FormulaFunction = {
        name: 'ADD',
        minArgs: 2,
        maxArgs: 2,
        execute: (args) => args[0] + args[1]
      };

      registry.register(mockFn);

      expect(() => {
        registry.register(mockFn);
      }).toThrow('Function ADD is already registered');
    });

    it('should prevent duplicate registration regardless of case', () => {
      const mockFn1: FormulaFunction = {
        name: 'ADD',
        minArgs: 2,
        maxArgs: 2,
        execute: (args) => args[0] + args[1]
      };

      const mockFn2: FormulaFunction = {
        name: 'add',
        minArgs: 2,
        maxArgs: 2,
        execute: (args) => args[0] + args[1]
      };

      registry.register(mockFn1);

      expect(() => {
        registry.register(mockFn2);
      }).toThrow('Function ADD is already registered');
    });
  });

  describe('get', () => {
    it('should retrieve a registered function', () => {
      const mockFn: FormulaFunction = {
        name: 'ADD',
        minArgs: 2,
        maxArgs: 2,
        execute: (args) => args[0] + args[1]
      };

      registry.register(mockFn);
      const retrieved = registry.get('ADD');

      expect(retrieved).toBe(mockFn);
    });

    it('should retrieve function with case-insensitive name', () => {
      const mockFn: FormulaFunction = {
        name: 'ADD',
        minArgs: 2,
        maxArgs: 2,
        execute: (args) => args[0] + args[1]
      };

      registry.register(mockFn);
      expect(registry.get('add')).toBe(mockFn);
      expect(registry.get('ADD')).toBe(mockFn);
      expect(registry.get('AdD')).toBe(mockFn);
    });

    it('should return undefined for unregistered function', () => {
      expect(registry.get('UNKNOWN')).toBeUndefined();
    });

    it('should return undefined for unregistered function case-insensitively', () => {
      const mockFn: FormulaFunction = {
        name: 'ADD',
        minArgs: 2,
        maxArgs: 2,
        execute: (args) => args[0] + args[1]
      };

      registry.register(mockFn);
      expect(registry.get('MULTIPLY')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for registered function', () => {
      const mockFn: FormulaFunction = {
        name: 'ADD',
        minArgs: 2,
        maxArgs: 2,
        execute: (args) => args[0] + args[1]
      };

      registry.register(mockFn);
      expect(registry.has('ADD')).toBe(true);
    });

    it('should return false for unregistered function', () => {
      expect(registry.has('ADD')).toBe(false);
    });

    it('should be case-insensitive', () => {
      const mockFn: FormulaFunction = {
        name: 'ADD',
        minArgs: 2,
        maxArgs: 2,
        execute: (args) => args[0] + args[1]
      };

      registry.register(mockFn);
      expect(registry.has('add')).toBe(true);
      expect(registry.has('ADD')).toBe(true);
      expect(registry.has('AdD')).toBe(true);
    });
  });

  describe('getAllNames', () => {
    it('should return empty array when no functions are registered', () => {
      expect(registry.getAllNames()).toEqual([]);
    });

    it('should return all registered function names', () => {
      const fn1: FormulaFunction = {
        name: 'ADD',
        minArgs: 2,
        maxArgs: 2,
        execute: (args) => args[0] + args[1]
      };

      const fn2: FormulaFunction = {
        name: 'MULTIPLY',
        minArgs: 2,
        maxArgs: 2,
        execute: (args) => args[0] * args[1]
      };

      const fn3: FormulaFunction = {
        name: 'DIVIDE',
        minArgs: 2,
        maxArgs: 2,
        execute: (args) => args[0] / args[1]
      };

      registry.register(fn1);
      registry.register(fn2);
      registry.register(fn3);

      const names = registry.getAllNames();
      expect(names).toHaveLength(3);
      expect(names).toContain('ADD');
      expect(names).toContain('MULTIPLY');
      expect(names).toContain('DIVIDE');
    });

    it('should return names in uppercase', () => {
      const fn1: FormulaFunction = {
        name: 'add',
        minArgs: 2,
        maxArgs: 2,
        execute: (args) => args[0] + args[1]
      };

      const fn2: FormulaFunction = {
        name: 'MuLtIpLy',
        minArgs: 2,
        maxArgs: 2,
        execute: (args) => args[0] * args[1]
      };

      registry.register(fn1);
      registry.register(fn2);

      const names = registry.getAllNames();
      expect(names).toContain('ADD');
      expect(names).toContain('MULTIPLY');
    });
  });

  describe('FormulaFunction interface', () => {
    it('should execute function with proper arguments', () => {
      const mockFn: FormulaFunction = {
        name: 'ADD',
        minArgs: 2,
        maxArgs: 2,
        execute: (args) => args[0] + args[1]
      };

      registry.register(mockFn);
      const fn = registry.get('ADD');

      expect(fn).toBeDefined();
      if (fn) {
        const result = fn.execute([5, 3]);
        expect(result).toBe(8);
      }
    });

    it('should support variable argument functions', () => {
      const mockFn: FormulaFunction = {
        name: 'SUM',
        minArgs: 1,
        maxArgs: Infinity,
        execute: (args) => args.reduce((a, b) => a + b, 0)
      };

      registry.register(mockFn);
      const fn = registry.get('SUM');

      expect(fn).toBeDefined();
      if (fn) {
        const result = fn.execute([1, 2, 3, 4, 5]);
        expect(result).toBe(15);
      }
    });
  });
});
