import dotenv from 'dotenv';
import Joi from 'joi';

// Load environment variables
dotenv.config();

// Configuration schema validation
const configSchema = Joi.object({
  // Smart Fan Configuration
  FAN_IP: Joi.string().ip().required(),
  FAN_PORT: Joi.number().port().required(),

  // Logging Configuration
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_FILE: Joi.string().default('logs/app.log'),

  // Server Configuration
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),

  // UDP Configuration
  UDP_TIMEOUT: Joi.number().positive().default(5000),
  UDP_RETRY_ATTEMPTS: Joi.number().integer().min(1).max(10).default(3),
});

// Environment variables with defaults
const envConfig = {
  FAN_IP: process.env['FAN_IP'] || '192.168.1.13',
  FAN_PORT: parseInt(process.env['FAN_PORT'] || '5600', 10),
  LOG_LEVEL: process.env['LOG_LEVEL'] || 'info',
  LOG_FILE: process.env['LOG_FILE'] || 'logs/app.log',
  NODE_ENV: process.env['NODE_ENV'] || 'development',
  PORT: parseInt(process.env['PORT'] || '3000', 10),
  UDP_TIMEOUT: parseInt(process.env['UDP_TIMEOUT'] || '5000', 10),
  UDP_RETRY_ATTEMPTS: parseInt(process.env['UDP_RETRY_ATTEMPTS'] || '3', 10),
};

// Validate configuration
const { error, value: config } = configSchema.validate(envConfig);

if (error) {
  throw new Error(`Configuration validation error: ${error.message}`);
}

export default config;
