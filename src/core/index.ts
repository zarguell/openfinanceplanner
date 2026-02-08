/**
 * Core financial engine namespace
 *
 * Provides clean imports for all business logic:
 * - Types: UserProfile, SimulationResult
 * - Functions: calculateProjection
 *
 * Usage:
 *   import { calculateProjection, UserProfile } from '@/core';
 *   import { calculateProjection } from '@/core/projection';
 *   import type { UserProfile } from '@/core/types';
 */

// Type exports
export type { UserProfile, SimulationResult } from './types';

// Function exports
export { calculateProjection } from './projection';
