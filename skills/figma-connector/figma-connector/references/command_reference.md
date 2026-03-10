# Figma Connector Command Reference

## Design Creation Commands

### create_frame
Create a frame (artboard) container.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | string | "Frame" | Frame name |
| `width` | number | 1440 | Width in pixels |
| `height` | number | 900 | Height in pixels |
| `x` | number | 0 | X position |
| `y` | number | 0 | Y position |
| `fillColor` | color | none | Background color (hex or rgb object) |
| `cornerRadius` | number | 0 | Corner radius |
| `layoutMode` | string | none | "HORIZONTAL" or "VERTICAL" for auto layout |
| `itemSpacing` | number | none | Space between auto layout children |
| `padding` | number | none | Uniform padding (all sides) |
| `parentId` | string | none | Append to this parent node |

### create_rectangle
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | string | "Rectangle" | Node name |
| `width` | number | 100 | Width |
| `height` | number | 100 | Height |
| `x`, `y` | number | 0 | Position |
| `fillColor` | color | none | Fill color |
| `cornerRadius` | number | 0 | Corner radius |
| `strokeColor` | color | none | Stroke color |
| `strokeWeight` | number | 1 | Stroke width |
| `opacity` | number | 1 | Opacity (0-1) |
| `parentId` | string | none | Parent node ID |

### create_ellipse
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | string | "Ellipse" | Node name |
| `width`, `height` | number | 100 | Dimensions |
| `x`, `y` | number | 0 | Position |
| `fillColor` | color | none | Fill color |
| `strokeColor` | color | none | Stroke color |
| `parentId` | string | none | Parent node ID |

### create_text
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `text` | string | "Hello" | Text content |
| `name` | string | "Text" | Node name |
| `x`, `y` | number | 0 | Position |
| `fontSize` | number | 16 | Font size |
| `fontFamily` | string | "Inter" | Font family |
| `fontStyle` | string | "Regular" | Font style (Regular, Bold, Italic, etc.) |
| `fillColor` | color | none | Text color |
| `textAlignHorizontal` | string | none | "LEFT", "CENTER", "RIGHT", "JUSTIFIED" |
| `textAlignVertical` | string | none | "TOP", "CENTER", "BOTTOM" |
| `lineHeight` | number | none | Line height in pixels |
| `letterSpacing` | number | none | Letter spacing in pixels |
| `textAutoResize` | string | none | "WIDTH_AND_HEIGHT", "HEIGHT", "NONE" |
| `width` | number | none | Fixed width |
| `parentId` | string | none | Parent node ID |

### create_line
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | string | "Line" | Node name |
| `x`, `y` | number | 0 | Start position |
| `length` | number | 100 | Line length |
| `rotation` | number | 0 | Rotation in degrees |
| `strokeColor` | color | black | Stroke color |
| `strokeWeight` | number | 1 | Stroke width |
| `parentId` | string | none | Parent node ID |

### create_vector
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | string | "Vector" | Node name |
| `vectorPaths` | array | none | SVG-like vector path data |
| `fillColor` | color | none | Fill color |
| `strokeColor` | color | none | Stroke color |
| `strokeWeight` | number | none | Stroke width |
| `parentId` | string | none | Parent node ID |

## Node Manipulation Commands

### update_node
Modify properties of any existing node.

| Param | Type | Description |
|-------|------|-------------|
| `nodeId` | string | **Required.** Target node ID |
| `name` | string | New name |
| `x`, `y` | number | New position |
| `width`, `height` | number | New size (both required together) |
| `fillColor` | color | New fill |
| `strokeColor` | color | New stroke |
| `strokeWeight` | number | New stroke weight |
| `opacity` | number | Opacity (0-1) |
| `cornerRadius` | number | Corner radius |
| `visible` | boolean | Visibility |
| `rotation` | number | Rotation degrees |

### update_text
Modify text-specific properties.

