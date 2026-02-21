import { beforeAll, afterAll, beforeEach } from "vitest";
import { prisma } from "../config/prisma";

// Mock environment variables if needed
process.env.JWT_ACCESS_SECRET = "test-secret-at-least-thirty-two-chars-long";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-at-least-thirty-two-chars-long";
process.env.JWT_ISSUER = "test-issuer";
process.env.JWT_AUDIENCE = "test-audience";
process.env.CORS_ORIGIN = "http://localhost:3000";

beforeAll(async () => {
    // Ensure DB is reachable or mock it
    // For true integration tests, we'd use a test DB.
});

beforeEach(async () => {
    // Clear tables or reset state before each test if using a test DB
});

afterAll(async () => {
    await prisma.$disconnect();
});
