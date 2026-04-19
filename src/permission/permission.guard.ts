import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { Role } from 'src/role/role.entity';
import { RoleService } from 'src/role/role.service';
import { User } from 'src/user/models/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private userService: UserService,
    private roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const access = this.reflector.get<string>('access', context.getHandler());
    if (!access) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    let id: number;
    try {
      id = await this.authService.userId(request);
    } catch {
      throw new UnauthorizedException();
    }

    const user = (await this.userService.findOne({ id }, [
      'role',
    ])) as User | null;
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.role?.id) {
      throw new ForbiddenException('User has no role assigned');
    }

    const role = (await this.roleService.findOne({ id: user.role.id }, [
      'permissions',
    ])) as Role | null;
    if (!role) {
      throw new ForbiddenException('Role not found');
    }

    if (request.method === 'GET') {
      return role.permissions.some(
        (p) => p.name === `view_${access}` || p.name === `edit_${access}`,
      );
    }

    return role.permissions.some((p) => p.name === `edit_${access}`);
  }
}
