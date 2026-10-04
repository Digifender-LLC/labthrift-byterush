// Test double for worker/auth.ts; passkey ceremonies are covered by manual acceptance (B02).
import { Hono } from "hono";
export const auth = new Hono();
