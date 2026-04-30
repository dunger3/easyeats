import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../entities';

export class UpdateUserDto {

  @IsOptional() 
  @IsEmail() 
  email?: string;

  @IsOptional() 
  @IsString() 
  name?: string;

  @IsOptional() 
  @IsIn(['customer', 'admin']) 
  role?: UserRole;
}
