import { DocumentRecord, AuditLog, UserSecurityConfig } from '../types';

const STORAGE_KEY_RECORDS = 'pbk_jakir_records_v1';
const STORAGE_KEY_LOGS = 'pbk_jakir_logs_v1';
const STORAGE_KEY_CONFIG = 'pbk_jakir_config_v1';

// Initial Security Configuration (Default PIN: 2020 as requested)
export const DEFAULT_CONFIG: UserSecurityConfig = {
  pin: '2020',
  mfaEnabled: true,
  mfaSecret: 'JAKIR-MFA-9842-7710',
  autoLockMinutes: 5,
  ownerName: 'Jakir',
  ownerRole: 'Data Vault Administrator'
};

// Seed Documents for 4 Family Members (Jakir, Ayesha, Nowrin, Nowshad)
const INITIAL_RECORDS: DocumentRecord[] = [
  {
    id: 'doc-001',
    subject: 'Jakir - Passport & Residency Visa Scan',
    category: 'Identity',
    member: 'Jakir',
    description: 'High-resolution scan of International Passport, Qatar ID Resident Permit, and emergency contact details for Jakir.',
    tags: ['Jakir', 'Passport', 'Travel', 'Identity', 'Official'],
    encryptionLevel: 'AES-256-GCM',
    isEncrypted: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    accessedCount: 14,
    starred: true,
    attachment: {
      name: 'Jakir_Passport_Encrypted.pdf',
      size: 2450000,
      type: 'application/pdf',
      previewUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'
    }
  },
  {
    id: 'doc-002',
    subject: 'Ayesha - National ID & Birth Certificate',
    category: 'Identity',
    member: 'Ayesha',
    description: 'Official verified identity records, National Smart ID Card, and birth certificate documents for Ayesha.',
    tags: ['Ayesha', 'ID', 'Identity', 'Official'],
    encryptionLevel: 'AES-256-GCM',
    isEncrypted: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    accessedCount: 11,
    starred: true,
    attachment: {
      name: 'Ayesha_NID_Document.pdf',
      size: 1820000,
      type: 'application/pdf',
      previewUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
    }
  },
  {
    id: 'doc-003',
    subject: 'Nowrin - Academic Certificates & Marksheets',
    category: 'Personal Notes',
    member: 'Nowrin',
    description: 'Educational certificates, transcripts, university registration details, and honors awards for Nowrin.',
    tags: ['Nowrin', 'Education', 'Certificates', 'Academic'],
    encryptionLevel: 'AES-256-GCM',
    isEncrypted: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    accessedCount: 8,
    starred: true
  },
  {
    id: 'doc-004',
    subject: 'Nowshad - Medical Insurance & Prescription Records',
    category: 'Medical',
    member: 'Nowshad',
    description: 'Health insurance policy card details, blood group report, vaccination card, and prescription list for Nowshad.',
    tags: ['Nowshad', 'Medical', 'Health', 'Insurance'],
    encryptionLevel: 'Standard Safe',
    isEncrypted: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    accessedCount: 6,
    starred: false
  },
  {
    id: 'doc-005',
    subject: 'Jakir - Qatar Airways Privilege Gold Card',
    category: 'Credentials',
    member: 'Jakir',
    description: 'Membership #: QA-980421-JK | Tier: Oryx Gold | Lounge Pass Code: QA-2020-FLY.',
    tags: ['Jakir', 'QatarAirways', 'PrivilegeClub', 'Flight'],
    encryptionLevel: 'AES-256-GCM',
    isEncrypted: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    accessedCount: 9,
    starred: true
  },
  {
    id: 'doc-006',
    subject: 'Ayesha - Savings Bank Account & Fixed Deposit',
    category: 'Financial',
    member: 'Ayesha',
    description: 'Encrypted bank ledger details, fixed deposit maturity certificates, and debit card pin codes for Ayesha.',
    tags: ['Ayesha', 'Banking', 'Financial', 'Savings'],
    encryptionLevel: 'AES-256-GCM',
    isEncrypted: true,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    accessedCount: 15,
    starred: true
  }
];

// Seed Audit Logs
const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: new Date().toISOString(),
    action: 'SYSTEM_BOOT',
    details: 'Personal Data Bank (Jakir) initialized with AES-256 hardware security.',
    user: 'Jakir (Admin)',
    device: 'Android Chrome (Mobile)',
    ipAddress: '192.168.1.104',
    status: 'SUCCESS'
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    action: 'PIN_UNLOCKED',
    details: 'Master PIN verified successfully.',
    user: 'Jakir',
    device: 'Android Chrome (Mobile)',
    ipAddress: '192.168.1.104',
    status: 'SUCCESS'
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    action: 'DOC_ENCRYPTED_SAVED',
    details: 'Created encrypted record: "Personal Passport & Visa Documentation"',
    user: 'Jakir',
    device: 'Desktop Browser (Chrome)',
    ipAddress: '10.0.0.45',
    status: 'SUCCESS'
  },
  {
    id: 'log-104',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    action: 'VIDEO_LINK_SAVED',
    details: 'Saved YouTube video link: Gemini AI Tech Demo',
    user: 'Jakir',
    device: 'Android Chrome',
    ipAddress: '192.168.1.104',
    status: 'SUCCESS'
  }
];

// Load / Save Helpers with IndexedDB Persistence
const DB_NAME = 'PBK_Vault_DB';
const DB_VERSION = 1;
const STORE_NAME = 'vault_store';

let recordsCache: DocumentRecord[] | null = null;

function getIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB unavailable'));
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function loadRecordsFromIDB(): Promise<DocumentRecord[]> {
  try {
    const db = await getIDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(STORAGE_KEY_RECORDS);

    const data = await new Promise<DocumentRecord[] | undefined>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (data && Array.isArray(data)) {
      recordsCache = data;
      try {
        localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(data));
      } catch (e) {
        // Quota exceeded for localStorage, safe in IndexedDB
      }
      return data;
    }
  } catch (err) {
    console.warn('IndexedDB load error, reading from localStorage fallback:', err);
  }

  const lsData = loadRecordsFromLS();
  recordsCache = lsData;

  // Persist to IDB if lsData loaded
  try {
    const db = await getIDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(lsData, STORAGE_KEY_RECORDS);
  } catch (e) {
    // Ignore IDB write error during initial fallback
  }

  return lsData;
}

export async function saveRecordsToIDB(records: DocumentRecord[]): Promise<void> {
  recordsCache = records;
  
  // 1. Try LocalStorage (fast cache, may fail on large attachments)
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (err) {
    console.warn('LocalStorage limit reached for large attachments, safely stored in IndexedDB:', err);
  }

  // 2. Always persist to IndexedDB (unlimited storage for attachments & PDFs)
  try {
    const db = await getIDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(records, STORAGE_KEY_RECORDS);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save to IndexedDB:', err);
  }
}

function loadRecordsFromLS(): DocumentRecord[] {
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

export function loadRecords(): DocumentRecord[] {
  if (recordsCache && recordsCache.length > 0) {
    return recordsCache;
  }
  return loadRecordsFromLS();
}

export function saveRecords(records: DocumentRecord[]) {
  recordsCache = records;
  saveRecordsToIDB(records);
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
      user: 'Jakir',
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
    const parsed = JSON.parse(raw);
    if (parsed.ownerName === 'Akter') {
      parsed.ownerName = 'Jakir';
      saveSecurityConfig(parsed);
    }
    return parsed;
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
