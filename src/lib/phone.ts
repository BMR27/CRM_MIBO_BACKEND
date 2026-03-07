// phone.ts
// Normalización global para números WhatsApp México
export function normalizePhoneNumber(value: string): string {
  let phone = String(value).replace('whatsapp:', '').replace(/[^0-9]/g, '');
  // Si viene como +52XXXXXXXXXX (12 dígitos), devolver whatsapp:+52XXXXXXXXXX
  if (value.startsWith('+52') && phone.length === 12) {
    return 'whatsapp:' + value;
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
  if (phone.length > 10 && value.startsWith('+')) {
    return 'whatsapp:' + value;
  }
  // Si no es formato válido, retornar vacío
  return '';
}
