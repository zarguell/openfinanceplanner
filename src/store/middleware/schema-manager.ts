import { get, set, del } from 'idb-keyval';

export interface SchemaValidator {
  (data: unknown): boolean;
}

export interface SchemaMetadata {
  version: number;
  validator: SchemaValidator;
}

export interface MigrationFunction {
  (data: unknown): unknown;
}

export interface MigrationMetadata {
  fromVersion: number;
  toVersion: number;
  migration: MigrationFunction;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface MigrationResult {
  success: boolean;
  data?: unknown;
  errors: string[];
  migrationsRun: number;
}

const SCHEMA_VERSION_KEY = 'schema-version';
const SCHEMAS_KEY = 'registered-schemas';
const MIGRATIONS_KEY = 'registered-migrations';

export class SchemaManager {
  private schemas: Map<number, SchemaMetadata> = new Map();
  private migrations: Map<string, MigrationMetadata> = new Map();

  async getSchemaVersion(storeKey: string): Promise<number> {
    const key = `${storeKey}:${SCHEMA_VERSION_KEY}`;
    const version = await get<number>(key);
    return version ?? 0;
  }

  async setSchemaVersion(storeKey: string, version: number): Promise<void> {
    const key = `${storeKey}:${SCHEMA_VERSION_KEY}`;
    await set(key, version);
  }

  async incrementSchemaVersion(storeKey: string): Promise<void> {
    const currentVersion = await this.getSchemaVersion(storeKey);
    await this.setSchemaVersion(storeKey, currentVersion + 1);
  }

  async registerSchema(
    version: number,
    validator: SchemaValidator
  ): Promise<{ success: boolean; errors: string[] }> {
    if (this.schemas.has(version)) {
      return {
        success: false,
        errors: [`Schema version ${version} already registered`],
      };
    }

    this.schemas.set(version, { version, validator });

    const existingSchemas = (await get<SchemaMetadata[]>(SCHEMAS_KEY)) || [];
    existingSchemas.push({ version, validator });
    await set(SCHEMAS_KEY, existingSchemas);

    return { success: true, errors: [] };
  }

  async validate(data: unknown, version: number): Promise<ValidationResult> {
    const schema = this.schemas.get(version);
    if (!schema) {
      return {
        isValid: false,
        errors: [`Schema version ${version} not found`],
      };
    }

    const isValid = schema.validator(data);
    return {
      isValid,
      errors: isValid ? [] : ['Data does not match schema version ' + version],
    };
  }

  async registerMigration(
    fromVersion: number,
    toVersion: number,
    migration: MigrationFunction
  ): Promise<{ success: boolean; errors: string[] }> {
    if (toVersion <= fromVersion) {
      return {
        success: false,
        errors: ['Target version must be greater than source version'],
      };
    }

    const key = `${fromVersion}-${toVersion}`;
    if (this.migrations.has(key)) {
      return {
        success: false,
        errors: [
          `Migration from ${fromVersion} to ${toVersion} already registered`,
        ],
      };
    }

    const metadata = { fromVersion, toVersion, migration };
    this.migrations.set(key, metadata);

    const existingMigrations =
      (await get<MigrationMetadata[]>(MIGRATIONS_KEY)) || [];
    existingMigrations.push(metadata);
    await set(MIGRATIONS_KEY, existingMigrations);

    return { success: true, errors: [] };
  }

  async migrate(
    data: unknown,
    fromVersion: number,
    toVersion: number
  ): Promise<MigrationResult> {
    if (fromVersion === toVersion) {
      return {
        success: true,
        data,
        errors: [],
        migrationsRun: 0,
      };
    }

    if (fromVersion > toVersion) {
      return {
        success: false,
        errors: [`Cannot migrate from version ${fromVersion} to ${toVersion}`],
        migrationsRun: 0,
      };
    }

    let currentData = data;
    let migrationsRun = 0;
    let currentVersion = fromVersion;

    while (currentVersion < toVersion) {
      const nextVersion = currentVersion + 1;
      const key = `${currentVersion}-${nextVersion}`;
      const migration = this.migrations.get(key);

      if (!migration) {
        return {
          success: false,
          errors: [`No migration path from ${fromVersion} to ${toVersion}`],
          migrationsRun,
        };
      }

      try {
        currentData = migration.migration(currentData);
        currentVersion = nextVersion;
        migrationsRun++;
      } catch (error) {
        return {
          success: false,
          errors: [
            `Migration from ${currentVersion} to ${nextVersion} failed: ${error}`,
          ],
          migrationsRun,
        };
      }
    }

    return {
      success: true,
      data: currentData,
      errors: [],
      migrationsRun,
    };
  }

  async autoMigrate(
    storeKey: string,
    data: unknown,
    dataVersion: number
  ): Promise<MigrationResult> {
    const currentVersion = await this.getSchemaVersion(storeKey);

    if (dataVersion === currentVersion) {
      return {
        success: true,
        data,
        errors: [],
        migrationsRun: 0,
      };
    }

    return this.migrate(data, dataVersion, currentVersion);
  }

  async validateCurrentSchema(
    storeKey: string,
    data: unknown
  ): Promise<ValidationResult> {
    const version = await this.getSchemaVersion(storeKey);
    return this.validate(data, version);
  }

  async clear(storeKey: string): Promise<void> {
    const key = `${storeKey}:${SCHEMA_VERSION_KEY}`;
    await del(key);
  }

  async resetAll(): Promise<void> {
    this.schemas.clear();
    this.migrations.clear();
    await del(SCHEMAS_KEY);
    await del(MIGRATIONS_KEY);
  }
}
