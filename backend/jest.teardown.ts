// backend/jest.teardown.ts
import { disconnectDB } from './src/tests/helpers/testSeeder';

export default async function globalTeardown() {
  console.log('🧹 Global teardown: Disconnecting Prisma...');
  await disconnectDB();
}
