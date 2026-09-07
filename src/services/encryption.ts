/**
 * Web Crypto API Encryption Service
 * Implements PBKDF2 key derivation and AES-GCM encryption/decryption
 * Strictly client-side, zero external libraries.
 */

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export interface EncryptedPayload {
  format: 'teamhub-encrypted-v1';
  salt: string; // base64
  iv: string; // base64
  data: string; // base64
  timestamp: string;
}

/**
 * Derives an AES-GCM 256-bit CryptoKey from a password string and salt using PBKDF2
 */
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts an object into a .teamhub encrypted payload string
 */
export async function encryptBackup(data: object, password: string): Promise<string> {
  if (!password || password.trim().length === 0) {
    throw new Error('Encryption password is required');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPassword(password, salt);

  const jsonString = JSON.stringify(data);
  const encodedData = new TextEncoder().encode(jsonString);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedData
  );

  const payload: EncryptedPayload = {
    format: 'teamhub-encrypted-v1',
    salt: arrayBufferToBase64(salt.buffer),
    iv: arrayBufferToBase64(iv.buffer),
    data: arrayBufferToBase64(encryptedBuffer),
    timestamp: new Date().toISOString(),
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Decrypts a .teamhub encrypted payload string into the original object
 */
export async function decryptBackup(encryptedString: string, password: string): Promise<any> {
  if (!password) {
    throw new Error('Import password is required');
  }

  let payload: EncryptedPayload;
  try {
    payload = JSON.parse(encryptedString);
  } catch {
    throw new Error('Invalid or corrupted Team Hub backup file format.');
  }

  if (!payload || payload.format !== 'teamhub-encrypted-v1' || !payload.salt || !payload.iv || !payload.data) {
    throw new Error('Invalid or corrupted Team Hub backup.');
  }

  try {
    const salt = new Uint8Array(base64ToArrayBuffer(payload.salt));
    const iv = new Uint8Array(base64ToArrayBuffer(payload.iv));
    const ciphertext = base64ToArrayBuffer(payload.data);

    const key = await deriveKeyFromPassword(password, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    const decoded = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decoded);
  } catch (err: any) {
    if (err.name === 'OperationError' || err.message?.includes('decrypt')) {
      throw new Error('Incorrect password. Unable to decrypt this backup.');
    }
    throw new Error('Invalid or corrupted Team Hub backup.');
  }
}

/**
 * Hashes a PIN using PBKDF2 with SHA-256 for local PIN lock
 */
export async function hashPin(pin: string, saltHex?: string): Promise<{ salt: string; hash: string }> {
  const enc = new TextEncoder();
  const salt = saltHex ? hexToUint8Array(saltHex) : crypto.getRandomValues(new Uint8Array(16));

  const pinKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 50000,
      hash: 'SHA-256',
    },
    pinKey,
    256
  );

  return {
    salt: saltHex || bufferToHex(salt.buffer),
    hash: bufferToHex(derivedBits),
  };
}

/**
 * Verifies a candidate PIN against stored salt and hash
 */
export async function verifyPin(pin: string, storedSalt: string, storedHash: string): Promise<boolean> {
  try {
    const { hash } = await hashPin(pin, storedSalt);
    return hash === storedHash;
  } catch {
    return false;
  }
}

export interface EncryptedCredentialPayload {
  encrypted: string;
  iv: string;
  salt: string;
}

/**
 * Encrypts a password string using AES-GCM 256-bit with a key derived via PBKDF2 from a 4-digit PIN
 */
export async function encryptCredentialPassword(
  password: string,
  pin: string
): Promise<EncryptedCredentialPayload> {
  if (!password) {
    throw new Error('Password cannot be empty');
  }
  if (!pin || pin.trim().length === 0) {
    throw new Error('PIN is required for encryption');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPassword(pin.trim(), salt);

  const encoded = new TextEncoder().encode(password);
  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encoded
  );

  return {
    encrypted: arrayBufferToBase64(cipherBuffer),
    iv: arrayBufferToBase64(iv.buffer),
    salt: arrayBufferToBase64(salt.buffer),
  };
}

/**
 * Decrypts an encrypted credential password using candidate PIN
 * Throws an error if PIN is incorrect or decryption fails
 */
export async function decryptCredentialPassword(
  payload: { encrypted: string; iv: string; salt: string },
  pin: string
): Promise<string> {
  if (!pin || pin.trim().length === 0) {
    throw new Error('PIN is required for decryption');
  }

  try {
    const salt = new Uint8Array(base64ToArrayBuffer(payload.salt));
    const iv = new Uint8Array(base64ToArrayBuffer(payload.iv));
    const cipherBuffer = base64ToArrayBuffer(payload.encrypted);

    const key = await deriveKeyFromPassword(pin.trim(), salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      cipherBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err: any) {
    throw new Error('Incorrect PIN. Unable to decrypt password.');
  }
}

