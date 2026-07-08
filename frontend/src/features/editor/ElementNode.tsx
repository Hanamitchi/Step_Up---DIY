import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEditor } from "../../store/EditorContext";
import type { CanvasElement, ShapeKind, TextElement } from "./editorTypes";
import "./elementAnimations.css";

const ANIMATION_CLASS: Record<CanvasElement["animation"], string> = {
  none: "",
  "fade-in": "anim-fade-in",
  "slide-up": "anim-slide-up",
  "zoom-in": "anim-zoom-in",
  bounce: "anim-bounce"
};

function ShapeIcon({ kind, fill, radius }: { kind: ShapeKind; fill: string; radius: number }) {
  const rx = Math.min(radius / 10, 12);
  if (kind === "square") return <rect x="2" y="2" width="20" height="20" rx={rx} fill={fill} />;
  if (kind === "circle") return <circle cx="12" cy="12" r="10" fill={fill} />;
  if (kind === "arrow")
    return (
      <path
        d="M2 12h15M13 4l8 8-8 8"
        stroke={fill}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  if (kind === "star")
    return (
      <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 16.9 5.8 20.3l1.6-6.8L2.2 8.9l6.9-.6z" fill={fill} />
    );
  return <path d="M12 3l10 18H2z" fill={fill} />;
}

function EditableText({ el }: { el: TextElement }) {
  const ref = useRef<HTMLDivElement>(null);
  const { updateElement, setActiveSelection } = useEditor();

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== el.content) {
      ref.current.innerHTML = el.content;
    }
    // Only re-sync from state when switching elements, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [el.id]);

  function handleBlur() {
    if (ref.current) {
      updateElement(el.id, { content: ref.current.innerHTML });
    }
  }

  function captureSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed && ref.current && ref.current.contains(sel.anchorNode)) {
      setActiveSelection({ elementId: el.id, range: sel.getRangeAt(0), container: ref.current });
    } else {
      setActiveSelection(null);
    }
  }

  return (
    <div
      ref={ref}
      className="editor-el-text"
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onMouseUp={captureSelection}
      onKeyUp={captureSelection}
      style={{
        fontFamily: el.style.fontFamily,
        fontSize: el.style.fontSize,
        color: el.style.color,
        opacity: el.style.opacity,
        fontWeight: el.style.bold ? 700 : 400,
        fontStyle: el.style.italic ? "italic" : "normal",
        textAlign: el.style.align,
        letterSpacing: el.style.letterSpacing
      }}
    />
  );
}

function ElementNode({ el }: { el: CanvasElement }) {
  const { selectedId, selectElement, updateElement } = useEditor();
  const isSelected = selectedId === el.id;

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).dataset.handle) return;
    selectElement(el.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const originX = el.x;
    const originY = el.y;

    function onMove(ev: PointerEvent) {
      updateElement(el.id, { x: originX + (ev.clientX - startX), y: originY + (ev.clientY - startY) });
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function handleResizeStart(e: ReactPointerEvent<HTMLDivElement>, corner: "nw" | "ne" | "sw" | "se") {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const ox = el.x;
    const oy = el.y;
    const ow = el.w;
    const oh = el.h;

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let patch: Partial<CanvasElement> = {};
      if (corner === "se") patch = { w: Math.max(24, ow + dx), h: Math.max(24, oh + dy) };
      if (corner === "sw") patch = { w: Math.max(24, ow - dx), h: Math.max(24, oh + dy), x: ox + dx };
      if (corner === "ne") patch = { w: Math.max(24, ow + dx), h: Math.max(24, oh - dy), y: oy + dy };
      if (corner === "nw")
        patch = { w: Math.max(24, ow - dx), h: Math.max(24, oh - dy), x: ox + dx, y: oy + dy };
      updateElement(el.id, patch);
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div
      className={`editor-el ${isSelected ? "editor-el-selected" : ""}`}
      style={{ left: el.x, top: el.y, width: el.w, height: el.h, zIndex: el.zIndex }}
      onPointerDown={handlePointerDown}
    >
      <div key={el.animation} className={`editor-el-inner ${ANIMATION_CLASS[el.animation]}`}>
        {el.type === "text" && <EditableText el={el} />}

        {el.type === "shape" && (
          <svg viewBox="0 0 24 24" className="editor-el-shape-icon" style={{ opacity: el.style.opacity }}>
            <ShapeIcon kind={el.shape} fill={el.style.fill} radius={el.style.radius} />
          </svg>
        )}

        {el.type === "button" && (
          <div
            className="editor-el-button"
            style={{
              backgroundColor: el.style.fill,
              color: el.style.textColor,
              borderRadius: el.style.radius,
              fontSize: el.style.fontSize,
              opacity: el.style.opacity
            }}
          >
            {el.label}
          </div>
        )}

        {el.type === "media" && el.kind === "image" && (
          <img
            src={el.src}
            className="editor-el-media"
            draggable={false}
            style={{
              borderRadius: el.style.radius,
              opacity: el.style.opacity,
              objectPosition: `${el.style.panX}% ${el.style.panY}%`,
              transform: `scaleX(${el.style.flipH ? -1 : 1}) scaleY(${el.style.flipV ? -1 : 1}) scale(${el.style.zoom})`
            }}
          />
        )}

        {el.type === "media" && el.kind === "video" && (
          <video
            src={el.src}
            className="editor-el-media"
            muted
            loop
            playsInline
            style={{
              borderRadius: el.style.radius,
              opacity: el.style.opacity,
              objectPosition: `${el.style.panX}% ${el.style.panY}%`,
              transform: `scaleX(${el.style.flipH ? -1 : 1}) scaleY(${el.style.flipV ? -1 : 1}) scale(${el.style.zoom})`
            }}
          />
        )}

        {el.type === "draw" && (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="editor-el-draw" style={{ opacity: el.style.opacity }}>
            <polyline
              points={el.points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={el.style.strokeColor}
              strokeWidth={el.style.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
      </div>

      {isSelected && (
        <>
          <div data-handle className="editor-handle editor-handle-nw" onPointerDown={(e) => handleResizeStart(e, "nw")} />
          <div data-handle className="editor-handle editor-handle-ne" onPointerDown={(e) => handleResizeStart(e, "ne")} />
          <div data-handle className="editor-handle editor-handle-sw" onPointerDown={(e) => handleResizeStart(e, "sw")} />
          <div data-handle className="editor-handle editor-handle-se" onPointerDown={(e) => handleResizeStart(e, "se")} />
        </>
      )}
    </div>
  );
}

export default ElementNode;