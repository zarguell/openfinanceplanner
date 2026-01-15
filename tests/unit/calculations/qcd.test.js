global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value;
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

import {
  mustTakeQCD,
  canAccountTakeQCD,
  calculateQCDForAccount,
  calculateTotalQCD,
  getQCDLimit,
  getQCDMinimumAge,
  calculateQCDTaxBenefit,
  validateQCDSettings,
} from '../../../src/calculations/qcd.js';

export function testMustTakeQCD() {
  console.log('Testing mustTakeQCD...');

  if (mustTakeQCD(70) !== false) {
    throw new Error('Age 70 should not qualify for QCD');
  }
  console.log('✓ Age 70 does not qualify');

  if (mustTakeQCD(70.5) !== true) {
    throw new Error('Age 70.5 should qualify for QCD');
  }
  console.log('✓ Age 70.5 qualifies');

  if (mustTakeQCD(71) !== true) {
    throw new Error('Age 71 should qualify for QCD');
  }
  console.log('✓ Age 71 qualifies');

  if (mustTakeQCD(80) !== true) {
    throw new Error('Age 80 should qualify for QCD');
  }
  console.log('✓ Age 80 qualifies');

  console.log('✅ testMustTakeQCD PASSED\n');
}

export function testCanAccountTakeQCD() {
  console.log('Testing canAccountTakeQCD...');

  if (canAccountTakeQCD('IRA') !== true) {
    throw new Error('IRA should qualify for QCD');
  }
  console.log('✓ IRA qualifies');

  if (canAccountTakeQCD('401k') !== true) {
    throw new Error('401k should qualify for QCD');
  }
  console.log('✓ 401k qualifies');

  if (canAccountTakeQCD('Roth') !== false) {
    throw new Error('Roth should not qualify for QCD');
  }
  console.log('✓ Roth does not qualify');

  if (canAccountTakeQCD('HSA') !== false) {
    throw new Error('HSA should not qualify for QCD');
  }
  console.log('✓ HSA does not qualify');

  if (canAccountTakeQCD('Taxable') !== false) {
    throw new Error('Taxable should not qualify for QCD');
  }
  console.log('✓ Taxable does not qualify');

  console.log('✅ testCanAccountTakeQCD PASSED\n');
}

export function testCalculateQCDForAccount() {
  console.log('Testing calculateQCDForAccount...');

  const settings = { enabled: true, strategy: 'fixed', annualAmount: 5000 * 100, currentAge: 71 };
  const account = { type: 'IRA', balance: 100000 * 100 };

  const qcd = calculateQCDForAccount(account, settings, 0);
  if (qcd !== 5000 * 100) {
    throw new Error(`Expected QCD of ${5000 * 100}, got ${qcd}`);
  }
  console.log('✓ Fixed strategy QCD calculated correctly');

  const percentageSettings = {
    enabled: true,
    strategy: 'percentage',
    percentage: 0.1,
    currentAge: 71,
  };
  const qcdPercentage = calculateQCDForAccount(account, percentageSettings, 0);
  if (qcdPercentage !== 10000 * 100) {
    throw new Error(`Expected QCD of ${10000 * 100}, got ${qcdPercentage}`);
  }
  console.log('✓ Percentage strategy QCD calculated correctly');

  const rmdSettings = { enabled: true, strategy: 'rmd', currentAge: 71 };
  const qcdRMD = calculateQCDForAccount(account, rmdSettings, 3000 * 100);
  if (qcdRMD !== 3000 * 100) {
    throw new Error(`Expected QCD of ${3000 * 100}, got ${qcdRMD}`);
  }
  console.log('✓ RMD strategy QCD calculated correctly');

  const disabledSettings = {
    enabled: false,
    strategy: 'fixed',
    annualAmount: 5000 * 100,
    currentAge: 71,
  };
  const qcdDisabled = calculateQCDForAccount(account, disabledSettings, 0);
  if (qcdDisabled !== 0) {
    throw new Error(`Expected QCD of 0 when disabled, got ${qcdDisabled}`);
  }
  console.log('✓ Disabled QCD returns 0');

  const youngSettings = {
    enabled: true,
    strategy: 'fixed',
    annualAmount: 5000 * 100,
    currentAge: 65,
  };
  const qcdYoung = calculateQCDForAccount(account, youngSettings, 0);
  if (qcdYoung !== 0) {
    throw new Error(`Expected QCD of 0 for age 65, got ${qcdYoung}`);
  }
  console.log('✓ QCD returns 0 for age < 70.5');

  console.log('✅ testCalculateQCDForAccount PASSED\n');
}

