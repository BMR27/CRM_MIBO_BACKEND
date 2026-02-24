"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const roles_service_1 = require("./modules/roles/roles.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Set global prefix
    app.setGlobalPrefix('api');
    // Enable CORS
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });
    // Swagger Setup
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Internal Chat MVP API')
        .setDescription('API for WhatsApp messaging with Twilio integration')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3001;
    await app.listen(port, async () => {
        console.log(`Server running on http://localhost:${port}`);
        console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
        // Seed default roles if not exist
        try {
            const rolesService = app.get(roles_service_1.RolesService);
            await rolesService.seedDefaultRoles();
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