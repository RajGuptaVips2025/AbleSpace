import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserRow } from './interfaces/user-row.interface';
import { FirebaseLoginDto } from './dto/firebase-login.dto';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string =
    process.env.JWT_SECRET || 'super_secret_key';

  constructor(private readonly db: DatabaseService) { }

  async register(dto: RegisterDto) {
    const existing = await this.db.query<Pick<UserRow, 'id'>>(
      'SELECT id FROM users WHERE email = $1',
      [dto.email],
    );

    if (existing.rows.length > 0) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const initials = this.getInitials(dto.name);

    const result = await this.db.query<UserRow>(
      `INSERT INTO users (
      name,
      email,
      password_hash,
      fallback_initials,
      is_guest
    )
    VALUES ($1, $2, $3, $4, true)  
    RETURNING
      id,
      name,
      email,
      avatar_url,
      fallback_initials,
      is_guest,
      created_at`,
      [dto.name, dto.email, hashedPassword, initials],
    );

    const user = result.rows[0];
    const token = this.generateToken(user.id, user.email);

    return {
      user,
      token,
    };
  }

  async login(dto: LoginDto) {
    const result = await this.db.query<UserRow>(
      `SELECT
      id,
      name,
      email,
      password_hash,
      avatar_url,
      fallback_initials,
      is_guest,
      created_at
    FROM users
    WHERE email = $1`,
      [dto.email],
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = result.rows[0];

    if (user.password_hash === 'FIREBASE_OAUTH_ACCOUNT') {
      throw new UnauthorizedException(
        'This account was created using Google Sign-In. Please log in with Google.',
      );
    }

    const passwordMatch = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password_hash: _passwordHash, ...safeUser } = user;
    const token = this.generateToken(user.id, user.email);

    return {
      user: safeUser,
      token,
    };
  }

  async firebaseLogin(dto: FirebaseLoginDto) {
    const existing = await this.db.query<UserRow>(
      `SELECT
        id,
        name,
        email,
        avatar_url,
        fallback_initials,
        is_guest,
        created_at
      FROM users
      WHERE email = $1`,
      [dto.email],
    );

    let user: Omit<UserRow, 'password_hash'>;

    if (existing.rows.length > 0) {
      user = existing.rows[0];

      if (dto.avatar_url && user.avatar_url !== dto.avatar_url) {
        const updateResult = await this.db.query<UserRow>(
          `UPDATE users 
           SET avatar_url = $1 
           WHERE id = $2 
           RETURNING id, name, email, avatar_url, fallback_initials, is_guest, created_at`,
          [dto.avatar_url, user.id],
        );
        user = updateResult.rows[0];
      }
    } else {
      const initials = this.getInitials(dto.name);
      const result = await this.db.query<UserRow>(
        `INSERT INTO users (
          name,
          email,
          password_hash,
          avatar_url,
          fallback_initials,
          is_guest
        )
        VALUES ($1, $2, 'FIREBASE_OAUTH_ACCOUNT', $3, $4, false)
        RETURNING
          id,
          name,
          email,
          avatar_url,
          fallback_initials,
          is_guest,
          created_at`,
        [dto.name, dto.email, dto.avatar_url || null, initials],
      );

      user = result.rows[0];
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user,
      token,
    };
  }

  private generateToken(id: string, email: string): string {
    return jwt.sign(
      {
        sub: id,
        email,
      },
      this.jwtSecret,
      {
        expiresIn: '7d',
      },
    );
  }

  private getInitials(name: string): string {
    return (
      name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'DX'
    );
  }
}
