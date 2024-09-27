# Digital Wallet Microservices Backend

This project is a **Digital Wallet Backend** implemented using a microservices architecture. The backend is built with Node.js, Express, TypeScript, Docker, and Lerna. 
It includes multiple services such as user management, transactions, payments, notifications, and KYC, all organized into a monorepo structure.

## Table of Contents

- [Project Structure](#project-structure)
- [Services](#services)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)

## Project Structure

This project is structured as a monorepo managed by **Lerna** and **npm workspaces**. It includes two main workspaces:

- **`services/`**: Contains all the microservices such as user-service, account-service, transaction-service, etc.
- **`shared/`**: Contains shared packages such as DTOs, utility functions, and other reusable code. <br>  <br>
├── services/ <br>
│   ├── user-service/ <br>
│   ├── account-service/ <br>
│   ├── transaction-service/ <br>
│   ├── payment-service/ <br>
│   ├── notification-service/ <br>
│   └── kyc-service/ <br>
├── shared/ <br>
│   ├── shared-common/ <br>
│   ├── shared-notification/ <br>
│   ├── shared-account-payment/ <br>
│   └── shared-account-transaction/ <br>
├── package.json <br>
├── docker-compose.yml <br>
└── lerna.json <br>


## Services

The following services are included in the project:

- **User Service**: Manages user authentication, profiles, and sessions.
- **Account Service**: Handles account management, including account creation and updates.
- **Transaction Service**: Processes transactions, including deposits and withdrawals.
- **Payment Service**: Integrates with payment gateways to handle payments.
- **Notification Service**: Sends notifications via email.
- **KYC Service**: Handles Know Your Customer (KYC) compliance for user verification.

## Tech Stack

- **Node.js**: Backend runtime.
- **TypeScript**: Typed superset of JavaScript.
- **Express**: Web framework for Node.js.
- **MongoDB**: NoSQL database for data persistence.
- **Docker**: Containerization of services.
- **Lerna**: Monorepo management for handling workspaces.
- **npm Workspaces**: Dependency management for services and shared packages.

## Installation

### Prerequisites

Make sure you have the following installed:

- **Node.js (v20.x.x or higher)**
- **Docker** and **Docker Compose**
- **Lerna**

### Clone the Repository
```bash
git clone https://github.com/your-repo/digital-wallet-backend.git
cd digital-wallet-backend
```

### Install Dependencies

With Lerna, dependencies installed at the root package are hoisted to every service
and shared package including types and linters. All scripts that have the same name
in each service or shared folder will also be ran when called in the root, allowing
simultaneous building and starting of the packages.
```
npm install
npm run build
npm run start
```

## Docker Setup

Each service has its own Dockerfile for building and running the container. The Docker Compose file (docker-compose.yml) orchestrates the services together. 
Here's a breakdown of the setup:

- Docker Compose: Used to run all services in a containerized environment.
- Volumes: Code is mounted via volumes to allow real-time changes during development.
- Service Ports: Each service is exposed on a different port for easy access.

### Running the Services

To run the entire stack locally using Docker Compose:
```
docker-compose up --build
```

This will build and start all services and dependencies (e.g. Mailhog).

### Accessing the Services

Each service runs on a specific port and is forwarded to the local machine:

- User Service: http://localhost:3001
- Account Service: http://localhost:3002
- Transaction Service: http://localhost:3003
- Payment Service: http://localhost:3004
- KYC Service: http://localhost:3005
- Notification Service: http://localhost:3006

### Stopping the Services
```
docker-compose down
```

## Environment Variables

### Core Variables

Each service contains different environment variables depending on what it requires. The common requirements for each service
includes the following variables:
```
PORT=port_number 
MONGO_URI=your_mongo_uri
LOG_LEVEL=info
NODE_ENV=development
```

The user service requires a few extra secret variables for handling authentication:
```
JWT_SECRET=your_jwt_secret
SERVICE_COMMUNICATION_SECRET=your_internal_service_comms_secret
```

Additionally, the notification service uses a shared secret between the user and notification service for internal communication,
so this should match the communication secret from the user service environment variables:
```
SERVICE_COMMUNICATION_SECRET=same_secret_as_user_service
```

The payment service uses Stripe for handling payments and will require you to have a Stripe account and its secret API key:
```
STRIPE_SECRET=your_stripe_secret_key
```

### Docker Variables

When running the application using Docker, it is crucial to add extra environment variables for the host names of each service,
which are essentially just the name of the service from your Docker Compose file. These can be commented out or removed when 
you're not running the application using Docker.

The user service .env file will require the following:
```
NOTIFICATION_SERVICE_URL=notification-service
```

The account service .env file will require the following:
```
USER_SERVICE_URL=user-service
TRANSACTION_SERVICE_URL=transaction-service
PAYMENT_SERVICE_URL=payment-service
NOTIFICATION_SERVICE_URL=notification-service
```

The kyc service .env file will require the following:
```
USER_SERVICE_URL=user-service
NOTIFICATION_SERVICE_URL=notification-service
```

The notification service .env file will require the following:
```
MAILHOG_URL=mailhog
USER_SERVICE_URL=user-service
```

The payment and transaction services will require the following:
```
USER_SERVICE_URL=user-service
```

Without these variables, the hostnames will default to 'localhost' which will not work in Docker as each service is setup
to have its own container. For each service to communicate with each other in Docker, it will need to use the service name
as the host name.





