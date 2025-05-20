/**
 * Configuration for seed data quantities based on environment
 */

export type SeedConfig = {
  users: {
    regular: number;
    admins: number;
  };
  organizations: number;
  labsPerOrg: number;
  timeSlotsPerLab: number;
  bookingsPerUser: number;
  waitlistsPerUser: number;
  notificationsPerUser: number;
  orgNotificationsPerOrg: number;
};

const developmentConfig: SeedConfig = {
  users: {
    regular: 5,
    admins: 3
  },
  organizations: 3,
  labsPerOrg: 2,
  timeSlotsPerLab: 8,   // 2 days x 4 slots per day
  bookingsPerUser: 2,
  waitlistsPerUser: 1,
  notificationsPerUser: 3,
  orgNotificationsPerOrg: 2
};

const testConfig: SeedConfig = {
  users: {
    regular: 2,
    admins: 1
  },
  organizations: 1,
  labsPerOrg: 1,
  timeSlotsPerLab: 4,   // 1 day x 4 slots
  bookingsPerUser: 1,
  waitlistsPerUser: 1,
  notificationsPerUser: 1,
  orgNotificationsPerOrg: 1
};

const productionConfig: SeedConfig = {
  users: {
    regular: 0,
    admins: 0
  },
  organizations: 0,
  labsPerOrg: 0,
  timeSlotsPerLab: 0,
  bookingsPerUser: 0,
  waitlistsPerUser: 0,
  notificationsPerUser: 0,
  orgNotificationsPerOrg: 0
};

export function getSeedConfig(): SeedConfig {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'test':
      return testConfig;
    case 'production':
      return productionConfig;
    case 'development':
    default:
      return developmentConfig;
  }
}