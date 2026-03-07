import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY; // Must be 32 bytes (64 hex characters)

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  console.error('API_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)');
}

export function encrypt(text: string) {
  if (!text) return null;
  if (!ENCRYPTION_KEY) throw new Error('Encryption key not set');

  const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(12); // GCM standard IV size is 12 bytes
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag
  };
}

export function decrypt(encryptedData: string, iv: string, authTag: string) {
  if (!encryptedData || !iv || !authTag) return null;
  if (!ENCRYPTION_KEY) throw new Error('Encryption key not set');

  try {
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}
