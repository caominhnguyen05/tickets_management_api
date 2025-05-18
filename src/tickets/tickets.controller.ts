import { Controller, Post, Body, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket } from './ticket.entity';

/*
This controller handles HTTP requests related to tickets in the ticket management system.
It provides endpoints for creating a new ticket, retrieving all tickets, and retrieving a specific ticket by its ID.
*/
@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}

    // POST /tickets
    // This endpoint creates a new ticket.
    @Post()
    create(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
        return this.ticketsService.createTicket(createTicketDto);
    }

    // GET /tickets
    // This endpoint retrieves all tickets.
    @Get()
    findAll(): Promise<Ticket[]> {
        return this.ticketsService.findAllTickets();
    }

    // GET /tickets/:id
    // This endpoint retrieves a specific ticket by its ID.
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Ticket> {
        return this.ticketsService.findTicketById(id);
    }
}