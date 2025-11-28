import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  appEnv: string;
  databaseUrl: string | undefined;
  apiAuthToken: string | undefined;
  port: number;
}
export const config: Config = {
  appEnv: process.env.APP_ENV || 'production',
  databaseUrl: process.env.DATABASE_URL,
  apiAuthToken: process.env.API_AUTH_TOKEN,
  port: parseInt(process.env.PORT || '8000'),
};

