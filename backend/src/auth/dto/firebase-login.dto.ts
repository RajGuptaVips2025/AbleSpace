import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FirebaseLoginDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;
}