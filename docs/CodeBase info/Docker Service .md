# Setup Instructions

## Initial Setup

1. Clone the repository and navigate to project root
2. Create .env file with appropriate configurations
3. Build and start Docker containers:

```
# Build and start all containers
npm run docker:build
npm run docker:up

# If this is first time setup, run migrations
npm run db:migrate

# check logs
npm run docker:logs

# Optionally seed the database
npm run db:seed

# To stop containers
npm run docker:down
```

## Accessing Services

1. Backend API: http://localhost:4000/api
2. Frontend App: http://localhost:3000
3. Prisma Studio: http://localhost:5555
4. MailHog UI: http://localhost:8025


## Development Workflow

1. Make changes to the code
2. Changes are automatically detected and applied due to volume mounts
3. Backend uses ts-node-dev for TypeScript hot reloading
4. Frontend uses Vite's hot module replacement

## Database Management

1. View Database: Access Prisma Studio at http://localhost:5555
2. Run Migrations: npm run db:migrate
3. Reset Database: npm run db:reset

## Troubleshooting

1. View Logs: npm run docker:logs
2. Restart Services: docker-compose restart [service-name]
3. Rebuild Containers: npm run docker:rebuild

# Docker Compose Extensions

For team members with different development needs, additional configurations are available:

```
// filepath: /workspaces/Time-Booking-Application/.devcontainer/devcontainer.json
{
  "name": "Time Booking App Dev Environment",
  "dockerComposeFile": [
    "../docker-compose.yml", 
    "docker-compose.extend.yml"
  ],
  "service": "backend",
  "workspaceFolder": "/app",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-typescript-next",
        "Prisma.prisma",
        "graphql.vscode-graphql"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.codeActionsOnSave": {
          "source.fixAll.eslint": true
        }
      }
    }
  },
  "forwardPorts": [3000, 4000, 5432, 6379, 5555, 8025],
  "postCreateCommand": "npm install"
}
```

## Development with Local Database

For developers who prefer to run only the database containers and run the app locally:

```
# filepath: /workspaces/Time-Booking-Application/docker-compose.db.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: tb-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
      POSTGRES_DB: ${POSTGRES_DB:-time_booking}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - tb-network

  redis:
    image: redis:7-alpine
    container_name: tb-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-redispassword}
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
    networks:
      - tb-network

  mailhog:
    image: mailhog/mailhog:latest
    container_name: tb-mailhog
    ports:
      - "${MAILHOG_SMTP_PORT:-1025}:1025"
      - "${MAILHOG_UI_PORT:-8025}:8025"
    networks:
      - tb-network

networks:
  tb-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

