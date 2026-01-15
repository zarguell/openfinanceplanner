import {
  calculateUnrealizedLoss,
  calculateTotalUnrealizedLoss,
  calculateTaxBenefitFromLoss,
  suggestHarvestingAmount,
  validateHarvestingAmount,
  applyHarvesting,
  isHarvestingEnabled,
  getStrategyDescription,
} from '../../../src/calculations/tax-loss-harvesting.js';

export function testCalculateUnrealizedLoss() {
  const taxableAccount = {
    type: 'Taxable',
    balance: 4500000, // $45,000
    costBasis: 5000000, // $50,000 basis
  };

  const loss = calculateUnrealizedLoss(taxableAccount);
  if (loss !== 500000) {
    // 50,000 - 45,000 = 5,000 loss
    throw new Error(`Expected $5,000 loss, got $${loss / 100}`);
  }
  console.log('✓ testCalculateUnrealizedLoss passed');
}

export function testCalculateUnrealizedLossNonTaxable() {
  const nonTaxableAccount = {
    type: '401k',
    balance: 4500000,
    costBasis: 5000000,
  };

  const loss = calculateUnrealizedLoss(nonTaxableAccount);
  if (loss !== 0) {
    throw new Error(`Non-taxable accounts should return 0 loss, got $${loss / 100}`);
  }
  console.log('✓ testCalculateUnrealizedLossNonTaxable passed');
}

export function testCalculateUnrealizedLossNoLoss() {
  const gainAccount = {
    type: 'Taxable',
    balance: 5500000, // $55,000
    costBasis: 5000000, // $50,000 basis
  };

  const loss = calculateUnrealizedLoss(gainAccount);
  if (loss !== 0) {
    throw new Error(`Gain should return 0 loss, got $${loss / 100}`);
  }
  console.log('✓ testCalculateUnrealizedLossNoLoss passed');
}

export function testCalculateUnrealizedLossNoCostBasis() {
  const noBasisAccount = {
    type: 'Taxable',
    balance: 4500000,
  };

  const loss = calculateUnrealizedLoss(noBasisAccount);
  if (loss !== 0) {
    throw new Error(`Account without costBasis should return 0, got $${loss / 100}`);
  }
  console.log('✓ testCalculateUnrealizedLossNoCostBasis passed');
}

export function testCalculateTotalUnrealizedLoss() {
  const accounts = [
    { type: 'Taxable', balance: 4500000, costBasis: 5000000 },
    { type: '401k', balance: 10000000, costBasis: 10000000 },
    { type: 'Taxable', balance: 3500000, costBasis: 4000000 },
  ];

  const totalLoss = calculateTotalUnrealizedLoss(accounts);
  const expected = 500000 + 500000; // Two Taxable accounts with losses

  if (totalLoss !== expected) {
    throw new Error(`Expected $${expected / 100} total loss, got $${totalLoss / 100}`);
  }
  console.log('✓ testCalculateTotalUnrealizedLoss passed');
}

export function testCalculateTaxBenefitFromLoss() {
  const harvestedLoss = 1000000; // $10,000
  const capitalGains = 500000; // $5,000
  const marginalRate = 0.24;

  const benefit = calculateTaxBenefitFromLoss(harvestedLoss, capitalGains, marginalRate);

  // Long-term gain offset: min(10000, 5000) = 5000 * 15% = 750
  // Ordinary income offset: min(10000 - 5000, 3000) = 3000 * 24% = 720
  // Total expected: $1470 = 147000 cents
  const expected = 147000;

  if (benefit !== expected) {
    throw new Error(`Expected $${expected / 100} benefit, got $${benefit / 100}`);
  }
  console.log('✓ testCalculateTaxBenefitFromLoss passed');
}

export function testCalculateTaxBenefitFromLossNoLoss() {
  const benefit = calculateTaxBenefitFromLoss(0, 500000, 0.24);

  if (benefit !== 0) {
    throw new Error(`Zero loss should return 0 benefit, got $${benefit}`);
  }
  console.log('✓ testCalculateTaxBenefitFromLossNoLoss passed');
}

