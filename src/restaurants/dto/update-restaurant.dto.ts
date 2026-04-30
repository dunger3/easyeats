import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRestaurantDto {
  @IsString() 
  @IsNotEmpty() 
  name: string;
  
  @IsString() 
  @IsNotEmpty() 
  address: string;
  
  deleteImage?: string;
}
