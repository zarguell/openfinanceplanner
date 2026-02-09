import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mockStorage = new Map<string, unknown>();

vi.mock('idb-keyval', () => ({
  get: vi.fn(async (key: string) => mockStorage.get(key)),
  set: vi.fn(async (key: string, value: unknown) =>
    mockStorage.set(key, value)
  ),
  del: vi.fn(async (key: string) => mockStorage.delete(key)),
}));

import { SchemaManager } from '@/store/middleware/schema-manager';

describe('SchemaManager', () => {
  let schemaManager: SchemaManager;
  const TEST_STORE_KEY = 'test-schema-manager';

  beforeEach(() => {
    schemaManager = new SchemaManager();
    mockStorage.clear();
  });

  afterEach(async () => {
    mockStorage.clear();
  });

  describe('Schema Version Tracking', () => {
    it('should initialize with default schema version', async () => {
      const version = await schemaManager.getSchemaVersion(TEST_STORE_KEY);
      expect(version).toBe(0);
    });

    it('should set and retrieve schema version', async () => {
      await schemaManager.setSchemaVersion(TEST_STORE_KEY, 1);
      const version = await schemaManager.getSchemaVersion(TEST_STORE_KEY);
      expect(version).toBe(1);
    });

    it('should increment schema version', async () => {
      await schemaManager.setSchemaVersion(TEST_STORE_KEY, 1);
      await schemaManager.incrementSchemaVersion(TEST_STORE_KEY);
      const version = await schemaManager.getSchemaVersion(TEST_STORE_KEY);
      expect(version).toBe(2);
    });
  });

  describe('Schema Registration', () => {
    it('should register a new schema', async () => {
      const validator = (data: unknown) => typeof data === 'object';
      const result = await schemaManager.registerSchema(1, validator);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject schema with existing version', async () => {
      const validator = (data: unknown) => typeof data === 'object';
      await schemaManager.registerSchema(1, validator);

      const result = await schemaManager.registerSchema(1, validator);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Schema version 1 already registered');
    });

    it('should validate data against registered schema', async () => {
      const validator = (data: unknown) => {
        const obj = data as Record<string, unknown>;
        return typeof obj === 'object' && obj !== null && 'profile' in obj;
      };
      await schemaManager.registerSchema(1, validator);

      const validData = { profile: { name: 'John' } };
      const invalidData = { other: 'data' };

      const validResult = await schemaManager.validate(validData, 1);
      const invalidResult = await schemaManager.validate(invalidData, 1);

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });
  });

  describe('Migration Registration', () => {
    it('should register a migration between schema versions', async () => {
      const migration = (data: unknown) => ({
        ...(data as Record<string, unknown>),
        migrated: true,
      });

      const result = await schemaManager.registerMigration(0, 1, migration);

      expect(result.success).toBe(true);
    });

    it('should reject migration with invalid version range', async () => {
      const migration = (data: unknown) => data;

      const result = await schemaManager.registerMigration(1, 0, migration);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        'Target version must be greater than source version'
      );
    });
  });

  describe('Migration Execution', () => {
    it('should run migration to transform data', async () => {
      const migration = (data: unknown) => ({
        ...(data as Record<string, unknown>),
        version: 1,
      });

      await schemaManager.registerMigration(0, 1, migration);

      const result = await schemaManager.migrate({ old: 'data' }, 0, 1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ old: 'data', version: 1 });
    });

    it('should run multiple migrations in sequence', async () => {
      const migration1 = (data: unknown) => ({
        ...(data as Record<string, unknown>),
        version: 1,
      });

      const migration2 = (data: unknown) => ({
        ...(data as Record<string, unknown>),
        version: 2,
        extra: 'field',
      });

      await schemaManager.registerMigration(0, 1, migration1);
      await schemaManager.registerMigration(1, 2, migration2);

      const result = await schemaManager.migrate({ old: 'data' }, 0, 2);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ old: 'data', version: 2, extra: 'field' });
    });

    it('should fail when migration not found', async () => {
      const result = await schemaManager.migrate({ old: 'data' }, 0, 2);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No migration path from 0 to 2');
    });

    it('should skip migration if already at target version', async () => {
      const result = await schemaManager.migrate({ old: 'data' }, 1, 1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ old: 'data' });
    });
  });

  describe('Automatic Migration', () => {
    it('should auto-migrate data on load', async () => {
      const migration = (data: unknown) => ({
        ...(data as Record<string, unknown>),
        version: 1,
      });

      await schemaManager.registerMigration(0, 1, migration);
      await schemaManager.setSchemaVersion(TEST_STORE_KEY, 1);

      const result = await schemaManager.autoMigrate(
        TEST_STORE_KEY,
        { old: 'data' },
        0
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ old: 'data', version: 1 });
      expect(result.migrationsRun).toEqual(1);
    });

    it('should return success if already at current version', async () => {
      await schemaManager.setSchemaVersion(TEST_STORE_KEY, 1);

      const result = await schemaManager.autoMigrate(
        TEST_STORE_KEY,
        { version: 1 },
        1
      );

      expect(result.success).toBe(true);
      expect(result.migrationsRun).toEqual(0);
    });
  });

  describe('Data Validation', () => {
    it('should validate data against current schema', async () => {
      const validator = (data: unknown) => {
        const obj = data as Record<string, unknown>;
        return typeof obj === 'object' && obj !== null && 'profile' in obj;
      };
      await schemaManager.registerSchema(1, validator);
      await schemaManager.setSchemaVersion(TEST_STORE_KEY, 1);

      const validData = { profile: { name: 'John' } };
      const result = await schemaManager.validateCurrentSchema(
        TEST_STORE_KEY,
        validData
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid data', async () => {
      const validator = (data: unknown) => {
        const obj = data as Record<string, unknown>;
        if (typeof obj !== 'object' || obj === null) return false;
        return 'profile' in obj;
      };
      await schemaManager.registerSchema(1, validator);
      await schemaManager.setSchemaVersion(TEST_STORE_KEY, 1);

      const invalidData = { other: 'data' };
      const result = await schemaManager.validateCurrentSchema(
        TEST_STORE_KEY,
        invalidData
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data does not match schema version 1');
    });
  });
});
