import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEditor } from "../../store/EditorContext";
import type { CanvasElement, TextElement } from "./editorTypes";
import "./elementAnimations.css";

const ANIMATION_CLASS: Record<CanvasElement["animation"], string> = {
  none: "",
  "fade-in": "anim-fade-in",
  "slide-up": "anim-slide-up",
  "zoom-in": "anim-zoom-in",
  bounce: "anim-bounce"
};

function EditableText({ el }: { el: TextElement }) {
  const ref = useRef<HTMLDivElement>(null);
  const { updateElement } = useEditor();

  useEffect(() => {
    if (ref.current && ref.current.innerText !== el.content) {
      ref.current.innerText = el.content;
    }
    // Only re-sync from state when switching elements, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [el.id]);

  function handleBlur() {
    if (ref.current) {
      updateElement(el.id, { content: ref.current.innerText });
    }
  }

  return (
    <div
      ref={ref}
      className="editor-el-text"
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      style={{
        fontFamily: el.style.fontFamily,
        fontSize: el.style.fontSize,
        color: el.style.color,
        opacity: el.style.opacity,
        fontWeight: el.style.bold ? 700 : 400,
        fontStyle: el.style.italic ? "italic" : "normal",
        textAlign: el.style.align
      }}
    />
  );
}

function ElementNode({ el }: { el: CanvasElement }) {
  const { selectedId, selectElement, updateElement } = useEditor();
  const isSelected = selectedId === el.id;
  const scale = 1;

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).dataset.handle) return;
    selectElement(el.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const originX = el.x;
    const originY = el.y;

    function onMove(ev: PointerEvent) {
      updateElement(el.id, {
        x: originX + (ev.clientX - startX) / scale,
        y: originY + (ev.clientY - startY) / scale
      });
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
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
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
      style={{ left: el.x, top: el.y, width: el.w, height: el.h }}
      onPointerDown={handlePointerDown}
    >
      <div key={el.animation} className={`editor-el-inner ${ANIMATION_CLASS[el.animation]}`}>
        {el.type === "text" && <EditableText el={el} />}
        {el.type === "shape" && (
          <div
            className="editor-el-shape"
            style={{
              backgroundColor: el.style.fill,
              borderRadius: el.style.radius,
              opacity: el.style.opacity
            }}
          />
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