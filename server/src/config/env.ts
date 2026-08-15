// server/src/config/env.ts
import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'Gemini API key is required'),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MAX_REQUEST_SIZE: z.string().default('1mb'),
  RATE_LIMIT_WINDOW_MS: z.string().default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('30'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = {
  gemini: {
    apiKey: parsedEnv.data.GEMINI_API_KEY,
    model: parsedEnv.data.GEMINI_MODEL,
  },
  server: {
    port: parseInt(parsedEnv.data.PORT, 10),
    nodeEnv: parsedEnv.data.NODE_ENV,
    maxRequestSize: parsedEnv.data.MAX_REQUEST_SIZE,
    rateLimit: {
      windowMs: parseInt(parsedEnv.data.RATE_LIMIT_WINDOW_MS, 10),
      maxRequests: parseInt(parsedEnv.data.RATE_LIMIT_MAX_REQUESTS, 10),
    },
  },
};