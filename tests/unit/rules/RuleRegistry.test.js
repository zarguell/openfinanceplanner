/**
 * Unit tests for RuleRegistry
 */

import { RuleRegistry } from '../../../src/rules/RuleRegistry.js';
import { RuleInterface } from '../../../src/rules/RuleInterface.js';

class MockRule extends RuleInterface {
  constructor(id = 'test_rule', name = 'Test Rule') {
    super();
    this.ruleId = id;
    this.ruleName = name;
  }

  getId() {
    return this.ruleId;
  }
  getName() {
    return this.ruleName;
  }
  getDescription() {
    return 'Test rule description';
  }
  getParameters() {
    return [];
  }
  validateParameters(params) {
    return { isValid: true, errors: [] };
  }
  isApplicable(plan, yearOffset, projectionState) {
    return true;
  }
  apply(plan, yearOffset, projectionState, params) {
    return { applied: true, changes: {}, metadata: {} };
  }
  getDependencies() {
    return [];
  }
  getVersion() {
    return '1.0.0';
  }
  getCategory() {
    return 'tax_optimization';
  }
}

export function testRuleRegistryCreation() {
  const registry = new RuleRegistry();

  if (!registry.rules || !registry.categories || !registry.versions) {
    throw new Error('RuleRegistry not properly initialized');
  }

  console.log('✓ testRuleRegistryCreation passed');
}

export function testRuleRegistration() {
  const registry = new RuleRegistry();
  const rule = new MockRule('test_rule', 'Test Rule');

  registry.register(rule);

  if (!registry.hasRule('test_rule')) {
    throw new Error('Rule was not registered');
  }

  if (registry.getRule('test_rule') !== rule) {
    throw new Error('Registered rule not returned correctly');
  }

  console.log('✓ testRuleRegistration passed');
}

export function testRuleUnregistration() {
  const registry = new RuleRegistry();
  const rule = new MockRule('test_rule', 'Test Rule');

  registry.register(rule);

  const unregistered = registry.unregister('test_rule');
  if (!unregistered) {
    throw new Error('Rule was not unregistered');
  }

  if (registry.hasRule('test_rule')) {
    throw new Error('Rule still exists after unregistration');
  }

  // Test unregistering non-existent rule
  const notFound = registry.unregister('non_existent');
  if (notFound) {
    throw new Error('Unregistering non-existent rule should return false');
  }

  console.log('✓ testRuleUnregistration passed');
}

export function testRuleCategories() {
  const registry = new RuleRegistry();

  const rule1 = new MockRule('rule_one', 'Rule 1');
  // Override category for testing
  rule1.getCategory = () => 'tax_optimization';

  const rule2 = new MockRule('rule_two', 'Rule 2');
  rule2.getCategory = () => 'tax_optimization';

  const rule3 = new MockRule('rule_three', 'Rule 3');
  rule3.getCategory = () => 'withdrawal_strategy';

  registry.register(rule1);
  registry.register(rule2);
  registry.register(rule3);

  const categories = registry.getCategories();
  if (!categories.includes('tax_optimization') || !categories.includes('withdrawal_strategy')) {
    throw new Error('Categories not tracked correctly');
  }

  const taxRules = registry.getRulesByCategory('tax_optimization');
  if (taxRules.length !== 2) {
    throw new Error('Wrong number of rules in tax_optimization category');
  }

  const withdrawalRules = registry.getRulesByCategory('withdrawal_strategy');
  if (withdrawalRules.length !== 1) {
    throw new Error('Wrong number of rules in withdrawal_strategy category');
  }

  console.log('✓ testRuleCategories passed');
}

export function testDependencyValidation() {
  const registry = new RuleRegistry();

  const rule1 = new MockRule('rule_one', 'Rule 1');
  const rule2 = new MockRule('rule_two', 'Rule 2');
  rule2.getDependencies = () => ['rule_one']; // rule2 depends on rule1

  registry.register(rule1);
  registry.register(rule2);

  // Test valid dependencies
  const validResult = registry.validateDependencies(['rule_one', 'rule_two']);
  if (!validResult.isValid) {
    throw new Error('Valid dependencies reported as invalid');
  }

  // Test missing dependencies
  const invalidResult = registry.validateDependencies(['rule_two']); // rule1 missing
  if (invalidResult.isValid) {
    throw new Error('Invalid dependencies reported as valid');
  }

  if (!invalidResult.missingDependencies.has('rule_two')) {
    throw new Error('Missing dependency not detected');
  }

  console.log('✓ testDependencyValidation passed');
}

export function testApplicableRules() {
  const registry = new RuleRegistry();

  const rule1 = new MockRule('rule_one', 'Rule 1');
  const rule2 = new MockRule('rule_two', 'Rule 2');
  rule2.getDependencies = () => ['rule_one'];

  registry.register(rule1);
  registry.register(rule2);

  const applicable = registry.getApplicableRules(['rule_one', 'rule_two']);
  if (applicable.length !== 2) {
    throw new Error('Not all rules returned as applicable');
  }

  // Test with missing dependency
  const applicablePartial = registry.getApplicableRules(['rule_two']); // rule1 not enabled
  if (applicablePartial.length !== 0) {
    throw new Error('Rules with unsatisfied dependencies should not be applicable');
  }

  console.log('✓ testApplicableRules passed');
}

export function testRuleValidation() {
  const registry = new RuleRegistry();

  // Test invalid rule ID
  class InvalidRule extends RuleInterface {
    getId() {
      return 'INVALID_ID';
    } // Should be lowercase with underscores
    getName() {
      return 'Invalid Rule';
    }
    getDescription() {
      return 'Test';
    }
    getParameters() {
      return [];
    }
    validateParameters() {
      return { isValid: true, errors: [] };
    }
    isApplicable() {
      return true;
    }
    apply() {
      return { applied: true, changes: {}, metadata: {} };
    }
    getDependencies() {
      return [];
    }
    getVersion() {
      return '1.0.0';
    }
    getCategory() {
      return 'invalid_category';
    } // Invalid category
  }

  try {
    registry.register(new InvalidRule());
    throw new Error('Invalid rule should not be registered');
  } catch (error) {
    // Expected - invalid rule should throw error
  }

  console.log('✓ testRuleValidation passed');
}

export function testRegistrySummary() {
  const registry = new RuleRegistry();

  const rule1 = new MockRule('rule_one', 'Rule 1');
  rule1.getCategory = () => 'tax_optimization';

  const rule2 = new MockRule('rule_two', 'Rule 2');
  rule2.getCategory = () => 'withdrawal_strategy';

  registry.register(rule1);
  registry.register(rule2);

  const summary = registry.getSummary();

  if (summary.totalRules !== 2) {
    throw new Error('Wrong total rules count');
  }

  if (!summary.categories.tax_optimization || summary.categories.tax_optimization !== 1) {
    throw new Error('Tax optimization category count incorrect');
  }

  if (!summary.categories.withdrawal_strategy || summary.categories.withdrawal_strategy !== 1) {
    throw new Error('Withdrawal strategy category count incorrect');
  }

  console.log('✓ testRegistrySummary passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testRuleRegistryCreation();
    testRuleRegistration();
    testRuleUnregistration();
    testRuleCategories();
    testDependencyValidation();
    testApplicableRules();
    testRuleValidation();
    testRegistrySummary();
    console.log('\nAll RuleRegistry tests passed! ✓');
  } catch (error) {
    console.error('RuleRegistry test failed:', error.message);
    process.exit(1);
  }
}
