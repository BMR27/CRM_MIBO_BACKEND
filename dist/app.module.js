"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const roles_guard_1 = require("./guards/roles.guard");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const roles_module_1 = require("./modules/roles/roles.module");
const contacts_module_1 = require("./modules/contacts/contacts.module");
const conversations_module_1 = require("./modules/conversations/conversations.module");
const messages_module_1 = require("./modules/messages/messages.module");
const orders_module_1 = require("./modules/orders/orders.module");
const macros_module_1 = require("./modules/macros/macros.module");
const conversation_tags_module_1 = require("./modules/conversation-tags/conversation-tags.module");
const whatsapp_module_1 = require("./modules/whatsapp/whatsapp.module");
const twilio_module_1 = require("./twilio/twilio.module");
const calls_module_1 = require("./modules/calls/calls.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    //  Prioriza Railway DATABASE_URL
                    const databaseUrl = configService.get('DATABASE_URL');
                    const synchronize = configService.get('DATABASE_SYNCHRONIZE') === 'true';
                    const logging = configService.get('DATABASE_LOGGING') === 'true';
                    // Railway/Postgres administrado suele requerir SSL/TLS
                    const sslConfig = { rejectUnauthorized: false };
                    if (databaseUrl && databaseUrl.trim().length > 0) {
                        return {
                            type: 'postgres',
                            url: databaseUrl,
                            entities: [__dirname + '/**/*.entity{.ts,.js}'],
                            synchronize,
                            logging,
                            ssl: sslConfig,
                            extra: { ssl: sslConfig },
                        };
                    }
                    //  Fallback: variables separadas (por si aún las usas)
                    const host = configService.get('DATABASE_HOST');
                    const port = parseInt(configService.get('DATABASE_PORT') || '5432', 10);
                    const username = configService.get('DATABASE_USER');
                    const password = configService.get('DATABASE_PASSWORD');
                    const database = configService.get('DATABASE_NAME');
                    return {
                        type: 'postgres',
                        host,
                        port,
                        username,
                        password,
                        database,
                        entities: [__dirname + '/**/*.entity{.ts,.js}'],
                        synchronize,
                        logging,
                        ssl: sslConfig,
                        extra: { ssl: sslConfig },
                    };
                },
            }),
            auth_module_1.AuthModule,
            roles_module_1.RolesModule,
            users_module_1.UsersModule,
            contacts_module_1.ContactsModule,
            conversations_module_1.ConversationsModule,
            messages_module_1.MessagesModule,
            orders_module_1.OrdersModule,
            macros_module_1.MacrosModule,
            conversation_tags_module_1.ConversationTagsModule,
            whatsapp_module_1.WhatsappModule,
            twilio_module_1.TwilioModule,
            calls_module_1.CallsModule,
        ],
        controllers: [],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map