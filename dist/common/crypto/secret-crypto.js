"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptSecret = encryptSecret;
exports.decryptSecret = decryptSecret;
exports.generateVerifyToken = generateVerifyToken;
const crypto_1 = require("crypto");
/**
 * Cifra/descifra secretos de integraciones de terceros (tokens de WhatsApp/Facebook/Twilio)
 * antes de guardarlos en la base de datos. AES-256-GCM con la clave derivada de
 * INTEGRATIONS_ENCRYPTION_KEY (cualquier string; se deriva a 32 bytes vía sha256 para no
 * exigir un formato exacto de la env var).
 *
 * Formato de salida: `${ivHex}:${authTagHex}:${cipherHex}`.
 */
function getKey() {
    const secret = process.env.INTEGRATIONS_ENCRYPTION_KEY;
    if (!secret) {
        throw new Error('INTEGRATIONS_ENCRYPTION_KEY no está configurada');
    }
    return (0, crypto_1.createHash)('sha256').update(secret).digest();
}
function encryptSecret(plain) {
    const iv = (0, crypto_1.randomBytes)(12);
    const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}
function decryptSecret(encoded) {
    const [ivHex, authTagHex, cipherHex] = encoded.split(':');
    if (!ivHex || !authTagHex || !cipherHex) {
        throw new Error('Formato de secreto cifrado inválido');
    }
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', getKey(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(cipherHex, 'hex')),
        decipher.final(),
    ]);
    return decrypted.toString('utf8');
}
function generateVerifyToken() {
    return (0, crypto_1.randomBytes)(24).toString('base64url');
}
//# sourceMappingURL=secret-crypto.js.map