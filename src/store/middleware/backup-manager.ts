import { get, set, del } from 'idb-keyval';

export interface BackupMetadata {
  id: string;
  version: number;
  schemaVersion: number;
  timestamp: Date;
  checksum: string;
  size: number;
  description?: string;
}

export interface Backup {
  metadata: BackupMetadata;
  data: unknown;
}

type MigratorFunction = (
  data: unknown,
  fromVersion: number,
  toVersion: number
) => Promise<{ success: boolean; data?: unknown; errors: string[] }>;

type ValidatorFunction = (
  data: unknown,
  version: number
) => Promise<{ isValid: boolean; errors: string[] }>;

const BACKUPS_KEY = 'backups';

export class BackupManager {
  private migrator?: MigratorFunction;
  private validator?: ValidatorFunction;

  setMigrator(migrator: MigratorFunction): void {
    this.migrator = migrator;
  }

  setValidator(validator: ValidatorFunction): void {
    this.validator = validator;
  }

  async createBackup(data: unknown, schemaVersion: number): Promise<Backup> {
    const dataString = JSON.stringify(data);
    const checksum = await this.calculateChecksum(dataString);

    const metadata: BackupMetadata = {
      id: this.generateId(),
      version: 1,
      schemaVersion,
      timestamp: new Date(),
      checksum,
      size: dataString.length,
    };

    return {
      metadata,
      data,
    };
  }

  async exportBackup(backup: Backup): Promise<void> {
    const data = JSON.stringify(backup, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    const dateStr = backup.metadata.timestamp.toISOString().split('T')[0];
    link.download = `finance-planner-backup-${dateStr}-${backup.metadata.id}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  async importBackup(file: File): Promise<Backup> {
    const content = await this.readFile(file);
    const backup = JSON.parse(content) as Backup;

    if (!this.isValidBackup(backup)) {
      throw new Error('Invalid backup format');
    }

    const dataString = JSON.stringify(backup.data);
    const checksum = await this.calculateChecksum(dataString);

    if (checksum !== backup.metadata.checksum) {
      throw new Error('Checksum validation failed');
    }

    return backup;
  }

  async restoreBackup(
    backup: Backup,
    targetSchemaVersion?: number
  ): Promise<unknown> {
    let data = backup.data;
    const currentSchemaVersion = backup.metadata.schemaVersion;

    if (targetSchemaVersion && currentSchemaVersion !== targetSchemaVersion) {
      if (this.migrator) {
        const result = await this.migrator(
          data,
          currentSchemaVersion,
          targetSchemaVersion
        );
        if (!result.success) {
          throw new Error(`Migration failed: ${result.errors.join(', ')}`);
        }
        data = result.data;
      }
    }

    if (this.validator) {
      const schemaVersion = targetSchemaVersion ?? currentSchemaVersion;
      const result = await this.validator(data, schemaVersion);
      if (!result.isValid) {
        throw new Error(`Validation failed: ${result.errors.join(', ')}`);
      }
    }

    return data;
  }

  async saveBackup(backup: Backup): Promise<void> {
    const backups = await this.listBackups();
    const index = backups.findIndex(
      (b) => b.metadata.id === backup.metadata.id
    );

    if (index >= 0) {
      backups[index] = backup;
    } else {
      backups.push(backup);
    }

    await set(BACKUPS_KEY, backups);
  }

  async listBackups(): Promise<Backup[]> {
    const backups = (await get<Backup[]>(BACKUPS_KEY)) || [];
    return backups.sort(
      (a, b) => b.metadata.timestamp.getTime() - a.metadata.timestamp.getTime()
    );
  }

  async getBackup(id: string): Promise<Backup | null> {
    const backups = await this.listBackups();
    return backups.find((b) => b.metadata.id === id) || null;
  }

  async deleteBackup(id: string): Promise<void> {
    const backups = await this.listBackups();
    const filtered = backups.filter((b) => b.metadata.id !== id);
    await set(BACKUPS_KEY, filtered);
  }

  async clearAllBackups(): Promise<void> {
    await del(BACKUPS_KEY);
  }

  async createAutoBackup(
    data: unknown,
    schemaVersion: number,
    maxBackups: number = 10
  ): Promise<Backup> {
    const backup = await this.createBackup(data, schemaVersion);
    await this.saveBackup(backup);

    const backups = await this.listBackups();
    if (backups.length > maxBackups) {
      const toDelete = backups.slice(maxBackups);
      for (const b of toDelete) {
        await this.deleteBackup(b.metadata.id);
      }
    }

    return backup;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async calculateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content !== 'string') {
          reject(new Error('File content is not a string'));
        } else {
          resolve(content);
        }
      };
      reader.onerror = () => {
        reject(new Error(`File read error: ${reader.error?.message}`));
      };
      reader.readAsText(file);
    });
  }

  private isValidBackup(backup: unknown): backup is Backup {
    if (typeof backup !== 'object' || backup === null) {
      return false;
    }

    const b = backup as Record<string, unknown>;

    return (
      typeof b.metadata === 'object' &&
      b.metadata !== null &&
      'id' in b.metadata &&
      'version' in b.metadata &&
      'schemaVersion' in b.metadata &&
      'timestamp' in b.metadata &&
      'checksum' in b.metadata &&
      'size' in b.metadata &&
      'data' in b
    );
  }
}
