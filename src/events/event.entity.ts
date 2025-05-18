import {Ticket} from '../tickets/ticket.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
    CreateDateColumn,
  OneToMany,
} from 'typeorm';

/*
This code defines an Event entity for the ticket management system using TypeORM.
The Event entity has the following properties:
- id: A unique identifier for the event, generated automatically as a UUID.
- name: The name of the event.
- date: The date of the event.
- location: The location of the event.
- description: A description of the event.
- totalTicketCapacity: The total number of tickets available for the event, defaulting to 0.
- ticketsSold: The number of tickets sold for the event, defaulting to 0.
- tickets: A one-to-many relationship with the Ticket entity, representing the tickets associated with the event.
- createdAt: A timestamp indicating when the event was created
*/
@Entity('events')
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    date: Date;

    @Column()
    location: string;

    @Column()
    description: string;

    @Column({ type: 'int', default: 0 })
    totalTicketCapacity: number;

    @Column({ type: 'int', default: 0 })
    ticketsSold: number;

    @OneToMany(() => Ticket, ticket => ticket.event)
    tickets: Ticket[];

    @CreateDateColumn()
    createdAt: Date;

}