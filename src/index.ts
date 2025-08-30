import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import config from './config/index.js';
import logger from './utils/logger.js';
import {
  setFanSpeed,
  turnOffFan,
  turnOffLed,
  turnOnFan,
  turnOnLed,
  checkFanHealth,
  cleanup as serviceCleanup,
} from './service.js';
import { FanControlError, ValidationError } from './utils/errors.js';

// Create MCP server instance
const server = new McpServer({
  name: 'IOT Smart Fan',
  version: '1.0.0',
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Health check tool
server.tool('check-fan-health', 'Check the health status of the fan', async () => {
  try {
    logger.info('Health check requested');
    const health = await checkFanHealth();

    return {
      content: [
        {
          type: 'text',
          text: `Fan status: ${health.status}. ${health.details}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Health check failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
});

// Fan control tools
server.tool('turn-on-fan', 'Turn on the fan', async () => {
  try {
    logger.info('Turn on fan requested');
    await turnOnFan();

    return {
      content: [
        {
          type: 'text',
          text: 'Fan has been turned on successfully',
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to turn on fan', {
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof FanControlError) {
      throw error;
    }

    throw new FanControlError(
      `Failed to turn on fan: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

server.tool('turn-off-fan', 'Turn off the fan', async () => {
  try {
    logger.info('Turn off fan requested');
    await turnOffFan();

    return {
      content: [
        {
          type: 'text',
          text: 'Fan has been turned off successfully',
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to turn off fan', {
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof FanControlError) {
      throw error;
    }

    throw new FanControlError(
      `Failed to turn off fan: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

// LED control tools
server.tool('turn-on-led', 'Turn on the LED', async () => {
  try {
    logger.info('Turn on LED requested');
    await turnOnLed();

    return {
      content: [
        {
          type: 'text',
          text: 'LED has been turned on successfully',
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to turn on LED', {
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof FanControlError) {
      throw error;
    }

    throw new FanControlError(
      `Failed to turn on LED: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

server.tool('turn-off-led', 'Turn off the LED', async () => {
  try {
    logger.info('Turn off LED requested');
    await turnOffLed();

    return {
      content: [
        {
          type: 'text',
          text: 'LED has been turned off successfully',
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to turn off LED', {
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof FanControlError) {
      throw error;
    }

    throw new FanControlError(
      `Failed to turn off LED: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

// Fan speed control tool
server.tool(
  'set-fan-speed',
  'Set the fan speed (1-6)',
  {
    speed: z
      .number()
      .int()
      .min(1, 'The speed of the fan must be a number from 1 - 6')
      .max(6, 'The speed of the fan must be a number from 1 - 6'),
  },
  async ({ speed }) => {
    try {
      logger.info('Set fan speed requested', { speed });
      await setFanSpeed(speed);

      return {
        content: [
          {
            type: 'text',
            text: `Fan speed has been set to ${speed} successfully`,
          },
        ],
      };
    } catch (error) {
      logger.error('Failed to set fan speed', {
        speed,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ValidationError || error instanceof FanControlError) {
        throw error;
      }

      throw new FanControlError(
        `Failed to set fan speed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

// Main function with proper error handling and graceful shutdown
async function main() {
  try {
    logger.info('Starting IOT Smart Fan MCP server', {
      version: '1.0.0',
      environment: config.NODE_ENV,
      fanIp: config.FAN_IP,
      fanPort: config.FAN_PORT,
    });

    // Validate configuration
    logger.info('Configuration validated successfully');

    // Create transport
    const transport = new StdioServerTransport();

    // Connect server
    await server.connect(transport);
    logger.info('MCP server connected successfully on stdio');

    // Log startup completion
    logger.info('IOT Smart Fan MCP server is running and ready to accept commands');

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, initiating graceful shutdown`);

      try {
        // Cleanup service resources
        serviceCleanup();

        // Close transport
        await transport.close();
        logger.info('Transport closed successfully');

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown', {
          error: error instanceof Error ? error.message : String(error),
        });
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    // Handle uncaught exceptions
    process.on('uncaughtException', error => {
      logger.error('Uncaught exception in main process', {
        error: error.message,
        stack: error.stack,
      });
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection in main process', { reason, promise });
      gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    logger.error('Failed to start MCP server', {
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof Error && error.stack) {
      logger.error('Stack trace', { stack: error.stack });
    }

    process.exit(1);
  }
}

// Start the server
main().catch(error => {
  logger.error('Fatal error in main function', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
