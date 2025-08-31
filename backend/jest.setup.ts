// backend/jest.setup.ts
import path from 'path';
import dotenv from 'dotenv';
import { setupTestDB } from './src/tests/helpers/testSeeder';

dotenv.config({ path: path.resolve(__dirname, '.env.test') }); // ✅ Load .env.test

export default async function globalSetup() {
  console.log('🚀 Global setup: Loading test env and seeding DB...');
  await setupTestDB(); // ✅ Seed DB once before all tests
}
