import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

/**
 * Cifra/descifra secretos de integraciones de terceros (tokens de WhatsApp/Facebook/Twilio)
 * antes de guardarlos en la base de datos. AES-256-GCM con la clave derivada de
 * INTEGRATIONS_ENCRYPTION_KEY (cualquier string; se deriva a 32 bytes vía sha256 para no
 * exigir un formato exacto de la env var).
 *
 * Formato de salida: `${ivHex}:${authTagHex}:${cipherHex}`.
 */
function getKey(): Buffer {
  const secret = process.env.INTEGRATIONS_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error('INTEGRATIONS_ENCRYPTION_KEY no está configurada');
  }
  return createHash('sha256').update(secret).digest();
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptSecret(encoded: string): string {
  const [ivHex, authTagHex, cipherHex] = encoded.split(':');
  if (!ivHex || !authTagHex || !cipherHex) {
    throw new Error('Formato de secreto cifrado inválido');
  }
  const decipher = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(cipherHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

export function generateVerifyToken(): string {
  return randomBytes(24).toString('base64url');
}
