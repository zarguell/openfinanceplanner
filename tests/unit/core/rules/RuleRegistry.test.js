import { describe, it, expect } from 'vitest';
import { BaseRule, RuleRegistry, StrategyFactory } from '../../../../src/core/rules/index.js';

class MockRule extends BaseRule {
  constructor(config) {
    super(config);
    this.applied = false;
  }

  apply(context) {
    this.applied = true;
    return { applied: true, ruleName: this.name };
  }
}

describe('BaseRule', () => {
  describe('validation', () => {
    it('should pass validation for valid rule', () => {
      const rule = new MockRule({
        name: 'test-rule',
        description: 'Test rule',
        dependencies: [],
      });

      const validation = rule.validate();
      expect(validation.valid).toBe(true);
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const rule = new MockRule({
        name: 'test-rule',
        description: 'Test rule',
        dependencies: ['dep1', 'dep2'],
      });

      const metadata = rule.getMetadata();

      expect(metadata.name).toBe('test-rule');
      expect(metadata.description).toBe('Test rule');
      expect(metadata.dependencies.length).toBe(2);
    });
  });
});

describe('RuleRegistry', () => {
  describe('register', () => {
    it('should successfully register a rule', () => {
      const registry = new RuleRegistry();
      const rule = new MockRule({
        name: 'test-rule',
        description: 'Test rule',
        dependencies: [],
      });

      const result = registry.register(rule);

      expect(result.success).toBe(true);
      expect(registry.has('test-rule')).toBe(true);
    });

    it('should reject duplicate rule registration', () => {
      const registry = new RuleRegistry();
      const rule1 = new MockRule({
        name: 'test-rule',
        description: 'Test rule',
        dependencies: [],
      });

      const rule2 = new MockRule({
        name: 'test-rule',
        description: 'Duplicate rule',
        dependencies: [],
      });

      registry.register(rule1);
      const result = registry.register(rule2);

      expect(result.success).toBe(false);
    });
  });

  describe('get', () => {
    it('should retrieve registered rule', () => {
      const registry = new RuleRegistry();
      const rule = new MockRule({
        name: 'test-rule',
        description: 'Test rule',
        dependencies: [],
      });

      registry.register(rule);
      const retrieved = registry.get('test-rule');

      expect(retrieved).toBe(rule);
    });
  });

  describe('list', () => {
    it('should return list of registered rules', () => {
      const registry = new RuleRegistry();
      registry.register(new MockRule({ name: 'rule1', description: 'Rule 1', dependencies: [] }));
      registry.register(new MockRule({ name: 'rule2', description: 'Rule 2', dependencies: [] }));

      const rules = registry.list();

      expect(rules.length).toBe(2);
      expect(rules.includes('rule1')).toBe(true);
      expect(rules.includes('rule2')).toBe(true);
    });
  });

  describe('unregister', () => {
    it('should successfully unregister a rule', () => {
      const registry = new RuleRegistry();
      const rule = new MockRule({
        name: 'test-rule',
        description: 'Test rule',
        dependencies: [],
      });

      registry.register(rule);
      const removed = registry.unregister('test-rule');

      expect(removed).toBe(true);
      expect(registry.has('test-rule')).toBe(false);
    });
  });

  describe('validateDependencies', () => {
    it('should pass for valid dependencies', () => {
      const registry = new RuleRegistry();
      registry.register(new MockRule({ name: 'rule1', description: 'Rule 1', dependencies: [] }));
      registry.register(
        new MockRule({ name: 'rule2', description: 'Rule 2', dependencies: ['rule1'] })
      );
      registry.register(
        new MockRule({ name: 'rule3', description: 'Rule 3', dependencies: ['rule2'] })
      );

      const validation = registry.validateDependencies();

      expect(validation.valid).toBe(true);
    });

    it('should detect missing dependency', () => {
      const registry = new RuleRegistry();
      registry.register(
        new MockRule({ name: 'rule1', description: 'Rule 1', dependencies: ['nonexistent'] })
      );

      const validation = registry.validateDependencies();

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should detect circular dependencies', () => {
      const registry = new RuleRegistry();
      registry.register(
        new MockRule({ name: 'rule1', description: 'Rule 1', dependencies: ['rule2'] })
      );
      registry.register(
        new MockRule({ name: 'rule2', description: 'Rule 2', dependencies: ['rule3'] })
      );
      registry.register(
        new MockRule({ name: 'rule3', description: 'Rule 3', dependencies: ['rule1'] })
      );

      const detection = registry.detectCircularDependencies();

      expect(detection.valid).toBe(false);
      expect(detection.cycles.length).toBeGreaterThan(0);
    });
  });

  describe('getExecutionOrder', () => {
    it('should return rules in correct execution order', () => {
      const registry = new RuleRegistry();
      registry.register(new MockRule({ name: 'rule1', description: 'Rule 1', dependencies: [] }));
      registry.register(
        new MockRule({ name: 'rule2', description: 'Rule 2', dependencies: ['rule1'] })
      );
      registry.register(
        new MockRule({ name: 'rule3', description: 'Rule 3', dependencies: ['rule1', 'rule2'] })
      );

      const order = registry.getExecutionOrder();

      expect(order.length).toBe(3);
      expect(order[0].name).toBe('rule1');
      expect(order[2].name).toBe('rule3');
    });
  });
});

describe('StrategyFactory', () => {
  describe('registerRuleClass', () => {
    it('should register rule class', () => {
      const factory = new StrategyFactory();
      factory.registerRuleClass('mock', MockRule);

      expect(factory.hasRuleType('mock')).toBe(true);
    });
  });

  describe('create', () => {
    it('should create rule instance', () => {
      const factory = new StrategyFactory();
      factory.registerRuleClass('mock', MockRule);

      const rule = factory.create({
        type: 'mock',
        name: 'test-rule',
        settings: {
          description: 'Test rule created by factory',
        },
      });

      expect(rule instanceof MockRule).toBe(true);
      expect(rule.name).toBe('test-rule');
    });

    it('should throw error for unknown rule type', () => {
      const factory = new StrategyFactory();

      expect(() => {
        factory.create({
          type: 'nonexistent',
          name: 'test-rule',
        });
      }).toThrow('Unknown rule type');
    });
  });

  describe('createMany', () => {
    it('should create multiple rule instances', () => {
      const factory = new StrategyFactory();
      factory.registerRuleClass('mock', MockRule);

      const rules = factory.createMany([
        { type: 'mock', name: 'rule1', settings: { description: 'Rule 1' } },
        { type: 'mock', name: 'rule2', settings: { description: 'Rule 2' } },
      ]);

      expect(rules.length).toBe(2);
      expect(rules[0].name).toBe('rule1');
      expect(rules[1].name).toBe('rule2');
    });
  });

  describe('listRuleTypes', () => {
    it('should return list of registered rule types', () => {
      const factory = new StrategyFactory();
      factory.registerRuleClass('mock', MockRule);

      const types = factory.listRuleTypes();

      expect(types.length).toBe(1);
      expect(types.includes('mock')).toBe(true);
    });
  });
});
