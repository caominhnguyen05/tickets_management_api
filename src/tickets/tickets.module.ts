import {Module} from '@nestjs/common';
import { TypeOrmModule} from '@nestjs/typeorm';
import {Ticket} from './ticket.entity';
import {Event} from '../events/event.entity';
import {TicketsController} from './tickets.controller';
import {TicketsService} from './tickets.service';

// This module is responsible for managing tickets in the ticket management system.
// It imports the TypeOrmModule for the Ticket entity, allowing for database operations related to tickets.
@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Event]), // Make repositories available for Ticket and Event
  ],
  providers: [TicketsService],
  controllers: [TicketsController],
})
export class TicketsModule {}
