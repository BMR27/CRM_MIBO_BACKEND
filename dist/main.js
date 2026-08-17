"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const roles_service_1 = require("./modules/roles/roles.service");
require("dotenv/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Set global prefix
    app.setGlobalPrefix('api');
    // Enable CORS
    // CORS seguro: solo permite localhost y el dominio de frontend de producción
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3002',
            'https://crmmibofrontend-production.up.railway.app',
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
            app.use('/api/docs', (req, res, next) => {
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
        const config = new swagger_1.DocumentBuilder()
            .setTitle('MIBO CRM API')
            .setDescription([
            'Documentación interna del CRM MIBO.',
            '',
            'Incluye endpoints administrativos, webhooks, integraciones y operaciones sensibles.',
            '',
            'No debe publicarse a clientes finales sin control de acceso.',
        ].join('\n'))
            .setVersion('1.0.0')
            .addServer('/', 'Servidor actual')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'Authorization',
            description: 'Pega únicamente el token JWT, sin escribir Bearer.',
            in: 'header',
        })
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
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
        }
        else {
            console.log('Swagger docs disabled in production. Set ENABLE_SWAGGER=true to enable internal docs.');
        }
        // Seed default roles for the "default" tenant (donde viven los usuarios/datos preexistentes)
        try {
            const rolesService = app.get(roles_service_1.RolesService);
            await rolesService.seedDefaultRolesForTenant('00000000-0000-0000-0000-000000000001');
            console.log('✓ Roles por defecto verificados/creados');
        }
        catch (error) {
            console.error('Error seeding roles:', error);
        }
    });
}
bootstrap().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map