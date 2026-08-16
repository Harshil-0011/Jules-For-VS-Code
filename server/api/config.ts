import { z } from 'zod';

export const ConfigSchema = z.object({
  port: z.number().default(3000),
  dbPath: z.string().default('./jules_platform.db'),
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  julesApiKey: z.string().optional().default('mock-jules-key'),
  julesApiUrl: z.string().url().default('https://jules.googleapis.com/v1alpha'),
  githubToken: z.string().optional().default('mock-github-token'),
  jwtSecret: z.string().default('super-secret-default-key-change-in-prod'),
  emergencyStop: z.boolean().default(false),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(overrides: Partial<Config> = {}): Config {
  const envConfig = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
    dbPath: process.env.DB_PATH,
    nodeEnv: process.env.NODE_ENV as any,
    julesApiKey: process.env.JULES_API_KEY,
    julesApiUrl: process.env.JULES_API_URL,
    githubToken: process.env.GITHUB_TOKEN,
    jwtSecret: process.env.JWT_SECRET,
    emergencyStop: process.env.EMERGENCY_STOP === 'true',
  };

  const filteredEnv = Object.fromEntries(
    Object.entries(envConfig).filter(([_, v]) => v !== undefined)
  );

  return ConfigSchema.parse({ ...filteredEnv, ...overrides });
}
