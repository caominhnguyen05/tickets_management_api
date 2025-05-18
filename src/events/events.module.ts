import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Event} from './event.entity';

// This module is responsible for managing events in the ticket management system.
// It imports the TypeOrmModule for the Event entity, allowing for database operations related to events.
@Module({
    imports: [TypeOrmModule.forFeature([Event])],
    controllers: [],
    providers: [],
    exports: [TypeOrmModule],
})

export class EventsModule {}