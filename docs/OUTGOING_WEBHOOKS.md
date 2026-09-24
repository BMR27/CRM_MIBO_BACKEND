# Webhooks salientes — eventos de estado de mensajes WhatsApp

## Qué es esto

Cada espacio de trabajo (tenant) puede registrar una URL propia (`webhook_url`) a la
que el sistema notifica, en tiempo real, los cambios de estado de los mensajes de
WhatsApp que envía por la API (`enviado`, `entregado`, `leído`, `fallido`). Antes de
esta funcionalidad no existía ningún mecanismo de notificación saliente: había que
consultar el estado manualmente contra `GET /api/whatsapp/message-status`.

## Requisito de despliegue: `PUBLIC_API_URL`

Para que Twilio pueda notificarnos los cambios de estado, el backend necesita saber
su propia URL pública. Define en el `.env` de cada entorno:

```env
PUBLIC_API_URL=https://tu-backend-en-produccion.com
```

Si esta variable no está configurada, los mensajes se siguen enviando con
normalidad, pero Twilio nunca llama de vuelta y por lo tanto no se generan eventos de
estado (ni se disparan los webhooks salientes).

## 1. Configurar el webhook del espacio de trabajo

Todos los endpoints de configuración requieren JWT de un usuario con rol `admin` del
tenant.

### Ver configuración actual

```
GET /api/tenants/me/webhook
Authorization: Bearer <JWT>
```

```json
{
  "webhook_url": "https://miempresa.com/webhooks/mibo",
  "webhook_events_enabled": true,
  "has_secret": true
}
```

### Registrar/actualizar la URL y habilitar el envío

```
PATCH /api/tenants/me/webhook
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "webhook_url": "https://miempresa.com/webhooks/mibo",
  "enabled": true
}
```

La primera vez que se habilita, la respuesta incluye el secreto de firma en texto
plano — **guárdalo en ese momento, no se vuelve a mostrar completo**:

```json
{
  "webhook_url": "https://miempresa.com/webhooks/mibo",
  "webhook_events_enabled": true,
  "has_secret": true,
  "webhook_secret": "240c4d7b1da4b06ac61622161745dd9...",
  "warning": "Guarda este secreto ahora: no volverá a mostrarse completo."
}
```

Para deshabilitar temporalmente el envío sin borrar la URL:

```json
{ "enabled": false }
```

Para quitar la URL:

```json
{ "webhook_url": null }
```

### Rotar el secreto de firma

```
POST /api/tenants/me/webhook/rotate-secret
Authorization: Bearer <JWT>
```

Invalida el secreto anterior y devuelve uno nuevo (también solo una vez, en el mismo
campo `webhook_secret`).

## 2. Qué recibe tu endpoint

Cuando el estado de un mensaje cambia, hacemos:

```
POST <tu webhook_url>
Content-Type: application/json
X-Mibo-Event: message.status_updated
X-Mibo-Signature: sha256=<hmac-hex>
```

Body:

```json
{
  "event": "message.status_updated",
  "timestamp": "2026-09-01T18:55:53.444Z",
  "tenant_id": "38f93cc9-ac2f-4b78-bef7-f74ec014d55e",
  "data": {
    "message_id": "c702873a-40ff-4c3f-98a6-05784a0d6c31",
    "conversation_id": "f16bd517-1673-4d42-b15b-5fb2ba0ec552",
    "whatsapp_message_id": "SMfound999",
    "status": "delivered",
    "to": "whatsapp:+525512345678",
    "from": "whatsapp:+14155238886",
    "error_code": null
  }
}
```

`data.status` refleja los valores que envía Twilio: `queued`, `sent`, `delivered`,
`read`, `failed`, `undelivered`. `error_code` viene poblado solo en fallos (código de
error de Twilio, ej. `63016`).

### Verificar la firma

`X-Mibo-Signature` es un HMAC-SHA256 del **cuerpo crudo** de la solicitud (el string
JSON tal como se envió, no el objeto reparseado), usando tu `webhook_secret` como
clave:

```js
const crypto = require('crypto');

function isValidSignature(rawBody, signatureHeader, secret) {
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}
```

### Reintentos

Si tu endpoint no responde 2xx (o hay timeout de 5s), reintentamos **una vez**. Si el
segundo intento también falla, el evento se descarta (no hay cola de reintentos ni
almacenamiento de eventos fallidos en esta primera versión).

## 3. Cómo se dispara

`POST /api/twilio/send-wa-template` y `POST /api/messages/bulk` ya incluyen
automáticamente la URL de callback de estado hacia nuestro propio backend
(`statusCallback`/`StatusCallback` de Twilio) cuando `PUBLIC_API_URL` está
configurada — no requiere ningún cambio en el payload que envías a esos endpoints.

Internamente:

1. Envías la plantilla vía `send-wa-template` o `messages/bulk`.
2. Twilio entrega el mensaje y, por cada cambio de estado, llama a
   `POST /api/twilio/status-callback/:tenantId` (endpoint interno, no lo llames tú
   directamente).
3. Ese endpoint actualiza el mensaje localmente y reenvía el evento a tu
   `webhook_url`, si la tienes configurada y habilitada.
