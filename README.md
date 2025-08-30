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
git clone https://github.com/chandrakantsworld/AI-Fan-MCP.git
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

## MCP Setup and Configuration

### What is Model Context Protocol (MCP)?

The Model Context Protocol (MCP) is a standard that enables AI assistants to interact with external tools and data sources. This project implements MCP to allow AI assistants to control your smart fan directly.

### MCP Server Configuration

The MCP server runs on your local machine and communicates with AI assistants through a standardized interface. Here's how to set it up:

#### 1. Basic MCP Server Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the MCP server
npm start
```

#### 2. MCP Server Configuration

The MCP server is configured in `src/index.ts` and provides the following tools:

- **turn-on-fan**: Activates the smart fan
- **turn-off-fan**: Deactivates the smart fan
- **turn-on-led**: Enables the LED indicator
- **turn-off-led**: Disables the LED indicator
- **set-fan-speed**: Controls fan speed (1-6 levels)
- **check-fan-health**: Monitors fan connectivity status

#### 3. Environment Configuration

Create a `.env` file with your fan settings:

```env
# Fan Configuration
FAN_IP=192.168.1.13
FAN_PORT=5600

# MCP Server Settings
MCP_SERVER_PORT=3000
MCP_SERVER_HOST=localhost

# Logging Configuration
LOG_LEVEL=info
NODE_ENV=production

# UDP Settings
UDP_TIMEOUT=5000
UDP_RETRY_ATTEMPTS=3
```

#### 4. MCP Client Integration

To use this MCP server with AI assistants, you'll need to configure the MCP client. Here are examples for popular AI assistants:

##### Claude Desktop Configuration

Create a `claude_desktop_config.json` file:

```json
{
  "mcpServers": {
    "ai-fan": {
      "command": "node",
      "args": ["/path/to/your/AI-Fan/dist/index.js"],
      "env": {
        "FAN_IP": "192.168.1.13",
        "FAN_PORT": "5600"
      }
    }
  }
}
```

##### OpenAI GPTs Configuration

For OpenAI GPTs, you'll need to use the MCP bridge pattern:

```json
{
  "mcpServers": {
    "ai-fan": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-ai-fan"],
      "env": {
        "FAN_IP": "192.168.1.13",
        "FAN_PORT": "5600"
      }
    }
  }
}
```

#### 5. Testing MCP Integration

Test your MCP server connection:

```bash
# Start the server
npm start

# In another terminal, test the connection
curl -X POST http://localhost:3000/mcp/tools \
  -H "Content-Type: application/json" \
  -d '{"name": "check-fan-health"}'
```

#### 6. MCP Server Security

**Important Security Considerations:**

- The MCP server runs locally and should not be exposed to the internet
- Use environment variables for sensitive configuration
- Implement proper authentication if deploying in shared environments
- Regularly update dependencies for security patches

#### 7. Troubleshooting MCP Issues

**Common MCP Connection Problems:**

1. **Server not starting**: Check port availability and environment variables
2. **Tool not found**: Verify the tool name matches exactly
3. **Permission denied**: Ensure proper file permissions for the executable
4. **Network errors**: Verify fan IP and port configuration

**Debug Mode:**

Enable debug logging to troubleshoot MCP issues:

```bash
LOG_LEVEL=debug npm start
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
