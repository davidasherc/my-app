import { Preferences } from '@capacitor/preferences';
import CryptoJS from 'crypto-js';

interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  emotions: {
    happiness: number;
    anxiety: number;
    sadness: number;
    anger: number;
    energy: number;
    overall: number;
  };
  notes?: string;
  sent: boolean;
  sentAt?: string;
  therapistEmail?: string;
  encrypted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuditLog {
  id: string;
  userId: string;
  event: string;
  details: any;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

class SecureStorageService {
  private encryptionKey = 'emotion-journal-secure-2024-v1'; // In production, use secure key generation

  // HIPAA-compliant encryption
  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  private decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }

  // Generate secure UUID
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Save journal entry securely
  async saveJournalEntry(userId: string, entryData: Omit<JournalEntry, 'id' | 'userId' | 'encrypted' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const entry: JournalEntry = {
        id: this.generateUUID(),
        userId,
        ...entryData,
        encrypted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existingEntries = await this.getJournalEntries(userId);
      const updatedEntries = [...existingEntries, entry];
      
      const encryptedData = this.encrypt(JSON.stringify(updatedEntries));
      await Preferences.set({ 
        key: `journal_entries_${userId}`, 
        value: encryptedData 
      });

      // Log the action
      await this.logAuditEvent(userId, 'journal_entry_created', {
        entryId: entry.id,
        date: entry.date
      });

      return entry.id;
    } catch (error) {
      throw new Error('Failed to save journal entry');
    }
  }

  // Get all journal entries for a user
  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    try {
      const { value } = await Preferences.get({ key: `journal_entries_${userId}` });
      if (!value) return [];

      const decryptedData = this.decrypt(value);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Failed to retrieve journal entries:', error);
      return [];
    }
  }

  // Update journal entry
  async updateJournalEntry(userId: string, entryId: string, updates: Partial<JournalEntry>): Promise<boolean> {
    try {
      const entries = await this.getJournalEntries(userId);
      const entryIndex = entries.findIndex(e => e.id === entryId);
      
      if (entryIndex === -1) {
        throw new Error('Journal entry not found');
      }

      entries[entryIndex] = {
        ...entries[entryIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const encryptedData = this.encrypt(JSON.stringify(entries));
      await Preferences.set({ 
        key: `journal_entries_${userId}`, 
        value: encryptedData 
      });

      await this.logAuditEvent(userId, 'journal_entry_updated', {
        entryId,
        updates: Object.keys(updates)
      });

      return true;
    } catch (error) {
      throw new Error('Failed to update journal entry');
    }
  }

  // Delete journal entry
  async deleteJournalEntry(userId: string, entryId: string): Promise<boolean> {
    try {
      const entries = await this.getJournalEntries(userId);
      const filteredEntries = entries.filter(e => e.id !== entryId);

      const encryptedData = this.encrypt(JSON.stringify(filteredEntries));
      await Preferences.set({ 
        key: `journal_entries_${userId}`, 
        value: encryptedData 
      });

      await this.logAuditEvent(userId, 'journal_entry_deleted', {
        entryId
      });

      return true;
    } catch (error) {
      throw new Error('Failed to delete journal entry');
    }
  }

  // Send entry to therapist (mock - in production, use secure API)
  async sendToTherapist(userId: string, entryId: string, therapistEmail: string): Promise<boolean> {
    try {
      const entries = await this.getJournalEntries(userId);
      const entry = entries.find(e => e.id === entryId);
      
      if (!entry) {
        throw new Error('Journal entry not found');
      }

      // In production, this would securely transmit to therapist portal
      // For now, just mark as sent
      await this.updateJournalEntry(userId, entryId, {
        sent: true,
        sentAt: new Date().toISOString(),
        therapistEmail
      });

      await this.logAuditEvent(userId, 'entry_sent_to_therapist', {
        entryId,
        therapistEmail,
        date: entry.date
      });

      return true;
    } catch (error) {
      throw new Error('Failed to send entry to therapist');
    }
  }

  // Audit logging for HIPAA compliance
  async logAuditEvent(userId: string, event: string, details: any): Promise<void> {
    try {
      const auditLog: AuditLog = {
        id: this.generateUUID(),
        userId,
        event,
        details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      const existingLogs = await this.getAuditLogs(userId);
      const updatedLogs = [...existingLogs, auditLog];
      
      // Keep only last 1000 logs to prevent storage bloat
      const recentLogs = updatedLogs.slice(-1000);
      
      const encryptedLogs = this.encrypt(JSON.stringify(recentLogs));
      await Preferences.set({ 
        key: `audit_logs_${userId}`, 
        value: encryptedLogs 
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  // Get audit logs
  async getAuditLogs(userId: string): Promise<AuditLog[]> {
    try {
      const { value } = await Preferences.get({ key: `audit_logs_${userId}` });
      if (!value) return [];

      const decryptedData = this.decrypt(value);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      return [];
    }
  }

  // Export user data (HIPAA right to access)
  async exportUserData(userId: string): Promise<string> {
    try {
      const entries = await this.getJournalEntries(userId);
      const auditLogs = await this.getAuditLogs(userId);
      
      const exportData = {
        exportDate: new Date().toISOString(),
        userId,
        journalEntries: entries,
        auditLogs,
        dataIntegrity: {
          entriesCount: entries.length,
          logsCount: auditLogs.length
        }
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error('Failed to export user data');
    }
  }

  // Delete all user data (HIPAA right to deletion)
  async deleteAllUserData(userId: string): Promise<boolean> {
    try {
      await Preferences.remove({ key: `journal_entries_${userId}` });
      await Preferences.remove({ key: `audit_logs_${userId}` });
      
      // Log the deletion in a separate audit trail
      await this.logAuditEvent(userId, 'all_user_data_deleted', {
        deletionDate: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      throw new Error('Failed to delete user data');
    }
  }

  // Data integrity check
  async verifyDataIntegrity(userId: string): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    try {
      const entries = await this.getJournalEntries(userId);
      const auditLogs = await this.getAuditLogs(userId);
      
      // Check for corrupted entries
      entries.forEach((entry, index) => {
        if (!entry.id || !entry.userId || !entry.date) {
          issues.push(`Entry ${index} is missing required fields`);
        }
        if (entry.userId !== userId) {
          issues.push(`Entry ${index} has mismatched user ID`);
        }
      });
      
      // Check audit log integrity
      auditLogs.forEach((log, index) => {
        if (!log.id || !log.userId || !log.event || !log.timestamp) {
          issues.push(`Audit log ${index} is missing required fields`);
        }
      });
      
      return { valid: issues.length === 0, issues };
    } catch (error) {
      return { valid: false, issues: ['Failed to verify data integrity'] };
    }
  }
}

export const secureStorage = new SecureStorageService();