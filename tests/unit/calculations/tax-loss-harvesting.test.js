import { describe, it, expect } from 'vitest';
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

describe('Tax-Loss Harvesting', () => {
  describe('calculateUnrealizedLoss', () => {
    it('should calculate loss correctly', () => {
      const taxableAccount = {
        type: 'Taxable',
        balance: 4500000,
        costBasis: 5000000,
      };

      const loss = calculateUnrealizedLoss(taxableAccount);

      expect(loss).toBe(500000);
    });

    it('should return 0 for non-taxable accounts', () => {
      const nonTaxableAccount = {
        type: '401k',
        balance: 4500000,
        costBasis: 5000000,
      };

      const loss = calculateUnrealizedLoss(nonTaxableAccount);

      expect(loss).toBe(0);
    });

    it('should return 0 for gain', () => {
      const gainAccount = {
        type: 'Taxable',
        balance: 5500000,
        costBasis: 5000000,
      };

      const loss = calculateUnrealizedLoss(gainAccount);

      expect(loss).toBe(0);
    });

    it('should return 0 when no cost basis', () => {
      const noBasisAccount = {
        type: 'Taxable',
        balance: 4500000,
      };

      const loss = calculateUnrealizedLoss(noBasisAccount);

      expect(loss).toBe(0);
    });
  });

  describe('calculateTotalUnrealizedLoss', () => {
    it('should sum losses across all taxable accounts', () => {
      const accounts = [
        { type: 'Taxable', balance: 4500000, costBasis: 5000000 },
        { type: '401k', balance: 10000000, costBasis: 10000000 },
        { type: 'Taxable', balance: 3500000, costBasis: 4000000 },
      ];

      const totalLoss = calculateTotalUnrealizedLoss(accounts);
      const expected = 500000 + 500000;

      expect(totalLoss).toBe(expected);
    });
  });

  describe('calculateTaxBenefitFromLoss', () => {
    it('should calculate tax benefit correctly', () => {
      const harvestedLoss = 1000000;
      const capitalGains = 500000;
      const marginalRate = 0.24;

      const benefit = calculateTaxBenefitFromLoss(harvestedLoss, capitalGains, marginalRate);

      const expected = 147000;
      expect(benefit).toBe(expected);
    });

    it('should return 0 for zero loss', () => {
      const benefit = calculateTaxBenefitFromLoss(0, 500000, 0.24);

      expect(benefit).toBe(0);
    });

    it('should handle excess loss correctly', () => {
      const largeLoss = 6000000;
      const smallGains = 100000;
      const marginalRate = 0.24;

      const benefit = calculateTaxBenefitFromLoss(largeLoss, smallGains, marginalRate);

      const expected = 87000;
      expect(benefit).toBe(expected);
    });
  });

  describe('suggestHarvestingAmount', () => {
    it('should harvest all with all strategy', () => {
      const unrealizedLoss = 5000000;
      const capitalGains = 0;
      const marginalRate = 0.24;
      const settings = {
        enabled: true,
        strategy: 'all',
        threshold: 100000,
      };

      const suggestion = suggestHarvestingAmount(
        unrealizedLoss,
        capitalGains,
        marginalRate,
        settings
      );

      expect(suggestion.harvestAmountCents).toBe(5000000);
      expect(suggestion.reason).toMatch(/all/);
    });

    it('should harvest to offset gains with offset-gains strategy', () => {
      const unrealizedLoss = 10000000;
      const capitalGains = 200000;
      const marginalRate = 0.24;
      const settings = {
        enabled: true,
        strategy: 'offset-gains',
        threshold: 100000,
      };

      const suggestion = suggestHarvestingAmount(
        unrealizedLoss,
        capitalGains,
        marginalRate,
        settings
      );

      expect(suggestion.harvestAmountCents).toBe(500000);
      expect(suggestion.reason).toMatch(/offset gains/);
    });

    it('should not harvest below threshold', () => {
      const unrealizedLoss = 80000;
      const capitalGains = 0;
      const marginalRate = 0.24;
      const settings = {
        enabled: true,
        strategy: 'all',
        threshold: 100000,
      };

      const suggestion = suggestHarvestingAmount(
        unrealizedLoss,
        capitalGains,
        marginalRate,
        settings
      );

      expect(suggestion.harvestAmountCents).toBe(0);
      expect(suggestion.reason).toMatch(/below/);
    });

    it('should return 0 for no loss', () => {
      const unrealizedLoss = 0;
      const capitalGains = 500000;
      const marginalRate = 0.24;
      const settings = {
        enabled: true,
        strategy: 'all',
        threshold: 100000,
      };

      const suggestion = suggestHarvestingAmount(
        unrealizedLoss,
        capitalGains,
        marginalRate,
        settings
      );

      expect(suggestion.harvestAmountCents).toBe(0);
      expect(suggestion.reason).toMatch(/No unrealized/);
    });
  });

  describe('validateHarvestingAmount', () => {
    it('should validate correct harvest amount', () => {
      const account = {
        type: 'Taxable',
        balance: 4500000,
        costBasis: 5000000,
      };

      const valid = validateHarvestingAmount(500000, account);

      expect(valid).toBe(true);
    });

    it('should reject harvest exceeding loss', () => {
      const account = {
        type: 'Taxable',
        balance: 4500000,
        costBasis: 5000000,
      };

      const valid = validateHarvestingAmount(600000, account);

      expect(valid).toBe(false);
    });

    it('should reject harvest for non-taxable account', () => {
      const account = {
        type: '401k',
        balance: 4500000,
        costBasis: 5000000,
      };

      const valid = validateHarvestingAmount(500000, account);

      expect(valid).toBe(false);
    });

    it('should reject negative harvest', () => {
      const account = {
        type: 'Taxable',
        balance: 4500000,
        costBasis: 5000000,
      };

      const valid = validateHarvestingAmount(-1000, account);

      expect(valid).toBe(false);
    });
  });

  describe('applyHarvesting', () => {
    it('should successfully apply harvest', () => {
      const account = {
        type: 'Taxable',
        balance: 4500000,
        costBasis: 5000000,
      };

      const harvestAmount = 500000;
      const result = applyHarvesting(account, harvestAmount);

      expect(result.success).toBe(true);
      expect(result.newCostBasis).toBe(4000000);
      expect(result.harvestedLoss).toBe(500000);
    });

    it('should fail for invalid harvest', () => {
      const account = {
        type: 'Taxable',
        balance: 4500000,
        costBasis: 5000000,
      };

      const harvestAmount = 600000;
      const result = applyHarvesting(account, harvestAmount);

      expect(result.success).toBe(false);
    });
  });

  describe('isHarvestingEnabled', () => {
    it('should return true when enabled', () => {
      expect(isHarvestingEnabled({ enabled: true })).toBe(true);
    });

    it('should return false when disabled', () => {
      expect(isHarvestingEnabled({ enabled: false })).toBe(false);
    });

    it('should return falsy value when null', () => {
      expect(isHarvestingEnabled(null)).toBeFalsy();
    });

    it('should return falsy value when undefined', () => {
      expect(isHarvestingEnabled(undefined)).toBeFalsy();
    });
  });

  describe('getStrategyDescription', () => {
    it('should return description for all strategy', () => {
      const allDesc = getStrategyDescription('all');

      expect(allDesc).toMatch(/all available/);
    });

    it('should return description for offset-gains strategy', () => {
      const offsetDesc = getStrategyDescription('offset-gains');

      expect(offsetDesc).toMatch(/offset capital gains/);
    });

    it('should return identifier for unknown strategy', () => {
      const unknownDesc = getStrategyDescription('unknown');

      expect(unknownDesc).toMatch(/unknown/);
    });
  });
});
