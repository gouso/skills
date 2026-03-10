# WebSocket Protocol

## Overview

The bridge uses a simple request-response protocol over WebSocket (plugin ↔ bridge) and HTTP (Claude ↔ bridge).

## Message Types

### Command (Bridge → Plugin)
```json
{
  "type": "command",
  "requestId": "uuid-v4",
  "command": "create_frame",
  "params": { "name": "Header", "width": 1440 }
}
```

### Response (Plugin → Bridge)
```json
{
  "type": "response",
  "requestId": "uuid-v4",
  "success": true,
  "data": { "nodeId": "1:23", "name": "Header" }
}
```

Error response:
```json
{
  "type": "response",
  "requestId": "uuid-v4",
  "success": false,
  "error": "Node not found: 1:99"
}
```

### Event (Plugin → Bridge, unsolicited)
```json
{
  "type": "event",
  "event": "selection_changed",
  "data": { "nodeIds": ["1:23", "1:24"] }
}
```

## HTTP API (Claude → Bridge)

### GET /status
Returns connection status.
```json
{ "connected": true, "server": "figma-ws-bridge", "version": "1.0.0" }
```

### POST /command
Send a command to the Figma plugin.

Request:
```json
{
  "command": "create_frame",
  "params": { "name": "Card", "width": 360 },
  "timeout": 30.0
}
```

Response: Same as plugin response format.

## Flow

```
Claude                    Bridge (Python)              Figma Plugin
  │                           │                            │
  │ POST /command             │                            │
  │──────────────────────────▶│                            │
  │                           │ WS: command msg            │
  │                           │───────────────────────────▶│
  │                           │                            │ (executes Figma API)
  │                           │          WS: response msg  │
  │                           │◀───────────────────────────│
  │    HTTP JSON response     │                            │
  │◀──────────────────────────│                            │
```

## Ports

| Service | Default Port | Configurable |
|---------|-------------|--------------|
| WebSocket (plugin) | 18765 | `--port` flag |
| HTTP API (Claude) | 18766 | Always WS port + 1 |

## Color Encoding

Colors in params accept three formats:
- Hex string: `"#FF6B35"` or `"FF6B35"`
- RGB 0-255: `{"r": 255, "g": 107, "b": 53}`
- RGB 0-1: `{"r": 1.0, "g": 0.42, "b": 0.21}`

The plugin normalizes all to Figma's 0-1 RGB format internally.