export function testCalculateTotalQCD() {
  console.log('Testing calculateTotalQCD...');

  const accounts = [
    { type: 'IRA', balance: 200000 * 100 },
    { type: '401k', balance: 300000 * 100 },
    { type: 'Roth', balance: 100000 * 100 },
  ];

  const settings = { enabled: true, strategy: 'fixed', annualAmount: 10000 * 100, currentAge: 72 };
  const totalQCD = calculateTotalQCD(accounts, settings, 0);

  if (totalQCD !== 20000 * 100) {
    throw new Error(`Expected total QCD of ${20000 * 100}, got ${totalQCD}`);
  }
  console.log('✓ Total QCD calculated correctly across eligible accounts');

  console.log('✅ testCalculateTotalQCD PASSED\n');
}

export function testGetQCDLimit() {
  console.log('Testing getQCDLimit...');

  const limit = getQCDLimit();
  if (limit !== 100000 * 100) {
    throw new Error(`Expected QCD limit of ${100000 * 100}, got ${limit}`);
  }
  console.log('✓ QCD limit is $100,000');

  console.log('✅ testGetQCDLimit PASSED\n');
}

export function testGetQCDMinimumAge() {
  console.log('Testing getQCDMinimumAge...');

  const minAge = getQCDMinimumAge();
  if (minAge !== 70.5) {
    throw new Error(`Expected minimum age of 70.5, got ${minAge}`);
  }
  console.log('✓ QCD minimum age is 70.5');

  console.log('✅ testGetQCDMinimumAge PASSED\n');
}

export function testCalculateQCDTaxBenefit() {
  console.log('Testing calculateQCDTaxBenefit...');

  const benefit = calculateQCDTaxBenefit(10000 * 100, 0.24);
  const expectedBenefit = 10000 * 100 * 0.24;

  if (benefit !== expectedBenefit) {
    throw new Error(`Expected tax benefit of ${expectedBenefit}, got ${benefit}`);
  }
  console.log('✓ Tax benefit calculated correctly');

  const zeroBenefit = calculateQCDTaxBenefit(0, 0.24);
  if (zeroBenefit !== 0) {
    throw new Error(`Expected tax benefit of 0 for zero QCD, got ${zeroBenefit}`);
  }
  console.log('✓ Zero QCD returns zero tax benefit');

  console.log('✅ testCalculateQCDTaxBenefit PASSED\n');
}

export function testValidateQCDSettings() {
  console.log('Testing validateQCDSettings...');

  const validSettings = { enabled: true, strategy: 'fixed', annualAmount: 5000 * 100 };
  const errors1 = validateQCDSettings(validSettings);
  if (errors1.length !== 0) {
    throw new Error(`Valid settings should have no errors, got: ${errors1.join(', ')}`);
  }
  console.log('✓ Valid settings pass validation');

  const invalidStrategy = { enabled: true, strategy: 'invalid', annualAmount: 5000 * 100 };
  const errors2 = validateQCDSettings(invalidStrategy);
  if (errors2.length === 0 || !errors2[0].includes('Invalid QCD strategy')) {
    throw new Error('Invalid strategy should produce error');
  }
  console.log('✓ Invalid strategy detected');

  const negativeAmount = { enabled: true, strategy: 'fixed', annualAmount: -100 };
  const errors3 = validateQCDSettings(negativeAmount);
  if (errors3.length === 0 || !errors3[0].includes('Fixed QCD amount must be positive')) {
    throw new Error('Negative amount should produce error');
  }
  console.log('✓ Negative amount detected');

  const invalidPercentage = { enabled: true, strategy: 'percentage', percentage: 1.5 };
  const errors4 = validateQCDSettings(invalidPercentage);
  if (errors4.length === 0 || !errors4[0].includes('percentage must be between 0 and 1')) {
    throw new Error('Invalid percentage should produce error');
  }
  console.log('✓ Invalid percentage detected');

  console.log('✅ testValidateQCDSettings PASSED\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('=== QCD Calculation Unit Tests ===\n');

  try {
    testMustTakeQCD();
    testCanAccountTakeQCD();
    testCalculateQCDForAccount();
    testCalculateTotalQCD();
    testGetQCDLimit();
    testGetQCDMinimumAge();
    testCalculateQCDTaxBenefit();
    testValidateQCDSettings();

    console.log('=== All QCD Unit Tests PASSED ✅ ===\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}
