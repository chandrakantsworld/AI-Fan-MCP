import { z } from 'zod';
import { ValidationError, ERROR_CODES, ERROR_MESSAGES } from './errors.js';

// Validation schemas
export const fanSpeedSchema = z
  .number()
  .int()
  .min(1, ERROR_MESSAGES[ERROR_CODES.INVALID_SPEED])
  .max(6, ERROR_MESSAGES[ERROR_CODES.INVALID_SPEED]);

export const ipAddressSchema = z
  .string()
  .ip()
  .refine(ip => ip !== '0.0.0.0', 'IP address cannot be 0.0.0.0');

export const portSchema = z
  .number()
  .int()
  .min(1, 'Port must be greater than 0')
  .max(65535, 'Port must be less than 65536');

export const booleanSchema = z.boolean();

// Validation functions
export function validateFanSpeed(speed: unknown): number {
  try {
    return fanSpeedSchema.parse(speed);
  } catch (error) {
    if (error instanceof z.ZodError && error.errors.length > 0) {
      throw new ValidationError(error.errors[0].message);
    }
    throw new ValidationError('Invalid fan speed value');
  }
}

export function validateIpAddress(ip: unknown): string {
  try {
    return ipAddressSchema.parse(ip);
  } catch (error) {
    if (error instanceof z.ZodError && error.errors.length > 0) {
      throw new ValidationError(error.errors[0].message);
    }
    throw new ValidationError('Invalid IP address');
  }
}

export function validatePort(port: unknown): number {
  try {
    return portSchema.parse(port);
  } catch (error) {
    if (error instanceof z.ZodError && error.errors.length > 0) {
      throw new ValidationError(error.errors[0].message);
    }
    throw new ValidationError('Invalid port number');
  }
}

export function validateBoolean(value: unknown): boolean {
  try {
    return booleanSchema.parse(value);
  } catch (error) {
    if (error instanceof z.ZodError && error.errors.length > 0) {
      throw new ValidationError(error.errors[0].message);
    }
    throw new ValidationError('Value must be a boolean');
  }
}

// Type guards
export function isValidFanSpeed(speed: unknown): speed is number {
  return fanSpeedSchema.safeParse(speed).success;
}

export function isValidIpAddress(ip: unknown): ip is string {
  return ipAddressSchema.safeParse(ip).success;
}

export function isValidPort(port: unknown): port is number {
  return portSchema.safeParse(port).success;
}
