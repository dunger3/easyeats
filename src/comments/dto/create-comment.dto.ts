import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString() 
  @IsNotEmpty() 
  name: string;

  @IsString() 
  @IsNotEmpty() 
  comment: string;

  @IsString() 
  captcha_token: string;

  @IsString() 
  captcha_code: string;
}
