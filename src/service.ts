import dgram from 'dgram';
import config from './config/index.js';
import logger from './utils/logger.js';
import { NetworkError, ValidationError, ERROR_CODES, ERROR_MESSAGES } from './utils/errors.js';
import { validateFanSpeed, validateIpAddress, validatePort } from './utils/validation.js';

// UDP client configuration
const client = dgram.createSocket('udp4');

// Validate configuration on startup
try {
  validateIpAddress(config.FAN_IP);
  validatePort(config.FAN_PORT);
} catch (error) {
  logger.error('Invalid configuration', {
    error,
    config: { FAN_IP: config.FAN_IP, FAN_PORT: config.FAN_PORT },
  });
  throw error;
}

// UDP message interface
interface UdpMessage {
  led?: boolean;
  power?: boolean;
  speed?: number;
}

// Retry wrapper with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = config.UDP_RETRY_ATTEMPTS,
  baseDelay: number = 100
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        logger.error('Max retry attempts exceeded', {
          attempt,
          maxRetries,
          error: lastError.message,
        });
        throw new NetworkError(ERROR_MESSAGES[ERROR_CODES.RETRY_EXHAUSTED]);
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn('Operation failed, retrying', {
        attempt,
        maxRetries,
        delay,
        error: lastError.message,
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Send UDP message with timeout and retry
async function sendUdpMessage(message: UdpMessage): Promise<void> {
  const messageStr = JSON.stringify(message);

  logger.debug('Sending UDP message', { message, target: `${config.FAN_IP}:${config.FAN_PORT}` });

  try {
    await withRetry(async () => {
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new NetworkError(ERROR_MESSAGES[ERROR_CODES.TIMEOUT]));
        }, config.UDP_TIMEOUT);

        client.send(messageStr, config.FAN_PORT, config.FAN_IP, err => {
          clearTimeout(timeout);
          if (err) {
            logger.error('UDP send error', { error: err.message, message: messageStr });
            reject(new NetworkError(ERROR_MESSAGES[ERROR_CODES.UDP_SEND_FAILED]));
          } else {
            logger.debug('UDP message sent successfully', { message: messageStr });
            resolve();
          }
        });
      });
    });
  } catch (error) {
    logger.error('Failed to send UDP message after retries', {
      message,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// LED control functions
export async function turnOnLed(): Promise<void> {
  try {
    logger.info('Turning on LED');
    await sendUdpMessage({ led: true });
    logger.info('LED turned on successfully');
  } catch (error) {
    logger.error('Failed to turn on LED', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function turnOffLed(): Promise<void> {
  try {
    logger.info('Turning off LED');
    await sendUdpMessage({ led: false });
    logger.info('LED turned off successfully');
  } catch (error) {
    logger.error('Failed to turn off LED', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Fan power control functions
export async function turnOnFan(): Promise<void> {
  try {
    logger.info('Turning on fan');
    await sendUdpMessage({ power: true });
    logger.info('Fan turned on successfully');
  } catch (error) {
    logger.error('Failed to turn on fan', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function turnOffFan(): Promise<void> {
  try {
    logger.info('Turning off fan');
    await sendUdpMessage({ power: false });
    logger.info('Fan turned off successfully');
  } catch (error) {
    logger.error('Failed to turn off fan', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Fan speed control function
export async function setFanSpeed(speed: number): Promise<void> {
  try {
    // Validate input
    const validatedSpeed = validateFanSpeed(speed);

    logger.info('Setting fan speed', { speed: validatedSpeed });
    await sendUdpMessage({ speed: validatedSpeed });
    logger.info('Fan speed set successfully', { speed: validatedSpeed });
  } catch (error) {
    if (error instanceof ValidationError) {
      logger.warn('Invalid fan speed provided', { speed, error: error.message });
      throw error;
    }

    logger.error('Failed to set fan speed', {
      speed,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Health check function
export async function checkFanHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  details: string;
}> {
  try {
    logger.debug('Checking fan health');

    // Try to send a simple message to check connectivity
    await sendUdpMessage({ led: false });

    logger.debug('Fan health check passed');
    return { status: 'healthy', details: 'Fan is responding to UDP messages' };
  } catch (error) {
    logger.warn('Fan health check failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      status: 'unhealthy',
      details: `Fan is not responding: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Cleanup function for graceful shutdown
export function cleanup(): void {
  try {
    logger.info('Cleaning up UDP client');
    client.close();
    logger.info('UDP client closed successfully');
  } catch (error) {
    logger.error('Error during UDP client cleanup', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Handle process termination
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  cleanup();
  process.exit(0);
});

process.on('uncaughtException', error => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  cleanup();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
  cleanup();
  process.exit(1);
});
