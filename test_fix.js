// Test script to verify the socialSecurity.filingAge schema validation fix
import { Plan } from './src/core/models/Plan.js';
import { validatePlanSchema } from './src/storage/schema.js';

console.log('Testing Plan creation with retirement age outside 62-70 range...');

// Create a plan with retirement age 75 (outside 62-70 range)
const plan = new Plan('Test Plan', 30, 75);

console.log('Plan socialSecurity.filingAge:', plan.socialSecurity.filingAge);

// Validate the plan schema
const validation = validatePlanSchema(plan.toJSON());
console.log('Schema validation result:', validation);

if (validation.valid) {
  console.log('✓ Schema validation passed!');
} else {
  console.log('✗ Schema validation failed:', validation.errors);
}
