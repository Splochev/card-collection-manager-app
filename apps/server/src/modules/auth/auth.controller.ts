import { Controller, Post, Body, UseGuards, Res, HttpCode } from '@nestjs/common';
import { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service';
import { SignupUserDto } from '@card-collection-manager-app/shared';
import { LogtoWebHookGuard } from '../../guards/logto-webhook.guard';

const ACCESS_TOKEN_COOKIE = 'accessToken';

const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/set-token')
  async setToken(@Body() body: { token: string }, @Res() res: Response): Promise<void> {
    try {
      const { token } = body;
      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
      }

      // The client re-sends the token every 10 minutes to keep this alive
      res.cookie(ACCESS_TOKEN_COOKIE, token, {
        ...accessTokenCookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.status(200).json({ message: 'Token set successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to set token' });
    }
  }

  @Post('/logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions);
  }

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
