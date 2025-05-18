import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket } from './ticket.entity';
import { Event } from '../events/event.entity'; 
import { TicketStatus } from './ticket-status.enum'; 
import { v4 as uuidv4 } from 'uuid';
import { NotFoundException } from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common'; 

const mockTicketService = {
    createTicket: jest.fn(),
    findAllTickets: jest.fn(),
    findTicketById: jest.fn(),
}

// Mock data
const mockEventId = uuidv4();
const mockTicketId = uuidv4();

const mockEvent: Event = {
    id: mockEventId,
    name: 'Mock Event',
    date: new Date(),
    location: 'Mock Location',
    description: 'Mock Description',
    totalTicketCapacity: 50,
    ticketsSold: 0,
    tickets: [],
    createdAt: new Date(),
}

const mockTicket: Ticket = {
    id: mockTicketId,
    event: mockEvent,
    ticketCode: uuidv4(),
  status: TicketStatus.AVAILABLE,
  ticketOwnerName: 'John Doe',
  price: 25.00,
  purchaseDate: new Date(),
  createdAt: new Date(),
  validationDate: null,
}

describe('TicketsController', () => {
    let controller: TicketsController;
    let service: TicketsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TicketsController],
            providers: [
                {
                    provide: TicketsService,
                    useValue: mockTicketService, // Use the mock implementation
                },
            ],
        }).compile();
        controller = module.get<TicketsController>(TicketsController);
        service = module.get<TicketsService>(TicketsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createTicket', () => {
        it('should create and return a ticket', async () => {
            const createTicketDto: CreateTicketDto = {
                eventId: mockEventId,
                ticketOwnerName: 'Jane',
                price: 30.00,
            };

            // When the createTicket method is called, it should return the mock ticket instead of calling the actual service
            mockTicketService.createTicket.mockResolvedValue(mockTicket);
            const result = await controller.create(createTicketDto);

            expect(result).toEqual(mockTicket);
            expect(service.createTicket).toHaveBeenCalledWith(createTicketDto);
        });
    });

    describe('findAllTickets', () => {
        it('should return an array of tickets', async () => {
            const mockTickets = [mockTicket];
            mockTicketService.findAllTickets.mockResolvedValue(mockTickets);

            const result = await controller.findAll();

            expect(result).toEqual(mockTickets);
            expect(service.findAllTickets).toHaveBeenCalled();
        });
    });

    describe('findTicketById', () => {
        it('should return a ticket by ID', async () => {
            mockTicketService.findTicketById.mockResolvedValue(mockTicket);

            const result = await controller.findOne(mockTicketId);

            expect(result).toEqual(mockTicket);
            expect(service.findTicketById).toHaveBeenCalledWith(mockTicketId);
        }
        );

        it('should throw NotFoundException if ticket not found', async () => {
            mockTicketService.findTicketById.mockRejectedValue(new NotFoundException());

            await expect(controller.findOne(mockTicketId)).rejects.toThrow(
                NotFoundException,
            );
            expect(service.findTicketById).toHaveBeenCalledWith(mockTicketId);
        });
    })
});