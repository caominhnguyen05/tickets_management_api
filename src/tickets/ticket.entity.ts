import { Event } from '../events/event.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TicketStatus } from './ticket-status.enum';

@Entity('tickets')
export class Ticket {
    // The unique identifier for the ticket
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // The event associated with this ticket
    // This establishes a many-to-one relationship with the Event entity
    @ManyToOne(() => Event, (event) => event.tickets, { eager: false })
    @JoinColumn({ name: 'eventId' })
    event: Event;

    // The ticket code, this is what will be on the QR code/barcode and used for validation
    // This field is unique to ensure that no two tickets have the same code
    @Column({ unique: true })
        ticketCode: string;

    // The status of the ticket
    // This uses an enum to define the possible statuses of a ticket
    @Column({ 
        type: 'text', 
        enum: TicketStatus, 
        default: TicketStatus.AVAILABLE })
    status: TicketStatus;

    @Column({ nullable: true })
    ticketOwnerName?: string;

    @Column({ type: 'int', default: 0 })
    price: number;

    // The date when the ticket was purchased
    @CreateDateColumn()
    purchaseDate: Date;

    // The date when the ticket was validated
    // This field is nullable, as it may not be applicable for all tickets
    @Column({type: 'datetime', nullable: true})
    validationDate?: Date | null;

    @CreateDateColumn()
    createdAt: Date;
}