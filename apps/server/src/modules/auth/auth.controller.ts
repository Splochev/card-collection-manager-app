import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import SignupUserDto from './dto/signup-user.dto';
import { LogtoWebHookGuard } from '../../guards/logto-webhook.guard';

@ApiTags('auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LogtoWebHookGuard('LOGTO_WEBHOOK_SIGNUP'))
  @Post('/signup')
  async postSignup(@Body() body: SignupUserDto): Promise<void> {
    try {
      const authId = body.data.id;
      await this.authService.signup(authId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @UseGuards(LogtoWebHookGuard('LOGTO_WEBHOOK_DELETE'))
  @Post('/delete')
  async postDelete(@Body() body: { data: { id: string } }): Promise<void> {
    try {
      const authId = body.data.id;
      await this.authService.delete(authId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