export function testCalculateTaxBenefitFromLossExcessLoss() {
  const largeLoss = 6000000; // $60,000 loss
  const smallGains = 100000; // $1,000 gains
  const marginalRate = 0.24;

  const benefit = calculateTaxBenefitFromLoss(largeLoss, smallGains, marginalRate);

  // Gains offset: 1000 * 15% = 150
  // Ordinary income offset: min(60000 - 1000, 3000) = 3000 * 24% = 720
  // Total expected: $870 = 87000 cents
  const expected = 87000;

  if (benefit !== expected) {
    throw new Error(`Expected $${expected / 100} benefit with excess loss, got $${benefit / 100}`);
  }
  console.log('✓ testCalculateTaxBenefitFromLossExcessLoss passed');
}

export function testSuggestHarvestingAmountAllStrategy() {
  const unrealizedLoss = 5000000; // $50,000
  const capitalGains = 0;
  const marginalRate = 0.24;
  const settings = {
    enabled: true,
    strategy: 'all',
    threshold: 100000,
  };

  const suggestion = suggestHarvestingAmount(unrealizedLoss, capitalGains, marginalRate, settings);

  if (suggestion.harvestAmountCents !== 5000000) {
    throw new Error(
      `Expected $50,000 harvest with 'all' strategy, got $${suggestion.harvestAmountCents / 100}`
    );
  }
  if (!suggestion.reason.includes('all')) {
    throw new Error(`Expected 'all' reason, got: ${suggestion.reason}`);
  }
  console.log('✓ testSuggestHarvestingAmountAllStrategy passed');
}

export function testSuggestHarvestingAmountOffsetGainsStrategy() {
  const unrealizedLoss = 10000000; // $100,000
  const capitalGains = 200000; // $2,000
  const marginalRate = 0.24;
  const settings = {
    enabled: true,
    strategy: 'offset-gains',
    threshold: 100000,
  };

  const suggestion = suggestHarvestingAmount(unrealizedLoss, capitalGains, marginalRate, settings);

  // Should harvest: gains (200,000) + $3,000 ordinary income cap = 500,000
  if (suggestion.harvestAmountCents !== 500000) {
    throw new Error(
      `Expected $5,000 harvest with 'offset-gains' strategy, got $${suggestion.harvestAmountCents / 100}`
    );
  }
  if (!suggestion.reason.includes('offset gains')) {
    throw new Error(`Expected 'offset gains' reason, got: ${suggestion.reason}`);
  }
  console.log('✓ testSuggestHarvestingAmountOffsetGainsStrategy passed');
}

export function testSuggestHarvestingAmountBelowThreshold() {
  const unrealizedLoss = 80000; // $800 (below $1,000 threshold)
  const capitalGains = 0;
  const marginalRate = 0.24;
  const settings = {
    enabled: true,
    strategy: 'all',
    threshold: 100000,
  };

  const suggestion = suggestHarvestingAmount(unrealizedLoss, capitalGains, marginalRate, settings);

  if (suggestion.harvestAmountCents !== 0) {
    throw new Error(
      `Should not harvest below threshold, got $${suggestion.harvestAmountCents / 100}`
    );
  }
  if (!suggestion.reason.includes('below')) {
    throw new Error(`Expected 'below threshold' reason, got: ${suggestion.reason}`);
  }
  console.log('✓ testSuggestHarvestingAmountBelowThreshold passed');
}

export function testSuggestHarvestingAmountNoLoss() {
  const unrealizedLoss = 0;
  const capitalGains = 500000;
  const marginalRate = 0.24;
  const settings = {
    enabled: true,
    strategy: 'all',
    threshold: 100000,
  };

  const suggestion = suggestHarvestingAmount(unrealizedLoss, capitalGains, marginalRate, settings);

  if (suggestion.harvestAmountCents !== 0) {
    throw new Error(`No loss should return 0 harvest, got $${suggestion.harvestAmountCents / 100}`);
  }
  if (!suggestion.reason.includes('No unrealized')) {
    throw new Error(`Expected 'No unrealized' reason, got: ${suggestion.reason}`);
  }
  console.log('✓ testSuggestHarvestingAmountNoLoss passed');
}

export function testValidateHarvestingAmount() {
  const account = {
    type: 'Taxable',
    balance: 4500000,
    costBasis: 5000000,
  };

  const valid = validateHarvestingAmount(500000, account);
  if (!valid) {
    throw new Error(`Expected valid harvest of $5,000, got invalid`);
  }
  console.log('✓ testValidateHarvestingAmount passed');
}

export function testValidateHarvestingAmountExceedsLoss() {
  const account = {
    type: 'Taxable',
    balance: 4500000,
    costBasis: 5000000,
  };

  const valid = validateHarvestingAmount(600000, account);
  if (valid) {
    throw new Error(`Should not validate harvest exceeding loss ($6,000 vs $5,000 loss)`);
  }
  console.log('✓ testValidateHarvestingAmountExceedsLoss passed');
}

