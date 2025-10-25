import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  async postSignup(@Body() body: { data: { id: string } }): Promise<any> {
    try {
      console.log(body);
      const userAuthId = body.data.id;
      console.log(userAuthId);
      const user = await this.usersService.getUser({ userAuthId } as any);
      console.log('Returning user:', user);
      return { user, test: true };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}