import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';

export function normalizeRole(name?: string): 'admin' | 'supervisor' | 'agent' {
  const n = (name || '').toLowerCase();
  if (n.startsWith('admin')) return 'admin';
  if (n.startsWith('super')) return 'supervisor';
  return 'agent';
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  signToken(
    user: Pick<User, 'id' | 'email' | 'role'>,
    tenantId: string,
    isPlatformAdmin = false,
  ): string {
    return this.jwtService.sign({
      email: user.email,
      sub: user.id,
      role: normalizeRole(user.role?.name),
      tenantId,
      isPlatformAdmin,
    });
  }
}
