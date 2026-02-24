"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const auth_controller_1 = require("./auth.controller");
const users_module_1 = require("../users/users.module");
const roles_module_1 = require("../roles/roles.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            jwt_1.JwtModule.registerAsync({
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: configService.get('JWT_EXPIRATION') || '7d' },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [jwt_strategy_1.JwtStrategy],
        controllers: [auth_controller_1.AuthController],
        exports: [jwt_1.JwtModule, passport_1.PassportModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map