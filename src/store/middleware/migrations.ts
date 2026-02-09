import { SchemaManager } from './schema-manager';

const CURRENT_SCHEMA_VERSION = 1;

export async function initializeSchemasAndMigrations(
  schemaManager: SchemaManager
): Promise<void> {
  await registerSchemaValidators(schemaManager);
  await registerMigrations(schemaManager);
}

async function registerSchemaValidators(
  schemaManager: SchemaManager
): Promise<void> {
  await schemaManager.registerSchema(1, (data: unknown) => {
    const obj = data as Record<string, unknown>;
    if (typeof obj !== 'object' || obj === null) return false;

    const requiredFields = ['profile', 'projection', '_hasHydrated'];
    return requiredFields.every((field) => field in obj);
  });
}

async function registerMigrations(schemaManager: SchemaManager): Promise<void> {
  await schemaManager.registerMigration(0, 1, (data: unknown) => {
    const obj = data as Record<string, unknown>;

    return {
      ...obj,
      profile: migrateProfile(obj.profile),
      projection: migrateProjection(obj.projection),
      plans: migratePlans(obj.plans),
      incomes: migrateIncomes(obj.incomes),
      expenses: migrateExpenses(obj.expenses),
      _hasHydrated: obj._hasHydrated ?? false,
    };
  });
}

function migrateProfile(profile: unknown): unknown {
  if (!profile || typeof profile !== 'object') {
    return null;
  }

  const p = profile as Record<string, unknown>;
  return {
    ...p,
    createdAt: p.createdAt ?? new Date().toISOString(),
    updatedAt: p.updatedAt ?? new Date().toISOString(),
  };
}

function migrateProjection(projection: unknown): unknown {
  if (!projection) return null;
  return projection;
}

function migratePlans(plans: unknown): unknown {
  if (!Array.isArray(plans)) return [];
  return plans.map((plan) => {
    const p = plan as Record<string, unknown>;
    return {
      ...p,
      createdAt: p.createdAt ?? new Date().toISOString(),
      updatedAt: p.updatedAt ?? new Date().toISOString(),
    };
  });
}

function migrateIncomes(incomes: unknown): unknown {
  if (!Array.isArray(incomes)) return [];
  return incomes.map((income) => {
    const i = income as Record<string, unknown>;
    return {
      ...i,
      createdAt: i.createdAt ?? new Date().toISOString(),
      updatedAt: i.updatedAt ?? new Date().toISOString(),
    };
  });
}

function migrateExpenses(expenses: unknown): unknown {
  if (!Array.isArray(expenses)) return [];
  return expenses.map((expense) => {
    const e = expense as Record<string, unknown>;
    return {
      ...e,
      createdAt: e.createdAt ?? new Date().toISOString(),
      updatedAt: e.updatedAt ?? new Date().toISOString(),
    };
  });
}

export { CURRENT_SCHEMA_VERSION };
