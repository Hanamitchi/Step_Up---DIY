export type ElementType = "text" | "shape" | "button" | "media" | "draw";

export type ShapeKind = "square" | "circle" | "arrow" | "star" | "triangle";

export type AnimationPreset = "none" | "fade-in" | "slide-up" | "zoom-in" | "bounce";

export type TransitionPreset = "cut" | "fade" | "slide";

export type SurpriseEffect = "none" | "confetti" | "sparkle" | "fireworks";

export type ButtonAction =
  | { kind: "effect"; effect: SurpriseEffect }
  | { kind: "next-page" }
  | { kind: "link"; url: string };

export type ToolKind = "draw" | "line";

export type MediaKind = "image" | "video";

export type TextStyle = {
  fontFamily: string;
  fontSize: number;
  color: string;
  opacity: number;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
  letterSpacing: number;
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
  opacity: number;
};

export type MediaStyle = {
  radius: number;
  opacity: number;
  flipH: boolean;
  flipV: boolean;
  zoom: number; // 1 = fit, up to 3 = zoomed in ("simple crop")
  panX: number; // 0-100, focal point %
  panY: number; // 0-100, focal point %
};

export type DrawStyle = {
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
};

// Base fields shared by every element on a page.
export type BaseElement = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  animation: AnimationPreset;
  appearDelay: number; // seconds, 0-5 — countdown before the element appears
};

export type TextElement = BaseElement & {
  type: "text";
  content: string; // HTML string, may contain per-selection <span style="..."> formatting
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
  action: ButtonAction;
  style: ButtonStyle;
};

export type MediaElement = BaseElement & {
  type: "media";
  kind: MediaKind;
  src: string;
  style: MediaStyle;
};

export type DrawElement = BaseElement & {
  type: "draw";
  toolKind: ToolKind;
  points: { x: number; y: number }[]; // percentages 0-100 relative to element box
  style: DrawStyle;
};

export type CanvasElement = TextElement | ShapeElement | ButtonElement | MediaElement | DrawElement;

export type Page = {
  id: string;
  background: string;
  dustEffect: boolean;
  transition: TransitionPreset;
  surpriseEffect: SurpriseEffect;
  countdownEnabled: boolean;
  countdownSeconds: number; // max 15
  elements: CanvasElement[];
};