export function testValidateHarvestingAmountNonTaxable() {
  const account = {
    type: '401k',
    balance: 4500000,
    costBasis: 5000000,
  };

  const valid = validateHarvestingAmount(500000, account);
  if (valid) {
    throw new Error(`Non-taxable account should be invalid`);
  }
  console.log('✓ testValidateHarvestingAmountNonTaxable passed');
}

export function testValidateHarvestingAmountNegative() {
  const account = {
    type: 'Taxable',
    balance: 4500000,
    costBasis: 5000000,
  };

  const valid = validateHarvestingAmount(-1000, account);
  if (valid) {
    throw new Error(`Negative harvest should be invalid`);
  }
  console.log('✓ testValidateHarvestingAmountNegative passed');
}

export function testApplyHarvesting() {
  const account = {
    type: 'Taxable',
    balance: 4500000, // $45,000 current
    costBasis: 5000000, // $50,000 basis
  };

  const harvestAmount = 500000; // $5,000
  const result = applyHarvesting(account, harvestAmount);

  if (!result.success) {
    throw new Error(`Expected successful harvest`);
  }
  if (result.newCostBasis !== 4000000) {
    // $45,000 - $5,000 = $40,000
    throw new Error(`Expected $40,000 new cost basis, got $${result.newCostBasis / 100}`);
  }
  if (result.harvestedLoss !== 500000) {
    throw new Error(`Expected $5,000 harvested loss, got $${result.harvestedLoss / 100}`);
  }
  console.log('✓ testApplyHarvesting passed');
}

export function testApplyHarvestingInvalid() {
  const account = {
    type: 'Taxable',
    balance: 4500000,
    costBasis: 5000000,
  };

  const harvestAmount = 600000; // Exceeds loss
  const result = applyHarvesting(account, harvestAmount);

  if (result.success) {
    throw new Error(`Expected invalid harvest`);
  }
  console.log('✓ testApplyHarvestingInvalid passed');
}

export function testIsHarvestingEnabled() {
  if (!isHarvestingEnabled({ enabled: true })) {
    throw new Error(`Should return true when enabled`);
  }
  if (isHarvestingEnabled({ enabled: false })) {
    throw new Error(`Should return false when disabled`);
  }
  if (isHarvestingEnabled(null)) {
    throw new Error(`Should return false when null`);
  }
  if (isHarvestingEnabled(undefined)) {
    throw new Error(`Should return false when undefined`);
  }
  console.log('✓ testIsHarvestingEnabled passed');
}

export function testGetStrategyDescription() {
  const allDesc = getStrategyDescription('all');
  const offsetDesc = getStrategyDescription('offset-gains');
  const unknownDesc = getStrategyDescription('unknown');

  if (!allDesc.includes('all available')) {
    throw new Error(`Unexpected 'all' description: ${allDesc}`);
  }
  if (!offsetDesc.includes('offset capital gains')) {
    throw new Error(`Unexpected 'offset-gains' description: ${offsetDesc}`);
  }
  if (!unknownDesc.includes('unknown')) {
    throw new Error(`Should return strategy identifier when unknown`);
  }
  console.log('✓ testGetStrategyDescription passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testCalculateUnrealizedLoss();
    testCalculateUnrealizedLossNonTaxable();
    testCalculateUnrealizedLossNoLoss();
    testCalculateUnrealizedLossNoCostBasis();
    testCalculateTotalUnrealizedLoss();
    testCalculateTaxBenefitFromLoss();
    testCalculateTaxBenefitFromLossNoLoss();
    testCalculateTaxBenefitFromLossExcessLoss();
    testSuggestHarvestingAmountAllStrategy();
    testSuggestHarvestingAmountOffsetGainsStrategy();
    testSuggestHarvestingAmountBelowThreshold();
    testSuggestHarvestingAmountNoLoss();
    testValidateHarvestingAmount();
    testValidateHarvestingAmountExceedsLoss();
    testValidateHarvestingAmountNonTaxable();
    testValidateHarvestingAmountNegative();
    testApplyHarvesting();
    testApplyHarvestingInvalid();
    testIsHarvestingEnabled();
    testGetStrategyDescription();

    console.log('\n=== All Tax-Loss Harvesting Unit Tests PASSED ✅ ===');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}
