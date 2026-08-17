import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
} from "@nestjs/common";

import type { Response, Request } from "express";

import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { FirebaseLoginDto } from "./dto/firebase-login.dto";
import {
  JwtAuthGuard,
} from "./jwt-auth.guard";
import type { AuthenticatedRequest } from "./jwt-auth.guard";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);

    this.setAuthCookie(res, result.token);

    return result;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    this.setAuthCookie(res, result.token);

    return result;
  }

  @Post('firebase')
  async firebaseLogin(
    @Body() dto: FirebaseLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.firebaseLogin(dto);

    this.setAuthCookie(res, result.token);

    return result;
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@Req() req: AuthenticatedRequest) {
    return {
      user: req.user,
    };
  }

  private setAuthCookie(
    res: Response,
    token: string,
  ) {
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }
}