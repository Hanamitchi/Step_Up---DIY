import type { ButtonElement, ShapeElement, ShapeKind, TextElement } from "./editorTypes";

let counter = 1;
function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${counter++}`;
}

export function makeText(x: number, y: number, content: string, fontSize = 18): TextElement {
  return {
    id: nextId("text"),
    type: "text",
    x,
    y,
    w: 240,
    h: 60,
    animation: "none",
    content,
    style: {
      fontFamily: "Helvetica, Arial, sans-serif",
      fontSize,
      color: "#f3f1ea",
      opacity: 1,
      bold: fontSize >= 22,
      italic: false,
      align: "left"
    }
  };
}

export function makeShape(x: number, y: number, shape: ShapeKind): ShapeElement {
  const size = shape === "line" ? { w: 160, h: 3 } : { w: 120, h: 120 };
  return {
    id: nextId("shape"),
    type: "shape",
    x,
    y,
    ...size,
    animation: "none",
    shape,
    style: {
      fill: "#d9b54a",
      radius: shape === "circle" ? 999 : shape === "line" ? 2 : 8,
      opacity: 1
    }
  };
}

export function makeButton(x: number, y: number, label = "RSVP"): ButtonElement {
  return {
    id: nextId("button"),
    type: "button",
    x,
    y,
    w: 140,
    h: 44,
    animation: "none",
    label,
    style: {
      fill: "#d9b54a",
      textColor: "#20180a",
      radius: 8,
      fontSize: 14,
      opacity: 1
    }
  };
}