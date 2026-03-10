#!/usr/bin/env python3
"""
CLI tool to send commands to the Figma WebSocket Bridge.

Usage:
    python figma_command.py <command> [--params '{"key": "value"}'] [--port PORT]

Examples:
    python figma_command.py status
    python figma_command.py create_frame --params '{"name": "Header", "width": 1440, "height": 900}'
    python figma_command.py create_text --params '{"text": "Hello", "x": 100, "y": 100, "fontSize": 24}'
    python figma_command.py export_node --params '{"nodeId": "1:2", "format": "PNG", "scale": 2}'
"""

import argparse
import json
import sys
import urllib.request
import urllib.error

DEFAULT_HTTP_PORT = 18766  # bridge WS port (18765) + 1


def send_command(command: str, params: dict = None, port: int = DEFAULT_HTTP_PORT, timeout: float = 30.0) -> dict:
    """Send a command to the Figma bridge and return the response."""
    url = f"http://127.0.0.1:{port}/command"
    payload = json.dumps({
        "command": command,
        "params": params or {},
        "timeout": timeout
    }).encode()

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout + 5) as resp:
            return json.loads(resp.read())
    except urllib.error.URLError as e:
        return {"success": False, "error": f"Cannot reach bridge server: {e}"}
    except json.JSONDecodeError:
        return {"success": False, "error": "Invalid response from bridge"}


def check_status(port: int = DEFAULT_HTTP_PORT) -> dict:
    """Check if bridge server is running and plugin is connected."""
    url = f"http://127.0.0.1:{port}/status"
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            return json.loads(resp.read())
    except Exception as e:
        return {"connected": False, "error": f"Bridge not running: {e}"}


def main():
    parser = argparse.ArgumentParser(description="Send commands to Figma via bridge")
    parser.add_argument("command", help="Command to send (e.g., create_frame, create_text, status)")
    parser.add_argument("--params", type=str, default="{}", help="JSON params")
    parser.add_argument("--port", type=int, default=DEFAULT_HTTP_PORT, help="Bridge HTTP port")
    parser.add_argument("--timeout", type=float, default=30.0, help="Timeout in seconds")
    args = parser.parse_args()

    if args.command == "status":
        result = check_status(args.port)
    else:
        try:
            params = json.loads(args.params)
        except json.JSONDecodeError:
            print(f"Error: Invalid JSON params: {args.params}", file=sys.stderr)
            sys.exit(1)
        result = send_command(args.command, params, args.port, args.timeout)

    print(json.dumps(result, indent=2, ensure_ascii=False))
    if not result.get("success", True):
        sys.exit(1)


if __name__ == "__main__":
    main()
