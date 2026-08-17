import { IsNotEmpty, IsString } from 'class-validator';

export class AddCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Comment cannot be empty' })
  comment!: string;
}