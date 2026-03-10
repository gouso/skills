// Claude Figma Connector - Plugin Code (runs in Figma sandbox)
// Receives commands from UI (which connects to WebSocket bridge) and executes Figma API calls.

figma.showUI(__html__, { width: 360, height: 480 });

// ============================================================
// Command Handlers
// ============================================================

const commandHandlers = {
  // --- Status & Info ---
  ping: async () => ({ pong: true, timestamp: Date.now() }),

  get_selection: async () => {
    const nodes = figma.currentPage.selection;
    return { nodes: nodes.map(n => serializeNode(n, false)) };
  },

  get_page_info: async () => ({
    pageId: figma.currentPage.id,
    pageName: figma.currentPage.name,
    childCount: figma.currentPage.children.length,
    children: figma.currentPage.children.map(n => ({ id: n.id, name: n.name, type: n.type }))
  }),

  get_document_info: async () => ({
    name: figma.root.name,
    pages: figma.root.children.map(p => ({ id: p.id, name: p.name, childCount: p.children.length }))
  }),

  // --- Design Creation ---
  create_frame: async (params) => {
    const frame = figma.createFrame();
    frame.name = params.name || "Frame";
    frame.resize(params.width || 1440, params.height || 900);
    frame.x = params.x || 0;
    frame.y = params.y || 0;
    if (params.fillColor) applyFill(frame, params.fillColor);
    if (params.cornerRadius) frame.cornerRadius = params.cornerRadius;
    if (params.layoutMode) {
      frame.layoutMode = params.layoutMode; // "HORIZONTAL" | "VERTICAL"
      if (params.itemSpacing != null) frame.itemSpacing = params.itemSpacing;
      if (params.padding != null) {
        frame.paddingTop = params.padding;
        frame.paddingRight = params.padding;
        frame.paddingBottom = params.padding;
        frame.paddingLeft = params.padding;
      }
    }
    if (params.parentId) appendToParent(frame, params.parentId);
    return { nodeId: frame.id, name: frame.name };
  },

  create_rectangle: async (params) => {
    const rect = figma.createRectangle();
    rect.name = params.name || "Rectangle";
    rect.resize(params.width || 100, params.height || 100);
    rect.x = params.x || 0;
    rect.y = params.y || 0;
    if (params.fillColor) applyFill(rect, params.fillColor);
    if (params.cornerRadius) rect.cornerRadius = params.cornerRadius;
    if (params.strokeColor) applyStroke(rect, params.strokeColor, params.strokeWeight);
    if (params.opacity != null) rect.opacity = params.opacity;
    if (params.parentId) appendToParent(rect, params.parentId);
    return { nodeId: rect.id, name: rect.name };
  },

  create_ellipse: async (params) => {
    const ellipse = figma.createEllipse();
    ellipse.name = params.name || "Ellipse";
    ellipse.resize(params.width || 100, params.height || 100);
    ellipse.x = params.x || 0;
    ellipse.y = params.y || 0;
    if (params.fillColor) applyFill(ellipse, params.fillColor);
    if (params.strokeColor) applyStroke(ellipse, params.strokeColor, params.strokeWeight);
    if (params.parentId) appendToParent(ellipse, params.parentId);
    return { nodeId: ellipse.id, name: ellipse.name };
  },

  create_text: async (params) => {
    const text = figma.createText();
    await figma.loadFontAsync({ family: params.fontFamily || "Inter", style: params.fontStyle || "Regular" });
    text.name = params.name || "Text";
    text.characters = params.text || "Hello";
    text.fontSize = params.fontSize || 16;
    text.x = params.x || 0;
    text.y = params.y || 0;
    if (params.fillColor) applyFill(text, params.fillColor);
    if (params.fontFamily) text.fontName = { family: params.fontFamily, style: params.fontStyle || "Regular" };
    if (params.textAlignHorizontal) text.textAlignHorizontal = params.textAlignHorizontal;
    if (params.textAlignVertical) text.textAlignVertical = params.textAlignVertical;
    if (params.lineHeight) text.lineHeight = typeof params.lineHeight === "number" ? { value: params.lineHeight, unit: "PIXELS" } : params.lineHeight;
    if (params.letterSpacing) text.letterSpacing = { value: params.letterSpacing, unit: "PIXELS" };
    if (params.textAutoResize) text.textAutoResize = params.textAutoResize;
    if (params.width) text.resize(params.width, text.height);
    if (params.parentId) appendToParent(text, params.parentId);
    return { nodeId: text.id, name: text.name };
  },

  create_line: async (params) => {
    const line = figma.createLine();
    line.name = params.name || "Line";
    line.x = params.x || 0;
    line.y = params.y || 0;
    line.resize(params.length || 100, 0);
    if (params.rotation) line.rotation = params.rotation;
    applyStroke(line, params.strokeColor || { r: 0, g: 0, b: 0 }, params.strokeWeight || 1);
    if (params.parentId) appendToParent(line, params.parentId);
    return { nodeId: line.id, name: line.name };
  },

  create_vector: async (params) => {
    const vector = figma.createVector();
    vector.name = params.name || "Vector";
    if (params.vectorPaths) vector.vectorPaths = params.vectorPaths;
    if (params.fillColor) applyFill(vector, params.fillColor);
    if (params.strokeColor) applyStroke(vector, params.strokeColor, params.strokeWeight);
    if (params.parentId) appendToParent(vector, params.parentId);
    return { nodeId: vector.id, name: vector.name };
  },

  // --- Node Manipulation ---
  update_node: async (params) => {
    const node = figma.getNodeById(params.nodeId);
    if (!node) throw new Error(`Node not found: ${params.nodeId}`);
    if (params.name) node.name = params.name;
    if (params.x != null) node.x = params.x;
    if (params.y != null) node.y = params.y;
    if (params.width != null && params.height != null) node.resize(params.width, params.height);
    if (params.fillColor) applyFill(node, params.fillColor);
    if (params.strokeColor) applyStroke(node, params.strokeColor, params.strokeWeight);
    if (params.opacity != null) node.opacity = params.opacity;
    if (params.cornerRadius != null) node.cornerRadius = params.cornerRadius;
    if (params.visible != null) node.visible = params.visible;
    if (params.rotation != null) node.rotation = params.rotation;
    return { nodeId: node.id, updated: true };
  },

  update_text: async (params) => {
    const node = figma.getNodeById(params.nodeId);
    if (!node || node.type !== "TEXT") throw new Error(`Text node not found: ${params.nodeId}`);
    if (params.fontFamily || params.fontStyle) {
      await figma.loadFontAsync({ family: params.fontFamily || node.fontName.family, style: params.fontStyle || node.fontName.style });
    }
    if (params.text != null) node.characters = params.text;
    if (params.fontSize) node.fontSize = params.fontSize;
    if (params.fillColor) applyFill(node, params.fillColor);
    if (params.fontFamily) node.fontName = { family: params.fontFamily, style: params.fontStyle || "Regular" };
    return { nodeId: node.id, updated: true };
  },

  delete_node: async (params) => {
    const node = figma.getNodeById(params.nodeId);
    if (!node) throw new Error(`Node not found: ${params.nodeId}`);
    const name = node.name;
    node.remove();
    return { deleted: true, name };
  },

  duplicate_node: async (params) => {
    const node = figma.getNodeById(params.nodeId);
    if (!node) throw new Error(`Node not found: ${params.nodeId}`);
    const clone = node.clone();
    if (params.x != null) clone.x = params.x;
    if (params.y != null) clone.y = params.y;
    return { nodeId: clone.id, name: clone.name };
  },

  group_nodes: async (params) => {
    const nodes = params.nodeIds.map(id => {
      const n = figma.getNodeById(id);
      if (!n) throw new Error(`Node not found: ${id}`);
      return n;
    });
    const group = figma.group(nodes, figma.currentPage);
    if (params.name) group.name = params.name;
    return { nodeId: group.id, name: group.name };
  },

  // --- Component & Style Operations ---
  get_local_components: async () => {
    const components = figma.root.findAllWithCriteria({ types: ["COMPONENT"] });
    return { components: components.map(c => ({ id: c.id, name: c.name, description: c.description })) };
  },

  create_component: async (params) => {
    const component = figma.createComponent();
    component.name = params.name || "Component";
    component.resize(params.width || 100, params.height || 100);
    if (params.fillColor) applyFill(component, params.fillColor);
    return { nodeId: component.id, name: component.name };
  },

  create_instance: async (params) => {
    const component = figma.getNodeById(params.componentId);
    if (!component || component.type !== "COMPONENT") throw new Error(`Component not found: ${params.componentId}`);
    const instance = component.createInstance();
    if (params.x != null) instance.x = params.x;
    if (params.y != null) instance.y = params.y;
    return { nodeId: instance.id, name: instance.name };
  },

  get_local_styles: async () => {
    const paintStyles = figma.getLocalPaintStyles().map(s => ({ id: s.id, name: s.name, type: "PAINT" }));
    const textStyles = figma.getLocalTextStyles().map(s => ({ id: s.id, name: s.name, type: "TEXT" }));
    const effectStyles = figma.getLocalEffectStyles().map(s => ({ id: s.id, name: s.name, type: "EFFECT" }));
    return { styles: [...paintStyles, ...textStyles, ...effectStyles] };
  },

  // --- Design Token Extraction ---
  extract_tokens: async (params) => {
    const tokens = { colors: {}, typography: {}, spacing: {}, effects: {} };

    // Colors from paint styles
    for (const style of figma.getLocalPaintStyles()) {
      const paint = style.paints[0];
      if (paint && paint.type === "SOLID") {
        tokens.colors[style.name] = {
          r: Math.round(paint.color.r * 255),
          g: Math.round(paint.color.g * 255),
          b: Math.round(paint.color.b * 255),
          a: paint.opacity != null ? paint.opacity : 1,
          hex: rgbToHex(paint.color)
        };
      }
    }

    // Typography from text styles
    for (const style of figma.getLocalTextStyles()) {
      tokens.typography[style.name] = {
        fontFamily: style.fontName.family,
        fontStyle: style.fontName.style,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing
      };
    }

    // Effects from effect styles
    for (const style of figma.getLocalEffectStyles()) {
      tokens.effects[style.name] = style.effects.map(e => ({
        type: e.type,
        radius: e.radius,
        color: e.color ? rgbToHex(e.color) : null,
        offset: e.offset
      }));
    }

    return tokens;
  },

  // --- Variables (Design Tokens v2) ---
  get_variables: async () => {
    const collections = figma.variables.getLocalVariableCollections();
    return {
      collections: collections.map(c => ({
        id: c.id,
        name: c.name,
        modes: c.modes,
        variableIds: c.variableIds
      }))
    };
  },

  get_variable_value: async (params) => {
    const variable = figma.variables.getVariableById(params.variableId);
    if (!variable) throw new Error(`Variable not found: ${params.variableId}`);
    return {
      id: variable.id,
      name: variable.name,
      resolvedType: variable.resolvedType,
      valuesByMode: variable.valuesByMode
    };
  },

  create_variable: async (params) => {
    let collection;
    if (params.collectionId) {
      collection = figma.variables.getVariableCollectionById(params.collectionId);
    } else {
      collection = figma.variables.createVariableCollection(params.collectionName || "Claude Tokens");
    }
    const variable = figma.variables.createVariable(
      params.name,
      collection.id,
      params.type || "COLOR"  // COLOR, FLOAT, STRING, BOOLEAN
    );
    if (params.value != null) {
      const modeId = collection.modes[0].modeId;
      variable.setValueForMode(modeId, params.value);
    }
    return { variableId: variable.id, collectionId: collection.id, name: variable.name };
  },

  // --- Export ---
  export_node: async (params) => {
    const node = figma.getNodeById(params.nodeId);
    if (!node) throw new Error(`Node not found: ${params.nodeId}`);
    const settings = {
      format: params.format || "PNG",
      contentsOnly: params.contentsOnly !== false
    };
    if (params.scale) settings.constraint = { type: "SCALE", value: params.scale };
    const bytes = await node.exportAsync(settings);
    const base64 = figma.base64Encode(bytes);
    return { data: base64, format: settings.format, nodeId: node.id, name: node.name };
  },

  // --- Inspect / Read ---
  inspect_node: async (params) => {
    const node = figma.getNodeById(params.nodeId);
    if (!node) throw new Error(`Node not found: ${params.nodeId}`);
    return serializeNode(node, params.deep || false);
  },

  find_nodes: async (params) => {
    const page = figma.currentPage;
    let results;
    if (params.name) {
      results = page.findAll(n => n.name.includes(params.name));
    } else if (params.type) {
      results = page.findAllWithCriteria({ types: [params.type] });
    } else {
      results = page.children;
    }
    const limit = params.limit || 50;
    return { nodes: results.slice(0, limit).map(n => serializeNode(n, false)) };
  },

  // --- Layout ---
  set_auto_layout: async (params) => {
    const node = figma.getNodeById(params.nodeId);
    if (!node || !("layoutMode" in node)) throw new Error(`Frame not found: ${params.nodeId}`);
    node.layoutMode = params.layoutMode || "VERTICAL";
    if (params.itemSpacing != null) node.itemSpacing = params.itemSpacing;
    if (params.padding != null) {
      node.paddingTop = params.padding;
      node.paddingRight = params.padding;
      node.paddingBottom = params.padding;
      node.paddingLeft = params.padding;
    }
    if (params.paddingTop != null) node.paddingTop = params.paddingTop;
    if (params.paddingRight != null) node.paddingRight = params.paddingRight;
    if (params.paddingBottom != null) node.paddingBottom = params.paddingBottom;
    if (params.paddingLeft != null) node.paddingLeft = params.paddingLeft;
    if (params.primaryAxisAlignItems) node.primaryAxisAlignItems = params.primaryAxisAlignItems;
    if (params.counterAxisAlignItems) node.counterAxisAlignItems = params.counterAxisAlignItems;
    if (params.primaryAxisSizingMode) node.primaryAxisSizingMode = params.primaryAxisSizingMode;
    if (params.counterAxisSizingMode) node.counterAxisSizingMode = params.counterAxisSizingMode;
    return { nodeId: node.id, layoutMode: node.layoutMode };
  },
};

