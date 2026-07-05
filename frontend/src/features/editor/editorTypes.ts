export type ElementType = "text" | "shape" | "button";

export type ShapeKind = "rectangle" | "circle" | "line";

export type AnimationPreset = "none" | "fade-in" | "slide-up" | "zoom-in" | "bounce";

export type TransitionPreset = "cut" | "fade" | "slide";

export type TextStyle = {
  fontFamily: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
};

export type ShapeStyle = {
  fill: string;
  radius: number;
  opacity: number;
};

export type ButtonStyle = {
  fill: string;
  textColor: string;
  radius: number;
  fontSize: number;
};

export type BaseElement = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  animation: AnimationPreset;
};

export type TextElement = BaseElement & {
  type: "text";
  content: string;
  style: TextStyle;
};

export type ShapeElement = BaseElement & {
  type: "shape";
  shape: ShapeKind;
  style: ShapeStyle;
};

export type ButtonElement = BaseElement & {
  type: "button";
  label: string;
  style: ButtonStyle;
};

export type CanvasElement = TextElement | ShapeElement | ButtonElement;

export type Page = {
  id: string;
  background: string;
  dustEffect: boolean;
  transition: TransitionPreset;
  elements: CanvasElement[];
};
