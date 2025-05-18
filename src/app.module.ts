import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsModule } from './tickets/tickets.module'; 
import { EventsModule } from './events/events.module';   
import { Event } from './events/event.entity';           
import { Ticket } from './tickets/ticket.entity';      

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'ticket_management.sqlite',
      entities: [Event, Ticket],
      synchronize: true,
    }),
    EventsModule,
    TicketsModule
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
