// Custom error classes for better error handling
export class FanControlError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = 'FAN_CONTROL_ERROR', statusCode: number = 500) {
    super(message);
    this.name = 'FanControlError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends FanControlError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends FanControlError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR', 503);
    this.name = 'NetworkError';
  }
}

export class ConfigurationError extends FanControlError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR', 500);
    this.name = 'ConfigurationError';
  }
}

// Error codes
export const ERROR_CODES = {
  INVALID_SPEED: 'INVALID_SPEED',
  UDP_SEND_FAILED: 'UDP_SEND_FAILED',
  INVALID_IP: 'INVALID_IP',
  INVALID_PORT: 'INVALID_PORT',
  TIMEOUT: 'TIMEOUT',
  RETRY_EXHAUSTED: 'RETRY_EXHAUSTED',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_SPEED]: 'Fan speed must be between 1 and 6',
  [ERROR_CODES.UDP_SEND_FAILED]: 'Failed to send UDP message to fan',
  [ERROR_CODES.INVALID_IP]: 'Invalid fan IP address',
  [ERROR_CODES.INVALID_PORT]: 'Invalid fan port number',
  [ERROR_CODES.TIMEOUT]: 'Operation timed out',
  [ERROR_CODES.RETRY_EXHAUSTED]: 'Maximum retry attempts exceeded',
} as const;
