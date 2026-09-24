# 🚀 Guía de Configuración de Twilio para WhatsApp

## Descripción General

Este documento proporciona instrucciones paso a paso para integrar Twilio con WhatsApp Business. El sistema de chat interno utiliza Twilio como proveedor de mensajería para recibir y enviar mensajes de WhatsApp.

## Requisitos Previos

- Cuenta de Twilio activa
- Número de teléfono válido para verificación
- Acceso a la consola de Twilio
- Backend de NestJS desplegado y ejecutándose

## Paso 1: Crear una Cuenta de Twilio

1. Visita [twilio.com](https://www.twilio.com)
2. Haz clic en **Sign Up** para crear una nueva cuenta
3. Completa tu información personal:
   - Nombre completo
   - Correo electrónico
   - Contraseña
4. Verifica tu correo electrónico
5. Completa la verificación de dos factores

## Paso 2: Obtener las Credenciales de Twilio

### 2.1 Cuenta SID y Auth Token

1. Ve a la [consola de Twilio](https://www.twilio.com/console)
2. En el panel principal, encontrarás:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: (visible haciendo clic en "View")
3. Copia estas credenciales y guárdalas en un lugar seguro

### 2.2 Comprar un Número de Teléfono

1. En la consola, ve a **Phone Numbers** → **Buy a Number**
2. Selecciona tu país
3. Busca un número disponible
4. Completa la compra

**Alternativa**: Si no deseas comprar un número, puedes usar un número de Twilio temporal para pruebas.

## Paso 3: Habilitar WhatsApp en Twilio

### 3.1 Acceder a WhatsApp Sandbox

1. Ve a **Messaging** → **Try it out** → **Send an SMS**
2. O dirígete a: [Twilio Console - WhatsApp Sandbox](https://www.twilio.com/console/sms/whatsapp)
3. Habilita el **WhatsApp Sandbox**

### 3.2 Verificar tu Número de Teléfono

1. Recibirás un mensaje en WhatsApp con código de verificación
2. Responde con el código proporcionado

### 3.3 Obtener el Número WhatsApp Sandbox

El número del sandbox aparecerá en formato: `+1234567890` (este es el número que usarás inicialmente para pruebas)

## Paso 4: Integración Productiva (Opcional)

Si deseas conectar una cuenta de WhatsApp Business real (no sandbox):

### 4.1 Crear una Aplicación de WhatsApp Business

1. Ve a [Meta Business Suite](https://business.facebook.com)
2. Crea una nueva aplicación de WhatsApp Business
3. Completa la verificación de identidad de negocio
4. Espera aprobación (puede tomar 1-3 días hábiles)

### 4.2 Conectar a Twilio

1. En Twilio Console, ve a **Messaging** → **Senders**
2. Haz clic en **Add a WhatsApp Business Account**
3. Sigue el flujo de conexión con Meta
4. Obtén tu número de WhatsApp Business

## Paso 5: Configurar Variables de Entorno

Actualiza el archivo `.env` de tu backend con las credenciales de Twilio:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_TOKEN=your-secure-webhook-token

# Webhook Configuration
TWILIO_WEBHOOK_URL=https://your-backend-url.com/api/whatsapp/webhook
```

## Paso 6: Configurar Webhooks en Twilio

### 6.1 Obtener URL del Webhook

Tu URL de webhook debe seguir este formato:
```
https://your-backend-url.com/api/whatsapp/webhook
```

Reemplaza `your-backend-url.com` con la URL real de tu servidor backend.

### 6.2 Configurar en Twilio Console

1. Ve a **Messaging** → **Settings**
2. En la sección **Webhooks**, completa:
   - **When a message comes in**: `https://your-backend-url.com/api/whatsapp/webhook`
   - **When a message is sent**: (opcional) `https://your-backend-url.com/api/whatsapp/status`
3. Guarda los cambios

### 6.3 Validación de Webhook

Twilio enviará una solicitud POST para validar tu webhook. El servidor debe responder con:

```
HTTP/1.1 200 OK
```

El middleware de Twilio en NestJS valida automáticamente estos webhooks usando `TWILIO_WEBHOOK_TOKEN`.

## Paso 7: Testear la Integración

### 7.1 Verificar Endpoint de Salud

```bash
curl -X GET http://localhost:3001/api/whatsapp/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Respuesta esperada:
```json
{
  "status": "connected",
  "twilioConnected": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 7.2 Enviar un Mensaje de Prueba

```bash
curl -X POST http://localhost:3001/api/whatsapp/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+34612345678",
    "message": "Hola, este es un mensaje de prueba desde Twilio"
  }'
```

### 7.3 Recibir Mensajes

1. Envía un mensaje de WhatsApp al número configurado
2. El servidor debe recibir el webhook automáticamente
3. El mensaje se guardará en la base de datos

## Paso 8: Configuración de Producción

### 8.1 Escalabilidad

Para manejar alto volumen de mensajes:

1. **Rate Limiting**: Twilio ofrece límites según tu plan
2. **Queue Management**: Implementa colas para procesar mensajes asíncronamente
3. **Webhook Timeouts**: Asegúrate de responder en < 5 segundos

### 8.2 Seguridad

1. **Token Seguro**: Genera un `TWILIO_WEBHOOK_TOKEN` fuerte:
   ```bash
   openssl rand -base64 32
   ```

2. **HTTPS**: Asegúrate de que tu webhook URL use HTTPS en producción

3. **Validación**: El servidor valida automáticamente las solicitudes de Twilio

## Paso 9: Monitoreo y Logs

### 9.1 Ver Logs en Twilio Console

1. Ve a **Logs** → **Debugger**
2. Observa las solicitudes entrantes y salientes
3. Verifica estados de entrega

### 9.2 Logs del Backend

Los logs de Twilio se registran en:
- `logs/twilio.log`
- `logs/error.log`

## Troubleshooting

### Problema: Webhook no recibe mensajes

**Solución**:
1. Verifica que la URL del webhook sea accesible públicamente
2. Confirma que el webhook está configurado correctamente en Twilio Console
3. Revisa los logs de Twilio Debugger

### Problema: Fallo al enviar mensajes

**Solución**:
1. Verifica que `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN` sean correctos
2. Asegúrate de que el número de teléfono está en formato correcto: `+1234567890`
3. Verifica que tienes saldo en tu cuenta de Twilio

### Problema: Mensajes no se entregan

**Solución**:
1. Comprueba el estado en Twilio Console → **Logs** → **Message Logs**
2. Verifica que el número de destino es válido
3. Asegúrate de que el webhook responde rápidamente (< 5 segundos)

## Webhooks salientes hacia tus propios sistemas

Además del webhook que Twilio envía hacia este backend, cada espacio de trabajo
puede configurar su **propia** URL para recibir eventos de estado de los mensajes
enviados por la API (enviado, entregado, leído, fallido). Ver
[OUTGOING_WEBHOOKS.md](./OUTGOING_WEBHOOKS.md).

## Precios de Twilio

Los precios varían según el país, pero generalmente:
- **Mensajes entrantes**: $0.0075 por mensaje
- **Mensajes salientes**: $0.0075 - $0.015 por mensaje
- **Números telefónicos**: $1 por mes

Consulta [twilio.com/pricing](https://www.twilio.com/pricing/messaging) para precios exactos.

## Recursos Adicionales

- [Documentación oficial de Twilio WhatsApp](https://www.twilio.com/docs/whatsapp)
- [Twilio Console](https://www.twilio.com/console)
- [API Reference de Twilio SMS/WhatsApp](https://www.twilio.com/docs/sms/api)
- [Twilio Status Page](https://status.twilio.com)

## Próximos Pasos

1. Verifica que todos los endpoints de WhatsApp funcionen correctamente
2. Configura logs y monitoreo en tu entorno de producción
3. Realiza testing con usuarios reales
4. Documenta procedimientos de escalabilidad
5. Implementa alertas para fallos de entrega

---

**Última actualización**: 2024  
**Versión de Twilio SDK**: 4.10.0
