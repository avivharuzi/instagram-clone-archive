import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

import { getUserPublic, UserDocument, UserPublic } from '../users';
import { User, WithoutAuth } from './auth.const';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  ResendVerificationDto,
  ResetPasswordDto,
  SignupDto,
} from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('logout')
  async logout(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ): Promise<void> {
    await this.authService.logout(req, res);
    res.send();
  }

  @WithoutAuth()
  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<void> {
    return this.authService.signup(signupDto);
  }

  @WithoutAuth()
  @Post('resend-verification')
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto
  ): Promise<void> {
    return this.authService.resendVerification(resendVerificationDto);
  }

  @WithoutAuth()
  @Post('verify/:token')
  async verify(@Param('token') token: string): Promise<void> {
    return this.authService.verify(token);
  }

  @WithoutAuth()
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto
  ): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @WithoutAuth()
  @Post('check-reset-password/:token')
  async checkResetPassword(@Param('token') token: string): Promise<void> {
    return this.authService.checkResetPassword(token);
  }

  @WithoutAuth()
  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<void> {
    return this.authService.resetPassword(token, resetPasswordDto);
  }

  @WithoutAuth()
  @Post('login')
  async login(
    @Res() res: FastifyReply,
    @Body() loginDto: LoginDto
  ): Promise<void> {
    const user = await this.authService.login(res, loginDto);

    res.send(user);
  }

  // eslint-disable-next-line class-methods-use-this
  @Get('user')
  user(@User() user: UserDocument): UserPublic {
    return getUserPublic(user);
  }
}
