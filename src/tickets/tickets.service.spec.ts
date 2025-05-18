import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { Event } from '../events/event.entity';
import { Repository, EntityManager } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketStatus } from './ticket-status.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// Mock implementations for repositories
const mockTicketRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
    findOne: jest.fn(),
  manager: { // Mock the manager and its transaction method
    transaction: jest.fn(),
  },
};

const mockEventRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

// Mock data
const mockEventId = uuidv4();
const mockTicketId = uuidv4();

const mockBaseEvent: Event = {
  id: mockEventId,
  name: 'Test Event',
  description: 'Test Description',
  date: new Date(),
  location: 'Test Location',
  totalTicketCapacity: 10,
  ticketsSold: 0,
  tickets: [],
  createdAt: new Date(),
};

describe('TicketsService', () => {
  let service: TicketsService;
  let ticketRepository: Repository<Ticket>;
  let eventRepository: Repository<Event>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: mockTicketRepository,
        },
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepository,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    ticketRepository = module.get<Repository<Ticket>>(getRepositoryToken(Ticket));
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));

    // Reset mocks before each test
    jest.clearAllMocks();

    // Default mock for transaction
    mockTicketRepository.manager.transaction.mockImplementation(async (cb) => {
      const mockTransactionalEntityManager = {
        save: jest.fn().mockImplementation(entity => Promise.resolve(entity)), // Mock save within transaction
      };
      return cb(mockTransactionalEntityManager);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTicket', () => {
    const createTicketDto: CreateTicketDto = {
      eventId: mockEventId,
      ticketOwnerName: 'John Doe',
      price: 25.99,
    };

    const mockCreatedTicket = {
      id: mockTicketId,
      event: mockBaseEvent, 
      ticketCode: expect.any(String),
      status: TicketStatus.AVAILABLE,
      ticketOwnerName: createTicketDto.ticketOwnerName,
      price: createTicketDto.price,
      purchaseDate: expect.any(Date),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    };

    it('should successfully create a ticket', async () => {
      const eventWithCapacity = { ...mockBaseEvent, ticketsSold: 0, totalTicketCapacity: 5 };
      mockEventRepository.findOne.mockResolvedValue(eventWithCapacity);
      mockTicketRepository.create.mockImplementation(ticketData => ({
        ...ticketData,
        id: mockTicketId, // Simulate ID generation after create
        status: TicketStatus.AVAILABLE,
        purchaseDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const result = await service.createTicket(createTicketDto);

      expect(mockEventRepository.findOne).toHaveBeenCalledWith({ where: { id: mockEventId } });
      expect(mockTicketRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        event: eventWithCapacity, 
        ticketOwnerName: createTicketDto.ticketOwnerName,
        price: createTicketDto.price,
        ticketCode: expect.any(String),
        status: TicketStatus.AVAILABLE,
      }));

      // Check that transaction was called
      expect(mockTicketRepository.manager.transaction).toHaveBeenCalled();

      expect(result.ticketCode).toBeDefined();
      expect(result.status).toEqual(TicketStatus.AVAILABLE);
      expect(result.ticketOwnerName).toEqual(createTicketDto.ticketOwnerName);
    });

    it('should throw NotFoundException if event does not exist', async () => {
      mockEventRepository.findOne.mockResolvedValue(null);

      await expect(service.createTicket(createTicketDto)).rejects.toThrow(NotFoundException);
      await expect(service.createTicket(createTicketDto)).rejects.toThrow(`Event with ID ${mockEventId} not found`);
      expect(mockTicketRepository.create).not.toHaveBeenCalled();
      expect(mockTicketRepository.manager.transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if event has no available tickets (capacity full)', async () => {
      const soldOutEvent = { ...mockBaseEvent, ticketsSold: 5, totalTicketCapacity: 5 };
      mockEventRepository.findOne.mockResolvedValue(soldOutEvent);

      await expect(service.createTicket(createTicketDto)).rejects.toThrow(BadRequestException);
      await expect(service.createTicket(createTicketDto)).rejects.toThrow('No available tickets for this event');
      expect(mockTicketRepository.create).not.toHaveBeenCalled();
      expect(mockTicketRepository.manager.transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if transaction fails', async () => {
        const eventWithCapacity = { ...mockBaseEvent, ticketsSold: 0, totalTicketCapacity: 5 };
        mockEventRepository.findOne.mockResolvedValue(eventWithCapacity);
        mockTicketRepository.create.mockImplementation(ticketData => ({ ...ticketData, id: mockTicketId }));

        // Override the transaction mock to simulate a failure
        mockTicketRepository.manager.transaction.mockImplementation(async (cb) => {
            const mockTransactionalEntityManager = {
              save: jest.fn().mockRejectedValue(new Error("DB error")), // Simulate save error
            };
            // Execute the callback, which will then try to save and fail
            await cb(mockTransactionalEntityManager);
        });

        await expect(service.createTicket(createTicketDto)).rejects.toThrow(BadRequestException);
        await expect(service.createTicket(createTicketDto)).rejects.toThrow('Could not create ticket');
    });

    it('should assign a unique ticketCode to the new ticket', async () => {
        const eventWithCapacity = { ...mockBaseEvent, ticketsSold: 0, totalTicketCapacity: 5 };
        mockEventRepository.findOne.mockResolvedValue(eventWithCapacity);

        mockTicketRepository.create.mockImplementation(ticketData => {
            return {
                ...ticketData, 
                id: mockTicketId,
                status: TicketStatus.AVAILABLE,
                purchaseDate: new Date(), createdAt: new Date(), updatedAt: new Date(),
            };
        });

        const result = await service.createTicket(createTicketDto);
        expect(result.ticketCode).toBeDefined();
        expect(typeof result.ticketCode).toBe('string');
    });

    it('should set the ticket status to AVAILABLE', async () => {
        const eventWithCapacity = { ...mockBaseEvent, ticketsSold: 0, totalTicketCapacity: 5 };
        mockEventRepository.findOne.mockResolvedValue(eventWithCapacity);
        mockTicketRepository.create.mockImplementation(ticketData => ({
            ...ticketData, id: mockTicketId, purchaseDate: new Date(), createdAt: new Date(), updatedAt: new Date(),
        }));


        const result = await service.createTicket(createTicketDto);
        expect(result.status).toEqual(TicketStatus.AVAILABLE);
    });
  });

  describe('findAllTickets', () => {
    it('should return an array of tickets', async () => {
        const mockTicketsArray = [{ id: '1', ticketCode: 'T1' }, { id: '2', ticketCode: 'T2' }] as Ticket[];
        mockTicketRepository.find = jest.fn().mockResolvedValue(mockTicketsArray);

        const result = await service.findAllTickets();
        expect(mockTicketRepository.find).toHaveBeenCalledWith({ relations: ['event'] });
        expect(result).toEqual(mockTicketsArray);
    });
  });

  describe('findTicketById', () => {
    it('should return a ticket if found', async () => {
        const mockFoundTicket = { id: mockTicketId, ticketCode: 'T123' } as Ticket;
        mockTicketRepository.findOne = jest.fn().mockResolvedValue(mockFoundTicket);

        const result = await service.findTicketById(mockTicketId);
        expect(mockTicketRepository.findOne).toHaveBeenCalledWith({ where: { id: mockTicketId }, relations: ['event'] });
        expect(result).toEqual(mockFoundTicket);
    });

    it('should throw NotFoundException if ticket not found', async () => {
        mockTicketRepository.findOne = jest.fn().mockResolvedValue(null);
        await expect(service.findTicketById(mockTicketId)).rejects.toThrow(NotFoundException);
    });
  });
});