// ============================================================
// Helper Functions
// ============================================================

function applyFill(node, color) {
  const c = normalizeColor(color);
  node.fills = [{ type: "SOLID", color: { r: c.r, g: c.g, b: c.b }, opacity: c.a != null ? c.a : 1 }];
}

function applyStroke(node, color, weight) {
  const c = normalizeColor(color);
  node.strokes = [{ type: "SOLID", color: { r: c.r, g: c.g, b: c.b } }];
  node.strokeWeight = weight || 1;
}

function normalizeColor(color) {
  if (typeof color === "string") {
    // Hex string: "#FF0000" or "FF0000"
    const hex = color.replace("#", "");
    return {
      r: parseInt(hex.substring(0, 2), 16) / 255,
      g: parseInt(hex.substring(2, 4), 16) / 255,
      b: parseInt(hex.substring(4, 6), 16) / 255,
      a: hex.length > 6 ? parseInt(hex.substring(6, 8), 16) / 255 : 1
    };
  }
  // Object with r,g,b in 0-255 or 0-1 range
  if (color.r > 1 || color.g > 1 || color.b > 1) {
    return { r: color.r / 255, g: color.g / 255, b: color.b / 255, a: color.a != null ? color.a : 1 };
  }
  return color;
}

function rgbToHex(color) {
  const r = Math.round(color.r * 255).toString(16).padStart(2, "0");
  const g = Math.round(color.g * 255).toString(16).padStart(2, "0");
  const b = Math.round(color.b * 255).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`.toUpperCase();
}

function appendToParent(node, parentId) {
  const parent = figma.getNodeById(parentId);
  if (parent && "appendChild" in parent) parent.appendChild(node);
}

function serializeNode(node, deep) {
  const data = {
    id: node.id,
    name: node.name,
    type: node.type,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    visible: node.visible
  };
  if ("opacity" in node) data.opacity = node.opacity;
  if ("fills" in node && Array.isArray(node.fills)) {
    data.fills = node.fills.map(f => {
      if (f.type === "SOLID") return { type: "SOLID", hex: rgbToHex(f.color), opacity: f.opacity };
      return { type: f.type };
    });
  }
  if ("cornerRadius" in node) data.cornerRadius = node.cornerRadius;
  if (node.type === "TEXT") {
    data.characters = node.characters;
    data.fontSize = node.fontSize;
    data.fontName = node.fontName;
  }
  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    data.layoutMode = node.layoutMode;
    data.itemSpacing = node.itemSpacing;
  }
  if (deep && "children" in node) {
    data.children = node.children.map(c => serializeNode(c, true));
  } else if ("children" in node) {
    data.childCount = node.children.length;
  }
  return data;
}

// ============================================================
// Message Handler
// ============================================================

figma.ui.onmessage = async (msg) => {
  if (msg.type !== "command") return;

  const { requestId, command, params } = msg;
  const handler = commandHandlers[command];

  if (!handler) {
    figma.ui.postMessage({
      type: "response",
      requestId,
      success: false,
      error: `Unknown command: ${command}. Available: ${Object.keys(commandHandlers).join(", ")}`
    });
    return;
  }

  try {
    const result = await handler(params || {});
    figma.ui.postMessage({ type: "response", requestId, success: true, data: result });
  } catch (err) {
    figma.ui.postMessage({ type: "response", requestId, success: false, error: err.message || String(err) });
  }
};
