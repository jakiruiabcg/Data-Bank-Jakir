export type CategoryType = 
  | 'Identity' 
  | 'Financial' 
  | 'Legal' 
  | 'Credentials' 
  | 'Personal Notes' 
  | 'Videos & Media' 
  | 'Medical';

export type EncryptionLevel = 'AES-256-GCM' | 'Standard Safe';

export interface Attachment {
  name: string;
  size: number; // in bytes
  type: string; // e.g. 'application/pdf', 'image/png', 'text/plain', 'video/link'
  dataUrl?: string; // base64 or object url
  previewUrl?: string;
  videoUrl?: string; // YouTube or Facebook link
  videoType?: 'youtube' | 'facebook' | 'other';
  videoId?: string;
}

export interface DocumentRecord {
  id: string;
  subject: string;
  category: CategoryType;
  description: string;
  encryptedContent?: string; // Encrypted JSON payload string
  attachment?: Attachment;
  tags: string[];
  encryptionLevel: EncryptionLevel;
  isEncrypted: boolean;
  createdAt: string; // ISO date string
  updatedAt: string;
  accessedCount: number;
  starred?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 
    | 'PIN_UNLOCKED' 
    | 'PIN_FAILED' 
    | 'DOC_ENCRYPTED_SAVED' 
    | 'DOC_DECRYPTED_VIEWED' 
    | 'DOC_UPDATED' 
    | 'DOC_DELETED' 
    | 'DOC_PRINTED' 
    | 'VIDEO_LINK_SAVED' 
    | 'MFA_UPDATED' 
    | 'PIN_CHANGED'
    | 'SYSTEM_BOOT';
  details: string;
  user: string;
  device: string; // e.g., 'Android Chrome', 'Desktop Edge'
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
}

export interface UserSecurityConfig {
  pin: string; // default "2020"
  mfaEnabled: boolean;
  mfaSecret?: string;
  autoLockMinutes: number; // 0 for never, or 1, 5, 15
  lastUnlockedAt?: string;
  ownerName: string; // "Akter"
  ownerRole: string; // "System Admin & Vault Owner"
}
