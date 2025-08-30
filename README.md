# AI Fan - Smart Fan Control with Model Context Protocol

A Node.js application that provides smart fan control capabilities through the Model Context Protocol (MCP). This application allows AI assistants to control smart fans via UDP communication.

## Features

- **Fan Control**: Turn fan on/off and control speed (1-6 levels)
- **LED Control**: Turn LED indicator on/off
- **Health Monitoring**: Check fan connectivity and status
- **MCP Integration**: Full Model Context Protocol support
- **UDP Communication**: Efficient UDP-based fan control
- **Retry Logic**: Automatic retry with exponential backoff
- **Input Validation**: Robust input validation and sanitization
- **Graceful Shutdown**: Proper cleanup and resource management

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- Smart fan device with UDP support

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd AI-Fan
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment configuration:

```bash
cp env.example .env
```

4. Edit `.env` file with your fan configuration:

```env
FAN_IP=192.168.1.13
FAN_PORT=5600
LOG_LEVEL=info
NODE_ENV=production
```

## Configuration

### Environment Variables

| Variable             | Description                                 | Default      | Required |
| -------------------- | ------------------------------------------- | ------------ | -------- |
| `FAN_IP`             | IP address of the smart fan                 | -            | Yes      |
| `FAN_PORT`           | UDP port of the smart fan                   | -            | Yes      |
| `LOG_LEVEL`          | Logging level (error, warn, info, debug)    | info         | No       |
| `LOG_FILE`           | Path to log file                            | logs/app.log | No       |
| `NODE_ENV`           | Environment (development, production, test) | development  | No       |
| `UDP_TIMEOUT`        | UDP operation timeout in ms                 | 5000         | No       |
| `UDP_RETRY_ATTEMPTS` | Maximum retry attempts                      | 3            | No       |

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Watch Mode (Development)

```bash
npm run watch
```

## Available MCP Tools

### `turn-on-fan`

Turns on the smart fan.

### `turn-off-fan`

Turns off the smart fan.

### `turn-on-led`

Turns on the LED indicator.

### `turn-off-led`

Turns off the LED indicator.

### `set-fan-speed`

Sets the fan speed to a specific level (1-6).

**Parameters:**

- `speed` (number): Fan speed level from 1 to 6

### `check-fan-health`

Checks the health and connectivity status of the fan.

## Development

### Code Quality

Run linting:

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

Format code:

```bash
npm run format
```

Type checking:

```bash
npm run type-check
```

### Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Building

Build the project:

```bash
npm run build
```

Clean build artifacts:

```bash
npm run clean
```

## Project Structure

```
src/
├── config/          # Configuration management
├── utils/           # Utility functions and helpers
├── __tests__/       # Test files
├── index.ts         # Main application entry point
└── service.ts       # Fan control service layer

dist/                # Compiled JavaScript output
logs/                # Application logs
coverage/            # Test coverage reports
```

## Error Handling

The application includes comprehensive error handling:

- **Custom Error Classes**: Specific error types for different failure scenarios
- **Input Validation**: Robust validation with clear error messages
- **Retry Logic**: Automatic retry with exponential backoff for network operations
- **Graceful Degradation**: Proper error responses without crashing
- **Detailed Logging**: Comprehensive logging for debugging and monitoring

## Logging

Logging is implemented using Winston with:

- **Multiple Log Levels**: error, warn, info, debug
- **File Rotation**: Automatic log file rotation and management
- **Structured Logging**: JSON-formatted logs with metadata
- **Environment-based Configuration**: Different logging behavior for dev/prod

## Security Considerations

- **Input Validation**: All inputs are validated and sanitized
- **No Hardcoded Secrets**: Configuration through environment variables
- **Error Sanitization**: Sensitive information is not exposed in error messages
- **Network Security**: UDP communication with proper timeout and retry limits

## Performance

- **Efficient UDP Communication**: Lightweight UDP protocol for fan control
- **Connection Reuse**: UDP socket is reused for multiple operations
- **Timeout Management**: Configurable timeouts to prevent hanging operations
- **Resource Cleanup**: Proper cleanup of resources on shutdown

## Monitoring and Health Checks

The application provides health monitoring capabilities:

- **Health Check Tool**: MCP tool to check fan connectivity
- **Status Reporting**: Detailed status information and error details
- **Logging**: Comprehensive logging for operational monitoring
- **Metrics**: Built-in metrics for performance monitoring

## Troubleshooting

### Common Issues

1. **Fan not responding**: Check IP address and port configuration
2. **UDP timeout errors**: Verify network connectivity and firewall settings
3. **Permission errors**: Ensure proper permissions for log directory creation

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in your environment configuration.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.
