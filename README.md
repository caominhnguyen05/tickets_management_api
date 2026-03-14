## Ticket management API

A RESTful API for managing event tickets, built with the NestJS framework.
The API allows clients to create, retrieve, and validate tickets for events, while maintaining ticket counts associated with each event.

The project demonstrates backend development concepts such as:

- RESTful API design
- Input validation and error handling
- Database integration using SQLite
- Modular architecture with NestJS
- API testing using Postman
- Automated testing with unit and end-to-end tests

The API automatically updates the number of tickets sold for an event whenever a new ticket is created.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Endpoints test with Postman
I have manually added an event record in the the SQLite database which I use in the dndpoints below.
### POST /tickets
Creates a new ticket.
![alt text](image.png)

### GET /tickets
Retrieve all tickets in the database.

The number of tickets sold for the event has also been updated.
![alt text](image-1.png)

### GET /tickets/:id
Retrieve a ticket by ID.
![alt text](image-2.png)

### POST - Create ticket with missing field
![alt text](image-4.png)

### POST - Create ticket with non-existent eventId
![alt text](image-5.png)

### GET - Get ticket with invalid ID format
![alt text](image-6.png)
