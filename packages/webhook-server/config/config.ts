import { Configuration } from '@curvegrid/multibaas-sdk';
import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
  mbConfig: Configuration;
}

const config: Config = {
  port: Number(process.env.PORT) || 3001,
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  mbConfig: new Configuration({
    basePath: new URL(
      '/api/v0',
      process.env.MULTIBAAS_DEPLOYMENT_URL || ''
    ).toString(),
    accessToken: process.env.MULTIBAAS_SECRET_KEY,
  }),
};

export default config;
