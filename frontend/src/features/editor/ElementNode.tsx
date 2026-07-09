import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEditor } from "../../store/EditorContext";
import type { CanvasElement, ShapeKind, TextElement } from "./editorTypes";
import { CANVAS_SIZE, SNAP_THRESHOLD } from "./editorConstants";
import "./elementAnimations.css";

const ANIMATION_CLASS: Record<CanvasElement["animation"], string> = {
  none: "",
  "fade-in": "anim-fade-in",
  "slide-up": "anim-slide-up",
  "zoom-in": "anim-zoom-in",
  bounce: "anim-bounce"
};

function ShapeIcon({ kind, fill }: { kind: ShapeKind; fill: string }) {
  if (kind === "square") return <rect x="1" y="1" width="22" height="22" fill={fill} />;
  if (kind === "circle") return <ellipse cx="12" cy="12" rx="11" ry="11" fill={fill} />;
  if (kind === "arrow")
    return (
      <path
        d="M1 12h17M13 3l10 9-10 9"
        stroke={fill}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  if (kind === "star")
    return (
      <path d="M12 1l3 7.5 8 .6-6.2 5.4 2 7.8L12 18l-6.8 4.3 2-7.8L1 8.1l8-.6z" fill={fill} />
    );
  return <path d="M12 1l11 22H1z" fill={fill} />;
}

function stripHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText;
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

function DuplicateIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M4 16V6a2 2 0 012-2h10" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    </svg>
  );
}

function ElementNode({ el }: { el: CanvasElement }) {
  const {
    selectedId,
    selectElement,
    updateElement,
    deleteElement,
    duplicateElement,
    currentPage,
    setGuideLines,
    clearGuideLines
  } = useEditor();
  const isSelected = selectedId === el.id;

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).dataset.handle || (e.target as HTMLElement).dataset.toolbar) return;
    selectElement(el.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const originX = el.x;
    const originY = el.y;
    const others = currentPage.elements.filter((other) => other.id !== el.id);

    function findSnap(
      selfPoints: { offset: number; value: number }[],
      targets: number[]
    ): { pos: number; guide: number } | null {
      for (const target of targets) {
        for (const sp of selfPoints) {
          if (Math.abs(sp.value - target) < SNAP_THRESHOLD) {
            return { pos: target - sp.offset, guide: target };
          }
        }
      }
      return null;
    }

    function onMove(ev: PointerEvent) {
      let newX = originX + (ev.clientX - startX);
      let newY = originY + (ev.clientY - startY);

      const targetsX = [0, CANVAS_SIZE / 2, CANVAS_SIZE, ...others.flatMap((o) => [o.x, o.x + o.w / 2, o.x + o.w])];
      const targetsY = [0, CANVAS_SIZE / 2, CANVAS_SIZE, ...others.flatMap((o) => [o.y, o.y + o.h / 2, o.y + o.h])];

      const selfX = [
        { offset: 0, value: newX },
        { offset: el.w / 2, value: newX + el.w / 2 },
        { offset: el.w, value: newX + el.w }
      ];
      const selfY = [
        { offset: 0, value: newY },
        { offset: el.h / 2, value: newY + el.h / 2 },
        { offset: el.h, value: newY + el.h }
      ];

      const snapX = findSnap(selfX, targetsX);
      const snapY = findSnap(selfY, targetsY);
      if (snapX) newX = snapX.pos;
      if (snapY) newY = snapY.pos;

      setGuideLines({
        vertical: snapX ? [snapX.guide] : [],
        horizontal: snapY ? [snapY.guide] : []
      });

      updateElement(el.id, { x: newX, y: newY });
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      clearGuideLines();
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
      style={{
        left: el.x,
        top: el.y,
        width: el.w,
        height: el.h,
        zIndex: el.zIndex,
        transform: `rotate(${el.rotation}deg)`
      }}
      onPointerDown={handlePointerDown}
    >
      {isSelected && (
        <div className="editor-el-toolbar" data-toolbar>
          <button data-toolbar title="Duplicate" onClick={() => duplicateElement(el.id)}>
            <DuplicateIcon />
          </button>
          <button data-toolbar title="Delete" onClick={() => deleteElement(el.id)}>
            <DeleteIcon />
          </button>
        </div>
      )}

      <div key={el.animation} className={`editor-el-inner ${ANIMATION_CLASS[el.animation]}`}>
        {el.type === "text" && <EditableText el={el} />}

        {el.type === "shape" && (
          <svg
            viewBox="0 0 24 24"
            preserveAspectRatio="none"
            className="editor-el-shape-icon"
            style={{ opacity: el.style.opacity }}
          >
            <ShapeIcon kind={el.shape} fill={el.style.fill} />
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
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="editor-el-draw"
            style={{ opacity: el.style.opacity }}
          >
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

export { stripHtml, ShapeIcon };
export default ElementNode;