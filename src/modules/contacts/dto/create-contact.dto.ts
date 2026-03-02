import { IsString, Matches, IsOptional, IsUrl } from 'class-validator';

export class CreateContactDto {
  @Matches(/^\+\d{10,15}$/, { message: 'phone_number must be a valid international phone number' })
  phone_number: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsUrl()
  avatar_url?: string;
}
