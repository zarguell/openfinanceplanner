import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type */

const mockStorage = new Map<string, unknown>();

vi.mock('idb-keyval', () => ({
  get: vi.fn(async (key: string) => mockStorage.get(key)),
  set: vi.fn(async (key: string, value: unknown) =>
    mockStorage.set(key, value)
  ),
  del: vi.fn(async (key: string) => mockStorage.delete(key)),
}));

import { BackupManager, Backup } from '@/store/middleware/backup-manager';

describe('BackupManager', () => {
  let backupManager: BackupManager;

  beforeEach(() => {
    backupManager = new BackupManager();
    mockStorage.clear();
    vi.useFakeTimers();

    Object.defineProperty(globalThis, 'URL', {
      value: {
        createObjectURL: vi.fn(() => 'blob:mock-url'),
        revokeObjectURL: vi.fn(),
      },
      writable: true,
    });

    Object.defineProperty(globalThis, 'document', {
      value: {
        createElement: vi.fn(() => ({
          href: '',
          download: '',
          click: vi.fn(),
        })),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      } as unknown as Document,
      writable: true,
    });

    Object.defineProperty(globalThis, 'FileReader', {
      value: class {
        onload: ((e: any) => {}) | null = null;
        onerror: ((e: any) => {}) | null = null;
        error: any = null;

        readAsText(file: File) {
          Promise.resolve(file.text())
            .then((content) => {
              if (this.onload) {
                this.onload({ target: { result: content } });
              }
            })
            .catch((err) => {
              this.error = err;
              if (this.onerror) {
                this.onerror(err);
              }
            });
        }
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockStorage.clear();
  });

  describe('Backup Creation', () => {
    it('should create backup with metadata', async () => {
      const data = { profile: { name: 'John' }, plans: [] };

      const backup = await backupManager.createBackup(data, 1);

      expect(backup.metadata.version).toBe(1);
      expect(backup.metadata.timestamp).toBeInstanceOf(Date);
      expect(backup.data).toEqual(data);
    });

    it('should include schema version in metadata', async () => {
      const data = { profile: { name: 'John' } };

      const backup = await backupManager.createBackup(data, 2);

      expect(backup.metadata.schemaVersion).toBe(2);
    });

    it('should generate unique backup ID', async () => {
      const data = { profile: { name: 'John' } };

      const backup1 = await backupManager.createBackup(data, 1);
      const backup2 = await backupManager.createBackup(data, 1);

      expect(backup1.metadata.id).not.toBe(backup2.metadata.id);
    });

    it('should include checksum in metadata', async () => {
      const data = { profile: { name: 'John' } };

      const backup = await backupManager.createBackup(data, 1);

      expect(backup.metadata.checksum).toBeDefined();
      expect(backup.metadata.checksum).toBeTruthy();
    });

    it('should include data size in metadata', async () => {
      const data = { profile: { name: 'John' } };

      const backup = await backupManager.createBackup(data, 1);

      expect(backup.metadata.size).toBeGreaterThan(0);
    });
  });

  describe('Backup Export', () => {
    it('should export backup as JSON file', async () => {
      const data = { profile: { name: 'John' } };
      const backup = await backupManager.createBackup(data, 1);

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(
        () => mockLink as any
      );
      vi.spyOn(document.body, 'removeChild').mockImplementation(
        () => mockLink as any
      );

      await backupManager.exportBackup(backup);

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should include timestamp in filename', async () => {
      const data = { profile: { name: 'John' } };
      const backup = await backupManager.createBackup(data, 1);

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(
        () => mockLink as any
      );
      vi.spyOn(document.body, 'removeChild').mockImplementation(
        () => mockLink as any
      );

      await backupManager.exportBackup(backup);

      expect(mockLink.download).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });

  describe('Backup Import', () => {
    it('should import backup from JSON file', async () => {
      const data = { profile: { name: 'John' } };
      const backup = await backupManager.createBackup(data, 1);
      const json = JSON.stringify(backup);

      const file = new File([json], 'backup.json', {
        type: 'application/json',
      });

      const imported = await backupManager.importBackup(file);

      expect(imported.data).toEqual(data);
      expect(imported.metadata.schemaVersion).toBe(1);
    });

    it('should validate backup checksum on import', async () => {
      const data = { profile: { name: 'John' } };
      const backup = await backupManager.createBackup(data, 1);

      const corruptedBackup = {
        ...backup,
        data: { profile: { name: 'Corrupted' } },
      };

      const json = JSON.stringify(corruptedBackup);
      const file = new File([json], 'backup.json', {
        type: 'application/json',
      });

      await expect(backupManager.importBackup(file)).rejects.toThrow(
        'Checksum validation failed'
      );
    });

    it('should reject malformed JSON', async () => {
      const file = new File(['invalid json'], 'backup.json', {
        type: 'application/json',
      });

      await expect(backupManager.importBackup(file)).rejects.toThrow();
    });

    it('should reject backup missing required metadata', async () => {
      const invalidBackup = { data: { profile: { name: 'John' } } };
      const json = JSON.stringify(invalidBackup);
      const file = new File([json], 'backup.json', {
        type: 'application/json',
      });

      await expect(backupManager.importBackup(file)).rejects.toThrow(
        'Invalid backup format'
      );
    });
  });

  describe('Backup Restore', () => {
    it('should restore data from backup', async () => {
      const data = { profile: { name: 'John' } };
      const backup = await backupManager.createBackup(data, 1);

      const restored = await backupManager.restoreBackup(backup);

      expect(restored).toEqual(data);
    });

    it('should run migrations if needed during restore', async () => {
      const data = { profile: { name: 'John' }, version: 0 };
      const backup = await backupManager.createBackup(data, 0);

      const mockMigrate = vi.fn().mockResolvedValue({
        success: true,
        data: { profile: { name: 'John' }, version: 1 },
      } as Record<string, unknown>);

      backupManager.setMigrator(mockMigrate);

      await backupManager.restoreBackup(backup, 1);

      expect(mockMigrate).toHaveBeenCalledWith(data, 0, 1);
    });

    it('should validate schema after restore', async () => {
      const data = { profile: { name: 'John' } };
      const backup = await backupManager.createBackup(data, 1);

      const mockValidate = vi.fn().mockResolvedValue({
        isValid: true,
        errors: [],
      } as Record<string, unknown>);

      backupManager.setValidator(mockValidate);

      await backupManager.restoreBackup(backup, 1);

      expect(mockValidate).toHaveBeenCalledWith(data, 1);
    });
  });

  describe('Backup Management', () => {
    it('should list all backups', async () => {
      const backup1 = await backupManager.createBackup({ data: '1' }, 1);
      const backup2 = await backupManager.createBackup({ data: '2' }, 1);

      await backupManager.saveBackup(backup1);
      await backupManager.saveBackup(backup2);

      const backups = await backupManager.listBackups();

      expect(backups).toHaveLength(2);
      expect(backups.map((b: Backup) => b.metadata.id)).toContain(
        backup1.metadata.id
      );
      expect(backups.map((b: Backup) => b.metadata.id)).toContain(
        backup2.metadata.id
      );
    });

    it('should delete backup by ID', async () => {
      const backup = await backupManager.createBackup({ data: 'test' }, 1);
      await backupManager.saveBackup(backup);

      await backupManager.deleteBackup(backup.metadata.id);

      const backups = await backupManager.listBackups();
      expect(backups).toHaveLength(0);
    });

    it('should sort backups by timestamp descending', async () => {
      vi.setSystemTime(new Date('2024-01-01'));
      const backup1 = await backupManager.createBackup({ data: '1' }, 1);

      vi.setSystemTime(new Date('2024-01-02'));
      const backup2 = await backupManager.createBackup({ data: '2' }, 1);

      await backupManager.saveBackup(backup1);
      await backupManager.saveBackup(backup2);

      const backups = await backupManager.listBackups();

      expect(backups[0].metadata.id).toBe(backup2.metadata.id);
      expect(backups[1].metadata.id).toBe(backup1.metadata.id);
    });
  });
});
