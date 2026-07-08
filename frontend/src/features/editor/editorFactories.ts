import type {
  ButtonAction,
  ButtonElement,
  DrawElement,
  MediaElement,
  MediaKind,
  ShapeElement,
  ShapeKind,
  TextElement,
  ToolKind
} from "./editorTypes";

let counter = 1;
function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${counter++}`;
}

const BASE_DEFAULTS = { zIndex: 1, animation: "none" as const, appearDelay: 0 };

export function makeText(x: number, y: number, content: string, fontSize = 18): TextElement {
  return {
    id: nextId("text"),
    type: "text",
    x,
    y,
    w: 240,
    h: 60,
    ...BASE_DEFAULTS,
    content,
    style: {
      fontFamily: "Helvetica, Arial, sans-serif",
      fontSize,
      color: "#f3f1ea",
      opacity: 1,
      bold: fontSize >= 22,
      italic: false,
      align: "left",
      letterSpacing: 0
    }
  };
}

export function makeShape(x: number, y: number, shape: ShapeKind): ShapeElement {
  return {
    id: nextId("shape"),
    type: "shape",
    x,
    y,
    w: 120,
    h: 120,
    ...BASE_DEFAULTS,
    shape,
    style: {
      fill: "#d9b54a",
      radius: shape === "square" ? 8 : 0,
      opacity: 1
    }
  };
}

export function makeButton(x: number, y: number, label: string, action: ButtonAction): ButtonElement {
  return {
    id: nextId("button"),
    type: "button",
    x,
    y,
    w: 150,
    h: 44,
    ...BASE_DEFAULTS,
    label,
    action,
    style: {
      fill: "#d9b54a",
      textColor: "#20180a",
      radius: 8,
      fontSize: 14,
      opacity: 1
    }
  };
}

export function makeMedia(x: number, y: number, kind: MediaKind, src: string): MediaElement {
  return {
    id: nextId("media"),
    type: "media",
    x,
    y,
    w: 220,
    h: 220,
    ...BASE_DEFAULTS,
    kind,
    src,
    style: {
      radius: 8,
      opacity: 1,
      flipH: false,
      flipV: false,
      zoom: 1,
      panX: 50,
      panY: 50
    }
  };
}

export function makeDraw(
  x: number,
  y: number,
  w: number,
  h: number,
  toolKind: ToolKind,
  points: { x: number; y: number }[]
): DrawElement {
  return {
    id: nextId("draw"),
    type: "draw",
    x,
    y,
    w: Math.max(w, 4),
    h: Math.max(h, 4),
    ...BASE_DEFAULTS,
    toolKind,
    points,
    style: {
      strokeColor: "#d9b54a",
      strokeWidth: 3,
      opacity: 1
    }
  };
}