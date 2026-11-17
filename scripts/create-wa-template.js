#!/usr/bin/env node
/**
 * Da de alta una plantilla de WhatsApp en Twilio (Content API) a partir de un archivo
 * JSON, y opcionalmente la manda a aprobación de Meta.
 *
 *   node scripts/create-wa-template.js scripts/wa-templates/<archivo>.json
 *   node scripts/create-wa-template.js scripts/wa-templates/<archivo>.json --approve
 *
 * Son dos pasos a propósito: crear el contenido es reversible (se puede borrar con
 * DELETE mientras no esté aprobado), mientras que mandarlo a aprobación lo expone a
 * la revisión de Meta y afecta la calidad de la cuenta. Por eso --approve es explícito.
 *
 * El JSON lleva el formato de la Content API. Para una plantilla con imagen y botones
 * se usa `whatsapp/card`, que admite:
 *   - media:   una URL pública de imagen (p. ej. /api/media-assets/<id>.jpg)
 *   - body:    texto, admite variables {{1}}, {{2}}, ...
 *   - actions: hasta 2 botones URL, 1 de teléfono y 1 COPY_CODE
 *       { "type": "COPY_CODE", "code": "ZNIZKA30" }   → WhatsApp pone el título solo,
 *                                                        traducido al idioma de la plantilla
 *       { "type": "URL", "title": "...", "url": "https://..." }  → título máx. 20 caracteres
 *
 * Credenciales: TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN del .env del backend.
 */

const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, 'utf8');
  const out = {};
  for (const line of raw.split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) out[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

function getCredentials() {
  const env = { ...loadEnv(), ...process.env };
  const accountSid = env.TWILIO_ACCOUNT_SID;
  const authToken = env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    console.error('❌ Faltan TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN');
    process.exit(1);
  }
  return 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
}

/** Valida lo que Meta rechaza de entrada, para no gastar una revisión en una errata. */
function validate(definition) {
  const problems = [];
  if (!definition.friendly_name) problems.push('falta friendly_name');
  if (!definition.language) problems.push('falta language');
  if (!definition.types || Object.keys(definition.types).length === 0) {
    problems.push('falta types');
  }

  const card = definition.types?.['whatsapp/card'];
  if (card) {
    if (!card.body) problems.push('whatsapp/card necesita body');
    if (card.body && card.body.length > 1024) {
      problems.push(`el body tiene ${card.body.length} caracteres (máximo 1024)`);
    }
    const actions = card.actions || [];
    if (actions.length === 0) problems.push('whatsapp/card necesita al menos un botón');
    for (const action of actions) {
      if (action.type === 'URL') {
        if (!action.url) problems.push('un botón URL no trae url');
        if (!action.title) problems.push('un botón URL no trae título');
        if (action.title && [...action.title].length > 20) {
          problems.push(`el título "${action.title}" tiene ${[...action.title].length} caracteres (máximo 20)`);
        }
      }
      if (action.type === 'COPY_CODE' && !action.code) {
        problems.push('un botón COPY_CODE no trae code');
      }
    }
    if (actions.filter((a) => a.type === 'URL').length > 2) {
      problems.push('solo se admiten 2 botones URL');
    }
    if (actions.filter((a) => a.type === 'COPY_CODE').length > 1) {
      problems.push('solo se admite 1 botón COPY_CODE');
    }
  }

  return problems;
}

async function main() {
  const [, , file, ...flags] = process.argv;
  if (!file) {
    console.error('Uso: node scripts/create-wa-template.js <archivo.json> [--approve]');
    process.exit(1);
  }

  const definitionPath = path.resolve(file);
  const definition = JSON.parse(fs.readFileSync(definitionPath, 'utf8'));
  const { category = 'MARKETING', ...content } = definition;

  const problems = validate(content);
  if (problems.length > 0) {
    console.error('❌ La definición tiene problemas:');
    for (const p of problems) console.error('   - ' + p);
    process.exit(1);
  }

  const auth = getCredentials();

  console.log(`🔄 Creando "${content.friendly_name}" (${content.language}) en Twilio...`);
  const response = await fetch('https://content.twilio.com/v1/Content', {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  });
  const created = await response.json();
  if (!response.ok) {
    console.error('❌ Twilio rechazó la creación:', created?.message || JSON.stringify(created));
    process.exit(1);
  }

  console.log(`✅ Plantilla creada: ${created.sid}`);
  console.log('   Agrégala a waTemplates en app/inbox/envios/page.tsx con este sid.');

  if (!flags.includes('--approve')) {
    console.log('\nNo se mandó a aprobación. Para hacerlo:');
    console.log(`   node scripts/create-wa-template.js ${file} --approve`);
    console.log('Para borrarla mientras no esté aprobada:');
    console.log(`   curl -X DELETE https://content.twilio.com/v1/Content/${created.sid} -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN`);
    return;
  }

  console.log(`🔄 Enviando a aprobación de WhatsApp (categoría ${category})...`);
  const approvalResponse = await fetch(
    `https://content.twilio.com/v1/Content/${created.sid}/ApprovalRequests/whatsapp`,
    {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: content.friendly_name, category }),
    },
  );
  const approval = await approvalResponse.json();
  if (!approvalResponse.ok) {
    console.error('❌ No se pudo enviar a aprobación:', approval?.message || JSON.stringify(approval));
    console.error(`   La plantilla quedó creada (${created.sid}); puedes reintentar o borrarla.`);
    process.exit(1);
  }

  console.log(`✅ Enviada. Estado: ${approval?.whatsapp?.status || approval?.status || 'pending'}`);
  console.log('   Meta suele tardar de unos minutos a unas horas. Los envíos fallan hasta que apruebe.');
}

main().catch((error) => {
  console.error('❌ Error inesperado:', error.message);
  process.exit(1);
});
