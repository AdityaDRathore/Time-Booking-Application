import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Time Booking API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for the lab time booking system.',
      contact: {
        name: 'Time Booking Dev Team',
        url: 'https://github.com/your-repo',
        email: 'support@yourdomain.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        csrfAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'XSRF-TOKEN',
          description: 'CSRF token must match the XSRF-TOKEN cookie set by GET /csrf-token',
        },
      },
      schemas: {
        // COMMON
        ErrorResponse: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Bad Request' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
          },
        },

        // USER
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateUser: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
            role: { type: 'string' },
          },
        },

        // LAB
        CreateLab: {
          type: 'object',
          required: ['name', 'location'],
          properties: {
            name: { type: 'string' },
            location: { type: 'string' },
            capacity: { type: 'integer' },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
            },
          },
        },

        // BOOKING
        CreateBookingInput: {
          type: 'object',
          required: ['userId', 'slotId'],
          properties: {
            userId: { type: 'string' },
            slotId: { type: 'string' },
            purpose: { type: 'string' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            slotId: { type: 'string' },
            purpose: { type: 'string' },
            status: {
              type: 'string',
              enum: ['confirmed', 'cancelled'],
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // NOTIFICATION
        SendNotificationInput: {
          type: 'object',
          required: ['userId', 'title', 'message'],
          properties: {
            userId: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // WAITLIST
        JoinWaitlistInput: {
          type: 'object',
          required: ['userId', 'slotId'],
          properties: {
            userId: { type: 'string' },
            slotId: { type: 'string' },
          },
        },
        WaitlistEntry: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            slotId: { type: 'string' },
            position: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // TIMESLOT
        CreateTimeSlotInput: {
          type: 'object',
          required: ['labId', 'startTime', 'endTime'],
          properties: {
            labId: { type: 'string' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
          },
        },
        TimeSlot: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            labId: { type: 'string' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
          },
        },

        // CSRF TOKEN RESPONSE
        CsrfTokenResponse: {
          type: 'object',
          properties: {
            csrfToken: {
              type: 'string',
              example: 'kP2Xn14F35r4Ijdf6lD3...'
            }
          }
        }
      },
    },
    security: [
      { bearerAuth: [] },
      { csrfAuth: [] },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication routes' },
      { name: 'User', description: 'User profile and role operations' },
      { name: 'Lab', description: 'Lab management and availability' },
      { name: 'Booking', description: 'Booking-related actions' },
      { name: 'Waitlist', description: 'Waitlist operations' },
      { name: 'Notification', description: 'Notification preferences and messages' },
      { name: 'TimeSlot', description: 'Slot creation and availability' },
      { name: 'Utility', description: 'System utilities like health check' },
      { name: 'Test', description: 'CSRF and security verification routes' },
    ],
  },
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
