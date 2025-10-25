import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}
  async getUser(req: any): Promise<User> {
    try {
      const userAuthId = req.userAuthId;
      const user = await this.userRepository.findOneOrFail({
        where: { authId: userAuthId },
      });
      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
