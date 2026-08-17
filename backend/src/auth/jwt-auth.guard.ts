import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { Request } from "express";
import * as jwt from "jsonwebtoken";

import { DatabaseService } from "../database/database.service";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  is_guest: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  cookies: {
    auth_token?: string;
  };
}

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwtSecret =
    process.env.JWT_SECRET || "super_secret_key";

  constructor(
    private readonly db: DatabaseService
  ) { }

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = request.cookies?.auth_token;

    if (!token) {
      throw new UnauthorizedException(
        "Access token missing"
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        this.jwtSecret
      );


      if (!this.isValidJwtPayload(decoded)) {
        throw new UnauthorizedException(
          "Invalid token payload"
        );
      }

      const userResult =
        await this.db.query<AuthenticatedUser>(
          `SELECT
            id,
            name,
            email,
            is_guest
          FROM users
          WHERE id = $1`,
          [decoded.sub]
        );

      const user = userResult.rows[0];

      if (!user) {
        throw new UnauthorizedException(
          "User no longer exists"
        );
      }

      request.user = user;

      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new UnauthorizedException(
        "Invalid or expired token"
      );
    }
  }

  private isValidJwtPayload(
    decoded: string | jwt.JwtPayload
  ): decoded is JwtPayload {
    return (
      typeof decoded === "object" &&
      decoded !== null &&
      typeof decoded.sub === "string" &&
      typeof decoded.email === "string"
    );
  }
}