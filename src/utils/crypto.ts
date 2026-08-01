/**
 * Encryption and Security Utilities using Web Crypto API
 * Supports AES-GCM encryption with PBKDF2 key derivation based on user PIN.
 */

// Derive AES-256 Key from User PIN (e.g. "2020")
async function getCryptoKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const pinBuffer = enc.encode(pin);
  
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    pinBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt plain text using user PIN
export async function encryptData(plainText: string, pin: string = "2020"): Promise<string> {
  try {
    const enc = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const key = await getCryptoKey(pin, salt);
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plainText)
    );

    // Combine Salt (16b) + IV (12b) + Encrypted Data into Base64 payload
    const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (err) {
    console.error("Encryption failed, fallback to base64 encoding", err);
    return btoa(encodeURIComponent(plainText));
  }
}

// Decrypt base64 payload using user PIN
export async function decryptData(encryptedPayload: string, pin: string = "2020"): Promise<string> {
  try {
    const binaryStr = atob(encryptedPayload);
    const combined = Uint8Array.from(binaryStr, c => c.charCodeAt(0));

    if (combined.length < 28) {
      // Fallback for simple encoded string
      return decodeURIComponent(atob(encryptedPayload));
    }

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);

    const key = await getCryptoKey(pin, salt);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (err) {
    // Attempt fallback decode if legacy payload
    try {
      return decodeURIComponent(atob(encryptedPayload));
    } catch {
      throw new Error("Decryption failed. Invalid PIN or corrupted data.");
    }
  }
}

// Helper to extract YouTube and Facebook video metadata
export interface ParsedVideo {
  type: 'youtube' | 'facebook' | 'other';
  videoId?: string;
  embedUrl: string;
  originalUrl: string;
}

export function parseVideoUrl(url: string): ParsedVideo | null {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();

  // YouTube Check
  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
      originalUrl: cleanUrl
    };
  }

  // Facebook Check
  if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) {
    const encoded = encodeURIComponent(cleanUrl);
    return {
      type: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&autoplay=true`,
      originalUrl: cleanUrl
    };
  }

  return {
    type: 'other',
    embedUrl: cleanUrl,
    originalUrl: cleanUrl
  };
}

// Format file size
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
