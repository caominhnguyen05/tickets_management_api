import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsUUID()
  eventId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ticketOwnerName?: string;
}