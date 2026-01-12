import { project } from '../../../src/calculations/projection.js';

export function testSimpleProjection() {
  const plan = {
    accounts: [
      { type: '401k', balance: 100000, annualContribution: 10000 }
    ],
    expenses: [
      { name: 'Living', baseAmount: 6000000, startYear: 0, inflationAdjusted: true }
    ],
    taxProfile: {
      currentAge: 35,
      retirementAge: 65
    },
    assumptions: {
      inflationRate: 0.03,
      equityGrowthRate: 0.07,
      bondGrowthRate: 0.04
    }
  };

  const results = project(plan, 1); // Project 1 year

  if (results.length !== 2) { // Year 0 and Year 1
    throw new Error(`Expected 2 years, got ${results.length}`);
  }

  if (results[1].totalBalance <= results[0].totalBalance) {
    throw new Error('Expected balance to grow with contributions and returns');
  }

  console.log('✓ testSimpleProjection passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testSimpleProjection();
    console.log('All Projection tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}
