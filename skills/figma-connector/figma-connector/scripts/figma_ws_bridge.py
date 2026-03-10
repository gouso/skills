#!/usr/bin/env python3
"""
Figma WebSocket Bridge Server.

Bridges Claude ↔ Figma Plugin via WebSocket.
Claude sends commands via HTTP POST to localhost, which are relayed
to the connected Figma plugin over WebSocket. Responses flow back.

Usage:
    python figma_ws_bridge.py [--port PORT]
    Default port: 18765
"""

import argparse
import asyncio
import json
import sys
import uuid
from http import HTTPStatus

try:
    import websockets
    from websockets.asyncio.server import serve as ws_serve
except ImportError:
    print("Installing websockets...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "websockets>=13.0", "-q"])
    import websockets
    from websockets.asyncio.server import serve as ws_serve

# Connected Figma plugin client
figma_client = None
# Pending command responses: {request_id: asyncio.Future}
pending_responses: dict[str, asyncio.Future] = {}
# Connection event
connection_event = asyncio.Event()


async def handle_figma_plugin(websocket):
    """Handle WebSocket connection from Figma plugin."""
    global figma_client
    figma_client = websocket
    connection_event.set()
    remote = websocket.remote_address
    print(f"[connected] Figma plugin from {remote}")

    try:
        async for raw_message in websocket:
            try:
                message = json.loads(raw_message)
            except json.JSONDecodeError:
                print(f"[warn] Non-JSON message: {raw_message[:100]}")
                continue

            msg_type = message.get("type")
            request_id = message.get("requestId")

            if msg_type == "response" and request_id and request_id in pending_responses:
                pending_responses[request_id].set_result(message)
            elif msg_type == "event":
                print(f"[event] {message.get('event')}: {json.dumps(message.get('data', {}), ensure_ascii=False)[:200]}")
            else:
                print(f"[info] {json.dumps(message, ensure_ascii=False)[:200]}")

    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        figma_client = None
        connection_event.clear()
        print(f"[disconnected] Figma plugin from {remote}")


async def send_command(command: str, params: dict | None = None, timeout: float = 30.0) -> dict:
    """Send a command to Figma plugin and wait for response."""
    if figma_client is None:
        return {"success": False, "error": "No Figma plugin connected. Open Figma and run the plugin."}

    request_id = str(uuid.uuid4())
    message = {
        "type": "command",
        "requestId": request_id,
        "command": command,
        "params": params or {}
    }

    future = asyncio.get_event_loop().create_future()
    pending_responses[request_id] = future

    try:
        await figma_client.send(json.dumps(message))
        result = await asyncio.wait_for(future, timeout=timeout)
        return result
    except asyncio.TimeoutError:
        return {"success": False, "error": f"Command '{command}' timed out after {timeout}s"}
    except websockets.exceptions.ConnectionClosed:
        return {"success": False, "error": "Figma plugin disconnected during command"}
    finally:
        pending_responses.pop(request_id, None)


async def handle_http_request(path, request_headers):
    """Handle HTTP requests from Claude (command API)."""
    # Only handle POST /command
    if path != "/command":
        return HTTPStatus.NOT_FOUND, [], b'{"error": "Not found"}\n'
    return None  # Let WebSocket handle it


async def handle_http_api(port: int):
    """Simple HTTP API server for Claude to send commands."""
    from http.server import HTTPServer, BaseHTTPRequestHandler
    import threading

    loop = asyncio.get_event_loop()

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, format, *args):
            pass  # Suppress logs

        def _send_json(self, status, data):
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(data, ensure_ascii=False).encode())

        def do_OPTIONS(self):
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()

        def do_GET(self):
            if self.path == "/status":
                self._send_json(200, {
                    "connected": figma_client is not None,
                    "server": "figma-ws-bridge",
                    "version": "1.0.0"
                })
            else:
                self._send_json(404, {"error": "Not found. Use GET /status or POST /command"})

        def do_POST(self):
            if self.path != "/command":
                self._send_json(404, {"error": "Not found"})
                return

            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)

            try:
                data = json.loads(body)
            except json.JSONDecodeError:
                self._send_json(400, {"error": "Invalid JSON"})
                return

            command = data.get("command")
            params = data.get("params", {})
            timeout = data.get("timeout", 30.0)

            if not command:
                self._send_json(400, {"error": "Missing 'command' field"})
                return

            future = asyncio.run_coroutine_threadsafe(
                send_command(command, params, timeout), loop
            )
            try:
                result = future.result(timeout=timeout + 5)
                self._send_json(200, result)
            except Exception as e:
                self._send_json(500, {"error": str(e)})

    http_port = port + 1
    server = HTTPServer(("127.0.0.1", http_port), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    print(f"[http] API server on http://127.0.0.1:{http_port}")
    print(f"  GET  /status  - Check connection status")
    print(f"  POST /command - Send command to Figma plugin")
    return server


async def main(port: int):
    print(f"=== Figma WebSocket Bridge ===")
    print(f"[ws] Listening on ws://127.0.0.1:{port}")

    http_server = await handle_http_api(port)

    async with ws_serve(handle_figma_plugin, "127.0.0.1", port):
        print(f"\nWaiting for Figma plugin to connect...")
        print(f"(Open Figma → Plugins → Figma Connector → Connect)\n")
        await asyncio.Future()  # Run forever


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Figma WebSocket Bridge")
    parser.add_argument("--port", type=int, default=18765, help="WebSocket port (HTTP = port+1)")
    args = parser.parse_args()

    try:
        asyncio.run(main(args.port))
    except KeyboardInterrupt:
        print("\n[shutdown] Bridge stopped.")
