import { StateStorage } from 'zustand/middleware';
import { SchemaManager } from './schema-manager';
import { BackupManager } from './backup-manager';

const CURRENT_SCHEMA_VERSION = 1;

const schemaManager = new SchemaManager();
const backupManager = new BackupManager();

backupManager.setMigrator(async (data, fromVersion, toVersion) => {
  return schemaManager.migrate(data, fromVersion, toVersion);
});

backupManager.setValidator(async (data, version) => {
  return schemaManager.validate(data, version);
});

export class EnhancedStorage implements StateStorage {
  private storeName: string;

  constructor(storeName: string) {
    this.storeName = storeName;
    this.initializeSchema();
  }

  private async initializeSchema(): Promise<void> {
    await schemaManager.setSchemaVersion(
      this.storeName,
      CURRENT_SCHEMA_VERSION
    );
  }

  async getItem(name: string): Promise<string | null> {
    const key = `${this.storeName}:${name}`;

    try {
      const data = await this.getRawData(key);
      if (!data) return null;

      const parsed = JSON.parse(data);
      const dataVersion = parsed._schemaVersion || 0;

      const result = await schemaManager.autoMigrate(
        this.storeName,
        parsed,
        dataVersion
      );

      if (!result.success) {
        console.error('Migration failed:', result.errors);
        return null;
      }

      return JSON.stringify(result.data);
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  }

  async setItem(name: string, value: string): Promise<void> {
    const key = `${this.storeName}:${name}`;

    try {
      const parsed = JSON.parse(value);
      const dataWithVersion = {
        ...parsed,
        _schemaVersion: CURRENT_SCHEMA_VERSION,
      };

      const validationResult = await schemaManager.validateCurrentSchema(
        this.storeName,
        dataWithVersion
      );

      if (!validationResult.isValid) {
        console.error('Validation failed:', validationResult.errors);
        throw new Error('Data validation failed');
      }

      const data = JSON.stringify(dataWithVersion);
      await this.setRawData(key, data);
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }

  async removeItem(name: string): Promise<void> {
    const key = `${this.storeName}:${name}`;
    await this.removeRawData(key);
  }

  private async getRawData(key: string): Promise<string | null> {
    const { get } = await import('idb-keyval');
    return (await get(key)) || null;
  }

  private async setRawData(key: string, value: string): Promise<void> {
    const { set } = await import('idb-keyval');
    await set(key, value);
  }

  private async removeRawData(key: string): Promise<void> {
    const { del } = await import('idb-keyval');
    await del(key);
  }
}

export const enhancedIndexedDBStorage = (storeName: string): StateStorage => {
  return new EnhancedStorage(storeName);
};

export { schemaManager, backupManager };
