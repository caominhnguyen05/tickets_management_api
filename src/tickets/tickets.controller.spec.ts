import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket } from './ticket.entity';
import { Event } from '../events/event.entity'; // Assuming Event entity path
import { TicketStatus } from './ticket-status.enum'; // Assuming TicketStatus enum path
import { v4 as uuidv4 } from 'uuid';
import { NotFoundException } from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common'; // Needed for testing the pipe usage