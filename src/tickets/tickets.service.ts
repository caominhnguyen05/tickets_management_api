import {Injectable, NotFoundException, BadRequestException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Ticket} from './ticket.entity';
import {Event} from '../events/event.entity';
import {TicketStatus} from './ticket-status.enum';
import {CreateTicketDto} from './dto/create-ticket.dto';
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
    ) {}

    async createTicket(createTicketDto: CreateTicketDto): Promise<Ticket> {
        const {eventId, ticketOwnerName, price } = createTicketDto;

        // Check if the event exists
        const event = await this.eventRepository.findOne({where: {id: eventId}});
        if (!event) {
            throw new NotFoundException(`Event with ID ${eventId} not found`);
        }

        // Check if event has capacity
        if (event.ticketsSold >= event.totalTicketCapacity) {
            throw new BadRequestException('No available tickets for this event');
        }

        // Create a new ticket
        const ticket = this.ticketRepository.create({
            event,
            ticketOwnerName,
            price,
            ticketCode: uuidv4(), // Generate a unique ticket code
            status: TicketStatus.AVAILABLE, // Set the initial status to AVAILABLE
        });

        // Save the ticket and update the event's tickets sold count (in a trasaction for atomicity)
        try {
            await this.ticketRepository.manager.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.save(ticket);
            event.ticketsSold += 1;
            await transactionalEntityManager.save(event);
            });
        } catch (error) {
            console.error('Transaction failed:', error);
            throw new BadRequestException('Could not create ticket');
        }

        return ticket;
    }

    // This method retrieves all tickets from the database.
    // It returns an array of Ticket objects, each containing information about the ticket and its associated event.
    async findAllTickets(): Promise<Ticket[]> {
        return this.ticketRepository.find({ relations: ['event'] });
    }

    // This method retrieves a ticket by its ID from the database.
    async findTicketById(id: string): Promise<Ticket> {
        const ticket = await this.ticketRepository.findOne({ where: { id }, relations: ['event'] });
        if (!ticket) {
            throw new NotFoundException(`Ticket with ID ${id} not found`);
        }
        return ticket;
    }
}