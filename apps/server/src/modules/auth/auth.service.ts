import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signup(authId: string): Promise<void> {
    await this.usersService.create(authId);
  }

  async delete(authId: string): Promise<void> {
    await this.usersService.deleteByAuthId(authId);
  }
}
