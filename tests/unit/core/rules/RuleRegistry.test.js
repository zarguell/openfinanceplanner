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

export function testBaseRuleValidation() {
  const rule = new MockRule({
    name: 'test-rule',
    description: 'Test rule',
    dependencies: [],
  });

  const validation = rule.validate();
  if (!validation.valid) {
    throw new Error(`BaseRule validation failed: ${validation.errors.join(', ')}`);
  }

  console.log('✓ testBaseRuleValidation passed');
}

export function testBaseRuleGetMetadata() {
  const rule = new MockRule({
    name: 'test-rule',
    description: 'Test rule',
    dependencies: ['dep1', 'dep2'],
  });

  const metadata = rule.getMetadata();
  if (metadata.name !== 'test-rule') {
    throw new Error(`Expected name "test-rule", got "${metadata.name}"`);
  }

  if (metadata.description !== 'Test rule') {
    throw new Error(`Expected description "Test rule", got "${metadata.description}"`);
  }

  if (metadata.dependencies.length !== 2) {
    throw new Error(`Expected 2 dependencies, got ${metadata.dependencies.length}`);
  }

  console.log('✓ testBaseRuleGetMetadata passed');
}

export function testRuleRegistryRegister() {
  const registry = new RuleRegistry();
  const rule = new MockRule({
    name: 'test-rule',
    description: 'Test rule',
    dependencies: [],
  });

  const result = registry.register(rule);
  if (!result.success) {
    throw new Error(`Failed to register rule: ${result.error}`);
  }

  if (!registry.has('test-rule')) {
    throw new Error('Rule was not registered');
  }

  console.log('✓ testRuleRegistryRegister passed');
}

export function testRuleRegistryDuplicate() {
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

  if (result.success) {
    throw new Error('Should not allow duplicate rule registration');
  }

  console.log('✓ testRuleRegistryDuplicate passed');
}

export function testRuleRegistryGet() {
  const registry = new RuleRegistry();
  const rule = new MockRule({
    name: 'test-rule',
    description: 'Test rule',
    dependencies: [],
  });

  registry.register(rule);
  const retrieved = registry.get('test-rule');

  if (retrieved !== rule) {
    throw new Error('Retrieved rule is not the same instance');
  }

  console.log('✓ testRuleRegistryGet passed');
}

export function testRuleRegistryList() {
  const registry = new RuleRegistry();
  registry.register(new MockRule({ name: 'rule1', description: 'Rule 1', dependencies: [] }));
  registry.register(new MockRule({ name: 'rule2', description: 'Rule 2', dependencies: [] }));

  const rules = registry.list();
  if (rules.length !== 2) {
    throw new Error(`Expected 2 rules, got ${rules.length}`);
  }

  if (!rules.includes('rule1') || !rules.includes('rule2')) {
    throw new Error('Rule list does not contain expected rules');
  }

  console.log('✓ testRuleRegistryList passed');
}

export function testRuleRegistryUnregister() {
  const registry = new RuleRegistry();
  const rule = new MockRule({
    name: 'test-rule',
    description: 'Test rule',
    dependencies: [],
  });

  registry.register(rule);
  const removed = registry.unregister('test-rule');

  if (!removed) {
    throw new Error('Failed to unregister rule');
  }

  if (registry.has('test-rule')) {
    throw new Error('Rule was not unregistered');
  }

  console.log('✓ testRuleRegistryUnregister passed');
}

export function testRuleRegistryDependencies() {
  const registry = new RuleRegistry();
  registry.register(new MockRule({ name: 'rule1', description: 'Rule 1', dependencies: [] }));
  registry.register(
    new MockRule({ name: 'rule2', description: 'Rule 2', dependencies: ['rule1'] })
  );
  registry.register(
    new MockRule({ name: 'rule3', description: 'Rule 3', dependencies: ['rule2'] })
  );

  const validation = registry.validateDependencies();
  if (!validation.valid) {
    throw new Error(`Dependency validation failed: ${validation.errors.join(', ')}`);
  }

  console.log('✓ testRuleRegistryDependencies passed');
}

export function testRuleRegistryMissingDependency() {
  const registry = new RuleRegistry();
  registry.register(
    new MockRule({ name: 'rule1', description: 'Rule 1', dependencies: ['nonexistent'] })
  );

  const validation = registry.validateDependencies();
  if (validation.valid) {
    throw new Error('Should detect missing dependency');
  }

  if (validation.errors.length === 0) {
    throw new Error('Should have validation errors');
  }

  console.log('✓ testRuleRegistryMissingDependency passed');
}

