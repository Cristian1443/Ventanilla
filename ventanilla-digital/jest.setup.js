// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Polyfills para Node.js
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: "/",
      query: {},
      asPath: "/",
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock NextAuth
jest.mock("@/auth", () => ({
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock environment variables
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.AUTH_SECRET = "test-secret";
process.env.AUTH_MICROSOFT_ENTRA_ID_ID = "test-client-id";
process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET = "test-secret";
process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID = "test-tenant-id";