| Param | Type | Description |
|-------|------|-------------|
| `nodeId` | string | **Required.** Text node ID |
| `text` | string | New text content |
| `fontSize` | number | New font size |
| `fontFamily` | string | New font family |
| `fontStyle` | string | New font style |
| `fillColor` | color | New text color |

### delete_node
| Param | Type | Description |
|-------|------|-------------|
| `nodeId` | string | **Required.** Node to delete |

### duplicate_node
| Param | Type | Description |
|-------|------|-------------|
| `nodeId` | string | **Required.** Node to clone |
| `x`, `y` | number | Position for the clone |

### group_nodes
| Param | Type | Description |
|-------|------|-------------|
| `nodeIds` | string[] | **Required.** Array of node IDs to group |
| `name` | string | Group name |

### set_auto_layout
| Param | Type | Description |
|-------|------|-------------|
| `nodeId` | string | **Required.** Frame node ID |
| `layoutMode` | string | "HORIZONTAL" or "VERTICAL" |
| `itemSpacing` | number | Gap between children |
| `padding` | number | Uniform padding |
| `paddingTop/Right/Bottom/Left` | number | Individual padding |
| `primaryAxisAlignItems` | string | "MIN", "CENTER", "MAX", "SPACE_BETWEEN" |
| `counterAxisAlignItems` | string | "MIN", "CENTER", "MAX" |
| `primaryAxisSizingMode` | string | "FIXED", "AUTO" |
| `counterAxisSizingMode` | string | "FIXED", "AUTO" |

## Component & Style Commands

### get_local_components
No params. Returns `{ components: [{ id, name, description }] }`.

### create_component
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | string | "Component" | Component name |
| `width`, `height` | number | 100 | Dimensions |
| `fillColor` | color | none | Fill color |

### create_instance
| Param | Type | Description |
|-------|------|-------------|
| `componentId` | string | **Required.** Source component ID |
| `x`, `y` | number | Instance position |

### get_local_styles
No params. Returns `{ styles: [{ id, name, type }] }`. Types: PAINT, TEXT, EFFECT.

## Design Token Commands

### extract_tokens
No params. Returns:
```json
{
  "colors": { "style-name": { "r": 255, "g": 0, "b": 0, "hex": "#FF0000" } },
  "typography": { "style-name": { "fontFamily": "Inter", "fontSize": 16, ... } },
  "effects": { "style-name": [{ "type": "DROP_SHADOW", "radius": 4, ... }] }
}
```

### get_variables
No params. Returns variable collections with modes and variable IDs.

### get_variable_value
| Param | Type | Description |
|-------|------|-------------|
| `variableId` | string | **Required.** Variable ID |

### create_variable
| Param | Type | Description |
|-------|------|-------------|
| `name` | string | **Required.** Variable name |
| `type` | string | "COLOR", "FLOAT", "STRING", "BOOLEAN" |
| `value` | any | Initial value |
| `collectionId` | string | Existing collection ID |
| `collectionName` | string | Create/use named collection |

## Inspect & Query Commands

### get_selection
No params. Returns currently selected nodes.

### get_page_info
No params. Returns current page ID, name, and top-level children.

### get_document_info
No params. Returns document name and all pages.

### inspect_node
| Param | Type | Description |
|-------|------|-------------|
| `nodeId` | string | **Required.** Node to inspect |
| `deep` | boolean | Include full child tree (default: false) |

### find_nodes
| Param | Type | Description |
|-------|------|-------------|
| `name` | string | Search by name (contains match) |
| `type` | string | Search by type (e.g., "TEXT", "FRAME", "RECTANGLE") |
| `limit` | number | Max results (default: 50) |

## Export Commands

### export_node
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `nodeId` | string | - | **Required.** Node to export |
| `format` | string | "PNG" | "PNG", "SVG", "PDF", "JPG" |
| `scale` | number | 1 | Export scale multiplier |
| `contentsOnly` | boolean | true | Exclude frame background |

Returns `{ data: "<base64>", format, nodeId, name }`.
