import { IsNotEmpty, IsString, IsUUID, IsOptional, IsNumber } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsUUID()
  eventId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ticketOwnerName?: string;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  price?: number;
}