export function testRuleRegistryCircularDependencies() {
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
  if (detection.valid) {
    throw new Error('Should detect circular dependencies');
  }

  if (detection.cycles.length === 0) {
    throw new Error('Should have found circular dependency cycles');
  }

  console.log('✓ testRuleRegistryCircularDependencies passed');
}

export function testRuleRegistryExecutionOrder() {
  const registry = new RuleRegistry();
  registry.register(new MockRule({ name: 'rule1', description: 'Rule 1', dependencies: [] }));
  registry.register(
    new MockRule({ name: 'rule2', description: 'Rule 2', dependencies: ['rule1'] })
  );
  registry.register(
    new MockRule({ name: 'rule3', description: 'Rule 3', dependencies: ['rule1', 'rule2'] })
  );

  const order = registry.getExecutionOrder();
  if (order.length !== 3) {
    throw new Error(`Expected 3 rules in execution order, got ${order.length}`);
  }

  if (order[0].name !== 'rule1') {
    throw new Error('Rule 1 should execute first (no dependencies)');
  }

  if (order[2].name !== 'rule3') {
    throw new Error('Rule 3 should execute last (depends on rule1 and rule2)');
  }

  console.log('✓ testRuleRegistryExecutionOrder passed');
}

export function testStrategyFactoryRegister() {
  const factory = new StrategyFactory();
  factory.registerRuleClass('mock', MockRule);

  if (!factory.hasRuleType('mock')) {
    throw new Error('Rule type was not registered');
  }

  console.log('✓ testStrategyFactoryRegister passed');
}

export function testStrategyFactoryCreate() {
  const factory = new StrategyFactory();
  factory.registerRuleClass('mock', MockRule);

  const rule = factory.create({
    type: 'mock',
    name: 'test-rule',
    settings: {
      description: 'Test rule created by factory',
    },
  });

  if (!(rule instanceof MockRule)) {
    throw new Error('Factory did not create MockRule instance');
  }

  if (rule.name !== 'test-rule') {
    throw new Error(`Expected name "test-rule", got "${rule.name}"`);
  }

  console.log('✓ testStrategyFactoryCreate passed');
}

export function testStrategyFactoryUnknownType() {
  const factory = new StrategyFactory();

  try {
    factory.create({
      type: 'nonexistent',
      name: 'test-rule',
    });
    throw new Error('Should throw error for unknown rule type');
  } catch (error) {
    if (!error.message.includes('Unknown rule type')) {
      throw new Error(`Expected "Unknown rule type" error, got: ${error.message}`);
    }
  }

  console.log('✓ testStrategyFactoryUnknownType passed');
}

export function testStrategyFactoryCreateMany() {
  const factory = new StrategyFactory();
  factory.registerRuleClass('mock', MockRule);

  const rules = factory.createMany([
    { type: 'mock', name: 'rule1', settings: { description: 'Rule 1' } },
    { type: 'mock', name: 'rule2', settings: { description: 'Rule 2' } },
  ]);

  if (rules.length !== 2) {
    throw new Error(`Expected 2 rules, got ${rules.length}`);
  }

  if (rules[0].name !== 'rule1' || rules[1].name !== 'rule2') {
    throw new Error('Rules do not have expected names');
  }

  console.log('✓ testStrategyFactoryCreateMany passed');
}

export function testStrategyFactoryListTypes() {
  const factory = new StrategyFactory();
  factory.registerRuleClass('mock', MockRule);

  const types = factory.listRuleTypes();
  if (types.length !== 1) {
    throw new Error(`Expected 1 rule type, got ${types.length}`);
  }

  if (!types.includes('mock')) {
    throw new Error('Rule types should include "mock"');
  }

  console.log('✓ testStrategyFactoryListTypes passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testBaseRuleValidation();
    testBaseRuleGetMetadata();
    testRuleRegistryRegister();
    testRuleRegistryDuplicate();
    testRuleRegistryGet();
    testRuleRegistryList();
    testRuleRegistryUnregister();
    testRuleRegistryDependencies();
    testRuleRegistryMissingDependency();
    testRuleRegistryCircularDependencies();
    testRuleRegistryExecutionOrder();
    testStrategyFactoryRegister();
    testStrategyFactoryCreate();
    testStrategyFactoryUnknownType();
    testStrategyFactoryCreateMany();
    testStrategyFactoryListTypes();
    console.log('All RuleRegistry and StrategyFactory tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}
