import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RolesService } from './modules/roles/roles.service';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix
  app.setGlobalPrefix('api');
  // Enable CORS
  // CORS seguro: solo permite localhost y el dominio de frontend de producción
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3005',
      'https://crmmibofrontend-production.up.railway.app',
      'https://crmmibofrontend-production-ba41.up.railway.app',
    ],
    methods: 'GET,POST,PATCH,DELETE,OPTIONS',
    credentials: true,
  });

  // Si necesitas abrir CORS para pruebas, comenta el bloque anterior y descomenta esto:
  // app.enableCors({ origin: true, methods: 'GET,POST,PATCH,DELETE,OPTIONS', credentials: true });

  // Swagger interno: en producción queda deshabilitado por defecto.
  // Para habilitarlo en Railway define ENABLE_SWAGGER=true.
  const swaggerEnabled = process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true';
  if (swaggerEnabled) {
    const swaggerUser = process.env.SWAGGER_USER;
    const swaggerPassword = process.env.SWAGGER_PASSWORD;

    if (swaggerUser && swaggerPassword) {
      app.use('/api/docs', (req: any, res: any, next: any) => {
        const header = String(req.headers.authorization || '');
        const [scheme, encoded] = header.split(' ');
        const decoded = scheme === 'Basic' && encoded ? Buffer.from(encoded, 'base64').toString('utf8') : '';
        const [user, password] = decoded.split(':');

        if (user === swaggerUser && password === swaggerPassword) {
          return next();
        }

        res.setHeader('WWW-Authenticate', 'Basic realm="MIBO CRM API Docs"');
        return res.status(401).send('Authentication required');
      });
    }

    const config = new DocumentBuilder()
      .setTitle('MIBO CRM API')
      .setDescription(
        [
          'Documentación interna del CRM MIBO.',
          '',
          'Incluye endpoints administrativos, webhooks, integraciones y operaciones sensibles.',
          '',
          'No debe publicarse a clientes finales sin control de acceso.',
        ].join('\n'),
      )
      .setVersion('1.0.0')
      .addServer('/', 'Servidor actual')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Pega únicamente el token JWT, sin escribir Bearer.',
          in: 'header',
        }
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  const port = process.env.PORT || 3001;
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  await app.listen(port, '0.0.0.0', async () => {
    console.log(`Server running on http://localhost:${port}`);
    if (swaggerEnabled) {
      console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
    } else {
      console.log('Swagger docs disabled in production. Set ENABLE_SWAGGER=true to enable internal docs.');
    }

    // Seed default roles for the "default" tenant (donde viven los usuarios/datos preexistentes)
    try {
      const rolesService = app.get(RolesService);
      await rolesService.seedDefaultRolesForTenant('00000000-0000-0000-0000-000000000001');
      console.log('✓ Roles por defecto verificados/creados');
    } catch (error) {
      console.error('Error seeding roles:', error);
    }
  });
}

bootstrap().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
