import { calculateRMDForAccount, calculateTotalRMD, mustTakeRMD, getRMDStartAge, getLifeExpectancyFactor } from '../../../src/calculations/rmd.js';

export function testGetLifeExpectancyFactor() {
  const result = getLifeExpectancyFactor(72);
  if (result !== 27.4) {
    throw new Error(`Expected 27.4 for age 72, got ${result}`);
  }
  console.log('✓ testGetLifeExpectancyFactor passed');
}

export function testGetLifeExpectancyFactorUnder72() {
  const result = getLifeExpectancyFactor(70);
  if (result !== null) {
    throw new Error('Expected null for age under 72, got ' + result);
  }
  console.log('✓ testGetLifeExpectancyFactorUnder72 passed');
}

export function testGetLifeExpectancyFactorOver120() {
  const result = getLifeExpectancyFactor(125);
  if (result !== 1.9) {
    throw new Error(`Expected 1.9 for age 125 (capped at 120), got ${result}`);
  }
  console.log('✓ testGetLifeExpectancyFactorOver120 passed');
}

export function testCalculateRMDStandard() {
  const account = { type: '401k', balance: 5000000 };
  const rmd = calculateRMDForAccount(account, 75);

  const expected = Math.round(5000000 / 24.6);
  if (Math.abs(rmd - expected) > 100) {
    throw new Error(`Expected ~${expected}, got ${rmd}`);
  }
  console.log('✓ testCalculateRMDStandard passed');
}

export function testCalculateRMDUnder72() {
  const account = { type: 'IRA', balance: 10000000 };
  const rmd = calculateRMDForAccount(account, 70);

  if (rmd !== 0) {
    throw new Error(`Expected 0 for age under 72, got ${rmd}`);
  }
  console.log('✓ testCalculateRMDUnder72 passed');
}

export function testCalculateRMDRoth() {
  const account = { type: 'Roth', balance: 10000000 };
  const rmd = calculateRMDForAccount(account, 75);

  if (rmd !== 0) {
    throw new Error(`Expected 0 for Roth accounts, got ${rmd}`);
  }
  console.log('✓ testCalculateRMDRoth passed');
}

export function testCalculateRMDHSA() {
  const account = { type: 'HSA', balance: 5000000 };
  const rmd = calculateRMDForAccount(account, 75);

  if (rmd !== 0) {
    throw new Error(`Expected 0 for HSA accounts, got ${rmd}`);
  }
  console.log('✓ testCalculateRMDHSA passed');
}

export function testCalculateRMDTaxable() {
  const account = { type: 'Taxable', balance: 10000000 };
  const rmd = calculateRMDForAccount(account, 75);

  if (rmd !== 0) {
    throw new Error(`Expected 0 for Taxable accounts (no RMDs), got ${rmd}`);
  }
  console.log('✓ testCalculateRMDTaxable passed');
}

export function testCalculateTotalRMD() {
  const accounts = [
    { type: '401k', balance: 20000000 },
    { type: 'IRA', balance: 15000000 },
    { type: 'Roth', balance: 5000000 }
  ];
  const rmd = calculateTotalRMD(accounts, 75);

  const expected = Math.round(20000000 / 24.6) + Math.round(15000000 / 24.6);
  if (Math.abs(rmd - expected) > 100) {
    throw new Error(`Expected ~${expected}, got ${rmd}`);
  }
  console.log('✓ testCalculateTotalRMD passed');
}

export function testMustTakeRMD() {
  if (mustTakeRMD(70)) {
    throw new Error('Expected false for age 70');
  }
  console.log('✓ testMustTakeRMD passed');
}

export function testMustTakeRMD73() {
  if (!mustTakeRMD(73)) {
    throw new Error('Expected true for age 73');
  }
  console.log('✓ testMustTakeRMD73 passed');
}

export function testMustTakeRMD72_1951() {
  if (!mustTakeRMD(72, 1951)) {
    throw new Error('Expected true for age 72 with 1951 birth year');
  }
  console.log('✓ testMustTakeRMD72_1951 passed');
}

export function testMustTakeRMD73_1951() {
  if (!mustTakeRMD(73, 1951)) {
    throw new Error('Expected true for age 73 with 1951 birth year');
  }
  console.log('✓ testMustTakeRMD73_1951 passed');
}

export function testGetRMDStartAgeStandard() {
  const age = getRMDStartAge();
  if (age !== 73) {
    throw new Error(`Expected 73, got ${age}`);
  }
  console.log('✓ testGetRMDStartAgeStandard passed');
}

export function testGetRMDStartAge1951() {
  const age = getRMDStartAge(1951);
  if (age !== 72) {
    throw new Error(`Expected 72 for 1951 birth year, got ${age}`);
  }
  console.log('✓ testGetRMDStartAge1951 passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testGetLifeExpectancyFactor();
  testGetLifeExpectancyFactorUnder72();
  testGetLifeExpectancyFactorOver120();
  testCalculateRMDStandard();
  testCalculateRMDUnder72();
  testCalculateRMDRoth();
  testCalculateRMDHSA();
  testCalculateRMDTaxable();
  testCalculateTotalRMD();
  testMustTakeRMD();
  testMustTakeRMD73();
  testMustTakeRMD72_1951();
  testMustTakeRMD73_1951();
  testGetRMDStartAgeStandard();
  testGetRMDStartAge1951();

  console.log('\n✅ All RMD tests passed!');
}
