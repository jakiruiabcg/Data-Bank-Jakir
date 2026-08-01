import { DocumentRecord, AuditLog, UserSecurityConfig } from '../types';

const STORAGE_KEY_RECORDS = 'pbk_akter_records_v1';
const STORAGE_KEY_LOGS = 'pbk_akter_logs_v1';
const STORAGE_KEY_CONFIG = 'pbk_akter_config_v1';

// Initial Security Configuration (Default PIN: 2020 as requested)
export const DEFAULT_CONFIG: UserSecurityConfig = {
  pin: '2020',
  mfaEnabled: true,
  mfaSecret: 'AKTER-MFA-9842-7710',
  autoLockMinutes: 5,
  ownerName: 'Akter',
  ownerRole: 'Data Vault Administrator'
};

// Seed Documents
const INITIAL_RECORDS: DocumentRecord[] = [
  {
    id: 'doc-001',
    subject: 'Personal Passport & Visa Documentation',
    category: 'Identity',
    description: 'High-resolution scan of International Passport, Resident Permit, and emergency contact details for Akter.',
    tags: ['Passport', 'Travel', 'Identity', 'Official'],
    encryptionLevel: 'AES-256-GCM',
    isEncrypted: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    accessedCount: 14,
    starred: true,
    attachment: {
      name: 'Akter_Passport_Encrypted.pdf',
      size: 2450000,
      type: 'application/pdf',
      previewUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'
    }
  },
  {
    id: 'doc-002',
    subject: 'Qatar Airways Privilege Club Gold Account',
    category: 'Credentials',
    description: 'Membership #: QA-980421-AK | Tier: Oryx Gold | Lounge Pass Code: QA-2020-FLY. Pin Protected access.',
    tags: ['QatarAirways', 'PrivilegeClub', 'Flight', 'Credentials'],
    encryptionLevel: 'AES-256-GCM',
    isEncrypted: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    accessedCount: 9,
    starred: true
  },
  {
    id: 'doc-003',
    subject: 'YouTube Saved: Next-Gen AI Application Architecture',
    category: 'Videos & Media',
    description: 'Comprehensive guide to modern AI engineering and full-stack web architectures. Saved for later offline review.',
    tags: ['YouTube', 'AI', 'Tutorial', 'Tech'],
    encryptionLevel: 'Standard Safe',
    isEncrypted: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    accessedCount: 4,
    starred: true,
    attachment: {
      name: 'Gemini AI Tech Demo',
      size: 0,
      type: 'video/link',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoType: 'youtube',
      videoId: 'dQw4w9WgXcQ'
    }
  },
  {
    id: 'doc-004',
    subject: 'Facebook Saved: Qatar Airways Qsuite Luxury Review',
    category: 'Videos & Media',
    description: 'Saved video showcasing the Qsuite business class experience, dining menu, and cabin features.',
    tags: ['Facebook', 'QatarAirways', 'Qsuite', 'Travel'],
    encryptionLevel: 'Standard Safe',
    isEncrypted: false,
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    accessedCount: 7,
    starred: false,
    attachment: {
      name: 'Qsuite Flight Experience',
      size: 0,
      type: 'video/link',
      videoUrl: 'https://www.facebook.com/watch/?v=10158291048291',
      videoType: 'facebook'
    }
  },
  {
    id: 'doc-005',
    subject: 'Property Rental Lease & Deed Agreement 2026',
    category: 'Legal',
    description: 'Fully signed residential lease contract, landlord contact records, monthly deposit receipts, and utility bills.',
    tags: ['Lease', 'Contract', 'Housing', 'Legal'],
    encryptionLevel: 'AES-256-GCM',
    isEncrypted: true,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    accessedCount: 3,
    starred: false
  },
  {
    id: 'doc-006',
    subject: 'Financial Portfolio & Tax Declaration 2026',
    category: 'Financial',
    description: 'Encrypted tax submission summaries, bank account statements, and investment portfolio ledger.',
    tags: ['Banking', 'Tax', 'Finance', 'Encrypted'],
    encryptionLevel: 'AES-256-GCM',
    isEncrypted: true,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    accessedCount: 18,
    starred: true
  }
];

// Seed Audit Logs
const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: new Date().toISOString(),
    action: 'SYSTEM_BOOT',
    details: 'Personal Data Bank (Akter) initialized with AES-256 hardware security.',
    user: 'Akter (Admin)',
    device: 'Android Chrome (Mobile)',
    ipAddress: '192.168.1.104',
    status: 'SUCCESS'
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    action: 'PIN_UNLOCKED',
    details: 'Master PIN 2020 verified successfully.',
    user: 'Akter',
    device: 'Android Chrome (Mobile)',
    ipAddress: '192.168.1.104',
    status: 'SUCCESS'
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    action: 'DOC_ENCRYPTED_SAVED',
    details: 'Created encrypted record: "Personal Passport & Visa Documentation"',
    user: 'Akter',
    device: 'Desktop Browser (Chrome)',
    ipAddress: '10.0.0.45',
    status: 'SUCCESS'
  },
  {
    id: 'log-104',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    action: 'VIDEO_LINK_SAVED',
    details: 'Saved YouTube video link: Gemini AI Tech Demo',
    user: 'Akter',
    device: 'Android Chrome',
    ipAddress: '192.168.1.104',
    status: 'SUCCESS'
  }
];

// Load / Save Helpers
export function loadRecords(): DocumentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading records:', err);
    return INITIAL_RECORDS;
  }
}

export function saveRecords(records: DocumentRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving records:', err);
  }
}

export function loadLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading logs:', err);
    return INITIAL_LOGS;
  }
}

export function addAuditLog(
  action: AuditLog['action'], 
  details: string, 
  status: AuditLog['status'] = 'SUCCESS'
) {
  try {
    const logs = loadLogs();
    const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad/i.test(navigator.userAgent);
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      user: 'Akter',
      device: isMobile ? 'Android Chrome (Mobile)' : 'Desktop Browser',
      ipAddress: '192.168.1.104',
      status
    };
    const updated = [newLog, ...logs].slice(0, 100); // keep last 100
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (err) {
    console.error('Error logging audit event:', err);
  }
}

export function loadSecurityConfig(): UserSecurityConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_CONFIG;
  }
}

export function saveSecurityConfig(config: UserSecurityConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving security config:', err);
  }
}
