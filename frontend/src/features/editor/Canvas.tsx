import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEditor } from "../../store/EditorContext";
import { makeDraw } from "./editorFactories";
import ElementNode from "./ElementNode";
import "./Canvas.css";

function Canvas() {
  const { currentPage, selectElement, pendingTool, setPendingTool, addElement, guideLines } = useEditor();
  const artboardRef = useRef<HTMLDivElement>(null);
  const isCapturing = useRef(false);
  const [livePoints, setLivePoints] = useState<{ x: number; y: number }[]>([]);

  function handleBackgroundClick() {
    selectElement(null);
  }

  function toLocalPoint(e: PointerEvent | ReactPointerEvent<HTMLDivElement>) {
    const rect = artboardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handleArtboardPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!pendingTool) {
      if (e.target === e.currentTarget) handleBackgroundClick();
      return;
    }
    if (e.target !== e.currentTarget) return;

    isCapturing.current = true;
    const start = toLocalPoint(e);
    setLivePoints([start]);

    function onMove(ev: PointerEvent) {
      if (!isCapturing.current) return;
      const point = toLocalPoint(ev);
      setLivePoints((prev) => (pendingTool === "draw" ? [...prev, point] : [prev[0], point]));
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      isCapturing.current = false;
      finishCapture();
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function finishCapture() {
    setLivePoints((current) => {
      const points = current;
      const tool = pendingTool;
      if (!tool || points.length < 2) {
        setPendingTool(null);
        return [];
      }

      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const width = Math.max(Math.max(...xs) - minX, 4);
      const height = Math.max(Math.max(...ys) - minY, 4);

      const relativePoints = points.map((p) => ({
        x: ((p.x - minX) / width) * 100,
        y: ((p.y - minY) / height) * 100
      }));

      addElement(makeDraw(minX, minY, width, height, tool, relativePoints));
      setPendingTool(null);
      return [];
    });
  }

  return (
    <div className="canvas-stage">
      <div
        ref={artboardRef}
        className={`canvas-artboard ${pendingTool ? "canvas-artboard-drawing" : ""}`}
        style={{ backgroundColor: currentPage.background }}
        onPointerDown={handleArtboardPointerDown}
      >
        {currentPage.dustEffect && <div className="canvas-dust" />}

        {[...currentPage.elements]
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => (
            <ElementNode key={el.id} el={el} />
          ))}

        {livePoints.length > 1 && (
          <svg className="canvas-draw-preview">
            <polyline
              points={livePoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#d9b54a"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {guideLines.vertical.map((x) => (
          <div key={`v-${x}`} className="canvas-guide-v" style={{ left: x }} />
        ))}
        {guideLines.horizontal.map((y) => (
          <div key={`h-${y}`} className="canvas-guide-h" style={{ top: y }} />
        ))}
      </div>
    </div>
  );
}

export default Canvas;