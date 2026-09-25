"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePhoneNumber = normalizePhoneNumber;
// phone.ts
// Normalización global para números WhatsApp México
function normalizePhoneNumber(value) {
    const stripped = String(value).replace('whatsapp:', '').trim();
    let phone = stripped.replace(/[^0-9]/g, '');
    // Si viene como +52XXXXXXXXXX (12 dígitos), devolver whatsapp:+52XXXXXXXXXX
    if (stripped.startsWith('+52') && phone.length === 12) {
        return 'whatsapp:' + stripped;
    }
    // Si viene como 52XXXXXXXXXX (12 dígitos), devolver whatsapp:+52XXXXXXXXXX
    if (phone.length === 12 && phone.startsWith('52')) {
        return 'whatsapp:+52' + phone.slice(2);
    }
    // Si viene como 5611205872 (10 dígitos), agregar whatsapp:+52
    if (phone.length === 10) {
        return 'whatsapp:+52' + phone;
    }
    // Si ya viene como 521XXXXXXXXXX (13 dígitos), devolver tal cual
    if (phone.length === 13 && phone.startsWith('521')) {
        return 'whatsapp:+' + phone;
    }
    // Si es número internacional, devolver con whatsapp:+
    if (phone.length > 10 && stripped.startsWith('+')) {
        return 'whatsapp:' + stripped;
    }
    // Si no es formato válido, retornar vacío
    return '';
}
//# sourceMappingURL=phone.js.map