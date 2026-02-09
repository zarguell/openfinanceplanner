import { describe, it, expect } from 'vitest';
import { add } from './example';

describe('add', () => {
  it('should add two positive numbers correctly', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('should handle zero', () => {
    expect(add(0, 0)).toBe(0);
  });

  it('should handle negative numbers', () => {
    expect(add(-1, -2)).toBe(-3);
  });

  it('should handle mixed positive and negative', () => {
    expect(add(5, -3)).toBe(2);
  });
});
