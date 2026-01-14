import { Income } from '../../../src/core/models/Income.js';

export function testIncomeCreation() {
  const income = new Income('Software Engineer Salary', 120000, 0, 'salary');

  if (income.name !== 'Software Engineer Salary') {
    throw new Error('Expected income name to match');
  }

  if (income.baseAmount !== 12000000) { // Stored in cents
    throw new Error('Expected baseAmount to be in cents');
  }

  if (income.type !== 'salary') {
    throw new Error('Expected type to be salary');
  }

  if (income.growthRate !== 0.03) {
    throw new Error('Expected default growthRate to be 0.03');
  }

  console.log('✓ testIncomeCreation passed');
}

export function testIncomeTaxTreatment() {
  const salaryIncome = new Income('Salary', 100000, 0, 'salary');
  const dividendIncome = new Income('Dividends', 5000, 0, 'dividends');
  const rentalIncome = new Income('Rental', 20000, 0, 'rental');

  if (salaryIncome.getTaxTreatment() !== 'earned') {
    throw new Error('Expected salary to be earned income');
  }

  if (dividendIncome.getTaxTreatment() !== 'qualified') {
    throw new Error('Expected dividends to be qualified income');
  }

  if (rentalIncome.getTaxTreatment() !== 'earned') {
    throw new Error('Expected rental to be earned income');
  }

  console.log('✓ testIncomeTaxTreatment passed');
}

export function testIncomeJSONRoundTrip() {
  const income = new Income('Business Income', 80000, 2, 'business');
  income.endYear = 25;
  income.growthRate = 0.05;

  const json = income.toJSON();
  const restored = Income.fromJSON(json);

  if (restored.name !== income.name) {
    throw new Error('Expected restored name to match');
  }

  if (restored.type !== 'business') {
    throw new Error('Expected restored type to be business');
  }

  if (restored.growthRate !== 0.05) {
    throw new Error('Expected restored growthRate to be 0.05');
  }

  if (restored.endYear !== 25) {
    throw new Error('Expected restored endYear to be 25');
  }

  console.log('✓ testIncomeJSONRoundTrip passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testIncomeCreation();
    testIncomeTaxTreatment();
    testIncomeJSONRoundTrip();
    console.log('All Income tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}
