---
name: figma-connector
description: Connect to Figma via a local plugin bridge to create and manipulate designs programmatically. Use when the user wants to create design elements (frames, shapes, text, layouts), extract design tokens, inspect/query components, export images, or sync design variables in Figma. Requires a running WebSocket bridge server and the Claude Figma Connector plugin installed in Figma.
---

# Figma Connector

Bridge between Claude and Figma via WebSocket. Claude sends commands to a local bridge server, which relays them to the Figma plugin in real-time.

## Architecture

```
Claude ──HTTP POST──▶ Bridge Server (Python) ──WebSocket──▶ Figma Plugin ──▶ Figma API
                      localhost:18766                       localhost:18765
```

## Setup

### 1. Start the Bridge Server

```bash
python ./scripts/figma_ws_bridge.py
```

Server starts on:
- **WebSocket**: `ws://127.0.0.1:18765` (plugin connects here)
- **HTTP API**: `http://127.0.0.1:18766` (Claude sends commands here)

### 2. Install the Figma Plugin

Copy the `assets/figma-plugin/` folder contents (`manifest.json`, `code.js`, `ui.html`) to a local directory. In Figma:
1. Menu → Plugins → Development → Import plugin from manifest
2. Select the `manifest.json` file
3. Run the plugin and click **Connect**

### 3. Verify Connection

```bash
python ./scripts/figma_command.py status
```

## Sending Commands

Use the CLI tool or direct HTTP:

```bash
# CLI
python ./scripts/figma_command.py <command> --params '<json>'

# HTTP
curl -X POST http://127.0.0.1:18766/command \
  -H "Content-Type: application/json" \
  -d '{"command": "<command>", "params": {...}}'
```

## Available Commands

### Design Creation

| Command | Key Params | Description |
|---------|-----------|-------------|
| `create_frame` | `name, width, height, x, y, fillColor, layoutMode, itemSpacing, padding, parentId` | Create a frame (artboard) |
| `create_rectangle` | `name, width, height, x, y, fillColor, cornerRadius, strokeColor, strokeWeight, opacity, parentId` | Create a rectangle |
| `create_ellipse` | `name, width, height, x, y, fillColor, strokeColor, parentId` | Create an ellipse |
| `create_text` | `text, name, x, y, fontSize, fontFamily, fontStyle, fillColor, textAlignHorizontal, lineHeight, width, parentId` | Create a text node |
| `create_line` | `name, x, y, length, rotation, strokeColor, strokeWeight, parentId` | Create a line |
| `create_vector` | `name, vectorPaths, fillColor, strokeColor, parentId` | Create a vector path |

### Node Operations

| Command | Key Params | Description |
|---------|-----------|-------------|
| `update_node` | `nodeId, name, x, y, width, height, fillColor, opacity, cornerRadius, rotation, visible` | Update any node property |
| `update_text` | `nodeId, text, fontSize, fontFamily, fontStyle, fillColor` | Update text content/style |
| `delete_node` | `nodeId` | Delete a node |
| `duplicate_node` | `nodeId, x, y` | Clone a node |
| `group_nodes` | `nodeIds[], name` | Group nodes together |
| `set_auto_layout` | `nodeId, layoutMode, itemSpacing, padding, primaryAxisAlignItems, counterAxisAlignItems` | Set auto layout on frame |

### Components & Styles

| Command | Key Params | Description |
|---------|-----------|-------------|
| `get_local_components` | - | List all local components |
| `create_component` | `name, width, height, fillColor` | Create a new component |
| `create_instance` | `componentId, x, y` | Instantiate a component |
| `get_local_styles` | - | List paint/text/effect styles |

### Design Tokens & Variables

| Command | Key Params | Description |
|---------|-----------|-------------|
| `extract_tokens` | - | Extract all design tokens (colors, typography, effects) |
| `get_variables` | - | List variable collections |
| `get_variable_value` | `variableId` | Get a variable's value |
| `create_variable` | `name, type, value, collectionId/collectionName` | Create a design variable (COLOR, FLOAT, STRING, BOOLEAN) |

### Inspect & Query

| Command | Key Params | Description |
|---------|-----------|-------------|
| `get_selection` | - | Get currently selected nodes |
| `get_page_info` | - | Get current page info and children |
| `get_document_info` | - | Get document name and pages |
| `inspect_node` | `nodeId, deep` | Deep inspect a node's properties |
| `find_nodes` | `name, type, limit` | Find nodes by name or type |

### Export

| Command | Key Params | Description |
|---------|-----------|-------------|
| `export_node` | `nodeId, format (PNG/SVG/PDF/JPG), scale, contentsOnly` | Export node as image (returns base64) |

## Color Format

Colors can be specified as:
- **Hex string**: `"#FF0000"` or `"FF0000"`
- **RGB object (0-255)**: `{"r": 255, "g": 0, "b": 0}`
- **RGB object (0-1)**: `{"r": 1.0, "g": 0, "b": 0}`

## Example Workflows

### Create a simple card UI

```bash
# 1. Create card frame with auto layout
python ./scripts/figma_command.py create_frame --params '{"name": "Card", "width": 360, "height": 200, "fillColor": "#FFFFFF", "cornerRadius": 12, "layoutMode": "VERTICAL", "padding": 24, "itemSpacing": 12}'

# 2. Add title (use nodeId from step 1 as parentId)
python ./scripts/figma_command.py create_text --params '{"text": "Card Title", "fontSize": 20, "fontFamily": "Inter", "fontStyle": "Bold", "fillColor": "#1A1A1A", "parentId": "<nodeId>"}'

# 3. Add description
python ./scripts/figma_command.py create_text --params '{"text": "Description text here", "fontSize": 14, "fillColor": "#666666", "parentId": "<nodeId>"}'
```

### Extract and sync design tokens

```bash
# Extract all tokens from current file
python ./scripts/figma_command.py extract_tokens

# Create new color variable
python ./scripts/figma_command.py create_variable --params '{"name": "primary-blue", "type": "COLOR", "value": {"r": 0.09, "g": 0.63, "b": 0.98, "a": 1}, "collectionName": "Brand Colors"}'
```

## Reference

For detailed command parameters and the plugin WebSocket protocol, see:
- [Command Reference](./references/command_reference.md) - Full parameter docs for all commands
- [WebSocket Protocol](./references/ws_protocol.md) - Message format between bridge and plugin
